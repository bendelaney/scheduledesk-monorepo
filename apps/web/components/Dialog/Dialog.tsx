'use client'

import React from 'react';
import Modal from '@/components/Modal';

interface DialogProps {
  title: string;
  children: React.ReactNode;
  yesButtonText: string;
  noButtonText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const Dialog: React.FC<DialogProps> = ({ 
  title, 
  children, 
  yesButtonText, 
  noButtonText, 
  onConfirm, 
  onCancel 
}) => {
  return (
    <Modal key="dialog-active">
      <div className="dialog">
        <h2>{title}</h2>
        {children}
        <div className="button-group">
          <button onClick={onCancel}>{noButtonText}</button>
          <button className="primary" onClick={onConfirm}>{yesButtonText}</button>
        </div>
      </div>
    </Modal>
  );
};

export { Dialog };