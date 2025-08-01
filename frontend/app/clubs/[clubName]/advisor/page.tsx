"use client";
import React from 'react';
import TeacherAdvisorSection from '../../../components/TeacherAdvisorSection';
import { useParams } from 'next/navigation';

export default function ClubAdvisorPage() {
  const params = useParams();
  const clubName = params.clubName as string;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Teacher Advisor for {clubName}
          </h1>
          <p className="text-gray-600 mt-2">
            Request a teacher advisor and book meetings for your club
          </p>
        </div>
        
        <TeacherAdvisorSection 
          clubId={clubName} // You'll need to get the actual club ID
          clubName={clubName}
        />
      </div>
    </div>
  );
} 