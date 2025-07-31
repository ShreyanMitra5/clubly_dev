'use client';

import { useState } from 'react';

interface UseUpgradeModalReturn {
  isOpen: boolean;
  featureName: string;
  currentUsage: number;
  limit: number;
  showUpgradeModal: (feature: string, current: number, max: number) => void;
  hideUpgradeModal: () => void;
}

export function useUpgradeModal(): UseUpgradeModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [featureName, setFeatureName] = useState('');
  const [currentUsage, setCurrentUsage] = useState(0);
  const [limit, setLimit] = useState(0);

  const showUpgradeModal = (feature: string, current: number, max: number) => {
    setFeatureName(feature);
    setCurrentUsage(current);
    setLimit(max);
    setIsOpen(true);
  };

  const hideUpgradeModal = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    featureName,
    currentUsage,
    limit,
    showUpgradeModal,
    hideUpgradeModal,
  };
} 