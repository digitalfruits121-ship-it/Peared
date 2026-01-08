import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { Settings, LogOut, User, Bot, Zap, Menu, LayoutDashboard } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const currentUser = {
    name: 'Michael B.',
    email: 'michael@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex gap-0.5">
            <div className="w-2 h-6 bg-teal-400 rounded-sm"></div>
            <div className="w-2 h-6 bg-teal-500 rounded-sm"></div>
            <div className="w-2 h-6 bg-teal-600 rounded-sm"></div>
            <div className="w-2 h-6 bg-teal-700 rounded-sm"></div>
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">SyncBoard</span>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
            Human + AI
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/">
            <Button
              variant={location.pathname === '/' ? 'secondary' : 'ghost'}
              size="sm"
              className="gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              Board
            </Button>
          </Link>
          <Link to="/settings">
            <Button
              variant={location.pathname === '/settings' ? 'secondary' : 'ghost'}
              size="sm"
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </Link>
        </nav>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Sync Status Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-green-700">Synced</span>
        </div>

        {/* AI Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-full border border-purple-200">
          <Bot className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-medium text-purple-700">AI Connected</span>
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback>
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-2 p-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{currentUser.name}</span>
                <span className="text-xs text-gray-500">{currentUser.email}</span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                <Settings className="w-4 h-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings#ai" className="flex items-center gap-2 cursor-pointer">
                <Bot className="w-4 h-4" /> AI Configuration
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
