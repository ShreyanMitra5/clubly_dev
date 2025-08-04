import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../../../utils/supabaseServer';
import { v4 as uuidv4 } from 'uuid';

interface EmailContact {
  id: string;
  email: string;
  name?: string;
  addedAt: string;
}

// Helper function to load existing emails from Supabase
async function loadClubEmails(clubId: string): Promise<EmailContact[]> {
  try {
    const { data, error } = await supabaseServer
      .from('club_emails')
      .select('*')
      .eq('club_id', clubId);
    
    if (error) {
      console.error('Error loading club emails:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error loading club emails:', error);
    return [];
  }
}

// Helper function to save emails to Supabase
async function saveEmailsToSupabase(clubId: string, contacts: EmailContact[]): Promise<void> {
  try {
    // Insert all new contacts
    const { error } = await supabaseServer
      .from('club_emails')
      .insert(contacts.map(contact => ({
        club_id: clubId,
        email: contact.email,
        name: contact.name,
        added_at: contact.addedAt
      })));
    
    if (error) {
      console.error('Error saving emails to Supabase:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error saving emails to Supabase:', error);
    throw error;
  }
}

// Helper function to parse CSV content
function parseCSV(csvContent: string): Array<{ email: string; name?: string }> {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  // More flexible email column matching (case-insensitive)
  const emailIndex = headers.findIndex(h => 
    h.toLowerCase() === 'email' || 
    h.toLowerCase() === 'e-mail' || 
    h.toLowerCase() === 'e_mail' ||
    h.toLowerCase() === 'email address' ||
    h.toLowerCase() === 'emailaddress'
  );
  
  // More flexible name column matching (case-insensitive)
  const nameIndex = headers.findIndex(h => 
    h.toLowerCase() === 'name' || 
    h.toLowerCase() === 'full name' || 
    h.toLowerCase() === 'fullname' ||
    h.toLowerCase() === 'first name' ||
    h.toLowerCase() === 'firstname' ||
    h.toLowerCase() === 'full_name'
  );
  
  if (emailIndex === -1) {
    throw new Error(`CSV must contain an email column. Found columns: ${headers.join(', ')}`);
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
      console.log('CSV parsed successfully:', parsedContacts.length, 'contacts found');
    } catch (error) {
      console.error('CSV parsing error:', error);
      return NextResponse.json({ 
        error: error instanceof Error ? error.message : 'Failed to parse CSV' 
      }, { status: 400 });
    }

    if (parsedContacts.length === 0) {
      console.log('No contacts found in CSV. Content preview:', csvContent.substring(0, 200));
      return NextResponse.json({ error: 'No valid email addresses found in CSV' }, { status: 400 });
    }

    // Load existing contacts from Supabase
    const existingEmails = await loadClubEmails(clubId);
    console.log('Loaded existing emails:', existingEmails.length, 'contacts');
    console.log('Existing email addresses:', existingEmails.map(c => c.email));
    
    const existingEmailSet = new Set(existingEmails.map(c => c.email.toLowerCase()));

    // Filter out duplicates and invalid emails
    const newContacts: EmailContact[] = [];
    const skippedEmails: string[] = [];

    console.log('Processing', parsedContacts.length, 'contacts');
    console.log('Existing emails:', Array.from(existingEmailSet));

    for (const contact of parsedContacts) {
      const email = contact.email.trim().toLowerCase();
      console.log('Processing contact:', { original: contact.email, normalized: email, name: contact.name });
      
      if (!isValidEmail(email)) {
        console.log('Invalid email format:', email);
        skippedEmails.push(contact.email);
        continue;
      }
      
      // Allow duplicates - just skip the duplicate check
      // if (existingEmailSet.has(email)) {
      //   console.log('Duplicate email found:', email);
      //   skippedEmails.push(contact.email);
      //   continue;
      // }
      
      console.log('Adding new contact:', email);
      newContacts.push({
        id: uuidv4(),
        email: contact.email.trim(),
        name: contact.name?.trim() || undefined,
        addedAt: new Date().toISOString()
      });
      
      existingEmailSet.add(email);
    }

    console.log('Final results:', { newContacts: newContacts.length, skippedEmails: skippedEmails.length });

    // Save new contacts to Supabase
    if (newContacts.length > 0) {
      await saveEmailsToSupabase(clubId, newContacts);
    }

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