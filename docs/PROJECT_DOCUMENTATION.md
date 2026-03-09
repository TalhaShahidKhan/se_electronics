# SE Electronics Service Manager - Project Documentation

**Version:** 6.0.0
**Last Updated:** March 2, 2026
**Project Type:** Service Management & Customer Relationship Management (CRM) System
**Framework:** Next.js 15 (App Router) with TypeScript & React 19
**Database:** PostgreSQL with Drizzle ORM
**Styling:** Tailwind CSS

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Database Schema](#database-schema)
4. [Core Features & Modules](#core-features--modules)
5. [Pages & Routes](#pages--routes)
6. [Components](#components)
7. [Server Actions & API](#server-actions--api)
8. [Utilities & Helpers](#utilities--helpers)
9. [Authentication & Authorization](#authentication--authorization)
10. [File Storage & Media](#file-storage--media)
11. [Notifications & Communications](#notifications--communications)
12. [Configuration & Environment](#configuration--environment)
13. [Key Files Reference](#key-files-reference)

---

## Project Overview

**SE Electronics Service Manager** is a comprehensive service management system designed for SE Electronics, a company specializing in IPS (Inverter Power Supply), batteries, stabilizers, and related electronic products.

The system manages the complete service lifecycle from:
- Customer registration and sales (invoices)
- Service requests (repair & installation)
- Staff management (technicians & electricians)
- Appointment scheduling & tracking
- Payment processing
- Subscription management
- Customer feedback collection
- Document generation (PDFs, certificates, ID cards)

### Business Context
- **Company:** SE Electronics (SE IPS BD)
- **Industry:** Electronics sales & service
- **Location:** Sylhet, Bangladesh
- **Contact:** +8801310673600, seipsbd@gmail.com
- **Languages:** Bengali (primary), English

---

## Architecture & Technology Stack

### Frontend
- **Framework:** Next.js 15 with App Router
- **UI Library:** React 19.1.1
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3.4.1
- **Icons:** Lucide React
- **Toasts:** React Toastify

### Backend
- **Runtime:** Node.js with Next.js Server Actions
- **ORM:** Drizzle ORM 0.44.5
- **Database:** PostgreSQL (Neon Database)
- **Validation:** Zod 4.1.8
- **File Uploads:** AWS S3 (via @aws-sdk)

### Authentication & Security
- **JWT Tokens:** jose library (HS256 algorithm)
- **Session Management:** HTTP-only cookies
- **Password Hashing:** bcrypt
- **Token Expiry:** Configurable via environment variables

### Communications
- **Email:** Nodemailer
- **SMS:** SMS gateway integration
- **QR Codes:** qrcode library
- **Barcodes:** jsbarcode

### PDF & Document Generation
- **HTML-to-PDF:** Puppeteer Core + Chromium
- **Image Processing:** Sharp
- **Canvas:** For PDF generation

### Deployment & Infrastructure
- **Hosting:** Vercel-compatible
- **Database:** Neon Serverless PostgreSQL
- **File Storage:** AWS S3
- **Turbopack:** Enabled for development

---

## Database Schema

### Core Tables

#### 1. `admins`
- System administrators
- Fields: `id`, `username` (unique), `password`, `createdAt`, `updatedAt`

#### 2. `customers`
- Customer information linked to invoices
- Fields:
  - `customerId` (unique, human-readable ID)
  - `name`, `phone`, `address`
  - `invoiceNumber` (unique, references invoices)
  - Timestamps
- Indexes: customerId, phone, invoiceNumber

#### 3. `invoices`
- Sales invoices with line items
- Fields:
  - `id` (UUID)
  - `invoiceNumber` (unique, auto-generated)
  - `customerId` (FK to customers)
  - `customerName`, `customerPhone`, `customerAddress` (denormalized)
  - `date` (invoice date)
  - `paymentType` (enum: cash, bkash, nagad, rocket, bank)
  - `subtotal`, `total`, `dueAmount`
  - Timestamps
- Relationships: One-to-many with `products`

#### 4. `products`
- Individual line items on invoices
- Fields:
  - `invoiceId` (FK)
  - `type` (enum: ips, battery, stabilizer, others)
  - `model` (product model)
  - `quantity` (default: 1)
  - `unitPrice`
  - `warrantyStartDate`
  - `warrantyDurationMonths` ( predefined discount schedule)
- Relationships: Belongs to invoice

#### 5. `services`
- Service requests (repair or installation)
- Fields:
  - `id` (UUID)
  - `serviceId` (unique, human-readable ID)
  - `customerId`, `customerName`, `customerPhone`, `customerAddress`
  - `customerAddressDistrict`, `customerAddressPoliceStation`, `customerAddressPostCode`
  - `staffId`, `staffName`, `staffPhone` (assigned staff)
  - `staffReport` (JSON, technician's notes)
  - `type` (enum: install, repair)
  - `productType`, `productModel`, `ipsBrand`, `powerRating`, `memoNumber`
  - `reportedIssue` (customer's problem description)
  - `createdFrom` (enum: public_form, dashboard)
  - `resolvedBy` (enum: staff_member, service_center)
  - `isActive` (boolean)
  - `ipAddress`, `userAgent` (tracking)
  - Media keys: `productFrontPhotoKey`, `productBackPhotoKey`, `warrantyCardPhotoKey`
  - Timestamps
- Indexes: serviceId, customerId, staffId, isActive, type, customerPhone

#### 6. `serviceStatusHistory`
- Complete audit trail of service status changes
- Fields:
  - `serviceId` (FK)
  - `status` (enum: pending, in_progress, appointment_retry, service_center, service_center_received, staff_departed, staff_arrived, completed, canceled)
  - `statusType` (enum: system, custom)
  - `customLabel`, `customNote`
  - `cancelReason`
  - Timestamps

#### 7. `staffs`
- Staff members (technicians & electricians)
- Fields:
  - `staffId` (unique, human-readable ID)
  - `name`, `fatherName`, `phone`
  - Addresses: current & permanent (street, district, police station, post office)
  - `photoKey`, `nidFrontPhotoKey`, `nidBackPhotoKey` (S3 keys)
  - Experience: `hasRepairExperience`, `repairExperienceYears`, `hasInstallationExperience`, `installationExperienceYears`
  - `role` (enum: technician, electrician)
  - `isVerified` (approval status)
  - `paymentPreference` (enum: cash, bkash, nagad, rocket, bank)
  - `walletNumber`, `bankInfo` (JSON)
  - `createdFrom` (how they were added)
  - `ipAddress`, `userAgent`
  - Timestamps

#### 8. `applications`
- Applications for staff positions or service subscriptions
- Fields:
  - `id`, `applicationId` (unique)
  - `applicantId` (references either staff.staffId or services.serviceId or subscriptions.subscriptionId)
  - `status` (enum: pending, processing, approved, rejected)
  - `type` (enum: service_application, staff_application, subscription_application)
  - `rejectReason`
  - Timestamps
- Polymorphic relationship to staff, services, or subscriptions

#### 9. `subscriptions`
- Maintenance subscription plans
- Fields:
  - `subscriptionId` (unique)
  - `name`, `phone`
  - Address: `streetAddress`, `district`, `policeStation`, `postOffice`
  - `subscriptionDuration` (in months)
  - `subscriptionType` (enum: battery_maintenance, ips_and_battery_maintenance, full_maintenance)
  - `batteryType`, `ipsBrand`, `ipsPowerRating`
  - `paymentType`
  - Pricing: `basePrice`, `discountAmount`, `surchargeAmount`, `totalFee`
  - `walletNumber`, `transactionId`, `bankInfo` (JSON)
  - `isActive`
  - `ipAddress`, `userAgent`
  - Timestamps

#### 10. `payments`
- Staff payments (commission/salary)
- Fields:
  - `paymentId` (unique)
  - `staffId` (FK)
  - `invoiceNumber` (unique, references invoices for staff payment receipts)
  - `paymentMethod`
  - `senderWalletNumber`, `senderBankInfo`
  - `receiverWalletNumber`, `receiverBankInfo`
  - `amount`
  - `transactionId` (unique)
  - `description`
  - `date` (payment date)
  - Timestamps

#### 11. `feedbacks`
- Customer feedback for completed services
- Fields:
  - `id`
  - `serviceId` (FK, unique)
  - `customerId` (FK)
  - `feedbacks` (JSON array of question/answer pairs)
  - `rating` (numeric)
  - Timestamps

#### 12. `agreements`
- Legal agreements/terms of service
- Fields:
  - `id`
  - `type` (enum: application_declaration)
  - `title`, `content`, `version`
  - `isActive`
  - Timestamps

#### 13. `userAgreements`
- Tracks which users accepted which agreements
- Fields:
  - `userId` (staffId)
  - `agreementId` (FK)
  - `agreedAt`
  - `ipAddress`, `userAgent`
  - Timestamps

#### 14. `authTokens`
- Temporary tokens for secure PDF/invoice downloads
- Fields:
  - `id`
  - `token` (unique, hashed)
  - `payload` (JSON: type, id, issuedAt)
  - `expiresAt`
  - Timestamps

### Enums Reference

| Enum | Values |
|------|--------|
| `productType` | ips, battery, stabilizer, others |
| `serviceType` | install, repair |
| `serviceStatus` | pending, in_progress, appointment_retry, service_center, service_center_received, staff_departed, staff_arrived, completed, canceled |
| `applicationStatus` | pending, processing, approved, rejected |
| `applicationTypes` | service_application, staff_application, subscription_application |
| `staffRole` | technician, electrician |
| `paymentTypes` | cash, bkash, nagad, rocket, bank |
| `subscriptionTypes` | battery_maintenance, ips_and_battery_maintenance, full_maintenance |
| `createdFromTypes` | public_form, dashboard |
| `resolvedByTypes` | staff_member, service_center |
| `statusTypes` | system, custom |

---

## Core Features & Modules

### 1. Authentication & Session Management
- JWT-based authentication with HTTP-only cookies
- Session expiration configurable (default: days from env)
- Middleware protection for dashboard routes
- Automatic redirect from login if already authenticated
- Server-side session verification (`verifySession`)

### 2. Customer Management
- Create customers with full details
- Auto-generate customer IDs (e.g., CUST-0001)
- Link customers to invoices
- Search across customers by ID, name, phone, address, invoice number
- Update customer info (creates new invoice)
- Delete customers (cascades to invoices)
- View customer service history

### 3. Sales & Invoicing
- Create multi-item invoices
- Support for different product types (IPS, battery, stabilizer)
- Auto-generate invoice numbers (e.g., INV-2025-0001)
- Calculate totals with discounts
- Send invoice download links via SMS
- Denormalized customer data on invoices
- View invoice details with products
- Delete invoices (cascades)
- PDF generation for invoices
- Payment tracking (due amounts)

### 4. Service Management

#### Service Types
- **Repair Services:** Fixing existing IPS/batteries/stabilizers
- **Installation Services:** New product installations

#### Service Lifecycle
1. **Creation** - From dashboard or public form
2. **Initial Status:** `pending`
3. **Staff Assignment** - Assign technician/electrician
4. **Status Progression:**
   - `in_progress`
   - `appointment_retry` (if customer not available)
   - `service_center` (product taken to service center)
   - `service_center_received`
   - `staff_departed` (technician left for customer)
   - `staff_arrived` (technician arrived)
   - `completed`
   - `canceled` (with reason)
5. **Custom statuses** with labels and notes

#### Media Management
- Upload product front photo
- Upload product back photo
- Upload warranty card photo
- Images compressed (WebP) and stored in AWS S3
- S3 keys stored in service record
- Media accessible via secure download URLs

#### Staff Reporting
- Technicians can add service reports
- Report includes:
  - Problem description
  - Resolution details
  - Parts replaced/suggestions
  - `resolved` flag (marks as staff member resolved)
- Reports trigger email notifications to admin

#### SMS Notifications
- Customer receives tracking link upon creation
- Customer receives appointment notifications
- Staff receives service details and report URL
- Completion SMS with feedback link
- Admin notified of public form submissions

### 5. Staff Management

#### Two Roles
- **Technicians:** Handle IPS repairs and technical issues
- **Electricians:** Handle installations and electrical work

#### Staff Profile
- Detailed personal information
- Photo and NID (National ID) uploads
- Experience tracking (years, has experience flags)
- Payment preference (mobile banking or cash)
- Bank details for payments
- Verification status
- Staff ID card generation (PDF)

#### Staff Actions
- Send registration links (for new staff applications)
- View staff by role
- Edit staff information
- Upload photos and NID images
- Send ID card download links via SMS
- Generate certificates
- Verify staff accounts

### 6. Payment Management
- Record staff payments
- Link payments to invoices (for commission tracking)
- Multiple payment methods (cash, mobile banking)
- Store sender/receiver details
- Track transaction IDs
- Generate payment invoices (PDF)
- View payment history by staff

### 7. Subscription Management
- Long-term maintenance plans:
  - Battery Maintenance only
  - IPS + Battery Maintenance
  - Full Maintenance (IPS, battery, stabilizer)
- Customer application form
- Duration options (with discounts: 1, 3, 6, 12, 18, 24, 30, 36 months)
- Discount schedule in constants
- Auto-calculate total with discounts/surcharges
- Track active subscriptions
- Subscription applications linked to service requests

### 8. Application Management
Three application types:
1. **Staff Applications:** From `sendRegistrationLink`
2. **Service Applications:** When public form is used
3. **Subscription Applications:** For maintenance plans

Features:
- Track application status (pending → processing → approved/rejected)
- Reject applications with reasons
- View staff applications with profile
- View service applications linked to services
- Automatic approval integration when staff completes tasks

### 9. Feedback Collection
- Triggered after service completion
- 5 predefined questions:
  1. Product/service resolved correctly?
  2. Installation completed on time?
  3. Satisfaction with service quality?
  4. Satisfaction with staff behavior?
  5. Staff arrived on time?
- Custom question: Did staff ask for extra money?
- Rating calculation (average)
- View feedback with customer and service details

### 10. Certificate Generation
- Generate certificates for:
  - Technicians
  - Electricians
- Certificate template with:
  - Staff photo
  - Staff ID, name, role
  - Shop name & ID
  - Owner name
  - Issuance date
  - QR code for verification
- PDF generation
- Send download link via SMS

### 11. ID Card Generation
- ID card template for staff
- Includes photo, name, staff ID, role
- PDF generation
- Secure download via token
- SMS delivery

### 12. PDF Generation
**Uses Puppeteer + Chromium to render HTML to PDF**

PDF Types:
- **Customer Invoices:** With product details, pricing, company info
- **Payment Receipts:** For staff payments
- **Staff ID Cards**
- **Certificates**
- **Service Reports**

All PDFs accessible via secure token-based URLs with expiry.

### 13. Service Tracking (Public)
Public-facing service tracking page:
- Enter service ID to track status
- View status history timeline
- View assigned staff (with photo)
- See estimated time/next steps
- URL format: `/service-track?serviceId=XXXX`

### 14. Application Tracking (Public)
Track staff application status:
- Enter tracking ID
- View current status (pending/approved/rejected)
- URL format: `/application-track?trackingId=XXXX`

### 15. Warranty Check (Public)
- Enter invoice number
- Check warranty status for products
- Shows warranty start date and expiry
- URL format: `/check-warranty?invoiceNumber=XXXX`

### 16. Feedback Submission (Public)
- Customers submit feedback after service
- Access via unique link sent by SMS
- Five-star rating system
- Questionnaire

---

## Pages & Routes

### Public Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/login` | `app/login/page.tsx` | Admin/staff login |
| `/service-track` | `app/service-track/page.tsx` | Public service status tracking |
| `/application-track` | `app/application-track/page.tsx` | Track staff application |
| `/check-warranty` | `app/check-warranty/page.tsx` | Check product warranty |
| `/service-feedback` | `app/service-feedback/page.tsx` | Submit service feedback |
| `/get-service` | `app/get-service/page.tsx` | Public service request form |

### Dashboard Routes (Protected)

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `app/(dashboard)/page.tsx` | Add Service Form |
| `/customers` | `app/(dashboard)/customers/page.tsx` | Customer list & management |
| `/invoices` | `app/(dashboard)/invoices/page.tsx` | Invoice list & PDF downloads |
| `/services/repairs` | `app/(dashboard)/services/[type]/page.tsx` | Repair services list |
| `/services/installations` | `app/(dashboard)/services/[type]/page.tsx` | Installation services list |
| `/feedbacks` | `app/(dashboard)/feedbacks/page.tsx` | View customer feedback |
| `/applications` | `app/(dashboard)/applications/page.tsx` | Manage applications |
| `/staffs/technicians` | `app/(dashboard)/staffs/[role]/page.tsx` | Technician management |
| `/staffs/electricians` | `app/(dashboard)/staffs/[role]/page.tsx` | Electrician management |
| `/payments` | `app/(dashboard)/payments/page.tsx` | Staff payments |
| `/subscribers` | `app/(dashboard)/subscribers/page.tsx` | Subscription plans |
| `/maintenance-plans` | `app/maintenance-plans/page.tsx` | Maintenance plans info |
| `/team-members` | `app/team-members/page.tsx` | Team display page |
| `/register` | `app/register/page.tsx` | Staff registration form |

### PDF Download Routes
- `/api/pdf/download/invoice?token=...` - Download customer invoice
- `/api/pdf/download/payment?token=...` - Download payment receipt
- `/api/pdf/download/id-card?token=...` - Download staff ID card
- `/api/pdf/download/certificate?token=...` - Download certificate

---

## Components

### Layout Components

#### `DashboardLayout` (`src/components/DashboardLayout.tsx`)
Main dashboard shell with:
- Sidebar navigation (mobile responsive)
- Progress bar (NProgress)
- User info display
- SMS balance display
- Logout functionality
- Context provider for sidebar toggle
- Pagination state management

#### `ErrorUI` (`src/components/ErrorUI.tsx`)
Generic error display component

#### `DelayedLoading` (`src/components/DelayedLoading.tsx`)
Loading component with delay to prevent flash

### Common UI Components

#### `InputField` (`src/components/InputField.tsx`)
- Reusable input with label, error display
- Supports text, email, number types
- Character count

#### `Modal` (`src/components/Modal.tsx`)
- Generic modal with confirm/cancel
- Title, children, onConfirm, onCancel props

#### `ProgressBar` (`src/components/ProgressBar.tsx`)
- NProgress integration for route change indicator

#### `Spinner` (`src/components/Spinner.tsx`)
- Loading spinner component

#### `StarRating` (`src/components/StarRating.tsx`)
- 5-star rating display with value

#### `StatusBadge` (`src/components/StatusBadge.tsx`)
- Status badges with color coding:
  - pending: yellow
  - in_progress: blue
  - completed: green
  - canceled: red
  - etc.

#### `Timestamp` (`src/components/Timestamp.tsx`)
- Date formatting (toLocaleDateString, relative time)

#### `CopyButton` (`src/components/CopyButton.tsx`)
- One-click copy to clipboard

### Feature Components

#### Action Button Components
- `AddCustomerButton`
- `AddPaymentButton`
- `ApplicationActionButtons`
- `CustomerActionButtons`
- `FeedbackActionButtons`
- `InvoiceActionButtons`
- `InvoicePreviewButton`
- `PaymentActionButtons`
- `ServiceActionButtons`
- `StaffActionButtons`
- `SubscriberActionButtons`

Each provides common operations (edit, delete, view, generate PDF) for their entity.

#### List Components
- `ApplicationList`
- `CustomerList`
- `FeedbackList`
- `InvoiceList`
- `PaymentList`
- `ServiceList`
- `SubscriberList`

All list components with:
- Search functionality
- Pagination
- Action menus
- Empty states

#### Form Components
- `CustomerForm` - Create/edit customers
- `RegistrationForm` - Staff registration
- `PaymentForm` - Record staff payments
- `FeedbackForm` - Customer feedback

#### Modal Components
- `CustomerViewModal` - Detailed customer view
- `PaymentViewModal` - Payment details
- `ServiceViewModal` - Service details
- `StaffProfileModal` - Staff profile & documents
- `StaffMembersModal` - Select staff for appointment
- `CertificateModal` - Generate certificate form
- `ProductSelectionModal` - Choose product from invoice to add to service

#### Display Components
- `InvoiceTemplate` - PDF invoice template
- `PaymentReceiptTemplate` - PDF payment receipt
- `IdCardTemplate` - Staff ID card template
- `CertificateTemplate` - Certificate template
- `ImageWithLightbox` - Image with zoom/lightbox
- `ProfileLinkButton` - Button to view staff profile
- `ConnectivityAlert` - Offline detection

---

## Server Actions & API

Server Actions are the primary API mechanism (Next.js app router). All data operations happen via server actions.

### Structure (`src/actions/`)

```
actions/
├── index.ts                  # Barrel export
├── adminActions.ts           # Admin operations
├── applicationActions.ts     # Application CRUD
├── authActions.ts            # Authentication, token management
├── customerActions.ts        # Customer CRUD
├── feedbackActions.ts        # Feedback CRUD
├── invoiceActions.ts         # Invoice operations, PDF links
├── paymentActions.ts         # Payment CRUD
├── productActions.ts         # Product queries
├── serviceActions.ts         # Service CRUD, status updates, appointments
├── staffActions.ts           # Staff CRUD, registration, ID cards, certs
└── subscriptionActions.ts    # Subscription CRUD
```

### Common Action Patterns

All actions return:
```typescript
{ success: boolean, message: string, data?: any }
```

#### CRUD Operations
- `getX()` - Fetch all with pagination & search
- `getXMetadata()` - Get pagination info
- `getXById()` / `getXByNumber()` - Fetch single record
- `createX()` - Create new (usually with FormData or validated object)
- `updateX()` - Update existing
- `deleteX()` - Soft delete or hard delete

#### Transaction Support
Critical operations use `db.transaction()` for atomicity:
- Customer creation (customer + invoice + products)
- Service creation + status history
- Staff appointment + status update

#### Revalidation
Actions call `revalidatePath()` to refresh server cache:
```typescript
revalidatePath('/customers')
revalidatePath('/services')
```

---

## Utilities & Helpers

### `src/utils/index.ts`

Core utility functions:
- `generateRandomId()` - Create human-readable IDs (CUST-0001, SERV-0001)
- `generateInvoiceNumber()` - Invoice numbers: INV-2025-0001
- `generateUrl()` - Build public URLs with tokens
- `formatDate()` - Date formatting (Bangla locale)
- `formatNumber()` - Number formatting with commas
- `renderText()` - Template string replacement (using Mustache-like syntax)
- `getQuarterlyData()` - Analytics helper
- `getMonthlyData()` - Analytics helper

### `src/lib/session.ts`
- `encrypt()` - JWT encryption
- `decrypt()` - JWT verification
- `createSession()` - Set HTTP-only cookie
- `verifySession()` - Verify and optionally redirect
- `deleteSession()` - Clear session cookie

### `src/lib/s3.ts`
- `putObject()` - Upload to S3
- `getObjectUrl()` - Generate signed URL (expires in 1 hour)
- `deleteObject()` - Delete from S3
- Configuration: uses env vars for AWS credentials and region

### `src/lib/sharp.ts`
- `compressImage()` - Compress and convert images to WebP
- Used for uploaded product photos, staff photos, NID images

### `src/lib/mail.ts`
- `sendEmail()` - Nodemailer wrapper
- Currently used for technician comment notifications

### `src/lib/sms.ts`
- `sendSMS()` - SMS gateway wrapper
- Uses environment SMS provider
- Custom `SMSError` class for SMS-specific errors

### `src/lib/definitions.ts`
TypeScript type definitions for:
- `BankInfo` - Bank account details
- `Feedback` - Feedback question/answer structure
- `StaffServiveReport` - Staff service report structure

### `src/hooks/index.ts`
- `useDebounce` - Debounce hook for search inputs
- `useSideNavContext` - Sidebar toggle context

---

## Authentication & Authorization

### Login Flow
1. User submits username/password via `[login/page.tsx]`
2. `login()` server action verifies against `admins` table (bcrypt)
3. On success: `createSession()` sets HTTP-only cookie
4. Middleware redirects authenticated users away from `/login`

### Session Verification
- `verifySession()` checks cookie
- Used in Server Actions via Middleware
- Pages use `verifySession()` in Server Components
- Redirects to `/login` if no valid session

### Protected Routes
Middleware protects all dashboard routes:
```
/
/customers
/invoices
/services/*
/staffs/*
/feedbacks
/applications
/payments
/subscribers
```

Public routes (no auth required):
```
/login
/register
/service-track
/application-track
/check-warranty
/service-feedback
/get-service
/api/pdf/download/*
```

### Authorization
- Single role: Admin/Staff (all dashboard users have full access)
- No role-based restrictions in current version
- Staff vs Admin distinction minimal (both have same dashboard access)

---

## File Storage & Media

### AWS S3 Integration
- Bucket configured via `AWS_S3_BUCKET` env var
- Credentials: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- Region: `AWS_REGION`
- URLs generated with 1-hour expiry

### File Organization

```
s3://bucket/
├── media/
│   ├── services/
│   │   └── {serviceId}/
│   │       ├── product-front_{uuid}.webp
│   │       ├── product-back_{uuid}.webp
│   │       └── warranty-card_{uuid}.webp
├── staff/
│   ├── photos/
│   │   └── {staffId}.webp
│   └── nids/
│       ├── {staffId}-front.webp
│       └── {staffId}-back.webp
```

### Image Processing
- All images compressed to WebP format
- Product photos: `compressImage(buffer, 'product')`
- Warranty cards: lower quality (different compression)
- Staff photos: optimized for ID cards

---

## Notifications & Communications

### SMS Templates (Bangla)

All SMS messages defined in `src/constants/messages.ts`:

#### Service-Related
- `ServiceMessages.CONFIRMATION` - Service created (with tracking link)
- `ServiceMessages.CUSTOMER_REPAIR` - Appointment scheduled for repair
- `ServiceMessages.CUSTOMER_INSTALL` - Appointment for installation
- `ServiceMessages.COMPLETION_REPAIR` - Service completed (with feedback link)
- `ServiceMessages.COMPLETION_INSTALL` - Installation completed
- `ServiceMessages.TECHNICIAN_APPOINT` - Notify technician
- `ServiceMessages.ELECTRICIAN_APPOINT` - Notify electrician

#### Application-Related
- `ApplicationMessages.service.SUBMISSION` - Service application received
- `ApplicationMessages.service.ADMIN_NOTIF` - Admin notification
- `ApplicationMessages.staff.REG_INVITE` - Registration invite link

#### Media Downloads
- `MediaDownloadMessages.CUSTOMER_INVOICE` - Invoice download link
- `MediaDownloadMessages.REPAIR_PAYMENT_INVOICE` - Payment receipt
- `MediaDownloadMessages.INSTALL_PAYMENT_INVOICE` - Payment receipt
- `MediaDownloadMessages.TECHNICIAN_ID_CARD` - ID card download
- `MediaDownloadMessages.ELECTRICIAN_ID_CARD` - ID card download

### Message Template Variables
All templates use `{{variable}}` syntax:
- `{customer_name}` - Customer full name
- `{service_id}` - Service ID (e.g., SERV-0001)
- `{tracking_link}` - Full URL to tracking page
- `{staff_name}` - Staff name
- `{product_model}` - Product model number
- `{customer_phone}` - Customer phone
- `{customer_address}` - Full address
- `{feedback_url}` - Feedback submission link
- `{download_link}` - Secure PDF download URL
- `{registration_link}` - Staff registration link
- `{invoice_number}`, `{date}`, `{total_price}`, `{name}`, etc.

### Email
- Currently only used for technician comment notifications
- Sent from: "New Technician Comment"
- Subject: "Technician Comment Notification"
- Contains comment and link to services page

---

## Configuration & Environment

### Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Authentication
SESSION_SECRET=random-string-for-jwt
SESSION_EXPIRY_DAY=30  # Days before session expires

# SMS Provider
SMS_PROVIDER_API_KEY=...
SMS_PROVIDER_URL=...
ADMIN_PHONE_NUMBER=+8801310673600  # Receive notifications

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=...

# Email (optional)
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...

# App
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
DOWNLOAD_LINK_EXPIRY_DAY=7  # PDF download links expire in 7 days
REGISTRATION_LINK_EXPIRY_DAY=3  # Staff registration links expire in 3 days
```

### Constants (`src/constants/`)

#### `index.ts`
- Contact details
- Warranty periods (0, 6, 12, 18, 24, 30, 36 months)
- Product types
- Payment types
- Service statuses
- Application types
- Service/battery/stabilizer brand names
- Power ratings
- Discount schedule
- Feedback questions (5 standard questions)
- Staff stats (hardcoded, likely from v5 legacy data)
- Payment details (bKash, Nagad, Rocket, Bank)

#### `messages.ts`
All SMS and email message templates

#### `subscription-plans.ts`
(If exists) Subscription plan definitions

---

## Key Files Reference

### Entry Points
- `src/app/layout.tsx` - Root layout (includes Toaster)
- `src/app/page.tsx` - **Public landing page** (redirects or public info)
- `src/app/login/page.tsx` - Login form
- `src/app/(dashboard)/layout.tsx` - Dashboard layout with Sidebar
- `src/app/(dashboard)/page.tsx` - Add Service form (dashboard home)

### Configuration
- `package.json` - Dependencies, scripts
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind configuration
- `tsconfig.json` - TypeScript configuration
- `postcss.config.mjs` - PostCSS (for Tailwind)
- `drizzle.config.ts` - Drizzle ORM configuration
- `.env.example` - Environment variable template

### Database
- `src/db/drizzle.ts` - Drizzle database connection
- `src/db/schema.ts` - All table schemas and relations

### Types
- `src/types/index.ts` - Shared TypeScript interfaces

### Validation
- `src/validationSchemas/index.ts` - Zod schemas for all forms

### Components
- `src/components/index.ts` - Barrel export

### Actions
- `src/actions/index.ts` - Barrel export

### Middleware
- `src/middleware.ts` - Route protection, redirects

### Utilities
- `src/utils/index.ts` - All utility functions

---

## Development Workflow

### Running the Project
```bash
# Development with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint

# Database migrations (push schema)
npm run db:push
```

### Database Changes
1. Modify `src/db/schema.ts`
2. Run `npm run db:push` to sync with PostgreSQL
3. Use `drizzle-kit` for migrations in production

### Adding New Features
1. Update schema if needed → run `db:push`
2. Create server actions in `src/actions/`
3. Create UI components in `src/components/`
4. Add route/page in `src/app/`
5. Update constants/messages if needed
6. Write validation schemas
7. Test SMS/email flows

---

## Important Patterns & Notes

### Form Handling
- Uses native HTML forms with Server Actions (`action={action}`)
- `useActionState` for pending state and results
- `FormData` parsing in server actions
- Zod validation on server
- Client-side validation with HTML5 `required` attributes

### State Updates in Render
**Problem:** Calling toast in render phase causes React error
**Solution:** Use `useEffect` to show toast after render
**Fixed in:** `src/app/login/page.tsx`

### Image Optimization
- Next.js `Image` component for static assets (logo.jpg)
- S3 images use signed URLs (expire after 1 hour)
- Consider caching strategy for staff photos

### ID Generation
- Human-readable IDs with sequential numbers (customers, services, staff)
- UUID for relational table primary keys
- Format: `{PREFIX}-{0001}` where PREFIX depends on entity

### Currency
- All amounts in Bangladeshi Taka (Tk)
- Formatting: `toLocaleString()` for ৳ symbol

### Date/Time
- stored in PostgreSQL with timezone (`timestamptz`)
- Display: Bengali date format (Bangla numerals not used, but Bangla text)
- `formatDate()` utility

### Search
- Case-insensitive partial matching (`ilike`)
- Multi-column search with `or()` conditions
- Pagination via offset/limit

### File Uploads
- Multipart form data
- Client sends `File` objects
- Server buffers → compresses → uploads to S3
- Store S3 key, not file itself
- Validation: MIME types, size (>0)

### Token-Based PDF Access
- Token stored in `authTokens` table
- Token sent via SMS link
- Verified via `verifyAuthToken()` in PDF route
- Token deleted after use or expires

### SMS Sending
All SMS go through `sendSMS()` in `src/lib/sms.ts`:
- Throws `SMSError` on failure
- Actions catch and return error message
- Some actions send SMS conditionally (public vs dashboard)

---

## Known Considerations

### Security
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens signed with HS256
- HTTP-only cookies prevent XSS reading
- PDF download tokens single-use/expiring
- SMS links not rate-limited (potential spam vector)

### Performance
- Pagination on all list pages (default 20 items)
- Indexes on foreign keys, search columns
- S3 signed URLs cached in frontend (1 hour)
- Image compression reduces storage/bandwidth

### Scalability
- Serverless architecture (Vercel/Neon)
- Drizzle ORM abstracts DB queries
- All operations stateless (except DB transactions)

### Internationalization
- Primarily Bengali language UI
- Hardcoded strings in Bangla
- Not i18n-ready (would need full translation layer)

### Mobile Responsiveness
- Tailwind responsive classes used
- Sidebar hidden on mobile (hamburger menu)
- Tables scroll horizontally on small screens
- Forms full-width on mobile

---

## Future Enhancement Ideas

- Role-based permissions (admin vs regular staff)
- Audit logging for all actions
- Bulk operations (bulk customer import, bulk payment)
- Email notifications for customers
- WhatsApp integration
- Real-time chat support
- Mobile app (React Native)
- Advanced analytics dashboard
- Export to Excel/CSV
- Barcode scanning for product/model
- Multi-language support
- QR code for staff verification
- Two-factor authentication
- Staff performance metrics (already have staffStats constant)
- Customer portal (self-service)
- Recurring subscription billing

---

## Troubleshooting

### "Cannot update a component while rendering"
- Symptom: Console error about setState during render
- Cause: Calling state update (like `toast.error()`) directly in render
- Fix: Move side effects to `useEffect`
- Example: [Fixed in `src/app/login/page.tsx`](src/app/login/page.tsx)

### "Missing required environment variable"
- Check `.env` file matches `.env.example`
- Restart dev server after env changes

### "PDF generation fails"
- Ensure Chromium/Chrome is available (Puppeteer downloads on first run)
- Check S3 permissions for templates
- Verify token validity

### "SMS not sending"
- Verify SMS provider API key
- Check phone number format (international: +880...)
- Inspect logs for `SMSError`

### Database errors
- Run `npm run db:push` to sync schema
- Check DATABASE_URL connection
- Verify Neon database is active

---

## Maintenance

### Database Backups
- Set up Neon automated backups or manual export
- Frequency: Daily recommended

### S3 Cleanup
- Monitor storage usage
- Consider lifecycle policies for old media
- Old deleted service media may remain in S3 (not currently cleaned)

### Token Cleanup
- `authTokens` table may accumulate expired tokens
- Consider cron job to delete expired tokens periodically

### Logs
- Application logs: Vercel/Node console
- Database: Neon logs
- SMS: Provider dashboard
- S3: CloudWatch

---

## Contact & Support

**Project Maintainer:** SE Electronics IT Team
**Business Inquiries:** seipsbd@gmail.com
**Phone:** +8801310673600
**Website:** www.seipsbd.com
**Address:** আম্বর খানা পয়েন্ট এয়ারপোর্ট রোড সিলonet

---

*End of Documentation*
*Last synced with codebase: March 2, 2026 (v6.0.0)*
