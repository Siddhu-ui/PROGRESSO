import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './components/ui/Icon';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  icon = 'warning'
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(8px)',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            borderRadius: '20px',
            padding: '30px',
            width: '90%',
            maxWidth: '450px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Glow effect */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            right: '-50%',
            bottom: '-50%',
            background: 'radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.15) 0%, transparent 60%)',
            opacity: 0.7,
            pointerEvents: 'none',
            zIndex: 1,
          }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              marginBottom: '25px',
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                fontSize: '28px',
                color: '#ef4444',
              }}>
                {icon}
              </div>
              <h3 style={{
                margin: '0 0 10px 0',
                color: '#fff',
                fontSize: '1.5rem',
                fontWeight: '700',
              }}>
                {title}
              </h3>
              <p style={{
                margin: 0,
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1rem',
                lineHeight: '1.5',
              }}>
                {message}
              </p>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '15px',
              marginTop: '25px',
            }}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s ease',
                }}
              >
                {cancelText}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.2s ease',
                }}
              >
                {confirmText}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmationModal;
