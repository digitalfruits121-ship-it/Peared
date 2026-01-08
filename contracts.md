# SyncBoard API Contracts

## Overview
SyncBoard is a parallel project management system with dual Kanban boards:
- **Human Fizzy Board**: Beautiful, intuitive UI for human developers
- **AI Vibe Board**: Execution-focused view for AI agents (Claude, GPT, Gemini)

Both boards share the same data with real-time sync and CRDT-based version control.

---

## Data Models

### Board
```json
{
  "id": "string (UUID)",
  "name": "string",
  "description": "string",
  "columns": ["Column"],
  "watchers": ["string (user_id)"],
  "created_at": "ISO datetime",
  "updated_at": "ISO datetime"
}
```

### Column
```json
{
  "id": "string (UUID)",
  "name": "string",
  "order": "number",
  "board_id": "string"
}
```

### Card
```json
{
  "id": "string (UUID)",
  "number": "number (auto-increment)",
  "title": "string",
  "description": "string",
  "column_id": "string",
  "board_id": "string",
  "tags": ["string (tag_id)"],
  "assignee_id": "string | null",
  "creator_id": "string",
  "source": "human | ai",
  "version": "number (CRDT vector clock)",
  "last_modified_by": "string (user_id)",
  "created_at": "ISO datetime",
  "updated_at": "ISO datetime",
  "comments": ["Comment"]
}
```

### Comment
```json
{
  "id": "string (UUID)",
  "text": "string",
  "author_id": "string",
  "created_at": "ISO datetime"
}
```

### User
```json
{
  "id": "string (UUID)",
  "name": "string",
  "email": "string",
  "avatar": "string (URL)",
  "is_ai": "boolean"
}
```

### Tag
```json
{
  "id": "string (UUID)",
  "name": "string",
  "color": "string"
}
```

### Execution (AI-specific)
```json
{
  "id": "string (UUID)",
  "card_id": "string",
  "agent_id": "string (AI user_id)",
  "status": "idle | running | completed | failed | paused",
  "progress": "number (0-100)",
  "branch": "string | null",
  "files_changed": "number",
  "started_at": "ISO datetime",
  "completed_at": "ISO datetime | null",
  "logs": ["ExecutionLog"]
}
```

### ExecutionLog
```json
{
  "time": "string",
  "type": "info | success | error | warning",
  "message": "string"
}
```

---

## API Endpoints

### Boards

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/boards` | List all boards |
| GET | `/api/boards/:id` | Get board by ID |
| POST | `/api/boards` | Create new board |
| PUT | `/api/boards/:id` | Update board |
| DELETE | `/api/boards/:id` | Delete board |

### Cards

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/boards/:boardId/cards` | Get all cards in board |
| GET | `/api/cards/:id` | Get card by ID |
| POST | `/api/boards/:boardId/cards` | Create new card |
| PUT | `/api/cards/:id` | Update card (with version check) |
| DELETE | `/api/cards/:id` | Delete card |
| PATCH | `/api/cards/:id/move` | Move card to different column |
| POST | `/api/cards/:id/comments` | Add comment to card |

### AI-Specific Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/claim-task` | AI claims a task |
| POST | `/api/ai/update-status` | AI updates task status |
| POST | `/api/ai/add-log` | AI adds execution log |
| GET | `/api/ai/available-tasks` | Get tasks available for AI |
| GET | `/api/executions/:cardId` | Get execution status |
| POST | `/api/executions` | Create/update execution |

### Sync Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sync/poll` | Poll for changes since timestamp |
| GET | `/api/sync/version/:cardId` | Get card version info |
| POST | `/api/sync/resolve-conflict` | Resolve version conflict |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create user |

---

## Version Control (CRDT)

Each card has a `version` number that increments on every update.

### Update Flow:
1. Client sends update with current `version`
2. Server checks if `version` matches
3. If match: Apply update, increment version
4. If mismatch: Return conflict with both versions

### Conflict Resolution:
```json
POST /api/sync/resolve-conflict
{
  "card_id": "string",
  "resolution": "keep_local | keep_remote | merge",
  "merged_data": {} // if merge
}
```

---

## Mock Data to Replace

From `mockData.js`:
- `mockUsers` → `/api/users`
- `mockTags` → `/api/tags`
- `mockColumns` → `/api/boards/:id` (columns included)
- `mockCards` → `/api/boards/:boardId/cards`
- `mockBoards` → `/api/boards`
- `mockExecutions` → `/api/executions`
- `mockAISettings` → `/api/settings/ai`

---

## CLI Commands

```bash
# List tasks
syncboard list [--board <id>] [--status <status>] [--source human|ai]

# Get task details
syncboard get <card-id>

# Create task
syncboard create --title "Task title" [--description "..."] [--board <id>]

# Claim task (AI)
syncboard claim <card-id> --agent <agent-id>

# Update task status
syncboard status <card-id> --status <running|completed|failed>

# Move task
syncboard move <card-id> --column <column-id>

# Add comment
syncboard comment <card-id> --message "Comment text"

# Add execution log (AI)
syncboard log <card-id> --type <info|success|error> --message "Log message"

# Poll for changes
syncboard poll [--since <timestamp>]
```

---

## Frontend Integration Points

### Replace in Board.jsx:
- `mockCards` → API fetch with React Query
- `mockColumns` → API fetch
- Card CRUD operations → API calls

### Replace in VibeAIPanel.jsx:
- `mockExecutions` → API fetch
- `mockUsers.filter(isAI)` → API fetch

### Replace in AISettings.jsx:
- `mockAISettings` → API fetch/update

---

## Authentication

AI agents authenticate via API key in header:
```
Authorization: Bearer <api-key>
X-Agent-ID: <agent-id>
```

Human users: Session-based (future: add OAuth)
