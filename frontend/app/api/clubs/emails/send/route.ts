import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabaseServer } from '../../../../../utils/supabaseServer';

interface Recipient {
  email: string;
  name?: string;
}



interface SendEmailRequest {
  clubId: string;
  clubName: string;
  senderName?: string;
  subject: string;
  content: string;
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

    // Load club's email list from Supabase
    let contacts: Array<{ email: string; name?: string }> = [];
    try {
      const { data, error } = await supabaseServer
        .from('club_emails')
        .select('email, name')
        .eq('club_id', clubId);
      
      if (error) {
        console.error('Error loading club emails:', error);
        contacts = [];
      } else {
        contacts = data || [];
      }
    } catch (error) {
      console.error('Error loading club emails:', error);
      contacts = [];
    }
    
    const recipients = contacts.map(contact => ({
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
    
    // Use the content as-is from Groq - it should already be properly formatted
    let processedContent = content || '';
    
    // Log the original content for debugging
    console.log('Original email content:', JSON.stringify(content));

    // Build HTML with paragraphs and clickable links
    const urlRegex = /(https?:\/\/[^\s)]+)/g;
    const paragraphs = processedContent
      .trim()
      .split(/\n{2,}/)
      .map(p => p
        .replace(urlRegex, '<a href="$1" style="color: #2563eb; text-decoration: underline; white-space: nowrap; word-break: keep-all;" target="_blank">$1</a>')
        .replace(/\n/g, '<br/>')
      );
    const htmlContent = paragraphs.map(p => `<p style="margin: 0 0 12px 0;">${p}</p>`).join('');
    
    // Log the processed content for debugging
    console.log('Processed email content:', JSON.stringify(processedContent));
    
    const emailHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #2563eb; margin: 0;">${clubName}</h2>
          <p style="color: #6b7280; margin: 10px 0 0 0;">Club Announcement</p>
        </div>
        
        <div style="line-height: 1.8; color: #374151; white-space: pre-wrap; font-family: Arial, sans-serif; font-size: 14px; background-color: #ffffff; padding: 20px; border-radius: 4px;">
          ${htmlContent}
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
          html: emailHtmlContent,
          text: processedContent // Plain text fallback with corrected spacing
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