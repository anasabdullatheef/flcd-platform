require('dotenv').config();
const nodemailer = require('nodemailer');

const verifyEmail = async () => {
  try {
    console.log('🔍 Verifying updated email configuration...');
    
    // Check password format
    const password = process.env.NODEMAILER_PASSWORD;
    console.log('Password length:', password?.length);
    console.log('Has spaces:', password?.includes(' ') ? '❌ YES (should be removed)' : '✅ NO (correct)');
    console.log('Expected format: 16 characters, no spaces');
    
    if (password?.includes(' ')) {
      console.log('\n⚠️  WARNING: Password contains spaces!');
      console.log('Current:', password);
      console.log('Should be:', password.replace(/\s/g, ''));
      console.log('Please remove spaces from NODEMAILER_PASSWORD in .env file');
      return;
    }
    
    if (password?.length !== 16) {
      console.log('\n⚠️  WARNING: Password length is not 16 characters!');
      console.log('Current length:', password?.length);
      console.log('Gmail App Password should be exactly 16 characters');
      return;
    }
    
    console.log('\n✅ Password format looks correct!');
    
    // Test connection
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });
    
    console.log('\n🔍 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    // Send test email
    console.log('\n📧 Sending verification email...');
    const result = await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: process.env.NODEMAILER_EMAIL,
      subject: '✅ FLC Email Configuration Working!',
      html: `
        <h2 style="color: green;">🎉 Email Configuration Successful!</h2>
        <p>Your FLC Delivery Platform email system is now working correctly.</p>
        <p><strong>Configuration Details:</strong></p>
        <ul>
          <li>✅ Gmail SMTP Connection: Working</li>
          <li>✅ Authentication: Successful</li>
          <li>✅ Email Delivery: Functional</li>
          <li>📧 From: ${process.env.NODEMAILER_EMAIL}</li>
          <li>⏰ Tested: ${new Date().toLocaleString()}</li>
        </ul>
        <p><strong>Next Steps:</strong></p>
        <ol>
          <li>Create new riders to test automatic email delivery</li>
          <li>Check rider creation includes email notifications</li>
          <li>Verify acknowledgements are generated properly</li>
        </ol>
        <hr>
        <p><small>This email was sent automatically by the FLC Delivery Platform.</small></p>
      `,
    });
    
    console.log('\n🎉 SUCCESS! Email system is working!');
    console.log('✅ Message ID:', result.messageId);
    console.log('📬 Check your inbox for the verification email');
    console.log('\n🚀 You can now create riders and they will receive email notifications!');
    
  } catch (error) {
    console.error('\n❌ Email verification failed:');
    console.error('Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\n🔐 Still having authentication issues:');
      console.error('1. Double-check the Gmail App Password is correct');
      console.error('2. Make sure 2-Factor Authentication is enabled');
      console.error('3. Try generating a new App Password');
      console.error('4. Ensure there are no spaces in the password');
    }
  }
};

verifyEmail();