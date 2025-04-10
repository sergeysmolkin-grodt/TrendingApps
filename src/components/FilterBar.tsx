
import React from 'react';
import { Filter, MapPin, Calendar, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const FilterBar = () => {
  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm mb-6 border border-gray-200 dark:border-gray-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-500 mr-2" />
          <span className="font-medium">Filters</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full md:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <Layers className="h-4 w-4 mr-2" />
                <span>Categories</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Select Categories</h4>
                  <Separator />
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Technology', 'Health', 'Education', 'Finance', 
                      'Lifestyle', 'Entertainment', 'Sports', 'Science'
                    ].map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox id={`category-${category}`} />
                        <Label htmlFor={`category-${category}`}>{category}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="h-4 w-4 mr-2" />
                <span>Regions</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Select Regions</h4>
                  <Separator />
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Global', 'United States', 'United Kingdom', 'Europe', 'Asia', 
                      'Australia', 'South America', 'Africa'
                    ].map((region) => (
                      <div key={region} className="flex items-center space-x-2">
                        <Checkbox id={`region-${region}`} />
                        <Label htmlFor={`region-${region}`}>{region}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Select>
            <SelectTrigger>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Time Period" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="past-day">Past Day</SelectItem>
              <SelectItem value="past-week">Past Week</SelectItem>
              <SelectItem value="past-month">Past Month</SelectItem>
              <SelectItem value="past-year">Past Year</SelectItem>
              <SelectItem value="5-year">5 Year Trend</SelectItem>
            </SelectContent>
          </Select>
          
          <Select>
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter Type" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="emerging">Emerging Trends</SelectItem>
              <SelectItem value="stable">Stable Trends</SelectItem>
              <SelectItem value="high-interest">High Interest</SelectItem>
              <SelectItem value="app-potential">App Potential</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button className="bg-brand-teal hover:bg-brand-teal/90">Apply Filters</Button>
      </div>
    </div>
  );
};

export default FilterBar;
