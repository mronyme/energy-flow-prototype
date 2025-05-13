
import { validateCsvRow } from './validation';

/**
 * Parses a CSV string to an array of objects
 * @param csvString The CSV content as a string
 * @returns Array of objects where keys are column headers
 */
export const parseCSV = (csvString: string): Record<string, string>[] => {
  // Split into lines and filter out empty lines
  const lines = csvString.split('\n').filter(line => line.trim().length > 0);
  
  if (lines.length === 0) {
    return [];
  }
  
  // Extract headers from the first line
  const headers = lines[0].split(',').map(header => header.trim());
  
  // Parse each data line
  return lines.slice(1).map(line => {
    const values = line.split(',').map(value => value.trim());
    const row: Record<string, string> = {};
    
    // Map values to headers
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    return row;
  });
};

/**
 * Validates CSV data against required fields and formats
 * @param data Array of objects from parseCSV
 * @param requiredFields Array of field names that must exist and have values
 * @returns Object with valid and invalid rows
 */
export const validateCSVData = (
  data: Record<string, string>[],
  requiredFields: string[]
): {
  validRows: Record<string, string>[];
  invalidRows: Record<string, string>[];
} => {
  const validRows: Record<string, string>[] = [];
  const invalidRows: Record<string, string>[] = [];
  
  data.forEach(row => {
    if (validateCsvRow(row, requiredFields)) {
      validRows.push(row);
    } else {
      invalidRows.push(row);
    }
  });
  
  return { validRows, invalidRows };
};

/**
 * Converts an array of objects to CSV string
 * @param data Array of objects to convert
 * @returns CSV string with headers
 */
export const objectsToCSV = (data: Record<string, any>[]): string => {
  if (data.length === 0) {
    return '';
  }
  
  // Get all unique keys as headers
  const headers = Array.from(
    new Set(
      data.flatMap(obj => Object.keys(obj))
    )
  );
  
  // Create CSV header row
  const headerRow = headers.join(',');
  
  // Create data rows
  const rows = data.map(obj => {
    return headers.map(header => {
      const value = obj[header] ?? '';
      // Wrap values with commas in quotes
      return typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : String(value);
    }).join(',');
  });
  
  // Combine header and data rows
  return [headerRow, ...rows].join('\n');
};

/**
 * Creates a CSV file download
 * @param data Data to export
 * @param filename Filename for the download
 */
export const downloadCSV = (data: Record<string, any>[] | string, filename: string): void => {
  // Convert data to CSV string if it's an array of objects
  const csvContent = typeof data === 'string' 
    ? data 
    : objectsToCSV(data);
  
  // Create a blob with the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
