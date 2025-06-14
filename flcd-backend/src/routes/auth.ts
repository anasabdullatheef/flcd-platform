import express from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { emailService } from '../services/emailService';

const router = express.Router();
const prisma = new PrismaClient();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const registerOTPSchema = z.object({
  phone: z.string().min(10),
  firstName: z.string().min(1),
  lastName: z.string().min(1)
});

const verifyOTPSchema = z.object({
  phone: z.string().min(10),
  otp: z.string().length(6),
  password: z.string().min(6)
});

const refreshTokenSchema = z.object({
  refreshToken: z.string()
});

const forgotPasswordOTPSchema = z.object({
  email: z.string().email()
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(6)
});

interface OTPStore {
  [key: string]: {
    otp: string;
    expiresAt: Date;
    userData?: any;
  };
}

const otpStore: OTPStore = {};

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateTokens(userId: string) {
  const secret = process.env.JWT_SECRET || 'default-secret';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
  
  const accessToken = jwt.sign(
    { userId },
    secret,
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { userId },
    refreshSecret,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user with email and password
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const tokens = generateTokens(user.id);

    const userData = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.userRoles.map(ur => ur.role.name),
      permissions: user.userRoles.flatMap(ur =>
        ur.role.permissions.map(rp => rp.permission.name)
      )
    };

    res.json({
      message: 'Login successful',
      user: userData,
      ...tokens
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/register/send-otp', async (req, res) => {
  try {
    const { phone, firstName, lastName } = registerOTPSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { phone }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Phone number already registered' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    otpStore[phone] = {
      otp,
      expiresAt,
      userData: { phone, firstName, lastName }
    };

    // Send OTP via email
    const emailSent = await emailService.sendOTP(phone, firstName, lastName, otp);
    
    if (!emailSent) {
      console.warn(`Failed to send OTP email for ${phone}, but continuing with console log`);
    }

    res.json({
      message: 'OTP sent successfully',
      expiresIn: 600, // 10 minutes in seconds
      emailSent: emailSent
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/register/verify-otp', async (req, res) => {
  try {
    const { phone, otp, password } = verifyOTPSchema.parse(req.body);

    const storedOTP = otpStore[phone];
    if (!storedOTP) {
      return res.status(400).json({ error: 'OTP not found or expired' });
    }

    if (storedOTP.expiresAt < new Date()) {
      delete otpStore[phone];
      return res.status(400).json({ error: 'OTP expired' });
    }

    if (storedOTP.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        phone,
        firstName: storedOTP.userData.firstName,
        lastName: storedOTP.userData.lastName,
        email: `${phone}@rider.flcd.com`, // Temporary email for riders
        password: hashedPassword
      }
    });

    const riderRole = await prisma.role.findUnique({
      where: { name: 'RIDER' }
    });

    if (riderRole) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: riderRole.id
        }
      });
    }

    delete otpStore[phone];

    const tokens = generateTokens(user.id);

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName
      },
      ...tokens
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Get new access token using refresh token
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Valid refresh token
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'default-refresh-secret') as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const tokens = generateTokens(user.id);

    res.json({
      message: 'Token refreshed successfully',
      ...tokens
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Refresh token error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.post('/forgot-password/send-otp', async (req, res) => {
  try {
    const { email } = forgotPasswordOTPSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    otpStore[email] = {
      otp,
      expiresAt
    };

    // Send password reset OTP via email
    const emailSent = await emailService.sendPasswordResetOTP(email, otp);
    
    if (!emailSent) {
      console.warn(`Failed to send password reset email for ${email}, but continuing with console log`);
    }

    res.json({
      message: 'Password reset OTP sent successfully',
      expiresIn: 600,
      emailSent: emailSent
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Forgot password OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/forgot-password/verify-reset', async (req, res) => {
  try {
    const { email, otp, newPassword } = resetPasswordSchema.parse(req.body);

    const storedOTP = otpStore[email];
    if (!storedOTP) {
      return res.status(400).json({ error: 'OTP not found or expired' });
    }

    if (storedOTP.expiresAt < new Date()) {
      delete otpStore[email];
      return res.status(400).json({ error: 'OTP expired' });
    }

    if (storedOTP.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    delete otpStore[email];

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;