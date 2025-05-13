
import React from 'react';
import UserForm from './UserForm';
import { UserFormProps, Role } from '@/types';

// This is an adapter component that translates between the API of UserForm and the Users.tsx component
const UserFormAdapter = ({
  onSubmit,
  isSubmitting
}: UserFormProps) => {
  // Convert the onSubmit function signature to match what's expected by Users.tsx
  const handleSubmit = (formData: { email: string; password: string; role: Role }) => {
    return onSubmit(formData);
  };

  return <UserForm onSubmit={handleSubmit} />;
};

export default UserFormAdapter;
