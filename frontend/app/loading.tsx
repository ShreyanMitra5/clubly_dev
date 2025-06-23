"use client";
import React from 'react';
import Image from 'next/image';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50 overflow-hidden">
      <style>
        {`
          @keyframes rock {
            0%, 100% {
              transform: rotate(0deg) translateY(0px);
            }
            50% {
              transform: rotate(5deg) translateY(-5px);
            }
          }

          .rocking-logo {
            animation: rock 2s ease-in-out infinite;
          }
        `}
      </style>
      <div className="relative w-24 h-24 rocking-logo">
        <Image 
          src="/logo.png" 
          alt="Clubly Logo Loading" 
          width={96} 
          height={96} 
          className="rounded-full"
          priority
        />
      </div>
      <p className="mt-8 text-lg font-medium text-gray-700">
        Loading...
      </p>
    </div>
  );
};

export default LoadingScreen; 