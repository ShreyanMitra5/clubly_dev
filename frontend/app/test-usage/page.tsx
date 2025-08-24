'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { apiWithUpgrade } from '../utils/apiWithUpgrade';
import { useUpgradeModal } from '../hooks/useUpgradeModal';
// import UpgradeModal from '../components/UpgradeModal';

export default function TestUsagePage() {
  const { user } = useUser();
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const upgradeModal = useUpgradeModal();

  useEffect(() => {
    if (user) {
      fetchUsage();
    }
  }, [user]);

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/user-usage');
      const data = await response.json();
      setUsage(data.data);
    } catch (error) {
      console.error('Error fetching usage:', error);
    }
  };

  const testTitleGeneration = async () => {
    setLoading(true);
    try {
      const result = await apiWithUpgrade({
        url: '/api/attendance-notes/generate-title',
        method: 'POST',
        body: { summary: 'This is a test meeting summary to test the title generation feature.' },
        showUpgradeModal: upgradeModal.showUpgradeModal
      });
      alert(`Generated title: ${result.title}`);
      fetchUsage(); // Refresh usage
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="p-8">Please sign in to test usage tracking.</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Usage Tracking Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Current Usage */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Current Usage</h2>
          {usage ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Tier: {usage.tier}</p>
                <p className="text-sm text-gray-600">Total Tokens: {usage.totalTokens.used}</p>
              </div>
              
              {Object.entries(usage.features).map(([feature, data]: [string, any]) => (
                <div key={feature} className="border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="text-sm text-gray-600">{data.used}/{data.limit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((data.used / data.limit) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Loading usage data...</p>
          )}
        </div>

        {/* Test Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          
          <div className="space-y-4">
            <button
              onClick={testTitleGeneration}
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Title Generation'}
            </button>
            
            <button
              onClick={fetchUsage}
              className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
            >
              Refresh Usage
            </button>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-2">How to test:</h3>
            <ol className="text-sm text-yellow-700 space-y-1">
              <li>1. Click "Test Title Generation" a few times</li>
              <li>2. Watch the usage counter increase</li>
              <li>3. After 2 uses, you should see the upgrade modal</li>
              <li>4. The modal will show your current usage and limits</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
              {/* <UpgradeModal
          isOpen={upgradeModal.isOpen}
          onClose={upgradeModal.hideUpgradeModal}
          featureName={upgradeModal.featureName}
          currentUsage={upgradeModal.currentUsage}
          limit={upgradeModal.limit}
        /> */}
    </div>
  );
} 