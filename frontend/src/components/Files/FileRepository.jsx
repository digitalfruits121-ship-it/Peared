import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import {
  FolderOpen,
  FileText,
  FileJson,
  FileCode,
  Image,
  Upload,
  Plus,
  MoreVertical,
  Trash2,
  Edit,
  Download,
  Link,
  Eye,
  Bot,
  User,
  Search,
  X,
  Camera,
  Clipboard,
  Check,
} from 'lucide-react';
import { Textarea } from '../ui/textarea';

// Mock files data
const mockFiles = [
  {
    id: 'file-1',
    name: 'project-spec.md',
    type: 'markdown',
    content: '# Project Specification\n\n## Overview\nThis is the main project specification document.\n\n## Features\n- Human Kanban Board (Fizzy style)\n- AI Kanban Board (Vibe style)\n- Real-time sync between boards\n- Version control with CRDT\n\n## API Endpoints\nSee `/api/docs` for full API documentation.',
    size: 1240,
    linkedCards: ['card-3001'],
    scope: 'project',
    createdBy: 'user-1',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'file-2',
    name: 'instruct.md',
    type: 'markdown',
    content: '# AI Instructions\n\n## Task Handling\n1. Always check for existing tests before modifying code\n2. Update documentation after changes\n3. Create atomic commits\n\n## Code Style\n- Use TypeScript for frontend\n- Follow PEP8 for Python backend\n- Add JSDoc comments for functions',
    size: 890,
    linkedCards: [],
    scope: 'project',
    createdBy: 'user-1',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'file-3',
    name: 'api-config.json',
    type: 'json',
    content: JSON.stringify({
      "endpoints": {
        "boards": "/api/boards",
        "cards": "/api/cards",
        "ai": "/api/ai"
      },
      "polling": {
        "interval": 5000,
        "enabled": true
      },
      "ai_access": {
        "read": true,
        "write": true
      }
    }, null, 2),
    size: 450,
    linkedCards: ['card-3001', 'card-3002'],
    scope: 'project',
    createdBy: 'ai-claude',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'file-4',
    name: 'auth-flow.png',
    type: 'image',
    content: 'https://via.placeholder.com/800x400/1a1a2e/39FF14?text=Authentication+Flow+Diagram',
    size: 24500,
    linkedCards: ['card-3001'],
    scope: 'task',
    cardId: 'card-3001',
    createdBy: 'user-2',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'file-5',
    name: 'newinstruct.json',
    type: 'json',
    content: JSON.stringify({
      "task_id": "card-3002",
      "instructions": [
        "Analyze current query performance",
        "Add indexes for frequently accessed fields",
        "Implement query caching where appropriate",
        "Write performance benchmarks"
      ],
      "constraints": {
        "max_query_time_ms": 100,
        "cache_ttl_seconds": 300
      },
      "priority": "high"
    }, null, 2),
    size: 380,
    linkedCards: ['card-3002'],
    scope: 'task',
    cardId: 'card-3002',
    createdBy: 'user-1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const fileTypeIcons = {
  markdown: FileText,
  json: FileJson,
  code: FileCode,
  image: Image,
};

const fileTypeColors = {
  markdown: 'text-blue-400',
  json: 'text-yellow-400',
  code: 'text-neon-400',
  image: 'text-purple-400',
};

const FileItem = ({ file, isSelected, onClick, onDelete, onLink, viewMode }) => {
  const Icon = fileTypeIcons[file.type] || FileText;
  const colorClass = fileTypeColors[file.type] || 'text-gray-400';
  const isAICreated = file.createdBy?.startsWith('ai-');

  if (viewMode === 'compact') {
    return (
      <div
        onClick={() => onClick(file)}
        className={`
          flex items-center gap-2 p-2 rounded cursor-pointer transition-all text-sm
          ${isSelected ? 'bg-purple-500/20 border-purple-500/50' : 'hover:bg-gray-800'}
        `}
      >
        <Icon className={`w-4 h-4 ${colorClass}`} />
        <span className="truncate flex-1 text-gray-300">{file.name}</span>
        {isAICreated && <Bot className="w-3 h-3 text-purple-400" />}
      </div>
    );
  }

  return (
    <div
      onClick={() => onClick(file)}
      className={`
        p-3 rounded-lg border cursor-pointer transition-all
        ${isSelected ? 'border-amber-500/50 bg-amber-500/10' : 'border-gray-700 hover:border-amber-500/30 bg-gray-800/50'}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${colorClass}`} />
          <div>
            <h4 className="font-medium text-sm text-white">{file.name}</h4>
            <p className="text-xs text-gray-500">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-amber-400">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-gray-900 border-amber-500/30">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick(file); }} className="text-gray-300 hover:text-amber-400">
              <Eye className="w-4 h-4 mr-2" /> View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onLink?.(file); }} className="text-gray-300 hover:text-amber-400">
              <Link className="w-4 h-4 mr-2" /> Link to Card
            </DropdownMenuItem>
            <DropdownMenuItem className="text-gray-300 hover:text-amber-400">
              <Download className="w-4 h-4 mr-2" /> Download
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem
              className="text-red-400 hover:bg-red-500/10"
              onClick={(e) => { e.stopPropagation(); onDelete?.(file.id); }}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-2 flex items-center gap-2">
        {file.scope === 'project' && (
          <Badge variant="outline" className="text-[10px] border-gray-600 text-gray-400">
            Project
          </Badge>
        )}
        {file.scope === 'task' && (
          <Badge variant="outline" className="text-[10px] bg-blue-500/10 border-blue-500/30 text-blue-400">
            Task
          </Badge>
        )}
        {file.linkedCards?.length > 0 && (
          <Badge variant="outline" className="text-[10px] border-gray-600 text-gray-400">
            <Link className="w-2.5 h-2.5 mr-1" />
            {file.linkedCards.length}
          </Badge>
        )}
        {isAICreated && (
          <Badge className="bg-purple-500/20 text-purple-400 text-[10px] border border-purple-500/30">
            <Bot className="w-2.5 h-2.5 mr-1" /> AI
          </Badge>
        )}
      </div>
    </div>
  );
};

const FileViewer = ({ file, onEdit, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(file?.content || '');
  const [copied, setCopied] = useState(false);

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50 text-amber-500/50" />
          <p>Select a file to view</p>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onEdit?.(file.id, content);
    setIsEditing(false);
  };

  const renderContent = () => {
    if (file.type === 'image') {
      return (
        <div className="flex items-center justify-center p-4">
          <img
            src={file.content}
            alt={file.name}
            className="max-w-full max-h-[400px] rounded-lg shadow-lg border border-gray-700"
          />
        </div>
      );
    }

    if (isEditing) {
      return (
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="font-mono text-sm h-[400px] resize-none bg-gray-800 border-neon-500/30 text-white"
        />
      );
    }

    return (
      <ScrollArea className="h-[400px]">
        <pre className="p-4 bg-gray-950 rounded-lg text-sm font-mono whitespace-pre-wrap text-gray-300 border border-gray-800">
          {content}
        </pre>
      </ScrollArea>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          {React.createElement(fileTypeIcons[file.type] || FileText, {
            className: `w-5 h-5 ${fileTypeColors[file.type]}`
          })}
          <h3 className="font-medium text-white">{file.name}</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleCopy} className="text-gray-400 hover:text-neon-400">
            {copied ? <Check className="w-4 h-4 text-neon-400" /> : <Clipboard className="w-4 h-4" />}
          </Button>
          {file.type !== 'image' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="text-gray-400 hover:text-neon-400"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-red-400">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 overflow-hidden">
        {renderContent()}
      </div>

      {/* Footer */}
      {isEditing && (
        <div className="p-3 border-t border-gray-700 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} className="border-gray-600 text-gray-400">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} className="bg-neon-500 hover:bg-neon-600 text-black">
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
};

const CreateFileDialog = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('markdown');
  const [content, setContent] = useState('');
  const [scope, setScope] = useState('project');

  const templates = {
    markdown: '# Title\n\n## Section 1\n\nContent here...\n\n## Section 2\n\nMore content...',
    json: JSON.stringify({ "key": "value" }, null, 2),
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate({
      name: name.includes('.') ? name : `${name}.${type === 'markdown' ? 'md' : 'json'}`,
      type,
      content: content || templates[type] || '',
      scope,
    });
    onClose();
  };

  return (
    <DialogContent className="max-w-lg bg-gray-900 border-amber-500/30">
      <DialogHeader>
        <DialogTitle className="text-amber-400">Create New File</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 mt-4">
        <div>
          <label className="text-sm font-medium text-gray-300">File Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., instruct.md or config.json"
            className="mt-1 bg-gray-800 border-amber-500/30 text-white"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300">File Type</label>
          <div className="flex gap-2 mt-1">
            <Button
              variant={type === 'markdown' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setType('markdown')}
              className={`gap-2 ${type === 'markdown' ? 'bg-amber-500 text-black' : 'border-amber-500/30 text-amber-400'}`}
            >
              <FileText className="w-4 h-4" /> Markdown
            </Button>
            <Button
              variant={type === 'json' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setType('json')}
              className={`gap-2 ${type === 'json' ? 'bg-amber-500 text-black' : 'border-amber-500/30 text-amber-400'}`}
            >
              <FileJson className="w-4 h-4" /> JSON
            </Button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300">Scope</label>
          <div className="flex gap-2 mt-1">
            <Button
              variant={scope === 'project' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setScope('project')}
              className={scope === 'project' ? 'bg-amber-500 text-black' : 'border-gray-600 text-gray-400'}
            >
              Project-wide
            </Button>
            <Button
              variant={scope === 'task' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setScope('task')}
              className={scope === 'task' ? 'bg-amber-500 text-black' : 'border-gray-600 text-gray-400'}
            >
              Task-specific
            </Button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300">Initial Content (optional)</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={templates[type]}
            className="mt-1 font-mono text-sm h-32 bg-gray-800 border-amber-500/30 text-white"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="border-gray-600 text-gray-400">Cancel</Button>
          <Button onClick={handleCreate} className="bg-amber-500 hover:bg-amber-600 text-black">
            Create File
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

const FileRepository = ({ cardId = null, viewMode = 'full' }) => {
  const [files, setFiles] = useState(mockFiles);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const fileInputRef = useRef(null);

  // Filter files based on card context and search
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'project' && file.scope === 'project') ||
      (activeTab === 'task' && file.scope === 'task') ||
      (activeTab === 'linked' && cardId && file.linkedCards?.includes(cardId));
    return matchesSearch && matchesTab;
  });

  const handleCreateFile = (fileData) => {
    const newFile = {
      id: `file-${Date.now()}`,
      ...fileData,
      size: fileData.content?.length || 0,
      linkedCards: cardId ? [cardId] : [],
      createdBy: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setFiles([...files, newFile]);
    setSelectedFile(newFile);
  };

  const handleDeleteFile = (fileId) => {
    setFiles(files.filter(f => f.id !== fileId));
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }
  };

  const handleEditFile = (fileId, newContent) => {
    setFiles(files.map(f =>
      f.id === fileId
        ? { ...f, content: newContent, size: newContent.length, updatedAt: new Date().toISOString() }
        : f
    ));
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      const type = file.name.endsWith('.md') ? 'markdown' :
                   file.name.endsWith('.json') ? 'json' :
                   file.type.startsWith('image/') ? 'image' : 'code';
      
      const newFile = {
        id: `file-${Date.now()}`,
        name: file.name,
        type,
        content: type === 'image' ? content : content,
        size: file.size,
        linkedCards: cardId ? [cardId] : [],
        scope: cardId ? 'task' : 'project',
        createdBy: 'user-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setFiles([...files, newFile]);
      setSelectedFile(newFile);
    };

    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  if (viewMode === 'compact') {
    return (
      <div className="h-full flex flex-col bg-gray-900">
        <div className="p-2 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="pl-7 h-8 text-sm bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredFiles.map(file => (
              <FileItem
                key={file.id}
                file={file}
                isSelected={selectedFile?.id === file.id}
                onClick={setSelectedFile}
                viewMode="compact"
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-amber-500/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-amber-400" />
            <h2 className="font-semibold text-white">File Repository</h2>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleUpload}
              accept=".md,.json,.txt,.png,.jpg,.jpeg,.gif"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-1 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
            >
              <Upload className="w-4 h-4" /> Upload
            </Button>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1 bg-amber-500 hover:bg-amber-600 text-black">
                  <Plus className="w-4 h-4" /> New File
                </Button>
              </DialogTrigger>
              <CreateFileDialog
                onClose={() => setShowCreateDialog(false)}
                onCreate={handleCreateFile}
              />
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="pl-9 bg-gray-800 border-amber-500/30 text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-2">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start bg-gray-800 border border-amber-500/20">
            <TabsTrigger value="all" className="text-xs data-[state=active]:bg-amber-500 data-[state=active]:text-black text-gray-400">All Files</TabsTrigger>
            <TabsTrigger value="project" className="text-xs data-[state=active]:bg-amber-500 data-[state=active]:text-black text-gray-400">Project</TabsTrigger>
            <TabsTrigger value="task" className="text-xs data-[state=active]:bg-amber-500 data-[state=active]:text-black text-gray-400">Task</TabsTrigger>
            {cardId && <TabsTrigger value="linked" className="text-xs data-[state=active]:bg-amber-500 data-[state=active]:text-black text-gray-400">Linked</TabsTrigger>}
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File List */}
        <div className="w-1/2 border-r border-gray-700 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-2">
              {filteredFiles.map(file => (
                <FileItem
                  key={file.id}
                  file={file}
                  isSelected={selectedFile?.id === file.id}
                  onClick={setSelectedFile}
                  onDelete={handleDeleteFile}
                />
              ))}
              {filteredFiles.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No files found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* File Viewer */}
        <div className="w-1/2 overflow-hidden">
          <FileViewer
            file={selectedFile}
            onEdit={handleEditFile}
            onClose={() => setSelectedFile(null)}
          />
        </div>
      </div>
    </div>
  );
};

export default FileRepository;
