
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role } from '../types';

interface User {
  id: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock users for the prototype
const MOCK_USERS: User[] = [
  { id: '1', email: 'operator@engie.com', role: 'Operator' },
  { id: '2', email: 'datamanager@engie.com', role: 'DataManager' },
  { id: '3', email: 'manager@engie.com', role: 'Manager' },
  { id: '4', email: 'admin@engie.com', role: 'Admin' },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on initial load
    const storedUser = localStorage.getItem('maxi_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find user by email (case insensitive)
      const foundUser = MOCK_USERS.find(
        u => u.email.toLowerCase() === email.toLowerCase()
      );
      
      if (!foundUser) {
        throw new Error('Invalid credentials');
      }
      
      // In a real app, we would validate the password here
      
      // Store user in localStorage
      localStorage.setItem('maxi_user', JSON.stringify(foundUser));
      setUser(foundUser);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Clear stored user
      localStorage.removeItem('maxi_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
