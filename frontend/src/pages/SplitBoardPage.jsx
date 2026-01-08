import React, { useState } from 'react';
import Board from '../components/Board/Board';
import VibeAIPanel from '../components/Board/VibeAIPanel';
import FileRepository from '../components/Files/FileRepository';
import { mockBoards } from '../data/mockData';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  User,
  Bot,
  Split,
  FolderOpen,
  PanelRightOpen,
  PanelRightClose,
} from 'lucide-react';

const SplitBoardPage = () => {
  const board = mockBoards[0];
  const [viewMode, setViewMode] = useState('split'); // 'split', 'human', 'ai'
  const [showFiles, setShowFiles] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const handleCardSelect = (card) => {
    setSelectedCard(card);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Board Header */}
      <div className="px-6 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{board.name}</h1>
          <p className="text-sm text-gray-500">{board.description}</p>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center gap-4">
          {/* Files Toggle */}
          <Button
            variant={showFiles ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFiles(!showFiles)}
            className="gap-2"
          >
            <FolderOpen className="w-4 h-4" />
            Files
            {showFiles ? (
              <PanelRightClose className="w-3.5 h-3.5" />
            ) : (
              <PanelRightOpen className="w-3.5 h-3.5" />
            )}
          </Button>

          <Tabs value={viewMode} onValueChange={setViewMode}>
            <TabsList className="bg-gray-100">
              <TabsTrigger value="human" className="gap-2 text-xs">
                <User className="w-3.5 h-3.5" />
                Human View
              </TabsTrigger>
              <TabsTrigger value="split" className="gap-2 text-xs">
                <Split className="w-3.5 h-3.5" />
                Split View
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-2 text-xs">
                <Bot className="w-3.5 h-3.5" />
                AI View
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Split Board Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Human Fizzy Board */}
        {(viewMode === 'split' || viewMode === 'human') && (
          <div className={`
            ${viewMode === 'split' ? (showFiles ? 'w-1/2' : 'w-2/3') : (showFiles ? 'w-2/3' : 'w-full')}
            border-r border-gray-200
            bg-gradient-to-br from-white via-pink-50/30 to-purple-50/30
            overflow-hidden transition-all duration-300
          `}>
            <div className="h-full flex flex-col">
              {viewMode === 'split' && (
                <div className="px-4 py-2 bg-teal-50 border-b border-teal-100 flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-medium text-teal-700">Human Fizzy Board</span>
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <Board boardId={board.id} />
              </div>
            </div>
          </div>
        )}

        {/* AI Vibe Panel */}
        {(viewMode === 'split' || viewMode === 'ai') && (
          <div className={`
            ${viewMode === 'split' ? (showFiles ? 'w-1/4' : 'w-1/3') : (showFiles ? 'w-2/3' : 'w-full')}
            overflow-hidden transition-all duration-300
            ${showFiles ? 'border-r border-gray-200' : ''}
          `}>
            <div className="h-full flex flex-col">
              {viewMode === 'split' && (
                <div className="px-4 py-2 bg-purple-50 border-b border-purple-100 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">AI Vibe Board</span>
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <VibeAIPanel onCardSelect={handleCardSelect} />
              </div>
            </div>
          </div>
        )}

        {/* File Repository Panel */}
        {showFiles && (
          <div className={`
            ${viewMode === 'split' ? 'w-1/4' : 'w-1/3'}
            overflow-hidden transition-all duration-300 bg-gray-50
          `}>
            <div className="h-full flex flex-col">
              <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">File Repository</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <FileRepository cardId={selectedCard?.id} viewMode="full" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SplitBoardPage;
