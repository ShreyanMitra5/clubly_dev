"use client";
import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { EventClickArg, DateSelectArg, EventInput } from "@fullcalendar/core";
import { useParams, useRouter } from "next/navigation";
import { ProductionClubManager, ProductionClubData } from '../../../utils/productionClubManager';

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
    meetingDay: string;
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
    {
      title: "AI is generating topics for your meetings...",
      description: "Review and confirm the topics for each meeting. You can regenerate if you want.",
      fields: [],
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
    // AI step logic (if present)
    if (onboardingStep === onboardingSteps.length - 2) {
      setAiLoading(true);
      setAiError("");
      try {
        const res = await fetch(`/api/clubs/${encodeURIComponent(clubName)}/generate-topics`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clubTopic: formData.clubTopic,
            semesterStart: formData.semesterStart,
            semesterEnd: formData.semesterEnd,
            frequency: formData.meetingFrequency,
            specialEvents: formData.specialEvents.filter(e => e.name && e.date),
          }),
        });
        const data = await res.json();
        if (!data.topics) throw new Error(data.error || "Failed to generate topics");
        setAiTopics(data.topics);
        setTopicsGenerated(true);
        setOnboardingStep(onboardingStep + 1);
      } catch (e: any) {
        setAiError(e.message || "Failed to generate topics");
      } finally {
        setAiLoading(false);
      }
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
  const handleEventClick = (clickInfo: EventClickArg) => {
    setEventModal({ event: clickInfo.event.toPlainObject(), type: clickInfo.event.extendedProps?.type || "custom" });
  };
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setEventModal({ event: { start: selectInfo.startStr, end: selectInfo.endStr, title: "", id: `custom-${Date.now()}` }, type: "custom" });
  };
  const handleEventDelete = (eventId: string) => {
    if (!roadmapData) return;
    const updatedEvents = roadmapData.events.filter((e) => e.id !== eventId);
    const updatedData = { ...roadmapData, events: updatedEvents };
    saveRoadmap(updatedData);
    setEventModal(null);
  };
  const handleEventSave = (event: EventInput) => {
    if (!roadmapData) return;
    let updatedEvents = roadmapData.events.filter((e) => e.id !== event.id);
    updatedEvents.push(event);
    updatedEvents = updatedEvents.sort((a, b) => new Date(a.start as string).getTime() - new Date(b.start as string).getTime());
    const updatedData = { ...roadmapData, events: updatedEvents };
    saveRoadmap(updatedData);
    setEventModal(null);
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
                {field.type === "text" && (
                  <input
                    type="text"
                    value={formData[field.name]}
                    onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                    placeholder={field.placeholder}
                    className="input-field"
                    required
                  />
                )}
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
            {/* AI Step */}
            {onboardingStep === onboardingSteps.length - 1 && (
              <div className="space-y-4">
                {aiLoading && <div className="text-blue-500 font-semibold">Generating topics with AI...</div>}
                {aiError && <div className="text-red-500 font-semibold">{aiError}</div>}
                {!aiLoading && !aiError && aiTopics.length > 0 && (
                  <div className="space-y-2">
                    {aiTopics.map((t, i) => (
                      <div key={i} className="bg-gray-100 rounded-lg px-4 py-2 flex items-center gap-2">
                        <span className="font-semibold text-blue-700">{t.date}:</span>
                        <span className="text-black">{t.topic}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleOnboardingBack}
                  >Back</button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={async () => {
                      setAiLoading(true);
                      setAiError("");
                      try {
                        const url = getGenerateTopicsUrl();
                        if (!url) throw new Error('Club info not loaded.');
                        const res = await fetch(url, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            clubTopic: formData.clubTopic,
                            semesterStart: formData.semesterStart,
                            semesterEnd: formData.semesterEnd,
                            frequency: formData.meetingFrequency,
                            specialEvents: formData.specialEvents.filter(e => e.name && e.date),
                          }),
                        });
                        let data;
                        try {
                          data = await res.json();
                        } catch (err) {
                          const text = await res.text();
                          console.error('API returned non-JSON:', text);
                          throw new Error('Server error: ' + text.slice(0, 100));
                        }
                        if (!data.topics) throw new Error(data.error || "Failed to generate topics");
                        setAiTopics(data.topics);
                        setTopicsGenerated(true);
                        handleOnboardingSubmit();
                        setShowOnboarding(false);
                      } catch (e: any) {
                        setAiError(e.message || "Failed to generate topics");
                      } finally {
                        setAiLoading(false);
                      }
                    }}
                  >Save and Confirm</button>
                </div>
              </div>
            )}
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

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20">
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
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,listWeek",
            }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            events={roadmapData.events}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventDrop={info => {
              // Drag to move
              const event = info.event.toPlainObject();
              handleEventSave(event);
            }}
            eventResize={info => {
              // Resize to change time
              const event = info.event.toPlainObject();
              handleEventSave(event);
            }}
            height="auto"
          />
        </div>
        {/* Meeting & Event Details Modal */}
        {eventModal && (
          <EventModal
            event={eventModal.event}
            type={eventModal.type}
            onClose={() => setEventModal(null)}
            onDelete={handleEventDelete}
            onSave={handleEventSave}
            clubName={clubName}
          />
        )}
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-black mb-2">Meeting Schedule</h3>
            <div className="space-y-1">
              <p><strong>Topic:</strong> {roadmapData.settings.clubTopic}</p>
              <p><strong>Frequency:</strong> {roadmapData.settings.meetingFrequency}</p>
              <p><strong>Day:</strong> {roadmapData.settings.meetingDay}</p>
              <p><strong>Time:</strong> {roadmapData.settings.meetingTime}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-black mb-2">Semester Period</h3>
            <div className="space-y-1">
              <p><strong>Start:</strong> {new Date(roadmapData.settings.semesterStart).toLocaleDateString()}</p>
              <p><strong>End:</strong> {new Date(roadmapData.settings.semesterEnd).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Event Modal ---
function EventModal({ event, type, onClose, onDelete, onSave, clubName }: {
  event: EventInput;
  type: string;
  onClose: () => void;
  onDelete: (id: string) => void;
  onSave: (event: EventInput) => void;
  clubName: string;
}) {
  const [editTitle, setEditTitle] = useState(event.title || "");
  const [editStart, setEditStart] = useState(event.start ? new Date(event.start).toISOString().slice(0, 16) : "");
  const [editEnd, setEditEnd] = useState(event.end ? new Date(event.end).toISOString().slice(0, 16) : "");
  const router = useRouter();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fade-in-up">
        <h2 className="text-xl font-bold mb-4 text-black">{type === "meeting" ? "Meeting Details" : type === "special" ? "Special Event" : "Event"}</h2>
        <div className="space-y-4">
          <input
            type="text"
            className="input-field"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            placeholder="Event Title"
          />
          <div className="flex gap-2">
            <input
              type="datetime-local"
              className="input-field flex-1"
              value={editStart}
              onChange={e => setEditStart(e.target.value)}
            />
            <input
              type="datetime-local"
              className="input-field flex-1"
              value={editEnd}
              onChange={e => setEditEnd(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
          <button className="btn-secondary flex-1" onClick={() => onDelete(event.id as string)}>Delete</button>
          {type === "meeting" && (
            <button
              className="btn-primary flex-1"
              onClick={() => router.push(`/generate?clubId=${clubName}&date=${editStart}`)}
            >
              Generate Presentation
            </button>
          )}
          {type === "meeting" && (
            <button
              className="btn-primary flex-1"
              onClick={() => router.push(`/clubs/${encodeURIComponent(clubName)}/attendance-notes?date=${editStart}`)}
            >
              Attendance & Notes
            </button>
          )}
          <button
            className="btn-primary flex-1"
            onClick={() => onSave({ ...event, title: editTitle, start: editStart, end: editEnd })}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
} 