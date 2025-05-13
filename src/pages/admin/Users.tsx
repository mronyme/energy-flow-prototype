
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import UserList from '@/components/admin/UserList';
import UserForm from '@/components/admin/UserForm';
import { adminService } from '@/services/api';
import { toast } from 'sonner';
import { Role } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface User {
  id: string;
  email: string;
  role: Role;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersData = await adminService.getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    // In a real app, this would open a user details/edit view
    toast.info(`Selected user: ${user.email}`);
  };
  
  const handleOpenCreateDialog = () => {
    setDialogOpen(true);
  };
  
  const handleCreateUser = async (data: { email: string; password: string; role: Role }) => {
    try {
      setCreating(true);
      
      // Call service to create user
      const result = await adminService.createUser({
        email: data.email,
        password: data.password,
        role: data.role
      });
      
      if (result.success) {
        // Add new user to list
        setUsers(prev => [...prev, result.user]);
        
        // IF-09: Green toast "User created"
        toast.success('User created');
        
        // Close dialog
        setDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    } finally {
      setCreating(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-dark">User Management</h1>
        
        <Button 
          onClick={handleOpenCreateDialog}
          className="transition-all duration-100 ease-out"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>
      
      <Card className="shadow-sm ring-1 ring-dark/10">
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : users.length > 0 ? (
            <UserList users={users} onSelect={handleUserSelect} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              No users found
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <UserForm onSubmit={handleCreateUser} isSubmitting={creating} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
