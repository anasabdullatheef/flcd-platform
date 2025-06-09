# FLCD Platform - Software Requirements Specification

**Document Version**: 1.4  
**Last Updated**: June 09, 2025  
**Change Log**:
- v1.0 - Initial requirements specification
- v1.1 - Added email verification for admin panel users (June 09, 2025)
- v1.2 - Enhanced rider creation with mandatory RiderID & Name requirements (June 09, 2025)
- v1.3 - Added mobile admin access and push notification system requirements (June 09, 2025)
- v1.4 - Enhanced traffic fines management with dual date tracking system (June 09, 2025)

## Table of Contents
1. [Introduction](#introduction)
2. [System Overview](#system-overview)
3. [User Roles and Permissions](#user-roles-and-permissions)
4. [Functional Requirements](#functional-requirements)
5. [Non-Functional Requirements](#non-functional-requirements)
6. [Technical Architecture](#technical-architecture)
7. [Data Security and Privacy](#data-security-and-privacy)
8. [Integration Requirements](#integration-requirements)

## 1. Introduction

### 1.1 Purpose
This document specifies the requirements for the Fleet Logistics and Compliance Dashboard (FLCD) platform, a comprehensive management system designed for delivery fleet operations. The platform consists of a web-based administrative interface and a mobile application for riders.

### 1.2 Scope
The FLCD platform manages the complete lifecycle of delivery operations including:
- Multi-role administrative access and user management
- Rider onboarding, profile management, and compliance tracking
- Vehicle fleet management and maintenance scheduling
- Financial tracking including earnings, deductions, and penalties
- Real-time location monitoring and geo-fencing
- Performance analytics and KPI monitoring
- Support ticket management and emergency response

### 1.3 Stakeholders
- **Super Administrators**: Full system access and user management
- **Administrative Staff**: Role-based access to specific modules
- **Riders**: Mobile app users for field operations
- **Garage Staff**: Vehicle maintenance and repair management
- **Finance Team**: Earnings and deduction management

## 2. System Overview

### 2.1 Platform Architecture
- **Web Application**: Administrative dashboard for all non-rider users
- **Mobile Application**: iOS and Android app exclusively for riders
- **Real-time Communication**: Push notifications and live location tracking
- **Document Management**: Secure file upload and storage system

### 2.2 Core Modules
1. Authentication and Authorization
2. User Management
3. Rider Management
4. Vehicle Management
5. Financial Management
6. Compliance and Acknowledgments
7. Performance Monitoring
8. Support and Communication
9. Emergency Management

## 3. User Roles and Permissions

### 3.1 Administrative Roles

#### Super Admin
- **Access Level**: Full system access
- **Capabilities**:
  - Create, edit, activate, deactivate admin users
  - Configure system settings and permissions
  - Access all modules and data
  - Override any system restrictions

#### Admin Roles
- **General Admin**: General administrative functions
- **PRO**: Government relations and legal compliance
- **PRO Manager**: Oversee PRO operations
- **Operations Supervisor**: Fleet and rider operations
- **Accountant Manager**: Financial oversight
- **Accountant**: Financial data entry and processing
- **Legal Officer**: Legal compliance and documentation
- **HR Manager**: Human resources management
- **Garage**: Vehicle maintenance and repair

### 3.2 Field Roles

#### Rider
- **Access Level**: Mobile app only
- **Capabilities**:
  - View personal profile and performance data
  - Submit requests and complaints
  - Report vehicle issues and emergencies
  - Complete compliance acknowledgments
  - Access training materials
  - Receive push notifications for tasks and updates

### 3.3 Mobile Admin Access

#### Mobile Admin Users
- **Access Level**: Mobile app with admin privileges
- **Capabilities**:
  - **Limited Admin Functions**: Essential administrative tasks on mobile
  - **Push Notifications**: Receive job/task assignments with immediate alerts
  - **Quick Actions**: Approve urgent requests, view critical reports
  - **Deep Linking**: Direct access to admin panel from mobile notifications
  - **Emergency Response**: Handle urgent situations while mobile
- **Security**: 
  - Same authentication as web admin panel
  - Role-based access control maintained
  - Optional mobile access enablement per admin user

## 4. Functional Requirements

### 4.1 Authentication System

#### FR-AUTH-001: Identity & Access Management (IAM)
**Description**: System shall provide comprehensive identity and access management with multi-factor authentication
**Acceptance Criteria**:
- Username/password authentication with complexity requirements
- Email verification for all admin panel users during account creation
- Multi-factor authentication (MFA) using SMS OTP for sensitive operations
- Role-based access control (RBAC) with granular permissions
- Session management with secure token refresh flows
- Account lockout policies and brute force protection
- Audit logging for all authentication events

#### FR-AUTH-002: Email Verification for Admin Users *(Added: June 09, 2025)*
**Description**: System shall require email verification for all admin panel user accounts
**Acceptance Criteria**:
- Email verification required during admin user creation process
- Time-limited verification tokens (24-48 hours expiry)
- Account remains inactive until email verification is completed
- Resend verification email functionality
- Clear notification of verification status in admin dashboard
- Automatic cleanup of unverified accounts after token expiry

#### FR-AUTH-003: OTP-based Registration and Password Recovery
**Description**: System shall provide secure OTP-based user verification and password reset
**Acceptance Criteria**:
- SMS OTP delivery for new rider registration verification
- Time-limited OTP codes (5-10 minutes expiry)
- Phone number verification during rider onboarding
- SMS-based password reset for riders
- Email-based password reset for admin users (after email verification)
- Rate limiting for OTP requests to prevent abuse

### 4.2 User Management

#### FR-USER-001: Admin User Creation with Email Verification *(Updated: June 09, 2025)*
**Description**: Super Admin can create and manage administrative users with mandatory email verification
**Acceptance Criteria**:
- Form-based user creation with all required fields including valid email address
- Email verification sent immediately upon user creation
- Role assignment with module-specific permissions (activated after email verification)
- Profile image upload capability
- User status management (pending verification/active/inactive)
- Email verification status tracking in user management interface
- Automatic account activation upon successful email verification

#### FR-USER-002: Bulk User Operations
**Description**: System shall support bulk user operations
**Acceptance Criteria**:
- CSV/Excel template for bulk user creation
- Validation and error reporting for bulk operations
- Success/failure reporting with detailed logs

### 4.3 Rider Management

#### FR-RIDER-001: Rider Profile Creation
**Description**: HR can create comprehensive rider profiles with mandatory field validation
**Acceptance Criteria**:
- **Mandatory Fields** (all rider creation methods):
  - RiderID (riderCode): Unique identifier, uppercase letters/numbers/underscores/hyphens only
  - First Name: Required for identification, letters and spaces only, max 50 characters
  - Last Name: Required for identification, letters and spaces only, max 50 characters
  - Phone Number: Required for communication, unique, valid international format
- Complete personal information capture
- Identity document management with unique constraints
- Emergency contact information
- Employment and partner details
- Document upload with validation
- **Bulk Upload Support**: CSV-based bulk rider creation with mandatory field validation
- Real-time validation and clear error messaging
- Database constraints to prevent duplicate RiderIDs, phone numbers, and emails

#### FR-RIDER-002: Rider Onboarding Flow
**Description**: Newly created riders must complete onboarding with validated mandatory information
**Acceptance Criteria**:
- **Pre-onboarding Validation**: Verify all mandatory fields (RiderID, firstName, lastName, phone) are complete
- Email delivery of login credentials using validated contact information
- Mandatory compliance acknowledgments
- Profile completion requirements with mandatory field enforcement
- Access restriction until onboarding complete
- **Mobile App Integration**: Self-registration capabilities with mandatory field validation
- **Quality Assurance**: Automatic verification of data integrity before onboarding activation

### 4.4 Compliance Management

#### FR-COMP-001: Dynamic Acknowledgment System
**Description**: System shall generate acknowledgments based on lifecycle events
**Acceptance Criteria**:
- Automatic acknowledgment triggering based on system events
- Digital signature capture and storage
- Mandatory completion before system access
- Audit trail for all acknowledgments

#### FR-COMP-002: Acknowledgment Types
**Description**: Support for multiple acknowledgment categories
**Acceptance Criteria**:
- Visa and employment terms acknowledgment
- Asset assignment/return acknowledgments
- Financial obligation acknowledgments
- Incident and penalty acknowledgments

### 4.5 Financial Management

#### FR-FIN-001: Earnings Management
**Description**: System shall process and display rider earnings
**Acceptance Criteria**:
- Bulk earnings upload via CSV/Excel
- Automatic deduction calculation
- Rider-facing earnings summary
- Historical earnings tracking

#### FR-FIN-002: Deduction Management
**Description**: Support for multiple deduction types
**Acceptance Criteria**:
- Salik charges, loan repayments, penalties
- Phone usage charges
- Maintenance and damage cost deductions
- Bulk upload capability for all deduction types
- Integration with traffic fines management system

#### FR-FIN-003: Traffic Fines Management
**Description**: Comprehensive traffic fines tracking with dual date system and historical vehicle ownership
**Acceptance Criteria**:
- **Dual Date Tracking System**:
  - **Issue Date**: Date when traffic fine was issued by the authority
  - **Upload Date**: Date when fine was uploaded to the FLCD platform
- **Historical Vehicle Ownership Assignment**:
  - **Ownership-Based Assignment**: Fines assigned to rider who owned the vehicle at the time of issue (not upload)
  - **Vehicle Assignment History**: Complete historical tracking of vehicle ownership changes
  - **Ownership Lookup**: System determines vehicle owner based on fine issue date
  - **Assignment Validation**: Prevent incorrect fine assignment due to vehicle transfers
- **Fine Lifecycle Management**:
  - Fine registration and documentation
  - Assignment to responsible rider based on historical ownership
  - Payment status tracking (pending, paid, disputed)
  - Automatic salary deduction processing
- **Authority Integration**:
  - Support for multiple issuing authorities (Dubai Police, Abu Dhabi Police, etc.)
  - Fine classification by type and severity
  - Fine amount and payment deadline tracking
- **Rider Communication**:
  - Automatic notification upon fine upload to correct historical owner
  - Payment deadline reminders
  - Dispute resolution workflow
- **Bulk Operations**:
  - Bulk fine upload via CSV/Excel with both date fields
  - Batch processing for multiple riders with ownership validation
  - Mass notification capabilities
- **Vehicle History Logs**:
  - Complete audit trail of vehicle ownership changes
  - Assignment/unassignment timestamps for accurate fine allocation
  - Transfer history for dispute resolution
- **Reporting and Analytics**:
  - Fine frequency analysis by rider
  - Cost impact on fleet operations
  - Authority-wise fine distribution
  - Payment timeline analysis
  - Vehicle ownership impact analysis

### 4.6 Vehicle Management

#### FR-VEH-001: Vehicle Registry
**Description**: Comprehensive vehicle information management
**Acceptance Criteria**:
- Complete vehicle profile with documents
- Assignment tracking and history
- Maintenance scheduling and alerts
- Insurance and registration expiry monitoring

#### FR-VEH-002: Maintenance Management
**Description**: End-to-end maintenance workflow
**Acceptance Criteria**:
- Garage-initiated maintenance requests
- Job card creation and approval workflow
- Mileage tracking and updates
- Cost allocation and rider acknowledgments

### 4.7 Location and Safety

#### FR-LOC-001: Real-time Location Tracking
**Description**: Continuous location monitoring for active riders
**Acceptance Criteria**:
- Automatic location sharing during active sessions
- Live map view for administrators
- Location data privacy and security
- Battery optimization considerations

#### FR-LOC-002: Geo-fencing
**Description**: Boundary monitoring and violation alerts
**Acceptance Criteria**:
- Configurable geographic boundaries
- Real-time violation detection
- Immediate administrator notifications
- Violation logging and reporting

#### FR-SAF-001: Emergency Response System
**Description**: SOS functionality for rider safety
**Acceptance Criteria**:
- One-touch emergency alert activation
- Automatic GPS location transmission
- Predefined emergency message delivery
- Administrator notification system

### 4.8 Performance Management

#### FR-PERF-001: KPI Monitoring
**Description**: Comprehensive performance tracking system
**Acceptance Criteria**:
- Multi-criteria KPI calculation
- Monthly performance scoring
- Trend analysis and visualization
- Performance-based training triggers

#### FR-PERF-002: Health and Wellness Tracking
**Description**: Rider wellness monitoring system
**Acceptance Criteria**:
- Periodic wellness questionnaires
- Health score calculation and trending
- Visual health status indicators
- Privacy-compliant data handling

### 4.9 Communication and Support

#### FR-COMM-001: Ticket Management System
**Description**: Structured request and complaint handling
**Acceptance Criteria**:
- Categorized ticket creation
- Assignment and workflow management
- Status tracking and updates
- Document attachment support

#### FR-COMM-002: Knowledge Base System
**Description**: Self-service support through FAQ system
**Acceptance Criteria**:
- Chatbot-style FAQ interface
- Categorized help content
- Escalation to formal ticket system
- Usage analytics and optimization

### 4.10 Training and Development

#### FR-TRAIN-001: Training Content Management
**Description**: Embedded training materials and assessments
**Acceptance Criteria**:
- Video tutorial hosting and playback
- Categorized training content
- Progress tracking
- Mobile-optimized delivery

#### FR-TRAIN-002: Assessment System
**Description**: Mandatory training and quiz system
**Acceptance Criteria**:
- Performance-triggered training assignments
- Third-party assessment platform integration
- Completion tracking and enforcement
- Access restriction until completion

### 4.11 Mobile Admin Access

#### FR-MOBILE-001: Admin Mobile Login
**Description**: Administrative users can access the system through mobile app with role-based permissions
**Acceptance Criteria**:
- **Cross-Platform Authentication**: Same login credentials as web admin panel
- **Role-Based Mobile Access**: Admin users can be granted mobile access privileges
- **Security Compliance**: Mobile sessions follow same security protocols as web
- **Device Registration**: Track and manage admin mobile devices
- **Session Management**: Secure logout and session timeout handling
- **Limited Functionality**: Essential admin functions optimized for mobile interface

#### FR-MOBILE-002: Mobile Admin Dashboard
**Description**: Streamlined administrative interface for mobile devices
**Acceptance Criteria**:
- **Quick Actions**: Access to most critical administrative functions
- **Emergency Response**: Handle urgent situations while mobile
- **Status Overview**: Real-time system status and alerts
- **Deep Linking**: Direct navigation to specific admin functions
- **Offline Capability**: Basic functionality during network outages
- **Responsive Design**: Optimized for various mobile screen sizes

### 4.12 Push Notification System

#### FR-NOTIF-001: Job and Task Assignment Notifications
**Description**: Real-time push notifications for job and task assignments to admin users and riders
**Acceptance Criteria**:
- **Immediate Delivery**: Push notifications sent within 30 seconds of assignment
- **Multi-Platform Support**: iOS and Android push notification delivery
- **Rich Notifications**: Include job details, priority, and due date information
- **Action Buttons**: Quick accept/decline/view actions from notification
- **Deep Linking**: Tap notification opens relevant admin panel section
- **Delivery Confirmation**: Track notification delivery and read status

#### FR-NOTIF-002: Notification Management System
**Description**: Comprehensive notification management and configuration
**Acceptance Criteria**:
- **Notification Types**: Support for various notification categories (task assignment, emergency, system alerts)
- **Priority Levels**: Low, medium, high, and urgent priority classifications
- **User Preferences**: Individual notification settings and preferences
- **Delivery Scheduling**: Support for scheduled and recurring notifications
- **Template Management**: Customizable notification templates
- **Analytics and Reporting**: Notification delivery metrics and engagement tracking

#### FR-NOTIF-003: Admin Panel Access via Mobile
**Description**: Push notifications enable quick access to admin panel functions
**Acceptance Criteria**:
- **Smart Redirects**: Notifications automatically redirect to relevant admin panel sections
- **Mobile-Optimized Views**: Admin panel functions adapted for mobile viewing
- **Quick Response Actions**: Essential actions available directly from mobile interface
- **Context Preservation**: Maintain context when switching between mobile and web interfaces
- **Emergency Escalation**: Urgent notifications trigger immediate admin panel access
- **Audit Trail**: Track admin actions taken via mobile notifications

## 5. Non-Functional Requirements

### 5.1 Performance Requirements
- **Response Time**: Web interface response time < 2 seconds for 95% of requests
- **Mobile Performance**: App launch time < 3 seconds on standard devices
- **Concurrent Users**: Support 1000+ concurrent admin users and 5000+ concurrent riders
- **Data Processing**: Bulk operations processing within 5 minutes for 10,000 records

### 5.2 Scalability Requirements
- **Horizontal Scaling**: Architecture must support horizontal scaling
- **Database Performance**: Optimized for read-heavy workloads with appropriate indexing
- **File Storage**: Scalable document storage with CDN distribution
- **Geographic Distribution**: Multi-region deployment capability

### 5.3 Security Requirements
- **Authentication**: Multi-factor authentication for administrative users
- **Authorization**: Role-based access control with fine-grained permissions
- **Data Encryption**: End-to-end encryption for sensitive data
- **Audit Logging**: Comprehensive audit trail for all system actions
- **Compliance**: GDPR compliance for personal data handling

### 5.4 Reliability and Availability
- **Uptime**: 99.9% availability target
- **Backup**: Automated daily backups with point-in-time recovery
- **Disaster Recovery**: RTO < 4 hours, RPO < 1 hour
- **Monitoring**: Real-time system health monitoring and alerting

### 5.5 Usability Requirements
- **Mobile First**: Mobile app optimized for field use conditions
- **Accessibility**: WCAG 2.1 AA compliance for web interface
- **Internationalization**: Support for multiple languages and right-to-left text
- **Offline Capability**: Basic mobile app functionality during network outages

## 6. Technical Architecture

### 6.1 System Architecture
- **Frontend**: Modern web framework (React/Vue.js) for admin dashboard
- **Mobile**: Native iOS/Android apps or cross-platform framework (React Native/Flutter)
- **Backend**: Microservices architecture with RESTful APIs
- **Database**: Relational database for transactional data, NoSQL for logging
- **Cache**: Redis for session management and performance optimization
- **Queue**: Message queue system for asynchronous processing

### 6.2 Integration Requirements
- **Email Service**: SMTP integration for notifications
- **SMS Service**: SMS gateway for phone-based communications
- **File Storage**: Cloud storage service for document management
- **Maps API**: Integration with mapping service for location features
- **Push Notifications**: Mobile push notification service
- **Third-party Training**: Integration with external training platforms

### 6.3 Data Management
- **Data Retention**: Configurable retention policies for different data types
- **Data Export**: API and UI-based data export capabilities
- **Data Validation**: Comprehensive input validation and sanitization
- **Data Backup**: Automated backup with configurable retention periods

## 7. Data Security and Privacy

### 7.1 Data Classification
- **Public**: General system information
- **Internal**: Operational data restricted to authorized users
- **Confidential**: Personal rider information and financial data
- **Restricted**: Authentication credentials and system secrets

### 7.2 Privacy Controls
- **Data Minimization**: Collect only necessary personal information
- **Purpose Limitation**: Use data only for specified purposes
- **Access Controls**: Implement least-privilege access principles
- **Data Subject Rights**: Support for data access, correction, and deletion requests

### 7.3 Security Measures
- **Encryption**: AES-256 encryption for data at rest, TLS 1.3 for data in transit
- **Access Logging**: Comprehensive logging of all data access events
- **Vulnerability Management**: Regular security assessments and penetration testing
- **Incident Response**: Defined procedures for security incident handling

## 8. Integration Requirements

### 8.1 Essential Third-Party Integrations
- **Google Maps API**: Real-time location tracking, geofencing, and route visualization
- **SMS Gateway**: Third-party SMS service for OTP delivery during rider registration and user management
- **Email Service**: SMTP service for notifications and password resets
- **File Storage**: Cloud storage service for document management and CDN distribution

### 8.2 Core Platform Services
- **Identity & Access Management (IAM)**: Comprehensive authentication and authorization system
- **File Management**: Secure document upload, storage, and retrieval system
- **Notification Service**: Multi-channel notifications (email, SMS, push, in-app)
- **Location Tracking**: GPS coordinate collection, processing, and real-time monitoring

### 8.3 API Requirements
- **RESTful APIs**: Standard REST APIs for all integrations and internal communication
- **OAuth 2.0 + JWT**: Secure authentication with proper token management and refresh flows
- **Rate Limiting**: API rate limiting and throttling for security and performance
- **API Documentation**: Comprehensive API documentation with SDK support

---

*This document represents the comprehensive requirements for the FLCD platform. All requirements should be validated with stakeholders and updated as the project evolves.*
