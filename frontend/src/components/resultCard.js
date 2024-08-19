import React from 'react';
import { ImageOff } from 'lucide-react';

const resultCard = ({ result }) => (
  <div className="result-card">
    <h2 className="result-title">{result.title || 'No title available'}</h2>
    <p className="result-description">{result.description || 'No description available'}</p>
    {result.image ? (
      <img src={result.image} alt={result.title} className="result-image" />
    ) : (
      <div className="no-image">
        <ImageOff size={48} />
        <p>Sorry, no image available</p>
      </div>
    )}
    <a href={result.url} target="_blank" rel="noopener noreferrer" className="result-url">
      {result.url}
    </a>
  </div>
);

export default resultCard;