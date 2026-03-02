import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// ---- axios instance ----
const api = axios.create({
  baseURL: API,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('peared_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ---- Data transform helpers ----
// Backend uses snake_case; frontend uses camelCase.

export function cardFromApi(c) {
  if (!c) return null;
  return {
    id: c.id,
    number: c.number,
    boardId: c.board_id,
    title: c.title,
    description: c.description,
    columnId: c.column_id,
    tags: c.tags || [],
    assigneeId: c.assignee_id || null,
    creatorId: c.creator_id,
    source: c.source,
    version: c.version,
    lastModifiedBy: c.last_modified_by,
    comments: (c.comments || []).map(commentFromApi),
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  };
}

export function commentFromApi(c) {
  return {
    id: c.id,
    text: c.text,
    authorId: c.author_id,
    createdAt: c.created_at,
  };
}

export function columnFromApi(c) {
  return { id: c.id, name: c.name, order: c.order };
}

export function userFromApi(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.avatar,
    isAI: u.is_ai,
  };
}

export function tagFromApi(t) {
  return { id: t.id, name: t.name, color: t.color };
}

export function boardFromApi(b) {
  return {
    id: b.id,
    name: b.name,
    description: b.description,
    columns: (b.columns || []).map(columnFromApi),
    watchers: b.watchers || [],
    createdAt: b.created_at,
    updatedAt: b.updated_at,
  };
}

// ---- Auth API ----

export const authApi = {
  register: async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data;
  },
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  me: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

// ============== Board API ==============

export const boardApi = {
  list: async () => {
    const res = await api.get('/boards');
    return res.data.map(boardFromApi);
  },
  get: async (boardId) => {
    const res = await api.get(`/boards/${boardId}`);
    return boardFromApi(res.data);
  },
  create: async (data) => {
    const res = await api.post('/boards', data);
    return boardFromApi(res.data);
  },
  update: async (boardId, data) => {
    const res = await api.put(`/boards/${boardId}`, data);
    return boardFromApi(res.data);
  },
  delete: async (boardId) => {
    const res = await api.delete(`/boards/${boardId}`);
    return res.data;
  },
};

// ============== Card API ==============

export const cardApi = {
  list: async (boardId, params = {}) => {
    const res = await api.get(`/boards/${boardId}/cards`, { params });
    return res.data.map(cardFromApi);
  },
  get: async (cardId) => {
    const res = await api.get(`/cards/${cardId}`);
    return cardFromApi(res.data);
  },
  create: async (boardId, data) => {
    const payload = {
      title: data.title,
      description: data.description || '',
      column_id: data.columnId,
      tags: data.tags || [],
      assignee_id: data.assigneeId || null,
      creator_id: data.creatorId || null,
      source: data.source || 'human',
    };
    const res = await api.post(`/boards/${boardId}/cards`, payload);
    return cardFromApi(res.data);
  },
  update: async (cardId, data, modifierId) => {
    const payload = {
      title: data.title,
      description: data.description,
      column_id: data.columnId,
      tags: data.tags,
      assignee_id: data.assigneeId,
      source: data.source,
      version: data.version,
    };
    const params = modifierId ? { modifier_id: modifierId } : {};
    const res = await api.put(`/cards/${cardId}`, payload, { params });
    return cardFromApi(res.data);
  },
  move: async (cardId, columnId, version, modifierId) => {
    const params = modifierId ? { modifier_id: modifierId } : {};
    const res = await api.patch(`/cards/${cardId}/move`, { column_id: columnId, version }, { params });
    return cardFromApi(res.data);
  },
  delete: async (cardId) => {
    const res = await api.delete(`/cards/${cardId}`);
    return res.data;
  },
  addComment: async (cardId, text, authorId) => {
    const res = await api.post(`/cards/${cardId}/comments`, { text, author_id: authorId });
    return cardFromApi(res.data);
  },
};

// ============== User API ==============

export const userApi = {
  list: async (isAI = null) => {
    const params = isAI !== null ? { is_ai: isAI } : {};
    const res = await api.get('/users', { params });
    return res.data.map(userFromApi);
  },
  get: async (userId) => {
    const res = await api.get(`/users/${userId}`);
    return userFromApi(res.data);
  },
  create: async (data) => {
    const res = await api.post('/users', data);
    return userFromApi(res.data);
  },
};

// ============== Tag API ==============

export const tagApi = {
  list: async () => {
    const res = await api.get('/tags');
    return res.data.map(tagFromApi);
  },
  create: async (data) => {
    const res = await api.post('/tags', data);
    return tagFromApi(res.data);
  },
};

// ============== Execution API (AI-specific) ==============

export const executionApi = {
  get: async (cardId) => {
    const res = await api.get(`/executions/${cardId}`);
    return res.data;
  },
  list: async (status = null) => {
    const params = status ? { status } : {};
    const res = await api.get('/executions', { params });
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/executions', data);
    return res.data;
  },
  update: async (executionId, data) => {
    const res = await api.put(`/executions/${executionId}`, data);
    return res.data;
  },
};

// ============== AI API ==============

export const aiApi = {
  claimTask: async (cardId, agentId) => {
    const res = await api.post('/ai/claim-task', { card_id: cardId, agent_id: agentId });
    return cardFromApi(res.data);
  },
  updateStatus: async (cardId, status, progress = null, message = null) => {
    const res = await api.post('/ai/update-status', { card_id: cardId, status, progress, message });
    return res.data;
  },
  addLog: async (cardId, logType, message) => {
    const res = await api.post('/ai/add-log', { card_id: cardId, log_type: logType, message });
    return res.data;
  },
  getAvailableTasks: async (boardId = null) => {
    const params = boardId ? { board_id: boardId } : {};
    const res = await api.get('/ai/available-tasks', { params });
    return res.data.map(cardFromApi);
  },
};

// ============== Sync API ==============

export const syncApi = {
  poll: async (since = null, boardId = null) => {
    const params = {};
    if (since) params.since = since;
    if (boardId) params.board_id = boardId;
    const res = await api.get('/sync/poll', { params });
    return {
      cards: (res.data.cards || []).map(cardFromApi),
      lastSync: res.data.last_sync,
      hasConflicts: res.data.has_conflicts,
    };
  },
  getVersion: async (cardId) => {
    const res = await api.get(`/sync/version/${cardId}`);
    return res.data;
  },
  resolveConflict: async (cardId, resolution, mergedData = null) => {
    const res = await api.post('/sync/resolve-conflict', {
      card_id: cardId,
      resolution,
      merged_data: mergedData,
    });
    return res.data;
  },
};

// ============== File API ==============

export const fileApi = {
  list: async (params = {}) => {
    const res = await api.get('/files', { params });
    return res.data;
  },
  get: async (fileId) => {
    const res = await api.get(`/files/${fileId}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/files', data);
    return res.data;
  },
  update: async (fileId, data, modifierId) => {
    const res = await api.put(`/files/${fileId}`, data, { params: { modifier_id: modifierId } });
    return res.data;
  },
  delete: async (fileId) => {
    const res = await api.delete(`/files/${fileId}`);
    return res.data;
  },
  linkToCard: async (fileId, cardId) => {
    const res = await api.post(`/files/${fileId}/link/${cardId}`);
    return res.data;
  },
  unlinkFromCard: async (fileId, cardId) => {
    const res = await api.delete(`/files/${fileId}/link/${cardId}`);
    return res.data;
  },
  getCardFiles: async (cardId) => {
    const res = await api.get(`/cards/${cardId}/files`);
    return res.data;
  },
};

// ============== Settings API ==============

export const settingsApi = {
  getFileSettings: async () => {
    const res = await api.get('/settings/files');
    return res.data;
  },
  updateFileSettings: async (settings) => {
    const res = await api.put('/settings/files', settings);
    return res.data;
  },
};

// ============== Seed API ==============

export const seedDatabase = async () => {
  const res = await api.post('/seed');
  return res.data;
};

export default api;
