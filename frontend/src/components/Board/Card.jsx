import React from 'react';
import { getUserById, getTagById, formatRelativeTime } from '../../data/mockData';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Bot, Clock, ArrowRight } from 'lucide-react';

const tagColors = {
  teal: 'bg-lime-500 text-white',
  purple: 'bg-purple-500 text-white',
  red: 'bg-red-500 text-white',
  blue: 'bg-blue-500 text-white',
  orange: 'bg-orange-500 text-white',
  green: 'bg-green-500 text-white',
  pink: 'bg-pink-500 text-white',
  gray: 'bg-gray-500 text-white',
};

const Card = ({ card, onClick, isDragging }) => {
  const creator = getUserById(card.creatorId);
  const assignee = card.assigneeId ? getUserById(card.assigneeId) : null;
  const tags = card.tags.map(tagId => getTagById(tagId)).filter(Boolean);
  const isAICard = card.source === 'ai';

  return (
    <div
      onClick={() => onClick?.(card)}
      className={`
        bg-white rounded-lg border border-lime-100 p-3 md:p-4 cursor-pointer
        transition-all duration-200 hover:shadow-md hover:border-lime-300
        ${isDragging ? 'shadow-lg rotate-2 opacity-90' : ''}
        ${isAICard ? 'border-l-4 border-l-purple-400' : 'border-l-4 border-l-lime-400'}
      `}
    >
      {/* Card Header */}
      <div className="flex items-center gap-1.5 md:gap-2 mb-2 flex-wrap">
        <span className="text-[10px] md:text-xs font-mono text-lime-600 font-semibold">
          {card.number}
        </span>
        {tags.slice(0, 2).map(tag => (
          <Badge key={tag.id} className={`${tagColors[tag.color]} text-[8px] md:text-[10px] font-semibold px-1.5 md:px-2 py-0.5 rounded`}>
            {tag.name}
          </Badge>
        ))}
        {tags.length > 2 && <Badge variant="outline" className="text-[8px] md:text-[10px]">+{tags.length - 2}</Badge>}
        {isAICard ? (
          <span className="ml-auto text-sm">🤖</span>
        ) : (
          <span className="ml-auto text-sm">🍐</span>
        )}
      </div>

      {/* Card Title */}
      <h3 className="text-xs md:text-sm font-medium text-gray-900 mb-2 md:mb-3 leading-snug line-clamp-2">
        {card.title}
      </h3>

      {/* Card Footer */}
      <div className="flex items-center justify-between text-[10px] md:text-xs text-gray-500">
        <div className="flex items-center gap-1.5 md:gap-2">
          {creator && (
            <Avatar className="w-4 h-4 md:w-5 md:h-5">
              <AvatarImage src={creator.avatar} alt={creator.name} />
              <AvatarFallback className="text-[6px] md:text-[8px] bg-lime-100 text-lime-700">
                {creator.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          )}
          <span className="text-lime-600 hidden sm:inline">{formatRelativeTime(card.createdAt)}</span>
          <Clock className="w-2.5 h-2.5 md:w-3 md:h-3 text-lime-400" />
          <span className="text-lime-600">{formatRelativeTime(card.updatedAt)}</span>
        </div>

        <div className="flex items-center gap-1">
          {assignee && (
            <>
              <ArrowRight className="w-2.5 h-2.5 md:w-3 md:h-3 text-lime-400 hidden sm:block" />
              <span className="text-lime-600 font-medium hidden sm:inline">{assignee.name.split(' ')[0]}</span>
              <Avatar className="w-4 h-4 md:w-5 md:h-5">
                <AvatarImage src={assignee.avatar} alt={assignee.name} />
                <AvatarFallback className="text-[6px] md:text-[8px] bg-lime-100">
                  {assignee.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </>
          )}
        </div>
      </div>

      {/* Version indicator */}
      {card.version > 1 && (
        <div className="mt-2 pt-2 border-t border-lime-100">
          <span className="text-[8px] md:text-[10px] text-lime-500">
            v{card.version} • {getUserById(card.lastModifiedBy)?.name || 'Unknown'}
          </span>
        </div>
      )}
    </div>
  );
};

export default Card;
