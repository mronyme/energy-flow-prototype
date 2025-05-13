
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PiTag } from '@/types';

interface TagTableROProps {
  data: PiTag[];
  actionColumn?: (tag: PiTag) => React.ReactNode;
}

const TagTableRO: React.FC<TagTableROProps> = ({ data, actionColumn }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm ring-1 ring-dark/10 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Status</TableHead>
            {actionColumn && <TableHead>Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((tag) => (
            <TableRow key={tag.id}>
              <TableCell className="font-mono text-xs">{tag.id}</TableCell>
              <TableCell className="font-medium">{tag.name}</TableCell>
              <TableCell>{tag.description}</TableCell>
              <TableCell>{tag.unit}</TableCell>
              <TableCell>
                {tag.status && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    tag.status === 'OK' ? 'bg-green-100 text-green-800' : 
                    tag.status === 'KO' ? 'bg-red-100 text-red-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {tag.status}
                  </span>
                )}
              </TableCell>
              {actionColumn && <TableCell>{actionColumn(tag)}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TagTableRO;
