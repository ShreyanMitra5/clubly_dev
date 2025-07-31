'use client';

interface ApiWithUpgradeOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  showUpgradeModal: (feature: string, current: number, limit: number) => void;
}

export async function apiWithUpgrade({
  url,
  method = 'POST',
  body,
  showUpgradeModal
}: ApiWithUpgradeOptions): Promise<any> {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (response.status === 429 && data.error === 'Feature limit exceeded') {
      // Show upgrade modal
      showUpgradeModal(
        data.feature,
        data.currentUsage || 0,
        data.limit || 0
      );
      throw new Error('Feature limit exceeded');
    }

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
} 