
import { supabase } from '../integrations/supabase/client';
import { AuditLog } from '../types';

/**
 * Service for managing audit logs
 */
export const auditService = {
  /**
   * Create a new audit log entry
   * @param log Audit log entry details
   */
  async createAuditLog(log: Omit<AuditLog, 'id'>): Promise<AuditLog> {
    const { data, error } = await supabase
      .from('audit_log')
      .insert([{
        ts: log.ts || new Date().toISOString(),
        user_email: log.user_email,
        action: log.action,
        table_name: log.table_name,
        record_id: log.record_id,
        old_value: log.old_value,
        new_value: log.new_value,
        description: log.description
      }])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating audit log:', error);
      throw error;
    }
    
    return data as AuditLog;
  },
  
  /**
   * Get audit logs for a specific table
   * @param tableName Table name to filter by
   * @param limit Maximum number of logs to return
   * @returns Array of audit log entries
   */
  async getAuditLogs(
    tableName?: string,
    limit = 100
  ): Promise<AuditLog[]> {
    let query = supabase
      .from('audit_log')
      .select('*')
      .order('ts', { ascending: false })
      .limit(limit);
      
    if (tableName) {
      query = query.eq('table_name', tableName);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
    
    return data as AuditLog[];
  }
};
