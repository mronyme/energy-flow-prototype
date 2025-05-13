
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Fixed import path
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Role } from '@/types';
import { Eye, EyeOff } from 'lucide-react';
import { useAnnouncer } from '@/components/common/A11yAnnouncer';

// Define demo password outside functions for consistent access across component
const DEMO_PASSWORD = 'demo123456';

const Login = () => {
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('Operator');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  
  const [activeTab, setActiveTab] = useState('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { announce } = useAnnouncer();
  
  const { login, signup, loading, user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await login(email, password);
      announce('Login successful. Redirecting to dashboard.', true);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validation
    if (signupPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      announce('Signup failed. Passwords do not match.', true);
      setIsSubmitting(false);
      return;
    }
    
    if (signupPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      announce('Signup failed. Password must be at least 6 characters long.', true);
      setIsSubmitting(false);
      return;
    }
    
    try {
      await signup(signupEmail, signupPassword, role);
      setActiveTab('login');
      announce('Signup successful. You can now log in.', true);
      
      // Clear signup form
      setSignupEmail('');
      setSignupPassword('');
      setConfirmPassword('');
      setRole('Operator');
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Improved handleDemoLogin function
  const handleDemoLogin = async (demoEmail: string) => {
    try {
      setIsSubmitting(true);
      announce(`Attempting demo login with ${demoEmail}...`, true);
      
      // First check if the user already exists by attempting to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: DEMO_PASSWORD
      });
      
      if (signInData?.user) {
        // User exists and login was successful
        toast.success('Demo login successful!');
        announce('Demo login successful. Redirecting to dashboard.', true);
        return;
      }
      
      // User doesn't exist or credentials are wrong, attempt to create the account
      console.log('Creating demo account:', demoEmail);
      const role = getRoleFromEmail(demoEmail);
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: demoEmail,
        password: DEMO_PASSWORD,
        options: {
          data: {
            role
          }
        }
      });
      
      if (signUpError) {
        throw signUpError;
      }
      
      if (signUpData?.user) {
        toast.success('Demo account created. Signing in...');
        announce('Demo account created. Signing in...', true);
        
        // Try to sign in with the newly created account
        const { data: finalSignInData, error: finalSignInError } = await supabase.auth.signInWithPassword({
          email: demoEmail,
          password: DEMO_PASSWORD
        });
        
        if (finalSignInError) {
          throw finalSignInError;
        }
        
        if (finalSignInData?.user) {
          toast.success('Demo login successful!');
          announce('Demo login successful. Redirecting to dashboard.', true);
        }
      }
      
    } catch (error: any) {
      console.error('Demo login error:', error);
      toast.error(`Login failed: ${error.message || 'Unknown error'}`);
      announce('Demo login failed. Please try again.', true);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper function to get role from email
  const getRoleFromEmail = (email: string): Role => {
    if (email.includes('admin')) return 'Admin';
    if (email.includes('manager')) return 'Manager';
    if (email.includes('datamanager')) return 'DataManager';
    return 'Operator';
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    announce(showPassword ? 'Password hidden' : 'Password visible', false);
  };

  const toggleSignupPasswordVisibility = () => {
    setShowSignupPassword(!showSignupPassword);
    announce(showSignupPassword ? 'Password hidden' : 'Password visible', false);
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
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form className="space-y-6" onSubmit={handleLoginSubmit}>
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
                      disabled={isSubmitting || loading}
                      className="focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      disabled={isSubmitting || loading}
                      className="focus:ring-primary focus:border-primary pr-10"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isSubmitting || loading}
                  >
                    {isSubmitting || loading ? 'Signing in...' : 'Sign in'}
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form className="space-y-6" onSubmit={handleSignupSubmit}>
                <div>
                  <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <Input
                      id="signup-email"
                      name="signup-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="Enter your email"
                      disabled={isSubmitting || loading}
                      className="focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <Input
                      id="signup-password"
                      name="signup-password"
                      type={showSignupPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Create a password (min. 6 characters)"
                      disabled={isSubmitting || loading}
                      className="focus:ring-primary focus:border-primary pr-10"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={toggleSignupPasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      aria-label={showSignupPassword ? "Hide password" : "Show password"}
                    >
                      {showSignupPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="mt-1">
                    <Input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      disabled={isSubmitting || loading}
                      className="focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <div className="mt-1">
                    <Select
                      value={role}
                      onValueChange={(value) => setRole(value as Role)}
                      disabled={isSubmitting || loading}
                    >
                      <SelectTrigger id="role" className="w-full">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Operator">Operator</SelectItem>
                        <SelectItem value="DataManager">Data Manager</SelectItem>
                        <SelectItem value="Manager">Energy Manager</SelectItem>
                        <SelectItem value="Admin">IT Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isSubmitting || loading}
                  >
                    {isSubmitting || loading ? 'Creating account...' : 'Create account'}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
          
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
                    disabled={isSubmitting || loading}
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
                    disabled={isSubmitting || loading}
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
                    disabled={isSubmitting || loading}
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
                    disabled={isSubmitting || loading}
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
