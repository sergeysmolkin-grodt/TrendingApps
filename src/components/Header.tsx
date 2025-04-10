
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Header = () => {
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
        
        <div className="hidden md:flex space-x-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm">Dashboard</Button>
          <Button variant="outline" size="sm">Explore</Button>
          <Button variant="outline" size="sm">Analysis</Button>
          <Button size="sm" className="bg-brand-teal hover:bg-brand-teal/90">New Search</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
