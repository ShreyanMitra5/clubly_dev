"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Modal from 'react-modal';
import ReactMarkdown from 'react-markdown';

export default function HistoryPage() {
  const { user } = useUser();
  const [history, setHistory] = useState<any[]>([]);
  const [meetingNotes, setMeetingNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [selectedNote, setSelectedNote] = useState<any | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/presentations/history?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setHistory(data.history || []);
        setLoading(false);
      });
    fetch(`/api/attendance-notes/history?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setMeetingNotes(data.history || []);
        setLoadingNotes(false);
      });
  }, [user]);

  if (!user) return <div className="p-8">Please sign in to view your history.</div>;
  if (loading && loadingNotes) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Your Presentation History</h1>
      {history.length === 0 ? (
        <div>No presentations found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {history.map((item, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-4 flex flex-col">
              <div className="font-bold text-lg mb-2 truncate">{item.description || "Untitled"}</div>
              <div className="w-full h-32 bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
                <img
                  src={item.thumbnailUrl || "/logo.png"}
                  alt="Presentation thumbnail"
                  className="object-contain h-full"
                />
              </div>
              <div className="text-gray-600 text-sm mb-2">{item.generatedAt && new Date(item.generatedAt).toLocaleString()}</div>
              <div className="flex-1 mb-2 text-gray-700 truncate">{item.description}</div>
              <div className="flex gap-2 mt-auto">
                <a
                  href={item.viewerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                >
                  View Online
                </a>
                <a
                  href={item.s3Url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-200 text-black px-3 py-1 rounded hover:bg-gray-300 text-sm"
                >
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Meeting Summaries Section */}
      <h2 className="text-2xl font-bold mt-16 mb-6">Your Meeting Summaries</h2>
      {meetingNotes.length === 0 ? (
        <div>No meeting summaries found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {meetingNotes.map((note, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg shadow p-4 flex flex-col cursor-pointer hover:shadow-lg transition"
              onClick={() => setSelectedNote(note)}
            >
              <div className="font-bold text-lg mb-2 truncate">{note.clubName || 'Meeting'}</div>
              <div className="text-gray-600 text-sm mb-2">{note.createdAt && new Date(note.createdAt).toLocaleString()}</div>
              <div className="flex-1 mb-2 text-gray-700 truncate">{note.summary ? (note.summary.length > 120 ? note.summary.slice(0, 120) + '...' : note.summary) : ''}</div>
              <div className="mt-auto text-blue-600 text-sm font-medium">View</div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for viewing meeting note */}
      <Modal
        isOpen={!!selectedNote}
        onRequestClose={() => setSelectedNote(null)}
        contentLabel="View Meeting Note"
        ariaHideApp={false}
        className="fixed inset-0 flex items-center justify-center z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-40 z-40"
      >
        {selectedNote && (
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative flex flex-col">
            <button
              onClick={() => setSelectedNote(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-1">{selectedNote.createdAt && new Date(selectedNote.createdAt).toLocaleString()}</div>
              <div className="text-2xl font-bold text-black mb-2">{selectedNote.clubName || 'Meeting Summary'}</div>
            </div>
            <div className="mb-6">
              <div className="font-semibold mb-2 text-gray-700">Summary</div>
              <div className="prose prose-blue bg-gray-50 rounded p-4 mb-4 max-h-60 overflow-y-auto">
                <ReactMarkdown>{selectedNote.summary}</ReactMarkdown>
              </div>
              <div className="font-semibold mb-2 text-gray-700">Full Transcript</div>
              <div className="whitespace-pre-line text-gray-800 text-sm bg-gray-50 rounded p-4 max-h-40 overflow-y-auto">{selectedNote.transcript}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
} 