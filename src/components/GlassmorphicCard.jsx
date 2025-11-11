import React from 'react';
import { motion } from 'framer-motion';

export const GlassmorphicCard = ({ children, style = {}, className = '' }) => {
  return (
    <motion.div
      className={`glassmorphic-card ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.1)', 
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        padding: '24px',
        width: '100%',
        ...style
      }}
      whileHover={{
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        transform: 'translateY(-2px)'
      }}
      transition={{
        duration: 0.3,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  );
};

export default GlassmorphicCard;
