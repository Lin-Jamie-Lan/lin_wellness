const API_BASE_URL = 'http://localhost:3001/api';

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Affirmations API
export const affirmationsAPI = {
  // Save a new affirmation
  save: async (affirmationData) => {
    return await apiRequest('/affirmations', {
      method: 'POST',
      body: JSON.stringify(affirmationData),
    });
  },

  // Get all user's affirmations
  getAll: async (username) => {
    const data = await apiRequest(`/affirmations/${username}`);
    return data.affirmations || [];
  },

  // Get a specific affirmation
  getById: async (username, id) => {
    const data = await apiRequest(`/affirmations/${username}/${id}`);
    return data.affirmation;
  },

  // Delete an affirmation
  delete: async (username, id) => {
    return await apiRequest(`/affirmations/${username}/${id}`, {
      method: 'DELETE',
    });
  },
};

// Health check API
export const healthAPI = {
  check: async () => {
    return await apiRequest('/health');
  },
};

// Auth API
export const authAPI = {
  register: async (username, email, password) => {
    username = username.toLowerCase();
    const data = await apiRequest('/signup', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    return { user: { username, email }, ...data };
  },
  login: async (username, password) => {
    username = username.toLowerCase();
    const data = await apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    return { user: { username }, token: data.token, ...data };
  },
}; 