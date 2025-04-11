import { useRouter } from 'next/router';
import Link from 'next/link';
import Dashboard from '../components/Dashboard';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Trend Whisperer</span>
            <span className="block text-indigo-600">Discover What's Trending</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Analyze trends, track interest over time, and discover insights about what's popular right now
          </p>
        </div>

        <div className="mb-12">
          <Dashboard />
        </div>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/trend-analysis">
            <button className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 transform hover:scale-105 shadow-lg">
              Analyze Trends
            </button>
          </Link>
          <Link href="/daily-trends">
            <button className="px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg font-medium hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 transform hover:scale-105 shadow-lg">
              Daily Trends
            </button>
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Historical Analysis</h3>
            <p className="text-gray-500">Track how interest in topics changes over time with detailed historical data</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Trends</h3>
            <p className="text-gray-500">Discover what's trending right now with up-to-the-minute data</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Insightful Visualizations</h3>
            <p className="text-gray-500">Beautiful charts and graphs to help you understand the data</p>
          </div>
        </div>

        <div className="mt-20 text-center text-gray-500 text-sm">
          <p>Powered by Google Trends • Updated in real-time</p>
        </div>
      </div>
    </div>
  );
} 