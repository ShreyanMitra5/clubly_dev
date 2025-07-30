"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ProductionClubManager, ProductionClubData } from '../utils/productionClubManager';
import { supabase } from '../../utils/supabaseClient';
import { UserButton } from '@clerk/nextjs';
import { cn } from '../lib/utils';

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
    }
    fetchClubInfo();
  }, [user, clubName]);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
      </svg>
    ) },
    { id: 'club-space', label: 'Club Space', icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ) },
    { id: 'presentations', label: 'Presentations', icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16" />
      </svg>
    ) },
    { id: 'roadmap', label: 'Roadmap', icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L16 4m0 13V4m0 0L9 7" />
      </svg>
    ) },
    { id: 'attendance', label: 'Attendance', icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ) },
    { id: 'advisor', label: 'Advisor', icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ) },
    { id: 'tasks', label: 'Tasks', icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ) },
    { id: 'email', label: 'Email', icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ) },
    { id: 'history', label: 'Past Presentations', icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ) },
    { id: 'summaries', label: 'Past Summaries', icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ) },
    { id: 'settings', label: 'Settings', icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ) },
  ];

  return (
    <div 
      className={`fixed left-0 top-0 h-full transition-all duration-300 z-40 
        bg-gradient-to-br from-[#FF5F1F] via-[#FF7F1F] to-[#FF9F1F]
        ${isCollapsed ? 'w-20' : 'w-64'}
        before:absolute before:inset-0 before:bg-black/10 before:z-0
        after:absolute after:inset-0 after:bg-[url('/background-section2.png')] after:bg-cover after:opacity-5 after:z-0
      `}
    >
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-white/10 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm p-2 ring-2 ring-white/20">
                <img src="/logo.svg" alt="Clubly" className="w-full h-full" />
              </div>
              {!isCollapsed && (
                <span className="text-xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  Clubly
                </span>
              )}
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center
                hover:bg-white/20 transition-all duration-200 hover:scale-110 ring-2 ring-white/20"
            >
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className={`w-4 h-4 transition-transform duration-200 text-white ${isCollapsed ? 'rotate-180' : ''}`}
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveFeature(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200
                ${activeFeature === item.id
                  ? 'bg-white/15 text-white shadow-lg backdrop-blur-sm ring-2 ring-white/20 scale-[1.02]'
                  : 'text-white/70 hover:bg-white/10 hover:text-white hover:scale-[1.02]'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <div className={`flex-shrink-0 transition-transform duration-200 
                ${activeFeature === item.id ? 'scale-110' : ''}
                ${isCollapsed ? 'scale-125' : ''}
              `}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <span className={`text-sm font-medium transition-all duration-200
                  ${activeFeature === item.id ? 'translate-x-0.5' : ''}
                `}>
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div className="relative p-4 border-t border-white/10 backdrop-blur-sm">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} 
            rounded-xl bg-white/10 p-3 ring-2 ring-white/20`}
          >
            <div className="flex-shrink-0">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 ring-2 ring-white/20 rounded-lg"
                  }
                }}
              />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.fullName || user?.username || ''}
                </p>
                <p className="text-xs text-white/60 truncate">
                  {user?.primaryEmailAddress?.emailAddress || ''}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 