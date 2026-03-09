# Application Workflow

This document explains the core workflow of the Service Manager application for different user roles.

## 1. Administrator Workflow
Admins manage the entire system through the main dashboard.

- **Staff Management**: 
  - Admins can create technicians and electricians.
  - Admins can invite staff via registration links sent via SMS.
  - Admins have full CRUD access to staff profiles, including sensitive data like NID and uploaded documents.
- **Service Management**:
  - Admins receive service requests from customers.
  - Admins assign experts (technicians/electricians) to specific services.
- **Customer Management**:
  - Admins can create and manage customer records.
- **System Maintenance**:
  - The system automatically "heals" the database schema on startup to ensure consistency.

## 2. Staff (Technician/Electrician) Workflow
Staff members use a dedicated portal to manage their work and profile.

- **Login**: Access the portal at `/staff/login`.
- **Profile Management**:
  - Staff can view their profile, including ratings, service history, and payment history.
  - Staff can update their bio, skills, and contact information.
  - **Restrictions**: Sensitive fields like NID and "Other Documents" are **view-only** for staff (managed by Admin).
- **Work Tracking**:
  - Staff can see a list of their assigned services.
  - Performance is tracked via "Successful Services", "Canceled Services", and Customer Ratings.

## 3. Customer Workflow
Customers can browse experts and manage their service requests.

- **Expert Selection**:
  - Customers can search for technicians and electricians.
  - Experts are automatically sorted by their rating (highest first).
- **Customer Portal**:
  - Customers can log in at `/customer/login`.
  - Customers can view their service history and tracking status.
  - Profile features include viewing personal info and past invoices.

---

## Technical Integration
- **Database**: Powered by Neon (PostgreSQL) with Drizzle ORM.
- **Security**: Role-based access control managed via Next.js Middleware.
- **Notifications**: Automated SMS notifications for registrations and service updates.
- **Storage**: Media files (photos, documents) are stored securely on Cloudflare R2.
