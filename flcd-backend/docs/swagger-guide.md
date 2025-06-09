# Swagger API Documentation Guide

## Access Swagger UI

Once your backend server is running, you can access the interactive API documentation at:

**http://localhost:3000/api-docs**

## Features

### 1. Interactive Documentation
- View all available endpoints organized by categories
- See request/response schemas
- Try out API endpoints directly from the browser

### 2. Authentication
- Click the "Authorize" button in the top right
- Enter your JWT token in the format: `Bearer YOUR_TOKEN_HERE`
- All subsequent requests will include the authorization header

### 3. Testing Endpoints

#### Step 1: Login
1. Navigate to **Authentication** section
2. Click on `POST /auth/login`
3. Click "Try it out"
4. Use these credentials:
   ```json
   {
     "email": "admin@flcd.com",
     "password": "admin123"
   }
   ```
5. Click "Execute"
6. Copy the `accessToken` from the response

#### Step 2: Authorize
1. Click the "Authorize" button at the top
2. Enter: `Bearer YOUR_COPIED_TOKEN`
3. Click "Authorize"

#### Step 3: Test Other Endpoints
Now you can test any endpoint that requires authentication.

### 4. Available Endpoints

#### Authentication
- `POST /auth/login` - Login with email/password
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/register/send-otp` - Send OTP for registration
- `POST /auth/register/verify-otp` - Verify OTP and complete registration

#### Users
- `GET /users/profile` - Get current user profile
- `GET /users` - Get all users (requires permission)
- `POST /users` - Create new user
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

#### Roles
- `GET /roles` - Get all roles
- `GET /roles/modules` - Get system modules and permissions
- `POST /roles` - Create new role
- `PUT /roles/{id}` - Update role
- `DELETE /roles/{id}` - Delete role

#### Riders
- `GET /riders` - Get all riders (with pagination)
- `POST /riders` - Create new rider
- `GET /riders/{id}` - Get rider details
- `PUT /riders/{id}` - Update rider
- `DELETE /riders/{id}` - Delete rider
- `GET /riders/template` - Download CSV template
- `POST /riders/bulk-upload` - Bulk upload riders via CSV

#### Documents
- `POST /documents/riders/{riderId}/documents` - Upload documents
- `GET /documents/riders/{riderId}/documents` - Get rider documents
- `DELETE /documents/documents/{documentId}` - Delete document

#### Email Configuration
- `GET /email-config` - Get email configurations
- `POST /email-config` - Create email configuration
- `PUT /email-config/{id}` - Update email configuration
- `DELETE /email-config/{id}` - Delete email configuration
- `POST /email-config/{id}/test` - Test email configuration

## Tips

### 1. Response Codes
- **200** - Success
- **201** - Created successfully
- **400** - Bad request (validation error)
- **401** - Unauthorized (invalid/missing token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not found
- **500** - Internal server error

### 2. Error Responses
All error responses follow this format:
```json
{
  "error": "Error message description"
}
```

### 3. Pagination
Endpoints that return lists (like riders) support pagination:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search term
- `status` - Filter by status

### 4. File Uploads
For file upload endpoints (documents):
- Use `multipart/form-data` content type
- Supported formats: PDF, JPG, JPEG, PNG, DOC, DOCX
- Multiple files can be uploaded at once

### 5. Bulk Operations
For bulk upload:
- Download the CSV template first
- Fill it with your data
- Upload the CSV file

## Troubleshooting

### Token Expired
If you get 401 errors after some time:
1. Use the refresh token endpoint to get a new token
2. Or login again to get fresh tokens

### CORS Issues
If testing from a browser and getting CORS errors:
- The API allows all origins in development
- Make sure you're accessing the correct port (3000)

### File Upload Issues
- Ensure files are within size limits
- Check that file types are supported
- Verify you have proper permissions

## Advanced Usage

### Export to Postman
1. In Swagger UI, click on the API title
2. Look for export options or copy the OpenAPI spec URL
3. Import into Postman using: `http://localhost:3000/api-docs/swagger.json`

### Generate Client SDKs
You can use the OpenAPI specification to generate client libraries:
- Use tools like `openapi-generator`
- Supports multiple languages (JavaScript, Python, Java, etc.)

### API Testing
- Use the interactive interface for manual testing
- Copy curl commands for automation
- Export to various testing tools