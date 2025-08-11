# Meeting Booking System Setup Guide

This guide explains how to set up and test the complete meeting booking system.

## Database Setup

1. **Create the meeting_bookings table**:
   Run the SQL script in `frontend/create_meeting_booking_system.sql` in your Supabase SQL Editor.

## System Flow

### 1. Student Requests Advisor
- Student goes to their club page
- Navigates to "Teacher Advisor" tab
- Searches for teachers and sends an advisor request
- Teacher receives notification of the request

### 2. Teacher Approves Advisor Request
- Teacher logs into Teacher Dashboard (`/teacher-dashboard`)
- Goes to "Advisor Requests" tab
- Reviews and approves/denies the request
- Student receives notification of approval

### 3. Meeting Bookings Tab Appears
- Once a student has an **approved** advisor request, the "Meeting Bookings" tab becomes visible in their club dashboard
- Students can only book meetings with teachers who have approved their advisor requests

### 4. Student Books Meeting
- Student goes to "Meeting Bookings" tab in their club
- Clicks "Book Meeting" button
- Fills out the meeting booking form:
  - Select approved advisor
  - Choose meeting date (future dates only)
  - Set start and end times
  - Add optional purpose/description
- System checks for time conflicts before allowing booking
- Teacher receives notification of meeting request

### 5. Teacher Manages Meeting Requests
- Teacher goes to "Meeting Bookings" tab in Teacher Dashboard
- Views all pending meeting requests
- For each pending request, teacher can:
  - Add an optional response note
  - **Approve** the meeting (turns status to "approved")
  - **Decline** the meeting (turns status to "declined")
- Student receives notification of teacher's decision

## Key Features

### Student Side
- **Conditional Access**: Meeting Bookings tab only appears if student has approved advisors
- **Approved Advisors Display**: Shows list of all approved advisors with their details
- **Meeting Request Form**: Easy-to-use form with date/time pickers
- **Request Tracking**: View all meeting requests and their status
- **Teacher Responses**: See teacher's notes when they approve/decline

### Teacher Side
- **Request Management**: View all meeting requests in chronological order
- **Approve/Decline Actions**: Simple buttons with optional response notes
- **Status Tracking**: Clear visual indicators for all meeting statuses
- **Conflict Prevention**: System prevents double-booking automatically

### Security Features
- **Authorization**: Students can only book with their approved advisors
- **Conflict Detection**: Prevents overlapping meeting times
- **User Validation**: Clerk authentication required for all actions

## API Endpoints

- `GET /api/meeting-bookings` - Fetch meeting bookings (filtered by user)
- `POST /api/meeting-bookings` - Create new meeting booking
- `PATCH /api/meeting-bookings/[bookingId]` - Approve/decline meeting
- `DELETE /api/meeting-bookings/[bookingId]` - Cancel meeting

## Status Flow

```
1. Student sends advisor request → status: "pending"
2. Teacher approves advisor request → status: "approved"
3. Student books meeting → status: "pending"
4. Teacher approves/declines meeting → status: "approved" or "declined"
5. Meeting can be cancelled → status: "cancelled"
6. Completed meetings → status: "completed"
```

## Testing Checklist

- [ ] Student can send advisor request
- [ ] Teacher can approve advisor request
- [ ] Meeting Bookings tab appears for student after approval
- [ ] Student can book meeting with approved advisor
- [ ] Teacher receives meeting request
- [ ] Teacher can approve meeting with optional note
- [ ] Teacher can decline meeting with optional note
- [ ] Student sees updated status and teacher response
- [ ] System prevents booking with non-approved advisors
- [ ] System prevents time conflicts
- [ ] Notifications work properly

## Troubleshooting

### Meeting Bookings Tab Not Appearing
- Ensure student has at least one approved advisor request
- Check browser refresh/reload
- Verify user is properly authenticated

### Cannot Book Meeting
- Verify advisor request is approved (not just pending)
- Check if selected time conflicts with existing bookings
- Ensure all required form fields are filled

### Teacher Actions Not Working
- Verify teacher is authenticated as the correct teacher
- Check that booking belongs to the authenticated teacher
- Ensure network connectivity for API calls