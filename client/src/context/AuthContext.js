import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { auth } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Simple token verification
  const verifyToken = (token) => {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      if (decoded.exp < Date.now()) {
        return null; // Token expired
      }
      return decoded;
    } catch (error) {
      return null;
    }
  };

  // Check if user is logged in on app start
  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in with Firebase
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          role: 'user' // Default role
        };
        
        setUser(userData);
        setUserProfile(userData);
        
        // Get custom token from backend
        try {
          const response = await api.post('/auth/firebase-token', {
            uid: firebaseUser.uid,
            email: firebaseUser.email
          });
          
          if (response.data.token) {
            localStorage.setItem('authToken', response.data.token);
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
          }
        } catch (error) {
          console.log('Failed to get custom token:', error);
        }
      } else {
        // Check for fallback token
        const token = localStorage.getItem('authToken');
        if (token) {
          const userData = verifyToken(token);
          if (userData) {
            setUser(userData);
            setUserProfile(userData);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          } else {
            localStorage.removeItem('authToken');
            delete api.defaults.headers.common['Authorization'];
          }
        } else {
          setUser(null);
          setUserProfile(null);
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Register new user
  const register = async (email, password, displayName, role = 'user') => {
    try {
      setLoading(true);
      
      const registrationData = {
        email,
        password,
        name: displayName,
        role
      };
      
      console.log('Registering user with data:', { ...registrationData, password: '[HIDDEN]' });
      
      const response = await api.post('/auth/register', registrationData);
      
      console.log('Registration response:', response.data);

      if (response.data.user) {
        setUser(response.data.user);
        setUserProfile(response.data.user);
        
        // Store token if provided
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        }
        
        toast.success('Registration successful!');
        return response.data.user;
      }
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error details:', error.response?.data);
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (username, password) => {
    try {
      setLoading(true);
      
      const response = await api.post('/auth/login', {
        username,
        password
      });

      if (response.data.token) {
        const userData = response.data.user;
        
        // Store token in localStorage
        localStorage.setItem('authToken', response.data.token);
        
        // Set token in API headers
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        setUser(userData);
        setUserProfile(userData);
        toast.success('Login successful!');
        return userData;
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      // Remove token from localStorage
      localStorage.removeItem('authToken');
      
      // Remove token from API headers
      delete api.defaults.headers.common['Authorization'];
      
      setUser(null);
      setUserProfile(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      const response = await api.put('/auth/profile', updates);

      // Update local state
      const updatedUser = { ...userProfile, ...updates };
      setUserProfile(updatedUser);
      setUser(updatedUser);

      toast.success('Profile updated successfully');
      return response.data;
    } catch (error) {
      console.error('Profile update error:', error);
      const message = error.response?.data?.error || 'Profile update failed';
      toast.error(message);
      throw error;
    }
  };

  // Get user profile
  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUserProfile(response.data.user);
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    register,
    login,
    logout,
    updateProfile,
    fetchUserProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isCashier: user?.role === 'cashier'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 