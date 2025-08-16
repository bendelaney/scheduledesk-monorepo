'use client'

import { ReactNode, useRef, useEffect } from "react";
import Portal from "@/components/Portal";
import { motion } from "framer-motion";
import { useClickOutside } from '@/hooks/useClickOutside';
import { CloseX } from "@/components/Icons";

type ModalProps = {
  children: ReactNode;
  closeButton?: boolean;
  clickOutsideToClose?: boolean;
  escToClose?: boolean;
  styles?: React.CSSProperties;
  onClose?: () => void;
  initialPosition?: { left: number, top: number };
  onAnimationComplete?: () => void;
};

const Modal: React.FC<ModalProps> = ({
  children,
  closeButton = false,
  clickOutsideToClose = false,
  escToClose = false,
  styles,
  onClose = () => {},
  initialPosition,
  onAnimationComplete = () => {}
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useClickOutside(modalRef, onClose, undefined, clickOutsideToClose);

  useEffect(() => {
    if (escToClose) {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          console.log('ESC key pressed');
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [onClose, escToClose]);

  if (!children) return null;
  
  const defaultInitialPosition = {
    left: (typeof window !== 'undefined' ? window.innerWidth / 2 : 400), 
    top: (typeof window !== 'undefined' ? window.innerHeight / 2 : 300) 
  };

  const position = initialPosition || defaultInitialPosition;

  return ( 
    <Portal>
      <motion.div className="modal-mask"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12 }}
      >
        <motion.div
          ref={modalRef}
          className="modal"
          style={styles}
          initial={{
            opacity: 1,
            top: position.top,
            left: position.left,
            translateX: "-50%",
            translateY: "-50%",
            scale: 0.8,
          }}
          animate={{
            opacity: 1,
            top: "50vh",
            left: "50vw",
            scale: 1,
            translateX: "-50%",
            translateY: "-50%"
          }}
          exit={{
            opacity: 0,
            scale: 0.8
          }}
          transition={{ duration: 0.12 }}
          onAnimationComplete={onAnimationComplete}
        >
          {closeButton && (
            <button
              className="close-x"
              onClick={onClose}
            >
              <span className="icon"><CloseX /></span>
            </button>
          )}
          {children}
        </motion.div>
      </motion.div>
    </Portal>
  );
};

export { Modal };