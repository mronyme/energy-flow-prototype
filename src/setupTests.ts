
// Set up jest-dom for testing
import '@testing-library/jest-dom';
import { expect, jest, test, describe } from '@jest/globals';

// Make Jest globals available
global.expect = expect;
global.jest = jest;
global.test = test;
global.describe = describe;
