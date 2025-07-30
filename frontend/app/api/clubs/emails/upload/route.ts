import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

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

// Helper function to save emails for a club
async function saveClubEmails(clubId: string, emails: ClubEmails): Promise<void> {
  const emailsDir = join(process.cwd(), 'data', 'emails');
  await mkdir(emailsDir, { recursive: true });
  
  const filePath = getEmailsFilePath(clubId);
  await writeFile(filePath, JSON.stringify(emails, null, 2));
}

// Helper function to parse CSV content
function parseCSV(csvContent: string): Array<{ email: string; name?: string }> {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const emailIndex = headers.findIndex(h => h === 'email' || h === 'e-mail');
  const nameIndex = headers.findIndex(h => h === 'name' || h === 'full name' || h === 'fullname');
  
  if (emailIndex === -1) {
    throw new Error('CSV must contain an "email" column');
  }
  
  const contacts: Array<{ email: string; name?: string }> = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const email = values[emailIndex];
    const name = nameIndex !== -1 ? values[nameIndex] : undefined;
    
    if (email && email.includes('@')) {
      contacts.push({ email, name });
    }
  }
  
  return contacts;
}

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const clubId = formData.get('clubId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!clubId) {
      return NextResponse.json({ error: 'Club ID is required' }, { status: 400 });
    }

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'File must be a CSV' }, { status: 400 });
    }

    // Read the file content
    const fileBuffer = await file.arrayBuffer();
    const csvContent = new TextDecoder().decode(fileBuffer);

    // Parse CSV
    let parsedContacts: Array<{ email: string; name?: string }>;
    try {
      parsedContacts = parseCSV(csvContent);
    } catch (error) {
      return NextResponse.json({ 
        error: error instanceof Error ? error.message : 'Failed to parse CSV' 
      }, { status: 400 });
    }

    if (parsedContacts.length === 0) {
      return NextResponse.json({ error: 'No valid email addresses found in CSV' }, { status: 400 });
    }

    // Load existing contacts
    const emails = await loadClubEmails(clubId);
    const existingEmails = new Set(emails.contacts.map(c => c.email.toLowerCase()));

    // Filter out duplicates and invalid emails
    const newContacts: EmailContact[] = [];
    const skippedEmails: string[] = [];

    for (const contact of parsedContacts) {
      const email = contact.email.trim().toLowerCase();
      
      if (!isValidEmail(email)) {
        skippedEmails.push(contact.email);
        continue;
      }
      
      if (existingEmails.has(email)) {
        skippedEmails.push(contact.email);
        continue;
      }
      
      newContacts.push({
        id: uuidv4(),
        email: contact.email.trim(),
        name: contact.name?.trim() || undefined,
        addedAt: new Date().toISOString()
      });
      
      existingEmails.add(email);
    }

    // Add new contacts
    emails.contacts.push(...newContacts);
    emails.updatedAt = new Date().toISOString();

    await saveClubEmails(clubId, emails);

    return NextResponse.json({
      success: true,
      importedCount: newContacts.length,
      skippedCount: skippedEmails.length,
      skippedEmails,
      message: `Successfully imported ${newContacts.length} contacts${skippedEmails.length > 0 ? `, skipped ${skippedEmails.length} duplicates/invalid emails` : ''}`
    });

  } catch (error) {
    console.error('Error uploading CSV:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 