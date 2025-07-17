"use client";

import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";

const LoadingScreen = () => {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    fetch('/DataSphere.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => {
        console.error("Error loading Lottie animation:", error);
        setAnimationData(null);
      });
  }, []);

  if (!animationData) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-pulse-200 border-t-pulse-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-pulse-600 text-lg font-medium">Getting your space ready...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 mb-6 flex items-center justify-center">
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
            style={{ width: "100%", height: "100%" }}
            rendererSettings={{
              preserveAspectRatio: "xMidYMid slice",
            }}
          />
        </div>
        <p className="text-pulse-600 text-lg font-medium">Getting your space ready...</p>
      </div>
    </div>
  );
};

export default LoadingScreen; 