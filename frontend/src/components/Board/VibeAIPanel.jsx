import React, { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { ScrollArea } from '../ui/scroll-area';
import {
  Bot,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  Terminal,
  GitBranch,
  FileCode,
  MessageSquare,
  Loader2,
  Zap,
  Activity,
} from 'lucide-react';
import { mockCards, mockUsers, getUserById, formatRelativeTime } from '../../data/mockData';

const ExecutionStatus = {
  IDLE: 'idle',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  PAUSED: 'paused',
};

const statusConfig = {
  [ExecutionStatus.IDLE]: { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Idle' },
  [ExecutionStatus.RUNNING]: { color: 'bg-blue-100 text-blue-700', icon: Loader2, label: 'Running', animate: true },
  [ExecutionStatus.COMPLETED]: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Completed' },
  [ExecutionStatus.FAILED]: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Failed' },
  [ExecutionStatus.PAUSED]: { color: 'bg-yellow-100 text-yellow-700', icon: Pause, label: 'Paused' },
};

const mockExecutions = [
  {
    id: 'exec-1',
    cardId: 'card-3001',
    agentId: 'ai-claude',
    status: ExecutionStatus.RUNNING,
    progress: 65,
    startedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    logs: [
      { time: '10:05:23', type: 'info', message: 'Starting task execution...' },
      { time: '10:05:25', type: 'info', message: 'Analyzing codebase structure' },
      { time: '10:06:01', type: 'success', message: 'Found 23 relevant files' },
      { time: '10:07:15', type: 'info', message: 'Implementing JWT middleware...' },
      { time: '10:10:00', type: 'info', message: 'Writing authentication logic' },
    ],
    branch: 'feat/jwt-auth-middleware',
    filesChanged: 5,
  },
  {
    id: 'exec-2',
    cardId: 'card-3002',
    agentId: 'ai-gpt',
    status: ExecutionStatus.COMPLETED,
    progress: 100,
    startedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    logs: [
      { time: '09:15:00', type: 'info', message: 'Starting database optimization' },
      { time: '09:20:15', type: 'success', message: 'Added indexes to cards collection' },
      { time: '09:25:30', type: 'success', message: 'Optimized aggregate queries' },
      { time: '09:45:00', type: 'success', message: 'Task completed successfully' },
    ],
    branch: 'feat/db-optimization',
    filesChanged: 3,
  },
  {
    id: 'exec-3',
    cardId: 'card-3003',
    agentId: 'ai-claude',
    status: ExecutionStatus.COMPLETED,
    progress: 100,
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    logs: [
      { time: '08:00:00', type: 'info', message: 'Writing unit tests for card operations' },
      { time: '08:15:00', type: 'success', message: 'Created 15 test cases' },
      { time: '08:30:00', type: 'success', message: 'All tests passing' },
    ],
    branch: 'test/card-crud-tests',
    filesChanged: 2,
  },
];

const AITaskCard = ({ card, execution, isSelected, onClick }) => {
  const agent = getUserById(execution?.agentId);
  const status = execution?.status || ExecutionStatus.IDLE;
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div
      onClick={onClick}
      className={`
        p-2 md:p-3 rounded-lg border cursor-pointer transition-all
        ${isSelected ? 'border-purple-400 bg-purple-50/50 shadow-sm' : 'border-gray-200 bg-white hover:border-purple-200'}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 md:gap-2 mb-1 flex-wrap">
            <span className="text-[10px] md:text-xs font-mono text-gray-400">#{card.number}</span>
            <Badge className={`${config.color} text-[8px] md:text-[10px] gap-1 px-1.5`}>
              <StatusIcon className={`w-2.5 h-2.5 md:w-3 md:h-3 ${config.animate ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{config.label}</span>
            </Badge>
          </div>
          <h4 className="text-xs md:text-sm font-medium text-gray-900 line-clamp-2">{card.title}</h4>
        </div>
        {agent && (
          <Avatar className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0">
            <AvatarImage src={agent.avatar} />
            <AvatarFallback className="text-[6px] md:text-[8px] bg-purple-100">
              {agent.name[0]}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
      {execution && status === ExecutionStatus.RUNNING && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-[10px] md:text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{execution.progress}%</span>
          </div>
          <Progress value={execution.progress} className="h-1 md:h-1.5" />
        </div>
      )}
      {execution?.branch && (
        <div className="mt-2 flex items-center gap-1 text-[10px] md:text-xs text-gray-500">
          <GitBranch className="w-2.5 h-2.5 md:w-3 md:h-3" />
          <span className="truncate">{execution.branch}</span>
        </div>
      )}
    </div>
  );
};

const ExecutionLogs = ({ execution }) => {
  if (!execution) return null;

  const logTypeColors = {
    info: 'text-blue-400',
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
  };

  return (
    <div className="bg-gray-900 rounded-lg p-2 md:p-3 font-mono text-[10px] md:text-xs">
      <div className="flex items-center gap-2 mb-2 text-gray-400">
        <Terminal className="w-3 h-3 md:w-4 md:h-4" />
        <span>Execution Logs</span>
      </div>
      <ScrollArea className="h-24 md:h-32">
        <div className="space-y-1">
          {execution.logs.map((log, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-gray-500 flex-shrink-0">{log.time}</span>
              <span className={`${logTypeColors[log.type] || 'text-gray-300'} break-all`}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

const AgentProfile = ({ agent, isActive }) => {
  if (!agent) return null;

  return (
    <div className={`
      flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg border transition-all
      ${isActive ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-gray-50'}
    `}>
      <div className="relative">
        <Avatar className="w-8 h-8 md:w-10 md:h-10">
          <AvatarImage src={agent.avatar} />
          <AvatarFallback className="bg-purple-200 text-xs">{agent.name[0]}</AvatarFallback>
        </Avatar>
        {isActive && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
            <Activity className="w-1.5 h-1.5 md:w-2 md:h-2 text-white" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <h4 className="font-medium text-gray-900 text-sm md:text-base truncate">{agent.name}</h4>
        <p className="text-[10px] md:text-xs text-gray-500">
          {isActive ? 'Currently working' : 'Available'}
        </p>
      </div>
    </div>
  );
};

const VibeAIPanel = ({ onCardSelect }) => {
  const [selectedExecution, setSelectedExecution] = useState(mockExecutions[0]);
  
  const aiTasks = mockCards.filter(card => card.source === 'ai');
  const aiAgents = mockUsers.filter(user => user.isAI);
  const getExecution = (cardId) => mockExecutions.find(e => e.cardId === cardId);
  const activeExecutions = mockExecutions.filter(e => e.status === ExecutionStatus.RUNNING);
  const completedToday = mockExecutions.filter(e => e.status === ExecutionStatus.COMPLETED).length;

  const handleTaskClick = (card) => {
    const execution = getExecution(card.id);
    setSelectedExecution(execution);
    onCardSelect?.(card);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-3 md:p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 md:p-1.5 bg-purple-100 rounded-lg">
              <Bot className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm md:text-base">AI Vibe Board</h2>
              <p className="text-[10px] md:text-xs text-gray-500">Agent task execution view</p>
            </div>
          </div>
          <Badge className="bg-purple-100 text-purple-700 text-[10px] md:text-xs">
            <Zap className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1" />
            {activeExecutions.length} Active
          </Badge>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-1.5 md:p-2 bg-blue-50 rounded-lg text-center">
            <div className="text-base md:text-lg font-semibold text-blue-700">{activeExecutions.length}</div>
            <div className="text-[8px] md:text-[10px] text-blue-600">Running</div>
          </div>
          <div className="p-1.5 md:p-2 bg-green-50 rounded-lg text-center">
            <div className="text-base md:text-lg font-semibold text-green-700">{completedToday}</div>
            <div className="text-[8px] md:text-[10px] text-green-600">Completed</div>
          </div>
          <div className="p-1.5 md:p-2 bg-purple-50 rounded-lg text-center">
            <div className="text-base md:text-lg font-semibold text-purple-700">{aiTasks.length}</div>
            <div className="text-[8px] md:text-[10px] text-purple-600">Total Tasks</div>
          </div>
        </div>
      </div>

      {/* Agent Profiles */}
      <div className="p-3 md:p-4 border-b border-gray-200">
        <h3 className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase mb-2">AI Agents</h3>
        <div className="space-y-2">
          {aiAgents.map(agent => (
            <AgentProfile
              key={agent.id}
              agent={agent}
              isActive={activeExecutions.some(e => e.agentId === agent.id)}
            />
          ))}
        </div>
      </div>

      {/* Task Queue */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="p-3 md:p-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase">Task Queue</h3>
        </div>
        <ScrollArea className="flex-1 p-3 md:p-4">
          <div className="space-y-2">
            {aiTasks.map(card => (
              <AITaskCard
                key={card.id}
                card={card}
                execution={getExecution(card.id)}
                isSelected={selectedExecution?.cardId === card.id}
                onClick={() => handleTaskClick(card)}
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Execution Details */}
      {selectedExecution && (
        <div className="p-3 md:p-4 border-t border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <h3 className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase">Execution Details</h3>
            {selectedExecution.filesChanged && (
              <Badge variant="outline" className="text-[10px] md:text-xs gap-1">
                <FileCode className="w-2.5 h-2.5 md:w-3 md:h-3" />
                {selectedExecution.filesChanged} files
              </Badge>
            )}
          </div>
          <ExecutionLogs execution={selectedExecution} />
          
          {/* Action Buttons */}
          <div className="flex gap-2 mt-2 md:mt-3">
            {selectedExecution.status === ExecutionStatus.RUNNING ? (
              <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs h-8">
                <Pause className="w-3 h-3" /> Pause
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs h-8">
                <Play className="w-3 h-3" /> Resume
              </Button>
            )}
            <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs h-8">
              <MessageSquare className="w-3 h-3" /> <span className="hidden sm:inline">View</span> Details
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VibeAIPanel;
