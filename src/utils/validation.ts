
/**
 * Validates if a value is outside the threshold compared to historical mean
 * Threshold set at ±15% as per requirements
 */
export const isOutOfThreshold = (value: number, historicalMean: number): boolean => {
  if (historicalMean === 0) return false;
  
  const deviation = Math.abs((value - historicalMean) / historicalMean) * 100;
  return deviation > 15;
};

/**
 * Categorizes an anomaly based on criteria defined in requirements
 * - SPIKE: ≥ +40% vs previous value
 * - MISSING: NULL value
 * - FLAT: > 48h of identical values
 */
export const categorizeAnomaly = (
  value: number | null,
  previousValue: number | null,
  isFlat: boolean
): { type: 'SPIKE' | 'MISSING' | 'FLAT' | null; delta: number | null } => {
  // Check for missing values
  if (value === null) {
    return { type: 'MISSING', delta: null };
  }
  
  // Check for flat values (requires external detection of 48h identical values)
  if (isFlat) {
    return { type: 'FLAT', delta: 0 };
  }
  
  // Check for spikes (≥ +40% increase)
  if (previousValue !== null && previousValue > 0) {
    const percentChange = ((value - previousValue) / previousValue) * 100;
    if (percentChange >= 40) {
      return { type: 'SPIKE', delta: percentChange };
    }
  }
  
  return { type: null, delta: null };
};

/**
 * Validates a CSV row based on required fields and data types
 */
export const validateCsvRow = (row: Record<string, any>, requiredFields: string[]): boolean => {
  // Check for required fields
  for (const field of requiredFields) {
    if (!row[field] && row[field] !== 0) {
      return false;
    }
  }
  
  // Additional validation can be added based on field types
  // For example, checking if numeric fields are actually numbers
  
  return true;
};

/**
 * Date utility functions for consistent date handling
 */
export const dateUtils = {
  format: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  },
  
  parse: (dateStr: string): Date => {
    return new Date(dateStr);
  },
  
  addDays: (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },
  
  formatDisplay: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  },
  
  formatDateTime: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};
