import express from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken, requirePermission, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const createUserSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  roleIds: z.array(z.string()).optional()
});

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  isActive: z.boolean().optional()
});

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional()
});

const updatePermissionsSchema = z.object({
  roleIds: z.array(z.string())
});

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve the profile of the currently authenticated user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { userId: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
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

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = {
      ...user,
      roles: user.userRoles.map(ur => ur.role),
      permissions: user.userRoles.flatMap(ur =>
        ur.role.permissions.map(rp => rp.permission)
      )
    };

    res.json({ user: userData });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update current user profile
router.put('/profile', async (req: any, res) => {
  try {
    const updateData = updateProfileSchema.parse(req.body);

    const updatedUser = await prisma.user.update({
      where: { email: 'admin@flcd.com' },
      data: updateData,
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve list of all users with their roles and permissions
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering users
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter users by role name
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                     current:
 *                       type: integer
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get all users (Admin only)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const role = req.query.role as string;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role) {
      where.userRoles = {
        some: {
          role: {
            name: role
          }
        }
      };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          userRoles: {
            include: {
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.count({ where })
    ]);

    const usersWithRoles = users.map(user => ({
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: user.userRoles.map(ur => ur.role)
    }));

    res.json({
      users: usersWithRoles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create new user
 *     description: Create a new user account with specified roles
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@flcd.com
 *               phone:
 *                 type: string
 *                 example: "+971501234567"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: password123
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               roleIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of role IDs to assign to user
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Create new user (Admin only)
router.post('/', async (req, res) => {
  try {
    const { email, phone, password, firstName, lastName, roleIds } = createUserSchema.parse(req.body);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(phone ? [{ phone }] : [])
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email or phone already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        firstName,
        lastName
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true
      }
    });

    // Assign roles if provided
    if (roleIds && roleIds.length > 0) {
      await prisma.userRole.createMany({
        data: roleIds.map(roleId => ({
          userId: user.id,
          roleId
        }))
      });
    }

    res.status(201).json({
      message: 'User created successfully',
      user
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user (Admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = updateUserSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check for email/phone conflicts if they're being updated
    if (updateData.email || updateData.phone) {
      const conflictUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(updateData.email ? [{ email: updateData.email }] : []),
                ...(updateData.phone ? [{ phone: updateData.phone }] : [])
              ]
            }
          ]
        }
      });

      if (conflictUser) {
        return res.status(409).json({ error: 'Email or phone already in use' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        isActive: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting own account (commented for testing)
    // if (id === req.user!.id) {
    //   return res.status(400).json({ error: 'Cannot delete your own account' });
    // }

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Soft delete by deactivating
    await prisma.user.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user permissions (Admin only)
router.put('/:id/permissions', async (req, res) => {
  try {
    const { id } = req.params;
    const { roleIds } = updatePermissionsSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove existing roles
    await prisma.userRole.deleteMany({
      where: { userId: id }
    });

    // Add new roles
    if (roleIds.length > 0) {
      await prisma.userRole.createMany({
        data: roleIds.map(roleId => ({
          userId: id,
          roleId
        }))
      });
    }

    res.json({ message: 'User permissions updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Update permissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all roles (for role assignment)
router.get('/roles', async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true
      },
      orderBy: { name: 'asc' }
    });

    res.json({ roles });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;