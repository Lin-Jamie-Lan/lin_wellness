import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { affirmationsAPI } from './api.js'
import SavedAffirmations from './components/SavedAffirmations.jsx'
import Journey from './components/Journey.jsx'
import './App.css'
import Auth from './components/Auth.jsx'

function MainForm({
  formData, setFormData, affirmation, setAffirmation, showResult, setShowResult, showSaved, setShowSaved, selectedAffirmation, setSelectedAffirmation, saving, setSaving, saveError, setSaveError, generateAffirmation, saveAffirmation, copyToClipboard, resetForm, handleSelectAffirmation,
  user, handleLogout, showAuth, setShowAuth
}) {
  const navigate = useNavigate();

  const handleJourneyClick = () => {
    if (!formData.username.trim()) {
      alert('Please enter your name to view your journey.');
      return;
    }
    navigate(`/journey?username=${encodeURIComponent(formData.username)}`);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>✨ Custom Affirmation Generator ✨</h1>
        <p>Create your personalized affirmation to manifest your dreams</p>
        <div className="user-menu">
          <button onClick={() => setShowSaved(true)} className="saved-btn">
            📚 Saved Affirmations
          </button>
          <button onClick={handleJourneyClick} className="journey-btn">
            🛤️ My Journey
          </button>
          {user ? (
            <span className="user-info">👤 {user.username} <button className="logout-btn" onClick={handleLogout}>Log Out</button></span>
          ) : (
            <button className="login-btn" onClick={() => setShowAuth(true)}>
              Sign Up / Log In
            </button>
          )}
        </div>
      </header>
      {!showResult ? (
        <div className="form-container">
          <form onSubmit={(e) => { e.preventDefault(); generateAffirmation(); }}>
            <div className="form-group">
              <label htmlFor="username">Your Name (to save affirmations)</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter your name..."
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="desire">What do you want at the moment in your life?</label>
              <textarea
                id="desire"
                name="desire"
                value={formData.desire}
                onChange={e => setFormData(prev => ({ ...prev, desire: e.target.value }))}
                placeholder="e.g., inner peace, financial abundance, meaningful relationships..."
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="fear">What is your fear?</label>
              <textarea
                id="fear"
                name="fear"
                value={formData.fear}
                onChange={e => setFormData(prev => ({ ...prev, fear: e.target.value }))}
                placeholder="e.g., fear of failure, fear of rejection, fear of the unknown..."
              />
            </div>
            <div className="form-group">
              <label htmlFor="blessing">Is there anyone's blessing you want to have?</label>
              <input
                type="text"
                id="blessing"
                name="blessing"
                value={formData.blessing}
                onChange={e => setFormData(prev => ({ ...prev, blessing: e.target.value }))}
                placeholder="e.g., Jesus, Guru Nanak, Goddess Athena, Harry Potter..."
              />
            </div>
            <div className="form-group">
              <label htmlFor="outcome">What is your ideal outcome?</label>
              <textarea
                id="outcome"
                name="outcome"
                value={formData.outcome}
                onChange={e => setFormData(prev => ({ ...prev, outcome: e.target.value }))}
                placeholder="Describe your perfect scenario..."
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="address">How should we address you?</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="e.g., my dear friend, beautiful soul, warrior..."
              />
            </div>
            <button type="submit" className="generate-btn">
              Generate My Affirmation ✨
            </button>
          </form>
        </div>
      ) : (
        <div className="result-container">
          <div className="affirmation-card">
            <h2>Your Custom Affirmation</h2>
            <div className="affirmation-text">
              {affirmation}
            </div>
            {saveError && (
              <div className="save-error">
                {saveError}
              </div>
            )}
            <div className="action-buttons">
              <button onClick={copyToClipboard} className="copy-btn">
                📋 Copy Affirmation
              </button>
              <button 
                onClick={saveAffirmation} 
                className="save-btn"
                disabled={saving}
              >
                {saving ? '💾 Saving...' : '💾 Save Affirmation'}
              </button>
              <button onClick={resetForm} className="reset-btn">
                🔄 Create New Affirmation
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Saved Affirmations Modal */}
      {showSaved && (
        <SavedAffirmations
          onClose={() => setShowSaved(false)}
          onSelectAffirmation={handleSelectAffirmation}
        />
      )}
      {/* Auth Modal */}
      {showAuth && (
        <Auth onAuthSuccess={() => {}} onClose={() => setShowAuth(false)} />
      )}
    </div>
  )
}

function App() {
  const [formData, setFormData] = useState({
    username: '',
    desire: '',
    fear: '',
    blessing: '',
    outcome: '',
    address: ''
  })
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(() => {
    // Persist user in localStorage
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const handleAuthSuccess = (result) => {
    setUser({ username: result.username, token: result.token });
    setShowAuth(false);
    setFormData(prev => ({ ...prev, username: result.username }));
  };
  const handleLogout = () => {
    setUser(null);
    setFormData(prev => ({ ...prev, username: '' }));
  };

  const [affirmation, setAffirmation] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [selectedAffirmation, setSelectedAffirmation] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const generateAffirmation = () => {
    const { desire, fear, blessing, outcome, address } = formData
    
    // AI-like generation system with dynamic components
    const components = {
      // Opening phrases with different emotional tones
      openings: [
        ...(address ? [
          `${address}, you are`,
          `Dear ${address},`,
          `Beloved ${address},`,
          `Sacred ${address},`,
          `${address}, I see you`,
          `Beautiful ${address},`,
          `${address}, you have`,
          `Divine ${address},`,
          `${address}, your soul`,
          `Precious ${address},`
        ] : [
          'You are',
          'I see you',
          'Your soul',
          'You have',
          'Within you',
          'Your heart',
          'You carry',
          'Your being',
          'You embody',
          'You radiate'
        ])
      ],

      // Identity affirmations
      identities: [
        'a magnificent being of infinite potential',
        'a creator of realities',
        'a force of nature',
        'a spark of divine light',
        'a masterpiece in progress',
        'a vessel of transformation',
        'a bridge between dreams and reality',
        'a co-creator with the universe',
        'a manifestation of pure possibility',
        'a living miracle',
        'a beacon of light',
        'a catalyst for change',
        'a guardian of your own destiny',
        'a channel for divine wisdom',
        'a reflection of infinite love'
      ],

      // Desire acknowledgment phrases
      desirePhrases: [
        `Your longing for ${desire} is`,
        `The desire in your heart for ${desire} represents`,
        `Your soul's calling for ${desire} is`,
        `The yearning you feel for ${desire} is`,
        `Your vision of ${desire} is`,
        `The dream you hold for ${desire} is`,
        `Your aspiration for ${desire} is`,
        `The passion you have for ${desire} is`,
        `Your intention for ${desire} is`,
        `The purpose you see in ${desire} is`
      ],

      // Desire meanings
      desireMeanings: [
        'not just a wish—it\'s a calling from your soul',
        'the universe speaking through your heart',
        'destiny calling your name',
        'a sacred contract with your future self',
        'the voice of your higher self guiding you',
        'a blueprint for your evolution',
        'the universe conspiring in your favor',
        'a memory from your future, calling you home',
        'the energy of creation flowing through you',
        'a divine assignment for your growth',
        'the cosmos aligning with your purpose',
        'your soul\'s GPS pointing toward fulfillment',
        'the quantum field responding to your frequency',
        'a bridge between who you are and who you\'re becoming',
        'the infinite intelligence working through you'
      ],

      // Fear transformation phrases
      fearTransformations: fear ? [
        `The fear of ${fear} is like a shadow that disappears when you turn on the light of your awareness`,
        `${fear} has been whispering doubts in your ear, but those whispers are just echoes of old stories`,
        `The ${fear} you're experiencing is the old version of yourself trying to protect you`,
        `${fear} is but a mirage on the path—it appears real, but it has no substance`,
        `Your fear of ${fear} is understandable, but it's also holding you back from what you truly deserve`,
        `${fear} is like a cloud passing over the sun—temporary and powerless against your light`,
        `The ${fear} that once seemed so real is dissolving in the presence of your courage`,
        `Your fear of ${fear} is a teacher showing you where you're ready to grow`,
        `The ${fear} you carry is transforming into wisdom as you embrace your power`
      ] : [],

      // Blessing integration phrases
      blessingIntegrations: blessing ? [
        `With the sacred energy of ${blessing} flowing through you, you are divinely supported`,
        `Feel the loving presence of ${blessing} wrapping around you like a warm embrace`,
        `Channel the power of ${blessing}—let their strength, wisdom, and grace flow through you`,
        `Open yourself to the infinite wisdom of ${blessing}, let their energy merge with yours`,
        `Draw inspiration from ${blessing}—their qualities are already part of who you are`,
        `The spirit of ${blessing} is guiding you forward with gentle wisdom`,
        `Let the energy of ${blessing} amplify your own inner light`,
        `With ${blessing} as your ally, you are unstoppable in your journey`,
        `The blessing of ${blessing} is already yours—you just need to claim it`,
        `Feel the resonance between your soul and the energy of ${blessing}`
      ] : [],

      // Outcome vision phrases
      outcomePhrases: [
        `Your vision of ${outcome} is already taking shape in the quantum field of possibilities`,
        `The reality you envision—${outcome}—exists already in the realm of infinite possibilities`,
        `Your ideal outcome of ${outcome} is not just a dream—it's a memory from your future self`,
        `Your vision of ${outcome} is not just possible—it's inevitable`,
        `The reality you seek—${outcome}—is not creating itself; you are creating it`,
        `Your outcome of ${outcome} is not just a goal—it's a promise from the universe`,
        `The manifestation of ${outcome} is already in motion, guided by your intention`,
        `Your vision for ${outcome} is the universe's way of saying "yes" to your soul`,
        `The reality of ${outcome} is not distant—it's drawing closer with every breath`,
        `Your outcome of ${outcome} is not just desired—it's destined`
      ],

      // Empowerment phrases
      empowermentPhrases: [
        'Every breath you take, every step you make, you are co-creating this reality',
        'You are not just worthy of this—you are destined for it',
        'Trust this calling. You are exactly where you need to be',
        'You are the architect of your reality, and you\'re building something extraordinary',
        'Every moment, you are drawing this beautiful future closer to you',
        'You have the skills, the resources, and the inner strength to make this happen',
        'The universe is your co-creator, and together, you are unstoppable',
        'You are not creating it; you are remembering it',
        'Trust yourself, take action, and watch as your reality transforms',
        'You are capable, you are deserving, and you are loved',
        'Everything is unfolding perfectly in divine timing',
        'You are a magnet for miracles and manifestations',
        'Your power to create is infinite and unstoppable',
        'You are the miracle you\'ve been waiting for',
        'The universe is conspiring to bring you everything you desire'
      ],

      // Closing phrases
      closings: [
        'You are exactly where you need to be, and everything is unfolding perfectly.',
        'Trust the process, trust yourself, and trust the magic that is you.',
        'You are not just dreaming—you are becoming.',
        'The best is yet to come, and it\'s already on its way to you.',
        'You are the answer to your own prayers.',
        'Everything you need is already within you.',
        'You are the creator of your own reality.',
        'The universe is rooting for you.',
        'You are more powerful than you know.',
        'Your potential is limitless and your future is bright.'
      ]
    }

    // AI-like generation algorithm
    const generateSentence = (phraseArray) => {
      return phraseArray[Math.floor(Math.random() * phraseArray.length)]
    }

    const shouldInclude = (probability = 0.7) => {
      return Math.random() < probability
    }

    // Build the affirmation dynamically
    let affirmation = ''

    // Opening
    affirmation += generateSentence(components.openings) + ' '
    
    // Identity (if no address was used in opening)
    if (!address || !components.openings[0].includes(address)) {
      affirmation += generateSentence(components.identities) + '. '
    }

    // Desire section
    affirmation += generateSentence(components.desirePhrases) + ' '
    affirmation += generateSentence(components.desireMeanings) + '. '

    // Fear transformation (if fear exists and randomly selected)
    if (fear && shouldInclude(0.8)) {
      affirmation += generateSentence(components.fearTransformations) + '. '
    }

    // Blessing integration (if blessing exists and randomly selected)
    if (blessing && shouldInclude(0.8)) {
      affirmation += generateSentence(components.blessingIntegrations) + '. '
    }

    // Outcome vision
    affirmation += generateSentence(components.outcomePhrases) + '. '

    // Empowerment (multiple phrases for variety)
    const numEmpowermentPhrases = Math.floor(Math.random() * 2) + 1
    for (let i = 0; i < numEmpowermentPhrases; i++) {
      affirmation += generateSentence(components.empowermentPhrases) + ' '
    }

    // Closing
    affirmation += generateSentence(components.closings)

    setAffirmation(affirmation)
    setShowResult(true)
    setSaveError('')
  }

  const saveAffirmation = async () => {
    if (!formData.username.trim()) {
      setSaveError('Please enter a username to save your affirmation')
      return
    }

    setSaving(true)
    setSaveError('')

    try {
      await affirmationsAPI.save({
        ...formData,
        generated_affirmation: affirmation
      })
      alert('Affirmation saved successfully! ✨')
    } catch (error) {
      setSaveError('Failed to save affirmation. Please try again.')
      console.error('Error saving affirmation:', error)
    } finally {
      setSaving(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(affirmation)
      alert('Affirmation copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const resetForm = () => {
    setFormData({
      username: '',
      desire: '',
      fear: '',
      blessing: '',
      outcome: '',
      address: ''
    })
    setAffirmation('')
    setShowResult(false)
    setSaveError('')
  }

  const handleSelectAffirmation = (affirmation) => {
    setSelectedAffirmation(affirmation)
    setShowSaved(false)
    setShowResult(true)
    setAffirmation(affirmation.generated_affirmation)
    setFormData({
      username: affirmation.username,
      desire: affirmation.desire,
      fear: affirmation.fear || '',
      blessing: affirmation.blessing || '',
      outcome: affirmation.outcome,
      address: affirmation.address || ''
    })
  }

  return (
    <Routes>
      <Route path="/" element={
        <MainForm
          formData={formData}
          setFormData={setFormData}
          affirmation={affirmation}
          setAffirmation={setAffirmation}
          showResult={showResult}
          setShowResult={setShowResult}
          showSaved={showSaved}
          setShowSaved={setShowSaved}
          selectedAffirmation={selectedAffirmation}
          setSelectedAffirmation={setSelectedAffirmation}
          saving={saving}
          setSaving={setSaving}
          saveError={saveError}
          setSaveError={setSaveError}
          generateAffirmation={generateAffirmation}
          saveAffirmation={saveAffirmation}
          copyToClipboard={copyToClipboard}
          resetForm={resetForm}
          handleSelectAffirmation={handleSelectAffirmation}
          user={user}
          handleLogout={handleLogout}
          showAuth={showAuth}
          setShowAuth={setShowAuth}
        />
      } />
      <Route path="/journey" element={<JourneyPage />} />
    </Routes>
  )
}

// JourneyPage wrapper to extract username from query param
import { useLocation } from 'react-router-dom'
function JourneyPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const username = params.get('username') || '';
  const navigate = useNavigate();
  return (
    <Journey
      username={username}
      onClose={() => navigate(-1)}
      onSelectAffirmation={() => {}}
    />
  );
}

export default App;
