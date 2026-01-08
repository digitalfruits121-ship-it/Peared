import React, { useState } from 'react';
import Card from './Card';
import { Button } from '../ui/button';
import { Plus, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const Column = ({ column, cards, onCardClick, onAddCard, onDragStart, onDragEnd, onDragOver, onDrop, draggedCard }) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      onAddCard(column.id, newCardTitle.trim());
      setNewCardTitle('');
      setIsAddingCard(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddCard(); }
    else if (e.key === 'Escape') { setIsAddingCard(false); setNewCardTitle(''); }
  };

  return (
    <div
      className="flex flex-col bg-lime-50/60 rounded-xl min-w-[260px] md:min-w-[300px] max-w-[260px] md:max-w-[300px] h-fit max-h-[calc(100vh-220px)] md:max-h-[calc(100vh-200px)] flex-shrink-0 border border-lime-100"
      onDragOver={(e) => { e.preventDefault(); onDragOver?.(column.id); }}
      onDrop={(e) => { e.preventDefault(); onDrop?.(column.id); }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-3 md:px-4 py-2 md:py-3 border-b border-lime-100">
        <div className="flex items-center gap-2">
          <h2 className="text-xs md:text-sm font-semibold text-lime-800 uppercase tracking-wide">
            {column.name}
          </h2>
          <span className="bg-lime-200 text-lime-700 text-[10px] md:text-xs font-semibold px-1.5 md:px-2 py-0.5 rounded-full">
            {cards.length}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 md:h-7 md:w-7 text-lime-600 hover:bg-lime-100">
              <MoreHorizontal className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Sort by date</DropdownMenuItem>
            <DropdownMenuItem>Sort by priority</DropdownMenuItem>
            <DropdownMenuItem>Archive all</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Cards Container */}
      <div className="flex-1 overflow-y-auto p-2 md:p-3 space-y-2 md:space-y-3">
        {/* Add Card Form */}
        {isAddingCard ? (
          <div className="bg-white rounded-lg border border-lime-300 p-2 md:p-3 shadow-sm">
            <textarea
              autoFocus
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What needs to be done? 🍐"
              className="w-full text-sm resize-none border-0 focus:ring-0 focus:outline-none placeholder:text-lime-400"
              rows={2}
            />
            <div className="flex items-center gap-2 mt-2">
              <Button size="sm" onClick={handleAddCard} className="bg-lime-500 hover:bg-lime-600 text-white text-xs h-7 md:h-8">
                Add pear
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setIsAddingCard(false); setNewCardTitle(''); }} className="text-xs h-7 md:h-8 text-lime-600">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingCard(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 border-dashed border-lime-300 text-lime-500 hover:border-lime-400 hover:text-lime-600 hover:bg-lime-50 transition-colors text-xs md:text-sm font-medium"
          >
            <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
            Add a pear 🍐
          </button>
        )}

        {/* Card List */}
        {cards.map((card) => (
          <div
            key={card.id}
            draggable
            onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart?.(card); }}
            onDragEnd={() => onDragEnd?.()}
            className={`transition-opacity ${draggedCard?.id === card.id ? 'opacity-50' : ''}`}
          >
            <Card card={card} onClick={onCardClick} isDragging={draggedCard?.id === card.id} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Column;
