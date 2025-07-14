import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { readFile } from 'fs/promises';
import { join } from 'path';

interface Recipient {
  email: string;
  name?: string;
}

interface EmailContact {
  id: string;
  email: string;
  name?: string;
  addedAt: string;
}

interface ClubEmails {
  clubId: string;
  contacts: EmailContact[];
  updatedAt: string;
}

interface SendEmailRequest {
  clubId: string;
  clubName: string;
  senderName?: string;
  subject: string;
  content: string;
}

// Helper function to get the emails file path
function getEmailsFilePath(clubId: string): string {
  const emailsDir = join(process.cwd(), 'data', 'emails');
  return join(emailsDir, `${clubId}.json`);
}

// Helper function to load emails for a club
async function loadClubEmails(clubId: string): Promise<ClubEmails> {
  try {
    const filePath = getEmailsFilePath(clubId);
    const fileContent = await readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    // If file doesn't exist, return empty structure
    return {
      clubId,
      contacts: [],
      updatedAt: new Date().toISOString()
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: SendEmailRequest = await request.json();
    const { clubId, clubName, senderName, subject, content } = body;

    if (!clubId || !clubName || !subject || !content) {
      return NextResponse.json({ 
        error: 'Missing required fields: clubId, clubName, subject, or content' 
      }, { status: 400 });
    }

    // Load club's email list
    const clubEmails = await loadClubEmails(clubId);
    const recipients = clubEmails.contacts.map(contact => ({
      email: contact.email,
      name: contact.name
    }));

    if (recipients.length === 0) {
      return NextResponse.json({ error: 'No email contacts found for this club. Please add contacts in the Email Manager first.' }, { status: 400 });
    }

    // Validate recipients
    const validRecipients = recipients.filter(r => r.email && r.email.includes('@'));
    if (validRecipients.length === 0) {
      return NextResponse.json({ error: 'No valid email addresses found in club mailing list' }, { status: 400 });
    }

    // Create transporter using Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'clublyteam@gmail.com',
        pass: process.env.CLUBLY_GMAIL_APP_PASSWORD
      }
    });

    // Prepare email content
    // Use senderName in the footer
    const footerSender = senderName ? `${senderName}, ${clubName}` : clubName;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #2563eb; margin: 0;">${clubName}</h2>
          <p style="color: #6b7280; margin: 10px 0 0 0;">Club Announcement</p>
        </div>
        
        <div style="line-height: 1.6; color: #374151;">
          ${content.replace(/\n/g, '<br>')}
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
          <p>This email was sent from Clubly on behalf of <b>${footerSender}</b>.</p>
          <p>If you no longer wish to receive emails from this club, please contact the club administrator.</p>
        </div>
      </div>
    `;

    // Send emails to all recipients
    const emailPromises = validRecipients.map(async (recipient) => {
      try {
        const mailOptions = {
          from: '"Clubly Team" <clublyteam@gmail.com>',
          to: recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email,
          subject: subject,
          html: htmlContent,
          text: content // Plain text fallback
        };

        await transporter.sendMail(mailOptions);
        return { email: recipient.email, success: true };
      } catch (error) {
        console.error(`Failed to send email to ${recipient.email}:`, error);
        return { email: recipient.email, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    // Wait for all emails to be sent
    const results = await Promise.all(emailPromises);
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    return NextResponse.json({
      success: true,
      totalRecipients: validRecipients.length,
      successfulCount: successful.length,
      failedCount: failed.length,
      failedEmails: failed.map(f => ({ email: f.email, error: f.error })),
      message: `Email sent successfully to ${successful.length} recipients${failed.length > 0 ? `, ${failed.length} failed` : ''}`
    });

  } catch (error) {
    console.error('Error sending emails:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 