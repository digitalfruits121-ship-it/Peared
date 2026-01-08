# SyncBoard PRD - Product Requirements Document

## Product Overview
**SyncBoard** is a parallel project management system that enables seamless collaboration between human developers and AI coding agents. It combines two Kanban board paradigms:
- **Fizzy-style Board**: Beautiful, intuitive UI for human developers
- **Vibe-style Board**: Execution-focused view for AI agents (Claude, GPT, Gemini)

## Key Features

### 1. Dual Board Views
- **Split View**: Human board (left) + AI board (right) + File Repository (optional)
- **Human View**: Full-width Fizzy-style Kanban board
- **AI View**: Full-width Vibe-style execution dashboard

### 2. Human Fizzy Board
- Kanban columns: To Do, In Progress, In Review, Done
- Card features: tags, assignees, comments, version tracking
- Drag-and-drop between columns
- Search and filter by source (Human/AI tasks)
- Real-time sync status indicator

### 3. AI Vibe Board
- Agent profiles with status (working/available)
- Task queue with execution status
- Progress tracking and execution logs
- Branch and file change indicators
- Pause/Resume task controls

### 4. File Repository
- Project-wide and task-specific files
- Supported types: Markdown (.md), JSON (.json), Images (.png, .jpg)
- In-browser editing for text files
- Link files to specific cards
- Create `instruct.md` and `newinstruct.json` on the fly

### 5. Version Control (CRDT)
- Optimistic locking with version numbers
- Conflict detection and resolution
- Change history tracking
- Poll-based sync mechanism

### 6. AI Integration
- API endpoints for AI read/write access
- CLI tool for AI agents
- Settings to toggle AI permissions:
  - UI Editing (on/off)
  - Card Linking (on/off)
  - AI Read Access (on/off)
  - AI Write Access (on/off)

## Technical Stack
- **Frontend**: React 19 + Tailwind CSS + shadcn/ui
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI Integration**: Emergent Universal Key (OpenAI, Anthropic, Google)

## API Endpoints

### Boards & Cards
- `GET/POST /api/boards` - List/Create boards
- `GET/PUT/DELETE /api/boards/:id` - Board CRUD
- `GET/POST /api/boards/:boardId/cards` - List/Create cards
- `GET/PUT/DELETE /api/cards/:id` - Card CRUD
- `PATCH /api/cards/:id/move` - Move card

### AI Specific
- `POST /api/ai/claim-task` - AI claims a task
- `POST /api/ai/update-status` - Update task status
- `POST /api/ai/add-log` - Add execution log
- `GET /api/ai/available-tasks` - Available tasks for AI

### Files
- `GET/POST /api/files` - List/Create files
- `GET/PUT/DELETE /api/files/:id` - File CRUD
- `POST /api/files/:id/link/:cardId` - Link file to card
- `GET /api/cards/:cardId/files` - Get card's files

### Sync
- `GET /api/sync/poll` - Poll for changes
- `POST /api/sync/resolve-conflict` - Resolve conflicts

## CLI Commands
```bash
syncboard list [--source human|ai]
syncboard get <card-id>
syncboard create --title "..." --description "..."
syncboard claim <card-id> --agent <agent-id>
syncboard status <card-id> --status running|completed|failed
syncboard move <card-id> --column <column-id>
syncboard files [--scope project|task]
syncboard file-create --name "instruct.md" --type markdown
```

## Current Status
- ✅ Frontend with dual board views
- ✅ Backend with full API
- ✅ CLI for AI agents
- ✅ File Repository with CRUD
- ✅ Settings page with toggles
- 🔄 Using mock data (can be switched to API)

## Next Steps
1. Connect frontend to backend API
2. Add real-time WebSocket sync
3. Implement actual AI provider integration
4. Add user authentication
5. Add board permissions and sharing
