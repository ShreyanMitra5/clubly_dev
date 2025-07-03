"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function HistoryPage() {
  const { user } = useUser();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/presentations/history?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setHistory(data.history || []);
        setLoading(false);
      });
  }, [user]);

  if (!user) return <div className="p-8">Please sign in to view your history.</div>;
  if (loading) return <div className="p-8">Loading...</div>;

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
    </div>
  );
} 