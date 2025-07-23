import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

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
  const filePath = getEmailsFilePath(clubId);
  await writeFile(filePath, JSON.stringify(emails, null, 2));
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string; contactId: string }> }
) {
  try {
    const { clubId, contactId } = await params;

    if (!clubId) {
      return NextResponse.json({ error: 'Club ID is required' }, { status: 400 });
    }

    if (!contactId) {
      return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 });
    }

    const emails = await loadClubEmails(clubId);

    // Find and remove the contact
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