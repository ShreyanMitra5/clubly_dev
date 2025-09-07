/**
 * Client-side utilities for working with presigned S3 URLs
 * These functions run in the browser and handle file uploads/downloads
 */

export interface PresignedUploadResponse {
  success: boolean;
  url: string;
  key: string;
  metadata: {
    filename: string;
    contentType: string;
    clubId: string;
    userId: string;
    schoolId?: string;
    expiresIn: number;
  };
}

export interface PresignedDownloadResponse {
  success: boolean;
  url: string;
  metadata: {
    key: string;
    clubId: string;
    userId: string;
    expiresIn: number;
  };
}

/**
 * Request a presigned upload URL from the server
 */
export async function requestPresignedUploadUrl(
  filename: string,
  contentType: string,
  clubId: string,
  userId: string,
  schoolId?: string
): Promise<PresignedUploadResponse> {
  const response = await fetch('/api/s3/presigned-upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filename,
      contentType,
      clubId,
      userId,
      schoolId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get upload URL');
  }

  return response.json();
}

/**
 * Request a presigned download URL from the server
 */
export async function requestPresignedDownloadUrl(key: string): Promise<PresignedDownloadResponse> {
  const response = await fetch('/api/s3/presigned-download', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get download URL');
  }

  return response.json();
}

/**
 * Upload a file using a presigned URL
 */
export async function uploadFileWithPresignedUrl(
  file: File,
  presignedUrl: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed due to network error'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was aborted'));
    });

    xhr.open('PUT', presignedUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
}

/**
 * Download a file using a presigned URL
 */
export async function downloadFileWithPresignedUrl(
  presignedUrl: string,
  filename?: string
): Promise<void> {
  try {
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = presignedUrl;
    link.download = filename || 'download';
    link.target = '_blank';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    throw new Error('Failed to download file');
  }
}

/**
 * Complete upload flow: get presigned URL and upload file
 */
export async function uploadFileToS3(
  file: File,
  clubId: string,
  userId: string,
  schoolId?: string,
  onProgress?: (progress: number) => void
): Promise<{ key: string; success: boolean }> {
  try {
    // Step 1: Get presigned upload URL
    const uploadResponse = await requestPresignedUploadUrl(
      file.name,
      file.type,
      clubId,
      userId,
      schoolId
    );

    // Step 2: Upload file using presigned URL
    await uploadFileWithPresignedUrl(file, uploadResponse.url, onProgress);

    return {
      key: uploadResponse.key,
      success: true,
    };
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

/**
 * Complete download flow: get presigned URL and download file
 */
export async function downloadFileFromS3(
  key: string,
  filename?: string
): Promise<void> {
  try {
    // Step 1: Get presigned download URL
    const downloadResponse = await requestPresignedDownloadUrl(key);

    // Step 2: Download file using presigned URL
    await downloadFileWithPresignedUrl(downloadResponse.url, filename);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}

/**
 * Open a file in a new tab using presigned URL
 */
export async function openFileInNewTab(key: string): Promise<void> {
  try {
    const downloadResponse = await requestPresignedDownloadUrl(key);
    window.open(downloadResponse.url, '_blank');
  } catch (error) {
    console.error('Failed to open file:', error);
    throw error;
  }
}
