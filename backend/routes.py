from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from datetime import datetime
from auth import get_current_user, get_optional_user
from models import (
    Board, BoardCreate, BoardUpdate,
    Card, CardCreate, CardUpdate, CardMove,
    Column, ColumnCreate,
    Comment, CommentCreate,
    User, UserCreate,
    Tag, TagCreate,
    Execution, ExecutionCreate, ExecutionUpdate, ExecutionLog,
    ExecutionStatus, LogType, CardSource,
    AIClaimTaskRequest, AIUpdateStatusRequest, AIAddLogRequest,
    SyncPollResponse, ConflictResolveRequest,
    File, FileCreate, FileUpdate, FileType, FileScope, FileSettings,
    Integration, IntegrationCreate, IntegrationType, IntegrationStatus,
    GitHubConfig, GitHubCommitRequest, GitHubPushRequest, GitHubCommit,
    generate_uuid
)
from motor.motor_asyncio import AsyncIOMotorClient
import os

# MongoDB connection
import certifi
mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url, tlsCAFile=certifi.where())
db = client[os.environ.get('DB_NAME', 'test_database')]

router = APIRouter(prefix="/api")


# ---- Socket.IO emit helper ----
async def _emit(event: str, data: dict, board_id: str = "board-1"):
    """Emit a socket.io event to all clients watching a board."""
    try:
        import server as _server
        sio = getattr(_server, "sio", None)
        if sio:
            await sio.emit(event, data, room=f"board:{board_id}")
    except Exception:
        pass


# ============== Helper Functions ==============

async def get_next_card_number(board_id: str) -> int:
    """Get the next card number for a board"""
    last_card = await db.cards.find_one(
        {"board_id": board_id},
        sort=[("number", -1)]
    )
    return (last_card["number"] + 1) if last_card else 1


# ============== Board Routes ==============

@router.get("/boards", response_model=List[Board])
async def list_boards():
    """List all boards"""
    boards = await db.boards.find().to_list(100)
    return [Board(**board) for board in boards]


@router.get("/boards/{board_id}", response_model=Board)
async def get_board(board_id: str):
    """Get a specific board"""
    board = await db.boards.find_one({"id": board_id})
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    return Board(**board)


@router.post("/boards", response_model=Board)
async def create_board(board_data: BoardCreate):
    """Create a new board"""
    # Default columns if not provided
    default_columns = [
        Column(id=generate_uuid(), name="To Do", order=0),
        Column(id=generate_uuid(), name="In Progress", order=1),
        Column(id=generate_uuid(), name="In Review", order=2),
        Column(id=generate_uuid(), name="Done", order=3),
    ]
    
    columns = []
    if board_data.columns:
        for i, col in enumerate(board_data.columns):
            columns.append(Column(id=generate_uuid(), name=col.name, order=col.order or i))
    else:
        columns = default_columns
    
    board = Board(
        id=generate_uuid(),
        name=board_data.name,
        description=board_data.description,
        columns=columns,
        watchers=[],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    await db.boards.insert_one(board.dict())
    return board


@router.put("/boards/{board_id}", response_model=Board)
async def update_board(board_id: str, board_data: BoardUpdate):
    """Update a board"""
    update_dict = {k: v for k, v in board_data.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.utcnow()
    
    result = await db.boards.update_one(
        {"id": board_id},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Board not found")
    
    board = await db.boards.find_one({"id": board_id})
    return Board(**board)


@router.delete("/boards/{board_id}")
async def delete_board(board_id: str):
    """Delete a board and all its cards"""
    result = await db.boards.delete_one({"id": board_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Board not found")
    
    # Delete all cards in the board
    await db.cards.delete_many({"board_id": board_id})
    await db.executions.delete_many({"board_id": board_id})
    
    return {"message": "Board deleted"}


# ============== Card Routes ==============

@router.get("/boards/{board_id}/cards", response_model=List[Card])
async def list_cards(
    board_id: str,
    source: Optional[CardSource] = None,
    column_id: Optional[str] = None
):
    """List all cards in a board"""
    query = {"board_id": board_id}
    if source:
        query["source"] = source
    if column_id:
        query["column_id"] = column_id
    
    cards = await db.cards.find(query).to_list(1000)
    return [Card(**card) for card in cards]


@router.get("/cards/{card_id}", response_model=Card)
async def get_card(card_id: str):
    """Get a specific card"""
    card = await db.cards.find_one({"id": card_id})
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    return Card(**card)


@router.post("/boards/{board_id}/cards", response_model=Card)
async def create_card(
    board_id: str,
    card_data: CardCreate,
    current_user: User = Depends(get_current_user),
):
    """Create a new card"""
    board = await db.boards.find_one({"id": board_id})
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    card_number = await get_next_card_number(board_id)

    card = Card(
        id=generate_uuid(),
        number=card_number,
        board_id=board_id,
        title=card_data.title,
        description=card_data.description,
        column_id=card_data.column_id,
        tags=card_data.tags,
        assignee_id=card_data.assignee_id,
        creator_id=current_user.id,
        source=card_data.source,
        version=1,
        last_modified_by=current_user.id,
        comments=[],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    await db.cards.insert_one(card.dict())
    await _emit("card:created", card.dict(), board_id)
    return card


@router.put("/cards/{card_id}", response_model=Card)
async def update_card(
    card_id: str,
    card_data: CardUpdate,
    modifier_id: str = Query(None),
    current_user: User = Depends(get_current_user),
):
    """Update a card with optimistic locking"""
    card = await db.cards.find_one({"id": card_id})
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    if card["version"] != card_data.version:
        raise HTTPException(
            status_code=409,
            detail={
                "error": "Version conflict",
                "current_version": card["version"],
                "your_version": card_data.version,
                "current_data": card,
            },
        )

    update_dict = {k: v for k, v in card_data.dict().items() if v is not None and k != "version"}
    update_dict["version"] = card["version"] + 1
    update_dict["last_modified_by"] = modifier_id or current_user.id
    update_dict["updated_at"] = datetime.utcnow()

    await db.cards.update_one({"id": card_id}, {"$set": update_dict})

    updated_card = await db.cards.find_one({"id": card_id})
    result = Card(**updated_card)
    await _emit("card:updated", result.dict(), card.get("board_id", "board-1"))
    return result


@router.patch("/cards/{card_id}/move", response_model=Card)
async def move_card(
    card_id: str,
    move_data: CardMove,
    modifier_id: str = Query(None),
    current_user: User = Depends(get_current_user),
):
    """Move a card to a different column"""
    card = await db.cards.find_one({"id": card_id})
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    if card["version"] != move_data.version:
        raise HTTPException(
            status_code=409,
            detail={
                "error": "Version conflict",
                "current_version": card["version"],
                "your_version": move_data.version,
            },
        )

    await db.cards.update_one(
        {"id": card_id},
        {"$set": {
            "column_id": move_data.column_id,
            "version": card["version"] + 1,
            "last_modified_by": modifier_id or current_user.id,
            "updated_at": datetime.utcnow(),
        }},
    )

    updated_card = await db.cards.find_one({"id": card_id})
    result = Card(**updated_card)
    await _emit("card:moved", {"cardId": card_id, "columnId": move_data.column_id, "version": result.version}, card.get("board_id", "board-1"))
    return result


@router.delete("/cards/{card_id}")
async def delete_card(card_id: str, current_user: User = Depends(get_current_user)):
    """Delete a card"""
    card = await db.cards.find_one({"id": card_id})
    result = await db.cards.delete_one({"id": card_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Card not found")

    await db.executions.delete_many({"card_id": card_id})
    if card:
        await _emit("card:deleted", {"cardId": card_id}, card.get("board_id", "board-1"))
    return {"message": "Card deleted"}


@router.post("/cards/{card_id}/comments", response_model=Card)
async def add_comment(
    card_id: str,
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_user),
):
    """Add a comment to a card"""
    card = await db.cards.find_one({"id": card_id})
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    comment = Comment(
        id=generate_uuid(),
        text=comment_data.text,
        author_id=comment_data.author_id or current_user.id,
        created_at=datetime.utcnow(),
    )

    await db.cards.update_one(
        {"id": card_id},
        {"$push": {"comments": comment.dict()}, "$set": {"updated_at": datetime.utcnow()}},
    )

    updated_card = await db.cards.find_one({"id": card_id})
    result = Card(**updated_card)
    await _emit("card:updated", result.dict(), card.get("board_id", "board-1"))
    return result


# ============== User Routes ==============

@router.get("/users", response_model=List[User])
async def list_users(is_ai: Optional[bool] = None):
    """List all users"""
    query = {}
    if is_ai is not None:
        query["is_ai"] = is_ai
    
    users = await db.users.find(query).to_list(100)
    return [User(**user) for user in users]


@router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    """Get a specific user"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)


@router.post("/users", response_model=User)
async def create_user(user_data: UserCreate):
    """Create a new user"""
    user = User(
        id=generate_uuid(),
        name=user_data.name,
        email=user_data.email,
        avatar=user_data.avatar,
        is_ai=user_data.is_ai,
        created_at=datetime.utcnow()
    )
    
    await db.users.insert_one(user.dict())
    return user


# ============== Tag Routes ==============

@router.get("/tags", response_model=List[Tag])
async def list_tags():
    """List all tags"""
    tags = await db.tags.find().to_list(100)
    return [Tag(**tag) for tag in tags]


@router.post("/tags", response_model=Tag)
async def create_tag(tag_data: TagCreate):
    """Create a new tag"""
    tag = Tag(
        id=generate_uuid(),
        name=tag_data.name,
        color=tag_data.color
    )
    
    await db.tags.insert_one(tag.dict())
    return tag


# ============== Execution Routes (AI-specific) ==============

@router.get("/executions/{card_id}", response_model=Execution)
async def get_execution(card_id: str):
    """Get execution status for a card"""
    execution = await db.executions.find_one({"card_id": card_id})
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    return Execution(**execution)


@router.get("/executions", response_model=List[Execution])
async def list_executions(status: Optional[ExecutionStatus] = None):
    """List all executions"""
    query = {}
    if status:
        query["status"] = status
    
    executions = await db.executions.find(query).to_list(100)
    return [Execution(**ex) for ex in executions]


@router.post("/executions", response_model=Execution)
async def create_execution(execution_data: ExecutionCreate):
    """Create a new execution"""
    execution = Execution(
        id=generate_uuid(),
        card_id=execution_data.card_id,
        agent_id=execution_data.agent_id,
        status=ExecutionStatus.IDLE,
        progress=0,
        logs=[],
        started_at=None,
        completed_at=None
    )
    
    await db.executions.insert_one(execution.dict())
    return execution


@router.put("/executions/{execution_id}", response_model=Execution)
async def update_execution(execution_id: str, execution_data: ExecutionUpdate):
    """Update an execution"""
    update_dict = {k: v for k, v in execution_data.dict().items() if v is not None}
    
    if execution_data.status == ExecutionStatus.RUNNING:
        update_dict["started_at"] = datetime.utcnow()
    elif execution_data.status in [ExecutionStatus.COMPLETED, ExecutionStatus.FAILED]:
        update_dict["completed_at"] = datetime.utcnow()
    
    result = await db.executions.update_one(
        {"id": execution_id},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Execution not found")
    
    execution = await db.executions.find_one({"id": execution_id})
    return Execution(**execution)


# ============== AI API Routes ==============

@router.post("/ai/claim-task", response_model=Card)
async def ai_claim_task(request: AIClaimTaskRequest):
    """AI agent claims a task"""
    card = await db.cards.find_one({"id": request.card_id})
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # Update card assignee
    await db.cards.update_one(
        {"id": request.card_id},
        {"$set": {
            "assignee_id": request.agent_id,
            "source": CardSource.AI,
            "version": card["version"] + 1,
            "last_modified_by": request.agent_id,
            "updated_at": datetime.utcnow()
        }}
    )
    
    # Create execution
    execution = Execution(
        id=generate_uuid(),
        card_id=request.card_id,
        agent_id=request.agent_id,
        status=ExecutionStatus.RUNNING,
        progress=0,
        logs=[ExecutionLog(
            time=datetime.utcnow().strftime("%H:%M:%S"),
            type=LogType.INFO,
            message="Task claimed by AI agent"
        )],
        started_at=datetime.utcnow()
    )
    
    await db.executions.insert_one(execution.dict())
    
    updated_card = await db.cards.find_one({"id": request.card_id})
    return Card(**updated_card)


@router.post("/ai/update-status")
async def ai_update_status(request: AIUpdateStatusRequest):
    """AI agent updates task status"""
    execution = await db.executions.find_one({"card_id": request.card_id})
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    
    update_dict = {"status": request.status}
    if request.progress is not None:
        update_dict["progress"] = request.progress
    
    if request.status == ExecutionStatus.COMPLETED:
        update_dict["completed_at"] = datetime.utcnow()
        update_dict["progress"] = 100
    elif request.status == ExecutionStatus.FAILED:
        update_dict["completed_at"] = datetime.utcnow()
    
    # Add log if message provided
    if request.message:
        log = ExecutionLog(
            time=datetime.utcnow().strftime("%H:%M:%S"),
            type=LogType.SUCCESS if request.status == ExecutionStatus.COMPLETED else LogType.INFO,
            message=request.message
        )
        await db.executions.update_one(
            {"card_id": request.card_id},
            {"$push": {"logs": log.dict()}}
        )
    
    await db.executions.update_one(
        {"card_id": request.card_id},
        {"$set": update_dict}
    )
    
    return {"message": "Status updated"}


@router.post("/ai/add-log")
async def ai_add_log(request: AIAddLogRequest):
    """AI agent adds execution log"""
    log = ExecutionLog(
        time=datetime.utcnow().strftime("%H:%M:%S"),
        type=request.log_type,
        message=request.message
    )
    
    result = await db.executions.update_one(
        {"card_id": request.card_id},
        {"$push": {"logs": log.dict()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Execution not found")
    
    return {"message": "Log added"}


@router.get("/ai/available-tasks", response_model=List[Card])
async def get_available_tasks(board_id: Optional[str] = None):
    """Get tasks available for AI to claim"""
    query = {
        "assignee_id": None,
        "$or": [
            {"source": CardSource.AI},
            {"tags": {"$in": ["tag-2"]}}  # AI: TASKS tag
        ]
    }
    if board_id:
        query["board_id"] = board_id
    
    cards = await db.cards.find(query).to_list(100)
    return [Card(**card) for card in cards]


# ============== Sync Routes ==============

@router.get("/sync/poll", response_model=SyncPollResponse)
async def sync_poll(since: Optional[datetime] = None, board_id: Optional[str] = None):
    """Poll for changes since a timestamp"""
    query = {}
    if since:
        query["updated_at"] = {"$gt": since}
    if board_id:
        query["board_id"] = board_id
    
    cards = await db.cards.find(query).to_list(1000)
    
    return SyncPollResponse(
        cards=[Card(**card) for card in cards],
        last_sync=datetime.utcnow(),
        has_conflicts=False
    )


@router.get("/sync/version/{card_id}")
async def get_card_version(card_id: str):
    """Get current version of a card"""
    card = await db.cards.find_one({"id": card_id})
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    return {
        "card_id": card_id,
        "version": card["version"],
        "last_modified_by": card["last_modified_by"],
        "updated_at": card["updated_at"]
    }


@router.post("/sync/resolve-conflict")
async def resolve_conflict(request: ConflictResolveRequest):
    """Resolve a version conflict"""
    card = await db.cards.find_one({"id": request.card_id})
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    if request.resolution == "keep_remote":
        # Keep the current server version, just acknowledge
        return {"message": "Kept remote version", "version": card["version"]}
    
    elif request.resolution == "merge" and request.merged_data:
        # Apply merged data
        merged = request.merged_data
        merged["version"] = card["version"] + 1
        merged["updated_at"] = datetime.utcnow()
        
        await db.cards.update_one(
            {"id": request.card_id},
            {"$set": merged}
        )
        
        return {"message": "Merged successfully", "version": merged["version"]}
    
    return {"message": "Conflict resolved"}



# ============== File Routes ==============

@router.get("/files", response_model=List[File])
async def list_files(
    scope: Optional[FileScope] = None,
    card_id: Optional[str] = None,
    file_type: Optional[FileType] = None
):
    """List all files with optional filters"""
    query = {}
    if scope:
        query["scope"] = scope
    if card_id:
        query["$or"] = [
            {"card_id": card_id},
            {"linked_cards": card_id}
        ]
    if file_type:
        query["type"] = file_type
    
    files = await db.files.find(query).to_list(1000)
    return [File(**f) for f in files]


@router.get("/files/{file_id}", response_model=File)
async def get_file(file_id: str):
    """Get a specific file"""
    file = await db.files.find_one({"id": file_id})
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    return File(**file)


@router.post("/files", response_model=File)
async def create_file(file_data: FileCreate):
    """Create a new file"""
    file = File(
        id=generate_uuid(),
        name=file_data.name,
        type=file_data.type,
        content=file_data.content,
        scope=file_data.scope,
        card_id=file_data.card_id,
        size=len(file_data.content),
        linked_cards=[file_data.card_id] if file_data.card_id else [],
        created_by=file_data.created_by,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    await db.files.insert_one(file.dict())
    return file


@router.put("/files/{file_id}", response_model=File)
async def update_file(file_id: str, file_data: FileUpdate, modifier_id: str = Query(...)):
    """Update a file"""
    file = await db.files.find_one({"id": file_id})
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    update_dict = {k: v for k, v in file_data.dict().items() if v is not None}
    if "content" in update_dict:
        update_dict["size"] = len(update_dict["content"])
    update_dict["updated_at"] = datetime.utcnow()
    
    await db.files.update_one(
        {"id": file_id},
        {"$set": update_dict}
    )
    
    updated_file = await db.files.find_one({"id": file_id})
    return File(**updated_file)


@router.delete("/files/{file_id}")
async def delete_file(file_id: str):
    """Delete a file"""
    result = await db.files.delete_one({"id": file_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="File not found")
    return {"message": "File deleted"}


@router.post("/files/{file_id}/link/{card_id}")
async def link_file_to_card(file_id: str, card_id: str):
    """Link a file to a card"""
    file = await db.files.find_one({"id": file_id})
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    card = await db.cards.find_one({"id": card_id})
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    if card_id not in file.get("linked_cards", []):
        await db.files.update_one(
            {"id": file_id},
            {"$push": {"linked_cards": card_id}}
        )
    
    return {"message": "File linked to card"}


@router.delete("/files/{file_id}/link/{card_id}")
async def unlink_file_from_card(file_id: str, card_id: str):
    """Unlink a file from a card"""
    await db.files.update_one(
        {"id": file_id},
        {"$pull": {"linked_cards": card_id}}
    )
    return {"message": "File unlinked from card"}


@router.get("/cards/{card_id}/files", response_model=List[File])
async def get_card_files(card_id: str):
    """Get all files linked to a card"""
    files = await db.files.find({
        "$or": [
            {"card_id": card_id},
            {"linked_cards": card_id}
        ]
    }).to_list(100)
    return [File(**f) for f in files]


# ============== File Settings Routes ==============

@router.get("/settings/files", response_model=FileSettings)
async def get_file_settings():
    """Get file repository settings"""
    settings = await db.settings.find_one({"type": "files"})
    if not settings:
        return FileSettings()
    return FileSettings(**settings)


@router.put("/settings/files", response_model=FileSettings)
async def update_file_settings(settings: FileSettings):
    """Update file repository settings"""
    await db.settings.update_one(
        {"type": "files"},
        {"$set": {**settings.dict(), "type": "files"}},
        upsert=True
    )
    return settings



# ============== Integration Routes ==============

@router.get("/integrations", response_model=List[Integration])
async def list_integrations():
    """List all configured integrations"""
    integrations = await db.integrations.find().to_list(100)
    return [Integration(**i) for i in integrations]


@router.get("/integrations/{integration_id}", response_model=Integration)
async def get_integration(integration_id: str):
    """Get a specific integration"""
    integration = await db.integrations.find_one({"id": integration_id})
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    return Integration(**integration)


@router.post("/integrations", response_model=Integration)
async def create_integration(data: IntegrationCreate):
    """Create a new integration"""
    integration = Integration(
        id=generate_uuid(),
        type=data.type,
        name=data.name,
        config=data.config,
        status=IntegrationStatus.PENDING,
        created_at=datetime.utcnow()
    )
    
    await db.integrations.insert_one(integration.dict())
    return integration


@router.put("/integrations/{integration_id}", response_model=Integration)
async def update_integration(integration_id: str, data: IntegrationCreate):
    """Update an integration"""
    result = await db.integrations.update_one(
        {"id": integration_id},
        {"$set": {
            "type": data.type,
            "name": data.name,
            "config": data.config
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    integration = await db.integrations.find_one({"id": integration_id})
    return Integration(**integration)


@router.delete("/integrations/{integration_id}")
async def delete_integration(integration_id: str):
    """Delete an integration"""
    result = await db.integrations.delete_one({"id": integration_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Integration not found")
    return {"message": "Integration deleted"}


@router.post("/integrations/{integration_id}/test")
async def test_integration(integration_id: str):
    """Test an integration connection"""
    integration = await db.integrations.find_one({"id": integration_id})
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    # In real implementation, test the actual connection
    # For now, simulate success
    await db.integrations.update_one(
        {"id": integration_id},
        {"$set": {
            "status": IntegrationStatus.CONNECTED,
            "last_sync": datetime.utcnow()
        }}
    )
    
    return {"status": "success", "message": "Connection successful"}


# ============== GitHub Routes ==============

@router.get("/github/config")
async def get_github_config():
    """Get GitHub configuration"""
    config = await db.settings.find_one({"type": "github"})
    if not config:
        return {
            "connected": False,
            "username": None,
            "repo": None,
            "branch": "main"
        }
    return {
        "connected": True,
        "username": config.get("username"),
        "repo": config.get("repo"),
        "branch": config.get("branch", "main"),
        "last_push": config.get("last_push"),
        "last_pull": config.get("last_pull")
    }


@router.put("/github/config")
async def update_github_config(config: GitHubConfig):
    """Update GitHub configuration"""
    await db.settings.update_one(
        {"type": "github"},
        {"$set": {
            "type": "github",
            "token": config.token,
            "repo": config.repo,
            "branch": config.branch,
            "username": config.username
        }},
        upsert=True
    )
    return {"message": "GitHub configuration updated"}


@router.get("/github/branches")
async def get_github_branches():
    """Get available branches"""
    # In real implementation, fetch from GitHub API
    return [
        {"name": "main", "is_default": True},
        {"name": "develop", "is_default": False},
        {"name": "feature/ai-integration", "is_default": False}
    ]


@router.get("/github/status")
async def get_github_status():
    """Get current Git status (changed files)"""
    # In real implementation, run git status
    return {
        "changed_files": [
            {"path": "src/components/Board/Board.jsx", "status": "modified"},
            {"path": "backend/routes.py", "status": "modified"}
        ],
        "untracked_files": [],
        "staged_files": []
    }


@router.get("/github/commits", response_model=List[GitHubCommit])
async def get_github_commits(limit: int = 10):
    """Get recent commits"""
    commits = await db.github_commits.find().sort("date", -1).limit(limit).to_list(limit)
    return [GitHubCommit(**c) for c in commits]


@router.post("/github/commit")
async def create_commit(data: GitHubCommitRequest):
    """Create a new commit"""
    commit = GitHubCommit(
        id=generate_uuid()[:7],
        message=data.message,
        author="user",  # Would get from auth
        date=datetime.utcnow(),
        files_changed=len(data.files)
    )
    
    await db.github_commits.insert_one(commit.dict())
    
    return {
        "status": "success",
        "commit_id": commit.id,
        "message": f"Created commit: {data.message}"
    }


@router.post("/github/push")
async def push_to_remote(data: GitHubPushRequest):
    """Push commits to remote"""
    # In real implementation, use GitHub API or git command
    await db.settings.update_one(
        {"type": "github"},
        {"$set": {"last_push": datetime.utcnow()}}
    )
    
    return {
        "status": "success",
        "branch": data.branch,
        "message": f"Successfully pushed to {data.branch}"
    }


@router.post("/github/pull")
async def pull_from_remote(branch: str = "main"):
    """Pull changes from remote"""
    # In real implementation, use GitHub API or git command
    await db.settings.update_one(
        {"type": "github"},
        {"$set": {"last_pull": datetime.utcnow()}}
    )
    
    return {
        "status": "success",
        "branch": branch,
        "message": f"Successfully pulled from {branch}"
    }


@router.post("/github/branch")
async def create_branch(name: str, from_branch: str = "main"):
    """Create a new branch"""
    return {
        "status": "success",
        "branch": name,
        "from": from_branch,
        "message": f"Created branch {name} from {from_branch}"
    }
