import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create permissions
  const permissions = [
    { name: 'users:create', resource: 'users', action: 'create', description: 'Create new users' },
    { name: 'users:read', resource: 'users', action: 'read', description: 'View users' },
    { name: 'users:update', resource: 'users', action: 'update', description: 'Update users' },
    { name: 'users:delete', resource: 'users', action: 'delete', description: 'Delete users' },
    { name: 'riders:create', resource: 'riders', action: 'create', description: 'Create new riders' },
    { name: 'riders:read', resource: 'riders', action: 'read', description: 'View riders' },
    { name: 'riders:update', resource: 'riders', action: 'update', description: 'Update riders' },
    { name: 'riders:delete', resource: 'riders', action: 'delete', description: 'Delete riders' },
    { name: 'vehicles:create', resource: 'vehicles', action: 'create', description: 'Create vehicles' },
    { name: 'vehicles:read', resource: 'vehicles', action: 'read', description: 'View vehicles' },
    { name: 'vehicles:update', resource: 'vehicles', action: 'update', description: 'Update vehicles' },
    { name: 'vehicles:delete', resource: 'vehicles', action: 'delete', description: 'Delete vehicles' },
    { name: 'earnings:read', resource: 'earnings', action: 'read', description: 'View earnings' },
    { name: 'earnings:update', resource: 'earnings', action: 'update', description: 'Update earnings' },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
  }

  console.log('✅ Permissions created');

  // Create roles
  const roles = [
    { name: 'Super Admin', description: 'Full system access' },
    { name: 'General Admin', description: 'General administrative functions' },
    { name: 'PRO', description: 'Government relations and legal compliance' },
    { name: 'PRO Manager', description: 'Oversee PRO operations' },
    { name: 'Operations Supervisor', description: 'Fleet and rider operations' },
    { name: 'Accountant Manager', description: 'Financial oversight' },
    { name: 'Accountant', description: 'Financial data entry and processing' },
    { name: 'Legal Officer', description: 'Legal compliance and documentation' },
    { name: 'HR Manager', description: 'Human resources management' },
    { name: 'Garage', description: 'Vehicle maintenance and repair' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  console.log('✅ Roles created');

  // Create Super Admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@flcd.com' },
    update: {},
    create: {
      email: 'admin@flcd.com',
      phone: '+971501234567',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
    },
  });

  console.log('✅ Super Admin user created');

  // Assign Super Admin role
  const superAdminRole = await prisma.role.findUnique({
    where: { name: 'Super Admin' }
  });

  if (superAdminRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: superAdmin.id,
          roleId: superAdminRole.id,
        }
      },
      update: {},
      create: {
        userId: superAdmin.id,
        roleId: superAdminRole.id,
      },
    });

    console.log('✅ Super Admin role assigned');
  }

  // Assign all permissions to Super Admin role
  const allPermissions = await prisma.permission.findMany();

  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole!.id,
          permissionId: permission.id,
        }
      },
      update: {},
      create: {
        roleId: superAdminRole!.id,
        permissionId: permission.id,
      },
    });
  }

  console.log('✅ All permissions assigned to Super Admin');

  console.log('🎉 Database seed completed successfully!');
  console.log('👤 Super Admin login:');
  console.log('   Email: admin@flcd.com');
  console.log('   Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });