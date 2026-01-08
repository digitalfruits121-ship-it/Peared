from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum
import uuid


def generate_uuid():
    return str(uuid.uuid4())


class CardSource(str, Enum):
    HUMAN = "human"
    AI = "ai"


class ExecutionStatus(str, Enum):
    IDLE = "idle"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"


class LogType(str, Enum):
    INFO = "info"
    SUCCESS = "success"
    ERROR = "error"
    WARNING = "warning"


# ============== User Models ==============

class UserBase(BaseModel):
    name: str
    email: str
    avatar: Optional[str] = None
    is_ai: bool = False


class UserCreate(UserBase):
    pass


class User(UserBase):
    id: str = Field(default_factory=generate_uuid)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True


# ============== Tag Models ==============

class TagBase(BaseModel):
    name: str
    color: str


class TagCreate(TagBase):
    pass


class Tag(TagBase):
    id: str = Field(default_factory=generate_uuid)

    class Config:
        from_attributes = True


# ============== Comment Models ==============

class CommentBase(BaseModel):
    text: str
    author_id: str


class CommentCreate(CommentBase):
    pass


class Comment(CommentBase):
    id: str = Field(default_factory=generate_uuid)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True


# ============== Column Models ==============

class ColumnBase(BaseModel):
    name: str
    order: int


class ColumnCreate(ColumnBase):
    pass


class Column(ColumnBase):
    id: str = Field(default_factory=generate_uuid)

    class Config:
        from_attributes = True


# ============== Card Models ==============

class CardBase(BaseModel):
    title: str
    description: Optional[str] = ""
    column_id: str
    tags: List[str] = []
    assignee_id: Optional[str] = None
    source: CardSource = CardSource.HUMAN


class CardCreate(CardBase):
    creator_id: str


class CardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    column_id: Optional[str] = None
    tags: Optional[List[str]] = None
    assignee_id: Optional[str] = None
    version: int  # Required for optimistic locking


class CardMove(BaseModel):
    column_id: str
    version: int


class Card(CardBase):
    id: str = Field(default_factory=generate_uuid)
    number: int
    board_id: str
    creator_id: str
    version: int = 1
    last_modified_by: str
    comments: List[Comment] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True


# ============== Board Models ==============

class BoardBase(BaseModel):
    name: str
    description: Optional[str] = ""


class BoardCreate(BoardBase):
    columns: Optional[List[ColumnCreate]] = None


class BoardUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class Board(BoardBase):
    id: str = Field(default_factory=generate_uuid)
    columns: List[Column] = []
    watchers: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True


# ============== Execution Models (AI-specific) ==============

class ExecutionLog(BaseModel):
    time: str
    type: LogType
    message: str


class ExecutionBase(BaseModel):
    card_id: str
    agent_id: str


class ExecutionCreate(ExecutionBase):
    pass


class ExecutionUpdate(BaseModel):
    status: Optional[ExecutionStatus] = None
    progress: Optional[int] = None
    branch: Optional[str] = None
    files_changed: Optional[int] = None


class Execution(ExecutionBase):
    id: str = Field(default_factory=generate_uuid)
    status: ExecutionStatus = ExecutionStatus.IDLE
    progress: int = 0
    branch: Optional[str] = None
    files_changed: int = 0
    logs: List[ExecutionLog] = []
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============== AI Settings Models ==============

class AIProvider(BaseModel):
    id: str
    name: str
    model: str
    enabled: bool = False


class AISettings(BaseModel):
    enabled: bool = True
    providers: List[AIProvider] = []
    poll_interval: int = 5000
    auto_assign: bool = True


# ============== Sync Models ==============

class SyncPollResponse(BaseModel):
    cards: List[Card]
    last_sync: datetime
    has_conflicts: bool = False


class ConflictResolution(str, Enum):
    KEEP_LOCAL = "keep_local"
    KEEP_REMOTE = "keep_remote"
    MERGE = "merge"


class ConflictResolveRequest(BaseModel):
    card_id: str
    resolution: ConflictResolution
    merged_data: Optional[dict] = None


# ============== AI API Models ==============

class AIClaimTaskRequest(BaseModel):
    card_id: str
    agent_id: str


class AIUpdateStatusRequest(BaseModel):
    card_id: str
    status: ExecutionStatus
    progress: Optional[int] = None
    message: Optional[str] = None


class AIAddLogRequest(BaseModel):
    card_id: str
    log_type: LogType
    message: str



# ============== File Models ==============

class FileType(str, Enum):
    MARKDOWN = "markdown"
    JSON = "json"
    IMAGE = "image"
    CODE = "code"


class FileScope(str, Enum):
    PROJECT = "project"
    TASK = "task"


class FileBase(BaseModel):
    name: str
    type: FileType
    content: str
    scope: FileScope = FileScope.PROJECT
    card_id: Optional[str] = None


class FileCreate(FileBase):
    created_by: str


class FileUpdate(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None
    linked_cards: Optional[List[str]] = None


class File(FileBase):
    id: str = Field(default_factory=generate_uuid)
    size: int = 0
    linked_cards: List[str] = []
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True


class FileSettings(BaseModel):
    enable_file_repo: bool = True
    allow_ui_editing: bool = True
    allow_card_linking: bool = True
    ai_read_access: bool = True
    ai_write_access: bool = True
    max_file_size_mb: int = 5
    allowed_types: List[FileType] = [FileType.MARKDOWN, FileType.JSON, FileType.IMAGE]


# ============== Integration Models ==============

class IntegrationType(str, Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    GITHUB = "github"
    SLACK = "slack"
    LINEAR = "linear"
    NOTION = "notion"
    CUSTOM_MCP = "custom_mcp"


class IntegrationStatus(str, Enum):
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    PENDING = "pending"
    ERROR = "error"


class IntegrationBase(BaseModel):
    type: IntegrationType
    name: str
    config: dict = {}


class IntegrationCreate(IntegrationBase):
    pass


class Integration(IntegrationBase):
    id: str = Field(default_factory=generate_uuid)
    status: IntegrationStatus = IntegrationStatus.PENDING
    last_sync: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True


# ============== GitHub Models ==============

class GitHubConfig(BaseModel):
    token: str
    repo: str
    branch: str = "main"
    username: Optional[str] = None


class GitHubCommitRequest(BaseModel):
    message: str
    description: Optional[str] = None
    files: List[str]


class GitHubPushRequest(BaseModel):
    branch: str
    force: bool = False


class GitHubBranch(BaseModel):
    name: str
    is_default: bool = False
    last_commit: Optional[str] = None


class GitHubCommit(BaseModel):
    id: str
    message: str
    author: str
    date: datetime
    files_changed: int = 0

