"use client";

import React from "react";

const LandingMadeByHumans = () => {
  return <section id="made-by-students" className="w-full bg-white py-0">
      <div className="section-container pb-2">
        {/* Removed the pulse-chip button/element that was here */}
        
        <div className="w-full rounded-2xl sm:rounded-3xl overflow-hidden relative mt-6 sm:mt-8">
          <div className="bg-no-repeat bg-cover bg-center p-4 sm:p-5 min-h-[250px] sm:min-h-[350px] flex flex-col justify-between" style={{
          backgroundImage: "url('/background-section3.png')"
        }}>
            <div className="flex items-center text-white">
              <img src="/lovable-uploads/33ae3674-9721-4397-baf4-0d74ef7d2e0e.png" alt="Clubly Logo" className="h-5 sm:h-6 w-auto mr-3" />
              <span className="text-white text-xl font-medium">
            </span>
            </div>
            
            <div style={{
            overflow: "hidden",
            maxHeight: "80px",
            marginTop: "40px"
          }}>
              <h2 style={{
              marginBottom: "-30px",
              padding: "0px 0px 100px"
            }} className="sm:text-5xl font-playfair text-white italic mt-0 mx-0 font-thin text-6xl md:text-7xl py-0 px-0 text-center lg:text-7xl">
                Made By Students
              </h2>
            </div>
            
            {/* White box at the bottom with overflow */}
            <div className="w-[120%] bg-white h-10 rounded-t-lg absolute left-[-10%] bottom-0"></div>
          </div>
        </div>
      </div>
    </section>;
};

export default LandingMadeByHumans; 