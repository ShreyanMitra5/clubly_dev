'use client';

import { useState } from 'react';

export default function TestTeacherCounts() {
  const [currentState, setCurrentState] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const checkCurrentState = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/fix-teacher-counts');
      const data = await response.json();
      setCurrentState(data);
      setMessage(`Found ${data.inconsistencies} inconsistencies out of ${data.teachers?.length || 0} teachers`);
    } catch (error) {
      console.error('Error checking state:', error);
      setMessage('Error checking current state');
    } finally {
      setLoading(false);
    }
  };

  const fixCounts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/fix-teacher-counts', { method: 'POST' });
      const data = await response.json();
      setCurrentState(data);
      setMessage(`Fixed ${data.updatesApplied} teacher counts. ${data.approvedRequestsCount} total approved requests.`);
    } catch (error) {
      console.error('Error fixing counts:', error);
      setMessage('Error fixing teacher counts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Teacher Club Counts Debug</h1>
      
      <div className="mb-6 space-x-4">
        <button
          onClick={checkCurrentState}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Check Current State'}
        </button>
        
        <button
          onClick={fixCounts}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Fixing...' : 'Fix Teacher Counts'}
        </button>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-800">{message}</p>
        </div>
      )}

      {currentState && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Teacher Data</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Current Count</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Max Clubs</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Actual Approved</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentState.teachers?.map((teacher: any) => (
                    <tr key={teacher.id} className={teacher.count_matches === false ? 'bg-red-50' : ''}>
                      <td className="border border-gray-300 px-4 py-2">{teacher.name}</td>
                      <td className="border border-gray-300 px-4 py-2">{teacher.current_clubs_count}</td>
                      <td className="border border-gray-300 px-4 py-2">{teacher.max_clubs}</td>
                      <td className="border border-gray-300 px-4 py-2">{teacher.actual_approved_requests || 0}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {teacher.count_matches ? (
                          <span className="text-green-600">✓ Correct</span>
                        ) : (
                          <span className="text-red-600">✗ Mismatch</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {currentState.before && currentState.after && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Before/After Comparison</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Before Fix</h3>
                  <div className="space-y-2">
                    {currentState.before.map((teacher: any) => (
                      <div key={teacher.id} className="p-2 bg-gray-50 rounded">
                        <strong>{teacher.name}:</strong> {teacher.current_clubs_count}/{teacher.max_clubs}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">After Fix</h3>
                  <div className="space-y-2">
                    {currentState.after.map((teacher: any) => (
                      <div key={teacher.id} className="p-2 bg-green-50 rounded">
                        <strong>{teacher.name}:</strong> {teacher.current_clubs_count}/{teacher.max_clubs}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 