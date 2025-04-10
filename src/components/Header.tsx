
import React from 'react';
import { Search, Moon, Sun, User, Settings } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface HeaderProps {
  onThemeToggle?: () => void;
  theme?: 'light' | 'dark';
}

const Header: React.FC<HeaderProps> = ({ onThemeToggle, theme = 'light' }) => {
  return (
    <header className="w-full bg-white dark:bg-gray-900 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-blue to-brand-teal rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-xl">TW</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-blue dark:text-white">
            Trend Whisperer
          </h1>
        </div>
        
        <div className="relative w-full md:w-1/3">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input 
            type="search" 
            placeholder="Search trends..." 
            className="pl-10 w-full"
          />
        </div>
        
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={onThemeToggle}>
                  {theme === 'light' ? <Moon className="h-[1.2rem] w-[1.2rem]" /> : <Sun className="h-[1.2rem] w-[1.2rem]" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle theme</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-[1.2rem] w-[1.2rem]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <User className="h-[1.2rem] w-[1.2rem]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Profile</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="hidden md:flex ml-2">
            <Button size="sm" className="bg-brand-teal hover:bg-brand-teal/90">New Search</Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
