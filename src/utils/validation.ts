
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
  },
  
  // Calculate hours between two ISO date strings
  hoursBetween: (start: string, end: string): number => {
    const startDate = new Date(start).getTime();
    const endDate = new Date(end).getTime();
    return (endDate - startDate) / (1000 * 60 * 60);
  }
};

// Validation rules for readings and anomalies
export const validationRules = {
  // Check if a value is an anomalous spike (>= +40% from historical mean)
  isSpike: (value: number, historicalMean: number): boolean => {
    return value >= historicalMean * 1.4; // >= +40%
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
    return value < historicalMean * 0.85 || value > historicalMean * 1.15; // ±15%
  },
  
  // Get the percentage difference from historical mean
  getPercentageDifference: (value: number, historicalMean: number): number => {
    if (historicalMean === 0) return 0;
    return ((value - historicalMean) / historicalMean) * 100;
  },
  
  // Format percentage for display
  formatPercentage: (percentage: number): string => {
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  },

  // Get anomaly type based on validation rules
  getAnomalyType: (value: number | null, historicalMean: number, readings: number[], timestamps: string[]): 'SPIKE' | 'MISSING' | 'FLAT' | null => {
    if (value === null || value === undefined) {
      return 'MISSING';
    }

    if (historicalMean > 0 && value >= historicalMean * 1.4) {
      return 'SPIKE';
    }

    if (readings.length >= 2 && timestamps.length >= 2) {
      if (validationRules.isFlat(readings, timestamps)) {
        return 'FLAT';
      }
    }

    return null;
  },

  // Check if a value has a problem that requires flagging
  hasIssue: (value: number | null, historicalMean: number, readings: number[], timestamps: string[]): boolean => {
    if (value === null || value === undefined) return true;
    
    // Anomaly checks
    if (historicalMean > 0) {
      // Check for SPIKE anomaly (≥ +40%)
      if (value >= historicalMean * 1.4) return true;
      
      // Check for threshold violation (±15%)
      if (value < historicalMean * 0.85 || value > historicalMean * 1.15) return true;
    }
    
    // Check for FLAT anomaly (same value for > 48h)
    if (readings.length >= 2 && timestamps.length >= 2) {
      if (validationRules.isFlat(readings, timestamps)) return true;
    }
    
    return false;
  }
};

// Generate toast messages for import results
export const toastMessages = {
  importComplete: (rowsOk: number, rowsErr: number): string => {
    return `Import complete: ${rowsOk} rows, ${rowsErr} errors`;
  },
  
  correctionSaved: () => {
    return `Correction saved`;
  },
  
  readingSaved: () => {
    return `Reading saved`;
  },
  
  factorUpdated: () => {
    return `Factor updated`;
  },
  
  userCreated: () => {
    return `User created`;
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
export const checkThresholds = (value: number | null, historicalValues: number[]): {
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
  
  // Check for spike (≥ +40%)
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

// Helper function to check for FLAT anomalies over multiple readings 
export const checkForFlatReadings = (readings: Array<{value: number | null, timestamp: string}>): boolean => {
  if (readings.length < 3) return false;
  
  // Filter out null/undefined values
  const validReadings = readings.filter(r => r.value !== null && r.value !== undefined);
  if (validReadings.length < 3) return false;
  
  // Check if all readings have the same value
  const firstValue = validReadings[0].value;
  const allSameValue = validReadings.every(r => r.value === firstValue);
  
  if (!allSameValue) return false;
  
  // Check if time span is at least 48 hours
  const timestamps = validReadings.map(r => r.timestamp);
  const firstTimestamp = new Date(timestamps[0]).getTime();
  const lastTimestamp = new Date(timestamps[timestamps.length - 1]).getTime();
  const hoursDiff = (lastTimestamp - firstTimestamp) / (1000 * 60 * 60);
  
  return hoursDiff >= 48;
};
