# Lin Wellness Backend API

Backend server for the Custom Affirmation Generator with user authentication and affirmation storage.

## Features

- **User Authentication**: Register, login, and JWT token management
- **Affirmation Storage**: Save, retrieve, and manage personalized affirmations
- **SQLite Database**: Lightweight, file-based database
- **RESTful API**: Clean, RESTful endpoints
- **Security**: Password hashing, JWT authentication, CORS support

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

3. **Server will run on:** `http://localhost:5000`

## API Endpoints

### Authentication

#### Register User
```
POST /api/register
Content-Type: application/json

{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login User
```
POST /api/login
Content-Type: application/json

{
  "username": "user123",
  "password": "password123"
}
```

### Affirmations

#### Save Affirmation
```
POST /api/affirmations
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "desire": "inner peace",
  "fear": "fear of failure",
  "blessing": "Jesus",
  "outcome": "living a peaceful life",
  "address": "my dear friend",
  "generated_affirmation": "Your personalized affirmation text..."
}
```

#### Get User's Affirmations
```
GET /api/affirmations
Authorization: Bearer <jwt-token>
```

#### Get Specific Affirmation
```
GET /api/affirmations/:id
Authorization: Bearer <jwt-token>
```

#### Delete Affirmation
```
DELETE /api/affirmations/:id
Authorization: Bearer <jwt-token>
```

### User Profile

#### Get User Profile
```
GET /api/profile
Authorization: Bearer <jwt-token>
```

### Health Check

#### Check API Status
```
GET /api/health
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Affirmations Table
```sql
CREATE TABLE affirmations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  desire TEXT NOT NULL,
  fear TEXT,
  blessing TEXT,
  outcome TEXT NOT NULL,
  address TEXT,
  generated_affirmation TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

## Security Features

- **Password Hashing**: Uses bcryptjs for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **CORS Support**: Configured for cross-origin requests
- **Input Validation**: Validates required fields
- **SQL Injection Protection**: Uses parameterized queries

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error 