
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
        // The data from getUsers matches the User type, so we can cast it
        setUsers(data as User[]);
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
        setUsers(prev => [...prev, result as User]);
        setActiveTab('list');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
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
            <UserList users={users} />
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
