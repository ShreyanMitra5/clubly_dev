# Teacher Advisor Booking System - Implementation Guide

## Overview

The Teacher Advisor Booking System is an extension of Clubly that allows teachers to manage their availability and students to request teachers as advisors and book meetings with them. This system solves the problem of teachers being overwhelmed with club advisor requests and helps prevent double-booking of meeting times.

## Features Implemented

### 🏫 Teacher Portal
- **Authentication**: Teachers can register and log in using their school email
- **Availability Dashboard**: Set weekly availability schedules with room numbers
- **Advisor Request Management**: View and respond to student requests
- **Meeting Management**: View upcoming meetings and manage bookings
- **Notifications**: Real-time notifications for requests and bookings

### 👨‍🎓 Student Interface (Extended)
- **Advisor Request Flow**: Request teachers to be club advisors
- **Booking System**: Book meetings based on teacher availability
- **Conflict Prevention**: Automatic double-booking detection
- **Teacher Discovery**: Find available teachers with capacity

### 🧰 Database & Backend
- **Teacher Management**: Complete teacher profiles and availability
- **Request System**: Advisor request workflow with approval/denial
- **Booking System**: Meeting bookings with conflict detection
- **Notifications**: Real-time notification system

## Database Schema

### Tables Created
1. **teachers** - Teacher profiles and capacity management
2. **teacher_availability** - Weekly availability schedules
3. **advisor_requests** - Student requests for teacher advisors
4. **meeting_bookings** - Scheduled meetings between clubs and teachers
5. **notifications** - User notifications system

### Key Features
- **Conflict Detection**: Prevents double-booking using SQL functions
- **Capacity Management**: Automatic tracking of teacher club limits
- **Audit Trail**: Complete history of requests and bookings
- **Indexing**: Optimized queries for performance

## API Endpoints

### Teachers API (`/api/teachers`)
- `GET` - List teachers with filters
- `POST` - Register new teacher
- `PATCH` - Update teacher information

### Availability API (`/api/teachers/availability`)
- `GET` - Get teacher availability
- `POST` - Set teacher availability
- `PATCH` - Update specific time slot
- `DELETE` - Remove time slot

### Advisor Requests API (`/api/advisor-requests`)
- `GET` - List requests with filters
- `POST` - Create new advisor request
- `PATCH` - Approve/deny request

### Meeting Bookings API (`/api/meeting-bookings`)
- `GET` - List bookings with filters
- `POST` - Create new booking (with conflict detection)
- `PATCH` - Update booking status

### Notifications API (`/api/notifications`)
- `GET` - List user notifications
- `POST` - Create notification
- `PATCH` - Mark as read
- `DELETE` - Delete notifications

## Frontend Components

### Teacher Portal (`/teacher-portal`)
- **Dashboard**: Overview of requests, meetings, and stats
- **Availability Management**: Set and manage weekly schedules
- **Request Management**: Approve/deny advisor requests
- **Meeting Calendar**: View upcoming meetings
- **Notifications**: Real-time notification center

### Teacher Registration (`/teacher-registration`)
- **Registration Form**: Complete teacher profile setup
- **Validation**: Form validation and error handling
- **Integration**: Seamless Clerk authentication integration

## Free APIs and Services Used

### 1. Supabase (Database & Auth)
- **PostgreSQL Database**: All data storage
- **Real-time Subscriptions**: Live updates
- **Row Level Security**: Data protection
- **Edge Functions**: Serverless API endpoints

### 2. Clerk (Authentication)
- **User Management**: Teacher and student accounts
- **Google Workspace Integration**: School email authentication
- **JWT Tokens**: Secure API access

### 3. Built-in Calendar Features
- **HTML5 Date/Time Inputs**: Native browser calendar
- **JavaScript Date API**: Date manipulation and formatting
- **CSS Grid/Flexbox**: Responsive calendar layouts

### 4. Notification System
- **Browser Notifications**: Native browser notifications
- **In-app Notifications**: Real-time notification center
- **Email Notifications**: Future integration with email services

## Implementation Steps

### 1. Database Setup
```sql
-- Run the teacher_advisor_system.sql file
-- This creates all necessary tables and functions
```

### 2. API Routes
- All API routes are implemented in `/app/api/`
- TypeScript types defined in `/types/teacher.ts`
- Error handling and validation included

### 3. Frontend Pages
- Teacher portal: `/teacher-portal`
- Teacher registration: `/teacher-registration`
- Integration with existing Clubly system

### 4. Testing
- Test teacher registration flow
- Test availability setting
- Test advisor request workflow
- Test booking system with conflict detection

## Security Features

### Data Protection
- **Row Level Security**: Database-level access control
- **Input Validation**: All API endpoints validate input
- **Authentication**: Clerk handles user authentication
- **Authorization**: Teacher-specific data access

### Conflict Prevention
- **Double-booking Detection**: SQL functions prevent conflicts
- **Capacity Limits**: Automatic teacher capacity tracking
- **Request Validation**: Ensures valid advisor relationships

## Performance Optimizations

### Database
- **Indexed Queries**: Fast lookups on common fields
- **Efficient Joins**: Optimized relationship queries
- **Connection Pooling**: Supabase handles connections

### Frontend
- **Lazy Loading**: Components load on demand
- **Caching**: API responses cached appropriately
- **Optimistic Updates**: UI updates immediately

## Future Enhancements

### 1. Calendar Integration
- **Google Calendar**: Sync with teacher calendars
- **Outlook Integration**: Microsoft 365 support
- **iCal Export**: Export meetings to calendar apps

### 2. Advanced Features
- **Recurring Meetings**: Set up regular meeting schedules
- **Meeting Templates**: Predefined meeting types
- **Room Management**: School room booking integration

### 3. Mobile Support
- **Progressive Web App**: Mobile-friendly interface
- **Push Notifications**: Mobile notification support
- **Offline Support**: Basic offline functionality

## Usage Instructions

### For Teachers
1. **Register**: Visit `/teacher-registration` to create account
2. **Set Availability**: Configure weekly availability in teacher portal
3. **Manage Requests**: Review and respond to advisor requests
4. **View Meetings**: Check upcoming meetings and bookings

### For Students
1. **Find Teachers**: Browse available teachers in club settings
2. **Request Advisor**: Send advisor request with optional message
3. **Book Meetings**: Schedule meetings based on teacher availability
4. **Track Status**: Monitor request and booking status

## Troubleshooting

### Common Issues
1. **Teacher Not Found**: Ensure teacher is registered in system
2. **Booking Conflicts**: Check teacher availability and existing bookings
3. **Capacity Limits**: Verify teacher hasn't reached club limit
4. **Authentication**: Ensure proper Clerk authentication

### Debug Steps
1. Check browser console for errors
2. Verify API endpoint responses
3. Confirm database table structure
4. Test with sample data

## Deployment

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

### Database Migration
1. Run `teacher_advisor_system.sql` in Supabase
2. Verify table creation and sample data
3. Test API endpoints with sample data

### Frontend Deployment
1. Build and deploy to Vercel/Netlify
2. Configure environment variables
3. Test all user flows

## Support

For technical support or feature requests:
1. Check the implementation documentation
2. Review API endpoint documentation
3. Test with sample data
4. Contact development team

---

This implementation provides a complete teacher advisor booking system that integrates seamlessly with the existing Clubly platform, using only free services and APIs while maintaining high security and performance standards. 