"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import ClubLayout from '../../components/ClubLayout';

export default function ClubPage() {
  const params = useParams();
  // Use clubId from params
  const clubId = params.clubId as string;

  return (
    <ClubLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FF5F1F] via-[#FF7F1F] to-[#FF9F1F] mb-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('/background-section2.png')] bg-cover opacity-5" />
          <div className="absolute inset-0 bg-black/10" />
          {/* Content */}
          <div className="relative z-10 px-8 py-12 flex items-center justify-between">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold text-white mb-4">
                Welcome to your club
              </h1>
              <p className="text-white/90 text-lg mb-6">
                Manage your club activities and stay organized with Clubly.
              </p>
            </div>
            <div className="w-64 h-64 flex-shrink-0">
              <img 
                src="/lovable-uploads/5663820f-6c97-4492-9210-9eaa1a8dc415.png"
                alt="Club Management"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#FF5F1F]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <svg className="w-6 h-6 text-[#FF5F1F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Presentations</p>
                <p className="text-2xl font-semibold text-gray-900">1</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#FF8C33]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <svg className="w-6 h-6 text-[#FF8C33]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Meeting Notes</p>
                <p className="text-2xl font-semibold text-gray-900">2</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#FFA64D]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <svg className="w-6 h-6 text-[#FFA64D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tasks</p>
                <p className="text-2xl font-semibold text-gray-900">5</p>
              </div>
            </div>
          </div>
        </div>


      </div>
    </ClubLayout>
  );
} 