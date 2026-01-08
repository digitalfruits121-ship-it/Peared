import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============== Board API ==============

export const boardApi = {
  list: async () => {
    const response = await api.get('/boards');
    return response.data;
  },
  
  get: async (boardId) => {
    const response = await api.get(`/boards/${boardId}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/boards', data);
    return response.data;
  },
  
  update: async (boardId, data) => {
    const response = await api.put(`/boards/${boardId}`, data);
    return response.data;
  },
  
  delete: async (boardId) => {
    const response = await api.delete(`/boards/${boardId}`);
    return response.data;
  },
};

// ============== Card API ==============

export const cardApi = {
  list: async (boardId, params = {}) => {
    const response = await api.get(`/boards/${boardId}/cards`, { params });
    return response.data;
  },
  
  get: async (cardId) => {
    const response = await api.get(`/cards/${cardId}`);
    return response.data;
  },
  
  create: async (boardId, data) => {
    const response = await api.post(`/boards/${boardId}/cards`, data);
    return response.data;
  },
  
  update: async (cardId, data, modifierId) => {
    const response = await api.put(`/cards/${cardId}?modifier_id=${modifierId}`, data);
    return response.data;
  },
  
  move: async (cardId, columnId, version, modifierId) => {
    const response = await api.patch(`/cards/${cardId}/move?modifier_id=${modifierId}`, {
      column_id: columnId,
      version,
    });
    return response.data;
  },
  
  delete: async (cardId) => {
    const response = await api.delete(`/cards/${cardId}`);
    return response.data;
  },
  
  addComment: async (cardId, text, authorId) => {
    const response = await api.post(`/cards/${cardId}/comments`, {
      text,
      author_id: authorId,
    });
    return response.data;
  },
};

// ============== User API ==============

export const userApi = {
  list: async (isAI = null) => {
    const params = isAI !== null ? { is_ai: isAI } : {};
    const response = await api.get('/users', { params });
    return response.data;
  },
  
  get: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/users', data);
    return response.data;
  },
};

// ============== Tag API ==============

export const tagApi = {
  list: async () => {
    const response = await api.get('/tags');
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/tags', data);
    return response.data;
  },
};

// ============== Execution API (AI-specific) ==============

export const executionApi = {
  get: async (cardId) => {
    const response = await api.get(`/executions/${cardId}`);
    return response.data;
  },
  
  list: async (status = null) => {
    const params = status ? { status } : {};
    const response = await api.get('/executions', { params });
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/executions', data);
    return response.data;
  },
  
  update: async (executionId, data) => {
    const response = await api.put(`/executions/${executionId}`, data);
    return response.data;
  },
};

// ============== AI API ==============

export const aiApi = {
  claimTask: async (cardId, agentId) => {
    const response = await api.post('/ai/claim-task', {
      card_id: cardId,
      agent_id: agentId,
    });
    return response.data;
  },
  
  updateStatus: async (cardId, status, progress = null, message = null) => {
    const response = await api.post('/ai/update-status', {
      card_id: cardId,
      status,
      progress,
      message,
    });
    return response.data;
  },
  
  addLog: async (cardId, logType, message) => {
    const response = await api.post('/ai/add-log', {
      card_id: cardId,
      log_type: logType,
      message,
    });
    return response.data;
  },
  
  getAvailableTasks: async (boardId = null) => {
    const params = boardId ? { board_id: boardId } : {};
    const response = await api.get('/ai/available-tasks', { params });
    return response.data;
  },
};

// ============== Sync API ==============

export const syncApi = {
  poll: async (since = null, boardId = null) => {
    const params = {};
    if (since) params.since = since;
    if (boardId) params.board_id = boardId;
    const response = await api.get('/sync/poll', { params });
    return response.data;
  },
  
  getVersion: async (cardId) => {
    const response = await api.get(`/sync/version/${cardId}`);
    return response.data;
  },
  
  resolveConflict: async (cardId, resolution, mergedData = null) => {
    const response = await api.post('/sync/resolve-conflict', {
      card_id: cardId,
      resolution,
      merged_data: mergedData,
    });
    return response.data;
  },
};

// ============== File API ==============

export const fileApi = {
  list: async (params = {}) => {
    const response = await api.get('/files', { params });
    return response.data;
  },
  
  get: async (fileId) => {
    const response = await api.get(`/files/${fileId}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/files', data);
    return response.data;
  },
  
  update: async (fileId, data, modifierId) => {
    const response = await api.put(`/files/${fileId}?modifier_id=${modifierId}`, data);
    return response.data;
  },
  
  delete: async (fileId) => {
    const response = await api.delete(`/files/${fileId}`);
    return response.data;
  },
  
  linkToCard: async (fileId, cardId) => {
    const response = await api.post(`/files/${fileId}/link/${cardId}`);
    return response.data;
  },
  
  unlinkFromCard: async (fileId, cardId) => {
    const response = await api.delete(`/files/${fileId}/link/${cardId}`);
    return response.data;
  },
  
  getCardFiles: async (cardId) => {
    const response = await api.get(`/cards/${cardId}/files`);
    return response.data;
  },
};

// ============== Settings API ==============

export const settingsApi = {
  getFileSettings: async () => {
    const response = await api.get('/settings/files');
    return response.data;
  },
  
  updateFileSettings: async (settings) => {
    const response = await api.put('/settings/files', settings);
    return response.data;
  },
};

// ============== Seed API ==============

export const seedDatabase = async () => {
  const response = await api.post('/seed');
  return response.data;
};

export default api;
