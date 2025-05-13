
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(email, password);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    // For demo purposes, we'll add a demo user to Supabase Auth
    try {
      const demoPassword = 'demo123456'; // Simple password for demo accounts
      
      // Check if user exists first
      const { data: existingUsers } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword
      });
      
      if (existingUsers?.user) {
        // User exists, log them in
        await login(demoEmail, demoPassword);
      } else {
        // Create the demo user
        const { data, error } = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPassword
        });
        
        if (error) throw error;
        
        toast.success('Demo account created! Logging in...');
        setTimeout(() => {
          login(demoEmail, demoPassword);
        }, 1000);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to use demo account');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <img src="/logo.png" alt="ENGIE Logo" className="h-12 w-auto" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-dark">
            MAXI V2
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Energy Monitoring Platform
          </p>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
            </div>
            
            <div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Demo Accounts
                </span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 gap-3">
              <div className="text-sm text-center">
                <p className="text-gray-500 mb-2">
                  Click on one of the following demo accounts to log in:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Button 
                    variant="outline" 
                    className="bg-gray-50 p-2 rounded h-auto"
                    onClick={() => handleDemoLogin('operator@engie.com')}
                  >
                    <div>
                      <p className="font-medium">Operator</p>
                      <p className="text-gray-600">operator@engie.com</p>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-gray-50 p-2 rounded h-auto"
                    onClick={() => handleDemoLogin('datamanager@engie.com')}
                  >
                    <div>
                      <p className="font-medium">Data Manager</p>
                      <p className="text-gray-600">datamanager@engie.com</p>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-gray-50 p-2 rounded h-auto"
                    onClick={() => handleDemoLogin('manager@engie.com')}
                  >
                    <div>
                      <p className="font-medium">Energy Manager</p>
                      <p className="text-gray-600">manager@engie.com</p>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-gray-50 p-2 rounded h-auto"
                    onClick={() => handleDemoLogin('admin@engie.com')}
                  >
                    <div>
                      <p className="font-medium">IT Admin</p>
                      <p className="text-gray-600">admin@engie.com</p>
                    </div>
                  </Button>
                </div>
                <p className="text-gray-500 mt-2">
                  Password is automatically handled in this demo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
