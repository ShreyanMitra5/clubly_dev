"use client";

import React, { useRef } from "react";

interface TestimonialProps {
  content: string;
  author: string;
  role: string;
  gradient: string;
  backgroundImage?: string;
}

const testimonials: TestimonialProps[] = [{
  content: "Clubly saved my life! I used to spend hours making slides that nobody cared about. Now I actually have time to plan fun stuff for our robotics club.",
  author: "Emma Johnson",
  role: "President, Lincoln High Robotics Club",
  gradient: "from-blue-700 via-indigo-800 to-purple-900",
  backgroundImage: "/background-section1.png"
}, {
  content: "We went from barely getting 10 people to show up to having 40+ members at every meeting. Clubly's event ideas are seriously good.",
  author: "Marcus Williams",
  role: "Co-founder, Roosevelt High Debate Society",
  gradient: "from-indigo-900 via-purple-800 to-orange-500",
  backgroundImage: "/background-section2.png"
}, {
  content: "I had no idea what I was doing when I started our environmental club. Clubly's AI advisor basically planned our whole semester for me.",
  author: "Sophia Chen",
  role: "Founder, Washington High Environmental Club",
  gradient: "from-purple-800 via-pink-700 to-red-500",
  backgroundImage: "/background-section3.png"
}, {
  content: "The email thing is a game-changer. No more texting everyone individually - now everyone actually gets our announcements.",
  author: "Alex Rodriguez",
  role: "VP Communications, Kennedy High Drama Club",
  gradient: "from-orange-600 via-red-500 to-purple-600",
  backgroundImage: "/background-section1.png"
}];

const TestimonialCard = ({
  content,
  author,
  role,
  backgroundImage = "/background-section1.png"
}: TestimonialProps) => {
  return <div className="bg-cover bg-center rounded-lg p-8 h-full flex flex-col justify-between text-white transform transition-transform duration-300 hover:-translate-y-2 relative overflow-hidden" style={{
    backgroundImage: `url('${backgroundImage}')`
  }}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white z-10"></div>
      
      <div className="relative z-0">
        <p className="text-xl mb-8 font-medium leading-relaxed pr-20">{`"${content}"`}</p>
        <div>
          <h4 className="font-semibold text-xl">{author}</h4>
          <p className="text-white/80">{role}</p>
        </div>
      </div>
    </div>;
};

const LandingTestimonials = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  return <section className="py-12 bg-white relative" id="testimonials" ref={sectionRef}>
      <div className="section-container">
        <div className="flex items-center gap-4 mb-6">
          <div className="pulse-chip">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-pulse-500 text-white mr-2">💬</span>
            <span>Student Success Stories</span>
          </div>
        </div>
        
        <h2 className="text-5xl font-display font-bold mb-12 text-left">What student leaders say</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => <TestimonialCard key={index} content={testimonial.content} author={testimonial.author} role={testimonial.role} gradient={testimonial.gradient} backgroundImage={testimonial.backgroundImage} />)}
        </div>
      </div>
    </section>;
};

export default LandingTestimonials; 