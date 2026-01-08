import React, { useState } from 'react';
import Board from '../components/Board/Board';
import VibeAIPanel from '../components/Board/VibeAIPanel';
import FileRepository from '../components/Files/FileRepository';
import { mockBoards } from '../data/mockData';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet';
import {
  User,
  Bot,
  Split,
  FolderOpen,
  PanelRightOpen,
  PanelRightClose,
  X,
} from 'lucide-react';

const SplitBoardPage = () => {
  const board = mockBoards[0];
  const [viewMode, setViewMode] = useState('human'); // Default to human on mobile
  const [showFiles, setShowFiles] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showAIPanel, setShowAIPanel] = useState(false);

  const handleCardSelect = (card) => {
    setSelectedCard(card);
  };

  return (
    <div className="h-[calc(100vh-56px)] md:h-[calc(100vh-64px)] flex flex-col">
      {/* Board Header */}
      <div className="px-4 md:px-6 py-2 md:py-3 border-b border-gray-200 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-bold text-gray-900 truncate">{board.name}</h1>
            <p className="text-xs md:text-sm text-gray-500 truncate">{board.description}</p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Files Toggle - Desktop */}
            <Button
              variant={showFiles ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFiles(!showFiles)}
              className="hidden lg:flex gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              <span className="hidden xl:inline">Files</span>
              {showFiles ? (
                <PanelRightClose className="w-3.5 h-3.5" />
              ) : (
                <PanelRightOpen className="w-3.5 h-3.5" />
              )}
            </Button>

            {/* Mobile: Files Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden gap-1">
                  <FolderOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Files</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[400px] p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5" /> Files
                  </SheetTitle>
                </SheetHeader>
                <div className="h-[calc(100vh-80px)]">
                  <FileRepository cardId={selectedCard?.id} viewMode="full" />
                </div>
              </SheetContent>
            </Sheet>

            {/* Mobile: AI Panel Sheet */}
            <Sheet open={showAIPanel} onOpenChange={setShowAIPanel}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden gap-1">
                  <Bot className="w-4 h-4" />
                  <span className="hidden sm:inline">AI</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh] p-0 rounded-t-xl">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-purple-600" /> AI Vibe Board
                  </SheetTitle>
                </SheetHeader>
                <div className="h-[calc(80vh-80px)] overflow-auto">
                  <VibeAIPanel onCardSelect={handleCardSelect} />
                </div>
              </SheetContent>
            </Sheet>

            {/* View Mode Tabs - Desktop */}
            <Tabs value={viewMode} onValueChange={setViewMode} className="hidden md:block">
              <TabsList className="bg-gray-100 h-9">
                <TabsTrigger value="human" className="gap-1.5 text-xs px-3">
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Human</span>
                </TabsTrigger>
                <TabsTrigger value="split" className="gap-1.5 text-xs px-3">
                  <Split className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Split</span>
                </TabsTrigger>
                <TabsTrigger value="ai" className="gap-1.5 text-xs px-3">
                  <Bot className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">AI</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Mobile View Toggle */}
            <div className="flex md:hidden bg-gray-100 rounded-lg p-0.5">
              <Button
                variant={viewMode === 'human' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('human')}
                className="h-7 px-2"
              >
                <User className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'ai' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('ai')}
                className="h-7 px-2"
              >
                <Bot className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Split Board Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Human Fizzy Board */}
        {(viewMode === 'split' || viewMode === 'human') && (
          <div className={`
            ${viewMode === 'split' ? (showFiles ? 'w-1/2' : 'w-2/3') : (showFiles ? 'w-2/3' : 'w-full')}
            ${viewMode === 'split' ? 'border-r border-gray-200' : ''}
            bg-gradient-to-br from-white via-pink-50/30 to-purple-50/30
            overflow-hidden transition-all duration-300
          `}>
            <div className="h-full flex flex-col">
              {viewMode === 'split' && (
                <div className="hidden md:flex px-4 py-2 bg-teal-50 border-b border-teal-100 items-center gap-2">
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

        {/* AI Vibe Panel - Desktop */}
        {(viewMode === 'split' || viewMode === 'ai') && (
          <div className={`
            hidden md:block
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

        {/* AI Vibe Panel - Mobile (when viewMode is 'ai') */}
        {viewMode === 'ai' && (
          <div className="md:hidden w-full overflow-hidden">
            <VibeAIPanel onCardSelect={handleCardSelect} />
          </div>
        )}

        {/* File Repository Panel - Desktop only */}
        {showFiles && (
          <div className={`
            hidden lg:block
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
