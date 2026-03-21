// client/src/contexts/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

// Create the context
const AuthContext = createContext();

/**
 * AuthProvider Component
 * 
 * This wraps your entire app and makes auth data available everywhere
 * 
 * What it manages:
 * - user: Current logged-in user object
 * - token: JWT token stored in localStorage
 * - isLoading: While login/register request is happening
 * - error: Error message if login/register fails
 * 
 * Functions it provides:
 * - login(): Call backend, store token, update user
 * - register(): Create new user, store token, update user
 * - logout(): Remove token, clear user
 */
export const AuthProvider = ({ children }) => {
  // State variables
  const [user, setUser] = useState(null);           // Current logged-in user
  const [token, setToken] = useState(null);         // JWT token
  const [isLoading, setIsLoading] = useState(false); // True while submitting form
  const [error, setError] = useState(null);         // Error message

  /**
   * useEffect: Check if user is already logged in
   * 
   * Why we need this:
   * User refreshes page → token is still in localStorage
   * We need to restore user session from token
   * 
   * What it does:
   * 1. On app load, check localStorage for token
   * 2. If token exists, verify it's valid by calling /api/auth/me
   * 3. If valid, set user and token state
   * 4. If invalid, clear token (it's expired)
   */
  useEffect(() => {
    const restoreAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        try {
          // Set token first
          setToken(storedToken);
          
          // Verify token is still valid by getting current user
          const userData = await authService.getCurrentUser(storedToken);
          setUser(userData);
        } catch (err) {
          // Token is expired or invalid
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
    };

    restoreAuth();
  }, []); // Empty dependency array = run once on app load

  /**
   * LOGIN FUNCTION
   * 
   * What it does:
   * 1. Call backend /api/auth/login with email and password
   * 2. Backend returns token and user data
   * 3. Store token in localStorage (persists after page refresh)
   * 4. Update user and token state
   * 5. Return success so page can navigate away
   * 
   * What the page does with this:
   * const { login } = useAuth();
   * await login(email, password);
   * navigate('/dashboard');
   */
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);

      // Call backend API
      const { token: newToken, user: userData } = await authService.login(
        email,
        password
      );

      // Store token in localStorage (survives page refresh)
      localStorage.setItem('token', newToken);

      // Update state
      setToken(newToken);
      setUser(userData);

      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * REGISTER FUNCTION
   * 
   * What it does:
   * 1. Call backend /api/auth/register with name, email, password
   * 2. Backend creates user and returns token + user data
   * 3. Store token in localStorage
   * 4. Update user and token state
   * 5. Return success
   * 
   * Similar to login, but also creates the user first
   */
  const register = async (name, email, password) => {
    try {
      setIsLoading(true);
      setError(null);

      // Call backend API
      const { token: newToken, user: userData } = await authService.register(
        name,
        email,
        password
      );

      // Store token in localStorage
      localStorage.setItem('token', newToken);

      // Update state
      setToken(newToken);
      setUser(userData);

      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * LOGOUT FUNCTION
   * 
   * What it does:
   * 1. Remove token from localStorage
   * 2. Clear user and token state
   * 3. Page should navigate to /login
   */
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  /**
   * THE VALUE OBJECT
   * 
   * This is what every component gets when they use useAuth()
   * 
   * Components can do:
   * const { user, token, login, logout } = useAuth();
   * 
   * And access any of these values/functions
   */
  const value = {
    user,
    token,
    isLoading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token, // True if logged in
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * CUSTOM HOOK: useAuth()
 * 
 * This is how components use the context
 * 
 * Example:
 * function LoginPage() {
 *   const { login, error, isLoading } = useAuth();
 *   // Now I can use login(), error, and isLoading
 * }
 * 
 * It's much cleaner than using useContext(AuthContext) everywhere
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
};