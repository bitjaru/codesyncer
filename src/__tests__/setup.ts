/**
 * Jest Test Setup
 */

// Increase timeout for async operations
jest.setTimeout(10000);

// Mock console for cleaner test output
beforeAll(() => {
  // Suppress console logs during tests unless DEBUG is set
  if (!process.env.DEBUG) {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
  }
});

afterAll(() => {
  jest.restoreAllMocks();
});

// Clean up any temp files after all tests
afterAll(async () => {
  // Cleanup will be handled by individual test files
});
