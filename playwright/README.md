# Playwright E2E Testing

This directory contains end-to-end tests written with Playwright for the React Real World App.

## 🎯 Test Coverage

Our Playwright tests provide comprehensive coverage across all major user workflows:

### Authentication Tests (`auth.spec.ts`)
- User signup and form validation
- User signin and logout flows
- Remember user functionality
- Password visibility toggle
- Navigation between auth pages
- Error handling for invalid credentials

### Transaction Tests (`transactions.spec.ts`)
- View transaction feeds (public, contacts, personal)
- Create payment transactions
- Request money from other users
- Filter transactions by date and amount
- View transaction details
- Like and comment on transactions
- Form validation and error handling
- Mobile responsive behavior

### Bank Account Tests (`bank-accounts.spec.ts`)
- Add new bank accounts
- Edit existing bank accounts
- Delete bank accounts
- Form validation (routing number, account number)
- Mask sensitive information display
- Search and filter functionality
- Empty state handling

### Notification Tests (`notifications.spec.ts`)
- View notifications list
- Mark notifications as read/unread
- Dismiss notifications
- Filter notifications by type
- Navigate to related transactions
- Handle empty notifications state
- Real-time notification updates

### User Settings Tests (`user-settings.spec.ts`)
- Update profile information
- Change password
- Privacy settings management
- Profile picture upload
- Account deletion flow
- Two-factor authentication setup
- Data export functionality
- Form validation and error handling

### End-to-End Journey Tests (`e2e-journey.spec.ts`)
- Complete user onboarding flow
- Full transaction lifecycle
- Mobile navigation testing
- Cross-browser compatibility
- Performance and accessibility checks
- Error handling and recovery
- State persistence testing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install --legacy-peer-deps
```

2. Install Playwright browsers:
```bash
npm run playwright:install
```

### Running Tests

#### All tests across all browsers:
```bash
npm run playwright:test
```

#### Specific browser:
```bash
npm run playwright:test:chromium
npm run playwright:test:firefox
npm run playwright:test:webkit
```

#### Mobile tests only:
```bash
npm run playwright:test:mobile
```

#### Run with UI mode (interactive):
```bash
npm run playwright:test:ui
```

#### Run in headed mode (see browser):
```bash
npm run playwright:test:headed
```

#### View test reports:
```bash
npm run playwright:report
```

## 🛠 Configuration

The Playwright configuration is defined in `playwright.config.ts`:

- **Test Directory**: `./playwright/tests`
- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Parallel Execution**: Enabled for faster test runs
- **Retries**: 2 retries on CI, 0 locally
- **Screenshots**: Captured on failure
- **Videos**: Recorded on failure
- **Traces**: Collected on first retry

## 📁 File Structure

```
playwright/
├── tests/
│   ├── auth.spec.ts              # Authentication tests
│   ├── transactions.spec.ts      # Transaction management tests
│   ├── bank-accounts.spec.ts     # Bank account tests
│   ├── notifications.spec.ts     # Notification tests
│   ├── user-settings.spec.ts     # User settings tests
│   └── e2e-journey.spec.ts       # Complete user journey tests
├── utils/
│   └── helpers.ts                # Test utilities and helper functions
└── README.md                     # This file

playwright.config.ts              # Playwright configuration
```

## 🔧 Test Utilities

The `helpers.ts` file provides reusable utilities:

- `login()` - Login with username/password
- `logout()` - Logout user
- `signUp()` - Create new user account
- `getByTestId()` - Find elements by test ID
- `setupApiIntercepts()` - Mock API responses
- `createTestUser()` - Generate test user data
- `isMobileViewport()` - Detect mobile viewport
- `waitForResponse()` - Wait for API responses

## 🌐 Cross-Browser Testing

Tests run across multiple browsers and viewports:

### Desktop Browsers:
- **Chromium** - Latest Chrome/Edge
- **Firefox** - Latest Firefox
- **WebKit** - Latest Safari

### Mobile Devices:
- **Mobile Chrome** - Pixel 5 viewport
- **Mobile Safari** - iPhone 12 viewport

## 🚀 CI/CD Integration

The tests are integrated with GitHub Actions (`.github/workflows/playwright-e2e.yml`):

### Triggers:
- Pull requests to main/master/develop branches
- Pushes to main/master/develop branches
- Manual workflow dispatch

### Features:
- Parallel execution across browsers
- Separate mobile testing job
- Artifact upload (reports, screenshots, videos)
- PR comments with test results
- Test result aggregation and reporting

### Workflow Jobs:
1. **test** - Desktop browser tests (Chromium, Firefox, WebKit)
2. **mobile-test** - Mobile device tests (Mobile Chrome, Mobile Safari)
3. **report** - Aggregate results and comment on PR

## 📊 Test Reports

Playwright generates multiple types of reports:

### HTML Report:
- Interactive test results
- Screenshots and videos on failure
- Test timeline and traces
- Access via `npm run playwright:report`

### JUnit XML Report:
- Machine-readable test results
- Used for CI/CD integration
- Stored in `playwright-report/results.xml`

### JSON Report:
- Programmatic access to test results
- Stored in `playwright-report/results.json`

## 🐛 Debugging Tests

### Local Debugging:
```bash
# Run tests with browser visible
npm run playwright:test:headed

# Run tests with interactive UI
npm run playwright:test:ui

# Run specific test file
npx playwright test auth.spec.ts

# Run specific test
npx playwright test auth.spec.ts -g "should login successfully"
```

### CI Debugging:
- Check uploaded artifacts for screenshots and videos
- Review HTML reports for detailed failure information
- Use trace viewer for step-by-step debugging

## 🎨 Best Practices

### Test Structure:
- Use descriptive test names
- Group related tests in describe blocks
- Keep tests independent and isolated
- Use proper setup and teardown

### Selectors:
- Prefer `data-testid` attributes
- Use semantic selectors when possible
- Avoid fragile CSS selectors
- Implement page object models for complex pages

### Assertions:
- Use appropriate Playwright assertions
- Wait for elements before interacting
- Assert both positive and negative scenarios
- Verify visual and functional behavior

### Maintenance:
- Keep tests up-to-date with application changes
- Regularly review and refactor test code
- Monitor test flakiness and stability
- Update dependencies and Playwright versions

## 📞 Support

For questions or issues related to the Playwright tests:

1. Check the [Playwright documentation](https://playwright.dev/docs/intro)
2. Review existing test patterns in this repository
3. Check GitHub Issues for known problems
4. Contact the development team for assistance

## 🔄 Migration from Cypress

This Playwright test suite was created to replace/complement the existing Cypress tests. Key differences:

### Advantages of Playwright:
- Better cross-browser support (Chromium, Firefox, WebKit)
- Faster test execution
- Built-in waiting and retry mechanisms
- Better TypeScript support
- More reliable mobile testing
- Superior debugging tools

### Migration Notes:
- Test patterns converted from Cypress to Playwright syntax
- API mocking strategy adapted for Playwright
- Selectors updated to use Playwright conventions
- Enhanced error handling and reporting