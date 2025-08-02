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
        .select('*')
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
          receiver_name: selectedRequest.student_name
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
              receiver_name: request.student_name
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

      <div className="flex h-[500px]">
        {/* Student List Sidebar */}
        <div className="w-1/3 border-r border-gray-200 bg-gray-50">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Students</h3>
            <p className="text-sm text-gray-600">
              {advisorRequests.filter(req => req.status === 'approved').length} active conversations
            </p>
          </div>
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">Advisor Requests</h4>
            <div className="space-y-3">
              {advisorRequests.map((request) => (
                <motion.div
                  key={request.id}
                  onClick={() => setSelectedRequest(request)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedRequest?.id === request.id 
                      ? 'bg-orange-100 border-orange-300' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{request.student_name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{request.club_name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(request.created_at)}
                  </p>
                  
                  {/* Action buttons for pending requests */}
                  {request.status === 'pending' && (
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestAction(request.id, 'approve');
                        }}
                        className="flex-1 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors flex items-center justify-center space-x-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestAction(request.id, 'deny');
                        }}
                        className="flex-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors flex items-center justify-center space-x-1"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Deny</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
              
              {advisorRequests.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No advisor requests yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {selectedRequest ? (
            <>
              {/* Messages Header */}
              <div className="p-4 border-b border-gray-200/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedRequest.student_name}</h3>
                    <p className="text-sm text-gray-600">{selectedRequest.club_name}</p>
                  </div>
                  <span className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_id === user?.id 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatDate(message.created_at)}
                      </p>
                    </div>
                  </motion.div>
                ))}
                
                {messages.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No messages yet</p>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-gray-200 bg-white">
                <div className="flex items-end space-x-4">
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                      placeholder="Type your message to the student..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={loading || !newMessage.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
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