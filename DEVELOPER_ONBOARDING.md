# FLCD Platform - Developer Onboarding Guide

## 👋 **Welcome to FLCD Platform Development Team!**

**Project**: Fleet Logistics and Compliance Dashboard
**Timeline**: 10 working days (June 9-20, 2025)
**Team**: 2 Developers + Assistant

---

## 👥 **Team Structure**

### **Developer 1** (Backend + Frontend Specialist)
- **Primary**: Node.js, Express, Prisma, PostgreSQL, Next.js, React
- **Sprint 1**: Database + Authentication system
- **Sprint 2**: Rider management + Vehicle management
- **Sprint 3**: Integration + Testing

### **Developer 2** (Mobile + Integration Specialist)
- **Email**: amina@hashinclu.de ⚠️ **PENDING REPOSITORY ACCESS**
- **Primary**: Android, Kotlin, Jetpack Compose, Location Services
- **Sprint 1**: Frontend dashboard setup (BLOCKED - awaiting access)
- **Sprint 2**: Mobile app core development
- **Sprint 3**: Location services + Mobile integration

**❌ BLOCKER**: Repository collaborator access not yet granted

---

## 🚀 **Quick Start Setup**

### **1. Repository Access**
```bash
# Clone repository
git clone https://github.com/anasabdullatheef/flcd-platform.git
cd flcd-platform

# ❌ BLOCKER: amina@hashinclu.de does NOT have repository access yet
# Manual action required: Add collaborator via GitHub web interface
```

### **2. Backend Setup (Both Developers)**
```bash
cd flcd-backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Setup PostgreSQL (see POSTGRESQL_SETUP.md)
brew install postgresql@15  # macOS
brew services start postgresql@15

# Run database setup
npm run prisma:migrate
npm run seed

# Start development server
npm run dev
```

### **3. Frontend Setup (Developer 2)**
```bash
cd flcd-frontend

# Initialize Next.js project
npx create-next-app@latest . --typescript --tailwind --app

# Install additional dependencies
npm install zustand axios @hookform/resolvers zod react-hook-form

# Start development server
npm run dev
```

### **4. Mobile Setup (Developer 2)**
```bash
cd flcd-mobile

# Open in Android Studio
# Follow Android project setup in development_roadmap.md
```

---

## 📋 **GitHub Project Management**

### **Project Board**: https://github.com/users/anasabdullatheef/projects/1

### **Sprint 1 Issues (Days 1-3)**:
- **#4**: ✅ Database Schema & Setup (COMPLETED)
- **#1**: 🔄 Authentication & User Management (IN PROGRESS)
- **#7**: 📋 Frontend Admin Dashboard Setup (ASSIGNED TO: Developer 2)

### **Sprint 2 Issues (Days 4-7)**:
- **#2**: Rider Management System (ASSIGNED TO: Developer 1)
- **#3**: Mobile App Core (ASSIGNED TO: Developer 2)

### **Sprint 3 Issues (Days 8-10)**:
- **#5**: Location & Safety Services (ASSIGNED TO: Developer 2)
- **#6**: Vehicle Management (ASSIGNED TO: Developer 1)

---

## 🔄 **Development Workflow**

### **Daily Routine**:
1. **Morning Standup** (15 mins):
   - Yesterday's completed tasks
   - Today's planned work
   - Any blockers or dependencies

2. **GitHub Updates**:
   - Move issues: Open → In Progress → In Review → Done
   - Update issue comments with progress
   - Create PRs linking to issues

3. **End-of-Day Sync** (10 mins):
   - Demo completed features
   - Plan next day priorities
   - Address integration needs

### **Git Workflow**:
```bash
# Create feature branch
git checkout -b feature/authentication-system

# Make changes and commit
git add .
git commit -m "Implement JWT authentication middleware"

# Push and create PR
git push origin feature/authentication-system
gh pr create --title "Add JWT authentication system" --body "Closes #1"
```

---

## 🛠️ **Technical Architecture**

### **Backend Stack**:
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT + SMS OTP
- **File Upload**: Multer + Cloud Storage
- **Real-time**: Socket.io

### **Frontend Stack**:
- **Framework**: Next.js 14 + TypeScript
- **UI**: Tailwind CSS + Shadcn/ui
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **API**: Axios with interceptors

### **Mobile Stack**:
- **Platform**: Android (Kotlin)
- **Architecture**: MVVM + Clean Architecture
- **UI**: Jetpack Compose
- **Networking**: Retrofit + OkHttp
- **Local Storage**: Room Database

---

## 📚 **Key Documentation**

### **Setup Guides**:
- `POSTGRESQL_SETUP.md` - Database installation
- `10_DAY_DEVELOPMENT_PLAN.md` - Complete timeline
- `PROJECT_CONFIGURATION_GUIDE.md` - GitHub Projects setup

### **Project Files**:
- `development_roadmap.md` - Technical roadmap
- `flcd_requirements.md` - Complete requirements
- `GITHUB_ISSUES_TEMPLATE.md` - All 8 modules breakdown

---

## 🎯 **Sprint 1 Priorities (Days 1-3)**

### **Developer 1 Focus**:
1. ✅ **Database Setup** (COMPLETED)
2. 🔄 **Authentication System** (IN PROGRESS)
   - JWT middleware implementation
   - OTP SMS integration
   - Password hashing & validation
   - Role-based access control

### **Developer 2 Focus**:
1. 📋 **Frontend Dashboard Setup**
   - Next.js project initialization
   - Tailwind CSS configuration
   - Authentication pages
   - Basic layout with navigation

2. 📋 **Mobile Project Setup**
   - Android project structure
   - MVVM architecture setup
   - Basic authentication screens

---

## 📞 **Communication**

### **Immediate Questions**:
- Technical blockers: Tag both developers in GitHub issue
- Architecture decisions: Create discussion in issue comments
- Environment setup: Refer to setup documentation

### **Code Review**:
- All PRs require review before merging
- Focus on code quality and consistency
- Test authentication flows thoroughly

---

## 🚨 **Important Notes**

### **Security**:
- Never commit sensitive data (.env files)
- Use strong JWT secrets in production
- Validate all user inputs

### **Database**:
- Always run migrations before starting development
- Use seed data for consistent testing
- Backup database before major changes

### **Mobile Development**:
- Test on actual devices when possible
- Consider battery optimization for location services
- Follow Android design guidelines

---

## 🎉 **Success Metrics**

### **Sprint 1 Success** (Day 3):
- [ ] Backend API running without errors
- [ ] Database connected with seed data
- [ ] Authentication endpoints functional
- [ ] Frontend dashboard accessible
- [ ] Mobile project structure ready

### **Project Success** (Day 10):
- [ ] Complete rider onboarding flow
- [ ] Real-time location tracking
- [ ] Emergency SOS functionality
- [ ] Admin dashboard operational
- [ ] Mobile app functional

---

**🚀 Let's build an amazing FLCD platform together!**

**Need help?** Check documentation or ask in GitHub issues.
**Ready to start?** Follow the Quick Start Setup above.