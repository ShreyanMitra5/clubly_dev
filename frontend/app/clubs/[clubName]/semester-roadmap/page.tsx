"use client";
console.log("=== ROADMAP PAGE LOADED ===");
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import ClubLayout from '../../../components/ClubLayout';

// Types
interface ClubConfig {
  topic: string;
  startDate: string;
  endDate: string;
  meetingFrequency: 'weekly' | 'biweekly' | 'monthly';
  meetingTime: string;
  meetingDuration: number;
  meetingDays: string[];
  clubGoals: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'meeting' | 'holiday' | 'special' | 'exam';
  description?: string;
  aiGenerated?: boolean;
  topics?: string[];
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const EVENT_COLORS = {
  meeting: { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-700' },
  holiday: { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-700' },
  special: { bg: 'bg-purple-100', border: 'border-purple-500', text: 'text-purple-700' },
  exam: { bg: 'bg-orange-100', border: 'border-orange-500', text: 'text-orange-700' }
};

export default function SemesterRoadmapPage() {
  const params = useParams();
  const { user } = useUser();
  const clubName = decodeURIComponent(params.clubName as string);
  
  console.log("=== ROADMAP COMPONENT RENDERING ===", { clubName, user: !!user });
  
  // State
  const [clubConfig, setClubConfig] = useState<ClubConfig | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(true); // Force show setup modal for testing
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(false); // Set to false for testing

  // Setup form state
  const [setupForm, setSetupForm] = useState<ClubConfig>({
    topic: '',
    startDate: '',
    endDate: '',
    meetingFrequency: 'weekly',
    meetingTime: '15:00',
    meetingDuration: 60,
    meetingDays: [],
    clubGoals: ''
  });

  // Force show setup modal for testing
  useEffect(() => {
    console.log("=== ROADMAP EFFECT RUNNING ===");
    setShowSetupModal(true);
        setLoading(false);
  }, []);

  const handleSetupSubmit = async () => {
    console.log("=== SETUP SUBMIT ===", setupForm);
    if (!user || !setupForm.topic || !setupForm.startDate || !setupForm.endDate) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      // For testing, just close the modal and show a success message
      alert("Roadmap would be generated here!");
      setShowSetupModal(false);
      setClubConfig(setupForm);
    } catch (error) {
      console.error('Error saving roadmap:', error);
      alert("Error: " + error);
    }
  };

  console.log("=== ROADMAP RENDER STATE ===", { loading, showSetupModal, clubConfig: !!clubConfig });

  if (loading) {
    return (
      <ClubLayout>
        <div className="p-8">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pulse-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading roadmap...</p>
        </div>
      </div>
      </ClubLayout>
    );
  }

  return (
    <ClubLayout>
      <div className="p-8">
        <h1 className="text-4xl font-bold text-pulse-500 mb-2">🚀 NEW ROADMAP PAGE WORKING!</h1>
        <p className="text-gray-600 mb-8">Club: {clubName}</p>
        
        {/* Setup Modal */}
        {showSetupModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-6">Set Up Your Club Roadmap</h3>

            <div className="space-y-6">
              {/* Club Topic */}
              <div>
                    <label className="block text-sm font-medium mb-2">Club Topic/Focus</label>
                <input
                  type="text"
                      value={setupForm.topic}
                      onChange={(e) => setSetupForm({ ...setupForm, topic: e.target.value })}
                      placeholder="e.g., Web Development, Machine Learning, Soccer"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500"
                />
              </div>

                  {/* School Year Dates */}
                  <div className="grid grid-cols-2 gap-4">
                <div>
                      <label className="block text-sm font-medium mb-2">School Year Start</label>
                      <input
                        type="date"
                        value={setupForm.startDate}
                        onChange={(e) => setSetupForm({ ...setupForm, startDate: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">School Year End</label>
                      <input
                        type="date"
                        value={setupForm.endDate}
                        onChange={(e) => setSetupForm({ ...setupForm, endDate: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500"
                      />
                  </div>
                </div>

                  {/* Meeting Frequency */}
                <div>
                    <label className="block text-sm font-medium mb-2">Meeting Frequency</label>
                    <select
                      value={setupForm.meetingFrequency}
                      onChange={(e) => setSetupForm({ ...setupForm, meetingFrequency: e.target.value as any })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                </div>

                  {/* Meeting Days */}
              <div>
                    <label className="block text-sm font-medium mb-2">Meeting Days</label>
                    <div className="grid grid-cols-4 gap-2">
                      {DAYS_OF_WEEK.map(day => (
              <button
                          key={day}
                          type="button"
                onClick={() => {
                            const updatedDays = setupForm.meetingDays.includes(day)
                              ? setupForm.meetingDays.filter(d => d !== day)
                              : [...setupForm.meetingDays, day];
                            setSetupForm({ ...setupForm, meetingDays: updatedDays });
                          }}
                          className={`p-2 text-sm rounded-lg border transition-colors ${
                            setupForm.meetingDays.includes(day)
                              ? 'bg-pulse-500 text-white border-pulse-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {day.slice(0, 3)}
              </button>
                      ))}
                        </div>
                            </div>

                  {/* Meeting Time & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                      <label className="block text-sm font-medium mb-2">Meeting Time</label>
                  <input
                    type="time"
                        value={setupForm.meetingTime}
                        onChange={(e) => setSetupForm({ ...setupForm, meetingTime: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500"
                  />
                </div>
                <div>
                      <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                  <input
                        type="number"
                        value={setupForm.meetingDuration}
                        onChange={(e) => setSetupForm({ ...setupForm, meetingDuration: parseInt(e.target.value) })}
                        min="15"
                        max="180"
                        step="15"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500"
                  />
                </div>
              </div>

                  {/* Club Goals */}
              <div>
                    <label className="block text-sm font-medium mb-2">Club Goals & Objectives</label>
                <textarea
                      value={setupForm.clubGoals}
                      onChange={(e) => setSetupForm({ ...setupForm, clubGoals: e.target.value })}
                      placeholder="What do you want to achieve this semester? What skills should members learn?"
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500"
                />
              </div>
              </div>

                <div className="flex gap-4 mt-8">
              <button
                    onClick={handleSetupSubmit}
                    disabled={!setupForm.topic || !setupForm.startDate || !setupForm.endDate || setupForm.meetingDays.length === 0}
                    className="flex-1 px-6 py-3 bg-pulse-500 text-white font-semibold rounded-lg hover:bg-pulse-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate Roadmap
              </button>
              <button
                    onClick={() => setShowSetupModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        </div>
      )}

        {clubConfig && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">✅ Configuration Saved!</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div><span className="font-medium">Topic:</span> {clubConfig.topic}</div>
              <div><span className="font-medium">Meetings:</span> {clubConfig.meetingFrequency} on {clubConfig.meetingDays.join(', ')}</div>
              <div><span className="font-medium">Time:</span> {clubConfig.meetingTime} ({clubConfig.meetingDuration} mins)</div>
          </div>
        </div>
      )}
          </div>
    </ClubLayout>
  );
} 