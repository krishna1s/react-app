# Workspace Management Test Cases

This document describes the Playwright test cases for the "Workspace Management - Create Workspace" functionality.

## Test Cases Overview

The test suite implements the following test cases as specified in the requirements:

### TC-001: Sign in and create a new workspace
- **Description**: Verify that a user can successfully sign in and create a new Playwright Testing workspace by providing valid workspace details, and is redirected to the setup guide.
- **Steps**: 
  1. Navigate to the Playwright portal
  2. Verify user authentication
  3. Confirm no existing workspace
  4. Click "+ New workspace"
  5. Enter workspace name (3-64 alphanumeric characters)
  6. Select Azure subscription
  7. Choose region for data storage
  8. Click "Create workspace"
- **Expected Results**: Workspace creation completes successfully and user is redirected to getting started guide

### TC-002: Validate required workspace info and creation flow
- **Description**: Ensure that the workspace creation flow enforces required fields and validation for workspace name, subscription, and region.
- **Steps**:
  1. Attempt to submit empty form
  2. Verify validation errors for required fields
  3. Test invalid workspace names (too short, too long, non-alphanumeric)
  4. Enter valid data and verify successful creation
- **Expected Results**: Validation prevents submission with invalid data, allows submission with valid data

### TC-003: Ensure getting started guide appears after workspace creation
- **Description**: Verify that after successfully creating a workspace, the user is immediately redirected to the getting started/setup guide.
- **Steps**:
  1. Complete workspace creation
  2. Observe immediate redirect to getting started guide
- **Expected Results**: Getting started guide is displayed with workspace-specific information

### Additional: Mobile viewport compatibility
- **Description**: Test that workspace creation flow works correctly on mobile viewports
- **Steps**:
  1. Set mobile viewport (375x667)
  2. Complete workspace creation flow
  3. Verify mobile-optimized UI elements
- **Expected Results**: All functionality works correctly on mobile devices

## Test Implementation Details

### Technology Stack
- **Framework**: Playwright with TypeScript
- **Test Structure**: Page Object Model pattern with helper utilities
- **Data**: Mock HTML pages with embedded JavaScript for form validation

### Key Features
- **Data-driven testing**: Uses test data attributes (`data-testid`) for reliable element selection
- **Form validation**: JavaScript-based validation with proper error handling
- **Mobile testing**: Responsive design validation across different viewport sizes
- **Mock scenarios**: Self-contained test scenarios using `page.setContent()` for consistency

### Test Data Attributes Used
- `portal-title`: Main portal title
- `no-workspace-message`: Message indicating no workspace exists
- `new-workspace-button`: Button to create new workspace
- `workspace-creation-dialog`: Main creation form dialog
- `workspace-name-input`: Workspace name input field
- `subscription-dropdown`: Azure subscription selector
- `region-dropdown`: Region selector
- `create-workspace-submit`: Submit button
- `workspace-name-error`: Validation error for workspace name
- `subscription-error`: Validation error for subscription
- `region-error`: Validation error for region
- `getting-started-guide`: Getting started page content
- `setup-instructions`: Setup instruction content
- `workspace-info`: Workspace information display

## Running the Tests

```bash
# Run all workspace management tests
npx playwright test workspace-management.spec.ts

# Run with UI mode for debugging
npx playwright test workspace-management.spec.ts --ui

# Run specific test case
npx playwright test workspace-management.spec.ts -g "TC-001"

# Run with verbose output
npx playwright test workspace-management.spec.ts --reporter=line
```

## Test Configuration

The tests are configured to run:
- **Browser**: Chromium (with setup verification tests running first)
- **Viewport**: Desktop (1280x720) by default, mobile (375x667) for mobile-specific tests
- **Timeout**: 15 seconds for actions, 5 seconds for assertions
- **Retries**: 2 retries on CI, 0 locally

## Maintenance

These tests use mock HTML content to ensure consistency and avoid external dependencies. When updating:

1. Maintain the existing `data-testid` attributes for element selection
2. Update validation logic in embedded JavaScript if business rules change
3. Ensure mobile viewport tests remain responsive
4. Keep test descriptions synchronized with actual test behavior