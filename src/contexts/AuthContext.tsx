import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Role } from '../types';
import { toast } from 'sonner';
import { Session } from '@supabase/supabase-js';

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
  signup: (email: string, password: string, role: Role) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  // Unified function to fetch and set user profile
  const fetchAndSetUserProfile = async (userId: string, userEmail: string | null) => {
    try {
      // Get user role from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return null;
      }
      
      // If profile exists, return user with role
      if (profileData) {
        console.log('Profile found with role:', profileData.role);
        // Handle different casing in role values (ensure it matches our Role type)
        const normalizedRole = normalizeRole(profileData.role as string);
        
        return {
          id: userId,
          email: userEmail || '',
          role: normalizedRole
        };
      }
      
      // Profile doesn't exist, get role from user metadata or use default
      const { data: userData } = await supabase.auth.getUser();
      const metadata = userData?.user?.user_metadata || {};
      const metadataRole = metadata.role ? normalizeRole(metadata.role as string) : 'Operator';
      
      console.log('Creating profile with role from metadata:', metadataRole);
      
      // Create profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          role: metadataRole
        });
      
      if (insertError) {
        console.error('Error creating user profile:', insertError);
        toast.error('Error setting up user profile');
        return null;
      }
      
      return {
        id: userId,
        email: userEmail || '',
        role: metadataRole
      };
    } catch (error) {
      console.error('Error in fetchAndSetUserProfile:', error);
      return null;
    }
  };

  // Helper function to normalize role values to our expected Role types
  const normalizeRole = (role: string): Role => {
    // Convert to lowercase for consistent comparison
    const lowercaseRole = role.toLowerCase();
    
    // Map role strings to our Role type values
    if (lowercaseRole === 'admin') return 'Admin';
    if (lowercaseRole === 'datamanager' || lowercaseRole === 'data manager' || lowercaseRole === 'data_manager') return 'DataManager';
    if (lowercaseRole === 'manager') return 'Manager';
    
    // Default to Operator if no match
    return 'Operator';
  };

  // Handle auth state changes and session initialization
  useEffect(() => {
    // First set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, sessionData) => {
        console.log('Auth state changed:', event, sessionData?.user?.id);
        setSession(sessionData);
        
        if (sessionData?.user) {
          const userId = sessionData.user.id;
          const userEmail = sessionData.user.email;
          
          // Use setTimeout to avoid potential deadlocks with Supabase auth
          setTimeout(async () => {
            const userProfile = await fetchAndSetUserProfile(userId, userEmail);
            
            if (userProfile) {
              setUser(userProfile);
              
              if (event === 'SIGNED_IN') {
                toast.success(`Welcome back`);
                
                // Redirect to dashboard if on login page
                if (window.location.pathname === '/login') {
                  navigate('/');
                }
              }
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          navigate('/login');
        }
      }
    );

    // Then check for existing session
    const checkCurrentSession = async () => {
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        setSession(existingSession);
        
        if (existingSession?.user) {
          const userId = existingSession.user.id;
          const userEmail = existingSession.user.email;
          
          const userProfile = await fetchAndSetUserProfile(userId, userEmail);
          
          if (userProfile) {
            setUser(userProfile);
            
            // Redirect to dashboard if on login page
            if (window.location.pathname === '/login') {
              navigate('/');
            }
          }
        }
      } catch (error) {
        console.error('Error checking authentication status', error);
      } finally {
        setLoading(false);
      }
    };

    checkCurrentSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('Logging in with:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      // User and session will be handled by the auth state change listener
      toast.success('Login successful');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // More specific error messages for better accessibility
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password. Please try again.');
      } else if (error.message.includes('Email not confirmed')) {
        toast.error('Please confirm your email before logging in.');
      } else {
        toast.error(error.message || 'Login failed. Please try again.');
      }
      
      throw error; // Re-throw to allow error handling in the component
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, role: Role = 'Operator') => {
    setLoading(true);
    try {
      // Create the user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role // This will be stored in user metadata
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.user) {
        // Create the profile record immediately
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              role: role
            });
            
          if (profileError) {
            console.error('Error creating profile during signup:', profileError);
            toast.error('Account created but profile setup failed');
          }
        } catch (profileErr) {
          console.error('Failed to create profile during signup:', profileErr);
        }
        
        toast.success('Account created successfully! You can now log in.');
        return;
      }
      
      toast.success('Signup successful! Please check your email to confirm your account.');
      
    } catch (error: any) {
      if (error.message.includes('unique constraint')) {
        toast.error('This email is already registered. Please use another email or log in.');
      } else {
        toast.error(error.message || 'Failed to create account. Please try again.');
      }
      throw error; // Re-throw to allow error handling in the component
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Error logging out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
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
