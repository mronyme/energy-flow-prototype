
import React, { useState, useEffect } from 'react';
import { userService } from '../../services/api';
import { Role } from '../../types';
import UserList from '../../components/admin/UserList';
import UserForm from '../../components/admin/UserForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  role: Role;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Mock users since we don't have a real backend
    const mockUsers = [
      { id: '1', email: 'operator@engie.com', role: 'Operator' as Role },
      { id: '2', email: 'datamanager@engie.com', role: 'DataManager' as Role },
      { id: '3', email: 'manager@engie.com', role: 'Manager' as Role },
      { id: '4', email: 'admin@engie.com', role: 'Admin' as Role },
    ];
    
    setUsers(mockUsers);
    setLoading(false);
  }, []);
  
  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
  };
  
  const handleCreateUser = async (email: string, role: Role) => {
    try {
      const newUser = await userService.createUser(email, role);
      
      // Add to local state
      setUsers(prev => [...prev, { id: newUser.id, email, role }]);
      
      toast.success('User created');
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark">User Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <UserList users={users} onSelect={handleUserSelect} />
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <UserForm onSubmit={handleCreateUser} />
        </div>
      </div>
    </div>
  );
};

export default Users;
