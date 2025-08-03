"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare, User, Clock, CheckCircle, XCircle, GraduationCap } from 'lucide-react';
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
  club_id: string;
  club_name: string;
  student_id: string;
  student_name: string;
  message: string;
  status: 'pending' | 'approved' | 'denied';
  created_at: string;
}

export default function TeacherMessaging() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [advisorRequests, setAdvisorRequests] = useState<AdvisorRequest[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<AdvisorRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAdvisorRequests();
    }
  }, [user]);

  useEffect(() => {
    if (selectedRequest) {
      fetchMessages(selectedRequest.student_id);
    }
  }, [selectedRequest]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = () => {
      setShowDropdown(null);
    };
    
    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown]);

  const fetchAdvisorRequests = async () => {
    if (!user) return;

    try {
      // First get teacher data to get teacher ID
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (teacherError) throw teacherError;

      const { data, error } = await supabase
        .from('advisor_requests')
        .select(`
          *,
          clubs(name)
        `)
        .eq('teacher_id', teacherData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdvisorRequests(data || []);
    } catch (err: any) {
      console.error('Error fetching advisor requests:', err);
      setError('Failed to load advisor requests');
    }
  };

  const fetchMessages = async (studentId: string) => {
    if (!user) return;

    try {
      console.log('TeacherMessaging: Fetching messages for student:', studentId);
      
      // Get teacher ID with error handling
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (teacherError) {
        console.error('TeacherMessaging: Error fetching teacher for messages:', teacherError);
        setError('Unable to load teacher profile');
        return;
      }

      if (!teacherData?.id) {
        console.error('TeacherMessaging: Teacher ID not found');
        setError('Teacher profile incomplete');
        return;
      }

      console.log('TeacherMessaging: Fetching conversation between:', teacherData.id, 'and', studentId);

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${teacherData.id},receiver_id.eq.${studentId}),and(sender_id.eq.${studentId},receiver_id.eq.${teacherData.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('TeacherMessaging: Error fetching messages:', error);
        throw error;
      }

      console.log('TeacherMessaging: Messages fetched successfully:', data?.length || 0, 'messages');
      setMessages(data || []);
      setError(''); // Clear any previous errors
    } catch (err: any) {
      console.error('TeacherMessaging: Fetch messages error:', err);
      setError('Failed to load messages. Please refresh and try again.');
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedRequest || !newMessage.trim()) return;

    setLoading(true);
    setError('');

    try {
      console.log('TeacherMessaging: Attempting to send message');
      
      // Get teacher ID with detailed error handling
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('id, name')
        .eq('user_id', user.id)
        .single();

      if (teacherError) {
        console.error('TeacherMessaging: Error fetching teacher data:', teacherError);
        throw new Error('Unable to find teacher profile. Please ensure your teacher account is properly set up.');
      }

      if (!teacherData?.id) {
        console.error('TeacherMessaging: Teacher data found but ID is missing:', teacherData);
        throw new Error('Teacher profile is incomplete. Please contact support.');
      }

      console.log('TeacherMessaging: Sending message with data:', {
        senderId: teacherData.id,
        receiverId: selectedRequest.student_id,
        senderName: teacherData.name,
        receiverName: selectedRequest.student_name
      });

      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          sender_id: teacherData.id,
          receiver_id: selectedRequest.student_id,
          message: newMessage.trim(),
          sender_name: teacherData.name || 'Teacher',
          receiver_name: 'Student' // Use default since we don't have student name in advisor_requests
        });

      if (insertError) {
        console.error('TeacherMessaging: Error inserting message:', insertError);
        throw new Error(`Failed to send message: ${insertError.message}`);
      }

      console.log('TeacherMessaging: Message sent successfully');
      setNewMessage('');
      
      // Refresh messages to show the new message
      await fetchMessages(selectedRequest.student_id);
      
      // Show success feedback
      console.log('TeacherMessaging: Message refresh completed');
    } catch (err: any) {
      console.error('TeacherMessaging: Send message error:', err);
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approve' | 'deny') => {
    try {
      const request = advisorRequests.find(req => req.id === requestId);
      if (!request) return;

      // Update request status
      const { error: updateError } = await supabase
        .from('advisor_requests')
        .update({ status: action === 'approve' ? 'approved' : 'denied' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Create notification for student
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: request.student_id,
          title: `Advisor Request ${action === 'approve' ? 'Approved' : 'Denied'}`,
          message: `Your advisor request for ${request.club_name} has been ${action === 'approve' ? 'approved' : 'denied'}`,
          type: 'advisor_response',
          related_id: requestId,
          read: false
        });

      if (notificationError) {
        console.error('Notification error:', notificationError);
      }

      // If approved, send a welcome message
      if (action === 'approve') {
        try {
          const { data: teacherData, error: teacherError } = await supabase
            .from('teachers')
            .select('id, name')
            .eq('user_id', user?.id)
            .single();

          if (teacherError) {
            console.error('Error fetching teacher data for welcome message:', teacherError);
            return;
          }

          if (!teacherData?.id) {
            console.error('Teacher data not found for welcome message');
            return;
          }

          const { error: messageError } = await supabase
            .from('messages')
            .insert({
              sender_id: teacherData.id,
              receiver_id: request.student_id,
              message: `Hi! I'm excited to be your advisor for ${request.club_name}. I've reviewed your club details and I'm looking forward to helping you succeed. Let's schedule a time to discuss your goals and how I can best support you.`,
              sender_name: teacherData.name || 'Teacher',
              receiver_name: 'Student' // Use default since we don't have student name in advisor_requests
            });

          if (messageError) {
            console.error('Welcome message error details:', {
              code: messageError.code,
              message: messageError.message,
              details: messageError.details,
              hint: messageError.hint,
              teacherId: teacherData.id,
              studentId: request.student_id
            });
          } else {
            console.log('Welcome message sent successfully from TeacherMessaging');
          }
        } catch (messageErr) {
          console.error('Welcome message exception in TeacherMessaging:', messageErr);
        }
      }

      // Refresh data
      await fetchAdvisorRequests();
      if (selectedRequest?.id === requestId) {
        await fetchMessages(request.student_id);
      }
    } catch (err: any) {
      console.error('Error updating request:', err);
      setError(err.message || 'Failed to update request');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const deleteConversation = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      
      // Find the request to get student and teacher IDs
      const request = advisorRequests.find(req => req.id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      // Delete all messages for this conversation
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .or(`and(sender_id.eq.${request.teacher_id},receiver_id.eq.${request.student_id}),and(sender_id.eq.${request.student_id},receiver_id.eq.${request.teacher_id})`);

      if (messagesError) {
        console.error('Error deleting messages:', messagesError);
        throw new Error('Failed to delete messages');
      }

      // If this is the selected conversation, clear it
      if (selectedRequest?.id === requestId) {
        setSelectedRequest(null);
        setMessages([]);
      }

      // Refresh advisor requests
      await fetchAdvisorRequests();
      
      alert('Conversation deleted successfully');
    } catch (err: any) {
      console.error('Error deleting conversation:', err);
      setError('Failed to delete conversation');
      alert('Failed to delete conversation');
    } finally {
      setLoading(false);
      setShowDropdown(null);
    }
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
    <div className="bg-white rounded-b-2xl shadow-sm">
      {/* Remove header since it's now in the parent component */}

      <div className="flex h-[700px] bg-gradient-to-br from-slate-50 to-blue-50/30">
        {/* Modern Sidebar */}
        <div className="w-80 bg-white/70 backdrop-blur-xl border-r border-slate-200/60 shadow-lg">
          {/* Header */}
          <div className="p-6 border-b border-slate-200/60 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-900">Student Conversations</h4>
                <p className="text-sm text-slate-600">
                  {advisorRequests.filter(req => req.status === 'approved').length} active conversations
                </p>
              </div>
            </div>
          </div>

          {/* Conversations List */}
          <div className="p-4 space-y-3 overflow-y-auto max-h-[500px]">
            {advisorRequests.map((request) => (
              <motion.div
                key={request.id}
                onClick={() => setSelectedRequest(request)}
                className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${
                  selectedRequest?.id === request.id 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg ring-1 ring-blue-200/50' 
                    : 'bg-white/60 hover:bg-white/90 border-slate-200/50 hover:border-slate-300 hover:shadow-md'
                }`}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Three Dots Menu */}
                <div className="absolute top-3 right-3 flex items-center space-x-2">
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDropdown(showDropdown === request.id ? null : request.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 rounded-full"
                    >
                      <svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                    
                    {/* Dropdown Menu */}
                    {showDropdown === request.id && (
                      <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
                        <div className="py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(request.id);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Delete Conversation</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>

                {/* Student Info */}
                <div className="pr-16">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-base">{request.student_name || 'Student'}</h4>
                      <p className="text-xs text-slate-500">
                        {formatDate(request.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Club Name - Made Bigger and Prominent */}
                  <div className="mb-3">
                    <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">
                      {request.clubs?.name || request.club_name || 'Unknown Club'}
                    </h3>
                  </div>

                  {/* Action buttons for pending requests */}
                  {request.status === 'pending' && (
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestAction(request.id, 'approve');
                        }}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestAction(request.id, 'deny');
                        }}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm rounded-lg hover:from-red-600 hover:to-rose-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Deny</span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {advisorRequests.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <div className="w-16 h-16 bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-lg font-medium">No conversations yet</p>
                <p className="text-sm text-slate-400 mt-1">Students will appear here when they request advisory</p>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {selectedRequest ? (
            <>
              {/* Modern Messages Header */}
              <div className="p-6 border-b border-slate-200/60 bg-gradient-to-r from-white to-slate-50/50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900">{selectedRequest.student_name || 'Student'}</h3>
                    <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">
                      {selectedRequest.clubs?.name || selectedRequest.club_name || 'Unknown Club'}
                    </h2>
                  </div>
                  <span className={`px-3 py-2 rounded-xl text-sm font-semibold ${getStatusColor(selectedRequest.status)} shadow-sm`}>
                    {selectedRequest.status}
                  </span>
                </div>
              </div>

              {/* Modern Messages List */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-slate-50/30 to-white">
                {messages.map((message) => {
                  const isTeacherMessage = message.sender_id === selectedRequest?.teacher_id;
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${isTeacherMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${
                        isTeacherMessage 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                          : 'bg-white text-slate-800 shadow-lg border border-slate-200/50'
                      } rounded-2xl px-4 py-3 backdrop-blur-sm`}>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            isTeacherMessage ? 'bg-white/20' : 'bg-slate-100'
                          }`}>
                            {isTeacherMessage ? (
                              <User className="w-3 h-3 text-white" />
                            ) : (
                              <User className="w-3 h-3 text-slate-600" />
                            )}
                          </div>
                          <span className={`text-xs font-semibold ${
                            isTeacherMessage ? 'text-white/80' : 'text-slate-600'
                          }`}>
                            {message.sender_name || (isTeacherMessage ? 'You' : 'Student')}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed font-medium">{message.message}</p>
                        <p className={`text-xs mt-2 ${
                          isTeacherMessage ? 'text-white/60' : 'text-slate-500'
                        }`}>
                          {formatDate(message.created_at)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
                
                {messages.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No messages yet</p>
                  </div>
                )}
              </div>

              {/* Modern Message Input */}
              <div className="p-6 border-t border-slate-200/60 bg-gradient-to-r from-white to-slate-50/50">
                <div className="flex items-end space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                        placeholder="Type your message to the student..."
                        className="w-full px-4 py-4 pr-12 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white shadow-sm backdrop-blur-sm"
                        rows={3}
                        disabled={loading}
                      />
                      <div className="absolute bottom-3 right-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <MessageSquare className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 flex items-center space-x-1">
                      <span>Press Enter to send, Shift+Enter for new line</span>
                    </p>
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={loading || !newMessage.trim()}
                    className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-light">Select a student to start messaging</p>
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