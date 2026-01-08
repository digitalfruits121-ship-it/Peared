import React, { useState } from 'react';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { Settings, LogOut, Bot, Menu, LayoutDashboard, X } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const currentUser = {
    name: 'Michael B.',
    email: 'michael@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
  };

  const NavLinks = ({ mobile = false, onNavigate }) => (
    <>
      <Link to="/" onClick={onNavigate}>
        <Button
          variant={location.pathname === '/' ? 'secondary' : 'ghost'}
          size={mobile ? 'default' : 'sm'}
          className={`gap-2 ${mobile ? 'w-full justify-start' : ''}`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Board
        </Button>
      </Link>
      <Link to="/settings" onClick={onNavigate}>
        <Button
          variant={location.pathname === '/settings' ? 'secondary' : 'ghost'}
          size={mobile ? 'default' : 'sm'}
          className={`gap-2 ${mobile ? 'w-full justify-start' : ''}`}
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </Link>
    </>
  );

  return (
    <header className="h-14 md:h-16 border-b border-gray-200 bg-white px-4 md:px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-4 md:gap-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex gap-0.5">
            <div className="w-1.5 md:w-2 h-5 md:h-6 bg-teal-400 rounded-sm"></div>
            <div className="w-1.5 md:w-2 h-5 md:h-6 bg-teal-500 rounded-sm"></div>
            <div className="w-1.5 md:w-2 h-5 md:h-6 bg-teal-600 rounded-sm"></div>
            <div className="w-1.5 md:w-2 h-5 md:h-6 bg-teal-700 rounded-sm"></div>
          </div>
          <span className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">SyncBoard</span>
          <span className="hidden sm:inline text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
            Human + AI
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLinks />
        </nav>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Sync Status Indicator - Desktop only */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-green-700">Synced</span>
        </div>

        {/* AI Status - Desktop only */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-full border border-purple-200">
          <Bot className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-medium text-purple-700">AI Connected</span>
        </div>

        {/* Mobile sync indicator */}
        <div className="flex lg:hidden items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <Bot className="w-4 h-4 text-purple-600" />
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 md:h-9 md:w-9 rounded-full">
              <Avatar className="h-8 w-8 md:h-9 md:w-9">
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
              <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                <Bot className="w-4 h-4" /> AI Configuration
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px]">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-2 mt-6">
              <NavLinks mobile onNavigate={() => setMobileMenuOpen(false)} />
            </nav>
            <div className="mt-6 pt-6 border-t space-y-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700">Synced</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg">
                <Bot className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-700">AI Connected</span>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
