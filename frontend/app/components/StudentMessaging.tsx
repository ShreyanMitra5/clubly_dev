"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare, User, Clock } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import { useUser } from '@clerk/nextjs';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  sender_name: string;
  receiver_name: string;
}

interface AdvisorRequest {
  id: string;
  teacher_id: string;
  student_id: string;
  message: string;
  status: 'pending' | 'approved' | 'denied';
  created_at: string;
  teacher: {
    name: string;
    subject: string;
  };
}

interface StudentMessagingProps {
  onBack?: () => void;
  clubInfo?: any;
  user?: any;
}

export default function StudentMessaging({ onBack, clubInfo, user: propUser }: StudentMessagingProps) {
  const { user: authUser } = useUser();
  const user = propUser || authUser; // Use prop user if provided, fallback to auth user
  const [messages, setMessages] = useState<Message[]>([]);
  const [advisorRequests, setAdvisorRequests] = useState<AdvisorRequest[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<AdvisorRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchAdvisorRequests();
    }
  }, [user]);

  useEffect(() => {
    if (selectedRequest) {
      fetchMessages(selectedRequest.teacher_id);
    }
  }, [selectedRequest]);

  const fetchAdvisorRequests = async () => {
    if (!user || !clubInfo?.id) return;

    try {
      console.log('StudentMessaging: Fetching advisor requests for club:', clubInfo.id);
      const { data, error } = await supabase
        .from('advisor_requests')
        .select(`
          *,
          teacher:teachers(name, subject)
        `)
        .eq('student_id', user.id)
        .eq('club_id', clubInfo.id) // FILTER BY CLUB ID
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('StudentMessaging: Club-specific advisor requests:', data);
      setAdvisorRequests(data || []);
    } catch (err: any) {
      console.error('Error fetching advisor requests:', err);
      setError('Failed to load advisor requests');
    }
  };

  const fetchMessages = async (teacherId: string) => {
    if (!user) return;

    try {
      console.log('Fetching messages between:', user.id, 'and', teacherId);
      
      // First check if messages table exists by trying a simple query
      const { data: testData, error: testError } = await supabase
        .from('messages')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.error('Messages table might not exist:', testError);
        setMessages([]);
        return;
      }

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${teacherId}),and(sender_id.eq.${teacherId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }
      
      console.log('Messages fetched:', data);
      setMessages(data || []);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please make sure the messages table exists.');
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedRequest || !newMessage.trim()) return;

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedRequest.teacher_id,
          message: newMessage.trim(),
          sender_name: user.fullName || user.firstName || 'Student',
          receiver_name: selectedRequest.teacher.name
        });

      if (error) throw error;

      setNewMessage('');
      // Refresh messages
      await fetchMessages(selectedRequest.teacher_id);
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'denied': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-lg">
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-light text-gray-900 mb-2">Advisor Messages</h2>
            <p className="text-gray-600 font-light">Stay connected with your club advisors</p>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors bg-gray-100 hover:bg-gray-200 rounded-lg font-light"
            >
              ← Back to Advisor System
            </button>
          )}
        </div>
      </div>

      <div className="flex h-[600px]">
        {/* Advisor Requests Sidebar */}
        <div className="w-1/3 border-r border-gray-200/50 bg-gray-50/30">
          <div className="p-6">
            <h3 className="text-xl font-light text-gray-900 mb-6">Advisor Requests</h3>
            <div className="space-y-3">
              {advisorRequests.map((request) => (
                <motion.div
                  key={request.id}
                  onClick={() => setSelectedRequest(request)}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                    selectedRequest?.id === request.id 
                      ? 'bg-orange-100 border-orange-300 shadow-lg' 
                      : 'bg-white hover:bg-gray-50 border-gray-200/50 hover:border-gray-300'
                  }`}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 text-lg">{request.teacher.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{request.teacher.subject}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(request.created_at)}
                  </p>
                </motion.div>
              ))}
              
              {advisorRequests.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-light">No advisor requests yet</p>
                  <p className="text-sm text-gray-400 mt-2">Start by finding an advisor for your club</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedRequest ? (
            <>
              {/* Messages Header */}
              <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-orange-50 to-orange-100/50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-light text-gray-900">{selectedRequest.teacher.name}</h3>
                    <p className="text-sm text-gray-600">{selectedRequest.teacher.subject}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/30">
                {messages.map((message) => {
                  const isStudentMessage = message.sender_id === user?.id;
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isStudentMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl shadow-sm ${
                        isStudentMessage 
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' 
                          : 'bg-white text-gray-900 border border-gray-200/50'
                      }`}>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`text-xs font-medium ${
                            isStudentMessage ? 'text-orange-100' : 'text-gray-600'
                          }`}>
                            {message.sender_name || (isStudentMessage ? 'You' : 'Teacher')}
                          </span>
                        </div>
                        <p className="text-sm font-light leading-relaxed">{message.message}</p>
                        <p className={`text-xs mt-2 ${
                          isStudentMessage ? 'text-orange-100' : 'text-gray-500'
                        }`}>
                          {formatDate(message.created_at)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
                
                {messages.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-light">No messages yet</p>
                    <p className="text-sm text-gray-400 mt-2">Start a conversation with your advisor</p>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-gray-200/50 bg-white">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-light"
                    disabled={loading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading || !newMessage.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-light hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50/30">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-6 opacity-50" />
                <p className="text-xl font-light text-gray-700">Select an advisor to start messaging</p>
                <p className="text-sm text-gray-400 mt-2">Choose from your advisor requests to begin communicating</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border-t border-red-200">
          <p className="text-red-600 text-sm font-light">{error}</p>
        </div>
      )}
    </div>
  );
} 