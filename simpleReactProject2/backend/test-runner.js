#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runTests(testType = 'all') {
  return new Promise((resolve, reject) => {
    let testCommand;
    
    switch (testType) {
      case 'unit':
        testCommand = ['npm', 'test', '--', 'server.test.js'];
        break;
      case 'integration':
        testCommand = ['npm', 'test', '--', 'integration.test.js'];
        break;
      case 'coverage':
        testCommand = ['npm', 'run', 'test:coverage'];
        break;
      case 'watch':
        testCommand = ['npm', 'run', 'test:watch'];
        break;
      default:
        testCommand = ['npm', 'test'];
    }

    log(`\n🧪 Running ${testType} tests...\n`, 'blue');

    const testProcess = spawn(testCommand[0], testCommand.slice(1), {
      stdio: 'inherit',
      cwd: __dirname
    });

    testProcess.on('close', (code) => {
      if (code === 0) {
        log(`\n✅ ${testType} tests passed!`, 'green');
        resolve();
      } else {
        log(`\n❌ ${testType} tests failed!`, 'red');
        reject(new Error(`Tests failed with exit code ${code}`));
      }
    });

    testProcess.on('error', (err) => {
      log(`\n❌ Error running tests: ${err.message}`, 'red');
      reject(err);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const testType = args[0] || 'all';

  log('🚀 Task Calendar API Test Runner', 'bold');
  log('=====================================', 'blue');

  try {
    await runTests(testType);
  } catch (error) {
    process.exit(1);
  }
}

// Handle command line arguments
if (require.main === module) {
  main();
}

module.exports = { runTests };
