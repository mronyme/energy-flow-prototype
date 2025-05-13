
import { validateCsvRow } from './validation';

/**
 * Validates CSV structure and required columns
 * @param headers Array of column headers from the CSV
 * @param requiredColumns Array of column names that must exist
 * @returns Object with validation result and missing columns
 */
export const validateCsvStructure = (
  headers: string[],
  requiredColumns: string[]
): { isValid: boolean; missingColumns: string[] } => {
  const missingColumns = requiredColumns.filter(
    col => !headers.includes(col)
  );
  
  return {
    isValid: missingColumns.length === 0,
    missingColumns
  };
};

/**
 * Validates CSV data rows against the required fields and additional validation rules
 * @param data Array of data objects
 * @param requiredFields Array of required field names
 * @param validationRules Optional additional validation rules
 * @returns Object with valid and invalid rows, plus specific error messages
 */
export interface ValidationError {
  row: number;
  message: string;
  field: string;
}

export const validateCsvData = (
  data: Record<string, string>[],
  requiredFields: string[],
  validationRules?: {
    [field: string]: (value: string) => { isValid: boolean; message: string } 
  }
): {
  validRows: Record<string, string>[];
  invalidRows: Record<string, string>[];
  errors: ValidationError[];
} => {
  const validRows: Record<string, string>[] = [];
  const invalidRows: Record<string, string>[] = [];
  const errors: ValidationError[] = [];
  
  data.forEach((row, index) => {
    let isRowValid = validateCsvRow(row, requiredFields);
    
    // If basic validation passes and we have additional rules, apply them
    if (isRowValid && validationRules) {
      for (const field of Object.keys(validationRules)) {
        if (row[field]) {
          const { isValid, message } = validationRules[field](row[field]);
          
          if (!isValid) {
            isRowValid = false;
            errors.push({
              row: index + 1, // +1 for human-readable row count
              field,
              message
            });
          }
        }
      }
    } else if (!isRowValid) {
      // Add basic validation error
      const missingFields = requiredFields.filter(field => !row[field]?.trim());
      errors.push({
        row: index + 1,
        field: missingFields.join(', '),
        message: `Missing required field(s): ${missingFields.join(', ')}`
      });
    }
    
    if (isRowValid) {
      validRows.push(row);
    } else {
      invalidRows.push(row);
    }
  });
  
  return { validRows, invalidRows, errors };
};

/**
 * Validates a numeric field in a CSV
 * @param value String value to validate
 * @param min Optional minimum value
 * @param max Optional maximum value
 * @returns Validation result with isValid flag and message
 */
export const validateNumeric = (
  value: string,
  min?: number,
  max?: number
): { isValid: boolean; message: string } => {
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return { isValid: false, message: 'Value must be a number' };
  }
  
  if (min !== undefined && num < min) {
    return { isValid: false, message: `Value must be at least ${min}` };
  }
  
  if (max !== undefined && num > max) {
    return { isValid: false, message: `Value must be no more than ${max}` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validates a date field in a CSV
 * @param value String value to validate
 * @param format Expected format (for error message only)
 * @returns Validation result with isValid flag and message
 */
export const validateDate = (
  value: string,
  format: string = 'YYYY-MM-DD'
): { isValid: boolean; message: string } => {
  const date = new Date(value);
  
  if (isNaN(date.getTime())) {
    return { isValid: false, message: `Invalid date format. Expected: ${format}` };
  }
  
  return { isValid: true, message: '' };
};
