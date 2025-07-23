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

function getEmailsFilePath(clubId: string): string {
  const emailsDir = join(process.cwd(), 'data', 'emails');
  return join(emailsDir, `${clubId}.json`);
}

async function loadClubEmails(clubId: string): Promise<ClubEmails> {
  try {
    const filePath = getEmailsFilePath(clubId);
    const fileContent = await readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    return {
      clubId,
      contacts: [],
      updatedAt: new Date().toISOString()
    };
  }
}

async function saveClubEmails(clubId: string, emails: ClubEmails): Promise<void> {
  const emailsDir = join(process.cwd(), 'data', 'emails');
  await mkdir(emailsDir, { recursive: true });
  const filePath = getEmailsFilePath(clubId);
  await writeFile(filePath, JSON.stringify(emails, null, 2));
}

export async function GET(request: NextRequest, context: { params: Promise<{ clubId: string }> }) {
  try {
    const { clubId } = await context.params;
    if (!clubId) {
      return NextResponse.json({ error: 'Club ID is required' }, { status: 400 });
    }
    const emails = await loadClubEmails(clubId);
    return NextResponse.json({
      contacts: emails.contacts,
      total: emails.contacts.length
    });
  } catch (error) {
    console.error('Error fetching club emails:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ clubId: string }> }) {
  try {
    const { clubId } = await context.params;
    const body = await request.json();
    const { email, name } = body;
    if (!clubId) {
      return NextResponse.json({ error: 'Club ID is required' }, { status: 400 });
    }
    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    const emails = await loadClubEmails(clubId);
    const existingContact = emails.contacts.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (existingContact) {
      return NextResponse.json({ error: 'Email already exists in this club\'s mailing list' }, { status: 409 });
    }
    const newContact: EmailContact = {
      id: uuidv4(),
      email: email.trim(),
      name: name?.trim() || undefined,
      addedAt: new Date().toISOString()
    };
    emails.contacts.push(newContact);
    emails.updatedAt = new Date().toISOString();
    await saveClubEmails(clubId, emails);
    return NextResponse.json({
      success: true,
      contact: newContact,
      message: 'Contact added successfully'
    });
  } catch (error) {
    console.error('Error adding club email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ clubId: string }> }) {
  try {
    const { clubId } = await context.params;
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('contactId');
    if (!clubId) {
      return NextResponse.json({ error: 'Club ID is required' }, { status: 400 });
    }
    if (!contactId) {
      return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 });
    }
    const emails = await loadClubEmails(clubId);
    const contactIndex = emails.contacts.findIndex(c => c.id === contactId);
    if (contactIndex === -1) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }
    const removedContact = emails.contacts.splice(contactIndex, 1)[0];
    emails.updatedAt = new Date().toISOString();
    await saveClubEmails(clubId, emails);
    return NextResponse.json({
      success: true,
      message: 'Contact removed successfully',
      removedContact
    });
  } catch (error) {
    console.error('Error removing club email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 