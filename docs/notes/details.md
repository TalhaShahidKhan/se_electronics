# SE Electronics Service Manager - Project Analysis Report

## 1. Project Overview
SE Electronics Service Manager is a comprehensive Service Management & Customer Relationship Management (CRM) system designed for SE Electronics (Sylhet, Bangladesh). The system efficiently manages the lifecycle of electronics services (IPS, batteries, stabilizers), from initial customer requests to staff assignment, service tracking, payment processing, and feedback collection.

## 2. Technology Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS.
- **Backend**: Next.js Server Actions (Stateless API), Node.js.
- **Database**: PostgreSQL (Neon Serverless) with Drizzle ORM.
- **Authentication**: JWT-based (jose library) with HTTP-only cookies and bcrypt for password hashing.
- **File Storage**: AWS S3 for images and documents.
- **Communications**: SMS Gateway integration, Nodemailer for emails.
- **Media Processing**: Sharp for WebP image compression, Puppeteer/Chromium for PDF generation (Invoices, ID Cards, Certificates), QR Code & Barcode generation.
- **Validation**: Zod (Schema-based validation for all forms and actions).

## 3. Core Modules & Functionalities

### A. Service Management (Repair & Installation)
- **Service Request**: Customers can request services via a public form (`/get-service`) or admins can add them from the dashboard.
- **Service Lifecycle**: Tracks statuses: `pending` → `in_progress` → `staff_departed` → `staff_arrived` → `completed` / `canceled`.
- **Technician/Electrician Assignment**: Admins assign staff to services; staff receives SMS with details and report links.
- **Service Reports**: Staff can submit reports (notes, status updates) which notify admins via email.
- **Public Tracking**: Customers track service progress via a unique ID on `/service-track`.
- **Media Attachments**: Captures photos of products and warranty cards, stored in S3.

### B. Customer & Sales Management
- **Customer CRM**: Maintains a database of customers linked to their invoice history.
- **Invoicing**: Generates multi-item invoices (IPS, batteries, stabilizers) with auto-calculation of totals and discounts.
- **PDF Generation**: Admins can generate and send secure PDF download links for invoices via SMS.
- **Warranty Tracking**: Integrated warranty check (`/check-warranty`) based on invoice numbers.

### C. Staff Management (Technicians & Electricians)
- **Role Distinction**: Technicians handle technical repairs; Electricians handle installations.
- **Onboarding**: Uses a token-based invite system for staff to register themselves (`/register`).
- **Profile & Documents**: Stores personal info, photos, and NID images (S3).
- **ID Cards & Certificates**: Automated PDF generation for staff ID cards and experience certificates with QR codes for verification.
- **Performance Metrics**: Tracks total services, successful completions, and customer ratings for each staff member.

### D. Subscription Maintenance Plans
- **Plans**: Offers various maintenance plans (Battery only, IPS+Battery, Full maintenance).
- **Subscription Lifecycle**: Customers apply for plans; admins manage active subscriptions and renewals.
- **Pricing**: Dynamic calculation based on duration (1-36 months) with predefined discount schedules.

### E. Payment Management
- **Record Keeping**: Tracks staff commissions and salaries.
- **Transactions**: Supports various methods (bKash, Nagad, Rocket, Bank, Cash).
- **Receipts**: Generates PDF payment receipts for auditing and staff records.

### F. Feedback System
- **Collection**: Automates SMS with feedback links (`/service-feedback`) after service completion.
- **Analysis**: Collects 5-star ratings and answers to specific service quality questions.

## 4. Application Architecture & Data Flow

### Communications Flow
1. **Action Triggered**: e.g., Admin assigns a service.
2. **Server Action**: Backend updates PostgreSQL via Drizzle.
3. **External Services**:
   - **SMS**: Sends notification to customer and staff.
   - **S3**: Fetches/Saves relevant media.
   - **Mail**: (Optional) Sends email alerts for technician comments.
4. **UI Update**: `revalidatePath` refreshes the dashboard data.

### Security Model
- **Admin Dashboard**: Restricted to authenticated users via Next.js Middleware.
- **Staff Access**: Separate login flow for staff to view their profiles and assigned tasks.
- **Public Access**: Specific routes are open for tracking and feedback, secured by unique IDs or single-use tokens.
- **Media Security**: S3 objects are accessed via time-limited signed URLs (1-hour expiry).

## 5. Database Schema (Drizzle ORM)
- **Core Entities**: `customers`, `invoices`, `products`, `services`, `staffs`, `payments`, `subscriptions`.
- **System Tables**: `admins`, `authTokens`, `serviceStatusHistory`, `applications`, `feedbacks`, `agreements`.
- **Relationships**: 
  - One-to-Many: Invoices to Products, Staff to Services.
  - One-to-One: Service to Feedback.
  - Polymorphic: Applications can link to Services or Staff.

## 6. Project Structure Overview

### /src Directory
- **app/**: Next.js routes (Public routes and `(dashboard)` protected routes).
- **actions/**: Server actions containing all business logic (CRUD, SMS, DB ops).
- **components/**: Modular UI items (Forms, Lists, Modals, Layouts).
- **db/**: Drizzle schema (`schema.ts`) and database connection (`drizzle.ts`).
- **lib/**: Core service wrappers (S3, SMS, Session, Image compression, Mail).
- **constants/**: Centralized messages, price schedules, and enum definitions.
- **validationSchemas/**: Zod schemas for strict data validation across the app.
- **utils/**: Shared helper functions (ID generation, formatting, URL building).

### /docs Directory
- **PROJECT_DOCUMENTATION.md**: A massive 1100+ line technical manual covering every detail of the project, including enums, environment variables, and development workflows.

## 7. Key Operational Highlights
- **Human-Readable IDs**: Uses CUST-xxxx, SERV-xxxx, and STAFF-xxxx for better usability.
- **Bangla Context**: UI and SMS templates are tailored for Bengali speakers (Sylhet region).
- **Automated Workflows**: Extensive use of SMS to bridge the gap between digital management and field technicians.
- **Robust Image Handling**: Automatic conversion to WebP and resolution optimization for storage efficiency.
- **Offline Readiness**: Includes connectivity alerts to notify users when the network is down.

This system represents a highly customized, enterprise-level solution for local electronics service providers, combining modern web technologies with practical business workflows.
