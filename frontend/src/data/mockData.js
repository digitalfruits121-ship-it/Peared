// Mock data for Fizzy-style Kanban Board

export const mockUsers = [
  { id: 'user-1', name: 'Michael B.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael', email: 'michael@example.com' },
  { id: 'user-2', name: 'Jorge M.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jorge', email: 'jorge@example.com' },
  { id: 'user-3', name: 'Jason Z.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jason', email: 'jason@example.com' },
  { id: 'user-4', name: 'Sarah K.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', email: 'sarah@example.com' },
  { id: 'user-5', name: 'Alex R.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', email: 'alex@example.com' },
  { id: 'ai-claude', name: 'Claude AI', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Claude', email: 'claude@ai.dev', isAI: true },
  { id: 'ai-gpt', name: 'GPT Assistant', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=GPT', email: 'gpt@ai.dev', isAI: true },
];

export const mockTags = [
  { id: 'tag-1', name: 'HUMAN: TASKS', color: 'teal' },
  { id: 'tag-2', name: 'AI: TASKS', color: 'purple' },
  { id: 'tag-3', name: 'BUG', color: 'red' },
  { id: 'tag-4', name: 'FEATURE', color: 'blue' },
  { id: 'tag-5', name: 'MOBILE', color: 'orange' },
  { id: 'tag-6', name: 'BACKEND', color: 'green' },
  { id: 'tag-7', name: 'FRONTEND', color: 'pink' },
  { id: 'tag-8', name: 'BLOCKED', color: 'gray' },
];

export const mockColumns = [
  { id: 'col-1', name: 'To Do', order: 0 },
  { id: 'col-2', name: 'In Progress', order: 1 },
  { id: 'col-3', name: 'In Review', order: 2 },
  { id: 'col-4', name: 'Done', order: 3 },
];

export const mockCards = [
  {
    id: 'card-2835',
    number: 2835,
    title: 'User not notified when assigned or mentioned if not following board',
    description: 'Users should receive notifications even when they are not actively following the board.',
    columnId: 'col-2',
    tags: ['tag-1', 'tag-3'],
    assigneeId: 'user-2',
    creatorId: 'user-1',
    createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    comments: [],
    version: 1,
    lastModifiedBy: 'user-1',
    source: 'human'
  },
  {
    id: 'card-2943',
    number: 2943,
    title: 'Horizontal scroll on iPhone 17 Pro',
    description: 'The board has unwanted horizontal scroll on the latest iPhone model.',
    columnId: 'col-2',
    tags: ['tag-1', 'tag-5'],
    assigneeId: 'user-3',
    creatorId: 'user-1',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    comments: [],
    version: 3,
    lastModifiedBy: 'user-3',
    source: 'human'
  },
  {
    id: 'card-2743',
    number: 2743,
    title: 'New notifications don\'t appear without manual refresh',
    description: 'Implement real-time notification updates using WebSocket or polling.',
    columnId: 'col-2',
    tags: ['tag-1'],
    assigneeId: 'user-2',
    creatorId: 'user-1',
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    comments: [],
    version: 2,
    lastModifiedBy: 'user-2',
    source: 'human'
  },
  {
    id: 'card-2960',
    number: 2960,
    title: 'Support non latin characters in filtering and search',
    description: 'Add support for Unicode characters in the search functionality.',
    columnId: 'col-1',
    tags: ['tag-1', 'tag-4'],
    assigneeId: null,
    creatorId: 'user-1',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    comments: [],
    version: 1,
    lastModifiedBy: 'user-1',
    source: 'human'
  },
  {
    id: 'card-2972',
    number: 2972,
    title: 'Windows - Laggy animation every time you click on a card in the notifications stack',
    description: 'Performance issue on Windows browsers when interacting with notification cards.',
    columnId: 'col-1',
    tags: ['tag-1', 'tag-3'],
    assigneeId: null,
    creatorId: 'user-4',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    comments: [],
    version: 1,
    lastModifiedBy: 'user-4',
    source: 'human'
  },
  {
    id: 'card-3001',
    number: 3001,
    title: 'Implement API authentication middleware',
    description: 'AI task: Create secure authentication layer for API endpoints.',
    columnId: 'col-2',
    tags: ['tag-2', 'tag-6'],
    assigneeId: 'ai-claude',
    creatorId: 'ai-claude',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    comments: [
      { id: 'comment-1', text: 'Starting implementation of JWT middleware', authorId: 'ai-claude', createdAt: new Date().toISOString() }
    ],
    version: 4,
    lastModifiedBy: 'ai-claude',
    source: 'ai'
  },
  {
    id: 'card-3002',
    number: 3002,
    title: 'Refactor database queries for better performance',
    description: 'AI task: Optimize MongoDB queries and add proper indexing.',
    columnId: 'col-3',
    tags: ['tag-2', 'tag-6'],
    assigneeId: 'ai-gpt',
    creatorId: 'user-1',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    comments: [],
    version: 2,
    lastModifiedBy: 'ai-gpt',
    source: 'ai'
  },
  {
    id: 'card-2225',
    number: 2225,
    title: 'Animate automatic pagination links',
    description: 'Add smooth animations when pagination links are auto-generated.',
    columnId: 'col-4',
    tags: ['tag-1', 'tag-7'],
    assigneeId: 'user-3',
    creatorId: 'user-2',
    createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    comments: [],
    version: 5,
    lastModifiedBy: 'user-3',
    source: 'human'
  },
  {
    id: 'card-3003',
    number: 3003,
    title: 'Write unit tests for card CRUD operations',
    description: 'AI task: Create comprehensive test suite for all card operations.',
    columnId: 'col-4',
    tags: ['tag-2', 'tag-6'],
    assigneeId: 'ai-claude',
    creatorId: 'ai-claude',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    comments: [],
    version: 3,
    lastModifiedBy: 'ai-claude',
    source: 'ai'
  },
];

export const mockBoards = [
  {
    id: 'board-1',
    name: 'Project Sync',
    description: 'Human-AI collaborative project management board',
    columns: mockColumns,
    watchers: ['user-1', 'user-2', 'user-3', 'user-4', 'ai-claude'],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const mockAISettings = {
  enabled: true,
  providers: [
    { id: 'openai', name: 'OpenAI', model: 'gpt-4', enabled: true },
    { id: 'anthropic', name: 'Anthropic', model: 'claude-3-sonnet', enabled: true },
    { id: 'google', name: 'Google', model: 'gemini-pro', enabled: false },
  ],
  apiKey: '',
  pollInterval: 5000,
  autoAssign: true,
};

// Helper function to get user by ID
export const getUserById = (id) => mockUsers.find(user => user.id === id);

// Helper function to get tag by ID
export const getTagById = (id) => mockTags.find(tag => tag.id === id);

// Helper function to get cards by column
export const getCardsByColumn = (columnId) => mockCards.filter(card => card.columnId === columnId);

// Helper function to format relative time
export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'TODAY';
  if (diffDays === 1) return 'YESTERDAY';
  if (diffDays < 7) return `${diffDays} DAYS AGO`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} WEEKS AGO`;
  return `${Math.floor(diffDays / 30)} MONTHS AGO`;
};
