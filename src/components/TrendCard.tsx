
import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, BarChart2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TrendCardProps {
  title: string;
  category: string;
  growth: number;
  interest: number;
  countries: string[];
  timeSpan: string;
}

const TrendCard: React.FC<TrendCardProps> = ({
  title,
  category,
  growth,
  interest,
  countries,
  timeSpan
}) => {
  const getGrowthIcon = () => {
    if (growth > 10) return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    if (growth < -10) return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-blue-600" />;
  };

  const getGrowthClass = () => {
    if (growth > 10) return "trend-tag-growth";
    if (growth < -10) return "trend-tag-declining";
    return "trend-tag-neutral";
  };

  return (
    <div className="trend-card">
      <div className="trend-card-header">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className={`trend-tag ${getGrowthClass()}`}>
          {getGrowthIcon()}
          {growth > 0 ? '+' : ''}{growth}%
        </span>
      </div>
      <div className="trend-card-body">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">Category: {category}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{timeSpan}</span>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Interest</span>
            <span className="text-sm text-gray-500">{interest}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-brand-teal h-2.5 rounded-full" 
              style={{ width: `${interest}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {countries.map((country, index) => (
            <span 
              key={index} 
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs"
            >
              {country}
            </span>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="inline-flex items-center text-sm text-brand-blue hover:text-brand-teal">
                  <BarChart2 className="h-4 w-4 mr-1" />
                  View Details
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View detailed analytics</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <span className="text-xs text-gray-500">AI Opportunity Score: 78/100</span>
        </div>
      </div>
    </div>
  );
};

export default TrendCard;
