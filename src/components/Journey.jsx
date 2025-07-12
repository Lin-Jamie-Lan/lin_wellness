import { useState, useEffect } from 'react';
import { affirmationsAPI } from '../api.js';
import './Journey.css';

// Decorative tree SVG
const Tree = () => (
  <svg width="28" height="48" viewBox="0 0 28 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="14" cy="16" rx="13" ry="13" fill="#388e3c"/>
    <rect x="11" y="24" width="6" height="20" rx="3" fill="#795548"/>
  </svg>
);

// Calculate positions for N points along a winding path
function getWindingPositions(n, width, height, margin = 100) {
  // n: number of points, width/height: SVG size
  // Returns array of {x, y} from top-left to bottom-right, winding left/right
  const positions = [];
  // Reduce vertical space between cards and above the first card
  const topMargin = 30; // was 100
  const compressionFactor = 0.6;
  const usableHeight = (height - 2 * topMargin) * compressionFactor;
  const usableWidth = width - 2 * margin;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1 || 1); // 0 to 1
    // Start closer to the top
    const y = topMargin + t * usableHeight;
    // Alternate left/right, with more pronounced swing
    const swing = 0.35 + 0.55 * Math.abs(Math.sin(t * Math.PI)); // 0.35 to 0.9
    const direction = i % 2 === 0 ? -1 : 1;
    const x = margin + usableWidth * (0.5 + direction * swing * 0.4);
    positions.push({ x, y });
  }
  return positions;
}

const Journey = ({ username, onClose }) => {
  const [affirmations, setAffirmations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openCard, setOpenCard] = useState(null); // id of open card

  // SVG size
  const svgWidth = 900;
  const svgHeight = 1400;
  const margin = 100;
  const mountainHeight = 220; // was 120

  useEffect(() => {
    if (username) {
      loadAffirmations();
    }
  }, [username]);

  const loadAffirmations = async () => {
    try {
      setLoading(true);
      const data = await affirmationsAPI.getAll(username);
      setAffirmations(data);
    } catch (err) {
      setError('Failed to load your journey');
      console.error('Error loading affirmations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Only show the first 2-3 words of desire as summary
  const summarizeDesire = (affirmation) => {
    if (!affirmation.desire) return '';
    return affirmation.desire.split(' ').slice(0, 3).join(' ');
  };

  // Calculate card/tree positions in time order
  const positions = getWindingPositions(affirmations.length, svgWidth, svgHeight, margin);

  // Generate SVG path string through all positions
  function getWindingPath(points) {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Use cubic Bezier for extra smoothness
      const prev = points[i - 1];
      const curr = points[i];
      const midY = (prev.y + curr.y) / 2;
      const control1 = { x: prev.x, y: midY };
      const control2 = { x: curr.x, y: midY };
      d += ` C ${control1.x} ${control1.y}, ${control2.x} ${control2.y}, ${curr.x} ${curr.y}`;
    }
    return d;
  }
  const roadPath = getWindingPath(positions);

  return (
    <div className="journey-page-bg">
      <div className="mountain-svg">
        <svg viewBox="0 0 800 220" width="100%" height={mountainHeight} preserveAspectRatio="none">
          <defs>
            <linearGradient id="mountainGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b7e4c7" />
              <stop offset="100%" stopColor="#40916c" />
            </linearGradient>
          </defs>
          <path d="M0 180 L100 120 L200 160 L300 80 L400 140 L500 60 L600 120 L700 100 L800 180 L800 200 L0 200 Z" fill="url(#mountainGradient)" />
          <path d="M0 200 L100 150 L200 180 L300 120 L400 180 L500 100 L600 160 L700 140 L800 200" fill="none" stroke="#52b788" strokeWidth="4" />
        </svg>
      </div>
      <div className="journey-header scenic">
        <button onClick={onClose} className="back-btn">← Back</button>
        <h2>Your Journey</h2>
        <div style={{width: 60}}></div>
      </div>
      <div className="journey-scenic-container" style={{ position: 'relative', minHeight: svgHeight }}>
        {loading ? (
          <div className="loading">Loading your journey...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : affirmations.length === 0 ? (
          <div className="empty-journey">
            <div className="empty-icon">🌱</div>
            <h3>Your journey begins here</h3>
            <p>Create your first affirmation to start your path</p>
          </div>
        ) : (
          <>
            {/* Winding road SVG path */}
            <svg
              className="winding-road-svg"
              width={svgWidth}
              height={svgHeight}
              style={{ position: 'absolute', left: 0, top: 0, zIndex: 1, pointerEvents: 'none', width: '100%', height: '100%' }}
            >
              <defs>
                <linearGradient id="roadGradient2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f5e6c8" />
                  <stop offset="100%" stopColor="#e0c9a6" />
                </linearGradient>
              </defs>
              <path
                d={roadPath}
                stroke="url(#roadGradient2)"
                strokeWidth="32"
                fill="none"
                strokeLinecap="round"
                filter="url(#roadShadow)"
              />
              <path
                d={roadPath}
                stroke="#b7a07a"
                strokeWidth="36"
                fill="none"
                strokeLinecap="round"
                opacity="0.18"
              />
              <filter id="roadShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#b7a07a" floodOpacity="0.18" />
              </filter>
            </svg>
            {/* Overlay cards/trees at each position */}
            {affirmations.map((affirmation, index) => {
              const pos = positions[index];
              const isOpen = openCard === affirmation.id;
              return (
                <div
                  key={affirmation.id}
                  className={`journey-pin scenic always-visible${isOpen ? ' open' : ''}`}
                  style={{
                    left: `calc(${(pos.x / svgWidth) * 100}% - 60px)`,
                    top: pos.y,
                    zIndex: isOpen ? 10 : 2,
                  }}
                >
                  <div className="tree-deco"><Tree /></div>
                  <div className="pin-content scenic card">
                    {isOpen && (
                      <button className="close-x-btn" onClick={() => setOpenCard(null)}>
                        ×
                      </button>
                    )}
                    <div className="pin-summary scenic">
                      {summarizeDesire(affirmation)}
                    </div>
                    <div className="pin-timestamp scenic">
                      {new Date(affirmation.created_at).toLocaleDateString()}
                    </div>
                    {!isOpen && (
                      <button className="open-card-btn" onClick={() => setOpenCard(affirmation.id)}>
                        Open
                      </button>
                    )}
                    {isOpen && (
                      <div className="expanded-details">
                        <div className="detail-item"><label>Desire:</label> <p>{affirmation.desire}</p></div>
                        {affirmation.fear && <div className="detail-item"><label>Fear:</label> <p>{affirmation.fear}</p></div>}
                        {affirmation.blessing && <div className="detail-item"><label>Blessing:</label> <p>{affirmation.blessing}</p></div>}
                        <div className="detail-item"><label>Outcome:</label> <p>{affirmation.outcome}</p></div>
                        {affirmation.address && <div className="detail-item"><label>Address:</label> <p>{affirmation.address}</p></div>}
                        <div className="detail-item"><label>Created:</label> <p>{new Date(affirmation.created_at).toLocaleString()}</p></div>
                        <div className="affirmation-card-text"><strong>Affirmation:</strong> {affirmation.generated_affirmation}</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default Journey; 