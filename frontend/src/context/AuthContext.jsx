import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Restore auth state on mount if token exists
  useEffect(() => {
    const restoreAuth = () => {
      if (token) {
        try {
          // Normally you'd want a /me endpoint to fetch current user data
          // But since the API specs only provided login/signup returning user object,
          // we'll rely on localstorage for session persistence.
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setRole(parsedUser.role);
            setIsAuthenticated(true);
          } else {
            // If token exists but no user data, clear state
            logout();
          }
        } catch (error) {
          logout();
        }
      }
      setInitialLoad(false);
    };
    
    restoreAuth();
  }, [token]);

  const login = async (email, password, role) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password, role });
      
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data.data;
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setToken(newToken);
        setUser(userData);
        setRole(userData.role);
        setIsAuthenticated(true);
        
        toast.success(response.data.message || 'Successfully logged in!');
        return { success: true };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Login failed';
      toast.error(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password, role) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/signup', { name, email, password, role });
      
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data.data;
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setToken(newToken);
        setUser(userData);
        setRole(userData.role);
        setIsAuthenticated(true);
        
        toast.success(response.data.message || 'Account created successfully!');
        return { success: true };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Signup failed';
      toast.error(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
    toast.success('Successfully logged out');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    token,
    role,
    isAuthenticated,
    loading,
    initialLoad,
    login,
    signup,
    logout,
    setUser: updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!initialLoad && children}
    </AuthContext.Provider>
  );
};
