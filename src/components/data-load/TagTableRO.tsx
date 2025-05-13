
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import TestTagButton from './TestTagButton';

interface PiTag {
  tag_id: string;
  tag_name: string;
  description: string;
  unit: string;
  status: string;
  last_value?: string | number;
  last_timestamp?: string;
}

interface TagTableROProps {
  data: PiTag[];
}

const TagTableRO: React.FC<TagTableROProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm ring-1 ring-dark/10 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tag ID</TableHead>
            <TableHead>Tag Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Value</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((tag) => (
            <TableRow key={tag.tag_id}>
              <TableCell className="font-mono text-xs">{tag.tag_id}</TableCell>
              <TableCell className="font-medium">{tag.tag_name}</TableCell>
              <TableCell>{tag.description}</TableCell>
              <TableCell>{tag.unit}</TableCell>
              <TableCell>
                <span className={`alert-badge ${tag.status === 'active' ? 'alert-badge-success' : 'alert-badge-error'}`}>
                  {tag.status}
                </span>
              </TableCell>
              <TableCell>
                {tag.last_value !== undefined ? `${tag.last_value} ${tag.unit}` : 'N/A'}
              </TableCell>
              <TableCell>
                <TestTagButton tagName={tag.tag_name} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TagTableRO;
