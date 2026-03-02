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
import { Settings, LogOut, Bot, Menu, LayoutDashboard } from 'lucide-react';
import PearLogo from './PearLogo';
import { useAppSettings } from '../../contexts/AppSettingsContext';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { settings } = useAppSettings();
  const { currentUser, logout } = useAuth();

  const renderLogo = (size = 32) => {
    switch (settings.logoType) {
      case 'emoji':
        return <span className="text-2xl md:text-3xl pear-bounce">{settings.logoEmoji}</span>;
      case 'custom':
        return settings.customLogoUrl ? (
          <img 
            src={settings.customLogoUrl} 
            alt="Logo" 
            className="w-8 h-8 md:w-9 md:h-9 object-contain pear-bounce"
          />
        ) : (
          <PearLogo size={size} className="pear-bounce" />
        );
      default:
        return <PearLogo size={size} className="pear-bounce" />;
    }
  };

  const NavLinks = ({ mobile = false, onNavigate }) => (
    <>
      <Link to="/" onClick={onNavigate}>
        <Button
          variant={location.pathname === '/' ? 'secondary' : 'ghost'}
          size={mobile ? 'default' : 'sm'}
          className={`gap-2 ${mobile ? 'w-full justify-start' : ''} ${location.pathname === '/' ? 'bg-neon-500/20 text-neon-500 hover:bg-neon-500/30' : 'hover:bg-neon-500/10 hover:text-neon-400'}`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Board
        </Button>
      </Link>
      <Link to="/settings" onClick={onNavigate}>
        <Button
          variant={location.pathname === '/settings' ? 'secondary' : 'ghost'}
          size={mobile ? 'default' : 'sm'}
          className={`gap-2 ${mobile ? 'w-full justify-start' : ''} ${location.pathname === '/settings' ? 'bg-neon-500/20 text-neon-500 hover:bg-neon-500/30' : 'hover:bg-neon-500/10 hover:text-neon-400'}`}
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </Link>
    </>
  );

  return (
    <header className="h-14 md:h-16 border-b border-neon-500/20 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-4 md:gap-8">
        <Link to="/" className="flex items-center gap-2 group">
          {renderLogo(36)}
          <div className="flex flex-col">
            <span className="text-lg md:text-xl font-bold text-neon-400 tracking-tight neon-text">
              {settings.appName || 'Pears'}
            </span>
            <span className="hidden sm:block text-[9px] md:text-[10px] text-neon-500/70 font-medium -mt-1">
              {settings.slogan?.split(',')[0] || 'Paired for Production'}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLinks />
        </nav>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Sync Status Indicator - Desktop only */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-neon-500/10 rounded-full border border-neon-500/30">
          <div className="w-2 h-2 bg-neon-500 rounded-full animate-pulse neon-glow-static"></div>
          <span className="text-xs font-medium text-neon-400">Synced</span>
        </div>

        {/* AI Status - Desktop only */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 rounded-full border border-purple-500/30">
          <Bot className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-medium text-purple-300">AI Paired</span>
        </div>

        {/* Mobile sync indicator */}
        <div className="flex lg:hidden items-center gap-1">
          <div className="w-2 h-2 bg-neon-500 rounded-full neon-glow-static"></div>
          <Bot className="w-4 h-4 text-purple-400" />
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 md:h-9 md:w-9 rounded-full hover:bg-neon-500/10">
              <Avatar className="h-8 w-8 md:h-9 md:w-9 ring-2 ring-neon-500/50">
                <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                <AvatarFallback className="bg-neon-500/20 text-neon-400">
                  {currentUser?.name?.split(' ').map(n => n[0]).join('') || '?'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-neon-500/20">
            <div className="flex items-center gap-2 p-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser?.avatar} />
                <AvatarFallback>{currentUser?.name?.[0] || '?'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">{currentUser?.name}</span>
                <span className="text-xs text-gray-400">{currentUser?.email}</span>
              </div>
            </div>
            <DropdownMenuSeparator className="bg-neon-500/20" />
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-neon-400 hover:bg-neon-500/10">
                <Settings className="w-4 h-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-neon-400 hover:bg-neon-500/10">
                <Bot className="w-4 h-4" /> AI Configuration
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-neon-500/20" />
            <DropdownMenuItem onClick={logout} className="text-red-400 cursor-pointer hover:bg-red-500/10">
              <LogOut className="w-4 h-4 mr-2" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden hover:bg-neon-500/10">
              <Menu className="h-5 w-5 text-neon-400" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] bg-gray-900 border-neon-500/20">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-neon-400">
                {renderLogo(28)} {settings.appName || 'Pears'} Menu
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-2 mt-6">
              <NavLinks mobile onNavigate={() => setMobileMenuOpen(false)} />
            </nav>
            <div className="mt-6 pt-6 border-t border-neon-500/20 space-y-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-neon-500/10 rounded-lg border border-neon-500/30">
                <div className="w-2 h-2 bg-neon-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-neon-400">Synced</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <Bot className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300">AI Paired</span>
              </div>
            </div>
            <div className="mt-6 p-3 bg-gradient-to-r from-neon-500/10 to-purple-500/10 rounded-lg border border-neon-500/20">
              <p className="text-xs text-neon-400 font-medium text-center italic">
                "{settings.slogan || 'Paired for Production, Performance, Partnership'}"
              </p>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
