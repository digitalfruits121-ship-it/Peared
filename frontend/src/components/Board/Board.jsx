import React, { useState, useEffect } from 'react';
import Column from './Column';
import CardModal from './CardModal';
import { mockColumns, mockCards, mockUsers, mockTags, getUserById } from '../../data/mockData';
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
  const [cards, setCards] = useState(mockCards);
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
      number: Math.max(...cards.map(c => c.number)) + 1,
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
    setCards([...cards, newCard]);
  };

  const handleDragStart = (card) => setDraggedCard(card);
  const handleDragEnd = () => { setDraggedCard(null); setDragOverColumn(null); };
  const handleDragOver = (columnId) => setDragOverColumn(columnId);

  const handleDrop = (columnId) => {
    if (draggedCard && draggedCard.columnId !== columnId) {
      setCards(cards.map(card => 
        card.id === draggedCard.id 
          ? { ...card, columnId, version: card.version + 1, updatedAt: new Date().toISOString(), lastModifiedBy: 'user-1' } 
          : card
      ));
    }
    setDraggedCard(null);
    setDragOverColumn(null);
  };

  const handleUpdateCard = (updatedCard) => {
    setCards(cards.map(card => 
      card.id === updatedCard.id 
        ? { ...updatedCard, version: card.version + 1, updatedAt: new Date().toISOString() } 
        : card
    ));
    setSelectedCard(null);
  };

  const handleDeleteCard = (cardId) => {
    setCards(cards.filter(card => card.id !== cardId));
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
    <div className="h-full flex flex-col">
      {/* Board Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 px-4 md:px-6 py-3 md:py-4 border-b border-lime-100 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search - Mobile Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden h-9 w-9 text-lime-700"
            onClick={() => setShowSearch(!showSearch)}
          >
            {showSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </Button>

          {/* Search - Desktop */}
          <div className="hidden sm:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lime-500" />
            <Input
              type="text"
              placeholder="Search pears..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-40 md:w-64 h-9 text-sm border-lime-200 focus:border-lime-400 focus:ring-lime-400"
            />
          </div>

          {/* Source Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 md:gap-2 h-9 text-xs md:text-sm border-lime-200 text-lime-700 hover:bg-lime-50">
                <Filter className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden xs:inline">
                  {filterSource === 'all' ? 'All' : filterSource === 'human' ? '🍐 Human' : '🤖 AI'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Filter by Pair Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked={filterSource === 'all'} onCheckedChange={() => setFilterSource('all')}>
                All Pears
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={filterSource === 'human'} onCheckedChange={() => setFilterSource('human')}>
                <span className="flex items-center gap-2"><User className="w-4 h-4" /> 🍐 Human Tasks</span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={filterSource === 'ai'} onCheckedChange={() => setFilterSource('ai')}>
                <span className="flex items-center gap-2"><Bot className="w-4 h-4" /> 🤖 AI Tasks</span>
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Sync Status */}
          <div className="hidden md:flex items-center gap-2 text-xs md:text-sm text-lime-600">
            <RefreshCw className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isPolling ? 'animate-spin' : ''}`} />
            <span className="hidden lg:inline">Synced: {lastSync.toLocaleTimeString()}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPolling(!isPolling)}
              className={`h-7 w-7 p-0 ${isPolling ? 'text-lime-600' : 'text-gray-400'}`}
            >
              {isPolling ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </Button>
          </div>

          {/* Watchers */}
          <div className="flex items-center">
            <span className="hidden md:inline text-xs text-lime-600 mr-2">🍐 Paired:</span>
            <div className="flex -space-x-2">
              {watchers.slice(0, 3).map((user) => (
                <Avatar key={user.id} className="w-6 h-6 md:w-7 md:h-7 border-2 border-white ring-1 ring-lime-200">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-[8px] md:text-[10px] bg-lime-100 text-lime-700">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
              {watchers.length > 3 && (
                <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-lime-100 border-2 border-white flex items-center justify-center text-[8px] md:text-[10px] font-medium text-lime-700">
                  +{watchers.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showSearch && (
        <div className="sm:hidden px-4 py-2 border-b border-lime-100 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lime-500" />
            <Input
              type="text"
              placeholder="Search pears..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full h-9 text-sm border-lime-200"
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
          <button className="min-w-[260px] md:min-w-[300px] h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-lime-300 text-lime-500 hover:border-lime-400 hover:text-lime-600 hover:bg-lime-50/50 transition-colors text-sm font-medium flex-shrink-0">
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
