"use client";
import React from 'react';
import { Users } from 'lucide-react';

interface TeacherAdvisorButtonProps {
  clubId: string;
  clubName: string;
}

export default function TeacherAdvisorButton({ clubId, clubName }: TeacherAdvisorButtonProps) {
  const handleClick = () => {
    // Open teacher advisor section in a modal or redirect
    window.location.href = `/clubs/${clubName}/advisor`;
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
    >
      <Users className="h-4 w-4" />
      <span>Request Teacher Advisor</span>
    </button>
  );
} 