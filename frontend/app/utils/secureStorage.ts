/**
 * Secure Storage Utility
 * 
 * This utility provides secure file upload/download functionality using pre-signed URLs.
 * No AWS credentials are ever exposed to the client.
 */

export interface UploadResult {
  success: boolean;
  key?: string;
  error?: string;
}

export interface DownloadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload a file securely using a pre-signed URL
 */
export async function uploadFileSecure(
  file: File,
  clubId: string,
  schoolId: string,
  userId: string
): Promise<UploadResult> {
  try {
    // Step 1: Get pre-signed upload URL from server
    const uploadUrlResponse = await fetch('/api/storage/upload-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clubId,
        schoolId,
        userId,
        filename: file.name,
        contentType: file.type,
      }),
    });

    if (!uploadUrlResponse.ok) {
      const errorData = await uploadUrlResponse.json();
      throw new Error(errorData.error || 'Failed to get upload URL');
    }

    const { url: signedUrl, key } = await uploadUrlResponse.json();

    // Step 2: Upload file directly to S3 using pre-signed URL
    const uploadResponse = await fetch(signedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
    }

    return {
      success: true,
      key,
    };

  } catch (error) {
    console.error('Secure upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Get a secure download URL for a file
 */
export async function getDownloadUrl(
  key: string,
  userId: string,
  clubId: string
): Promise<DownloadResult> {
  try {
    const response = await fetch('/api/storage/download-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key,
        userId,
        clubId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get download URL');
    }

    const { url } = await response.json();

    return {
      success: true,
      url,
    };

  } catch (error) {
    console.error('Failed to get download URL:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get download URL',
    };
  }
}

/**
 * Download a file securely
 */
export async function downloadFileSecure(
  key: string,
  userId: string,
  clubId: string,
  filename?: string
): Promise<void> {
  try {
    const downloadResult = await getDownloadUrl(key, userId, clubId);
    
    if (!downloadResult.success || !downloadResult.url) {
      throw new Error(downloadResult.error || 'Failed to get download URL');
    }

    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = downloadResult.url;
    link.download = filename || key.split('/').pop() || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (error) {
    console.error('Secure download failed:', error);
    throw error;
  }
}

/**
 * Open a file in a new tab securely
 */
export async function openFileSecure(
  key: string,
  userId: string,
  clubId: string
): Promise<void> {
  try {
    const downloadResult = await getDownloadUrl(key, userId, clubId);
    
    if (!downloadResult.success || !downloadResult.url) {
      throw new Error(downloadResult.error || 'Failed to get download URL');
    }

    // Open in new tab
    window.open(downloadResult.url, '_blank');

  } catch (error) {
    console.error('Failed to open file securely:', error);
    throw error;
  }
}
