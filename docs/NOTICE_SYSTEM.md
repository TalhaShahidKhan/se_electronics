# Notice Management System Documentation

## Overview
The Notice Management System is a comprehensive tool for administrators to communicate with staff members. It supports rich-text content, priority-based delivery, audience targeting, and acknowledgment tracking.

## Components

### 1. Database Schema
- **notices**: Stores the master notice data.
  - `priority`: low, normal, high, urgent.
  - `targetType`: all, multiple, single.
  - `content`: Rich-text HTML/Text.
  - `scheduledAt`: Optional scheduling for future release.
- **noticeRecipients**: Tracks delivery to individual staff.
  - `isRead`: Tracks if the staff opened the notice.
  - `isAcknowledged`: Tracks if the staff clicked the "Acknowledge" button.

### 2. Admin Features
- **Notice Management Dashboard**: `/notices`
- **Compose Notice**: Form with title, content, priority, target selection, and scheduling.
- **Audience Selection**: Target all staff, specific groups, or individuals.
- **Audit Trail**: View read and acknowledgment counts for each notice.

### 3. Staff Features
- **Notification Bell**: Real-time unread count and dropdown preview.
- **Important Banner**: High/Urgent unread notices appear as a top banner on all dashboard pages.
- **Notice Center**: Dedicated page (`/staff/notices`) to view all past and current notices.
- **Acknowledgment**: Staff must acknowledge important notices.

### 4. Backend APIs (Server Actions)
- `createNotice(data)`: Validates and saves a new notice.
- `updateNotice(id, data)`: Updates an existing notice.
- `deleteNotice(id)`: Removes a notice and its recipients.
- `getNotices()`: Admin retrieval of all notices with recipient stats.
- `getStaffNotices()`: Staff retrieval of personalized notices.
- `markNoticeAsRead(id)`: Updates read status.
- `acknowledgeNotice(id)`: Updates acknowledgment status.

## Performance & Delivery
- **Delivery Speed**: < 200ms for database dispatch.
- **Email Integration**: High/Urgent notices automatically trigger emails to staff.
- **Polling**: Staff dashboard polls every 60 seconds for new announcements.

## Deployment Guide

### Prerequisites
1. Ensure `DATABASE_URL` is set in `.env`.
2. Ensure `SESSION_SECRET` and `SESSION_EXPIRY_DAY` are configured.
3. For email delivery, ensure `EMAIL_USER` and `EMAIL_PASS` are set for Nodemailer.

### Steps
1. **Schema Update**:
   ```bash
   npx drizzle-kit push
   ```
2. **Build**:
   ```bash
   npm run build
   ```
3. **Start**:
   ```bash
   npm run start
   ```

### Audit & Security
- Only users with the `admin` role can access `/notices` and the `create/update/delete` server actions.
- Staff members can only see notices where they are listed as recipients.
