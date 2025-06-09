# Email Service Configuration

The FLCD Platform includes an email service for sending OTP codes during registration and password reset. 

## Development Mode

By default, the system runs in **development mode** where emails are logged to the console instead of being sent. You'll see output like this:

```
==================================================
📧 EMAIL SERVICE (DEVELOPMENT MODE)
==================================================
📱 Phone: +971509876543
👤 Name: Jane Smith
🔢 OTP Code: 123456
⏰ Valid for: 10 minutes
📧 Would send to: 971509876543@temp.flcd.com
==================================================
💡 To enable real emails, configure EMAIL_HOST, EMAIL_USER, EMAIL_PASS in .env
==================================================
```

## Production Email Configuration

To enable real email sending, configure these environment variables in your `.env` file:

### Gmail SMTP (Recommended for testing)

```env
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-gmail@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="FLCD Platform <your-gmail@gmail.com>"
```

**Gmail Setup Steps:**
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: https://support.google.com/accounts/answer/185833
3. Use the App Password (not your regular Gmail password) in `EMAIL_PASS`

### Other SMTP Services

The service works with any SMTP provider:

```env
EMAIL_HOST="smtp.your-provider.com"
EMAIL_PORT=587
EMAIL_USER="your-username"
EMAIL_PASS="your-password"
EMAIL_FROM="FLCD Platform <noreply@yourdomain.com>"
```

**Popular providers:**
- **SendGrid**: `smtp.sendgrid.net:587`
- **Mailgun**: `smtp.mailgun.org:587`
- **Amazon SES**: `email-smtp.region.amazonaws.com:587`
- **Outlook**: `smtp-mail.outlook.com:587`

## Email Templates

The system includes two email templates:

### 1. OTP Registration Email
Sent when a new rider registers:
- Professional HTML template
- Includes the 6-digit OTP code
- 10-minute expiration notice
- Security warnings

### 2. Password Reset Email
Sent when users request password reset:
- Clean HTML design
- Password reset OTP code
- Security instructions

## Testing Email Configuration

To test your email configuration:

```bash
# Test registration OTP
curl -X POST "http://localhost:3000/api/auth/register/send-otp" \
  -H "Content-Type: application/json" \
  -d '{"phone": "+971555123456", "firstName": "Test", "lastName": "User"}'

# Test password reset OTP
curl -X POST "http://localhost:3000/api/auth/forgot-password/send-otp" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@flcd.com"}'
```

## Response Format

The API response includes an `emailSent` field:

```json
{
  "message": "OTP sent successfully",
  "expiresIn": 600,
  "emailSent": true
}
```

- `emailSent: true` = Email was sent successfully
- `emailSent: false` = Running in development mode (console logging)

## Security Notes

- Never commit real email credentials to version control
- Use environment variables for all sensitive configuration
- Consider using dedicated email service accounts
- Monitor email sending quotas and limits
- Implement rate limiting for OTP requests in production

## Troubleshooting

**Common Issues:**

1. **Gmail "Less secure app access"** - Use App Passwords instead
2. **Port blocked** - Try port 465 (SSL) or 587 (TLS)
3. **Authentication failed** - Verify credentials and 2FA setup
4. **Rate limiting** - Some providers limit emails per hour/day

**Debug Steps:**

1. Check console logs for detailed error messages
2. Verify environment variables are loaded correctly
3. Test SMTP credentials with a separate email client
4. Ensure firewall/network allows SMTP connections