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
      case 'approved': return 'text-green-600 bg-green-100 border border-green-200';
      case 'denied': return 'text-red-600 bg-red-100 border border-red-200';
      case 'pending': return 'text-orange-600 bg-orange-100 border border-orange-200';
      default: return 'text-gray-600 bg-gray-100 border border-gray-200';
    }
  };

  return (
    <div className="relative bg-transparent">
      <div className="flex h-[800px] bg-gradient-to-br from-gray-50/50 via-white/80 to-orange-50/30 backdrop-blur-sm">
        {/* Ultra-Modern Sidebar */}
        <div className="w-96 bg-gradient-to-b from-white/90 via-white/80 to-white/70 backdrop-blur-2xl border-r border-white/30 shadow-2xl shadow-orange-500/10">
          {/* Elegant Header */}
          <div className="p-8 border-b border-white/20 bg-gradient-to-r from-orange-50/80 via-white/90 to-orange-50/80 backdrop-blur-xl">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-orange-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-all duration-300"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <MessageSquare className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h4 className="text-xl font-thin text-gray-900 mb-1">Student Conversations</h4>
                <div className="text-sm text-gray-500 font-light flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>{advisorRequests.filter(req => req.status === 'approved').length} active • {advisorRequests.filter(req => req.status === 'pending').length} pending</span>
                </div>
              </div>
            </div>
          </div>

          {/* Conversations List */}
          <div className="p-6 space-y-4 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-transparent">
            {advisorRequests.map((request, index) => (
              <motion.div
                key={request.id}
                onClick={() => setSelectedRequest(request)}
                className={`group relative p-6 rounded-3xl cursor-pointer transition-all duration-500 border backdrop-blur-xl ${
                  selectedRequest?.id === request.id 
                    ? 'bg-gradient-to-br from-orange-50/90 via-white/80 to-orange-100/60 border-orange-300/50 shadow-2xl shadow-orange-500/20 ring-2 ring-orange-200/30' 
                    : 'bg-gradient-to-br from-white/80 via-white/60 to-gray-50/40 hover:from-white/90 hover:via-white/80 hover:to-orange-50/30 border-gray-200/30 hover:border-orange-200/50 hover:shadow-xl hover:shadow-orange-500/10'
                }`}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
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
                <div className="pr-20">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl blur-md opacity-20"></div>
                      <div className="relative w-12 h-12 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-light text-gray-900 text-lg mb-1">{request.student_name || 'Student'}</h4>
                      <p className="text-xs text-gray-500 font-light flex items-center space-x-2">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(request.created_at)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Club Name - Clean Black */}
                  <div className="mb-4">
                    <h3 className="text-xl font-thin text-black leading-tight">
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
              {/* Ultra-Premium Messages Header */}
              <div className="p-8 border-b border-white/30 bg-gradient-to-r from-white/90 via-white/80 to-orange-50/60 backdrop-blur-2xl">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl blur-lg opacity-25"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-3xl flex items-center justify-center shadow-xl">
                      <User className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-thin text-gray-900 mb-1">{selectedRequest.student_name || 'Student'}</h3>
                    <h2 className="text-xl font-light text-black">
                      {selectedRequest.clubs?.name || selectedRequest.club_name || 'Unknown Club'}
                    </h2>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className={`px-4 py-2 rounded-2xl text-sm font-light ${getStatusColor(selectedRequest.status)} shadow-lg backdrop-blur-sm`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ultra-Modern Messages List */}
              <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-gradient-to-b from-white/60 via-white/40 to-orange-50/20 backdrop-blur-sm scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-transparent">
                {messages.map((message) => {
                  const isTeacherMessage = message.sender_id === selectedRequest?.teacher_id;
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className={`flex ${isTeacherMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`relative max-w-xs lg:max-w-md group ${
                        isTeacherMessage 
                          ? 'bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white shadow-2xl shadow-orange-500/30' 
                          : 'bg-gradient-to-br from-white via-white to-gray-50/80 text-gray-900 shadow-xl shadow-black/10 border border-white/50'
                      } rounded-3xl px-6 py-4 backdrop-blur-xl transform hover:scale-105 transition-all duration-300`}>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            isTeacherMessage ? 'bg-white/20' : 'bg-orange-100'
                          }`}>
                            {isTeacherMessage ? (
                              <User className="w-3 h-3 text-white" />
                            ) : (
                              <User className="w-3 h-3 text-orange-600" />
                            )}
                          </div>
                          <span className={`text-xs font-light ${
                            isTeacherMessage ? 'text-white/80' : 'text-gray-600'
                          }`}>
                            {message.sender_name || (isTeacherMessage ? 'You' : 'Student')}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed font-light">{message.message}</p>
                        <p className={`text-xs mt-2 font-light ${
                          isTeacherMessage ? 'text-white/60' : 'text-gray-500'
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

              {/* Ultra-Premium Message Input */}
              <div className="p-8 border-t border-white/30 bg-gradient-to-r from-white/90 via-white/80 to-orange-50/60 backdrop-blur-2xl">
                <div className="flex space-x-6 items-end">
                  <div className="flex-1">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                        placeholder="Compose your message to the student..."
                        className="relative w-full px-6 py-4 pr-14 border border-white/40 rounded-3xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-300/50 resize-none bg-white/80 shadow-xl backdrop-blur-xl font-light text-gray-900 placeholder-gray-500 transition-all duration-300 group-hover:shadow-2xl group-hover:bg-white/90"
                        rows={3}
                        disabled={loading}
                      />
                      <div className="absolute bottom-4 right-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                          <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-3 flex items-center space-x-2 font-light px-2">
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      <span>Press Enter to send • Shift+Enter for new line</span>
                    </div>
                  </div>
                  <motion.button
                    onClick={sendMessage}
                    disabled={loading || !newMessage.trim()}
                    className="px-8 py-4 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white rounded-3xl font-light transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 backdrop-blur-xl border border-orange-400/20"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </motion.button>
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