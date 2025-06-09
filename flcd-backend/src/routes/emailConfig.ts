import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import nodemailer from 'nodemailer';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const emailConfigSchema = z.object({
  host: z.string().min(1, 'Host is required'),
  port: z.number().min(1).max(65535, 'Port must be between 1 and 65535').default(587),
  secure: z.boolean().default(false),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  fromEmail: z.string().email('Valid email is required'),
  fromName: z.string().min(1, 'From name is required').default('FLCD Platform'),
  testEmail: z.string().email('Valid test email is required').optional(),
  isDefault: z.boolean().default(false)
});

const testEmailSchema = z.object({
  id: z.string().cuid(),
  testEmail: z.string().email('Valid test email is required')
});

// Apply authentication to all routes
router.use(authenticateToken as any);

// GET /api/email-config - Get all email configurations
router.get('/', async (req, res) => {
  try {
    const emailConfigs = await prisma.emailConfiguration.findMany({
      select: {
        id: true,
        host: true,
        port: true,
        secure: true,
        username: true,
        // Don't return password for security
        fromEmail: true,
        fromName: true,
        isActive: true,
        isDefault: true,
        testEmail: true,
        lastTested: true,
        testResult: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({ emailConfigurations: emailConfigs });
  } catch (error) {
    console.error('Get email configurations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/email-config - Create new email configuration
router.post('/', async (req, res) => {
  try {
    const validatedData = emailConfigSchema.parse(req.body);
    const userId = (req as AuthenticatedRequest).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // If this is set as default, unset all other defaults
    if (validatedData.isDefault) {
      await prisma.emailConfiguration.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
    }

    const emailConfig = await prisma.emailConfiguration.create({
      data: {
        ...validatedData,
        createdBy: userId
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Don't return password
    const { password, ...configResponse } = emailConfig;

    res.status(201).json({ 
      message: 'Email configuration created successfully',
      emailConfiguration: configResponse
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Create email configuration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/email-config/:id - Update email configuration
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = emailConfigSchema.parse(req.body);

    // Check if configuration exists
    const existingConfig = await prisma.emailConfiguration.findUnique({
      where: { id }
    });

    if (!existingConfig) {
      return res.status(404).json({ error: 'Email configuration not found' });
    }

    // If this is set as default, unset all other defaults
    if (validatedData.isDefault) {
      await prisma.emailConfiguration.updateMany({
        where: { 
          isDefault: true,
          id: { not: id }
        },
        data: { isDefault: false }
      });
    }

    const updatedConfig = await prisma.emailConfiguration.update({
      where: { id },
      data: validatedData,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Don't return password
    const { password, ...configResponse } = updatedConfig;

    res.json({ 
      message: 'Email configuration updated successfully',
      emailConfiguration: configResponse
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Update email configuration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/email-config/:id/test - Test email configuration
router.post('/:id/test', async (req, res) => {
  try {
    const { id } = req.params;
    const { testEmail } = testEmailSchema.parse({ id, testEmail: req.body.testEmail });

    // Get the email configuration
    const emailConfig = await prisma.emailConfiguration.findUnique({
      where: { id }
    });

    if (!emailConfig) {
      return res.status(404).json({ error: 'Email configuration not found' });
    }

    // Test the email configuration
    const transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.username,
        pass: emailConfig.password
      }
    });

    // Verify the connection
    await transporter.verify();

    // Send a test email
    const testResult = await transporter.sendMail({
      from: `${emailConfig.fromName} <${emailConfig.fromEmail}>`,
      to: testEmail,
      subject: 'FLCD Platform - Email Configuration Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Configuration Test</h2>
          <p>This is a test email from FLCD Platform.</p>
          
          <div style="background-color: #f4f4f4; padding: 20px; margin: 20px 0;">
            <h3 style="color: #333; margin: 0;">Configuration Details:</h3>
            <p><strong>Host:</strong> ${emailConfig.host}:${emailConfig.port}</p>
            <p><strong>From:</strong> ${emailConfig.fromName} &lt;${emailConfig.fromEmail}&gt;</p>
            <p><strong>Security:</strong> ${emailConfig.secure ? 'SSL/TLS' : 'STARTTLS'}</p>
          </div>
          
          <p>✅ If you received this email, your email configuration is working correctly!</p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            This is a test email from FLCD Platform. Test conducted at ${new Date().toISOString()}.
          </p>
        </div>
      `
    });

    // Update the configuration with test results
    await prisma.emailConfiguration.update({
      where: { id },
      data: {
        testEmail,
        lastTested: new Date(),
        testResult: `Success: Email sent to ${testEmail}`
      }
    });

    res.json({ 
      message: 'Test email sent successfully',
      testResult: {
        success: true,
        messageId: testResult.messageId,
        testEmail,
        testedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    // Update configuration with error result
    try {
      await prisma.emailConfiguration.update({
        where: { id: req.params.id },
        data: {
          lastTested: new Date(),
          testResult: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      });
    } catch (updateError) {
      console.error('Failed to update test result:', updateError);
    }

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    
    console.error('Test email configuration error:', error);
    res.status(400).json({ 
      error: 'Email test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      testResult: {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        testedAt: new Date().toISOString()
      }
    });
  }
});

// POST /api/email-config/:id/set-default - Set as default configuration
router.post('/:id/set-default', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if configuration exists
    const existingConfig = await prisma.emailConfiguration.findUnique({
      where: { id }
    });

    if (!existingConfig) {
      return res.status(404).json({ error: 'Email configuration not found' });
    }

    // Unset all other defaults and set this one as default
    await prisma.$transaction([
      prisma.emailConfiguration.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      }),
      prisma.emailConfiguration.update({
        where: { id },
        data: { isDefault: true }
      })
    ]);

    res.json({ message: 'Email configuration set as default successfully' });
  } catch (error) {
    console.error('Set default email configuration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/email-config/:id - Delete email configuration
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if configuration exists
    const existingConfig = await prisma.emailConfiguration.findUnique({
      where: { id }
    });

    if (!existingConfig) {
      return res.status(404).json({ error: 'Email configuration not found' });
    }

    // Don't allow deleting the default configuration if it's the only one
    if (existingConfig.isDefault) {
      const totalConfigs = await prisma.emailConfiguration.count();
      if (totalConfigs === 1) {
        return res.status(400).json({ 
          error: 'Cannot delete the only email configuration. Create another one first.' 
        });
      }
    }

    await prisma.emailConfiguration.delete({
      where: { id }
    });

    res.json({ message: 'Email configuration deleted successfully' });
  } catch (error) {
    console.error('Delete email configuration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;