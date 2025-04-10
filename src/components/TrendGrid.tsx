
import React from 'react';
import TrendCard from './TrendCard';

// Sample trend data
const trendData = [
  {
    id: 1,
    title: 'AI Learning Tools',
    category: 'Education',
    growth: 48,
    interest: 87,
    countries: ['US', 'UK', 'CA', 'DE', 'IN'],
    timeSpan: 'Last 12 months'
  },
  {
    id: 2,
    title: 'Mental Health Apps',
    category: 'Health',
    growth: 32,
    interest: 79,
    countries: ['US', 'AU', 'UK', 'CA'],
    timeSpan: 'Last 6 months'
  },
  {
    id: 3,
    title: 'Remote Work Tools',
    category: 'Technology',
    growth: 15,
    interest: 92,
    countries: ['US', 'CA', 'DE', 'FR', 'UK'],
    timeSpan: 'Last 24 months'
  },
  {
    id: 4,
    title: 'Sustainable Living',
    category: 'Lifestyle',
    growth: 27,
    interest: 68,
    countries: ['US', 'SE', 'DE', 'FI', 'NL'],
    timeSpan: 'Last 12 months'
  },
  {
    id: 5,
    title: 'Virtual Reality Fitness',
    category: 'Health',
    growth: 53,
    interest: 72,
    countries: ['US', 'JP', 'KR', 'UK'],
    timeSpan: 'Last 6 months'
  },
  {
    id: 6,
    title: 'Crypto Payment Solutions',
    category: 'Finance',
    growth: -12,
    interest: 61,
    countries: ['US', 'SG', 'CH', 'AE'],
    timeSpan: 'Last 3 months'
  },
  {
    id: 7,
    title: 'Language Learning Tools',
    category: 'Education',
    growth: 18,
    interest: 83,
    countries: ['US', 'CN', 'JP', 'BR', 'ES'],
    timeSpan: 'Last 12 months'
  },
  {
    id: 8,
    title: 'Smart Home Security',
    category: 'Technology',
    growth: 22,
    interest: 75,
    countries: ['US', 'UK', 'DE', 'CA', 'AU'],
    timeSpan: 'Last 12 months'
  }
];

const TrendGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {trendData.map((trend) => (
        <TrendCard
          key={trend.id}
          title={trend.title}
          category={trend.category}
          growth={trend.growth}
          interest={trend.interest}
          countries={trend.countries}
          timeSpan={trend.timeSpan}
        />
      ))}
    </div>
  );
};

export default TrendGrid;
