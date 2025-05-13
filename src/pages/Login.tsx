
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(email, password);
      toast.success('Login successful');
      navigate('/');
    } catch (error) {
      toast.error('Invalid credentials');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <img src="/logo.png" alt="ENGIE Logo" className="h-12 w-auto" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
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
                className="w-full"
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
                  Use one of the following demo accounts:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="font-medium">Operator</p>
                    <p className="text-gray-600">operator@engie.com</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="font-medium">Data Manager</p>
                    <p className="text-gray-600">datamanager@engie.com</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="font-medium">Energy Manager</p>
                    <p className="text-gray-600">manager@engie.com</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="font-medium">IT Admin</p>
                    <p className="text-gray-600">admin@engie.com</p>
                  </div>
                </div>
                <p className="text-gray-500 mt-2">
                  Password field can be left empty in this demo
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
