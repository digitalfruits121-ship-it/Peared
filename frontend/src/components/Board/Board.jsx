import React, { useState, useEffect } from 'react';
import Column from './Column';
import CardModal from './CardModal';
import { mockColumns, mockCards, mockUsers, mockTags, getUserById } from '../../data/mockData';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Plus, Eye, EyeOff, Bot, User, Filter, Search, RefreshCw } from 'lucide-react';
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
  const [filterSource, setFilterSource] = useState('all'); // 'all', 'human', 'ai'
  const [isPolling, setIsPolling] = useState(true);
  const [lastSync, setLastSync] = useState(new Date());

  // Simulated polling for sync
  useEffect(() => {
    if (!isPolling) return;
    
    const interval = setInterval(() => {
      setLastSync(new Date());
      // In real implementation, this would fetch from backend
      console.log('Polling for updates...');
    }, 5000);

    return () => clearInterval(interval);
  }, [isPolling]);

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const handleCloseModal = () => {
    setSelectedCard(null);
  };

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

  const handleDragStart = (card) => {
    setDraggedCard(card);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (columnId) => {
    setDragOverColumn(columnId);
  };

  const handleDrop = (columnId) => {
    if (draggedCard && draggedCard.columnId !== columnId) {
      setCards(cards.map(card => 
        card.id === draggedCard.id 
          ? { 
              ...card, 
              columnId, 
              version: card.version + 1,
              updatedAt: new Date().toISOString(),
              lastModifiedBy: 'user-1'
            } 
          : card
      ));
    }
    setDraggedCard(null);
    setDragOverColumn(null);
  };

  const handleUpdateCard = (updatedCard) => {
    setCards(cards.map(card => 
      card.id === updatedCard.id 
        ? { 
            ...updatedCard, 
            version: card.version + 1,
            updatedAt: new Date().toISOString()
          } 
        : card
    ));
    setSelectedCard(null);
  };

  const handleDeleteCard = (cardId) => {
    setCards(cards.filter(card => card.id !== cardId));
    setSelectedCard(null);
  };

  // Filter cards based on search and source filter
  const filteredCards = cards.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = filterSource === 'all' || card.source === filterSource;
    return matchesSearch && matchesSource;
  });

  const getCardsByColumn = (columnId) => {
    return filteredCards.filter(card => card.columnId === columnId);
  };

  // Watchers (mock)
  const watchers = mockUsers.slice(0, 5);

  return (
    <div className="h-full flex flex-col">
      {/* Board Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64 h-9 text-sm"
            />
          </div>

          {/* Source Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                {filterSource === 'all' ? 'All Sources' : filterSource === 'human' ? 'Human Tasks' : 'AI Tasks'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Filter by Source</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={filterSource === 'all'}
                onCheckedChange={() => setFilterSource('all')}
              >
                <span className="flex items-center gap-2">
                  All Sources
                </span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterSource === 'human'}
                onCheckedChange={() => setFilterSource('human')}
              >
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" /> Human Tasks
                </span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterSource === 'ai'}
                onCheckedChange={() => setFilterSource('ai')}
              >
                <span className="flex items-center gap-2">
                  <Bot className="w-4 h-4" /> AI Tasks
                </span>
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-4">
          {/* Sync Status */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <RefreshCw className={`w-4 h-4 ${isPolling ? 'animate-spin' : ''}`} />
            <span>Last sync: {lastSync.toLocaleTimeString()}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPolling(!isPolling)}
              className={isPolling ? 'text-teal-600' : 'text-gray-400'}
            >
              {isPolling ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
          </div>

          {/* Watchers */}
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-2">Watching:</span>
            <div className="flex -space-x-2">
              {watchers.map((user, index) => (
                <Avatar key={user.id} className="w-7 h-7 border-2 border-white">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-[10px]">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
              {watchers.length > 5 && (
                <div className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-medium text-gray-600">
                  +{watchers.length - 5}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Board Columns */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 h-full">
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
          <button className="min-w-[300px] h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50/50 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" />
            Add column
          </button>
        </div>
      </div>

      {/* Card Modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={handleCloseModal}
          onUpdate={handleUpdateCard}
          onDelete={handleDeleteCard}
        />
      )}
    </div>
  );
};

export default Board;
