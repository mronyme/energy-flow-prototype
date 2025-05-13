
import { dateUtils, validationRules, checkThresholds, validateCsvRow, toastMessages } from '../../utils/validation';

// Date utils tests
describe('dateUtils', () => {
  test('format should format a date to YYYY-MM-DD', () => {
    const date = new Date('2025-05-13T12:00:00Z');
    expect(dateUtils.format(date)).toBe('2025-05-13');
  });

  test('parse should convert a string to Date object', () => {
    const dateStr = '2025-05-13';
    const parsed = dateUtils.parse(dateStr);
    expect(parsed instanceof Date).toBe(true);
    expect(parsed.toISOString().split('T')[0]).toBe(dateStr);
  });

  test('isValid should detect valid dates', () => {
    expect(dateUtils.isValid(new Date('2025-05-13'))).toBe(true);
    expect(dateUtils.isValid(new Date('invalid date'))).toBe(false);
  });

  test('today should return today at midnight', () => {
    const today = dateUtils.today();
    const now = new Date();
    expect(today.getFullYear()).toBe(now.getFullYear());
    expect(today.getMonth()).toBe(now.getMonth());
    expect(today.getDate()).toBe(now.getDate());
    expect(today.getHours()).toBe(0);
    expect(today.getMinutes()).toBe(0);
    expect(today.getSeconds()).toBe(0);
  });

  test('formatReadable should format a date to a human-readable string', () => {
    const date = new Date('2025-05-13T12:00:00Z');
    expect(dateUtils.formatReadable(date)).toBe('May 13, 2025');
  });

  test('formatDisplay should format a date as MM/DD/YYYY', () => {
    expect(dateUtils.formatDisplay('2025-05-13')).toBe('05/13/2025');
  });

  test('formatDateTime should format date and time', () => {
    // The exact format might vary based on locale, so we're checking for presence of date and time parts
    const formatted = dateUtils.formatDateTime('2025-05-13T15:30:00');
    expect(formatted).toContain('05/13/2025');
  });
});

// Validation rules tests
describe('validationRules', () => {
  test('isSpike should detect when a value is +40% above the historical mean', () => {
    expect(validationRules.isSpike(140, 100)).toBe(true);
    expect(validationRules.isSpike(139, 100)).toBe(false);
    expect(validationRules.isSpike(50, 100)).toBe(false);
  });

  test('isMissing should detect null or undefined values', () => {
    expect(validationRules.isMissing(null)).toBe(true);
    expect(validationRules.isMissing(undefined)).toBe(true);
    expect(validationRules.isMissing(0)).toBe(false);
    expect(validationRules.isMissing('')).toBe(false);
  });

  test('isFlat should detect when readings are the same for more than 48 hours', () => {
    const readings = [100, 100, 100];
    const timestamps = [
      '2025-05-10T00:00:00Z',
      '2025-05-11T00:00:00Z', // 24h later
      '2025-05-12T00:00:00Z'  // 48h from start
    ];
    expect(validationRules.isFlat(readings, timestamps)).toBe(true);
    
    // Less than 48 hours
    const shortTimestamps = [
      '2025-05-10T00:00:00Z',
      '2025-05-10T12:00:00Z', // 12h later
      '2025-05-11T00:00:00Z'  // 24h from start
    ];
    expect(validationRules.isFlat(readings, shortTimestamps)).toBe(false);
    
    // Different values
    const differentReadings = [100, 101, 100];
    expect(validationRules.isFlat(differentReadings, timestamps)).toBe(false);
  });

  test('isOutOfThreshold should detect when value is ±15% from historical mean', () => {
    // Below threshold (-15%)
    expect(validationRules.isOutOfThreshold(84, 100)).toBe(true);
    
    // Above threshold (+15%)
    expect(validationRules.isOutOfThreshold(116, 100)).toBe(true);
    
    // Within threshold
    expect(validationRules.isOutOfThreshold(100, 100)).toBe(false);
    expect(validationRules.isOutOfThreshold(110, 100)).toBe(false);
    expect(validationRules.isOutOfThreshold(90, 100)).toBe(false);
  });

  test('getPercentageDifference should calculate correctly', () => {
    expect(validationRules.getPercentageDifference(120, 100)).toBe(20);
    expect(validationRules.getPercentageDifference(80, 100)).toBe(-20);
    expect(validationRules.getPercentageDifference(0, 0)).toBe(0); // Edge case: avoid division by zero
  });

  test('formatPercentage should format with + or - sign', () => {
    expect(validationRules.formatPercentage(20.5)).toBe('+20.5%');
    expect(validationRules.formatPercentage(-15.3)).toBe('-15.3%');
    expect(validationRules.formatPercentage(0)).toBe('+0.0%');
  });

  test('getAnomalyType should correctly identify anomaly types', () => {
    // Test MISSING
    expect(validationRules.getAnomalyType(null, 100, [], [])).toBe('MISSING');
    
    // Test SPIKE
    expect(validationRules.getAnomalyType(150, 100, [], [])).toBe('SPIKE');
    
    // Test FLAT
    const flatReadings = [100, 100, 100];
    const flatTimestamps = [
      '2025-05-10T00:00:00Z',
      '2025-05-11T12:00:00Z',
      '2025-05-12T13:00:00Z'  // More than 48h from start
    ];
    expect(validationRules.getAnomalyType(100, 100, flatReadings, flatTimestamps)).toBe('FLAT');
    
    // Test no anomaly
    expect(validationRules.getAnomalyType(105, 100, [100, 105, 102], 
      ['2025-05-10T00:00:00Z', '2025-05-10T12:00:00Z', '2025-05-11T00:00:00Z'])).toBe(null);
  });

  test('hasIssue should identify problematic values', () => {
    // Test missing value
    expect(validationRules.hasIssue(null, 100, [], [])).toBe(true);
    
    // Test spike
    expect(validationRules.hasIssue(150, 100, [], [])).toBe(true);
    
    // Test out of threshold but not spike
    expect(validationRules.hasIssue(116, 100, [], [])).toBe(true);
    expect(validationRules.hasIssue(84, 100, [], [])).toBe(true);
    
    // Test flat readings
    const flatReadings = [100, 100, 100];
    const flatTimestamps = [
      '2025-05-10T00:00:00Z',
      '2025-05-11T12:00:00Z',
      '2025-05-12T13:00:00Z'  // More than 48h from start
    ];
    expect(validationRules.hasIssue(100, 100, flatReadings, flatTimestamps)).toBe(true);
    
    // Test normal value
    expect(validationRules.hasIssue(105, 100, [100, 105, 102], 
      ['2025-05-10T00:00:00Z', '2025-05-10T12:00:00Z', '2025-05-11T00:00:00Z'])).toBe(false);
  });
});

// Check thresholds test
describe('checkThresholds', () => {
  test('should detect missing value', () => {
    const result = checkThresholds(null, [100, 110, 90]);
    expect(result.isAnomaly).toBe(true);
    expect(result.type).toBe('MISSING');
  });

  test('should detect spike value', () => {
    const result = checkThresholds(150, [100, 105, 110]);
    expect(result.isAnomaly).toBe(true);
    expect(result.type).toBe('SPIKE');
    expect(result.delta).toBeGreaterThan(40); // Should be around 44-45%
  });

  test('should flag out-of-threshold but not as anomaly', () => {
    const result = checkThresholds(116, [100, 105, 95]);
    expect(result.isAnomaly).toBe(false);
    expect(result.type).toBe(null);
    expect(result.delta).toBeGreaterThan(0); // Positive delta
    expect(result.message).toBe('Out-of-threshold value');
  });

  test('should return normal for values within threshold', () => {
    const result = checkThresholds(105, [100, 110, 95]);
    expect(result.isAnomaly).toBe(false);
    expect(result.type).toBe(null);
    expect(result.delta).toBe(null);
    expect(result.message).toBe(null);
  });

  test('should handle empty historical values', () => {
    const result = checkThresholds(100, []);
    expect(result.isAnomaly).toBe(false);
    expect(result.type).toBe(null);
    expect(result.delta).toBe(null);
  });
});

// CSV validation tests
describe('validateCsvRow', () => {
  test('should validate valid rows', () => {
    const validRow = {
      date: '2025-05-13',
      meter: 'meter1',
      value: '100.5'
    };
    expect(validateCsvRow(validRow, ['date', 'meter', 'value'])).toBe(true);
  });

  test('should reject rows with missing required fields', () => {
    const invalidRow = {
      date: '2025-05-13',
      // meter is missing
      value: '100.5'
    };
    expect(validateCsvRow(invalidRow, ['date', 'meter', 'value'])).toBe(false);
  });

  test('should reject rows with empty values', () => {
    const invalidRow = {
      date: '2025-05-13',
      meter: '',  // Empty value
      value: '100.5'
    };
    expect(validateCsvRow(invalidRow, ['date', 'meter', 'value'])).toBe(false);
  });

  test('should accept rows with extra fields', () => {
    const rowWithExtra = {
      date: '2025-05-13',
      meter: 'meter1',
      value: '100.5',
      extra: 'not required'
    };
    expect(validateCsvRow(rowWithExtra, ['date', 'meter', 'value'])).toBe(true);
  });
});

// Toast messages test
describe('toastMessages', () => {
  test('should format import complete message correctly', () => {
    expect(toastMessages.importComplete(120, 5)).toBe('Import complete: 120 rows, 5 errors');
    expect(toastMessages.importComplete(0, 0)).toBe('Import complete: 0 rows, 0 errors');
  });

  test('should return correction saved message', () => {
    expect(toastMessages.correctionSaved()).toBe('Correction saved');
  });

  test('should return reading saved message', () => {
    expect(toastMessages.readingSaved()).toBe('Reading saved');
  });

  test('should return factor updated message', () => {
    expect(toastMessages.factorUpdated()).toBe('Factor updated');
  });

  test('should return user created message', () => {
    expect(toastMessages.userCreated()).toBe('User created');
  });
});
