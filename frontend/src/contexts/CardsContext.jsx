import React, { createContext, useContext, useState } from 'react';
import { mockCards as initialCards } from '../data/mockData';

const CardsContext = createContext();

export const CardsProvider = ({ children }) => {
  const [cards, setCards] = useState(initialCards);

  const addCard = (card) => {
    setCards(prev => [...prev, card]);
  };

  const updateCard = (updatedCard) => {
    setCards(prev => prev.map(card => 
      card.id === updatedCard.id 
        ? { ...updatedCard, version: (card.version || 1) + 1, updatedAt: new Date().toISOString() } 
        : card
    ));
  };

  const deleteCard = (cardId) => {
    setCards(prev => prev.filter(card => card.id !== cardId));
  };

  const moveCard = (cardId, newColumnId) => {
    setCards(prev => prev.map(card =>
      card.id === cardId
        ? { ...card, columnId: newColumnId, version: (card.version || 1) + 1, updatedAt: new Date().toISOString() }
        : card
    ));
  };

  const assignToAI = (cardId, agentId) => {
    setCards(prev => prev.map(card =>
      card.id === cardId
        ? { 
            ...card, 
            source: 'ai', 
            assigneeId: agentId,
            tags: [...card.tags.filter(t => t !== 'tag-1'), 'tag-2'], // Remove HUMAN: TASKS, add AI: TASKS
            version: (card.version || 1) + 1, 
            updatedAt: new Date().toISOString() 
          }
        : card
    ));
  };

  const returnToHuman = (cardId) => {
    setCards(prev => prev.map(card =>
      card.id === cardId
        ? { 
            ...card, 
            source: 'human',
            tags: [...card.tags.filter(t => t !== 'tag-2'), 'tag-1'], // Remove AI: TASKS, add HUMAN: TASKS
            version: (card.version || 1) + 1, 
            updatedAt: new Date().toISOString() 
          }
        : card
    ));
  };

  // Get cards filtered by source
  const getHumanCards = () => cards.filter(card => card.source !== 'ai');
  const getAICards = () => cards.filter(card => card.source === 'ai');

  return (
    <CardsContext.Provider value={{
      cards,
      setCards,
      addCard,
      updateCard,
      deleteCard,
      moveCard,
      assignToAI,
      returnToHuman,
      getHumanCards,
      getAICards,
    }}>
      {children}
    </CardsContext.Provider>
  );
};

export const useCards = () => {
  const context = useContext(CardsContext);
  if (!context) {
    throw new Error('useCards must be used within a CardsProvider');
  }
  return context;
};
