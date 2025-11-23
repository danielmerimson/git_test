// Test setup file
// This file runs before each test suite

// Set test environment variables
process.env.NODE_ENV = 'test';

// Increase timeout for database operations
jest.setTimeout(10000);
