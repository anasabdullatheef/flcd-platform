// Quick server test
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test basic query
    const userCount = await prisma.user.count();
    console.log(`📊 Users in database: ${userCount}`);
    
    await prisma.$disconnect();
    console.log('✅ Database test completed');
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

testConnection();