"use client";
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubName: string;
  clubId: string;
  type: 'presentation' | 'summary';
  content: string;
  presentationUrl?: string;
  title?: string;
}

export default function EmailModal({ 
  isOpen, 
  onClose, 
  clubName, 
  clubId, 
  type, 
  content, 
  presentationUrl,
  title 
}: EmailModalProps) {
  const { user } = useUser();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Helper to normalize body text for readability in the textarea
  const normalizeBody = (raw: string): string => {
    // Just return the text as-is to preserve URL integrity
    return raw || '';
  };

  // Generate email content when modal opens
  useEffect(() => {
    if (isOpen && content) {
      generateEmailContent();
    }
  }, [isOpen, content, type, clubName, presentationUrl]);

  const generateEmailContent = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/emails/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          clubName,
          content,
          presentationUrl
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSubject(data.subject);
        setBody(data.body);
      } else {
        throw new Error('Failed to generate email content');
      }
    } catch (error) {
      console.error('Error generating email content:', error);
      setError('Failed to generate email content. Please fill in manually.');
      
      // Set fallback content
      if (type === 'presentation') {
        setSubject(`🚀 New ${clubName} Presentation Available!`);
        setBody(`Hey everyone!\n\nI'm excited to share our latest ${clubName} presentation: "${title || 'Latest Update'}"\n\nCheck it out here:\n\n${presentationUrl || 'Available upon request'}\n\nLooking forward to your thoughts!\n\nCheers,\n${clubName} Team`);
      } else {
        setSubject(`📝 Highlights from our ${clubName} meeting!`);
        setBody(`Hey everyone!\n\nI wanted to share some highlights from our latest ${clubName} meeting:\n\n**What We Covered:**\n${content}\n\n**Key Takeaways:**\nLots of valuable insights and discussions!\n\nLooking forward to seeing everyone at our next meeting!\n\nCheers,\n${clubName} Team`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      setError('Please fill in both subject and body');
      return;
    }

    setSending(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/clubs/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId,
          clubName,
          senderName: user?.fullName || user?.firstName,
          subject: subject.trim(),
          content: body.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Email sent successfully to ${data.successfulCount} recipients!`);
        setTimeout(() => {
          onClose();
          setSuccess('');
        }, 2000);
      } else {
        throw new Error(data.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setError(error instanceof Error ? error.message : 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Send Email - {type === 'presentation' ? 'Presentation' : 'Meeting Summary'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Send to all {clubName} club members
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Email subject..."
              disabled={loading}
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="Email body..."
              disabled={loading}
            />
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-700">
                <p className="font-medium">Email will be sent to all club members</p>
                <p className="mt-1">
                  {type === 'presentation' 
                    ? 'The presentation link will be included in the email.'
                    : 'The full meeting summary will be included in the email.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-green-700">{success}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={sending}
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || loading || !subject.trim() || !body.trim()}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Send Email</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 