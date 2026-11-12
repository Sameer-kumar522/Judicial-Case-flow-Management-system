
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check existing login
  useEffect(() => {
    const checkAuth = async () => {
      const token =
        localStorage.getItem('token') ||
        sessionStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      } catch (error) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login
  const login = async (email, password, rememberMe) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });

    const token = response.data.token;
    const loggedInUser = response.data.user;

    if (!token || !loggedInUser) {
      throw new Error('Invalid login response from server.');
    }

    // Clear previous tokens
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');

    // Save new token
    if (rememberMe === true) {
      localStorage.setItem('token', token);
    } else {
      sessionStorage.setItem('token', token);
    }

    // Update logged-in user
    setUser(loggedInUser);

    return loggedInUser;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
