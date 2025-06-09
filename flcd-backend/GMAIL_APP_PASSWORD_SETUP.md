# 🔧 Gmail App Password Setup Guide

## Current Issue
❌ **Authentication Failed**: The current password in `.env` is not a valid Gmail App Password
❌ **Error**: `535-5.7.8 Username and Password not accepted`

## ✅ Solution: Generate Proper Gmail App Password

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Sign in to your Gmail account: `info.abhijithk@gmail.com`
3. Look for "2-Step Verification" section
4. If not enabled, click "Get started" and follow the setup

### Step 2: Generate App Password
1. **After 2FA is enabled**, go back to [Google Account Security](https://myaccount.google.com/security)
2. Look for "App passwords" (under "Signing in to Google")
3. Click on "App passwords"
4. You may need to sign in again
5. In the dropdown:
   - Select app: **"Mail"**
   - Select device: **"Other (custom name)"**
   - Enter name: **"FLC Delivery Platform"**
6. Click **"Generate"**
7. Copy the **16-character password** (it looks like: `abcd efgh ijkl mnop`)

### Step 3: Update Environment File
1. Open `/Users/aami/Documents/hashinclude/flcd-platform/flcd-backend/.env`
2. Replace the current line:
   ```env
   NODEMAILER_PASSWORD=pobk jfyy kdfe pold
   ```
   With the new app password (remove all spaces):
   ```env
   NODEMAILER_PASSWORD=abcdefghijklmnop
   ```

### Step 4: Test Email
Run the test again:
```bash
node test-email-direct.js
```

## 🚨 Important Notes

1. **Remove Spaces**: The app password should be 16 characters with NO spaces
2. **Current Password Issue**: `pobk jfyy kdfe pold` has spaces and is invalid
3. **Don't Use Regular Password**: Never use your regular Gmail password for SMTP
4. **2FA Required**: App passwords only work with 2-Factor Authentication enabled

## 🎯 Expected Result
After fixing, you should see:
- ✅ Connection successful!
- ✅ Email sent successfully!
- 📧 Test email received in inbox

## 🔄 Alternative: Use Different Email Service
If Gmail continues to have issues, we can switch to:

### Option 1: Outlook/Hotmail
```env
NODEMAILER_EMAIL=your-email@outlook.com
NODEMAILER_PASSWORD=your-regular-password
```

### Option 2: Custom SMTP (if you have business email)
```env
NODEMAILER_EMAIL=your-email@yourdomain.com
NODEMAILER_PASSWORD=your-password
NODEMAILER_HOST=smtp.yourdomain.com
NODEMAILER_PORT=587
```

---

**Next Step**: Follow Step 1-4 above to generate a proper Gmail App Password and update the `.env` file.