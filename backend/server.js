const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  // Simplified affirmations table - no user authentication
  db.run(`CREATE TABLE IF NOT EXISTS affirmations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    desire TEXT NOT NULL,
    fear TEXT,
    blessing TEXT,
    outcome TEXT NOT NULL,
    address TEXT,
    generated_affirmation TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Users table for authentication
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  console.log('Database tables initialized.');
}

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'changeme_secret';

// Signup endpoint
app.post('/api/signup', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }
  // Hash password
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json({ error: 'Error hashing password' });
    db.run(
      `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`,
      [username, email, hash],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(409).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Error creating user' });
        }
        res.status(201).json({ message: 'User created successfully' });
      }
    );
  });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
    if (err) return res.status(500).json({ error: 'Error fetching user' });
    if (!user) return res.status(401).json({ error: 'Invalid username or password' });
    bcrypt.compare(password, user.password_hash, (err, result) => {
      if (err) return res.status(500).json({ error: 'Error checking password' });
      if (!result) return res.status(401).json({ error: 'Invalid username or password' });
      // Generate JWT
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ message: 'Login successful', token, username: user.username });
    });
  });
});

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Affirmation Generator API is running' });
});

// Save affirmation
app.post('/api/affirmations', (req, res) => {
  const { username, desire, fear, blessing, outcome, address, generated_affirmation } = req.body;

  if (!username || !desire || !outcome || !generated_affirmation) {
    return res.status(400).json({ error: 'Username, desire, outcome, and affirmation are required' });
  }

  console.log('Attempting to save affirmation:', { username, desire, outcome, generated_affirmation });

  db.run(
    `INSERT INTO affirmations (username, desire, fear, blessing, outcome, address, generated_affirmation) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [username, desire, fear, blessing, outcome, address, generated_affirmation],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Error saving affirmation' });
      }

      console.log('Affirmation saved successfully with ID:', this.lastID);
      res.status(201).json({
        message: 'Affirmation saved successfully',
        id: this.lastID
      });
    }
  );
});

// Get user's affirmations
app.get('/api/affirmations/:username', (req, res) => {
  const { username } = req.params;

  db.all(
    'SELECT * FROM affirmations WHERE username = ? ORDER BY created_at DESC',
    [username],
    (err, affirmations) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching affirmations' });
      }

      res.json({ affirmations });
    }
  );
});

// Get specific affirmation
app.get('/api/affirmations/:username/:id', (req, res) => {
  const { username, id } = req.params;

  db.get(
    'SELECT * FROM affirmations WHERE id = ? AND username = ?',
    [id, username],
    (err, affirmation) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching affirmation' });
      }

      if (!affirmation) {
        return res.status(404).json({ error: 'Affirmation not found' });
      }

      res.json({ affirmation });
    }
  );
});

// Delete affirmation
app.delete('/api/affirmations/:username/:id', (req, res) => {
  const { username, id } = req.params;

  db.run(
    'DELETE FROM affirmations WHERE id = ? AND username = ?',
    [id, username],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error deleting affirmation' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Affirmation not found' });
      }

      res.json({ message: 'Affirmation deleted successfully' });
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
}); 