import { useState, useEffect } from 'react';
import { affirmationsAPI } from '../api.js';
import './SavedAffirmations.css';

function SavedAffirmations({ onClose, onSelectAffirmation }) {
  const [affirmations, setAffirmations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [showUsernameInput, setShowUsernameInput] = useState(true);

  const loadAffirmations = async (username) => {
    try {
      setLoading(true);
      const data = await affirmationsAPI.getAll(username);
      setAffirmations(data);
      setShowUsernameInput(false);
    } catch (error) {
      setError('Failed to load affirmations. Please check the username.');
      console.error('Error loading affirmations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      loadAffirmations(username.trim());
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this affirmation?')) {
      return;
    }

    try {
      await affirmationsAPI.delete(username, id);
      setAffirmations(prev => prev.filter(aff => aff.id !== id));
    } catch (error) {
      setError('Failed to delete affirmation');
      console.error('Error deleting affirmation:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (showUsernameInput) {
    return (
      <div className="saved-affirmations-overlay">
        <div className="saved-affirmations-modal">
          <div className="saved-affirmations-header">
            <h2>View Saved Affirmations</h2>
            <button className="saved-affirmations-close" onClick={onClose}>×</button>
          </div>

          <div className="username-input-section">
            <p>Enter your name to view your saved affirmations:</p>
            <form onSubmit={handleUsernameSubmit} className="username-form">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name..."
                className="username-input"
                required
              />
              <button type="submit" className="username-submit-btn">
                View Affirmations
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="saved-affirmations-overlay">
        <div className="saved-affirmations-modal">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading your affirmations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-affirmations-overlay">
      <div className="saved-affirmations-modal">
        <div className="saved-affirmations-header">
          <h2>Your Saved Affirmations</h2>
          <button className="saved-affirmations-close" onClick={onClose}>×</button>
        </div>

        <div className="username-display">
          <span>Showing affirmations for: <strong>{username}</strong></span>
          <button 
            onClick={() => {
              setShowUsernameInput(true);
              setUsername('');
              setAffirmations([]);
            }} 
            className="change-username-btn"
          >
            Change Name
          </button>
        </div>

        {error && (
          <div className="saved-affirmations-error">
            {error}
          </div>
        )}

        {affirmations.length === 0 ? (
          <div className="saved-affirmations-empty">
            <div className="empty-icon">📝</div>
            <h3>No affirmations found</h3>
            <p>No affirmations found for "{username}". Try a different name or create your first affirmation!</p>
          </div>
        ) : (
          <div className="saved-affirmations-list">
            {affirmations.map((affirmation) => (
              <div key={affirmation.id} className="saved-affirmation-card">
                <div className="affirmation-header">
                  <div className="affirmation-meta">
                    <span className="affirmation-date">
                      {formatDate(affirmation.created_at)}
                    </span>
                    {affirmation.address && (
                      <span className="affirmation-address">
                        For: {affirmation.address}
                      </span>
                    )}
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(affirmation.id)}
                    title="Delete affirmation"
                  >
                    🗑️
                  </button>
                </div>

                <div className="affirmation-content">
                  <div className="affirmation-inputs">
                    <div className="input-group">
                      <label>Desire:</label>
                      <span>{affirmation.desire}</span>
                    </div>
                    {affirmation.fear && (
                      <div className="input-group">
                        <label>Fear:</label>
                        <span>{affirmation.fear}</span>
                      </div>
                    )}
                    {affirmation.blessing && (
                      <div className="input-group">
                        <label>Blessing:</label>
                        <span>{affirmation.blessing}</span>
                      </div>
                    )}
                    <div className="input-group">
                      <label>Outcome:</label>
                      <span>{affirmation.outcome}</span>
                    </div>
                  </div>

                  <div className="affirmation-text">
                    <label>Generated Affirmation:</label>
                    <div className="affirmation-body">
                      {truncateText(affirmation.generated_affirmation, 200)}
                    </div>
                  </div>
                </div>

                <div className="affirmation-actions">
                  <button
                    className="view-full-btn"
                    onClick={() => onSelectAffirmation(affirmation)}
                  >
                    View Full Affirmation
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SavedAffirmations; 