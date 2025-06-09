import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private async getEmailConfiguration() {
    try {
      // First try to get the default email configuration from database
      const defaultConfig = await this.prisma.emailConfiguration.findFirst({
        where: { 
          isDefault: true,
          isActive: true 
        }
      });

      if (defaultConfig) {
        return {
          host: defaultConfig.host,
          port: defaultConfig.port,
          secure: defaultConfig.secure,
          auth: {
            user: defaultConfig.username,
            pass: defaultConfig.password
          },
          fromEmail: defaultConfig.fromEmail,
          fromName: defaultConfig.fromName
        };
      }

      // Fallback to environment variables
      const emailHost = process.env.EMAIL_HOST;
      const emailPort = process.env.EMAIL_PORT;
      const emailUser = process.env.EMAIL_USER;
      const emailPass = process.env.EMAIL_PASS;

      if (emailHost && emailUser && emailPass) {
        return {
          host: emailHost,
          port: parseInt(emailPort || '587'),
          secure: parseInt(emailPort || '587') === 465,
          auth: {
            user: emailUser,
            pass: emailPass
          },
          fromEmail: process.env.EMAIL_FROM || emailUser,
          fromName: 'FLCD Platform'
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting email configuration:', error);
      return null;
    }
  }

  private async createTransporter() {
    const config = await this.getEmailConfiguration();

    if (!config) {
      console.warn('Email service not configured. Emails will be logged to console only.');
      return nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true
      });
    }

    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth
    });
  }

  async sendOTP(phone: string, firstName: string, lastName: string, otp: string): Promise<boolean> {
    try {
      const config = await this.getEmailConfiguration();
      const transporter = await this.createTransporter();

      // For now, since we don't have email addresses for phone-based registration,
      // we'll create a temporary email format
      const tempEmail = `${phone.replace(/\+/g, '').replace(/\s/g, '')}@temp.flcd.com`;
      
      const fromAddress = config 
        ? `${config.fromName} <${config.fromEmail}>`
        : 'FLCD Platform <noreply@flcd.com>';

      const mailOptions = {
        from: fromAddress,
        to: tempEmail,
        subject: 'FLCD Platform - OTP Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to FLCD Platform</h2>
            <p>Hello ${firstName} ${lastName},</p>
            <p>Thank you for registering with FLCD Platform. Please use the following OTP to complete your registration:</p>
            
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #333; font-size: 32px; letter-spacing: 4px; margin: 0;">${otp}</h1>
            </div>
            
            <p><strong>Important:</strong></p>
            <ul>
              <li>This OTP is valid for 10 minutes only</li>
              <li>Do not share this code with anyone</li>
              <li>If you didn't request this, please ignore this email</li>
            </ul>
            
            <p>Phone: ${phone}</p>
            
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              This is an automated email from FLCD Platform. Please do not reply to this email.
            </p>
          </div>
        `
      };

      // If email service is not configured, just log to console
      if (!config) {
        console.log('\n' + '='.repeat(50));
        console.log('📧 EMAIL SERVICE (DEVELOPMENT MODE)');
        console.log('='.repeat(50));
        console.log(`📱 Phone: ${phone}`);
        console.log(`👤 Name: ${firstName} ${lastName}`);
        console.log(`🔢 OTP Code: ${otp}`);
        console.log(`⏰ Valid for: 10 minutes`);
        console.log(`📧 Would send to: ${tempEmail}`);
        console.log('='.repeat(50));
        console.log('💡 To enable real emails, configure email settings in Admin > Settings');
        console.log('='.repeat(50) + '\n');
        return false;
      }

      const result = await transporter.sendMail(mailOptions);
      console.log(`OTP email sent successfully to ${tempEmail}:`, result.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      return false;
    }
  }

  async sendPasswordResetOTP(email: string, otp: string): Promise<boolean> {
    try {
      const config = await this.getEmailConfiguration();
      const transporter = await this.createTransporter();

      const fromAddress = config 
        ? `${config.fromName} <${config.fromEmail}>`
        : 'FLCD Platform <noreply@flcd.com>';

      const mailOptions = {
        from: fromAddress,
        to: email,
        subject: 'FLCD Platform - Password Reset Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>You have requested to reset your password for FLCD Platform.</p>
            <p>Please use the following OTP to reset your password:</p>
            
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #333; font-size: 32px; letter-spacing: 4px; margin: 0;">${otp}</h1>
            </div>
            
            <p><strong>Important:</strong></p>
            <ul>
              <li>This OTP is valid for 10 minutes only</li>
              <li>Do not share this code with anyone</li>
              <li>If you didn't request this, please ignore this email</li>
            </ul>
            
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              This is an automated email from FLCD Platform. Please do not reply to this email.
            </p>
          </div>
        `
      };

      // If email service is not configured, just log to console
      if (!config) {
        console.log('\n' + '='.repeat(50));
        console.log('📧 EMAIL SERVICE (DEVELOPMENT MODE)');
        console.log('='.repeat(50));
        console.log(`📧 Email: ${email}`);
        console.log(`🔢 Reset OTP: ${otp}`);
        console.log(`⏰ Valid for: 10 minutes`);
        console.log('='.repeat(50));
        console.log('💡 To enable real emails, configure email settings in Admin > Settings');
        console.log('='.repeat(50) + '\n');
        return false;
      }

      const result = await transporter.sendMail(mailOptions);
      console.log(`Password reset email sent successfully to ${email}:`, result.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();