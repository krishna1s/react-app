import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  // Read the test results to check for flaky tests or failures
  const resultsPath = path.join(process.cwd(), 'playwright-report/results.json');
  
  if (fs.existsSync(resultsPath)) {
    try {
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
      
      // Check for any failed tests or flaky tests
      let hasFailures = false;
      let hasFlaky = false;
      
      if (results.suites) {
        for (const suite of results.suites) {
          if (suite.specs) {
            for (const spec of suite.specs) {
              if (spec.tests) {
                for (const test of spec.tests) {
                  if (test.results) {
                    for (const result of test.results) {
                      if (result.status === 'failed') {
                        hasFailures = true;
                        console.error(`❌ Test failed: ${test.title}`);
                      }
                      if (result.status === 'flaky') {
                        hasFlaky = true;
                        console.warn(`⚠️  Flaky test detected: ${test.title}`);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      
      // Exit with error code if there are failures or flaky tests in CI
      if (process.env.CI && (hasFailures || hasFlaky)) {
        console.error('\n❌ Tests failed or were flaky. Exiting with error code 1.');
        process.exit(1);
      }
      
      if (hasFailures) {
        console.error('\n❌ Some tests failed.');
        process.exit(1);
      }
      
      if (hasFlaky) {
        console.warn('\n⚠️  Some tests were flaky but eventually passed.');
      }
      
    } catch (error) {
      console.error('Error reading test results:', error);
      if (process.env.CI) {
        process.exit(1);
      }
    }
  } else {
    console.warn('No test results found at:', resultsPath);
    if (process.env.CI) {
      process.exit(1);
    }
  }
}

export default globalTeardown;
