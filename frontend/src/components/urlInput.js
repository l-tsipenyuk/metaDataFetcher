import React from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';

const urlInput = ({ urls, setUrls }) => {
  const handleUrlChange = (index, value) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const addUrlInput = () => {
    setUrls([...urls, '']);
  };

  const removeUrlInput = (index) => {
    const newUrls = urls.filter((_, i) => i !== index);
    setUrls(newUrls);
  };

  return (
    <div className="url-input-container">
      {urls.map((url, index) => (
        <div key={index} className="url-input-row">
          <input
            type="url"
            value={url}
            onChange={(e) => handleUrlChange(index, e.target.value)}
            placeholder="Enter URL"
            required
            className="url-input"
          />
          {index >= 3 && (
            <button
              type="button"
              onClick={() => removeUrlInput(index)}
              className="icon-button"
              aria-label="Remove URL"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addUrlInput}
        className="icon-button add-url-button"
        aria-label="Add URL"
      >
        <PlusCircle size={20} />
      </button>
    </div>
  );
};

export default urlInput;