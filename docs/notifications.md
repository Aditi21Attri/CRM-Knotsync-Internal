# KnotSync CRM Notification System

## Overview

The KnotSync CRM features a comprehensive, production-ready notification system that supports:

- **Database-backed notifications** with MongoDB storage
- **Real email delivery** via SMTP (Gmail, Outlook, SendGrid, etc.)
- **WhatsApp messaging** via UltraMsg API
- **In-app/browser notifications** for real-time alerts
- **Automatic retry logic** with exponential backoff
- **Notification history** and status tracking
- **Template-based messaging** for consistent communication

## Architecture

### Core Components

1. **NotificationProcessor** (`src/lib/services/notificationProcessor.ts`)
   - Central processing engine that runs continuously
   - Fetches pending notifications from database
   - Processes email, WhatsApp, and browser notifications
   - Handles retries and error logging

2. **Email Service** (`src/lib/services/emailService.ts`)
   - Production-ready email sending via nodemailer
   - HTML and text email templates
   - SMTP configuration support for major providers
   - Retry logic with exponential backoff

3. **WhatsApp Service** (`src/lib/services/whatsappService.ts`)
   - WhatsApp messaging via UltraMsg API
   - Phone number validation and formatting
   - Message templates and retry logic
   - Credential management

4. **Notification Actions** (`src/lib/actions/notificationActions.ts`)
   - Database CRUD operations for notifications
   - Create, fetch, update, mark as read functionality
   - Cleanup of old notifications

5. **API Endpoints** (`src/app/api/notifications/`)
   - RESTful APIs for notification management
   - Processor control endpoints
   - Demo notification creation

6. **UI Components** (`src/components/shared/NotificationCenter.tsx`)
   - Real-time notification display
   - Mark as read functionality
   - Notification history and status

## Setup Instructions

### 1. Environment Configuration

Copy `.env.example` to `.env.local` and configure:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/knotsync-crm

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME="KnotSync CRM"
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# WhatsApp
ULTRAMSG_INSTANCE_ID=your-instance-id
ULTRAMSG_TOKEN=your-token
```

### 2. Email Setup

#### Gmail Setup:
1. Enable 2-factor authentication
2. Generate an App Password: [Google Account Settings](https://myaccount.google.com/apppasswords)
3. Use the app password in `SMTP_PASS`

#### Other Providers:
- **Outlook**: Use `smtp.outlook.com` port 587
- **SendGrid**: Use `smtp.sendgrid.net` port 587
- **AWS SES**: Use region-specific SMTP endpoint

### 3. WhatsApp Setup

1. Sign up at [UltraMsg](https://ultramsg.com)
2. Create a WhatsApp instance
3. Get Instance ID and Token from dashboard
4. Configure phone number and QR code scanning

### 4. Database Setup

MongoDB is required for notification storage:

```bash
# Local MongoDB
mongod --dbpath /path/to/data

# OR use MongoDB Atlas (cloud)
# Update MONGODB_URI with your Atlas connection string
```

## Usage

### Automatic Notification Processing

The system automatically processes notifications:

```typescript
// System starts automatically when the app loads
// Configured in src/lib/startup/notifications.ts

// Manual control via API:
POST /api/notifications/process    // Process now
PUT /api/notifications/process     // Start auto-processor
DELETE /api/notifications/process  // Stop auto-processor
```

### Creating Notifications

Use the helper functions for common notification types:

```typescript
import { 
  createLeadAssignedNotification,
  createWelcomeNotification,
  createFollowUpReminderNotification 
} from '@/lib/services/notificationProcessor';

// Lead assignment notification
await createLeadAssignedNotification({
  employeeId: 'emp123',
  employeeName: 'John Doe',
  employeeEmail: 'john@company.com',
  leadId: 'lead456',
  leadName: 'Jane Smith',
  leadEmail: 'jane@example.com',
  leadPhone: '+1234567890',
  source: 'website'
});

// Welcome notification for new leads
await createWelcomeNotification({
  leadName: 'Jane Smith',
  leadEmail: 'jane@example.com',
  leadPhone: '+1234567890',
  source: 'website',
  assignedEmployee: 'John Doe'
});
```

### Notification Types

The system supports these notification types:

- `lead_assigned` - Employee gets assigned a new lead
- `welcome_message` - Welcome email/WhatsApp to new leads
- `follow_up_reminder` - Reminder for employee to follow up
- `customer_updated` - Customer information changes
- `system_alert` - System-wide alerts

### UI Integration

The notification center shows real-time notifications:

```tsx
import { NotificationCenter } from '@/components/shared/NotificationCenter';

// In your header component
<NotificationCenter userId={user.id} userName={user.name} />
```

## Testing

### Development Testing

1. Visit `/admin/notifications` for the test dashboard
2. Create demo notifications
3. Check browser notifications (allow when prompted)
4. Monitor console logs for email/WhatsApp simulation

### Production Testing

1. Configure real SMTP and WhatsApp credentials
2. Use the test dashboard to send real notifications
3. Monitor delivery status in notification center
4. Check email inboxes and WhatsApp messages

## Monitoring and Maintenance

### Logs

All notification activities are logged:

```
🔔 [NOTIFICATION PROCESSOR] Processing 5 notifications
📧 [EMAIL SERVICE] Email sent successfully to user@example.com
💬 [WHATSAPP SERVICE] WhatsApp sent successfully to +1234567890
✅ [NOTIFICATION PROCESSOR] All channels completed for notification 123
```

### Database Cleanup

Old notifications are automatically cleaned up:

```typescript
// Cleanup notifications older than 30 days
await cleanupOldNotifications(30);
```

### Performance Monitoring

Monitor these metrics:
- Notification processing time
- Email delivery success rate
- WhatsApp delivery success rate
- Database query performance
- Memory usage of notification processor

## Troubleshooting

### Common Issues

1. **Email not sending**
   - Check SMTP credentials
   - Verify network connectivity
   - Check spam folders
   - Review email service logs

2. **WhatsApp not sending**
   - Verify UltraMsg instance is active
   - Check phone number format (+country code)
   - Ensure UltraMsg account has credits
   - Verify API token is valid

3. **Notifications not appearing**
   - Check browser notification permissions
   - Verify user is logged in
   - Check network requests to API
   - Review browser console for errors

4. **Database connection issues**
   - Verify MongoDB is running
   - Check connection string format
   - Ensure database has proper indexes
   - Monitor connection pool usage

### Debug Mode

Enable debug logging by setting:

```bash
NODE_ENV=development
DEBUG=notification*
```

## API Reference

### Notification Management

```bash
# Get user notifications
GET /api/notifications?userId=123&limit=50

# Get unread count
GET /api/notifications?userId=123&countOnly=true

# Mark as read
PATCH /api/notifications
{
  "notificationId": "123"
}

# Mark all as read
PATCH /api/notifications
{
  "userId": "123",
  "markAll": true
}
```

### Processor Control

```bash
# Process pending notifications
POST /api/notifications/process

# Start auto-processor
PUT /api/notifications/process
{
  "intervalMs": 30000
}

# Stop auto-processor
DELETE /api/notifications/process
```

### Demo Notifications

```bash
# Create demo notification
POST /api/notifications/demo
{
  "userId": "123",
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "type": "lead_assigned"
}
```

## Security Considerations

1. **Email Security**
   - Use app passwords, not account passwords
   - Enable TLS/SSL for SMTP connections
   - Rotate email credentials regularly

2. **WhatsApp Security**
   - Protect UltraMsg tokens as sensitive data
   - Use environment variables, not hardcoded values
   - Monitor WhatsApp API usage and costs

3. **Database Security**
   - Use MongoDB authentication
   - Implement proper access controls
   - Regular backup of notification data

4. **API Security**
   - Implement rate limiting on notification APIs
   - Validate user permissions before showing notifications
   - Sanitize all user inputs in notifications

## Future Enhancements

Planned features for future versions:

- [ ] SMS notifications via Twilio
- [ ] Push notifications for mobile apps
- [ ] Notification preferences per user
- [ ] Advanced notification templates
- [ ] Notification analytics dashboard
- [ ] Integration with external CRM systems
- [ ] A/B testing for notification content
- [ ] Scheduled notification sending
- [ ] Notification delivery webhooks
