# Quick Start Guide for Playwright Tests

This guide will help you get the Playwright tests running quickly.

## Prerequisites

- Node.js 18+
- npm

## Setup Instructions

### Option 1: Run Setup Verification Tests Only (No Application Required)

These tests verify that Playwright is working correctly without requiring the full React application:

```bash
# Install dependencies (if you haven't already)
npm install --legacy-peer-deps

# Install Playwright browsers
npx playwright install

# Run setup verification tests only
npx playwright test --project=setup
```

### Option 2: Run Full Application Tests

To run the complete test suite that tests the actual React application:

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Install Playwright browsers
npx playwright install

# 3. Create required environment files
echo "SEED_DEFAULT_USER_PASSWORD=s3cret" > .env.local
echo "PAGINATION_PAGE_SIZE=10" >> .env.local

# 4. Create mock AWS exports (required for CI)
npm run copy:mock:awsexports
npm run copy:mock:awsexportses5

# 5. Start the application in test mode (in one terminal)
npm run start:ci

# 6. Run tests (in another terminal)
npm run playwright:test
```

## Quick Test Commands

```bash
# Run setup verification only
npx playwright test --project=setup

# Run all tests
npm run playwright:test

# Run specific browser
npm run playwright:test:chromium

# Run with UI (interactive mode)
npm run playwright:test:ui

# View test report
npm run playwright:report
```

## Test Structure

- `setup-verification.spec.ts` - Basic Playwright functionality tests (no app required)
- `config-validation.spec.ts` - Configuration validation tests (no app required)
- `auth.spec.ts` - Authentication flow tests (requires app)
- `transactions.spec.ts` - Transaction management tests (requires app)
- `bank-accounts.spec.ts` - Bank account tests (requires app)
- `notifications.spec.ts` - Notification tests (requires app)
- `user-settings.spec.ts` - User settings tests (requires app)
- `e2e-journey.spec.ts` - End-to-end user journey tests (requires app)

## Troubleshooting

### Common Issues

1. **Browser not installed**: Run `npx playwright install`
2. **Port conflicts**: Make sure ports 3000 and 3001 are available
3. **Missing environment files**: Run the mock AWS export commands
4. **Dependency conflicts**: Use `--legacy-peer-deps` flag with npm

### Debug Mode

```bash
# Run with browser visible
npm run playwright:test:headed

# Run single test file
npx playwright test auth.spec.ts

# Run with debug mode
npx playwright test --debug
```

## CI/CD

The tests are automatically run on GitHub Actions for every pull request. The workflow:

1. Installs dependencies
2. Sets up test environment
3. Builds the application
4. Runs tests across multiple browsers
5. Uploads test reports and artifacts

Check the `.github/workflows/playwright-e2e.yml` file for the complete CI configuration.