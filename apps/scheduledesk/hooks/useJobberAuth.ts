'use client';

import { useState, useCallback } from 'react';

export interface JobberAuthState {
  needsReauth: boolean;
  showReauthModal: boolean;
  openReauthModal: () => void;
  closeReauthModal: () => void;
  checkAuthStatus: (response: Response) => boolean;
}

/**
 * Hook to manage Jobber authentication state and reauth modal
 * Returns utilities to detect 401s and show reauth modal
 */
export const useJobberAuth = (): JobberAuthState => {
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [needsReauth, setNeedsReauth] = useState(false);

  const openReauthModal = useCallback(() => {
    setNeedsReauth(true);
    setShowReauthModal(true);
  }, []);

  const closeReauthModal = useCallback(() => {
    setShowReauthModal(false);
  }, []);

  /**
   * Check if a response indicates auth failure
   * Returns true if authenticated, false if needs reauth
   */
  const checkAuthStatus = useCallback((response: Response): boolean => {
    if (response.status === 401) {
      setNeedsReauth(true);
      setShowReauthModal(true);
      return false;
    }
    return true;
  }, []);

  return {
    needsReauth,
    showReauthModal,
    openReauthModal,
    closeReauthModal,
    checkAuthStatus,
  };
};
