
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ImportLog } from '@/types';
import { format } from 'date-fns';

interface LogTableProps {
  data: ImportLog[];
  onExport: () => void;
}

const LogTable: React.FC<LogTableProps> = ({ data, onExport }) => {
  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'yyyy-MM-dd HH:mm');
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-dark">Import Journal</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onExport}
          className="transition-all duration-100 ease-out"
          aria-label="Export import logs as CSV"
        >
          <Download size={16} className="mr-2" aria-hidden="true" />
          Export CSV
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm ring-1 ring-dark/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>User</TableHead>
              <TableHead>File Name</TableHead>
              <TableHead className="text-right">OK Rows</TableHead>
              <TableHead className="text-right">Error Rows</TableHead>
              <TableHead className="text-right">Success Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((log) => {
              const totalRows = log.rows_ok + log.rows_err;
              const successRate = totalRows > 0 
                ? ((log.rows_ok / totalRows) * 100).toFixed(1) + '%' 
                : 'N/A';
              
              return (
                <TableRow key={log.id}>
                  <TableCell>{formatDateTime(log.ts)}</TableCell>
                  <TableCell>{log.user_email}</TableCell>
                  <TableCell className="font-mono text-xs">{log.file_name}</TableCell>
                  <TableCell className="text-right font-medium text-green-600">
                    {log.rows_ok}
                  </TableCell>
                  <TableCell className="text-right font-medium text-red-600">
                    {log.rows_err}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {successRate}
                  </TableCell>
                </TableRow>
              );
            })}
            
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                  No import logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LogTable;
