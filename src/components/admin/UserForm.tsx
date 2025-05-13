
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Role } from '../../types';

interface UserFormProps {
  onSubmit: (email: string, role: Role) => Promise<void>;
}

const UserForm: React.FC<UserFormProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('Operator');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onSubmit(email, role);
      // Reset form
      setEmail('');
      setRole('Operator');
    } catch (err) {
      console.error(err);
      setError('Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New User</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@engie.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">
              Role
            </label>
            <Select 
              value={role} 
              onValueChange={(value) => setRole(value as Role)}
            >
              <SelectTrigger>
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
          
          {error && (
            <div className="text-sm text-red-500 p-2 bg-red-50 rounded">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create User'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default UserForm;
