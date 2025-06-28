"use client";
import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import saveAs from "file-saver";

export default function AttendanceNotesResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const summary = searchParams.get("summary") || "";

  useEffect(() => {
    if (!summary) {
      // If no summary, redirect to dashboard or show a message
      router.replace("/dashboard");
    }
  }, [summary, router]);

  if (!summary) return null;

  const preview = summary.length > 200 ? summary.slice(0, 200) + "..." : summary;

  const handleDownload = async () => {
    const { Document, Packer, Paragraph, TextRun } = await import("docx");
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "Club Meeting Summary", bold: true, size: 32 }),
              ],
              spacing: { after: 300 },
            }),
            ...summary.split("\n").map(
              (line) =>
                new Paragraph({
                  children: [new TextRun({ text: line, size: 24 })],
                  spacing: { after: 100 },
                })
            ),
          ],
        },
      ],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, "meeting_summary.docx");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-gray-100 to-gray-200 px-4">
      <div className="max-w-2xl w-full bg-white/90 rounded-3xl shadow-2xl border border-gray-100 p-12 flex flex-col items-center backdrop-blur-xl" style={{marginTop: 40, marginBottom: 40}}>
        <h2 className="text-4xl font-extrabold mb-8 tracking-tight text-center drop-shadow-lg">Summary of Meeting</h2>
        <div className="w-full bg-gradient-to-r from-gray-50 to-gray-200 rounded-xl p-6 text-xl text-gray-900 mb-8 shadow-inner font-semibold text-center border border-gray-200" style={{letterSpacing: "0.01em"}}>
          {preview}
        </div>
        <div className="flex flex-row gap-8 w-full justify-center mt-2">
          <button
            className="px-8 py-3 rounded-full bg-black text-white font-bold text-lg shadow-xl hover:bg-gray-900 transition-all duration-150 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-black"
            onClick={handleDownload}
          >
            <span className="mr-2">📄</span> Download DOCX
          </button>
          <button
            className="px-8 py-3 rounded-full bg-white border-2 border-black text-black font-bold text-lg shadow-xl hover:bg-gray-100 transition-all duration-150 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-black"
            onClick={() => router.push("/dashboard")}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
} 