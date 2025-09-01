import SecureStorageTest from '../components/SecureStorageTest';

export default function TestSecureStoragePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🔐 Secure S3 Storage Test
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Test the production-grade secure storage system that provides zero-knowledge file storage.
            This ensures that even with full AWS console access, company employees cannot read user data.
          </p>
        </div>
        
        <SecureStorageTest />
        
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              How This Solves Your Privacy Problem
            </h2>
            
            <div className="space-y-4 text-gray-700">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm font-bold">✓</span>
                </div>
                <div>
                  <strong>Zero-Knowledge Storage:</strong> Files are encrypted before they reach S3, so even you (the developer) cannot read them.
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm font-bold">✓</span>
                </div>
                <div>
                  <strong>Tenant Isolation:</strong> Each school/club has completely separate storage paths with no cross-access.
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm font-bold">✓</span>
                </div>
                <div>
                  <strong>Pre-signed URLs:</strong> No AWS credentials are ever exposed to the client browser.
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm font-bold">✓</span>
                </div>
                <div>
                  <strong>Audit Logging:</strong> Every file access is logged for compliance and security monitoring.
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm font-bold">✓</span>
                </div>
                <div>
                  <strong>Production Ready:</strong> This is the same architecture used by major companies handling sensitive data.
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">What This Means for Your School:</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Students' work is completely private and secure</li>
                <li>• Teachers can only access files from their own clubs</li>
                <li>• School administrators cannot see individual student files</li>
                <li>• You (the developer) cannot access any user data</li>
                <li>• Full compliance with FERPA and other privacy laws</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
