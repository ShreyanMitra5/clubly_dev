"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { XIcon } from '@heroicons/react/outline';
import { ChatAlt2Icon } from '@heroicons/react/solid';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  system?: boolean;
}

export default function ClubAdvisorPage() {
  const params = useParams();
  const router = useRouter();
  const clubName = decodeURIComponent(params.clubName as string);
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello! I'm your AI Club Advisor for ${clubName}. I'm here to help you plan exciting events, manage your club activities, and provide guidance on running a successful club. What would you like to discuss today?`,
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history from localStorage
  useEffect(() => {
    if (!user) return;
    const key = `advisorChatHistory_${user.id}_${clubName}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setMessages(JSON.parse(saved).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
    }
  }, [user, clubName]);

  // Save chat history to localStorage
  useEffect(() => {
    if (!user) return;
    const key = `advisorChatHistory_${user.id}_${clubName}`;
    localStorage.setItem(key, JSON.stringify(messages));
  }, [messages, user, clubName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call to Groq
      const response = await fetch('/api/clubs/advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          clubName: clubName
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || "I'm here to help! What would you like to know about managing your club?",
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
      {/* Chat Card */}
      <div className="w-full max-w-2xl h-[80vh] flex flex-col rounded-3xl shadow-2xl border border-gray-200 bg-white overflow-hidden relative mx-4 md:mx-auto" style={{ minWidth: 350 }}>
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white">
          <span className="font-bold text-2xl text-gray-900">Chat</span>
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100 transition"><XIcon className="w-7 h-7 text-gray-500" /></button>
        </div>
        {/* Live Chat Bar */}
        <div className="flex items-center gap-3 px-8 py-3 bg-[#2d3e50] text-white text-base font-semibold border-b border-gray-200">
          <ChatAlt2Icon className="w-6 h-6 text-white" />
          Live Chat
        </div>
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 bg-white" style={{scrollBehavior:'smooth'}}>
          {messages.map((message, idx) => (
            <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} w-full`}>
              {/* System message */}
              {message.system ? (
                <div className="bg-gray-100 text-gray-500 text-xs px-3 py-2 rounded-lg max-w-[80%] shadow-sm">
                  {message.content}
                  <div className="text-[10px] text-gray-400 mt-1">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              ) : message.isUser ? (
                <div className="flex flex-col items-end max-w-[80%]">
                  <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-xl rounded-br-3xl shadow-sm text-sm">
                    {message.content}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1 pr-1">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              ) : (
                <div className="flex items-end max-w-[80%]">
                  <Image src="/logo-rounded.png" alt="Clubly Logo" width={28} height={28} className="rounded-full border border-gray-200 bg-white mr-2" />
                  <div className="flex flex-col">
                    <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-xl rounded-bl-3xl shadow-sm text-sm">
                      {message.content}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1 pl-1">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start w-full">
              <Image src="/logo-rounded.png" alt="Clubly Logo" width={28} height={28} className="rounded-full border border-gray-200 bg-white mr-2" />
              <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-xl rounded-bl-3xl shadow-sm text-sm flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Input Area */}
        <form onSubmit={handleSubmit} className="flex items-center gap-3 px-8 py-4 border-t border-gray-200 bg-white">
          {/* Optional icons */}
          <button type="button" className="p-1 rounded hover:bg-gray-100"><span className="text-base font-bold text-gray-400">T</span></button>
          <button type="button" className="p-1 rounded hover:bg-gray-100"><span className="text-base font-bold text-gray-400">🔊</span></button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type Something..."
            className="flex-1 px-5 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-base"
            disabled={isLoading}
            style={{ fontFamily: 'Inter, sans-serif' }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { handleSubmit(e); } }}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 transition text-white shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
} 