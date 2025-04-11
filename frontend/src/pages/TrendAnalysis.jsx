import React, { useState } from 'react';
import TrendHistory from '../components/TrendHistory';

const TrendAnalysis = () => {
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchKeyword(keyword);
  };

  return (
    <div className="trend-analysis">
      <h1>Trend Analysis</h1>
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Enter a keyword (e.g., looksmaxxing)"
          required
        />
        <button type="submit">Analyze Trend</button>
      </form>

      {searchKeyword && <TrendHistory keyword={searchKeyword} />}

      <style jsx>{`
        .trend-analysis {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .search-form {
          margin: 20px 0;
          display: flex;
          gap: 10px;
        }
        input {
          padding: 8px;
          font-size: 16px;
          flex: 1;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        button {
          padding: 8px 16px;
          font-size: 16px;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background-color: #45a049;
        }
      `}</style>
    </div>
  );
};

export default TrendAnalysis; 