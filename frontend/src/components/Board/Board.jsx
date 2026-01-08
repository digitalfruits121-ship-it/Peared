import React, { useState, useEffect } from 'react';
import Column from './Column';
import CardModal from './CardModal';
import { mockColumns, mockUsers, mockTags, getUserById } from '../../data/mockData';
import { useCards } from '../../contexts/CardsContext';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Plus, Eye, EyeOff, Bot, User, Filter, Search, RefreshCw, X } from 'lucide-react';
import { Input } from '../ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../ui/dropdown-menu';

const Board = ({ boardId }) => {
  const [columns, setColumns] = useState(mockColumns);
  const { cards, addCard, updateCard, deleteCard, moveCard } = useCards();
  const [selectedCard, setSelectedCard] = useState(null);
  const [draggedCard, setDraggedCard] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState('all');
  const [isPolling, setIsPolling] = useState(true);
  const [lastSync, setLastSync] = useState(new Date());
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (!isPolling) return;
    const interval = setInterval(() => {
      setLastSync(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, [isPolling]);

  const handleCardClick = (card) => setSelectedCard(card);
  const handleCloseModal = () => setSelectedCard(null);

  const handleAddCard = (columnId, title) => {
    const newCard = {
      id: `card-${Date.now()}`,
      number: Math.max(...cards.map(c => c.number), 0) + 1,
      title,
      description: '',
      columnId,
      tags: ['tag-1'],
      assigneeId: null,
      creatorId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      version: 1,
      lastModifiedBy: 'user-1',
      source: 'human',
    };
    addCard(newCard);
  };

  const handleDragStart = (card) => setDraggedCard(card);
  const handleDragEnd = () => { setDraggedCard(null); setDragOverColumn(null); };
  const handleDragOver = (columnId) => setDragOverColumn(columnId);

  const handleDrop = (columnId) => {
    if (draggedCard && draggedCard.columnId !== columnId) {
      moveCard(draggedCard.id, columnId);
    }
    setDraggedCard(null);
    setDragOverColumn(null);
  };

  const handleUpdateCard = (updatedCard) => {
    updateCard(updatedCard);
    setSelectedCard(null);
  };

  const handleDeleteCard = (cardId) => {
    deleteCard(cardId);
    setSelectedCard(null);
  };

  const filteredCards = cards.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = filterSource === 'all' || card.source === filterSource;
    return matchesSearch && matchesSource;
  });

  const getCardsByColumn = (columnId) => filteredCards.filter(card => card.columnId === columnId);
  const watchers = mockUsers.slice(0, 5);

  return (
    <div className="h-full flex flex-col bg-gray-950">
      {/* Board Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 px-4 md:px-6 py-3 md:py-4 border-b border-neon-500/20 bg-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search - Mobile Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden h-9 w-9 text-neon-400 hover:bg-neon-500/10"
            onClick={() => setShowSearch(!showSearch)}
          >
            {showSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </Button>

          {/* Search - Desktop */}
          <div className="hidden sm:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-500/50" />
            <Input
              type="text"
              placeholder="Search pears..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-40 md:w-64 h-9 text-sm bg-gray-800 border-neon-500/30 text-white placeholder:text-gray-500 focus:border-neon-500"
            />
          </div>

          {/* Source Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 md:gap-2 h-9 text-xs md:text-sm border-neon-500/30 text-neon-400 hover:bg-neon-500/10 bg-gray-800">
                <Filter className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden xs:inline">
                  {filterSource === 'all' ? 'All' : filterSource === 'human' ? '🍐 Human' : '🤖 AI'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-gray-900 border-neon-500/30">
              <DropdownMenuLabel className="text-neon-400">Filter by Pair Type</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-neon-500/20" />
              <DropdownMenuCheckboxItem checked={filterSource === 'all'} onCheckedChange={() => setFilterSource('all')} className="text-gray-300 hover:text-neon-400">
                All Pears
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={filterSource === 'human'} onCheckedChange={() => setFilterSource('human')} className="text-gray-300 hover:text-neon-400">
                <span className="flex items-center gap-2"><User className="w-4 h-4" /> 🍐 Human Tasks</span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={filterSource === 'ai'} onCheckedChange={() => setFilterSource('ai')} className="text-gray-300 hover:text-neon-400">
                <span className="flex items-center gap-2"><Bot className="w-4 h-4" /> 🤖 AI Tasks</span>
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Sync Status */}
          <div className="hidden md:flex items-center gap-2 text-xs md:text-sm text-neon-500/70">
            <RefreshCw className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isPolling ? 'animate-spin' : ''}`} />
            <span className="hidden lg:inline">Synced: {lastSync.toLocaleTimeString()}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPolling(!isPolling)}
              className={`h-7 w-7 p-0 ${isPolling ? 'text-neon-500' : 'text-gray-500'}`}
            >
              {isPolling ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </Button>
          </div>

          {/* Watchers */}
          <div className="flex items-center">
            <span className="hidden md:inline text-xs text-neon-500/70 mr-2">🍐 Paired:</span>
            <div className="flex -space-x-2">
              {watchers.slice(0, 3).map((user) => (
                <Avatar key={user.id} className="w-6 h-6 md:w-7 md:h-7 border-2 border-gray-900 ring-1 ring-neon-500/30">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-[8px] md:text-[10px] bg-neon-500/20 text-neon-400">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
              {watchers.length > 3 && (
                <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-neon-500/20 border-2 border-gray-900 flex items-center justify-center text-[8px] md:text-[10px] font-medium text-neon-400">
                  +{watchers.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showSearch && (
        <div className="sm:hidden px-4 py-2 border-b border-neon-500/20 bg-gray-900">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-500/50" />
            <Input
              type="text"
              placeholder="Search pears..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full h-9 text-sm bg-gray-800 border-neon-500/30 text-white"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Board Columns */}
      <div className="flex-1 overflow-x-auto p-4 md:p-6">
        <div className="flex gap-3 md:gap-4 h-full min-w-max">
          {columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              cards={getCardsByColumn(column.id)}
              onCardClick={handleCardClick}
              onAddCard={handleAddCard}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              draggedCard={draggedCard}
            />
          ))}

          {/* Add Column Button */}
          <button className="min-w-[260px] md:min-w-[300px] h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neon-500/30 text-neon-500/70 hover:border-neon-500/50 hover:text-neon-400 hover:bg-neon-500/5 transition-colors text-sm font-medium flex-shrink-0">
            <Plus className="w-4 h-4" />
            Add column
          </button>
        </div>
      </div>

      {/* Card Modal */}
      {selectedCard && (
        <CardModal card={selectedCard} onClose={handleCloseModal} onUpdate={handleUpdateCard} onDelete={handleDeleteCard} />
      )}
    </div>
  );
};

export default Board;
