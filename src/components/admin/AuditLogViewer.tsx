
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { AuditLog } from '@/types';
import { auditService } from '@/services/auditService';
import { dateUtils } from '@/utils/validation';
import { Loader2, Download, Search } from 'lucide-react';
import * as csvUtils from '@/utils/csvUtils';
import { toast } from 'sonner';

interface AuditLogViewerProps {
  tableName?: string;
}

const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ tableName }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  
  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      try {
        const auditLogs = await auditService.getAuditLogs(tableName);
        setLogs(auditLogs);
      } catch (error) {
        console.error('Error loading audit logs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadLogs();
  }, [tableName]);
  
  const handleExport = () => {
    if (logs.length === 0) return;
    
    const csvData = logs.map(log => ({
      Timestamp: dateUtils.formatDateTime(log.ts),
      User: log.user_email,
      Action: log.action,
      Table: log.table_name,
      RecordID: log.record_id || '',
      Description: log.description || '',
      'Old Value': log.old_value || '',
      'New Value': log.new_value || ''
    }));
    
    csvUtils.downloadCSV(csvData, `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Audit logs exported');
  };
  
  const filteredLogs = logs.filter(log => {
    if (!filterText) return true;
    
    const searchText = filterText.toLowerCase();
    return (
      log.user_email.toLowerCase().includes(searchText) ||
      log.action.toLowerCase().includes(searchText) ||
      log.table_name.toLowerCase().includes(searchText) ||
      (log.description || '').toLowerCase().includes(searchText)
    );
  });
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Audit Logs</CardTitle>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Filter logs..."
              className="pl-8 w-[200px]"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
          
          <Button variant="outline" size="sm" onClick={handleExport} disabled={logs.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No audit logs found
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{dateUtils.formatDateTime(log.ts)}</TableCell>
                    <TableCell>{log.user_email}</TableCell>
                    <TableCell>
                      <span className={
                        log.action === 'CREATE' ? 'text-green-600' :
                        log.action === 'UPDATE' ? 'text-amber-600' : 
                        log.action === 'DELETE' ? 'text-red-600' : ''
                      }>
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell>{log.table_name}</TableCell>
                    <TableCell>{log.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuditLogViewer;
