import React, { useState } from 'react';
import axios from 'axios';
import { RefreshCw } from 'lucide-react';
import urlInput from './components/urlInput';
import loadingSpinner from './components/loadingSpinner';
import resultCard from './components/resultCard';
import './App.css';

function App() {
  const [urls, setUrls] = useState(['', '', '']);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (urls.filter(url => url.trim() !== '').length < 3) {
      setError('Please provide at least 3 valid URLs');
      return;
    }
    setLoading(true);
    setError('');
    setResults([]);

    try {
      const response = await axios.post('http://localhost:3001/fetch-metadata', { urls });
      setResults(response.data);
    } catch (error) {
      if (error.response && error.response.status === 429) {
        setError('Rate limit exceeded. Please wait a moment before trying again.');
      } else {
        setError('Failed to fetch metadata. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    setUrls(['', '', '']);
    setResults([]);
    setError('');
  };

  return (
    <div className="container">
      <h1 className="title">URL Metadata Fetcher</h1>
      <form onSubmit={handleSubmit} className="form">
        {urlInput({ urls, setUrls })}
        <div className="button-container">
          <button type="submit" className="submit-button">
            Fetch Metadata
          </button>
          <button type="button" onClick={handleTryAgain} className="try-again-button" aria-label="Try Again">
            <RefreshCw size={24} />
          </button>
        </div>
      </form>

      {loading && loadingSpinner()}
      {error && <p className="error-message">{error}</p>}

      <div className="results-grid">
        {results.map((result, index) => (
          resultCard({ key: index, result })
        ))}
      </div>
    </div>
  );
}

export default App;