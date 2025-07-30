"use client";

import React from "react";

const LandingImageShowcase = () => {
  return (
    <section className="w-full pt-0 pb-8 sm:pb-12 bg-white" id="showcase">
      <div className="section-container">
        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12 animate-on-scroll">
          <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-gray-900 mb-3 sm:mb-4 text-center">
            See Clubly in Action
          </h2>
          <p className="text-base sm:text-lg text-gray-600 text-center">
            See how Clubly turns the boring stuff into the easy stuff, so you can spend your time 
            on what actually makes a difference.
          </p>
        </div>
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-elegant mx-auto max-w-4xl animate-on-scroll">
          <div className="w-full">
            <img 
              src="/lovable-uploads/c3d5522b-6886-4b75-8ffc-d020016bb9c2.png" 
              alt="Clubly platform interface showing AI-powered presentation generation" 
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="bg-white p-4 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-display font-semibold mb-3 sm:mb-4">AI-Powered Club Management</h3>
            <p className="text-gray-700 text-sm sm:text-base">
              We built this because we've been there - spending way too much time on stuff that 
              doesn't matter. Now you can focus on what actually does.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingImageShowcase; 