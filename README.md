# FLCD Platform

Fleet Logistics and Compliance Dashboard - Comprehensive management system for delivery fleet operations.

## Project Overview

The FLCD platform consists of three main components:
- **Web Application**: Administrative dashboard for multi-role access
- **Mobile Application**: Android app exclusively for riders
- **Backend API**: Node.js/Express server with PostgreSQL database

## Architecture

```
flcd-platform/
├── flcd-backend/           # Node.js + Express + TypeScript + Prisma
├── flcd-frontend/          # Next.js + TypeScript + Tailwind CSS
├── flcd-mobile/           # Android Kotlin + MVVM Architecture
├── docs/                  # Documentation
└── scripts/               # Deployment scripts
```

## Core Modules

### High Priority
1. **Authentication & User Management** - OAuth 2.0 + JWT + OTP system
2. **Rider Management** - Complete rider lifecycle management
3. **Location & Safety Services** - Real-time tracking + geofencing + SOS
4. **Mobile App Core** - Android application for riders

### Medium Priority  
5. **Vehicle Management** - Fleet management + maintenance tracking
6. **Financial Management** - Earnings + deductions + reporting
7. **Communication & Support** - Tickets + knowledge base + notifications

### Low Priority
8. **Performance & Analytics** - KPI monitoring + reporting dashboard

## User Roles

### Administrative Roles (Web Dashboard)
- Super Admin, General Admin, PRO, PRO Manager
- Operations Supervisor, Accountant Manager, Accountant
- Legal Officer, HR Manager, Garage

### Field Roles (Mobile App)
- Riders (mobile app exclusive access)

## Development Team Structure

**2 Developer Setup**:
- **Developer 1**: Backend + Frontend (Modules 1, 2, 3, 4, 7)
- **Developer 2**: Mobile + Location Services (Modules 5, 8)

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Android Studio (for mobile development)
- Java 11+

### 🚀 One-Line Setup (For Claude Users)
If you're using Claude, run this command to set up the entire project:
```bash
curl -sSL https://raw.githubusercontent.com/anasabdullatheef/flcd-platform/master/scripts/claude-setup.sh | bash
```

### Manual Setup

#### 1. Clone Repository
```bash
git clone https://github.com/anasabdullatheef/flcd-platform.git
cd flcd-platform
```

#### 2. Database Setup (Required First)
```bash
# macOS
brew install postgresql@15
brew services start postgresql@15
createuser --interactive --pwprompt flcd_admin
createdb -O flcd_admin flcd_platform

# Ubuntu/Linux  
sudo apt install postgresql postgresql-contrib
sudo -u postgres createuser --interactive --pwprompt flcd_admin
sudo -u postgres createdb -O flcd_admin flcd_platform
```

#### 3. Backend Setup
```bash
cd flcd-backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations and seed
npm run prisma:migrate
npm run seed

# Start development server
npm run dev
```

#### 4. Frontend Setup  
```bash
cd flcd-frontend

# Initialize Next.js project (if not done)
npx create-next-app@latest . --typescript --tailwind --app

# Install dependencies
npm install zustand axios @hookform/resolvers zod react-hook-form

# Start development server
npm run dev
```

#### 5. Mobile Setup (Android Studio)
```bash
cd flcd-mobile
# Open in Android Studio and sync project
```

### 🧪 Verify Setup
```bash
# Test backend API
curl http://localhost:3000/health

# Expected response:
# {"status":"OK","timestamp":"...","service":"FLCD Backend API"}
```

### 📋 Default Login
- **Email**: admin@flcd.com
- **Password**: admin123
- **Role**: Super Admin

## Development Workflow

1. **Start with Module 1** (Authentication) - Foundation for all other modules
2. **Use GitHub Issues** for task management and tracking
3. **Independent module development** - Modules can be developed in parallel
4. **Integration testing** after core modules are complete

## Tech Stack

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: OAuth 2.0 + JWT + SMS OTP
- **Real-time**: Socket.io
- **File Upload**: Multer + Cloud Storage

### Frontend
- **Framework**: Next.js 14 with TypeScript  
- **UI**: Tailwind CSS + Shadcn/ui
- **State Management**: Zustand
- **Maps**: Google Maps API
- **Charts**: Recharts

### Mobile
- **Platform**: Android (Kotlin)
- **Architecture**: MVVM + Clean Architecture
- **UI**: Jetpack Compose
- **Networking**: Retrofit + OkHttp
- **Local Storage**: Room Database

## Contributing

1. Check GitHub Issues for available tasks
2. Create feature branch from `develop`
3. Follow module-based development approach  
4. Submit PR with comprehensive testing

## License

Private project - All rights reserved.
