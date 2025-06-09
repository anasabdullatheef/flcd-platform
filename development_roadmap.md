# FLCD Platform Development Roadmap

**Document Version**: 1.4  
**Last Updated**: June 09, 2025  
**Change Log**:
- v1.0 - Initial development roadmap
- v1.1 - Updated authentication system to include email verification for admin users (June 09, 2025)
- v1.2 - Enhanced rider management with mandatory field requirements and comprehensive validation (June 09, 2025)
- v1.3 - Added mobile admin access and push notification system requirements (June 09, 2025)
- v1.4 - Enhanced traffic fines management with dual date tracking system (June 09, 2025)

## Phase 1: Project Setup & Architecture (Weeks 1-2)

### 1.1 Backend Setup (Node.js)
```bash
# Project Structure
flcd-backend/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   └── config/
├── tests/
├── docs/
└── package.json
```

**Tech Stack:**
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: OAuth 2.0 + JWT with refresh tokens
- **Identity Management**: Custom IAM with RBAC
- **File Upload**: Multer + AWS S3/Google Cloud Storage
- **SMS Service**: Twilio/AWS SNS for OTP delivery
- **Real-time**: Socket.io for live tracking
- **Validation**: Joi or Zod
- **Documentation**: Swagger/OpenAPI

**Initial Setup Commands:**
```bash
npm init -y
npm install express typescript prisma @prisma/client
npm install jsonwebtoken passport passport-jwt bcryptjs
npm install multer aws-sdk @google-cloud/storage
npm install twilio socket.io speakeasy  # For OTP generation
npm install joi cors helmet morgan nodemailer
npm install -D @types/node @types/express nodemon
```

### 1.2 Frontend Setup (Next.js)
```bash
# Project Structure
flcd-admin/
├── pages/
│   ├── api/
│   ├── dashboard/
│   ├── riders/
│   ├── vehicles/
│   └── auth/
├── components/
├── hooks/
├── services/
├── styles/
└── utils/
```

**Tech Stack:**
- **Framework**: Next.js 14 with TypeScript
- **UI Library**: Tailwind CSS + Shadcn/ui
- **State Management**: Zustand or Redux Toolkit
- **Forms**: React Hook Form + Zod validation
- **Maps**: Google Maps React API
- **Charts**: Recharts or Chart.js
- **HTTP Client**: Axios with interceptors and token refresh

**Initial Setup:**
```bash
npx create-next-app@latest flcd-admin --typescript --tailwind --app
npm install @hookform/resolvers zod react-hook-form
npm install zustand axios @google-maps/react-wrapper
npm install recharts lucide-react
npm install @radix-ui/react-dialog @radix-ui/react-select
npm install @googlemaps/js-api-loader
```

### 1.3 Mobile Setup (Kotlin)
```bash
# Android Project Structure
app/src/main/java/com/flcd/rider/
├── ui/
│   ├── auth/
│   ├── dashboard/
│   ├── profile/
│   └── vehicle/
├── data/
│   ├── api/
│   ├── local/
│   └── repository/
├── domain/
└── utils/
```

**Tech Stack:**
- **Architecture**: MVVM + Clean Architecture
- **UI**: Jetpack Compose
- **Networking**: Retrofit + OkHttp
- **Local Storage**: Room Database
- **DI**: Dagger Hilt
- **Location**: Google Maps SDK + Location Services
- **Push Notifications**: Firebase Cloud Messaging

## Phase 2: Core Backend Development (Weeks 3-6)

### 2.1 Database Design & Setup

**Priority Tables:**
```sql
-- Week 3
users, roles, permissions, user_roles
riders, rider_documents, rider_acknowledgments

-- Week 4
vehicles, vehicle_assignments, vehicle_documents
earnings, deductions, traffic_fines

-- Week 5
maintenance_records, damage_reports, tickets
locations, geo_fence_violations

-- Week 6
kpi_scores, health_checks, training_records
```

**Database Schema Implementation:**
```bash
# Prisma setup
npx prisma init
npx prisma db push
npx prisma generate
npx prisma studio  # For database visualization
```

### 2.2 API Development Priority

**Week 3-4: Identity & Access Management + Email/OTP Verification** *(Updated: June 09, 2025)*
```javascript
// Essential authentication endpoints
POST /api/auth/login
POST /api/auth/register/send-otp     // Send OTP to rider phone
POST /api/auth/register/verify-otp   // Verify OTP and complete registration
POST /api/auth/refresh-token
POST /api/auth/forgot-password/send-otp
POST /api/auth/forgot-password/verify-reset

// Email verification for admin users (Added: June 09, 2025)
POST /api/auth/admin/send-verification    // Send email verification
POST /api/auth/admin/verify-email        // Verify email token
POST /api/auth/admin/resend-verification  // Resend verification email

// User profile management
GET  /api/users/profile
PUT  /api/users/profile

// Admin user management with proper IAM
GET    /api/admin/users
POST   /api/admin/users                  // Creates user + sends verification email
PUT    /api/admin/users/:id
DELETE /api/admin/users/:id
PUT    /api/admin/users/:id/permissions
GET    /api/admin/users/:id/verification-status  // Added: June 09, 2025
```

**Week 4-5: Rider Management** ✅ **COMPLETED - Enhanced Implementation**
```javascript
// Rider CRUD with Enhanced Validation
GET    /api/riders                    // ✅ List riders with created-by info
POST   /api/riders                    // ✅ Create with mandatory fields validation
POST   /api/riders/bulk-upload        // ✅ Bulk upload with CSV validation
GET    /api/riders/bulk-upload/template // ✅ Download CSV template
PUT    /api/riders/:id                // ✅ Update with validation
DELETE /api/riders/:id                // ✅ Delete rider

// Acknowledgments
GET  /api/riders/:id/acknowledgments  // ✅ Rider acknowledgments
POST /api/riders/:id/acknowledge      // ✅ Submit acknowledgment
GET  /api/acknowledgments/pending     // ✅ Pending acknowledgments
```

**✅ Implementation Completed:**
- **Mandatory Fields Validation**: RiderID (riderCode), firstName, lastName, phone
- **Comprehensive Zod Validation**: Field format, length, and pattern validation
- **Bulk Upload Support**: CSV parsing with detailed error reporting
- **Database Constraints**: Unique constraints for RiderID, phone, email
- **Enhanced Error Messages**: Clear validation feedback
- **File Upload**: Multer integration for CSV processing
- **CSV Template**: Downloadable template with sample data

**Week 5-6: Vehicle & Financial Management**
```javascript
// Vehicle management
GET    /api/vehicles
POST   /api/vehicles
PUT    /api/vehicles/:id/assign
POST   /api/vehicles/maintenance

// Financial tracking
POST /api/earnings/upload
GET  /api/riders/:id/earnings
GET  /api/deductions/summary

// Traffic Fines Management (Enhanced with dual date tracking)
GET    /api/traffic-fines                    // List all fines
POST   /api/traffic-fines                    // Create single fine
POST   /api/traffic-fines/bulk-upload        // Bulk upload with CSV
GET    /api/traffic-fines/template           // Download CSV template
PUT    /api/traffic-fines/:id                // Update fine status
DELETE /api/traffic-fines/:id                // Remove fine
GET    /api/traffic-fines/rider/:riderId     // Rider-specific fines
POST   /api/traffic-fines/:id/dispute        // Submit dispute
PUT    /api/traffic-fines/:id/payment        // Mark as paid
POST   /api/traffic-fines/:id/deduction      // Convert to deduction
```

**Traffic Fines Implementation Features:**
- **Dual Date System**: Issue date (by authority) and upload date (to platform)
- **Authority Integration**: Support for multiple issuing authorities
- **Fine Lifecycle**: From upload to payment/deduction
- **Bulk Operations**: CSV upload with both date fields required
- **Dispute Management**: Rider dispute workflow with admin review
- **Auto-Deduction**: Automatic salary deduction creation
- **Notification Integration**: Push notifications for new fines

### 2.3 File Upload & Document Management
```javascript
// Setup local file storage or basic cloud storage
const multer = require('multer');
const path = require('path');

// Local file storage configuration
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// File upload middleware
app.use('/api/upload', fileUploadMiddleware);

// Document endpoints
POST /api/documents/upload
GET  /api/documents/:id
DELETE /api/documents/:id
```

## Phase 3: Admin Dashboard Development (Weeks 7-10)

### 3.1 Authentication & Layout (Week 7)
```jsx
// Key components to build
components/
├── Layout/
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   └── Layout.tsx
├── Auth/
│   ├── LoginForm.tsx
│   ├── ForgotPassword.tsx
│   ├── EmailVerification.tsx    // Email verification component (Added: June 09, 2025)
│   ├── VerificationStatus.tsx   // Show verification status (Added: June 09, 2025)
│   └── ProtectedRoute.tsx
└── Common/
    ├── DataTable.tsx
    ├── Modal.tsx
    └── FileUpload.tsx
```

### 3.2 Core Admin Features (Weeks 8-9) ✅ **Rider Management Completed**
```jsx
// Priority pages
pages/
├── dashboard/           // Main dashboard with stats
├── riders/              // ✅ COMPLETED with enhanced validation
│   ├── index.tsx       // ✅ Rider list with status indicators
│   ├── create.tsx      // ✅ Individual rider creation with mandatory fields
│   ├── bulk-upload.tsx // ✅ Bulk upload interface with validation
│   └── [id]/           // Rider detail pages (TODO)
├── vehicles/
│   ├── index.tsx       // Vehicle management
│   ├── maintenance.tsx // Maintenance tracking
│   └── assignments.tsx // Vehicle assignments
└── financial/
    ├── earnings.tsx    // Earnings management
    ├── deductions.tsx  // Deductions tracking
    ├── traffic-fines/  // Traffic fines management
    │   ├── index.tsx   // Fine listing with dual date display
    │   ├── create.tsx  // Single fine creation
    │   ├── bulk-upload.tsx // Bulk fine upload with CSV template
    │   ├── [id]/       // Fine details and lifecycle management
    │   └── disputes.tsx // Dispute management interface
    └── reports.tsx     // Financial reports
```

**✅ Rider Management Frontend Implementation Completed:**
- **Create Rider Form**: React Hook Form with Zod validation, mandatory field indicators
- **Bulk Upload Interface**: CSV upload with template download, detailed result reporting
- **Rider Listing**: Comprehensive rider display with filtering and status indicators
- **Validation Integration**: Real-time form validation with clear error messages
- **Responsive Design**: Tailwind CSS for mobile-friendly interface
- **Error Handling**: Comprehensive error states and user feedback

### 3.3 Advanced Features (Week 10)
```jsx
// Advanced components
components/
├── Maps/
│   ├── GoogleMapTracker.tsx    // Real-time rider tracking with Google Maps
│   ├── GeofenceMap.tsx        // Geofencing visualization
│   ├── RouteOptimizer.tsx     // Route planning and optimization
│   └── LocationHistory.tsx    // Historical route tracking
├── Authentication/
│   ├── OTPVerification.tsx      // SMS OTP verification component
│   ├── EmailVerification.tsx    // Email verification for admin users (Added: June 09, 2025)
│   ├── MFASetup.tsx            // Multi-factor authentication setup
│   ├── PermissionManager.tsx    // Role and permission management
│   └── VerificationStatus.tsx   // Email/phone verification status display (Added: June 09, 2025)
├── Analytics/
│   ├── KPIDashboard.tsx      // KPI monitoring
│   ├── PerformanceCharts.tsx
│   └── ReportsGenerator.tsx
└── TicketManagement/
    ├── TicketBoard.tsx       // Kanban-style tickets
    ├── TicketModal.tsx       // Ticket details
    └── TicketFilters.tsx     // Filtering system
```

## Phase 4: Mobile App Development (Weeks 8-12)

### 4.1 App Structure & Authentication (Week 8-9)
```kotlin
// Key components
ui/auth/
├── LoginScreen.kt
├── ForgotPasswordScreen.kt
└── AuthViewModel.kt

ui/main/
├── MainActivity.kt
├── MainNavigation.kt
└── BottomNavBar.kt

data/
├── api/ApiService.kt
├── local/AppDatabase.kt
└── repository/AuthRepository.kt
```

### 4.2 Core Rider Features (Weeks 9-10) ✅ **Profile Management Completed**
```kotlin
// Essential screens
ui/dashboard/
├── DashboardScreen.kt      // Main rider dashboard
├── ProfileScreen.kt        // Rider profile (TODO: Integration)
└── EarningsScreen.kt       // Earnings summary

ui/profile/                 // ✅ COMPLETED - Rider Registration
├── CreateRiderActivity.kt  // ✅ Jetpack Compose rider registration UI
├── CreateRiderViewModel.kt // ✅ MVVM with validation and state management
└── CreateRiderFormData.kt  // ✅ Form data models

domain/                     // ✅ COMPLETED - Business Logic
├── Rider.kt               // ✅ Rider models with mandatory field validation
├── CreateRiderRequest.kt  // ✅ API request/response models
└── ValidationError.kt     // ✅ Error handling models

data/                      // ✅ COMPLETED - Data Layer
├── api/RiderApiService.kt // ✅ Retrofit API service for rider operations
├── repository/RiderRepository.kt // ✅ Repository with validation logic
└── utils/Resource.kt      // ✅ Resource wrapper for state management
```

**✅ Mobile App Rider Management Implementation Completed:**
- **Registration Form**: Native Android UI with Jetpack Compose
- **Mandatory Field Validation**: RiderID, firstName, lastName, phone validation
- **MVVM Architecture**: Clean architecture with ViewModel and Repository pattern
- **Real-time Validation**: Live validation feedback and error handling
- **Material Design**: Modern UI components with Material Design 3
- **State Management**: StateFlow for reactive UI updates
- **API Integration**: Retrofit service ready for backend connection

ui/vehicle/
├── VehicleInfoScreen.kt    // Assigned vehicle info
├── ReportIssueScreen.kt    // Vehicle issue reporting
└── MaintenanceScreen.kt    // Maintenance history

ui/acknowledgment/
├── AcknowledgmentScreen.kt // Acknowledgment flow
├── SignatureCapture.kt     // Digital signature
└── AcknowledgmentList.kt   // Historical acknowledgments
```

### 4.3 Location & Safety Features (Weeks 10-11)
```kotlin
// Location services
services/
├── LocationService.kt      // Background location tracking
├── GeofenceService.kt      // Geofencing monitoring
└── EmergencyService.kt     // SOS functionality

ui/emergency/
├── SOSScreen.kt           // Emergency interface
├── EmergencyButton.kt     // Quick SOS access
└── SafetyChecklist.kt     // Safety guidelines
```

### 4.4 Support & Training (Week 11-12)
```kotlin
ui/support/
├── ChatScreen.kt          // FAQ chat interface
├── TicketScreen.kt        // Support tickets
└── TicketHistory.kt       // Ticket tracking

ui/training/
├── TrainingList.kt        // Available training
├── VideoPlayer.kt         // Training videos
├── QuizScreen.kt          // Assessments
└── TrainingProgress.kt    // Progress tracking
```

## Phase 5: Integration & Testing (Weeks 13-14)

### 5.1 API Integration Testing
```bash
# Testing strategy
- Unit tests for all services
- Integration tests for API endpoints
- End-to-end testing for critical flows
- Performance testing for bulk operations
```

### 5.2 Real-time Features Implementation
```javascript
// Socket.io setup for live tracking
// WebSocket connections for real-time updates
// Push notification implementation
// Live dashboard updates
```

## Phase 6: Deployment & Production (Weeks 15-16)

### 6.1 Backend Deployment
```bash
# Simplified deployment options
- VPS with PM2 and Nginx
- Railway or Render for quick deployment
- DigitalOcean App Platform
- Basic AWS EC2 + RDS setup
```

### 6.2 Frontend Deployment
```bash
# Next.js deployment options
- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify
- Custom VPS with PM2
```

### 6.3 Mobile App Distribution
```bash
# Android deployment
- Google Play Store internal testing
- Firebase App Distribution for beta testing
- Production release to Play Store
```

## Phase 7: Mobile Admin Access & Notifications (Weeks 17-20)

### 7.1 Database Schema Extensions (Week 17)
```sql
-- New tables for mobile admin and notifications
CREATE TABLE mobile_devices (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  device_id VARCHAR UNIQUE, -- Firebase FCM token
  device_type ENUM('ANDROID', 'IOS'),
  device_name VARCHAR,
  is_active BOOLEAN DEFAULT true,
  last_seen_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  type ENUM('TASK_ASSIGNMENT', 'JOB_ASSIGNMENT', 'EMERGENCY', 'GENERAL'),
  priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
  data JSONB,
  sender_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now(),
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP
);

CREATE TABLE notification_recipients (
  id UUID PRIMARY KEY,
  notification_id UUID REFERENCES notifications(id),
  user_id UUID REFERENCES users(id),
  rider_id UUID REFERENCES riders(id),
  status ENUM('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED') DEFAULT 'PENDING',
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
  clicked_at TIMESTAMP
);

-- Add mobile access fields to users table
ALTER TABLE users ADD COLUMN mobile_access_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP;
ALTER TABLE users ADD COLUMN last_login_method VARCHAR; -- 'web' or 'mobile'
```

### 7.2 Backend Notification Service (Week 18)
```javascript
// New backend components
src/services/
├── NotificationService.js     // Core notification logic
├── FCMService.js             // Firebase Cloud Messaging integration
├── JobAssignmentService.js   // Job/task assignment management
└── MobileAuthService.js      // Mobile admin authentication

// API endpoints
POST   /api/notifications/send
GET    /api/notifications
POST   /api/notifications/bulk-send
PUT    /api/notifications/:id/read
GET    /api/mobile/register-device
POST   /api/mobile/admin-login
GET    /api/jobs/assignments
POST   /api/jobs/assign
PUT    /api/jobs/:id/status

// Firebase integration
npm install firebase-admin
```

### 7.3 Mobile App Admin Features (Week 19)
```kotlin
// Android admin module
ui/admin/
├── AdminLoginActivity.kt      // Admin authentication
├── AdminDashboardActivity.kt  // Mobile admin dashboard
├── JobAssignmentActivity.kt   // Job management
├── NotificationActivity.kt    // Notification center
└── QuickActionsActivity.kt    // Essential admin functions

data/admin/
├── AdminApiService.kt         // Admin-specific API calls
├── NotificationService.kt     // FCM integration
└── AdminRepository.kt         // Admin data management

// Firebase messaging
implementation 'com.google.firebase:firebase-messaging:23.0.0'
implementation 'com.google.firebase:firebase-analytics:21.0.0'
```

### 7.4 Push Notification Implementation (Week 20)
```javascript
// Frontend notification management
pages/admin/
├── notifications/
│   ├── index.tsx           // Notification management
│   ├── create.tsx          // Send notifications
│   ├── templates.tsx       // Notification templates
│   └── analytics.tsx       // Delivery analytics

components/notifications/
├── NotificationCenter.tsx  // Real-time notification display
├── NotificationSettings.tsx // User preferences
└── PushPermission.tsx     // Browser push permissions

// Real-time features
- WebSocket integration for live notifications
- Service Worker for web push notifications
- Deep linking for mobile-to-web transitions
```

## Phase 8: Testing & Integration (Weeks 21-22)

### 8.1 Mobile Admin Testing
```bash
# Test scenarios
- Admin login flow on mobile devices
- Role-based access control validation
- Push notification delivery testing
- Deep linking functionality
- Offline capability testing
- Security and session management

# Performance testing
- Notification delivery latency
- Mobile app response times
- Concurrent admin user load testing
```

### 8.2 Notification System Testing
```bash
# Comprehensive testing
- FCM integration testing
- Multi-device notification delivery
- Notification template validation
- Analytics and reporting accuracy
- Emergency notification prioritization
- Bulk notification performance
```

## Development Best Practices

### 1. Version Control Strategy
```bash
# Git branching strategy
main/
├── develop/
├── feature/auth-system
├── feature/rider-management
├── feature/vehicle-tracking
└── hotfix/security-patch
```

### 2. Environment Management
```bash
# Environment variables
.env.development
.env.staging
.env.production

# Config management
- Database URLs
- API keys
- Third-party service credentials
- Feature flags
```

### 3. Code Quality
```bash
# Setup linting and formatting
- ESLint + Prettier for TypeScript/React
- Ktlint for Kotlin
- Husky for pre-commit hooks
- SonarQube for code quality monitoring
```

### 4. Testing Strategy
```bash
# Testing pyramid
- Unit tests (70%): Jest for backend, JUnit for mobile
- Integration tests (20%): Supertest for APIs
- E2E tests (10%): Cypress for web, Espresso for mobile
```

## Recommended Team Structure

### Minimum Viable Team
- **1 Backend Developer**: Node.js + Database
- **1 Frontend Developer**: Next.js + UI/UX
- **1 Mobile Developer**: Kotlin + Android
- **1 DevOps/Full-stack**: Deployment + Integration

### Optimal Team (if budget allows)
- **2 Backend Developers**: API development + integrations
- **2 Frontend Developers**: Admin dashboard + advanced features
- **1 Mobile Developer**: Android app
- **1 UI/UX Designer**: Design system + user experience
- **1 DevOps Engineer**: Infrastructure + CI/CD
- **1 QA Engineer**: Testing + quality assurance

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| 1 | 2 weeks | Project setup, architecture |
| 2 | 4 weeks | Core backend APIs |
| 3 | 4 weeks | Admin dashboard |
| 4 | 5 weeks | Mobile application |
| 5 | 2 weeks | Integration & testing |
| 6 | 2 weeks | Deployment & launch |

**Total Timeline: 16-20 weeks (4-5 months)**

## Next Immediate Steps

1. **Set up development environment** for all three platforms
2. **Create database schema** and initial migrations
3. **Implement authentication system** across all platforms
4. **Build core user management** features
5. **Start with rider creation and basic mobile app**

Would you like me to dive deeper into any specific phase or provide detailed code examples for particular components?
