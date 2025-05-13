
// Set up jest-dom for testing
import '@testing-library/jest-dom';

// No need to explicitly assign globals with TypeScript
// TypeScript will recognize Jest globals from the @types/jest package
// The imports below are just for reference or explicit usage if needed
import { expect, jest, test, describe } from '@jest/globals';

// Instead of modifying globals, we'll just make sure the functions are imported
// TypeScript will understand that these are available globally in test files
