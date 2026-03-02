import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { cardApi } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';
import { useAuth } from './AuthContext';

const CardsContext = createContext();

const BOARD_ID = 'board-1';

export const CardsProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  // ---- Load cards from API ----
  const fetchCards = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const data = await cardApi.list(BOARD_ID);
      setCards(data);
    } catch (err) {
      setError(err.message || 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // ---- WebSocket real-time sync ----
  useEffect(() => {
    if (!currentUser) return;

    const socket = connectSocket(BOARD_ID);
    socketRef.current = socket;

    socket.on('card:created', (raw) => {
      setCards((prev) => {
        if (prev.find((c) => c.id === raw.id)) return prev;
        return [...prev, transformRaw(raw)];
      });
    });

    socket.on('card:updated', (raw) => {
      setCards((prev) => prev.map((c) => (c.id === raw.id ? transformRaw(raw) : c)));
    });

    socket.on('card:moved', ({ cardId, columnId, version }) => {
      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, columnId, version } : c))
      );
    });

    socket.on('card:deleted', ({ cardId }) => {
      setCards((prev) => prev.filter((c) => c.id !== cardId));
    });

    return () => {
      socket.off('card:created');
      socket.off('card:updated');
      socket.off('card:moved');
      socket.off('card:deleted');
      disconnectSocket();
    };
  }, [currentUser]);

  // ---- Mutations ----

  const addCard = useCallback(async ({ columnId, title }) => {
    if (!currentUser) return;
    const optimisticId = `optimistic-${Date.now()}`;
    const optimistic = {
      id: optimisticId,
      number: Math.max(0, ...cards.map((c) => c.number)) + 1,
      title,
      description: '',
      columnId,
      tags: ['tag-1'],
      assigneeId: null,
      creatorId: currentUser.id,
      source: 'human',
      version: 1,
      lastModifiedBy: currentUser.id,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      boardId: BOARD_ID,
    };
    setCards((prev) => [...prev, optimistic]);

    try {
      const created = await cardApi.create(BOARD_ID, {
        title,
        columnId,
        tags: ['tag-1'],
        creatorId: currentUser.id,
        source: 'human',
      });
      setCards((prev) => prev.map((c) => (c.id === optimisticId ? created : c)));
    } catch (err) {
      setCards((prev) => prev.filter((c) => c.id !== optimisticId));
      throw err;
    }
  }, [cards, currentUser]);

  const updateCard = useCallback(async (updatedCard) => {
    const prev = cards.find((c) => c.id === updatedCard.id);
    setCards((all) =>
      all.map((c) =>
        c.id === updatedCard.id
          ? { ...updatedCard, version: (prev?.version || 1) + 1, updatedAt: new Date().toISOString() }
          : c
      )
    );

    try {
      const saved = await cardApi.update(
        updatedCard.id,
        { ...updatedCard, version: prev?.version || updatedCard.version },
        currentUser?.id
      );
      setCards((all) => all.map((c) => (c.id === saved.id ? saved : c)));
    } catch (err) {
      if (prev) setCards((all) => all.map((c) => (c.id === prev.id ? prev : c)));
      throw err;
    }
  }, [cards, currentUser]);

  const deleteCard = useCallback(async (cardId) => {
    const prev = cards.find((c) => c.id === cardId);
    setCards((all) => all.filter((c) => c.id !== cardId));

    try {
      await cardApi.delete(cardId);
    } catch (err) {
      if (prev) setCards((all) => [...all, prev]);
      throw err;
    }
  }, [cards]);

  const moveCard = useCallback(async (cardId, newColumnId) => {
    const prev = cards.find((c) => c.id === cardId);
    if (!prev || prev.columnId === newColumnId) return;

    setCards((all) =>
      all.map((c) =>
        c.id === cardId
          ? { ...c, columnId: newColumnId, version: (prev.version || 1) + 1, updatedAt: new Date().toISOString() }
          : c
      )
    );

    try {
      await cardApi.move(cardId, newColumnId, prev.version || 1, currentUser?.id);
    } catch (err) {
      setCards((all) => all.map((c) => (c.id === prev.id ? prev : c)));
      throw err;
    }
  }, [cards, currentUser]);

  const assignToAI = useCallback(async (cardId, agentId) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;
    await updateCard({
      ...card,
      source: 'ai',
      assigneeId: agentId,
      tags: [...card.tags.filter((t) => t !== 'tag-1'), 'tag-2'],
    });
  }, [cards, updateCard]);

  const returnToHuman = useCallback(async (cardId) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;
    await updateCard({
      ...card,
      source: 'human',
      tags: [...card.tags.filter((t) => t !== 'tag-2'), 'tag-1'],
    });
  }, [cards, updateCard]);

  const getHumanCards = useCallback(() => cards.filter((c) => c.source !== 'ai'), [cards]);
  const getAICards = useCallback(() => cards.filter((c) => c.source === 'ai'), [cards]);

  return (
    <CardsContext.Provider value={{
      cards,
      loading,
      error,
      setCards,
      addCard,
      updateCard,
      deleteCard,
      moveCard,
      assignToAI,
      returnToHuman,
      getHumanCards,
      getAICards,
      refetch: fetchCards,
    }}>
      {children}
    </CardsContext.Provider>
  );
};

export const useCards = () => {
  const context = useContext(CardsContext);
  if (!context) throw new Error('useCards must be used within a CardsProvider');
  return context;
};

// Transform raw snake_case socket event data to camelCase
function transformRaw(raw) {
  return {
    id: raw.id,
    number: raw.number,
    boardId: raw.board_id,
    title: raw.title,
    description: raw.description,
    columnId: raw.column_id,
    tags: raw.tags || [],
    assigneeId: raw.assignee_id || null,
    creatorId: raw.creator_id,
    source: raw.source,
    version: raw.version,
    lastModifiedBy: raw.last_modified_by,
    comments: (raw.comments || []).map((c) => ({
      id: c.id,
      text: c.text,
      authorId: c.author_id,
      createdAt: c.created_at,
    })),
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}
