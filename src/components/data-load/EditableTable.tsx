
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save } from 'lucide-react';

interface EditableTableProps {
  data: Array<{
    id: string;
    name: string;
    value: number | null;
    unit: string;
  }>;
  onSave: (id: string, value: number) => void;
}

const EditableTable: React.FC<EditableTableProps> = ({ data, onSave }) => {
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  
  const handleInputChange = (id: string, value: string) => {
    setEditValues(prev => ({ ...prev, [id]: value }));
    
    // Validate the input
    if (value.trim() === '') {
      setEditErrors(prev => ({ ...prev, [id]: 'Value is required' }));
    } else if (isNaN(parseFloat(value)) || parseFloat(value) < 0) {
      setEditErrors(prev => ({ ...prev, [id]: 'Must be a positive number' }));
    } else {
      setEditErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };
  
  const handleSave = (id: string) => {
    const value = editValues[id];
    
    if (!value || isNaN(parseFloat(value)) || parseFloat(value) < 0) {
      setEditErrors(prev => ({ ...prev, [id]: 'Invalid value' }));
      return;
    }
    
    onSave(id, parseFloat(value));
    
    // Clear the value from editValues after saving
    setEditValues(prev => {
      const newValues = { ...prev };
      delete newValues[id];
      return newValues;
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm ring-1 ring-dark/10 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Meter</TableHead>
            <TableHead>Current Value</TableHead>
            <TableHead>New Value</TableHead>
            <TableHead className="w-[100px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell>{row.value !== null ? `${row.value} ${row.unit}` : 'N/A'}</TableCell>
              <TableCell>
                <div className="relative">
                  <Input
                    value={editValues[row.id] || ''}
                    onChange={(e) => handleInputChange(row.id, e.target.value)}
                    placeholder="Enter value"
                    className={editErrors[row.id] ? 'border-red-500' : ''}
                  />
                  {editErrors[row.id] && (
                    <p className="text-xs text-red-500 absolute">
                      {editErrors[row.id]}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSave(row.id)}
                  disabled={!!editErrors[row.id] || !editValues[row.id]}
                >
                  <Save size={16} className="mr-1" />
                  Save
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EditableTable;
