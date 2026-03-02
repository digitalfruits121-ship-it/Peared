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
import PearLogo from '../components/Layout/PearLogo';
import { useAppSettings } from '../contexts/AppSettingsContext';

const SplitBoardPage = () => {
  const board = mockBoards[0];
  const [viewMode, setViewMode] = useState('human');
  const [showFiles, setShowFiles] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const { settings } = useAppSettings();

  const handleCardSelect = (card) => {
    setSelectedCard(card);
  };

  return (
    <div className="h-[calc(100vh-56px)] md:h-[calc(100vh-64px)] flex flex-col bg-gray-950">
      {/* Board Header */}
      <div className="px-4 md:px-6 py-2 md:py-3 border-b border-neon-500/20 bg-gradient-to-r from-gray-900 to-gray-900/95">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <PearLogo size={24} />
              <h1 className="text-lg md:text-xl font-bold text-neon-400 truncate">{board.name}</h1>
            </div>
            <p className="text-xs md:text-sm text-neon-500/60 truncate">{board.description}</p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Files Toggle - Desktop */}
            <Button
              variant={showFiles ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFiles(!showFiles)}
              className={`hidden lg:flex gap-2 ${showFiles ? 'bg-amber-500 hover:bg-amber-600 text-black' : 'border-amber-500/50 text-amber-400 hover:bg-amber-500/10'}`}
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
                <Button variant="outline" size="sm" className="lg:hidden gap-1 border-amber-500/50 text-amber-400 hover:bg-amber-500/10">
                  <FolderOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Files</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[400px] p-0 bg-gray-900 border-amber-500/30">
                <SheetHeader className="p-4 border-b border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-amber-600/5">
                  <SheetTitle className="flex items-center gap-2 text-amber-400">
                    <FolderOpen className="w-5 h-5" /> {settings.appName || 'Pear'} Files 🍐
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
                <Button variant="outline" size="sm" className="md:hidden gap-1 border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                  <Bot className="w-4 h-4" />
                  <span className="hidden sm:inline">AI</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh] p-0 rounded-t-xl bg-gray-900 border-purple-500/30">
                <SheetHeader className="p-4 border-b border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-purple-600/5">
                  <SheetTitle className="flex items-center gap-2 text-purple-400">
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
              <TabsList className="bg-gray-800 h-9 border border-neon-500/20">
                <TabsTrigger value="human" className="gap-1.5 text-xs px-3 data-[state=active]:bg-neon-500 data-[state=active]:text-black text-gray-400 hover:text-neon-400">
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Human</span>
                </TabsTrigger>
                <TabsTrigger value="split" className="gap-1.5 text-xs px-3 data-[state=active]:bg-neon-500 data-[state=active]:text-black text-gray-400 hover:text-neon-400">
                  <Split className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Paired</span>
                </TabsTrigger>
                <TabsTrigger value="ai" className="gap-1.5 text-xs px-3 data-[state=active]:bg-purple-500 data-[state=active]:text-white text-gray-400 hover:text-purple-400">
                  <Bot className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">AI</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Mobile View Toggle */}
            <div className="flex md:hidden bg-gray-800 rounded-lg p-0.5 border border-neon-500/20">
              <Button
                variant={viewMode === 'human' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('human')}
                className={`h-7 px-2 ${viewMode === 'human' ? 'bg-neon-500 text-black' : 'text-gray-400'}`}
              >
                <User className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'ai' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('ai')}
                className={`h-7 px-2 ${viewMode === 'ai' ? 'bg-purple-500 text-white' : 'text-gray-400'}`}
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
            ${viewMode === 'split' ? 'border-r border-neon-500/20' : ''}
            bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950
            overflow-hidden transition-all duration-300
          `}>
            <div className="h-full flex flex-col">
              {viewMode === 'split' && (
                <div className="hidden md:flex px-4 py-2 bg-neon-500/5 border-b border-neon-500/20 items-center gap-2">
                  <PearLogo size={20} />
                  <span className="text-sm font-medium text-neon-400">Human {settings.appName || 'Pear'} Board</span>
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
            ${showFiles ? 'border-r border-purple-500/20' : ''}
          `}>
            <div className="h-full flex flex-col">
              {viewMode === 'split' && (
                <div className="px-4 py-2 bg-purple-500/5 border-b border-purple-500/20 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-400">AI Pair Partner</span>
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
            overflow-hidden transition-all duration-300 bg-amber-500/5
          `}>
            <div className="h-full flex flex-col">
              <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-400">{settings.appName || 'Pear'} Files</span>
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
