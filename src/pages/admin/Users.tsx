
import React, { useState, useEffect } from 'react';
import UserList from '@/components/admin/UserList';
import UserForm from '@/components/admin/UserForm';
import { adminService } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAnnouncer } from '@/components/common/A11yAnnouncer';
import { Role } from '@/types';

type User = {
  id: string;
  email: string;
  role: Role;
};

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { announcer, announce } = useAnnouncer();

  // Fetch users on component mount
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await adminService.getUsers();
      setUsers(usersData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to handle user selection
  const handleSelectUser = (user: User) => {
    console.log("User selected:", user);
  };

  // Handle user creation
  const handleCreateUser = async (formData: {
    email: string;
    password: string;
    role: Role;
  }) => {
    try {
      setLoading(true);
      
      // Call API to create user (IF-09)
      const result = await adminService.createUser(formData);
      
      if (result.success) {
        // Success message
        toast.success({
          title: "User created",
          description: `User ${formData.email} created successfully`
        });
        announce("User created successfully", false);
        
        // Close dialog and refresh list
        setDialogOpen(false);
        await fetchUsers();
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error({
        title: 'Error',
        description: 'Failed to create user'
      });
      setLoading(false);
    }
  };

  return (
    <>
      {announcer} {/* Screen reader announcements */}
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark mb-2">User Management</h1>
        <p className="text-gray-600">
          Create and manage users with different roles.
        </p>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold">Users</h2>
          <p className="text-sm text-gray-500">{users.length} users total</p>
        </div>
        
        <Button onClick={() => setDialogOpen(true)}>
          Create User
        </Button>
      </div>
      
      {/* User List */}
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <span className="sr-only">Loading users...</span>
        </div>
      ) : (
        <UserList 
          users={users} 
          onSelect={handleSelectUser}
        />
      )}
      
      {/* Create User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <UserForm onSubmit={handleCreateUser} isSubmitting={loading} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Users;
