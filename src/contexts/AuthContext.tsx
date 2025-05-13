
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Role } from '../types';
import { toast } from 'sonner';

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
  const navigate = useNavigate();

  // Check if user is already logged in and set up auth state listener
  useEffect(() => {
    // First set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (session?.user) {
          try {
            // Get user role from profiles table or create profile if it doesn't exist
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
            
            if (profileError) {
              if (profileError.code === 'PGRST116') {
                // Profile doesn't exist, create it with default role or role from metadata
                const metadata = session.user.user_metadata || {};
                const role = (metadata.role as Role) || 'Operator';
                
                console.log('Creating profile for user:', session.user.id, 'with role:', role);
                
                const { error: insertError } = await supabase
                  .from('profiles')
                  .insert({
                    id: session.user.id,
                    role: role
                  });
                
                if (insertError) {
                  console.error('Error creating user profile:', insertError);
                  toast.error('Error setting up user profile');
                  return;
                }
                
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                  role
                });
                
                toast.success(`Logged in as ${role}`);
              } else {
                console.error('Error fetching user profile:', profileError);
                toast.error('Error loading user profile');
                return;
              }
            } else {
              const role = profileData?.role as Role || 'Operator';
              
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                role
              });
              
              if (event === 'SIGNED_IN') {
                toast.success(`Welcome back`);
              }
            }
            
            // Redirect to dashboard if on login page
            if (window.location.pathname === '/login') {
              navigate('/');
            }
          } catch (err) {
            console.error('Error processing auth state change:', err);
            toast.error('Authentication error');
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          navigate('/login');
        }
      }
    );

    // Then check for existing session
    const checkCurrentSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('Found existing session:', session.user.id);
          
          // Get user role from profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) {
            if (profileError.code === 'PGRST116') {
              // Profile doesn't exist, create it with default role or role from metadata
              const metadata = session.user.user_metadata || {};
              const role = (metadata.role as Role) || 'Operator';
              
              console.log('Creating profile for existing user:', session.user.id);
              
              const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: session.user.id,
                  role: role
                });
              
              if (insertError) {
                console.error('Error creating user profile during session check:', insertError);
                setLoading(false);
                return;
              }
              
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                role
              });
            } else {
              console.error('Error fetching user profile during session check:', profileError);
              setLoading(false);
              return;
            }
          } else {
            const role = profileData?.role as Role || 'Operator';
            
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              role
            });
          }
          
          // Redirect to dashboard if on login page
          if (window.location.pathname === '/login') {
            navigate('/');
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
      
      if (data?.user) {
        console.log('Login successful:', data.user.id);
        
        // User role will be handled by the auth state change listener
        toast.success('Login successful');
      }
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
      }
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
