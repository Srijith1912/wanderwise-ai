// client/src/services/authService.js

import axios from 'axios';

/**
 * WHAT THIS FILE DOES:
 * 
 * This is an "API Service" - it handles all communication with the backend
 * 
 * Think of it as a phone line to the backend:
 * - "Hey backend, I want to login"
 * - Backend responds with token
 * - "Hey backend, get my user info"
 * - Backend responds with user data
 */

// Create axios instance with base URL
// All requests to this instance will go to http://localhost:5000
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

/**
 * AXIOS INTERCEPTOR
 * 
 * What it does:
 * Every time we make a request, automatically add the JWT token to the header
 * 
 * This is CRUCIAL because protected endpoints need the token
 * 
 * Without this, we'd have to add the token manually to every request:
 * axios.get('/auth/me', {
 *   headers: { Authorization: `Bearer ${token}` }
 * })
 * 
 * With this interceptor, it's automatic:
 * axios.get('/auth/me')  // Token added automatically!
 * 
 * How it works:
 * 1. Before sending request, interceptor runs
 * 2. Checks localStorage for token
 * 3. If token exists, adds: Authorization: "Bearer <token>"
 * 4. Then sends the request
 */
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Add token to Authorization header
      // Format: "Authorization: Bearer <token>"
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * REGISTER API CALL
 * 
 * What it does:
 * 1. Sends POST request to /api/auth/register
 * 2. Backend creates user and returns token + user data
 * 
 * Usage in AuthContext:
 * const { token, user } = await authService.register(name, email, password);
 */
export const register = async (name, email, password) => {
  try {
    const response = await API.post('/auth/register', {
      name,
      email,
      password,
    });

    // Response format from backend:
    // {
    //   success: true,
    //   token: "eyJhbGciOi...",
    //   user: { id: "507f...", name: "John", email: "john@example.com" }
    // }

    return {
      token: response.data.token,
      user: response.data.user,
    };
  } catch (error) {
    // Throw error so AuthContext can handle it
    throw error;
  }
};

/**
 * LOGIN API CALL
 * 
 * What it does:
 * 1. Sends POST request to /api/auth/login
 * 2. Backend verifies credentials and returns token + user data
 * 
 * Usage in AuthContext:
 * const { token, user } = await authService.login(email, password);
 */
export const login = async (email, password) => {
  try {
    const response = await API.post('/auth/login', {
      email,
      password,
    });

    return {
      token: response.data.token,
      user: response.data.user,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * GET CURRENT USER API CALL
 * 
 * What it does:
 * 1. Sends GET request to /api/auth/me (protected endpoint)
 * 2. Middleware checks token
 * 3. Backend returns current user data
 * 
 * This is used to:
 * - Restore user session on page refresh
 * - Verify token is still valid
 * 
 * Usage in AuthContext:
 * const user = await authService.getCurrentUser(token);
 */
export const getCurrentUser = async (token) => {
  try {
    // Temporarily set the token for this request
    const response = await API.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.user;
  } catch (error) {
    throw error;
  }
};

export default API;