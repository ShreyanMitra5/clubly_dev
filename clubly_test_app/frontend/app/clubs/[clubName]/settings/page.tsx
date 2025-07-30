"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ProductionClubManager, ProductionClubData } from '../../../utils/productionClubManager';
import { supabase } from '../../../../utils/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Save, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff,
  Users,
  Target,
  Building,
  User,
  Info,
  Shield,
  ArrowLeft
} from 'lucide-react';

export default function ClubSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const clubName = decodeURIComponent(params.clubName as string);
  const [clubInfo, setClubInfo] = useState<ProductionClubData | null>(null);
  const [form, setForm] = useState({ description: '', mission: '', goals: '', userRole: '', audience: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (user && clubName) {
      ProductionClubManager.getUserClubs(user.id)
        .then((clubs) => {
          const club = clubs.find(c => c.clubName === clubName);
          if (club) {
            setClubInfo(club);
            setForm({
              description: club.description || '',
              mission: club.mission || '',
              goals: club.goals || '',
              userRole: club.userRole || '',
              audience: club.audience || ''
            });
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user, clubName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSuccess(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !clubInfo) return;
    
    setSaving(true);
    setError('');
    
    try {
      // First get the club ID from Supabase
      const { data: clubs, error: fetchError } = await supabase
        .from('clubs')
        .select('id')
        .eq('name', clubName)
        .eq('owner_id', user.id);

      if (fetchError || !clubs || clubs.length === 0) {
        throw new Error('Club not found or you are not authorized to update it');
      }

      const clubId = clubs[0].id;

      // Update the club via API
      const response = await fetch(`/api/clubs/${clubId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          description: form.description,
          mission: form.mission,
          goals: form.goals,
          audience: form.audience
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update club');
      }

      // Also update the local JSON file for backward compatibility
      const updatedClub = { ...clubInfo, ...form, updatedAt: new Date().toISOString() };
      await fetch(`/api/clubs/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: clubInfo.userName,
          userRole: form.userRole,
          clubs: [{
            name: clubInfo.clubName,
            description: form.description,
            mission: form.mission,
            goals: form.goals,
            audience: form.audience
          }]
        })
      });

      setSuccess(true);
      setError('');
      setClubInfo(updatedClub);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Update club error:', err);
      setError(err.message || 'Failed to update club settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClub = async () => {
    if (!user || !clubInfo || deleteConfirmation !== clubName) return;
    
    setDeleting(true);
    setError('');
    
    try {
      // First get the club ID from Supabase
      const { data: clubs, error: fetchError } = await supabase
        .from('clubs')
        .select('id')
        .eq('name', clubName)
        .eq('owner_id', user.id);

      if (fetchError || !clubs || clubs.length === 0) {
        throw new Error('Club not found or you are not authorized to delete it');
      }

      const clubId = clubs[0].id;

      // Delete the club via API
      const response = await fetch(`/api/clubs/${clubId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete club');
      }

      // Navigate back to dashboard after successful deletion
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Delete club error:', err);
      setError(err.message || 'Failed to delete club. Please try again.');
      setDeleting(false);
    }
  };

  const resetDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteConfirmation('');
    setDeleting(false);
  };

  if (loading) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center">
        <motion.div 
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-blue-500 animate-pulse"></div>
            <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        </div>
          <p className="text-lg font-medium text-gray-700">Loading settings...</p>
        </motion.div>
        </div>
    );
  }

  if (!clubInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center">
        <motion.div 
          className="text-center p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Club Not Found</h2>
          <p className="text-gray-600 mb-6">The club you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </motion.div>
        </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'danger', label: 'Danger Zone', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <div className="container-width section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push(`/clubs/${encodeURIComponent(clubName)}`)}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to {clubName}
            </button>
            
            <div className="flex items-center space-x-4 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Club Settings</h1>
                <p className="text-gray-600 font-light">Manage {clubName} preferences and configuration</p>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          <AnimatePresence>
            {success && (
              <motion.div
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-700 font-medium">Settings updated successfully!</span>
              </motion.div>
            )}

            {error && (
              <motion.div
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700 font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs */}
          <div className="mb-8">
            <div className="flex space-x-1 bg-white p-1 rounded-xl border border-gray-200 w-fit">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'general' && (
              <motion.div
                key="general"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-orange-100 p-8"
              >
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Club Description */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Info className="w-5 h-5 text-orange-500" />
                      <label className="text-lg font-semibold text-gray-900">Club Description</label>
                    </div>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all duration-200"
                      rows={4}
                      maxLength={1000}
                      placeholder="What is your club all about? Describe its purpose and activities..."
                      required
                    />
                    <p className="text-sm text-gray-500">{form.description.length}/1000 characters</p>
                  </div>

                  {/* Mission Statement */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-5 h-5 text-orange-500" />
                      <label className="text-lg font-semibold text-gray-900">Mission Statement</label>
                    </div>
                    <textarea
                      name="mission"
                      value={form.mission}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all duration-200"
                      rows={3}
                      maxLength={1000}
                      placeholder="What is your club's mission? What do you aim to achieve?"
                      required
                    />
                    <p className="text-sm text-gray-500">{form.mission.length}/1000 characters</p>
                  </div>

                  {/* Goals & Objectives */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Building className="w-5 h-5 text-orange-500" />
                      <label className="text-lg font-semibold text-gray-900">Goals & Objectives</label>
                    </div>
                    <textarea
                      name="goals"
                      value={form.goals}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all duration-200"
                      rows={3}
                      maxLength={1000}
                      placeholder="What are your specific goals and objectives for this club?"
                      required
                    />
                    <p className="text-sm text-gray-500">{form.goals.length}/1000 characters</p>
                  </div>

                  {/* User Role */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-5 h-5 text-orange-500" />
                      <label className="text-lg font-semibold text-gray-900">Your Role</label>
                    </div>
                    <input
                      name="userRole"
                      value={form.userRole}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      maxLength={100}
                      placeholder="e.g., President, Vice President, Secretary, Member..."
                      required
                    />
                  </div>

                  {/* Target Audience */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-5 h-5 text-orange-500" />
                      <label className="text-lg font-semibold text-gray-900">Target Audience</label>
                    </div>
                    <textarea
                      name="audience"
                      value={form.audience}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all duration-200"
                      rows={2}
                      maxLength={1000}
                      placeholder="Who is your target audience? What grade levels, interests, or demographics?"
                      required
                    />
                    <p className="text-sm text-gray-500">{form.audience.length}/1000 characters</p>
                  </div>

                  {/* Save Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {saving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'danger' && (
              <motion.div
                key="danger"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-red-100 p-8"
              >
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 pb-4 border-b border-red-100">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Danger Zone</h3>
                      <p className="text-gray-600">Irreversible and destructive actions</p>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <div className="flex items-start space-x-4">
                      <Trash2 className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-red-900 mb-2">Delete Club</h4>
                        <p className="text-red-700 mb-4 leading-relaxed">
                          Once you delete this club, there is no going back. This will permanently delete:
                        </p>
                        <ul className="text-red-700 space-y-1 mb-4 ml-4">
                          <li>• All club data and settings</li>
                          <li>• Meeting history and roadmaps</li>
                          <li>• Tasks and presentations</li>
                          <li>• Member contact information</li>
                        </ul>
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete Club</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete "{clubName}"?</h3>
                <p className="text-gray-600 leading-relaxed">
                  This action cannot be undone. All club data, including presentations, tasks, and member information will be permanently deleted.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type <span className="font-bold text-red-600">{clubName}</span> to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    placeholder={clubName}
                    disabled={deleting}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={resetDeleteModal}
                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteClub}
                    disabled={deleteConfirmation !== clubName || deleting}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {deleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Club</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 