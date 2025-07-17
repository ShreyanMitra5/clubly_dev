"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ProductionClubManager, ProductionClubData } from '../../utils/productionClubManager';
import { supabase } from '../../utils/supabaseClient';

interface ClubSidebarProps {
  activeFeature: string;
  setActiveFeature: (feature: string) => void;
  clubName: string;
  clubInfo: any;
}

export default function ClubSidebar({ activeFeature, setActiveFeature, clubName, clubInfo }: ClubSidebarProps) {
  const { user } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!user || !clubName) return;
    async function fetchClubInfo() {
      const { data, error } = await supabase
        .from('memberships')
        .select('club_id, role, clubs (id, name, description, mission, goals, audience, owner_id)')
        .eq('user_id', user.id);
      if (error) {
        console.error('Error fetching club info:', error);
        return;
      }
      // No setClubInfo needed
    }
    fetchClubInfo();
  }, [user, clubName]);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: /* svg */ null },
    { id: 'club-space', label: 'Club Space', icon: null },
    { id: 'presentations', label: 'Generate Presentation', icon: null },
    { id: 'roadmap', label: 'Semester Roadmap', icon: null },
    { id: 'attendance', label: 'Attendance & Notes', icon: null },
    { id: 'advisor', label: 'AI Club Advisor', icon: null },
    { id: 'tasks', label: 'Task Manager', icon: null },
    { id: 'email', label: 'Email Manager', icon: null },
    { id: 'history', label: 'Presentation History', icon: null },
    { id: 'summaries', label: 'Meeting Summaries', icon: null },
    { id: 'settings', label: 'Settings', icon: null },
  ];

  // (SVG icons omitted for brevity, but should be included in real code)

  return (
    <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-pulse-500 to-orange-400 text-white transition-all duration-300 z-40 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/logo.svg" alt="Clubly" width={32} height={32} className="rounded-lg" />
              {!isCollapsed && <span className="text-xl font-bold">Clubly</span>}
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded hover:bg-white/10 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M15 18l-6-6 6-6"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveFeature(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                activeFeature === item.id
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
} 