# Backend Testing Guide

This document explains the comprehensive test suite for the Task Calendar API backend.

## Test Structure

```
backend/
├── tests/
│   ├── setup.js              # Test configuration
│   ├── mockDatabase.js       # Mock database for testing
│   ├── server.test.js        # Unit tests for API endpoints
│   └── integration.test.js   # Integration tests
├── jest.config.js            # Jest configuration
├── test-runner.js            # Custom test runner script
└── README-TESTING.md         # This file
```

## Test Types

### 1. Unit Tests (`server.test.js`)
Tests individual API endpoints in isolation:

- **Health Check**: `/api/health`
- **Get All Tasks**: `GET /api/tasks`
- **Get Tasks by Date**: `GET /api/tasks/date/:date`
- **Create Task**: `POST /api/tasks`
- **Update Task**: `PUT /api/tasks/:id`
- **Toggle Task**: `PATCH /api/tasks/:id/toggle`
- **Delete Task**: `DELETE /api/tasks/:id`
- **Error Handling**: 404 and 500 error scenarios

### 2. Integration Tests (`integration.test.js`)
Tests complete workflows and edge cases:

- **Complete CRUD Workflow**: Create → Read → Update → Delete
- **Multiple Tasks Management**: Cross-date operations
- **Data Validation**: Edge cases and special characters
- **Concurrent Operations**: Multiple simultaneous requests

## Running Tests

### Install Dependencies
```bash
cd backend
npm install
```

### Run All Tests
```bash
npm test
```

### Run Specific Test Types
```bash
# Unit tests only
npm test server.test.js

# Integration tests only
npm test integration.test.js

# Watch mode (re-runs on file changes)
npm run test:watch

# Coverage report
npm run test:coverage
```

### Using the Custom Test Runner
```bash
# All tests
node test-runner.js

# Unit tests only
node test-runner.js unit

# Integration tests only
node test-runner.js integration

# Coverage report
node test-runner.js coverage

# Watch mode
node test-runner.js watch
```

## Test Features

### Mock Database
- **In-memory storage**: No actual database required for testing
- **Reset between tests**: Clean state for each test
- **Seed data support**: Pre-populate test data
- **Error simulation**: Mock database errors for testing error handling

### Comprehensive Coverage
- ✅ **Happy path scenarios**: Normal operations
- ✅ **Error scenarios**: Database errors, validation failures
- ✅ **Edge cases**: Empty data, special characters, concurrent operations
- ✅ **HTTP status codes**: Proper response codes for all scenarios
- ✅ **Data validation**: Input validation and sanitization
- ✅ **CORS and middleware**: Middleware functionality

### Test Scenarios Covered

#### API Endpoint Tests
- Valid requests with expected responses
- Invalid requests with proper error messages
- Missing required fields
- Database error handling
- Non-existent resource handling (404s)

#### Data Validation Tests
- Text trimming and whitespace handling
- Special characters and emojis
- Date format consistency
- Boolean field handling

#### Integration Tests
- Complete task lifecycle (CRUD operations)
- Multi-task operations across dates
- Concurrent request handling
- State consistency across operations

## Test Configuration

### Jest Configuration (`jest.config.js`)
```javascript
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: ['**/*.js', '!node_modules/**'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};
```

### Environment Variables
- `NODE_ENV=test` - Set automatically during testing
- Increased timeout for database operations

## Coverage Reports

Generate detailed coverage reports:
```bash
npm run test:coverage
```

Coverage includes:
- **Line coverage**: Percentage of code lines executed
- **Function coverage**: Percentage of functions called
- **Branch coverage**: Percentage of code branches taken
- **Statement coverage**: Percentage of statements executed

## Continuous Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Backend Tests
  run: |
    cd backend
    npm install
    npm test
```

## Best Practices

### Writing New Tests
1. **Arrange**: Set up test data and mocks
2. **Act**: Execute the operation being tested
3. **Assert**: Verify the expected outcome

### Test Naming
- Use descriptive test names: `should return 404 for non-existent task`
- Group related tests in `describe` blocks
- Use `beforeEach` and `afterEach` for setup/cleanup

### Mock Usage
- Use the MockDatabase for consistent, fast tests
- Mock external dependencies
- Reset mocks between tests

### Error Testing
- Test both success and failure scenarios
- Verify proper error messages and status codes
- Test edge cases and boundary conditions

## Debugging Tests

### Run Single Test
```bash
npm test -- --testNamePattern="should create a new task"
```

### Debug Mode
```bash
npm test -- --detectOpenHandles --forceExit
```

### Verbose Output
```bash
npm test -- --verbose
```

## Performance Considerations

- Tests use in-memory mock database for speed
- No actual file I/O or network operations
- Parallel test execution when possible
- Cleanup after each test to prevent memory leaks

## Future Enhancements

Potential test improvements:
- **Load testing**: High-volume request testing
- **Security testing**: Input sanitization and injection attacks
- **Performance benchmarks**: Response time measurements
- **Database integration tests**: Real SQLite database testing
- **API documentation tests**: Ensure API matches documentation
