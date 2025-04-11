import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TrendHistory = ({ keyword }) => {
  const [trendData, setTrendData] = useState(null);
  const [compareData, setCompareData] = useState(null);
  const [compareKeyword, setCompareKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [years, setYears] = useState(5);
  const [stats, setStats] = useState(null);
  const [comparisonHistory, setComparisonHistory] = useState([]);
  const [tiktokData, setTiktokData] = useState(null);

  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/trends/historical/${keyword}?years=${years}`);
        if (!response.ok) {
          throw new Error('Failed to fetch trend data');
        }
        const data = await response.json();
        setTrendData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchTiktokData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/tiktok/analysis/${keyword}`);
        if (!response.ok) {
          throw new Error('Failed to fetch TikTok data');
        }
        const data = await response.json();
        setTiktokData(data);
      } catch (err) {
        console.error('Error fetching TikTok data:', err);
      }
    };

    if (keyword) {
      fetchTrendData();
      fetchTiktokData();
    }
  }, [keyword, years]);

  const calculateGrowthPotential = (values) => {
    const recentValues = values.slice(-6); // Последние 6 месяцев
    const oldValues = values.slice(-12, -6); // Предыдущие 6 месяцев
    const recentAvg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
    const oldAvg = oldValues.reduce((a, b) => a + b, 0) / oldValues.length;
    return ((recentAvg - oldAvg) / oldAvg) * 100;
  };

  const calculateSeasonalityScore = (values) => {
    // Разбиваем данные на месяцы и анализируем повторяющиеся паттерны
    const monthlyAverages = new Array(12).fill(0);
    const monthlyCounts = new Array(12).fill(0);
    
    values.forEach((value, index) => {
      const date = new Date(trendData.dates[index]);
      const month = date.getMonth();
      monthlyAverages[month] += value;
      monthlyCounts[month]++;
    });
    
    for (let i = 0; i < 12; i++) {
      monthlyAverages[i] = monthlyAverages[i] / monthlyCounts[i];
    }
    
    const maxDiff = Math.max(...monthlyAverages) - Math.min(...monthlyAverages);
    return (maxDiff / Math.max(...monthlyAverages)) * 100;
  };

  const calculateViralScore = (values, peakValue) => {
    const recentGrowth = calculateGrowthPotential(values);
    const seasonality = calculateSeasonalityScore(values);
    const peakRatio = peakValue / 100;
    
    // Комплексный показатель виральности
    return (recentGrowth * 0.4 + (100 - seasonality) * 0.3 + peakRatio * 100 * 0.3);
  };

  const calculateMonetizationPotential = (values, viralScore) => {
    const avgInterest = values.reduce((a, b) => a + b, 0) / values.length;
    const growth = calculateGrowthPotential(values);
    
    // Оценка потенциала монетизации
    return (avgInterest * 0.4 + growth * 0.3 + viralScore * 0.3) / 100;
  };

  const handleCompare = async () => {
    if (!compareKeyword) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/trends/historical/${compareKeyword}?years=${years}`);
      if (!response.ok) {
        throw new Error('Failed to fetch comparison data');
      }
      const data = await response.json();
      setCompareData(data);
      
      // Add to comparison history
      setComparisonHistory(prev => {
        const newHistory = [{ keyword: compareKeyword, date: new Date() }, ...prev];
        return newHistory.slice(0, 5);
      });
      
      // Calculate statistics
      if (trendData && data) {
        const mainValues = trendData.values;
        const compareValues = data.values;
        
        const mainMean = mainValues.reduce((a, b) => a + b, 0) / mainValues.length;
        const compareMean = compareValues.reduce((a, b) => a + b, 0) / compareValues.length;
        
        const mainMax = Math.max(...mainValues);
        const compareMax = Math.max(...compareValues);
        
        const mainMin = Math.min(...mainValues);
        const compareMin = Math.min(...compareValues);

        // Find peak dates
        const mainPeakIndex = mainValues.indexOf(mainMax);
        const comparePeakIndex = compareValues.indexOf(compareMax);
        const mainPeakDate = new Date(trendData.dates[mainPeakIndex]);
        const comparePeakDate = new Date(data.dates[comparePeakIndex]);

        // Calculate new metrics
        const mainGrowth = calculateGrowthPotential(mainValues);
        const compareGrowth = calculateGrowthPotential(compareValues);
        
        const mainSeasonality = calculateSeasonalityScore(mainValues);
        const compareSeasonality = calculateSeasonalityScore(compareValues);
        
        const mainViralScore = calculateViralScore(mainValues, mainMax);
        const compareViralScore = calculateViralScore(compareValues, compareMax);
        
        const mainMonetization = calculateMonetizationPotential(mainValues, mainViralScore);
        const compareMonetization = calculateMonetizationPotential(compareValues, compareViralScore);
        
        setStats({
          mainMean,
          compareMean,
          mainMax,
          compareMax,
          mainMin,
          compareMin,
          difference: mainMean - compareMean,
          correlation: calculateCorrelation(mainValues, compareValues),
          mainPeakYear: mainPeakDate.getFullYear(),
          comparePeakYear: comparePeakDate.getFullYear(),
          mainGrowth,
          compareGrowth,
          mainSeasonality,
          compareSeasonality,
          mainViralScore,
          compareViralScore,
          mainMonetization,
          compareMonetization
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (historyKeyword) => {
    setCompareKeyword(historyKeyword);
    // Trigger comparison automatically
    setTimeout(() => handleCompare(), 100);
  };

  const calculateCorrelation = (arr1, arr2) => {
    const n = Math.min(arr1.length, arr2.length);
    const mean1 = arr1.reduce((a, b) => a + b, 0) / n;
    const mean2 = arr2.reduce((a, b) => a + b, 0) / n;
    
    let numerator = 0;
    let denominator1 = 0;
    let denominator2 = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (arr1[i] - mean1) * (arr2[i] - mean2);
      denominator1 += Math.pow(arr1[i] - mean1, 2);
      denominator2 += Math.pow(arr2[i] - mean2, 2);
    }
    
    return numerator / Math.sqrt(denominator1 * denominator2);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="text-center py-8">
      <div className="text-red-500 text-lg font-medium mb-2">Error loading data</div>
      <p className="text-gray-600">{error}</p>
    </div>
  );
  
  if (!trendData) return (
    <div className="text-center py-8">
      <div className="text-gray-500 text-lg">No data available for this keyword</div>
    </div>
  );

  const chartData = {
    labels: trendData.dates,
    datasets: [
      {
        label: `Interest in "${keyword}"`,
        data: trendData.values,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 5,
      },
      ...(compareData ? [{
        label: `Interest in "${compareKeyword}"`,
        data: compareData.values,
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 5,
      }] : []),
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1F2937',
        bodyColor: '#4B5563',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          title: (tooltipItems) => {
            return tooltipItems[0].label;
          },
          label: (tooltipItem) => {
            return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#6B7280',
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          maxRotation: 45,
          minRotation: 45,
        }
      },
    },
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Historical Interest in "{keyword}"
        </h2>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Time Range:</label>
          <select
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value={1}>1 year</option>
            <option value={3}>3 years</option>
            <option value={5}>5 years</option>
          </select>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            value={compareKeyword}
            onChange={(e) => setCompareKeyword(e.target.value)}
            placeholder="Enter a keyword to compare"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={handleCompare}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Compare
          </button>
        </div>
        
        {comparisonHistory.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Comparisons</h3>
            <div className="flex flex-wrap gap-2">
              {comparisonHistory.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryClick(item.keyword)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all duration-200 flex items-center gap-2"
                >
                  <span>{item.keyword}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="h-[500px] mb-8">
        <Line data={chartData} options={options} />
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Average Interest</h3>
            <div className="mt-2">
              <p className="text-lg font-semibold text-indigo-600">{stats.mainMean.toFixed(1)}</p>
              <p className="text-sm text-pink-500">vs {stats.compareMean.toFixed(1)}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Peak Interest</h3>
            <div className="mt-2">
              <p className="text-lg font-semibold text-indigo-600">
                {stats.mainMax} in {stats.mainPeakYear}
              </p>
              <p className="text-sm text-pink-500">
                vs {stats.compareMax} in {stats.comparePeakYear}
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Growth Potential</h3>
            <div className="mt-2">
              <p className="text-lg font-semibold text-indigo-600">
                {stats.mainGrowth > 0 ? '+' : ''}{stats.mainGrowth.toFixed(1)}%
              </p>
              <p className="text-sm text-pink-500">
                vs {stats.compareGrowth > 0 ? '+' : ''}{stats.compareGrowth.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Seasonality Score</h3>
            <div className="mt-2">
              <p className="text-lg font-semibold text-indigo-600">
                {stats.mainSeasonality.toFixed(1)}%
              </p>
              <p className="text-sm text-pink-500">
                vs {stats.compareSeasonality.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Viral Score</h3>
            <div className="mt-2">
              <p className="text-lg font-semibold text-indigo-600">
                {stats.mainViralScore.toFixed(1)}/100
              </p>
              <p className="text-sm text-pink-500">
                vs {stats.compareViralScore.toFixed(1)}/100
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Monetization Potential</h3>
            <div className="mt-2">
              <p className="text-lg font-semibold text-indigo-600">
                {stats.mainMonetization.toFixed(2)}/1.0
              </p>
              <p className="text-sm text-pink-500">
                vs {stats.compareMonetization.toFixed(2)}/1.0
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Correlation</h3>
            <div className="mt-2">
              <p className="text-lg font-semibold text-indigo-600">{stats.correlation.toFixed(2)}</p>
              <p className="text-sm text-gray-500">
                {stats.correlation > 0.7 ? 'Strong correlation' : 
                 stats.correlation > 0.3 ? 'Moderate correlation' : 
                 'Weak correlation'}
              </p>
            </div>
          </div>
        </div>
      )}

      {tiktokData && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">TikTok Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Viral Potential</h3>
              <div className="mt-2">
                <p className="text-lg font-semibold text-indigo-600">
                  {(tiktokData.viral_potential * 100).toFixed(1)}/100
                </p>
                <p className="text-sm text-gray-500">
                  Based on engagement, comments, and hashtag reach
                </p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Top Video Patterns</h3>
              <div className="mt-2">
                <ul className="space-y-1">
                  {tiktokData.title_analysis.most_common_words.map(([word, count], index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {word}: {count}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">User Sentiment</h3>
              <div className="mt-2">
                <p className="text-lg font-semibold text-indigo-600">
                  {(tiktokData.comment_analysis.average_sentiment * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500">
                  {tiktokData.comment_analysis.average_sentiment > 0.5 ? 'Very Positive' :
                   tiktokData.comment_analysis.average_sentiment > 0 ? 'Positive' :
                   tiktokData.comment_analysis.average_sentiment > -0.5 ? 'Neutral' : 'Negative'}
                </p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Monetization Opportunities</h3>
              <div className="mt-2">
                <ul className="space-y-1">
                  {tiktokData.monetization_opportunities.map((opportunity, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {opportunity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Related Niches</h3>
              <div className="mt-2">
                <ul className="space-y-1">
                  {tiktokData.hashtag_analysis.related_niches.map((niche, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {niche}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Growth Potential</h3>
              <div className="mt-2">
                <p className="text-lg font-semibold text-indigo-600">
                  {(tiktokData.hashtag_analysis.growth_potential * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500">
                  Based on hashtag growth and engagement
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendHistory; 