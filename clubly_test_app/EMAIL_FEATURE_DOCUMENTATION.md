# Club Email Management Feature

This document describes the new email management feature that allows club administrators to manage their club's mailing list and send emails to members.

## Overview

The email management feature consists of two main components:

1. **Club Email Manager**: A dedicated page where users can upload CSV files, add/remove individual contacts, and manage their club's mailing list
2. **Email Integration**: "Send to Club" buttons on meeting summaries and presentations that automatically send content to the club's mailing list

## Features

### 1. Club Email Manager (`/clubs/[clubName]/email-manager`)

#### CSV Upload
- Upload CSV files with email contacts
- Supports columns: `email` (required), `name` (optional)
- Automatically validates email formats
- Prevents duplicate emails
- Shows import results (successful vs skipped)

#### Individual Contact Management
- Add individual contacts with email and optional name
- Remove contacts from the mailing list
- View all contacts in a clean interface

#### Email Sending
- Send custom emails to all club members
- Rich text editor for composing messages
- Professional email templates with club branding

### 2. Email Integration

#### Meeting Summaries
- "Send to Club" button on meeting summary result page
- Pre-filled subject and content with meeting summary
- Sends to all club members automatically

#### Presentations
- "Send to Club Members" button on presentation generation page
- Customizable email content for presentation announcements
- Links to view/download the presentation

## Technical Implementation

### File Structure
```
frontend/app/
├── clubs/[clubName]/email-manager/page.tsx     # Email manager UI
├── api/clubs/
│   ├── [clubId]/emails/route.ts               # GET/POST contacts
│   ├── [clubId]/emails/[contactId]/route.ts   # DELETE contact
│   ├── emails/upload/route.ts                  # CSV upload
│   └── emails/send/route.ts                    # Send emails
└── data/emails/                                # Email storage
    └── {clubId}.json                          # Club email lists
```

### Data Storage
- Email contacts stored in JSON files: `data/emails/{clubId}.json`
- Each club has its own email list
- Contacts include: id, email, name, addedAt timestamp

### Email Service
- Uses nodemailer with Gmail SMTP
- Sender: clublyteam@gmail.com
- App password: `CLUBLY_GMAIL_APP_PASSWORD`
- HTML email templates with professional styling

### API Endpoints

#### GET `/api/clubs/[clubId]/emails`
- Returns all contacts for a club

#### POST `/api/clubs/[clubId]/emails`
- Adds a new contact to the club's mailing list
- Validates email format
- Prevents duplicates

#### DELETE `/api/clubs/[clubId]/emails/[contactId]`
- Removes a specific contact from the mailing list

#### POST `/api/clubs/emails/upload`
- Handles CSV file uploads
- Parses CSV and validates emails
- Adds valid contacts to the club's mailing list

#### POST `/api/clubs/emails/send`
- Sends emails to all club members
- Loads recipients from club's email list
- Uses professional HTML templates

## Usage Instructions

### Setting Up Email Management

1. **Navigate to Club Email Manager**
   - Go to your club's page
   - Click on "Club Email Manager" in the navigation

2. **Upload CSV File**
   - Prepare a CSV file with columns: `email`, `name` (optional)
   - Click "Upload CSV File" and select your file
   - Review the import results

3. **Add Individual Contacts**
   - Use the "Add Individual Contact" section
   - Enter email and optional name
   - Click "Add Contact"

4. **Manage Contacts**
   - View all contacts in the mailing list
   - Remove contacts using the "Remove" button

### Sending Emails

#### From Meeting Summaries
1. Generate a meeting summary
2. On the result page, click "Send to Club"
3. Customize the subject and message if needed
4. Click "Send Email"

#### From Presentations
1. Generate a presentation
2. On the result page, click "Send to Club Members"
3. Customize the subject and message
4. Click "Send Email"

#### From Email Manager
1. Go to Club Email Manager
2. Scroll to "Send Club Email" section
3. Enter subject and message
4. Click "Send Email to All Contacts"

## CSV Format

The CSV file should have the following format:

```csv
email,name
john.doe@example.com,John Doe
jane.smith@example.com,Jane Smith
mike.wilson@example.com,Mike Wilson
```

**Required columns:**
- `email`: The email address (required)

**Optional columns:**
- `name`: The contact's name (optional)

## Email Templates

### Meeting Summary Template
```
Subject: [Club Name] Meeting Summary

Dear club members,

Here is the summary of our recent meeting:

[Meeting summary content]

Best regards,
[Club Name] Team
```

### Presentation Template
```
Subject: [Club Name] New Presentation Available

Dear club members,

A new presentation has been created for our club: "[Presentation Topic]"

You can view and download the presentation from the link below.

Best regards,
[Club Name] Team
```

## Security & Privacy

- Email addresses are stored securely in JSON files
- No email addresses are exposed in client-side code
- All email sending is done server-side
- Users can remove themselves from mailing lists by contacting the club administrator

## Environment Variables

Required environment variables:
- `CLUBLY_GMAIL_APP_PASSWORD`: Gmail app password for sending emails

## Testing

To test the email functionality:

1. Create a test CSV file with sample emails
2. Upload it to a club's email manager
3. Generate a meeting summary or presentation
4. Use the "Send to Club" button
5. Check that emails are received

## Future Enhancements

Potential improvements:
- Email templates customization
- Scheduled emails
- Email analytics (open rates, click rates)
- Unsubscribe functionality
- Email preferences per contact
- Bulk email operations
- Email history and tracking 