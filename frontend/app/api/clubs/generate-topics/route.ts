import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    const { clubTopic, clubGoals, meetingCount } = await request.json();

    if (!clubTopic || !clubGoals || !meetingCount) {
      return NextResponse.json(
        { error: 'Club topic, goals, and meeting count are required' },
        { status: 400 }
      );
    }

    const prompt = `You are an expert club advisor. Generate EXACTLY ${meetingCount} specific, progressive meeting topics for a ${clubTopic} club.

CLUB TOPIC: ${clubTopic}
CLUB GOALS: ${clubGoals}
REQUIRED MEETINGS: ${meetingCount} (EXACTLY - NO MORE, NO LESS)

CRITICAL REQUIREMENTS:
1. Generate EXACTLY ${meetingCount} meeting topics - no more, no fewer
2. Each topic MUST be highly specific to ${clubTopic}
3. Topics must be progressive - each builds on the previous
4. Include specific skills, techniques, or concepts to learn
5. Make topics actionable with clear learning objectives
6. Use specific terminology and industry-standard practices
7. Include hands-on activities, projects, or workshops
8. Topics should directly relate to the club goals: ${clubGoals}

MEETING TOPIC FORMAT:
- Use specific, descriptive titles
- Include the main skill/concept being taught
- Mention specific tools, techniques, or projects
- Make it clear what students will accomplish

EXAMPLES BY CLUB TYPE:

For Programming Club:
- "Python Fundamentals: Variables, Data Types, and Basic Operations"
- "Control Structures: If Statements, Loops, and Error Handling"
- "Functions and Modules: Code Organization and Reusability"
- "Data Structures: Lists, Dictionaries, and File I/O"
- "Object-Oriented Programming: Classes, Inheritance, and Polymorphism"

For Robotics Club:
- "Robot Components: Understanding Motors, Sensors, and Controllers"
- "Basic Movement Programming: Forward, Backward, and Turning"
- "Sensor Integration: Touch, Light, and Distance Sensors"
- "Autonomous Navigation: Line Following and Obstacle Avoidance"
- "Advanced Programming: PID Control and Complex Behaviors"

For Math Club:
- "Problem-Solving Strategies: Breaking Down Complex Problems"
- "Mathematical Modeling: Real-World Applications"
- "Advanced Algebra: Systems of Equations and Inequalities"
- "Geometry and Trigonometry: Practical Applications"
- "Statistics and Probability: Data Analysis and Interpretation"

For Art Club:
- "Fundamentals of Drawing: Perspective, Proportion, and Shading"
- "Color Theory: Understanding Hue, Saturation, and Value"
- "Digital Art Tools: Introduction to Design Software"
- "Portrait Drawing: Facial Features and Expressions"
- "Mixed Media Techniques: Combining Traditional and Digital"

For Business/Entrepreneurship Club:
- "Idea Generation: Brainstorming Techniques and Opportunity Recognition"
- "Market Research: Customer Validation and Competitive Analysis"
- "Business Model Canvas: Revenue Streams and Value Propositions"
- "Financial Planning: Budgeting, Pricing, and Break-Even Analysis"
- "Marketing Strategy: Brand Development and Customer Acquisition"

For Science Club:
- "Scientific Method: Hypothesis Formation and Experimental Design"
- "Data Collection: Measurement Techniques and Accuracy"
- "Statistical Analysis: Interpreting Results and Drawing Conclusions"
- "Lab Safety: Proper Procedures and Equipment Handling"
- "Research Presentation: Communicating Scientific Findings"

Return a JSON object with this EXACT structure:
{
  "meetings": [array of exactly ${meetingCount} meeting topic strings],
  "specialEvents": [array of 2-4 special event objects with title and description]
}

Each meeting topic should be a specific, actionable title that clearly indicates what will be learned or accomplished. Be extremely specific to ${clubTopic} and make each meeting count.

Return ONLY the JSON object, no explanation.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a strict, detail-oriented club advisor. You MUST generate EXACTLY the number of meetings requested. Each topic must be highly specific to the club's focus area, progressive in difficulty, and actionable. Use specific terminology, mention concrete skills or tools, and ensure every meeting has clear learning objectives. Never generate fewer or more meetings than requested."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.8,
      max_tokens: 3000,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response from Groq');
    }

    // Try to parse the JSON response
    let result;
    try {
      result = JSON.parse(response);
      
      // Handle both new format and legacy format
      if (result.meetings && result.specialEvents) {
        // New format with meetings and special events
        return NextResponse.json({
          topics: result.meetings.slice(0, meetingCount),
          specialEvents: result.specialEvents || []
        });
      } else if (Array.isArray(result)) {
        // Legacy format - just topics array
        return NextResponse.json({
          topics: result.slice(0, meetingCount),
          specialEvents: []
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (parseError) {
      // If JSON parsing fails, try to extract topics from the response
      console.log('Raw response:', response);
      
      // Try to find JSON object or array in the response
      const jsonMatch = response.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.meetings) {
            return NextResponse.json({
              topics: parsed.meetings.slice(0, meetingCount),
              specialEvents: parsed.specialEvents || []
            });
          } else if (Array.isArray(parsed)) {
            return NextResponse.json({
              topics: parsed.slice(0, meetingCount),
              specialEvents: []
            });
          }
        } catch (e) {
          // Continue to fallback
        }
      }
      
      // Fallback: split by lines and clean up
      const topics = response
        .split('\n')
        .filter(line => line.trim() && !line.includes('```'))
        .map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim())
        .filter(topic => topic.length > 10)
        .slice(0, meetingCount);
      
      return NextResponse.json({
        topics: topics,
        specialEvents: []
      });
    }

  } catch (error) {
    console.error('Error generating topics:', error);
    
    // Fallback topics if AI fails - generate specific topics based on club type
    const generateFallbackTopics = (clubTopic: string, count: number) => {
      const topicLower = clubTopic.toLowerCase();
      let baseTopics = [];
      
      if (topicLower.includes('program') || topicLower.includes('code') || topicLower.includes('python') || topicLower.includes('java')) {
        baseTopics = [
          "Programming Fundamentals: Variables, Data Types, and Basic Operations",
          "Control Structures: If Statements, Loops, and Error Handling",
          "Functions and Methods: Code Organization and Reusability",
          "Data Structures: Arrays, Lists, and Collections",
          "Object-Oriented Programming: Classes and Objects",
          "File I/O and Data Processing",
          "Web Development Basics: HTML, CSS, and JavaScript",
          "Database Integration: SQL and Data Management",
          "API Development: Creating and Consuming APIs",
          "Testing and Debugging Techniques",
          "Version Control: Git and Collaboration",
          "Final Project: Complete Application Development"
        ];
      } else if (topicLower.includes('robot') || topicLower.includes('automation')) {
        baseTopics = [
          "Robot Components: Motors, Sensors, and Controllers",
          "Basic Movement Programming: Forward, Backward, and Turning",
          "Sensor Integration: Touch, Light, and Distance Sensors",
          "Autonomous Navigation: Line Following and Obstacle Avoidance",
          "Advanced Programming: PID Control and Complex Behaviors",
          "Robot Vision: Camera Integration and Image Processing",
          "Wireless Communication: Bluetooth and WiFi Control",
          "Mechanical Design: Chassis, Grippers, and Manipulators",
          "Power Management: Batteries and Energy Efficiency",
          "Competition Preparation: Strategy and Optimization",
          "Team Collaboration: Multi-Robot Systems",
          "Final Robot Showcase and Competition"
        ];
      } else if (topicLower.includes('math') || topicLower.includes('calculus') || topicLower.includes('algebra')) {
        baseTopics = [
          "Problem-Solving Strategies: Breaking Down Complex Problems",
          "Mathematical Modeling: Real-World Applications",
          "Advanced Algebra: Systems of Equations and Inequalities",
          "Geometry and Trigonometry: Practical Applications",
          "Statistics and Probability: Data Analysis and Interpretation",
          "Calculus Fundamentals: Limits, Derivatives, and Integrals",
          "Mathematical Proofs: Logic and Reasoning",
          "Number Theory: Patterns and Properties",
          "Graph Theory: Networks and Connections",
          "Mathematical Competitions: Strategy and Practice",
          "Applied Mathematics: Industry and Research Applications",
          "Final Mathematical Project and Presentation"
        ];
      } else if (topicLower.includes('art') || topicLower.includes('creative') || topicLower.includes('design')) {
        baseTopics = [
          "Fundamentals of Drawing: Perspective, Proportion, and Shading",
          "Color Theory: Understanding Hue, Saturation, and Value",
          "Digital Art Tools: Introduction to Design Software",
          "Portrait Drawing: Facial Features and Expressions",
          "Mixed Media Techniques: Combining Traditional and Digital",
          "Typography and Layout Design",
          "Character Design and Storytelling",
          "Landscape and Environmental Art",
          "Art History and Master Studies",
          "Portfolio Development and Presentation",
          "Collaborative Art Projects",
          "Final Art Exhibition and Showcase"
        ];
      } else if (topicLower.includes('business') || topicLower.includes('entrepreneur')) {
        baseTopics = [
          "Idea Generation: Brainstorming Techniques and Opportunity Recognition",
          "Market Research: Customer Validation and Competitive Analysis",
          "Business Model Canvas: Revenue Streams and Value Propositions",
          "Financial Planning: Budgeting, Pricing, and Break-Even Analysis",
          "Marketing Strategy: Brand Development and Customer Acquisition",
          "Sales Techniques and Customer Relations",
          "Legal Basics for Business: Contracts and Regulations",
          "Pitch Development and Presentation Skills",
          "Investor Relations and Fundraising",
          "Operations and Supply Chain Management",
          "Business Plan Competition Preparation",
          "Final Business Pitch and Demo Day"
        ];
      } else {
        // Generic but specific topics for any club
        baseTopics = [
          `${clubTopic} Fundamentals: Core Concepts and Basic Principles`,
          `${clubTopic} Skills Development: Essential Techniques and Methods`,
          `Hands-on ${clubTopic} Workshop: Practical Application`,
          `${clubTopic} Tools and Technology: Industry-Standard Equipment`,
          `Advanced ${clubTopic} Concepts: Complex Problem Solving`,
          `${clubTopic} Project Planning: Strategy and Execution`,
          `Guest Speaker Session: Industry Expert Insights`,
          `${clubTopic} Collaboration: Team Projects and Communication`,
          `${clubTopic} Innovation: Creative Problem Solving`,
          `${clubTopic} Quality Assurance: Standards and Best Practices`,
          `${clubTopic} Competition or Challenge: Skill Testing`,
          `Final ${clubTopic} Project: Comprehensive Application`
        ];
      }
      
      // Ensure we return exactly the requested number of topics
      return baseTopics.slice(0, count);
    };

    const topics = generateFallbackTopics(clubTopic, meetingCount);

    return NextResponse.json({ 
      topics,
      specialEvents: [],
      note: 'Fallback topics generated due to AI service unavailability'
    });
  }
} 