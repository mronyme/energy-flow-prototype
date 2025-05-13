
import React, { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import UserFormAdapter from '@/components/admin/UserFormAdapter';
import UserList from '@/components/admin/UserList';
import { toast } from 'sonner';
import { Role, User } from '@/types';
import { adminService } from '@/services/api';
import { useAnnouncer } from '@/components/common/A11yAnnouncer';
import SkipLinkAdapter from '@/components/common/SkipLinkAdapter';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await adminService.getUsers();
        setUsers(data);
        console.log('Loaded users:', data);
      } catch (error) {
        console.error('Error loading users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    
    loadUsers();
  }, []);

  const handleCreateUser = async (formData: { email: string; password: string; role: Role }) => {
    try {
      setLoading(true);
      const result = await adminService.createUser(formData);
      
      if (result) {
        toast.success('User created successfully');
        setUsers(prev => [...prev, result]);
        setActiveTab('list');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      let errorMessage = 'Failed to create user';
      
      // Improved error handling for demo
      if (error instanceof Error) {
        if (error.message.includes('unique constraint')) {
          errorMessage = 'This email is already registered';
        } else if (error.message.includes('email')) {
          errorMessage = 'Invalid email format';
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <SkipLinkAdapter href="#users-heading" label="Skip to user management" />
      
      <h1 id="users-heading" className="text-2xl font-bold mb-6">User Management</h1>
      
      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="list">User List</TabsTrigger>
            <TabsTrigger value="create">Create User</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            {!loading && users.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No users found. Create a new user to get started.
              </div>
            ) : (
              <UserList users={users} />
            )}
          </TabsContent>
          
          <TabsContent value="create">
            <UserFormAdapter 
              onSubmit={handleCreateUser} 
              isSubmitting={loading} 
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Users;
