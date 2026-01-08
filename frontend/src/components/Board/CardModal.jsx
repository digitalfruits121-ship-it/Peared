import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { mockUsers, mockTags, mockColumns, getUserById, getTagById, formatRelativeTime } from '../../data/mockData';
import { X, Trash2, Bot, User, Clock, MessageSquare, Tag, Users, Columns, History } from 'lucide-react';

const tagColors = {
  teal: 'bg-teal-500 text-white',
  purple: 'bg-purple-500 text-white',
  red: 'bg-red-500 text-white',
  blue: 'bg-blue-500 text-white',
  orange: 'bg-orange-500 text-white',
  green: 'bg-green-500 text-white',
  pink: 'bg-pink-500 text-white',
  gray: 'bg-gray-500 text-white',
};

const CardModal = ({ card, onClose, onUpdate, onDelete }) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [columnId, setColumnId] = useState(card.columnId);
  const [assigneeId, setAssigneeId] = useState(card.assigneeId);
  const [selectedTags, setSelectedTags] = useState(card.tags);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(card.comments || []);

  const creator = getUserById(card.creatorId);
  const lastModifier = getUserById(card.lastModifiedBy);
  const isAICard = card.source === 'ai';

  const handleSave = () => {
    onUpdate({
      ...card,
      title,
      description,
      columnId,
      assigneeId: assigneeId || null,
      tags: selectedTags,
      comments,
      lastModifiedBy: 'user-1',
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment = {
      id: `comment-${Date.now()}`,
      text: newComment,
      authorId: 'user-1',
      createdAt: new Date().toISOString(),
    };
    setComments([...comments, comment]);
    setNewComment('');
  };

  const toggleTag = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-[95vw] md:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-4 md:p-6 pb-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs md:text-sm font-mono text-gray-400">#{card.number}</span>
            {isAICard ? (
              <Badge className="bg-purple-100 text-purple-700 gap-1 text-xs">
                <Bot className="w-3 h-3" /> AI Task
              </Badge>
            ) : (
              <Badge className="bg-teal-100 text-teal-700 gap-1 text-xs">
                <User className="w-3 h-3" /> Human Task
              </Badge>
            )}
          </div>
          <DialogTitle className="text-left mt-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg md:text-xl font-semibold border-0 px-0 focus-visible:ring-0 h-auto"
            />
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pb-4">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-4 md:space-y-6">
              {/* Description */}
              <div>
                <label className="text-xs md:text-sm font-medium text-gray-700 mb-2 block">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description..."
                  className="min-h-[80px] md:min-h-[120px] text-sm"
                />
              </div>

              {/* Comments */}
              <div>
                <label className="text-xs md:text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4" /> Comments
                </label>
                <div className="space-y-2 md:space-y-3 mb-3 md:mb-4">
                  {comments.map((comment) => {
                    const author = getUserById(comment.authorId);
                    return (
                      <div key={comment.id} className="flex gap-2 md:gap-3 p-2 md:p-3 bg-gray-50 rounded-lg">
                        <Avatar className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0">
                          <AvatarImage src={author?.avatar} />
                          <AvatarFallback className="text-[8px] md:text-xs">
                            {author?.name?.split(' ').map(n => n[0]).join('') || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs md:text-sm font-medium">{author?.name || 'Unknown'}</span>
                            <span className="text-[10px] md:text-xs text-gray-400">
                              {formatRelativeTime(comment.createdAt)}
                            </span>
                            {author?.isAI && <Bot className="w-3 h-3 text-purple-500" />}
                          </div>
                          <p className="text-xs md:text-sm text-gray-600 mt-1 break-words">{comment.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    className="text-sm"
                  />
                  <Button onClick={handleAddComment} variant="outline" size="sm">
                    Post
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 md:space-y-6">
              {/* Status */}
              <div>
                <label className="text-xs md:text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Columns className="w-3.5 h-3.5 md:w-4 md:h-4" /> Status
                </label>
                <Select value={columnId} onValueChange={setColumnId}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockColumns.map((col) => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assignee */}
              <div>
                <label className="text-xs md:text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 md:w-4 md:h-4" /> Assignee
                </label>
                <Select value={assigneeId || 'unassigned'} onValueChange={(val) => setAssigneeId(val === 'unassigned' ? null : val)}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {mockUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <span className="flex items-center gap-2">
                          {user.name}
                          {user.isAI && <Bot className="w-3 h-3 text-purple-500" />}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs md:text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 md:w-4 md:h-4" /> Tags
                </label>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {mockTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      className={`cursor-pointer transition-opacity text-[10px] md:text-xs ${tagColors[tag.color]} ${selectedTags.includes(tag.id) ? 'opacity-100' : 'opacity-40'}`}
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              <div className="pt-3 md:pt-4 border-t border-gray-200 space-y-2 md:space-y-3">
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                  <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span>Created {formatRelativeTime(card.createdAt)}</span>
                </div>
                {creator && (
                  <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                    <span>by</span>
                    <Avatar className="w-4 h-4 md:w-5 md:h-5">
                      <AvatarImage src={creator.avatar} />
                      <AvatarFallback className="text-[6px] md:text-[8px]">
                        {creator.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{creator.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                  <History className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span>Version {card.version}</span>
                </div>
                {lastModifier && (
                  <div className="text-[10px] md:text-xs text-gray-400">
                    Last modified by {lastModifier.name}
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 md:p-6 pt-4 border-t border-gray-200 bg-white">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(card.id)}
            className="gap-1 md:gap-2 text-xs md:text-sm"
          >
            <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} size="sm" className="text-xs md:text-sm">
              Cancel
            </Button>
            <Button onClick={handleSave} size="sm" className="bg-teal-500 hover:bg-teal-600 text-xs md:text-sm">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardModal;
