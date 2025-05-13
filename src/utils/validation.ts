
// Validation utilities for the MAXI V2 application

// Date utilities for formatting and validation
export const dateUtils = {
  // Format a date to YYYY-MM-DD
  format: (date: Date): string => {
    return date.toISOString().split('T')[0];
  },
  
  // Parse a string date in YYYY-MM-DD format to a Date object
  parse: (dateString: string): Date => {
    return new Date(dateString);
  },
  
  // Check if a date is valid
  isValid: (date: Date): boolean => {
    return !isNaN(date.getTime());
  },
  
  // Get today's date at midnight
  today: (): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  },
  
  // Format a date to a readable string (e.g. "Jan 1, 2025")
  formatReadable: (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  },
  
  // Format display (MM/DD/YYYY)
  formatDisplay: (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  },
  
  // Format date and time (MM/DD/YYYY, HH:MM)
  formatDateTime: (dateTimeString: string): string => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

// Validation rules for readings and anomalies
export const validationRules = {
  // Check if a value is an anomalous spike (>= +40% from historical mean)
  isSpike: (value: number, historicalMean: number): boolean => {
    return value >= historicalMean * 1.4;
  },
  
  // Check if a value is missing
  isMissing: (value: any): boolean => {
    return value === null || value === undefined;
  },
  
  // Check if readings are flat for more than 48 hours
  isFlat: (readings: number[], timestamps: string[]): boolean => {
    if (readings.length < 2) return false;
    
    const firstValue = readings[0];
    const allSame = readings.every(reading => reading === firstValue);
    
    if (!allSame) return false;
    
    // Check if the time span is >= 48 hours
    const firstTimestamp = new Date(timestamps[0]).getTime();
    const lastTimestamp = new Date(timestamps[timestamps.length - 1]).getTime();
    const hoursDiff = (lastTimestamp - firstTimestamp) / (1000 * 60 * 60);
    
    return hoursDiff >= 48;
  },
  
  // Check if a value is out of threshold (> ±15% from historical mean)
  isOutOfThreshold: (value: number, historicalMean: number): boolean => {
    return value < historicalMean * 0.85 || value > historicalMean * 1.15;
  },
  
  // Get the percentage difference from historical mean
  getPercentageDifference: (value: number, historicalMean: number): number => {
    if (historicalMean === 0) return 0;
    return ((value - historicalMean) / historicalMean) * 100;
  },
  
  // Format percentage for display
  formatPercentage: (percentage: number): string => {
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  }
};

// Generate toast messages for import results
export const toastMessages = {
  importComplete: (rowsOk: number, rowsErr: number): string => {
    return `Import complete: ${rowsOk} rows, ${rowsErr} errors`;
  },
  
  correctionSaved: () => {
    return `Correction saved`;
  }
};

// CSV validation function
export const validateCsvRow = (
  row: Record<string, string>,
  requiredFields: string[]
): boolean => {
  // Check if all required fields exist and are not empty
  return requiredFields.every(field => {
    return field in row && row[field]?.trim() !== '';
  });
};

// Function to check if a value exceeds thresholds and should be flagged
export const checkThresholds = (value: number, historicalValues: number[]): {
  isAnomaly: boolean;
  type: 'SPIKE' | 'FLAT' | 'MISSING' | null;
  delta: number | null;
  message: string | null;
} => {
  if (value === null || value === undefined) {
    return {
      isAnomaly: true,
      type: 'MISSING',
      delta: null,
      message: 'Missing value'
    };
  }
  
  if (historicalValues.length === 0) {
    return { isAnomaly: false, type: null, delta: null, message: null };
  }
  
  // Calculate historical mean (excluding the current value)
  const historicalMean = historicalValues.reduce((sum, val) => sum + val, 0) / historicalValues.length;
  
  // Check for spike (>= +40%)
  if (value >= historicalMean * 1.4) {
    const delta = ((value - historicalMean) / historicalMean) * 100;
    return {
      isAnomaly: true,
      type: 'SPIKE',
      delta,
      message: `Value exceeds historical mean by +${delta.toFixed(1)}%`
    };
  }
  
  // Check for out-of-threshold but not spike (±15%)
  if (value < historicalMean * 0.85 || value > historicalMean * 1.15) {
    const delta = ((value - historicalMean) / historicalMean) * 100;
    return {
      isAnomaly: false, // Not considered an anomaly, but needs flagging
      type: null,
      delta,
      message: 'Out-of-threshold value'
    };
  }
  
  return { isAnomaly: false, type: null, delta: null, message: null };
};
