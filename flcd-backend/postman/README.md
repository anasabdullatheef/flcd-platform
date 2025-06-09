# FLCD Platform Postman Testing Suite

This directory contains comprehensive Postman collections for testing the FLCD Platform API.

## Files

1. **FLCD_Platform_API_Collection.json** - Main collection with all API endpoints
2. **FLCD_Platform_Environment.json** - Environment variables for local testing

## Setup Instructions

### 1. Import Collection and Environment

1. Open Postman
2. Click "Import" button
3. Select both JSON files:
   - `FLCD_Platform_API_Collection.json`
   - `FLCD_Platform_Environment.json`
4. Click "Import"

### 2. Select Environment

1. In Postman, click the environment dropdown (top right)
2. Select "FLCD Platform - Local"

### 3. Start Backend Server

```bash
cd flcd-backend
npm run dev
```

Ensure the server is running on port 3000.

## Running Tests

### Option 1: Run Full Collection

1. Click on "FLCD Platform API Collection" in Collections
2. Click "Run" button
3. Click "Run FLCD Platform API Collection"
4. Watch as all tests execute in sequence

### Option 2: Run Individual Folders

1. Navigate to specific folder (e.g., "01. Authentication")
2. Click the "..." menu
3. Select "Run folder"

### Option 3: Run Individual Requests

1. Click on any request
2. Click "Send"
3. Check the "Test Results" tab for validation

## Test Flow

The collection is organized in a specific order:

1. **Authentication** - Register super admin and login
2. **Roles & Permissions** - Set up roles and permissions
3. **User Management** - Create and manage users
4. **Rider Management** - Full CRUD operations for riders
5. **Document Management** - Upload and manage documents
6. **Email Configuration** - Set up email settings
7. **Dashboard Stats** - Get dashboard statistics
8. **Cleanup** - Remove test data

## Key Features

### Automatic Token Management

- Login automatically saves `accessToken` and `refreshToken`
- All authenticated requests use the saved token
- Token refresh endpoint available for expired tokens

### Test Validations

Each request includes tests that validate:
- Response status codes
- Response structure
- Required fields
- Data types

### Variable Management

The collection automatically captures and uses:
- `accessToken` - JWT token for authentication
- `refreshToken` - Token for refreshing access
- `testUserId` - Created user ID for testing
- `testRoleId` - Created role ID for testing
- `testRiderId` - Created rider ID for testing
- `testEmailConfigId` - Created email config ID for testing

## Common Issues

### 1. Authentication Failed

- Ensure you've run "Register Super Admin" first
- Check that the backend server is running
- Verify port 3000 is not blocked

### 2. Tests Failing

- Run tests in order (authentication first)
- Check that previous tests passed
- Verify backend endpoints are implemented

### 3. Port Issues

- Ensure backend is running on port 3000
- Check no other service is using port 3000
- Update `baseUrl` in environment if using different port

## Customization

### Change Base URL

1. Edit environment
2. Update `baseUrl` variable
3. Save environment

### Add New Tests

1. Add request to appropriate folder
2. Include test scripts in "Tests" tab
3. Use collection variables for dynamic data

## Best Practices

1. **Run in Order**: First time users should run the entire collection in order
2. **Clean Test Data**: Use the Cleanup folder to remove test data
3. **Check Tests Tab**: Always check test results after each request
4. **Use Variables**: Use collection/environment variables for reusable data
5. **Save Changes**: Save collection after adding new requests or tests

## Continuous Testing

For CI/CD integration, use Newman (Postman CLI):

```bash
# Install Newman
npm install -g newman

# Run collection
newman run FLCD_Platform_API_Collection.json \
  -e FLCD_Platform_Environment.json \
  --reporters cli,json \
  --reporter-json-export test-results.json
```

## Support

For issues or questions:
1. Check backend logs for errors
2. Verify all endpoints are implemented
3. Ensure database is properly seeded
4. Check authentication tokens are valid