'use client';

import React, { useState } from 'react';
import { uploadFileSecure, downloadFileSecure, openFileSecure } from '../utils/secureStorage';

interface TestResult {
  success: boolean;
  message: string;
  key?: string;
  error?: string;
}

export default function SecureStorageTest() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<TestResult | null>(null);
  const [downloadKey, setDownloadKey] = useState('');
  const [downloadResult, setDownloadResult] = useState<TestResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [configStatus, setConfigStatus] = useState<any>(null);

  // Test configuration
  const testConfig = {
    clubId: 'test-club-123',
    schoolId: 'test-school-456',
    userId: 'test-user-789',
  };

  const checkConfiguration = async () => {
    try {
      const response = await fetch('/api/storage/test');
      const data = await response.json();
      setConfigStatus(data);
    } catch (error) {
      setConfigStatus({
        status: 'error',
        message: 'Failed to check configuration',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadResult({
        success: false,
        message: 'Please select a file first',
      });
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const result = await uploadFileSecure(
        selectedFile,
        testConfig.clubId,
        testConfig.schoolId,
        testConfig.userId
      );

      setUploadResult(result);
      
      if (result.success && result.key) {
        setDownloadKey(result.key);
      }
    } catch (error) {
      setUploadResult({
        success: false,
        message: 'Upload failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!downloadKey) {
      setDownloadResult({
        success: false,
        message: 'Please upload a file first or enter a key',
      });
      return;
    }

    setIsDownloading(true);
    setDownloadResult(null);

    try {
      await downloadFileSecure(
        downloadKey,
        testConfig.userId,
        testConfig.clubId,
        'downloaded-file'
      );

      setDownloadResult({
        success: true,
        message: 'File downloaded successfully',
      });
    } catch (error) {
      setDownloadResult({
        success: false,
        message: 'Download failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenFile = async () => {
    if (!downloadKey) {
      setDownloadResult({
        success: false,
        message: 'Please upload a file first or enter a key',
      });
      return;
    }

    try {
      await openFileSecure(
        downloadKey,
        testConfig.userId,
        testConfig.clubId
      );

      setDownloadResult({
        success: true,
        message: 'File opened successfully',
      });
    } catch (error) {
      setDownloadResult({
        success: false,
        message: 'Failed to open file',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-xl font-semibold text-blue-900 mb-2">
          🔐 Secure Storage Test
        </h2>
        <p className="text-blue-800">
          This component tests the secure S3 storage functionality with pre-signed URLs.
          No AWS credentials are exposed to the client.
        </p>
      </div>

      {/* Configuration Check */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Configuration Status</h3>
        <button
          onClick={checkConfiguration}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Check Configuration
        </button>
        
        {configStatus && (
          <div className="mt-4 p-3 bg-white border rounded">
            <div className={`text-sm font-medium ${
              configStatus.status === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>
              {configStatus.message}
            </div>
            {configStatus.config && (
              <div className="mt-2 text-sm">
                <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                  {JSON.stringify(configStatus.config, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* File Upload Test */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">File Upload Test</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select File
            </label>
            <input
              type="file"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {selectedFile && (
            <div className="text-sm text-gray-600">
              <strong>Selected:</strong> {selectedFile.name} ({selectedFile.size} bytes)
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Upload File'}
          </button>

          {uploadResult && (
            <div className={`p-3 rounded border ${
              uploadResult.success 
                ? 'bg-green-100 border-green-300 text-green-800' 
                : 'bg-red-100 border-red-300 text-red-800'
            }`}>
              <div className="font-medium">{uploadResult.message}</div>
              {uploadResult.key && (
                <div className="mt-1 text-sm">
                  <strong>S3 Key:</strong> {uploadResult.key}
                </div>
              )}
              {uploadResult.error && (
                <div className="mt-1 text-sm">
                  <strong>Error:</strong> {uploadResult.error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* File Download Test */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">File Download Test</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              S3 Key (from upload or enter manually)
            </label>
            <input
              type="text"
              value={downloadKey}
              onChange={(e) => setDownloadKey(e.target.value)}
              placeholder="Enter S3 key to download"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleDownload}
              disabled={!downloadKey || isDownloading}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isDownloading ? 'Downloading...' : 'Download File'}
            </button>

            <button
              onClick={handleOpenFile}
              disabled={!downloadKey}
              className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Open File
            </button>
          </div>

          {downloadResult && (
            <div className={`p-3 rounded border ${
              downloadResult.success 
                ? 'bg-green-100 border-green-300 text-green-800' 
                : 'bg-red-100 border-red-300 text-red-800'
            }`}>
              <div className="font-medium">{downloadResult.message}</div>
              {downloadResult.error && (
                <div className="mt-1 text-sm">
                  <strong>Error:</strong> {downloadResult.error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Test Information */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Test Information</h3>
        <div className="text-sm text-yellow-800 space-y-2">
          <div><strong>Test Club ID:</strong> {testConfig.clubId}</div>
          <div><strong>Test School ID:</strong> {testConfig.schoolId}</div>
          <div><strong>Test User ID:</strong> {testConfig.userId}</div>
          <div className="mt-2">
            <strong>Note:</strong> This is a test environment. Files uploaded here will be stored in your 
            production S3 bucket under the test organization structure.
          </div>
        </div>
      </div>
    </div>
  );
}
