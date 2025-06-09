# Email Setup Guide for Gmail

## Issue
The email functionality is failing with authentication error. This is because Gmail requires an **App Password** instead of your regular Gmail password when using SMTP.

## Solution: Setup Gmail App Password

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click on "2-Step Verification"
3. Follow the steps to enable 2-factor authentication if not already enabled

### Step 2: Generate App Password
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click on "App passwords"
3. You might need to sign in again
4. Select "Mail" as the app
5. Select "Other (custom name)" as the device
6. Enter "FLC Delivery Platform" as the name
7. Click "Generate"
8. **Copy the 16-character password** (e.g., "abcd efgh ijkl mnop")

### Step 3: Update Environment Variables
Update your `.env` file:

```env
# Replace with your Gmail address
NODEMAILER_EMAIL=your-email@gmail.com

# Replace with the 16-character app password (remove spaces)
NODEMAILER_PASSWORD=abcdefghijklmnop
```

### Step 4: Test Email
Run the test to verify email is working:
```bash
node test-email.js
```

## Alternative: Use a Different Email Service

If Gmail doesn't work, you can use other email services:

### Option 1: Outlook/Hotmail
```env
NODEMAILER_EMAIL=your-email@outlook.com
NODEMAILER_PASSWORD=your-password
NODEMAILER_SERVICE=outlook
```

### Option 2: Custom SMTP
```env
NODEMAILER_EMAIL=your-email@yourdomain.com
NODEMAILER_PASSWORD=your-password
NODEMAILER_HOST=smtp.yourdomain.com
NODEMAILER_PORT=587
```

## Common Issues

1. **Invalid login**: App password not set correctly
2. **Less secure apps**: Gmail no longer supports this - use app password
3. **2FA not enabled**: Required for app passwords
4. **Spaces in password**: Remove all spaces from the 16-character app password

## Testing
Once configured correctly, you should see:
- ✅ Email connection successful
- ✅ Test email sent successfully
- Email should arrive in the recipient's inbox within 1-2 minutes