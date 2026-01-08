import React from 'react';
import Board from '../Board/Board';
import { mockBoards } from '../../data/mockData';

const BoardPage = () => {
  const board = mockBoards[0];

  return (
    <div className="h-[calc(100vh-64px)] bg-gradient-to-br from-white via-pink-50/30 to-purple-50/30">
      {/* Board Header */}
      <div className="px-6 py-4 border-b border-gray-200/50 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{board.name}</h1>
            <p className="text-sm text-gray-500">{board.description}</p>
          </div>
        </div>
      </div>

      {/* Board Content */}
      <Board boardId={board.id} />
    </div>
  );
};

export default BoardPage;
