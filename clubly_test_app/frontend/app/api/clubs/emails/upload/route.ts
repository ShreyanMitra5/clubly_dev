import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
  // Clean up the CSV content - handle malformed quotes and line breaks
  let cleanContent = csvContent.trim();
  
  // Fix malformed quotes that span multiple lines
  cleanContent = cleanContent.replace(/"([^"]*)\r?\n([^"]*)"/g, '"$1$2"');
  
  const lines = cleanContent.split('\n');
  console.log('CSV lines:', lines);
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  console.log('Headers:', headers);
  
  // More comprehensive email column detection
  const emailIndex = headers.findIndex(h => 
    h === 'email' || 
    h === 'e-mail' || 
    h === 'e_mail' ||
    h === 'email address' ||
    h === 'emailaddress' ||
    h === 'mail' ||
    h === 'contact email' ||
    h === 'contactemail'
  );
  
  const nameIndex = headers.findIndex(h => 
    h === 'name' || 
    h === 'full name' || 
    h === 'fullname' ||
    h === 'first name' ||
    h === 'firstname' ||
    h === 'last name' ||
    h === 'lastname' ||
    h === 'full_name' ||
    h === 'first_name' ||
    h === 'last_name'
  );
  
  console.log('Email column index:', emailIndex, 'Name column index:', nameIndex);
  
  if (emailIndex === -1) {
    throw new Error('CSV must contain an email column. Supported column names: email, e-mail, email address, mail, contact email');
  }
  
  const contacts: Array<{ email: string; name?: string }> = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    console.log('Processing line:', line);
    
    // Handle quoted CSV values properly
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // Add the last value
    
    console.log('Parsed values:', values);
    
    const email = values[emailIndex];
    const name = nameIndex !== -1 ? values[nameIndex] : undefined;
    
    console.log('Extracted email:', email, 'name:', name);
    
    if (email && email.includes('@')) {
      // Clean up the email - remove any quotes and extra whitespace
      const cleanEmail = email.replace(/"/g, '').trim();
      if (cleanEmail && cleanEmail.includes('@')) {
        contacts.push({ email: cleanEmail, name });
        console.log('Added contact:', { email: cleanEmail, name });
      } else {
        console.log('Skipping line - no valid email after cleaning:', cleanEmail);
      }
    } else {
      console.log('Skipping line - no valid email:', email);
    }
  }
  
  console.log('Final contacts array:', contacts);
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
      console.log('Parsed contacts:', parsedContacts);
    } catch (error) {
      console.error('CSV parsing error:', error);
      return NextResponse.json({ 
        error: error instanceof Error ? error.message : 'Failed to parse CSV' 
      }, { status: 400 });
    }

    if (parsedContacts.length === 0) {
      console.log('No contacts parsed from CSV. Raw CSV content:', csvContent);
      return NextResponse.json({ error: 'No valid email addresses found in CSV' }, { status: 400 });
    }

    // Load existing contacts from Supabase (not JSON file)
    let existingEmails = new Set<string>();
    try {
      const { data: existingContacts, error } = await supabase
        .from('club_emails')
        .select('email')
        .eq('club_id', clubId);
      
      if (!error && existingContacts) {
        existingEmails = new Set(existingContacts.map(c => c.email.toLowerCase()));
      }
    } catch (error) {
      console.error('Error loading existing contacts from Supabase:', error);
    }
    
    console.log('Existing emails from Supabase:', Array.from(existingEmails));

    // Filter out duplicates and invalid emails
    const newContacts: EmailContact[] = [];
    const skippedEmails: string[] = [];

    for (const contact of parsedContacts) {
      const email = contact.email.trim().toLowerCase();
      console.log('Processing contact:', contact, 'Email:', email);
      
      if (!isValidEmail(email)) {
        console.log('Invalid email:', email);
        skippedEmails.push(contact.email);
        continue;
      }
      
      if (existingEmails.has(email)) {
        console.log('Duplicate email:', email);
        skippedEmails.push(contact.email);
        continue;
      }
      
      console.log('Adding new contact:', contact);
      newContacts.push({
        id: uuidv4(),
        email: contact.email.trim(),
        name: contact.name?.trim() || undefined,
        addedAt: new Date().toISOString()
      });
      
      existingEmails.add(email);
    }
    
    console.log('Final results - New contacts:', newContacts.length, 'Skipped:', skippedEmails.length);

    // Save to Supabase database
    if (newContacts.length > 0) {
      try {
        const supabaseContacts = newContacts.map(contact => ({
          club_id: clubId,
          email: contact.email,
          name: contact.name || null
        }));

        const { error: supabaseError } = await supabase
          .from('club_emails')
          .insert(supabaseContacts);

        if (supabaseError) {
          console.error('Error saving to Supabase:', supabaseError);
          throw new Error(`Failed to save to database: ${supabaseError.message}`);
        }
        
        console.log('Successfully saved to Supabase:', supabaseContacts);
      } catch (supabaseError) {
        console.error('Error saving to Supabase:', supabaseError);
        throw new Error(`Failed to save contacts: ${supabaseError}`);
      }
    }

    return NextResponse.json({
      success: true,
      importedCount: newContacts.length,
      skippedCount: skippedEmails.length,
      skippedEmails,
      existingEmails: Array.from(existingEmails),
      message: `Successfully imported ${newContacts.length} contacts${skippedEmails.length > 0 ? `, skipped ${skippedEmails.length} duplicates/invalid emails` : ''}`
    });

  } catch (error) {
    console.error('Error uploading CSV:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 