"use client";
import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { ProductionClubManager, ProductionClubData } from '../../../utils/productionClubManager';
import { v4 as uuidv4 } from 'uuid';

// --- Types ---
interface Semester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface ClubEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'meeting' | 'special' | 'holiday';
  description?: string;
  location?: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  topic?: string;
  semesterId: string;
}

interface Holiday {
  date: string;
  name: string;
  type: 'federal' | 'academic';
}

interface RoadmapData {
  semesters: Semester[];
  events: ClubEvent[];
  settings: {
    clubTopic: string;
    meetingFrequency: 'weekly' | 'biweekly' | 'monthly';
    meetingDays: string[];
    meetingTime: string;
    meetingEndTime: string;
    meetingDuration: number; // in minutes
  };
}

// --- Holiday Data ---
const US_HOLIDAYS: Holiday[] = [
  // 2024 holidays
  { date: '2024-01-01', name: 'New Year\'s Day', type: 'federal' },
  { date: '2024-01-15', name: 'Martin Luther King Jr. Day', type: 'federal' },
  { date: '2024-02-19', name: 'Presidents\' Day', type: 'federal' },
  { date: '2024-05-27', name: 'Memorial Day', type: 'federal' },
  { date: '2024-07-04', name: 'Independence Day', type: 'federal' },
  { date: '2024-09-02', name: 'Labor Day', type: 'federal' },
  { date: '2024-10-14', name: 'Columbus Day', type: 'federal' },
  { date: '2024-11-11', name: 'Veterans Day', type: 'federal' },
  { date: '2024-11-28', name: 'Thanksgiving Day', type: 'federal' },
  { date: '2024-12-25', name: 'Christmas Day', type: 'federal' },
  // 2025 holidays
  { date: '2025-01-01', name: 'New Year\'s Day', type: 'federal' },
  { date: '2025-01-20', name: 'Martin Luther King Jr. Day', type: 'federal' },
  { date: '2025-02-17', name: 'Presidents\' Day', type: 'federal' },
  { date: '2025-05-26', name: 'Memorial Day', type: 'federal' },
  { date: '2025-07-04', name: 'Independence Day', type: 'federal' },
  { date: '2025-09-01', name: 'Labor Day', type: 'federal' },
  { date: '2025-10-13', name: 'Columbus Day', type: 'federal' },
  { date: '2025-11-11', name: 'Veterans Day', type: 'federal' },
  { date: '2025-11-27', name: 'Thanksgiving Day', type: 'federal' },
  { date: '2025-12-25', name: 'Christmas Day', type: 'federal' },
  // Additional academic holidays
  { date: '2024-03-25', name: 'Spring Break', type: 'academic' },
  { date: '2024-03-26', name: 'Spring Break', type: 'academic' },
  { date: '2024-03-27', name: 'Spring Break', type: 'academic' },
  { date: '2024-03-28', name: 'Spring Break', type: 'academic' },
  { date: '2024-03-29', name: 'Spring Break', type: 'academic' },
  { date: '2024-11-25', name: 'Thanksgiving Break', type: 'academic' },
  { date: '2024-11-26', name: 'Thanksgiving Break', type: 'academic' },
  { date: '2024-11-27', name: 'Thanksgiving Break', type: 'academic' },
  { date: '2024-12-23', name: 'Winter Break', type: 'academic' },
  { date: '2024-12-24', name: 'Winter Break', type: 'academic' },
  { date: '2024-12-26', name: 'Winter Break', type: 'academic' },
  { date: '2024-12-27', name: 'Winter Break', type: 'academic' },
  { date: '2024-12-30', name: 'Winter Break', type: 'academic' },
  { date: '2024-12-31', name: 'Winter Break', type: 'academic' },
  // 2025 academic holidays
  { date: '2025-03-24', name: 'Spring Break', type: 'academic' },
  { date: '2025-03-25', name: 'Spring Break', type: 'academic' },
  { date: '2025-03-26', name: 'Spring Break', type: 'academic' },
  { date: '2025-03-27', name: 'Spring Break', type: 'academic' },
  { date: '2025-03-28', name: 'Spring Break', type: 'academic' },
  { date: '2025-11-24', name: 'Thanksgiving Break', type: 'academic' },
  { date: '2025-11-25', name: 'Thanksgiving Break', type: 'academic' },
  { date: '2025-11-26', name: 'Thanksgiving Break', type: 'academic' },
  { date: '2025-12-22', name: 'Winter Break', type: 'academic' },
  { date: '2025-12-23', name: 'Winter Break', type: 'academic' },
  { date: '2025-12-24', name: 'Winter Break', type: 'academic' },
  { date: '2025-12-26', name: 'Winter Break', type: 'academic' },
  { date: '2025-12-29', name: 'Winter Break', type: 'academic' },
  { date: '2025-12-30', name: 'Winter Break', type: 'academic' },
  { date: '2025-12-31', name: 'Winter Break', type: 'academic' },
];

// --- Main Component ---
export default function SemesterRoadmapPage() {
  const { user } = useUser();
  const params = useParams();
  const router = useRouter();
  const clubName = decodeURIComponent(params.clubName as string);
  
  // State
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [clubInfo, setClubInfo] = useState<ProductionClubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [activeSemester, setActiveSemester] = useState<Semester | null>(null);

  // Setup form state
  const [setupData, setSetupData] = useState({
    clubTopic: '',
    firstSemesterStart: '',
    firstSemesterEnd: '',
    secondSemesterStart: '',
    secondSemesterEnd: '',
    meetingFrequency: 'weekly' as const,
    meetingDays: [] as string[],
    meetingTime: '18:00',
    meetingEndTime: '20:00',
    meetingDuration: 120,
  });

  const calendarRef = useRef<any>(null);

  // --- Effects ---
  useEffect(() => {
    if (!user || !clubName) return;
    
    const loadData = async () => {
      try {
        const clubs = await ProductionClubManager.getUserClubs(user.id);
        const club = clubs.find(c => c.clubName === clubName);
        setClubInfo(club || null);
        
        if (club) {
          const response = await fetch(`/api/clubs/${club.clubId}/roadmap`);
          const data = await response.json();
          
          if (data.roadmap && data.roadmap.data) {
            const roadmapData = data.roadmap.data;
            // Handle backward compatibility - check if roadmap has new structure
            if (roadmapData.semesters && Array.isArray(roadmapData.semesters)) {
              // Ensure meetings are generated for existing roadmap
              const updatedRoadmap = ensureMeetingsGenerated(roadmapData, club.clubName);
              setRoadmapData(updatedRoadmap);
              const activeSem = updatedRoadmap.semesters.find((s: Semester) => s.isActive);
              setActiveSemester(activeSem || updatedRoadmap.semesters[0]);
            } else {
              // Old roadmap structure - show setup to migrate
              console.log('Old roadmap structure detected, showing setup');
              setShowSetup(true);
            }
          } else {
            setShowSetup(true);
          }
        } else {
          setShowSetup(true);
        }
      } catch (error) {
        console.error('Error loading roadmap:', error);
        setShowSetup(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, clubName]);

  // Ensure meetings are generated for existing roadmap data
  const ensureMeetingsGenerated = (roadmap: RoadmapData, clubName: string): RoadmapData => {
    const updatedEvents = [...roadmap.events];
    
    // Check if meetings exist for each semester
    roadmap.semesters.forEach(semester => {
      const semesterMeetings = roadmap.events.filter(event => 
        event.semesterId === semester.id && event.type === 'meeting'
      );
      
      // If no meetings exist for this semester, generate them
      if (semesterMeetings.length === 0 && roadmap.settings) {
        const meetings = generateMeetingEventsForSemester(semester, roadmap.settings, clubName);
        updatedEvents.push(...meetings);
      }
    });
    
    return {
      ...roadmap,
      events: updatedEvents
    };
  };

  // Generate meetings for a specific semester
  const generateMeetingEventsForSemester = (semester: Semester, settings: RoadmapData['settings'], clubName: string): ClubEvent[] => {
    const events: ClubEvent[] = [];
    const { meetingFrequency, meetingDays, meetingTime, meetingEndTime, meetingDuration } = settings;
    
    let currentDate = new Date(semester.startDate + 'T00:00:00');
    const endDate = new Date(semester.endDate + 'T23:59:59');
    const [startHours, startMinutes] = meetingTime.split(':').map(Number);
    const [endHours, endMinutes] = meetingEndTime.split(':').map(Number);
    
    const dayMap: { [key: string]: number } = {
      'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5
    };

    let weekCounter = 0;
    
    while (currentDate <= endDate) {
      const dayName = Object.keys(dayMap).find(key => dayMap[key] === currentDate.getDay());
      
      if (meetingDays.includes(dayName!) && !shouldSkipDate(currentDate)) {
        // Check frequency
        let shouldAdd = false;
        if (meetingFrequency === 'weekly') {
          shouldAdd = true;
        } else if (meetingFrequency === 'biweekly') {
          shouldAdd = weekCounter % 2 === 0;
        } else if (meetingFrequency === 'monthly') {
          shouldAdd = currentDate.getDate() <= 7; // First week of month
        }

        if (shouldAdd) {
          const startDate = new Date(currentDate);
          startDate.setHours(startHours, startMinutes, 0, 0);
          
          const endDate = new Date(currentDate);
          endDate.setHours(endHours, endMinutes, 0, 0);
          
          const meetingEvent = {
            id: uuidv4(),
            title: `${clubName} Meeting`,
            start: startDate,
            end: endDate,
            type: 'meeting' as const,
            backgroundColor: '#3B82F6',
            borderColor: '#2563EB',
            textColor: '#FFFFFF',
            semesterId: semester.id,
          };
          
          events.push(meetingEvent);
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
      if (currentDate.getDay() === 1) weekCounter++; // Monday = start of week
    }

    return events;
  };

  // --- Helper Functions ---
  const isHoliday = (date: Date): Holiday | null => {
    const dateStr = date.toISOString().split('T')[0]; // Format for US_HOLIDAYS
    return US_HOLIDAYS.find(h => h.date === dateStr) || null;
  };

  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const shouldSkipDate = (date: Date): boolean => {
    return isHoliday(date) !== null || isWeekend(date);
  };

  // Get filtered events for the active semester
  const getFilteredEvents = (): ClubEvent[] => {
    if (!roadmapData || !activeSemester) return [];
    
    return roadmapData.events.filter(event => {
      const eventDate = new Date(event.start);
      const semesterStart = new Date(activeSemester.startDate);
      const semesterEnd = new Date(activeSemester.endDate);
      
      return event.semesterId === activeSemester.id && 
             eventDate >= semesterStart && 
             eventDate <= semesterEnd;
    });
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date): ClubEvent[] => {
    if (!roadmapData || !activeSemester) return [];
    
    const dateStr = date.toISOString().split('T')[0];
    
    const events = roadmapData.events.filter(event => {
      const eventDate = new Date(event.start);
      const eventDateStr = eventDate.toISOString().split('T')[0];
      
      return event.semesterId === activeSemester.id && eventDateStr === dateStr;
    });

    return events;
  };

  // Update selected date when active semester changes
  useEffect(() => {
    if (activeSemester) {
      setSelectedDate(new Date(activeSemester.startDate));
    }
  }, [activeSemester]);

  // Right-click context menu state
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    date: Date | null;
  }>({
    show: false,
    x: 0,
    y: 0,
    date: null,
  });

  // Event editing state
  const [editingEvent, setEditingEvent] = useState<ClubEvent | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    startTime: '',
    endTime: '',
    eventType: 'meeting' as 'meeting' | 'special' | 'holiday',
    description: '',
    location: '',
  });

  // Reset confirmation state
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [backupRoadmap, setBackupRoadmap] = useState<RoadmapData | null>(null);

  const addHolidayEvents = (semester: Semester): ClubEvent[] => {
    const events: ClubEvent[] = [];
    const startDate = new Date(semester.startDate);
    const endDate = new Date(semester.endDate);
    
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const holiday = isHoliday(currentDate);
      if (holiday) {
        events.push({
          id: uuidv4(),
          title: holiday.name,
          start: new Date(currentDate),
          end: new Date(currentDate),
          type: 'holiday',
          backgroundColor: '#EF4444',
          borderColor: '#DC2626',
          textColor: '#FFFFFF',
          semesterId: semester.id,
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return events;
  };

  // --- Event Handlers ---
  const handleSetupSubmit = async () => {
    if (!clubInfo) return;

    // Create semesters
    const firstSemester: Semester = {
      id: uuidv4(),
      name: 'Fall Semester',
      startDate: setupData.firstSemesterStart,
      endDate: setupData.firstSemesterEnd,
      isActive: true,
    };

    const secondSemester: Semester = {
      id: uuidv4(),
      name: 'Spring Semester',
      startDate: setupData.secondSemesterStart,
      endDate: setupData.secondSemesterEnd,
      isActive: false,
    };

    // Generate events for both semesters
    const firstSemesterEvents = [
      ...generateMeetingEventsForSemester(firstSemester, setupData, clubName),
      ...addHolidayEvents(firstSemester),
    ];

    const secondSemesterEvents = [
      ...generateMeetingEventsForSemester(secondSemester, setupData, clubName),
      ...addHolidayEvents(secondSemester),
    ];

    const newRoadmapData: RoadmapData = {
      semesters: [firstSemester, secondSemester],
      events: [...firstSemesterEvents, ...secondSemesterEvents],
      settings: {
        clubTopic: setupData.clubTopic,
        meetingFrequency: setupData.meetingFrequency,
        meetingDays: setupData.meetingDays,
        meetingTime: setupData.meetingTime,
        meetingEndTime: setupData.meetingEndTime,
        meetingDuration: setupData.meetingDuration,
      },
    };

    await saveRoadmap(newRoadmapData);
    setRoadmapData(newRoadmapData);
    setActiveSemester(firstSemester);
    setShowSetup(false);
  };

  const saveRoadmap = async (data: RoadmapData) => {
    if (!user || !clubInfo) return;

    try {
      const response = await fetch(`/api/clubs/${clubInfo.clubId}/roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roadmap: data })
      });

      if (!response.ok) {
        throw new Error('Failed to save roadmap');
      }

      console.log('Roadmap saved successfully');
    } catch (error) {
      console.error('Error saving roadmap:', error);
      throw error;
    }
  };

  const handleEventSelect = (event: ClubEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  // Event editing functions
  const openEditEvent = (event: ClubEvent) => {
    setEditingEvent(event);
    setEditForm({
      title: event.title,
      startTime: event.start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      endTime: event.end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      eventType: event.type,
      description: event.description || '',
      location: event.location || '',
    });
    setShowEditModal(true);
    setShowEventModal(false);
  };

  const saveEditedEvent = () => {
    if (!editingEvent || !roadmapData) return;

    const [startHour, startMinute] = editForm.startTime.split(':').map(Number);
    const [endHour, endMinute] = editForm.endTime.split(':').map(Number);

    const updatedEvent: ClubEvent = {
      ...editingEvent,
      title: editForm.title,
      start: new Date(editingEvent.start.setHours(startHour, startMinute, 0, 0)),
      end: new Date(editingEvent.start.setHours(endHour, endMinute, 0, 0)),
      type: editForm.eventType,
      description: editForm.description,
      location: editForm.location,
      backgroundColor: getEventColor(editForm.eventType).backgroundColor,
      borderColor: getEventColor(editForm.eventType).borderColor,
      textColor: getEventColor(editForm.eventType).textColor,
    };

    // Check if this is a new event or existing event
    const existingEventIndex = roadmapData.events.findIndex(event => event.id === editingEvent.id);
    
    let updatedEvents;
    if (existingEventIndex >= 0) {
      // Update existing event
      updatedEvents = roadmapData.events.map(event => 
        event.id === editingEvent.id ? updatedEvent : event
      );
    } else {
      // Add new event
      updatedEvents = [...roadmapData.events, updatedEvent];
    }

    const updatedRoadmap = { ...roadmapData, events: updatedEvents };
    setRoadmapData(updatedRoadmap);
    saveRoadmap(updatedRoadmap);
    setShowEditModal(false);
    setEditingEvent(null);
  };

  const deleteEvent = (eventId: string) => {
    if (!roadmapData) return;

    const updatedEvents = roadmapData.events.filter(event => event.id !== eventId);
    const updatedRoadmap = { ...roadmapData, events: updatedEvents };
    setRoadmapData(updatedRoadmap);
    saveRoadmap(updatedRoadmap);
    setShowEditModal(false);
    setShowEventModal(false);
    setEditingEvent(null);
  };

  const handleResetRoadmap = () => {
    if (!roadmapData) return;
    
    // Backup current roadmap
    setBackupRoadmap(roadmapData);
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    setShowSetup(true);
    setRoadmapData(null);
    setActiveSemester(null);
    setShowResetConfirm(false);
  };

  const undoReset = () => {
    if (backupRoadmap) {
      setRoadmapData(backupRoadmap);
      setActiveSemester(backupRoadmap.semesters.find(s => s.isActive) || backupRoadmap.semesters[0]);
      setShowSetup(false);
      setBackupRoadmap(null);
    }
    setShowResetConfirm(false);
  };

  // Auto-dismiss notification after 3 seconds
  useEffect(() => {
    if (backupRoadmap && !showResetConfirm) {
      const timer = setTimeout(() => {
        setBackupRoadmap(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [backupRoadmap, showResetConfirm]);

  const getEventColor = (eventType: 'meeting' | 'special' | 'holiday') => {
    switch (eventType) {
      case 'meeting':
        return { backgroundColor: '#3B82F6', borderColor: '#2563EB', textColor: '#FFFFFF' };
      case 'special':
        return { backgroundColor: '#10B981', borderColor: '#059669', textColor: '#FFFFFF' };
      case 'holiday':
        return { backgroundColor: '#EF4444', borderColor: '#DC2626', textColor: '#FFFFFF' };
      default:
        return { backgroundColor: '#6B7280', borderColor: '#4B5563', textColor: '#FFFFFF' };
    }
  };

  // --- Calendar Localizer ---
  // This section is no longer needed as we are not using ReactBigCalendar
  // The calendar implementation below is a placeholder and will need to be replaced
  // with a proper calendar component (e.g., react-calendar, full-calendar, etc.)
  // For now, we'll just display the current month and allow navigation.

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your semester roadmap...</p>
        </div>
      </div>
    );
  }

  // --- Setup Modal ---
  if (showSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Plan Your Semester</h1>
            <p className="text-gray-600">Set up your {clubName} semester roadmap with intelligent scheduling</p>
          </div>

          <div className="space-y-6">
            {/* Club Topic */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Club Topic</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Artificial Intelligence, Robotics, Finance..."
                value={setupData.clubTopic}
                onChange={(e) => setSetupData({...setupData, clubTopic: e.target.value})}
              />
            </div>

            {/* Semester Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Fall Semester</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={setupData.firstSemesterStart}
                      onChange={(e) => setSetupData({...setupData, firstSemesterStart: e.target.value})}
                    />
                    <p className="text-xs text-gray-500 mt-1">Set the start date for the semester</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={setupData.firstSemesterEnd}
                      onChange={(e) => setSetupData({...setupData, firstSemesterEnd: e.target.value})}
                      min={setupData.firstSemesterStart}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Spring Semester</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={setupData.secondSemesterStart}
                      onChange={(e) => setSetupData({...setupData, secondSemesterStart: e.target.value})}
                    />
                    <p className="text-xs text-gray-500 mt-1">Set the start date for the semester</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={setupData.secondSemesterEnd}
                      onChange={(e) => setSetupData({...setupData, secondSemesterEnd: e.target.value})}
                      min={setupData.secondSemesterStart}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Meeting Schedule */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Meeting Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={setupData.meetingFrequency}
                    onChange={(e) => setSetupData({...setupData, meetingFrequency: e.target.value as any})}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Start Time</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={setupData.meetingTime}
                    onChange={(e) => setSetupData({...setupData, meetingTime: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meeting End Time</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={setupData.meetingEndTime}
                    onChange={(e) => setSetupData({...setupData, meetingEndTime: e.target.value})}
                    min={setupData.meetingTime}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Days</label>
                <div className="grid grid-cols-7 gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
                    <label key={day} className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={setupData.meetingDays.includes(day.toLowerCase())}
                        onChange={(e) => {
                          const days = e.target.checked
                            ? [...setupData.meetingDays, day.toLowerCase()]
                            : setupData.meetingDays.filter(d => d !== day.toLowerCase());
                          setSetupData({...setupData, meetingDays: days});
                        }}
                      />
                      <div className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-sm font-medium cursor-pointer transition-all ${
                        setupData.meetingDays.includes(day.toLowerCase())
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'border-gray-300 text-gray-600 hover:border-blue-300'
                      }`}>
                        {day}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSetupSubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              Create Semester Roadmap
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Calendar View ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/clubs/${encodeURIComponent(clubName)}`)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{clubName}</h1>
                <p className="text-sm text-gray-500">Semester Roadmap</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Semester Selector */}
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={activeSemester?.id || ''}
                onChange={(e) => {
                  const semester = roadmapData?.semesters?.find(s => s.id === e.target.value);
                  setActiveSemester(semester || null);
                }}
              >
                {roadmapData?.semesters?.map(semester => (
                  <option key={semester.id} value={semester.id}>
                    {semester.name}
                  </option>
                )) || []}
              </select>

              {/* Reset Button */}
              <button
                onClick={handleResetRoadmap}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all duration-200"
              >
                Reset Roadmap
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  if (currentView === 'month') {
                    newDate.setMonth(newDate.getMonth() - 1);
                  } else if (currentView === 'week') {
                    newDate.setDate(newDate.getDate() - 7);
                  } else {
                    newDate.setDate(newDate.getDate() - 1);
                  }
                  setSelectedDate(newDate);
                }}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Today
              </button>

              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  if (currentView === 'month') {
                    newDate.setMonth(newDate.getMonth() + 1);
                  } else if (currentView === 'week') {
                    newDate.setDate(newDate.getDate() + 7);
                  } else {
                    newDate.setDate(newDate.getDate() + 1);
                  }
                  setSelectedDate(newDate);
                }}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <h2 className="text-xl font-semibold text-gray-900">
                {selectedDate.toLocaleDateString('en-US', { month: 'numeric', year: 'numeric' })}
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentView('month')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setCurrentView('week')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setCurrentView('day')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'day'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Day
              </button>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {currentView === 'month' && selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              {currentView === 'week' && `Week of ${selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
              {currentView === 'day' && selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  if (currentView === 'month') {
                    newDate.setMonth(newDate.getMonth() - 1);
                  } else if (currentView === 'week') {
                    newDate.setDate(newDate.getDate() - 7);
                  } else {
                    newDate.setDate(newDate.getDate() - 1);
                  }
                  setSelectedDate(newDate);
                }}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  if (currentView === 'month') {
                    newDate.setMonth(newDate.getMonth() + 1);
                  } else if (currentView === 'week') {
                    newDate.setDate(newDate.getDate() + 7);
                  } else {
                    newDate.setDate(newDate.getDate() + 1);
                  }
                  setSelectedDate(newDate);
                }}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Next
              </button>
            </div>
          </div>

          {/* Dynamic Calendar View */}
          {currentView === 'month' && (
            <div className="grid grid-cols-7 gap-1">
              {/* Weekday Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-semibold text-gray-600 bg-gray-50 rounded">
                  {day}
                </div>
              ))}

              {/* Month Calendar Days */}
              {(() => {
                const year = selectedDate.getFullYear();
                const month = selectedDate.getMonth();
                const firstDay = new Date(year, month, 1);
                const lastDay = new Date(year, month + 1, 0);
                const startDate = new Date(firstDay);
                startDate.setDate(startDate.getDate() - firstDay.getDay());
                
                const days = [];
                for (let i = 0; i < 42; i++) {
                  const date = new Date(startDate);
                  date.setDate(startDate.getDate() + i);
                  
                  const isCurrentMonth = date.getMonth() === month;
                  const isToday = date.toDateString() === new Date().toDateString();
                  const holiday = isHoliday(date);
                  const weekend = isWeekend(date);
                  const events = getEventsForDate(date);

                  let bgColor = 'bg-white';
                  let textColor = 'text-gray-900';
                  let borderColor = 'border-gray-200';

                  if (!isCurrentMonth) {
                    bgColor = 'bg-gray-50';
                    textColor = 'text-gray-400';
                  } else if (holiday) {
                    bgColor = 'bg-red-100';
                    textColor = 'text-red-800';
                    borderColor = 'border-red-300';
                  } else if (weekend) {
                    bgColor = 'bg-gray-50';
                    textColor = 'text-gray-600';
                  } else if (isToday) {
                    bgColor = 'bg-blue-50';
                    textColor = 'text-blue-700';
                    borderColor = 'border-blue-200';
                  }

                  days.push(
                    <div
                      key={i}
                      className={`min-h-[80px] p-2 border ${bgColor} ${textColor} ${borderColor} hover:bg-gray-50 cursor-pointer transition-colors relative`}
                      onClick={() => {
                        if (holiday) {
                          setSelectedEvent({
                            id: uuidv4(),
                            title: holiday.name,
                            start: date,
                            end: date,
                            type: 'holiday',
                            backgroundColor: '#EF4444',
                            borderColor: '#DC2626',
                            textColor: '#FFFFFF',
                            semesterId: activeSemester?.id || '',
                          });
                          setShowEventModal(true);
                        } else if (events.length > 0) {
                          setSelectedEvent(events[0]);
                          setShowEventModal(true);
                        }
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenu({
                          show: true,
                          x: e.clientX,
                          y: e.clientY,
                          date: date,
                        });
                      }}
                    >
                      <div className="text-sm font-medium mb-1">{date.getDate()}</div>
                      {holiday && (
                        <div className="text-xs font-semibold truncate">
                          {holiday.name}
                        </div>
                      )}
                      {events.length > 0 && !holiday && (
                        <div className="space-y-1">
                          {events.slice(0, 2).map((event, index) => (
                            <div
                              key={event.id}
                              className="text-xs p-1 rounded truncate"
                              style={{
                                backgroundColor: event.backgroundColor,
                                color: event.textColor,
                                border: `1px solid ${event.borderColor}`
                              }}
                            >
                              {event.title}
                            </div>
                          ))}
                          {events.length > 2 && (
                            <div className="text-xs text-blue-600 font-medium">
                              +{events.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }
                return days;
              })()}
            </div>
          )}

          {/* Week View */}
          {currentView === 'week' && (
            <div>
              {/* Day headers */}
              <div className="grid grid-cols-8 gap-1 mb-2">
                <div className="p-2 text-center text-sm font-semibold text-gray-600 bg-gray-50 rounded">
                  Time
                </div>
                {(() => {
                  const startOfWeek = new Date(selectedDate);
                  startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
                  
                  const days = [];
                  for (let i = 0; i < 7; i++) {
                    const date = new Date(startOfWeek);
                    date.setDate(startOfWeek.getDate() + i);
                    const isToday = date.toDateString() === new Date().toDateString();
                    
                    days.push(
                      <div key={i} className={`p-2 text-center text-sm font-semibold rounded ${isToday ? 'bg-blue-100 text-blue-800' : 'bg-gray-50 text-gray-600'}`}>
                        <div>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        <div className="text-xs">{date.getDate()}</div>
                      </div>
                    );
                  }
                  return days;
                })()}
              </div>

              {/* Time slots */}
              <div className="space-y-1">
                {(() => {
                  const timeSlots = [];
                  const startOfWeek = new Date(selectedDate);
                  startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
                  
                  for (let hour = 6; hour <= 22; hour++) {
                    timeSlots.push(
                      <div key={hour} className="grid grid-cols-8 gap-1">
                        {/* Time label */}
                        <div className="p-2 text-xs text-gray-500 border-r border-gray-200 bg-gray-50">
                          {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                        </div>
                        
                        {/* Day columns */}
                        {(() => {
                          const dayColumns = [];
                          for (let day = 0; day < 7; day++) {
                            const date = new Date(startOfWeek);
                            date.setDate(startOfWeek.getDate() + day);
                            date.setHours(hour, 0, 0, 0);
                            
                            const events = getEventsForDate(date).filter(event => {
                              const eventHour = new Date(event.start).getHours();
                              return eventHour === hour;
                            });
                            
                            const isToday = date.toDateString() === new Date().toDateString();
                            
                            dayColumns.push(
                              <div
                                key={day}
                                className={`min-h-[60px] p-1 border-b border-gray-100 ${isToday ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-50 cursor-pointer transition-colors`}
                                onClick={() => {
                                  if (events.length > 0) {
                                    setSelectedEvent(events[0]);
                                    setShowEventModal(true);
                                  }
                                }}
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  setContextMenu({
                                    show: true,
                                    x: e.clientX,
                                    y: e.clientY,
                                    date: date,
                                  });
                                }}
                              >
                                {events.map((event, index) => (
                                  <div
                                    key={event.id}
                                    className="text-xs p-1 rounded mb-1 truncate"
                                    style={{
                                      backgroundColor: event.backgroundColor,
                                      color: event.textColor,
                                      border: `1px solid ${event.borderColor}`
                                    }}
                                  >
                                    {event.title}
                                  </div>
                                ))}
                              </div>
                            );
                          }
                          return dayColumns;
                        })()}
                      </div>
                    );
                  }
                  
                  return timeSlots;
                })()}
              </div>
            </div>
          )}

          {/* Day View */}
          {currentView === 'day' && (
            <div className="grid grid-cols-1 gap-1">
              {/* Time slots for the day */}
              {(() => {
                const timeSlots = [];
                const selectedDay = new Date(selectedDate);
                
                for (let hour = 6; hour <= 22; hour++) {
                  selectedDay.setHours(hour, 0, 0, 0);
                  
                  const events = getEventsForDate(selectedDay).filter(event => {
                    const eventHour = new Date(event.start).getHours();
                    return eventHour === hour;
                  });
                  
                  const isCurrentHour = new Date().getHours() === hour && selectedDay.toDateString() === new Date().toDateString();
                  
                  timeSlots.push(
                    <div
                      key={hour}
                      className={`min-h-[80px] p-3 border-b border-gray-200 ${isCurrentHour ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-50 transition-colors`}
                    >
                      <div className="flex">
                        <div className="w-16 text-sm text-gray-500 font-medium">
                          {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                        </div>
                        <div className="flex-1">
                          {events.map((event, index) => (
                            <div
                              key={event.id}
                              className="mb-2 p-2 rounded-lg shadow-sm"
                              style={{
                                backgroundColor: event.backgroundColor,
                                color: event.textColor,
                                border: `1px solid ${event.borderColor}`
                              }}
                              onClick={() => {
                                setSelectedEvent(event);
                                setShowEventModal(true);
                              }}
                            >
                              <div className="font-medium">{event.title}</div>
                              <div className="text-xs opacity-90">
                                {new Date(event.start).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  hour12: false 
                                })} - {new Date(event.end).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  hour12: false 
                                })}
                              </div>
                              {event.description && (
                                <div className="text-xs mt-1 opacity-75">{event.description}</div>
                              )}
                            </div>
                          ))}
                          {events.length === 0 && (
                            <div className="text-gray-400 text-sm italic">No events scheduled</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
                
                return timeSlots;
              })()}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Legend</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Club Meetings</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-600">Holidays</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Special Events</span>
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">{selectedEvent.title}</h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Date:</span>
                <span className="ml-2 text-gray-600">
                  {selectedEvent.start.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Time:</span>
                <span className="ml-2 text-gray-600">
                  {selectedEvent.start.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })} - {selectedEvent.end.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              {selectedEvent.description && (
                <div>
                  <span className="font-medium text-gray-700">Description:</span>
                  <p className="mt-1 text-gray-600">{selectedEvent.description}</p>
                </div>
              )}
              {selectedEvent.location && (
                <div>
                  <span className="font-medium text-gray-700">Location:</span>
                  <span className="ml-2 text-gray-600">{selectedEvent.location}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              {selectedEvent.id !== 'no-events' ? (
                <button
                  onClick={() => openEditEvent(selectedEvent)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Event
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    // Open context menu to add event
                    setTimeout(() => {
                      setContextMenu({
                        show: true,
                        x: window.innerWidth / 2,
                        y: window.innerHeight / 2,
                        date: selectedEvent.start,
                      });
                    }, 100);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Event
                </button>
              )}
              <button
                onClick={() => setShowEventModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Edit Modal */}
      {showEditModal && editingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Event</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={editForm.startTime}
                    onChange={(e) => setEditForm({...editForm, startTime: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={editForm.endTime}
                    onChange={(e) => setEditForm({...editForm, endTime: e.target.value})}
                  />
                </div>
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  placeholder="Add a description for this event..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location (Optional)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={editForm.location}
                  onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                  placeholder="e.g., Room 101, Online, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Color</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={editForm.eventType}
                  onChange={(e) => setEditForm({...editForm, eventType: e.target.value as any})}
                >
                  <option value="meeting">Club Meeting (Blue)</option>
                  <option value="special">Special Event (Green)</option>
                  <option value="holiday">Holiday (Red)</option>
                </select>
                <div className="flex items-center space-x-2 mt-2 p-2 bg-gray-50 rounded">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: getEventColor(editForm.eventType).backgroundColor }}></div>
                  <span className="text-sm text-gray-600">
                    Preview: {editForm.eventType === 'meeting' ? 'Club Meeting' : editForm.eventType === 'special' ? 'Special Event' : 'Holiday'} color
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  if (roadmapData?.events.find(event => event.id === editingEvent.id)) {
                    deleteEvent(editingEvent.id);
                  } else {
                    // Just close modal for new events that haven't been saved yet
                    setShowEditModal(false);
                    setEditingEvent(null);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {roadmapData?.events.find(event => event.id === editingEvent.id) ? 'Delete' : 'Cancel'}
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEditedEvent}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu.show && contextMenu.date && (
        <div 
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[150px]"
          style={{ 
            left: contextMenu.x, 
            top: contextMenu.y 
          }}
        >
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
            onClick={() => {
              // Create new event and open edit modal
              const newEvent: ClubEvent = {
                id: uuidv4(),
                title: 'New Event',
                start: contextMenu.date!,
                end: new Date(contextMenu.date!.getTime() + 60 * 60 * 1000), // 1 hour later
                type: 'special',
                backgroundColor: '#10B981',
                borderColor: '#059669',
                textColor: '#FFFFFF',
                semesterId: activeSemester?.id || '',
              };
              
              setEditingEvent(newEvent);
              setEditForm({
                title: 'New Event',
                startTime: contextMenu.date!.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                endTime: new Date(contextMenu.date!.getTime() + 60 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                eventType: 'special',
                description: '',
                location: '',
              });
              setShowEditModal(true);
              setContextMenu({ show: false, x: 0, y: 0, date: null });
            }}
          >
            Add Event
          </button>
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
            onClick={() => {
              const events = getEventsForDate(contextMenu.date!);
              if (events.length > 0) {
                setSelectedEvent(events[0]);
                setShowEventModal(true);
              } else {
                // Show a message if no events on this date
                const dateStr = contextMenu.date!.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                });
                setSelectedEvent({
                  id: 'no-events',
                  title: 'No Events Scheduled',
                  start: contextMenu.date!,
                  end: contextMenu.date!,
                  type: 'special',
                  backgroundColor: '#6B7280',
                  borderColor: '#4B5563',
                  textColor: '#FFFFFF',
                  description: `No events are scheduled for ${dateStr}. Right-click on this date to add a new event.`,
                  semesterId: activeSemester?.id || '',
                });
                setShowEventModal(true);
              }
              setContextMenu({ show: false, x: 0, y: 0, date: null });
            }}
          >
            View Events
          </button>
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm text-red-600"
            onClick={() => {
              const events = getEventsForDate(contextMenu.date!);
              if (events.length > 0 && confirm('Delete all events on this date?')) {
                const updatedEvents = roadmapData?.events.filter(event => {
                  const eventDate = new Date(event.start);
                  const contextDate = contextMenu.date!;
                  return !(event.semesterId === activeSemester?.id && 
                          eventDate.toDateString() === contextDate.toDateString());
                }) || [];
                
                const updatedRoadmap = { ...roadmapData!, events: updatedEvents };
                setRoadmapData(updatedRoadmap);
                saveRoadmap(updatedRoadmap);
              }
              setContextMenu({ show: false, x: 0, y: 0, date: null });
            }}
          >
            Delete Events
          </button>
        </div>
      )}

      {/* Click outside to close context menu */}
      {contextMenu.show && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setContextMenu({ show: false, x: 0, y: 0, date: null })}
        />
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Reset Semester Roadmap?</h3>
              <p className="text-sm text-gray-500 mb-6">
                This will delete all current settings, events, and meetings. This action can be undone immediately after reset.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={undoReset}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReset}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reset Roadmap
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Undo Reset Notification */}
      {backupRoadmap && !showResetConfirm && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-3">
            <span>Roadmap reset successfully!</span>
            <button
              onClick={undoReset}
              className="bg-green-700 hover:bg-green-800 px-3 py-1 rounded text-sm transition-colors"
            >
              Undo
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 