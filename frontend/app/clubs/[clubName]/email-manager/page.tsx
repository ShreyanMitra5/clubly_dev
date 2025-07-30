"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ProductionClubManager, ProductionClubData } from '../../../utils/productionClubManager';
import { supabase } from '../../../../utils/supabaseClient';
import ClubLayout from '../../../components/ClubLayout';

interface EmailContact {
  id: string;
  email: string;
  name?: string;
  addedAt: string;
}

export default function ClubEmailManagerPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const clubName = decodeURIComponent(params.clubName as string);
  const [clubInfo, setClubInfo] = useState<ProductionClubData | null>(null);
  const [contacts, setContacts] = useState<EmailContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (user && clubName) {
      loadClubData();
    }
  }, [user, clubName]);

  useEffect(() => {
    if (clubInfo) {
      loadContacts();
    }
  }, [clubInfo]);

  const loadClubData = async () => {
    try {
      const clubs = await ProductionClubManager.getUserClubs(user!.id);
      const club = clubs.find(c => c.clubName === clubName);
      if (club) {
        setClubInfo(club);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load club data');
      setLoading(false);
    }
  };

  const loadContacts = async () => {
    if (!clubInfo?.clubId) return;
    try {
      const { data, error } = await supabase
        .from('club_emails')
        .select('*')
        .eq('club_id', clubInfo.clubId);
      if (error) throw error;
      setContacts(data || []);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !clubInfo) return;
    
    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('clubId', clubInfo.clubId);

    try {
      const response = await fetch('/api/clubs/emails/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Successfully uploaded ${data.importedCount} contacts`);
        setSelectedFile(null);
        loadContacts(); // Reload contacts
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddContact = async () => {
    if (!newEmail || !clubInfo) return;
    try {
      const { error } = await supabase
        .from('club_emails')
        .insert([{ club_id: clubInfo.clubId, email: newEmail, name: newName || null }]);
      if (error) throw error;
      setSuccess('Contact added successfully');
      setNewEmail('');
      setNewName('');
      loadContacts();
    } catch (err) {
      setError('Failed to add contact');
    }
  };

  const handleRemoveContact = async (contactId: string) => {
    if (!clubInfo) return;
    try {
      const { error } = await supabase
        .from('club_emails')
        .delete()
        .eq('id', contactId)
        .eq('club_id', clubInfo.clubId);
      if (error) throw error;
      setSuccess('Contact removed successfully');
      loadContacts();
    } catch (err) {
      setError('Failed to remove contact');
    }
  };

  const handleSendEmail = async (subject: string, content: string) => {
    if (!clubInfo || contacts.length === 0) return;

    setSending(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/clubs/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId: clubInfo.clubId,
          clubName: clubInfo.clubName,
          subject,
          content,
          recipients: contacts.map(c => ({ email: c.email, name: c.name }))
        }),
      });

      if (response.ok) {
        setSuccess('Email sent successfully to all contacts');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to send email');
      }
    } catch (err) {
      setError('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg">Loading email manager...</div>
      </div>
    );
  }

  if (!clubInfo) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg">Club not found.</div>
      </div>
    );
  }

  return (
    <ClubLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-pulse-500 mb-2">Club Email Manager</h1>
          <p className="text-gray-600">Manage your club's mailing list and send announcements</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload CSV Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-2xl font-bold mb-6">Upload Email List</h2>
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-2">Upload CSV File</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <p className="text-sm text-gray-500 mt-2">
                  CSV should have columns: email, name (optional)
                </p>
              </div>
              <button
                onClick={handleFileUpload}
                disabled={!selectedFile || uploading}
                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload CSV'}
              </button>
            </div>
          </div>

          {/* Add Contact Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-2xl font-bold mb-6">Add Individual Contact</h2>
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-2">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="member@example.com"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Name (Optional)</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="John Doe"
                />
              </div>
              <button
                onClick={handleAddContact}
                disabled={!newEmail}
                className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Add Contact
              </button>
            </div>
          </div>
        </div>

        {/* Contact List */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold mb-6">Mailing List ({contacts.length} contacts)</h2>
          {contacts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No contacts yet. Upload a CSV or add individual contacts above.</p>
          ) : (
            <div className="space-y-2">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{contact.email}</p>
                    {contact.name && <p className="text-sm text-gray-600">{contact.name}</p>}
                  </div>
                  <button
                    onClick={() => handleRemoveContact(contact.id)}
                    className="px-3 py-1 text-red-600 hover:text-red-800 font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Send Email Section */}
        {contacts.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-2xl font-bold mb-6">Send Club Email</h2>
            <EmailComposer onSend={handleSendEmail} sending={sending} clubName={clubName} />
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push(`/clubs/${encodeURIComponent(clubName)}`)}
            className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700"
          >
            Back to Club Space
          </button>
        </div>
      </div>
    </ClubLayout>
  );
}

interface EmailComposerProps {
  onSend: (subject: string, content: string) => void;
  sending: boolean;
  clubName: string;
}

function EmailComposer({ onSend, sending, clubName }: EmailComposerProps) {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  const handleSend = () => {
    if (!subject.trim() || !content.trim()) return;
    onSend(subject, content);
    setSubject('');
    setContent('');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-semibold mb-2">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg"
          placeholder={`[${clubName}] Meeting Update`}
        />
      </div>
      <div>
        <label className="block font-semibold mb-2">Message</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg"
          rows={6}
          placeholder="Dear club members,..."
        />
      </div>
      <button
        onClick={handleSend}
        disabled={!subject.trim() || !content.trim() || sending}
        className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {sending ? 'Sending...' : 'Send Email to All Contacts'}
      </button>
    </div>
  );
} 