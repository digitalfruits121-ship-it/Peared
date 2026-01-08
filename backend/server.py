from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone

# Import routes
from routes import router as api_routes


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'syncboard')]

# Create the main app without a prefix
app = FastAPI(
    title="SyncBoard API",
    description="Human-AI Collaborative Kanban Board API",
    version="1.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "SyncBoard API - Human-AI Kanban Board"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks


# Seed data endpoint
@api_router.post("/seed")
async def seed_database():
    """Seed the database with initial data"""
    from models import User, Tag, Board, Card, Column, CardSource, generate_uuid
    from datetime import datetime as dt
    
    # Clear existing data
    await db.users.delete_many({})
    await db.tags.delete_many({})
    await db.boards.delete_many({})
    await db.cards.delete_many({})
    await db.executions.delete_many({})
    
    # Create users
    users = [
        User(id="user-1", name="Michael B.", email="michael@example.com", avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Michael", is_ai=False),
        User(id="user-2", name="Jorge M.", email="jorge@example.com", avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Jorge", is_ai=False),
        User(id="user-3", name="Jason Z.", email="jason@example.com", avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Jason", is_ai=False),
        User(id="user-4", name="Sarah K.", email="sarah@example.com", avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", is_ai=False),
        User(id="ai-claude", name="Claude AI", email="claude@ai.dev", avatar="https://api.dicebear.com/7.x/bottts/svg?seed=Claude", is_ai=True),
        User(id="ai-gpt", name="GPT Assistant", email="gpt@ai.dev", avatar="https://api.dicebear.com/7.x/bottts/svg?seed=GPT", is_ai=True),
    ]
    
    for user in users:
        await db.users.insert_one(user.dict())
    
    # Create tags
    tags = [
        Tag(id="tag-1", name="HUMAN: TASKS", color="teal"),
        Tag(id="tag-2", name="AI: TASKS", color="purple"),
        Tag(id="tag-3", name="BUG", color="red"),
        Tag(id="tag-4", name="FEATURE", color="blue"),
        Tag(id="tag-5", name="MOBILE", color="orange"),
        Tag(id="tag-6", name="BACKEND", color="green"),
        Tag(id="tag-7", name="FRONTEND", color="pink"),
        Tag(id="tag-8", name="BLOCKED", color="gray"),
    ]
    
    for tag in tags:
        await db.tags.insert_one(tag.dict())
    
    # Create board with columns
    board = Board(
        id="board-1",
        name="Project Sync",
        description="Human-AI collaborative project management board",
        columns=[
            Column(id="col-1", name="To Do", order=0),
            Column(id="col-2", name="In Progress", order=1),
            Column(id="col-3", name="In Review", order=2),
            Column(id="col-4", name="Done", order=3),
        ],
        watchers=["user-1", "user-2", "user-3", "ai-claude"],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    await db.boards.insert_one(board.dict())
    
    # Create sample cards
    cards = [
        Card(
            id="card-2835", number=2835, board_id="board-1",
            title="User not notified when assigned or mentioned if not following board",
            description="Users should receive notifications even when they are not actively following the board.",
            column_id="col-2", tags=["tag-1", "tag-3"], assignee_id="user-2", creator_id="user-1",
            source=CardSource.HUMAN, version=1, last_modified_by="user-1", comments=[],
            created_at=datetime.utcnow(), updated_at=datetime.utcnow()
        ),
        Card(
            id="card-2943", number=2943, board_id="board-1",
            title="Horizontal scroll on iPhone 17 Pro",
            description="The board has unwanted horizontal scroll on the latest iPhone model.",
            column_id="col-2", tags=["tag-1", "tag-5"], assignee_id="user-3", creator_id="user-1",
            source=CardSource.HUMAN, version=3, last_modified_by="user-3", comments=[],
            created_at=datetime.utcnow(), updated_at=datetime.utcnow()
        ),
        Card(
            id="card-2960", number=2960, board_id="board-1",
            title="Support non latin characters in filtering and search",
            description="Add support for Unicode characters in the search functionality.",
            column_id="col-1", tags=["tag-1", "tag-4"], assignee_id=None, creator_id="user-1",
            source=CardSource.HUMAN, version=1, last_modified_by="user-1", comments=[],
            created_at=datetime.utcnow(), updated_at=datetime.utcnow()
        ),
        Card(
            id="card-3001", number=3001, board_id="board-1",
            title="Implement API authentication middleware",
            description="AI task: Create secure authentication layer for API endpoints.",
            column_id="col-2", tags=["tag-2", "tag-6"], assignee_id="ai-claude", creator_id="ai-claude",
            source=CardSource.AI, version=4, last_modified_by="ai-claude", comments=[],
            created_at=datetime.utcnow(), updated_at=datetime.utcnow()
        ),
        Card(
            id="card-3002", number=3002, board_id="board-1",
            title="Refactor database queries for better performance",
            description="AI task: Optimize MongoDB queries and add proper indexing.",
            column_id="col-3", tags=["tag-2", "tag-6"], assignee_id="ai-gpt", creator_id="user-1",
            source=CardSource.AI, version=2, last_modified_by="ai-gpt", comments=[],
            created_at=datetime.utcnow(), updated_at=datetime.utcnow()
        ),
        Card(
            id="card-2225", number=2225, board_id="board-1",
            title="Animate automatic pagination links",
            description="Add smooth animations when pagination links are auto-generated.",
            column_id="col-4", tags=["tag-1", "tag-7"], assignee_id="user-3", creator_id="user-2",
            source=CardSource.HUMAN, version=5, last_modified_by="user-3", comments=[],
            created_at=datetime.utcnow(), updated_at=datetime.utcnow()
        ),
        Card(
            id="card-3003", number=3003, board_id="board-1",
            title="Write unit tests for card CRUD operations",
            description="AI task: Create comprehensive test suite for all card operations.",
            column_id="col-4", tags=["tag-2", "tag-6"], assignee_id="ai-claude", creator_id="ai-claude",
            source=CardSource.AI, version=3, last_modified_by="ai-claude", comments=[],
            created_at=datetime.utcnow(), updated_at=datetime.utcnow()
        ),
    ]
    
    for card in cards:
        await db.cards.insert_one(card.dict())
    
    return {"message": "Database seeded successfully", "users": len(users), "tags": len(tags), "cards": len(cards)}


# Include routers
app.include_router(api_router)
app.include_router(api_routes)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()