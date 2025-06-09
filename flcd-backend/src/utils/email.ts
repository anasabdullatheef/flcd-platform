import nodemailer from 'nodemailer';

// Create transporter with better error handling and configuration
const createTransporter = () => {
  if (!process.env.NODEMAILER_EMAIL || !process.env.NODEMAILER_PASSWORD) {
    throw new Error('Email configuration missing: NODEMAILER_EMAIL and NODEMAILER_PASSWORD are required');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    },
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development',
  });
};

export const sendRiderCredentials = async (
  email: string,
  firstName: string,
  lastName: string,
  riderCode: string,
  password: string
) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: 'Welcome to FLC Delivery Services - Your Login Credentials',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #000;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #f9f9f9;
              padding: 20px;
              border-radius: 0 0 5px 5px;
              border: 1px solid #ddd;
            }
            .credentials {
              background-color: #fff;
              padding: 15px;
              border-radius: 5px;
              margin: 15px 0;
              border-left: 4px solid #000;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
            .important {
              color: #d32f2f;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Welcome to FLC Delivery Services</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName} ${lastName},</h2>
            <p>Welcome to FLC Delivery Services! Your rider account has been successfully created.</p>
            
            <div class="credentials">
              <h3>Your Login Credentials:</h3>
              <p><strong>Rider ID:</strong> ${riderCode}</p>
              <p><strong>Password:</strong> ${password}</p>
              <p><strong>Email:</strong> ${email}</p>
            </div>
            
            <p class="important">Important Security Information:</p>
            <ul>
              <li>Please keep your login credentials secure and confidential</li>
              <li>Do not share your password with anyone</li>
              <li>Change your password after your first login</li>
              <li>Contact admin if you suspect any unauthorized access</li>
            </ul>
            
            <p>You can use these credentials to log into the FLC Delivery Services rider portal to:</p>
            <ul>
              <li>View your profile and documents</li>
              <li>Check your work assignments</li>
              <li>Access training materials</li>
              <li>Submit acknowledgments</li>
            </ul>
            
            <p>If you have any questions or need assistance, please contact our support team.</p>
            
            <p>Best regards,<br>
            FLC Delivery Services Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; 2024 FLC Delivery Services. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email server connection verified');
    return true;
  } catch (error) {
    console.error('Email server connection failed:', error);
    throw error;
  }
};