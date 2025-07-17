"use client";

import React from "react";

const LandingFooter = () => {
  return (
    <footer className="w-full bg-white py-0">
      <div className="section-container">
        <p className="text-center text-gray-600 text-sm">
          © 2024 Clubly. Made by students, for students.{" "}
          <a 
            href="https://www.clubly.tech" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-pulse-500 hover:underline"
          >
            Learn more at clubly.tech
          </a>
        </p>
      </div>
    </footer>
  );
};

export default LandingFooter; 