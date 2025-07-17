"use client";

import React from "react";

const LandingSpecsSection = () => {
  return (
    <section className="w-full py-6 sm:py-10 bg-white" id="specifications">
      <div className="section-container">
        <div className="flex items-center gap-4 mb-8 sm:mb-16">
          <div className="flex items-center gap-4">
            <div className="pulse-chip">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-pulse-500 text-white mr-2">🎯</span>
              <span>Mission</span>
            </div>
          </div>
          <div className="flex-1 h-[1px] bg-gray-300"></div>
        </div>
        <div className="text-left pb-8">
          <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight max-w-3xl">
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-900 via-purple-800 to-orange-500">
              We built Clubly because we've been there - spending hours on slides when we could have been planning something awesome. Now you can focus on what actually matters: making your club the best it can be.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default LandingSpecsSection; 