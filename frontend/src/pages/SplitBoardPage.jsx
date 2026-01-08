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
} from 'lucide-react';

const SplitBoardPage = () => {
  const board = mockBoards[0];
  const [viewMode, setViewMode] = useState('human');
  const [showFiles, setShowFiles] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showAIPanel, setShowAIPanel] = useState(false);

  const handleCardSelect = (card) => {
    setSelectedCard(card);
  };

  return (
    <div className="h-[calc(100vh-56px)] md:h-[calc(100vh-64px)] flex flex-col">
      {/* Board Header */}
      <div className="px-4 md:px-6 py-2 md:py-3 border-b border-lime-100 bg-gradient-to-r from-white to-lime-50/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">🍐</span>
              <h1 className="text-lg md:text-xl font-bold text-lime-800 truncate">{board.name}</h1>
            </div>
            <p className="text-xs md:text-sm text-lime-600 truncate">{board.description}</p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Files Toggle - Desktop */}
            <Button
              variant={showFiles ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFiles(!showFiles)}
              className={`hidden lg:flex gap-2 ${showFiles ? 'bg-amber-500 hover:bg-amber-600' : 'border-amber-300 text-amber-700 hover:bg-amber-50'}`}
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
                <Button variant="outline" size="sm" className="lg:hidden gap-1 border-amber-300 text-amber-700">
                  <FolderOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Files</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[400px] p-0">
                <SheetHeader className="p-4 border-b bg-amber-50">
                  <SheetTitle className="flex items-center gap-2 text-amber-800">
                    <FolderOpen className="w-5 h-5" /> Pear Files 🍐
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
                <Button variant="outline" size="sm" className="md:hidden gap-1 border-purple-300 text-purple-700">
                  <Bot className="w-4 h-4" />
                  <span className="hidden sm:inline">AI</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh] p-0 rounded-t-xl">
                <SheetHeader className="p-4 border-b bg-purple-50">
                  <SheetTitle className="flex items-center gap-2 text-purple-800">
                    <Bot className="w-5 h-5" /> AI Pair Partner 🤖
                  </SheetTitle>
                </SheetHeader>
                <div className="h-[calc(80vh-80px)] overflow-auto">
                  <VibeAIPanel onCardSelect={handleCardSelect} />
                </div>
              </SheetContent>
            </Sheet>

            {/* View Mode Tabs - Desktop */}
            <Tabs value={viewMode} onValueChange={setViewMode} className="hidden md:block">
              <TabsList className="bg-lime-100 h-9">
                <TabsTrigger value="human" className="gap-1.5 text-xs px-3 data-[state=active]:bg-lime-500 data-[state=active]:text-white">
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Human</span>
                </TabsTrigger>
                <TabsTrigger value="split" className="gap-1.5 text-xs px-3 data-[state=active]:bg-lime-500 data-[state=active]:text-white">
                  <Split className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Paired</span>
                </TabsTrigger>
                <TabsTrigger value="ai" className="gap-1.5 text-xs px-3 data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                  <Bot className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">AI</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Mobile View Toggle */}
            <div className="flex md:hidden bg-lime-100 rounded-lg p-0.5">
              <Button
                variant={viewMode === 'human' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('human')}
                className={`h-7 px-2 ${viewMode === 'human' ? 'bg-lime-500 text-white' : ''}`}
              >
                <User className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'ai' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('ai')}
                className={`h-7 px-2 ${viewMode === 'ai' ? 'bg-purple-500 text-white' : ''}`}
              >
                <Bot className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Split Board Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Human Board */}
        {(viewMode === 'split' || viewMode === 'human') && (
          <div className={`
            ${viewMode === 'split' ? (showFiles ? 'w-1/2' : 'w-2/3') : (showFiles ? 'w-2/3' : 'w-full')}
            ${viewMode === 'split' ? 'border-r border-lime-200' : ''}
            bg-gradient-to-br from-white via-lime-50/30 to-yellow-50/20
            overflow-hidden transition-all duration-300
          `}>
            <div className="h-full flex flex-col">
              {viewMode === 'split' && (
                <div className="hidden md:flex px-4 py-2 bg-lime-50 border-b border-lime-100 items-center gap-2">
                  <span className="text-lg">🍐</span>
                  <span className="text-sm font-medium text-lime-700">Human Pear Board</span>
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <Board boardId={board.id} />
              </div>
            </div>
          </div>
        )}

        {/* AI Panel - Desktop */}
        {(viewMode === 'split' || viewMode === 'ai') && (
          <div className={`
            hidden md:block
            ${viewMode === 'split' ? (showFiles ? 'w-1/4' : 'w-1/3') : (showFiles ? 'w-2/3' : 'w-full')}
            overflow-hidden transition-all duration-300
            ${showFiles ? 'border-r border-purple-200' : ''}
          `}>
            <div className="h-full flex flex-col">
              {viewMode === 'split' && (
                <div className="px-4 py-2 bg-purple-50 border-b border-purple-100 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">AI Pair Partner</span>
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <VibeAIPanel onCardSelect={handleCardSelect} />
              </div>
            </div>
          </div>
        )}

        {/* AI Panel - Mobile */}
        {viewMode === 'ai' && (
          <div className="md:hidden w-full overflow-hidden">
            <VibeAIPanel onCardSelect={handleCardSelect} />
          </div>
        )}

        {/* File Repository Panel - Desktop */}
        {showFiles && (
          <div className={`
            hidden lg:block
            ${viewMode === 'split' ? 'w-1/4' : 'w-1/3'}
            overflow-hidden transition-all duration-300 bg-amber-50/50
          `}>
            <div className="h-full flex flex-col">
              <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">Pear Files</span>
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
