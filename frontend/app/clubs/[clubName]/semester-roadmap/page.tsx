"use client";
import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { ProductionClubManager, ProductionClubData } from '../../../utils/productionClubManager';
import { Calendar as ReactBigCalendar, dateFnsLocalizer } from "react-big-calendar";
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import "react-big-calendar/lib/css/react-big-calendar.css";
import { EventClickArg, DateSelectArg, EventInput } from "@fullcalendar/core";

// --- Types ---
interface SpecialEvent {
  name: string;
  date: string;
}

interface RoadmapData {
  events: EventInput[];
  settings: {
    clubTopic: string;
    meetingFrequency: string;
    meetingDay?: string; // Make this optional
    meetingTime: string;
    specialEvents: SpecialEvent[];
    semesterStart: string;
    semesterEnd: string;
    aiTopics: { date: string; topic: string }[];
  };
}

// --- Main Component ---
export default function SemesterRoadmapPage() {
  const { user } = useUser();
  const params = useParams();
  const router = useRouter();
  const clubName = decodeURIComponent(params.clubName as string);
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [formData, setFormData] = useState({
    clubTopic: "",
    semesterStart: "",
    semesterEnd: "",
    meetingFrequency: "weekly",
    meetingDays: [] as string[],
    meetingTime: "18:00",
    specialEvents: [{ name: "", date: "" }],
  });
  const [aiTopics, setAiTopics] = useState<{ date: string; topic: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [eventModal, setEventModal] = useState<null | { event: EventInput; type: string }>(null);
  const calendarRef = useRef<any>(null);
  const [specialEventError, setSpecialEventError] = useState("");
  const [clubInfo, setClubInfo] = useState<ProductionClubData | null>(null);
  const [topicsGenerated, setTopicsGenerated] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('month');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);

  // Helper function to get the correct API URL for topic generation
  const getGenerateTopicsUrl = () => clubInfo ? `/api/clubs/${clubInfo.clubId}/generate-topics` : '';

  // --- Load/Save ---
  useEffect(() => {
    if (!user || !clubName) return;
    ProductionClubManager.getUserClubs(user.id).then(clubs => {
      const club = clubs.find(c => c.clubName === clubName);
      setClubInfo(club || null);
      if (club) {
        // Fetch roadmap from backend
        fetch(`/api/clubs/${club.clubId}`)
          .then(res => res.json())
          .then(data => {
            if (data.roadmap) setRoadmapData(data.roadmap);
            else setShowOnboarding(true);
          })
          .catch(() => setShowOnboarding(true));
    } else {
      setShowOnboarding(true);
    }
    });
  }, [user, clubName]);

  const saveRoadmap = async (data: RoadmapData) => {
    setRoadmapData(data);
    if (user && clubInfo) {
      await fetch('/api/clubs/save-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          clubId: clubInfo.clubId,
          clubName: clubInfo.clubName,
          roadmapData: data
        })
      });
    }
  };

  // --- Onboarding Steps ---
  const onboardingSteps = [
    {
      title: "What's your club's main topic?",
      description: "This helps us generate relevant meeting topics.",
      fields: [
        { name: "clubTopic", label: "Club Topic", type: "text", placeholder: "e.g. AI, Robotics, Finance..." },
      ],
    },
    {
      title: "When does your semester start and end?",
      description: "Set the date range for your semester planning.",
      fields: [
        { name: "semesterStart", label: "Semester Start Date", type: "date" },
        { name: "semesterEnd", label: "Semester End Date", type: "date" },
      ],
    },
    {
      title: "How often does your club meet?",
      description: "Tell us about your regular meeting schedule.",
      fields: [
        { name: "meetingFrequency", label: "Meeting Frequency", type: "text", placeholder: "e.g. Weekly, Biweekly" },
        { name: "meetingDays", label: "Meeting Days", type: "checkbox-group", options: [
          { value: "monday", label: "Monday" },
          { value: "tuesday", label: "Tuesday" },
          { value: "wednesday", label: "Wednesday" },
          { value: "thursday", label: "Thursday" },
          { value: "friday", label: "Friday" },
          { value: "saturday", label: "Saturday" },
          { value: "sunday", label: "Sunday" },
        ] },
        { name: "meetingTime", label: "Meeting Time", type: "time" },
      ],
    },
    {
      title: "Any special events planned?",
      description: "Add any special events, workshops, or important dates for your club.",
      fields: [
        { name: "specialEvents", label: "Special Events", type: "special-events-list" },
      ],
    },
  ];

  // --- Onboarding Handlers ---
  const handleOnboardingNext = async () => {
    // If this is the last step, save and close onboarding
    if (onboardingStep === onboardingSteps.length - 1) {
      handleOnboardingSubmit();
      setShowOnboarding(false);
      return;
    }
    setOnboardingStep(onboardingStep + 1);
  };

  const handleOnboardingBack = () => {
    setOnboardingStep(Math.max(0, onboardingStep - 1));
  };

  const handleOnboardingSubmit = () => {
    // --- Generate all events ---
    const events: EventInput[] = [];
    const dayMap: { [key: string]: number } = {
      sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
    };
    const meetingDays = formData.meetingDays;
    const [hours, minutes] = formData.meetingTime.split(":").map(Number);
    let currentDate = new Date(formData.semesterStart);
    while (currentDate <= new Date(formData.semesterEnd)) {
      if (meetingDays.includes(Object.keys(dayMap).find(key => dayMap[key] === currentDate.getDay())!)) {
        // Find AI topic for this date
        const topicObj = aiTopics.find(t => t.date === currentDate.toISOString().slice(0, 10));
        const topic = topicObj ? topicObj.topic : "Club Meeting";
        const eventDate = new Date(currentDate);
        eventDate.setHours(hours, minutes, 0, 0);
        events.push({
          id: `meeting-${eventDate.getTime()}`,
          title: topic,
          start: eventDate,
          end: new Date(eventDate.getTime() + 2 * 60 * 60 * 1000),
          backgroundColor: "#3B82F6",
          borderColor: "#2563EB",
          textColor: "#FFFFFF",
          extendedProps: { type: "meeting", topic },
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    // Special events
    formData.specialEvents.forEach((event, index) => {
      if (event.name && event.date) {
        const eventDate = new Date(event.date);
        eventDate.setHours(12, 0, 0, 0);
        events.push({
          id: `special-${index}`,
          title: event.name,
          start: eventDate,
          end: new Date(eventDate.getTime() + 2 * 60 * 60 * 1000),
          backgroundColor: "#10B981",
          borderColor: "#059669",
          textColor: "#FFFFFF",
          extendedProps: { type: "special" },
        });
      }
    });
    const newRoadmapData: RoadmapData = {
      events,
      settings: { ...formData, aiTopics },
    };
    saveRoadmap(newRoadmapData);
  };

  // --- Calendar Event Handlers ---
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleNavigate = (date) => {
    setCalendarDate(date);
  };

  const handleView = (view) => {
    setCalendarView(view);
  };

  const handleSaveEvent = (updatedEvent) => {
    const exists = roadmapData.events.some(e => e.id === updatedEvent.id);
    let updatedEvents;
    if (exists) {
      updatedEvents = roadmapData.events.map(e => e.id === updatedEvent.id ? updatedEvent : e);
    } else {
      updatedEvents = [...roadmapData.events, updatedEvent];
    }
    setRoadmapData({ ...roadmapData, events: updatedEvents });
    setShowEventModal(false);
  };

  const handleDeleteEvent = (eventId) => {
    const updatedEvents = roadmapData.events.filter(e => e.id !== eventId);
    setRoadmapData({ ...roadmapData, events: updatedEvents });
    setShowEventModal(false);
  };

  // Remove right-click/contextmenu logic and use onSelectSlot for left click
  const handleSelectSlot = (slotInfo) => {
    setSelectedEvent({
      id: `custom-${Date.now()}`,
      title: '',
      start: new Date(slotInfo.start),
      end: new Date(slotInfo.end),
      extendedProps: {},
    });
    setShowEventModal(true);
  };

  // --- UI ---
  if (showOnboarding) {
    const currentStep = onboardingSteps[onboardingStep];
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 animate-fade-in-up">
          <h1 className="text-2xl font-bold mb-2 text-black">{currentStep.title}</h1>
          <p className="text-gray-500 mb-6">{currentStep.description}</p>
          <form
            onSubmit={async e => {
              e.preventDefault();
              console.log("Next button clicked. Current step:", onboardingStep);
              if (onboardingStep === onboardingSteps.length - 1) {
                console.log("Saving and closing onboarding.");
                handleOnboardingSubmit();
                setShowOnboarding(false);
              } else {
                setOnboardingStep(onboardingStep + 1);
                console.log("Advancing to step:", onboardingStep + 1);
              }
            }}
            className="space-y-6"
          >
            {currentStep.fields.map((field, idx) => (
              <div key={idx}>
                {field.type === "text" && field.name === "meetingFrequency" ? (
                  <select
                    className="input-field w-full"
                    value={formData.meetingFrequency}
                    onChange={e => setFormData({ ...formData, meetingFrequency: e.target.value })}
                    required
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                ) : field.type === "text" ? (
                  <input
                    type="text"
                    value={formData[field.name]}
                    onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                    placeholder={field.placeholder}
                    className="input-field"
                    required
                  />
                ) : null}
                {field.type === "date" && (
                    <input
                      type="date"
                    value={formData[field.name]}
                    onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                    className="input-field"
                      required
                    />
                  )}
                {field.type === "time" && (
                    <input
                      type="time"
                    value={formData[field.name]}
                    onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                    className="input-field"
                      required
                    />
                  )}
                {field.type === "checkbox-group" && (
                  <div className="flex flex-wrap gap-2">
                    {field.options.map((option: any) => (
                      <label key={option.value} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={formData.meetingDays.includes(option.value)}
                          onChange={e => {
                            const checked = e.target.checked;
                            setFormData({
                        ...formData,
                              meetingDays: checked
                                ? [...formData.meetingDays, option.value]
                                : formData.meetingDays.filter((d: string) => d !== option.value),
                            });
                          }}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}
                {field.type === "special-events-list" && (
                  <div className="space-y-2">
                    <div className="flex gap-2 mb-1 font-semibold text-gray-700">
                      <span className="w-1/2">Event Name</span>
                      <span className="w-1/2">Event Date</span>
                      <span className="w-10"></span>
                    </div>
                    {formData.specialEvents.map((event, i) => (
                      <div key={i} className="flex gap-2 items-center mb-1">
                          <input
                            type="text"
                          value={event.name ?? ''}
                          onChange={e => {
                            const updated = [...formData.specialEvents];
                            updated[i] = { ...updated[i], name: e.target.value };
                            setFormData({ ...formData, specialEvents: updated });
                          }}
                          placeholder="e.g. Hackathon, Workshop"
                          className="input-field w-1/2"
                        />
                        <input
                          type="date"
                          value={event.date ?? ''}
                          onChange={e => {
                            const updated = [...formData.specialEvents];
                            updated[i] = { ...updated[i], date: e.target.value };
                            setFormData({ ...formData, specialEvents: updated });
                          }}
                          className="input-field w-1/2"
                          />
                          <button
                            type="button"
                          onClick={() => setFormData({ ...formData, specialEvents: formData.specialEvents.filter((_, idx) => idx !== i) })}
                          className="btn-secondary px-2 py-1"
                          disabled={formData.specialEvents.length === 1}
                        >
                          ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                      onClick={() => setFormData({ ...formData, specialEvents: [...formData.specialEvents, { name: "", date: "" }] })}
                      className="btn-primary px-4 py-2 mt-2"
                    >
                      + Add Event
                      </button>
                    {specialEventError && (
                      <div className="text-red-500 font-semibold mb-2">{specialEventError}</div>
                    )}
                    </div>
                  )}
                </div>
              ))}
            {/* Navigation */}
            {onboardingStep < onboardingSteps.length - 1 && (
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleOnboardingBack}
                  disabled={onboardingStep === 0}
                >Back</button>
                <button type="submit" className="btn-primary">Next</button>
              </div>
            )}
            {onboardingStep === onboardingSteps.length - 1 && (
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    handleOnboardingSubmit();
                    setShowOnboarding(false);
                  }}
                >Save and Confirm</button>
              </div>
            )}
            </form>
        </div>
      </div>
    );
  }

  // --- Main Calendar UI ---
  if (!roadmapData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-2xl font-bold text-gray-400">Loading...</div>
      </div>
    );
  }

  const locales = {
    'en-US': enUS,
  };
  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20">
      {/* Back to Club Features Button */}
      <button
        className="px-5 py-2 rounded-lg border border-blue-200 bg-white text-blue-700 font-medium shadow hover:bg-blue-50 transition mb-6 mt-2 ml-4 self-start"
        onClick={() => router.push(`/clubs/${encodeURIComponent(clubName)}`)}
      >
        ← Back to Club Features
      </button>
      <div className="container-width max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-black mb-1">Semester Roadmap</h1>
            <p className="text-gray-500">Plan and visualize your club's semester schedule</p>
          </div>
          <button
            onClick={() => {
              setShowOnboarding(true);
              setOnboardingStep(0);
              setAiTopics([]);
            }}
            className="btn-primary"
          >
            Reset & Replan
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 md:p-8 mb-8 animate-fade-in-up">
          <ReactBigCalendar
            localizer={localizer}
            events={roadmapData.events.map(e => ({
              ...e,
              start: typeof e.start === 'string' ? new Date(e.start) : e.start,
              end: typeof e.end === 'string' ? new Date(e.end) : e.end,
            }))}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600, borderRadius: 16, background: '#fafbfc', padding: 16 }}
            date={calendarDate}
            view={calendarView}
            views={['month', 'week', 'day']}
            onNavigate={handleNavigate}
            onView={handleView}
            onSelectEvent={handleSelectEvent}
            selectable
            onSelectSlot={handleSelectSlot}
          />
        </div>
        {/* Full-screen event modal */}
        {showEventModal && selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="w-full h-full flex flex-col justify-center items-center">
              <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-3xl h-[90vh] overflow-y-auto flex flex-col gap-8 animate-fade-in-up relative">
                <button className="absolute top-6 right-8 text-3xl text-gray-400 hover:text-black" onClick={() => setShowEventModal(false)}>&times;</button>
                <h2 className="text-3xl font-bold mb-4 text-black">Edit Event</h2>
                <div className="flex flex-col gap-6 flex-1">
                  <div>
                    <label className="block font-semibold mb-1">Meeting Title</label>
                    <input
                      type="text"
                      className="input-field w-full text-lg"
                      value={selectedEvent.title}
                      onChange={e => setSelectedEvent({ ...selectedEvent, title: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block font-semibold mb-1">Start Time</label>
                      <input
                        type="datetime-local"
                        className="input-field w-full text-lg"
                        value={selectedEvent.start ? new Date(selectedEvent.start).toISOString().slice(0, 16) : ''}
                        onChange={e => setSelectedEvent({ ...selectedEvent, start: e.target.value })}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block font-semibold mb-1">End Time</label>
                      <input
                        type="datetime-local"
                        className="input-field w-full text-lg"
                        value={selectedEvent.end ? new Date(selectedEvent.end).toISOString().slice(0, 16) : ''}
                        onChange={e => setSelectedEvent({ ...selectedEvent, end: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <button
                      className="btn-primary flex-1 text-lg"
                      onClick={() => router.push(`/generate?clubId=${selectedEvent.extendedProps?.clubId || ''}&date=${selectedEvent.start}`)}
                      type="button"
                    >Generate Presentation</button>
                    <button
                      className="btn-primary flex-1 text-lg"
                      onClick={() => router.push(`/clubs/${encodeURIComponent(clubName)}/attendance-notes?date=${selectedEvent.start}`)}
                      type="button"
                    >Record Meeting</button>
                  </div>
                </div>
                <div className="flex gap-4 mt-8">
                  <button className="btn-secondary flex-1 text-lg" onClick={() => setShowEventModal(false)}>Cancel</button>
                  <button className="btn-secondary flex-1 text-lg" onClick={() => handleDeleteEvent(selectedEvent.id)}>Delete</button>
                  <button
                    className="btn-primary flex-1 text-lg"
                    onClick={() => handleSaveEvent(selectedEvent)}
                  >Save</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 