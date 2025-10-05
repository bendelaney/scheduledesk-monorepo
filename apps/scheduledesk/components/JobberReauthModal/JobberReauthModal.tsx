'use client';

import { usePathname } from 'next/navigation';
import Modal from '@/components/Modal';
import './JobberReauthModal.scss';

type JobberReauthModalProps = {
  onClose: () => void;
  onReauthSuccess?: () => void;
};

const JobberReauthModal: React.FC<JobberReauthModalProps> = ({ onClose, onReauthSuccess }) => {
  const pathname = usePathname();

  const handleConnect = () => {
    // Store callback for after redirect
    if (onReauthSuccess) {
      sessionStorage.setItem('jobber_reauth_callback', 'true');
    }

    // Pass current page URL as returnUrl
    const returnUrl = encodeURIComponent(pathname);
    window.location.href = `/api/auth/jobber?returnUrl=${returnUrl}`;
  };

  return (
    <Modal
      closeButton={false}
      clickOutsideToClose={false}
      escToClose={true}
      onClose={onClose}
    >
      <div className="jobber-reauth-modal">
        <h2>Reconnect to Jobber</h2>
        <p>Your Jobber session has expired.<br/>Reconnect to continue.</p>

        <button
          onClick={handleConnect}
          className="connect-button"
        >
          Authorize with Jobber
        </button>
      </div>
    </Modal>
  );
};

export default JobberReauthModal;
