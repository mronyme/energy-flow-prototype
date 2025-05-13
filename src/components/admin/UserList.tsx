
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Role } from '../../types';

interface User {
  id: string;
  email: string;
  role: Role;
}

interface UserListProps {
  users: User[];
  onSelect: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ users, onSelect }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm ring-1 ring-dark/10 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow 
              key={user.id} 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onSelect(user)}
            >
              <TableCell className="font-medium">{user.email}</TableCell>
              <TableCell>
                <RoleBadge role={user.role} />
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

interface RoleBadgeProps {
  role: Role;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const getBadgeColor = () => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800';
      case 'DataManager':
        return 'bg-blue-100 text-blue-800';
      case 'Manager':
        return 'bg-green-100 text-green-800';
      case 'Operator':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor()}`}>
      {role}
    </span>
  );
};

export default UserList;
