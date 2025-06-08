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

### Quick Start
```bash
# Clone repository
git clone https://github.com/anasabdullatheef/flcd-platform.git
cd flcd-platform

# Backend setup
cd flcd-backend
npm install
npx prisma generate
npm run dev

# Frontend setup  
cd ../flcd-frontend
npm install
npm run dev

# Mobile setup (Android Studio)
cd ../flcd-mobile
# Open in Android Studio
```

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
