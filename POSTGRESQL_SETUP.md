# PostgreSQL Local Setup Guide

## 🗄️ **Database Installation & Configuration**

### **macOS Installation**
```bash
# Install PostgreSQL using Homebrew
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database user
createuser --interactive --pwprompt flcd_admin

# Create database
createdb -O flcd_admin flcd_platform
```

### **Ubuntu/Linux Installation**
```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE USER flcd_admin WITH PASSWORD 'your_password';
CREATE DATABASE flcd_platform OWNER flcd_admin;
GRANT ALL PRIVILEGES ON DATABASE flcd_platform TO flcd_admin;
\q
```

### **Windows Installation**
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run installer and follow setup wizard
3. Remember the password for 'postgres' user
4. Use pgAdmin to create database and user

---

## ⚙️ **Environment Configuration**

### **Update Backend .env File**
```bash
cd flcd-backend
```

Edit `.env` file with your database credentials:
```env
# Database Configuration
DATABASE_URL="postgresql://flcd_admin:your_password@localhost:5432/flcd_platform?schema=public"

# JWT Configuration  
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Server Configuration
PORT=3000
NODE_ENV="development"
```

---

## 🚀 **Database Setup Commands**

### **Run Database Migrations**
```bash
# Generate Prisma client
npm run prisma:generate

# Create and run migrations
npm run prisma:migrate

# Seed database with initial data
npm run seed
```

### **Verify Installation**
```bash
# Test database connection
npx ts-node src/test-server.ts

# Start development server
npm run dev
```

**Expected Output**:
```
✅ Database connection successful
📊 Users in database: 1
🚀 FLCD Backend API running on port 3000
```

---

## 🧪 **Testing the Setup**

### **Health Check**
```bash
curl http://localhost:3000/health
```

**Expected Response**:
```json
{
  "status": "OK",
  "timestamp": "2025-06-08T12:00:00.000Z",
  "service": "FLCD Backend API"
}
```

### **API Endpoints Check**
```bash
# Test authentication routes
curl http://localhost:3000/api/auth/login

# Test user routes  
curl http://localhost:3000/api/users

# Test rider routes
curl http://localhost:3000/api/riders
```

---

## 🛠️ **Development Tools**

### **Prisma Studio (Database GUI)**
```bash
npm run prisma:studio
```
Opens browser at: http://localhost:5555

### **Database Reset (if needed)**
```bash
# Reset database and reseed
npx prisma migrate reset
npm run seed
```

---

## 👤 **Default Admin User**

After seeding, you can login with:
- **Email**: `admin@flcd.com`
- **Password**: `admin123`
- **Role**: Super Admin (all permissions)

---

## 🔧 **Troubleshooting**

### **Connection Issues**
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql      # Linux

# Check port availability
lsof -i :5432
```

### **Permission Issues**
```bash
# Reset PostgreSQL permissions
sudo -u postgres psql
ALTER USER flcd_admin CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE flcd_platform TO flcd_admin;
```

### **Migration Issues**
```bash
# Check migration status
npx prisma migrate status

# Force reset if needed
npx prisma migrate reset --force
```

---

## 📈 **Next Steps After Setup**

1. ✅ **Database Running**: PostgreSQL service active
2. ✅ **Backend Connected**: Server starts without errors  
3. ✅ **Admin User Created**: Can login with default credentials
4. 🔄 **Continue Development**: Implement authentication endpoints
5. 🔄 **Frontend Setup**: Begin Next.js dashboard development

---

**🎯 Success Criteria**: Backend server runs on port 3000 without database connection errors!