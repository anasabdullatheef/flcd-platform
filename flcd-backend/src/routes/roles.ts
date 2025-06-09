import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createRoleSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional()
});

const updateRoleSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().optional()
});

// Define system modules and their available permissions
const SYSTEM_MODULES = {
  'users': {
    name: 'User Management',
    permissions: ['users.read', 'users.write', 'users.delete']
  },
  'riders': {
    name: 'Rider Management',
    permissions: ['riders.read', 'riders.write', 'riders.delete']
  },
  'vehicles': {
    name: 'Vehicle Management',
    permissions: ['vehicles.read', 'vehicles.write', 'vehicles.delete']
  },
  'garage': {
    name: 'Garage Management',
    permissions: ['garage.read', 'garage.write', 'garage.delete']
  },
  'jobs': {
    name: 'Job Management',
    permissions: ['jobs.read', 'jobs.write', 'jobs.delete']
  },
  'reports': {
    name: 'Reports & Analytics',
    permissions: ['reports.read', 'reports.write', 'reports.delete']
  },
  'finance': {
    name: 'Financial Management',
    permissions: ['finance.read', 'finance.write', 'finance.delete']
  },
  'legal': {
    name: 'Legal & Compliance',
    permissions: ['legal.read', 'legal.write', 'legal.delete']
  },
  'hr': {
    name: 'Human Resources',
    permissions: ['hr.read', 'hr.write', 'hr.delete']
  },
  'settings': {
    name: 'System Settings',
    permissions: ['settings.read', 'settings.write', 'settings.delete']
  }
};

// Preset roles with their permissions
const PRESET_ROLES = {
  'SUPER_ADMIN': {
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    permissions: Object.values(SYSTEM_MODULES).flatMap(module => module.permissions)
  },
  'GENERAL_ADMIN': {
    name: 'General Admin',
    description: 'General administrative access',
    permissions: [
      'users.read', 'users.write',
      'riders.read', 'riders.write',
      'vehicles.read', 'vehicles.write',
      'jobs.read', 'jobs.write',
      'reports.read'
    ]
  },
  'PRO': {
    name: 'PRO',
    description: 'Professional operations role',
    permissions: [
      'riders.read', 'riders.write',
      'vehicles.read', 'vehicles.write',
      'jobs.read', 'jobs.write',
      'reports.read'
    ]
  },
  'PRO_MANAGER': {
    name: 'PRO Manager',
    description: 'Professional operations manager',
    permissions: [
      'riders.read', 'riders.write', 'riders.delete',
      'vehicles.read', 'vehicles.write',
      'jobs.read', 'jobs.write', 'jobs.delete',
      'reports.read', 'reports.write'
    ]
  },
  'OPERATIONS_SUPERVISOR': {
    name: 'Operations Supervisor',
    description: 'Supervises daily operations',
    permissions: [
      'riders.read', 'riders.write',
      'vehicles.read',
      'jobs.read', 'jobs.write',
      'reports.read'
    ]
  },
  'ACCOUNTANT_MANAGER': {
    name: 'Accountant Manager',
    description: 'Financial management and oversight',
    permissions: [
      'finance.read', 'finance.write', 'finance.delete',
      'reports.read', 'reports.write',
      'users.read'
    ]
  },
  'ACCOUNTANT': {
    name: 'Accountant',
    description: 'Financial data entry and basic reporting',
    permissions: [
      'finance.read', 'finance.write',
      'reports.read'
    ]
  },
  'LEGAL_OFFICER': {
    name: 'Legal Officer',
    description: 'Legal and compliance management',
    permissions: [
      'legal.read', 'legal.write', 'legal.delete',
      'reports.read',
      'users.read',
      'riders.read'
    ]
  },
  'HR_MANAGER': {
    name: 'HR Manager',
    description: 'Human resources management',
    permissions: [
      'hr.read', 'hr.write', 'hr.delete',
      'users.read', 'users.write',
      'reports.read'
    ]
  },
  'GARAGE': {
    name: 'Garage',
    description: 'Vehicle maintenance and garage operations',
    permissions: [
      'garage.read', 'garage.write', 'garage.delete',
      'vehicles.read', 'vehicles.write',
      'reports.read'
    ]
  }
};

// Get all system modules and permissions
router.get('/modules', async (req, res) => {
  try {
    res.json({
      modules: SYSTEM_MODULES,
      presetRoles: Object.keys(PRESET_ROLES)
    });
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all roles
router.get('/', async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true
          }
        },
        _count: {
          select: {
            userRoles: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const formattedRoles = roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      isActive: role.isActive,
      userCount: role._count.userRoles,
      permissions: role.permissions.map(rp => rp.permission.name),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt
    }));

    res.json({ roles: formattedRoles });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get role by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const formattedRole = {
      id: role.id,
      name: role.name,
      description: role.description,
      isActive: role.isActive,
      permissions: role.permissions.map(rp => rp.permission.name),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt
    };

    res.json({ role: formattedRole });
  } catch (error) {
    console.error('Get role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new role
router.post('/', async (req, res) => {
  try {
    const { name, description, permissions = [] } = createRoleSchema.parse(req.body);

    // Check if role already exists
    const existingRole = await prisma.role.findUnique({
      where: { name }
    });

    if (existingRole) {
      return res.status(409).json({ error: 'Role with this name already exists' });
    }

    // Create role
    const role = await prisma.role.create({
      data: {
        name,
        description
      }
    });

    // Add permissions if provided
    if (permissions.length > 0) {
      // Get or create permissions
      const permissionRecords = await Promise.all(
        permissions.map(async (permName) => {
          const [permission] = await prisma.permission.findMany({
            where: { name: permName }
          });
          
          if (!permission) {
            const [resource, action] = permName.split('.');
            return await prisma.permission.create({
              data: { 
                name: permName,
                resource,
                action
              }
            });
          }
          
          return permission;
        })
      );

      // Link permissions to role
      await prisma.rolePermission.createMany({
        data: permissionRecords.map(permission => ({
          roleId: role.id,
          permissionId: permission.id
        }))
      });
    }

    res.status(201).json({
      message: 'Role created successfully',
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Create role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update role
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions, isActive } = updateRoleSchema.parse(req.body);

    const role = await prisma.role.findUnique({
      where: { id }
    });

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Check for name conflicts if updating name
    if (name && name !== role.name) {
      const existingRole = await prisma.role.findUnique({
        where: { name }
      });

      if (existingRole) {
        return res.status(409).json({ error: 'Role with this name already exists' });
      }
    }

    // Update role
    const updatedRole = await prisma.role.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive })
      }
    });

    // Update permissions if provided
    if (permissions) {
      // Remove existing permissions
      await prisma.rolePermission.deleteMany({
        where: { roleId: id }
      });

      // Add new permissions
      if (permissions.length > 0) {
        const permissionRecords = await Promise.all(
          permissions.map(async (permName) => {
            const [permission] = await prisma.permission.findMany({
              where: { name: permName }
            });
            
            if (!permission) {
              const [resource, action] = permName.split('.');
              return await prisma.permission.create({
                data: { 
                  name: permName,
                  resource,
                  action
                }
              });
            }
            
            return permission;
          })
        );

        await prisma.rolePermission.createMany({
          data: permissionRecords.map(permission => ({
            roleId: id,
            permissionId: permission.id
          }))
        });
      }
    }

    res.json({
      message: 'Role updated successfully',
      role: {
        id: updatedRole.id,
        name: updatedRole.name,
        description: updatedRole.description,
        isActive: updatedRole.isActive,
        permissions: permissions || []
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete role
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        userRoles: true
      }
    });

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Prevent deletion of SUPER_ADMIN role
    if (role.name === 'Super Admin') {
      return res.status(400).json({ error: 'Cannot delete Super Admin role' });
    }

    // Check if role is assigned to users
    if (role.userRoles.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete role that is assigned to users',
        userCount: role.userRoles.length
      });
    }

    // Delete role permissions first
    await prisma.rolePermission.deleteMany({
      where: { roleId: id }
    });

    // Delete role
    await prisma.role.delete({
      where: { id }
    });

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Initialize preset roles
router.post('/initialize-presets', async (req, res) => {
  try {
    const results = [];

    for (const [key, roleData] of Object.entries(PRESET_ROLES)) {
      // Check if role already exists
      const existingRole = await prisma.role.findUnique({
        where: { name: roleData.name }
      });

      if (!existingRole) {
        // Create role
        const role = await prisma.role.create({
          data: {
            name: roleData.name,
            description: roleData.description
          }
        });

        // Create permissions and link to role
        const permissionRecords = await Promise.all(
          roleData.permissions.map(async (permName) => {
            const [permission] = await prisma.permission.findMany({
              where: { name: permName }
            });
            
            if (!permission) {
              const [resource, action] = permName.split('.');
              return await prisma.permission.create({
                data: { 
                  name: permName,
                  resource,
                  action
                }
              });
            }
            
            return permission;
          })
        );

        await prisma.rolePermission.createMany({
          data: permissionRecords.map(permission => ({
            roleId: role.id,
            permissionId: permission.id
          }))
        });

        results.push({ created: roleData.name });
      } else {
        results.push({ exists: roleData.name });
      }
    }

    res.json({
      message: 'Preset roles initialization completed',
      results
    });
  } catch (error) {
    console.error('Initialize presets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;