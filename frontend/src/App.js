import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw } from 'lucide-react';
import urlInput from './components/urlInput';
import loadingSpinner from './components/loadingSpinner';
import resultCard from './components/resultCard';
import './App.css';

axios.defaults.withCredentials = true;

function App() {
  const [urls, setUrls] = useState(['', '', '']);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get('http://localhost:3001/csrf-token');
        setCsrfToken(response.data.csrfToken);
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
        setError('Failed to initialize application. Please refresh the page.');
      }
    };

    fetchCsrfToken();
  }, []);

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
      const response = await axios.post('http://localhost:3001/fetch-metadata', 
        { urls },
        {
          headers: {
            'X-CSRF-Token': csrfToken
          }
        }
      );
      setResults(response.data);
    } catch (error) {
      if (error.response) {
        if (error.response.status === 429) {
          setError('Rate limit exceeded. Please wait a moment before trying again.');
        } else if (error.response.status === 403) {
          setError('Invalid CSRF token. Please refresh the page and try again.');
        } else {
          setError('Failed to fetch metadata. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
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
          <button type="submit" className="submit-button" disabled={!csrfToken}>
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