import React from 'react';
import { motion } from 'framer-motion';

const SpotlightCard = ({ children, spotlightColor = 'rgba(99, 102, 241, 0.5)', style, ...props }) => {
  return (
    <motion.div
      style={{
        background: 'rgba(15, 23, 42, 0.7)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `0 0 25px ${spotlightColor}40`,
        backdropFilter: 'blur(16px)',
        transition: 'all 0.3s ease',
        ...style
      }}
      whileHover={{ 
        y: -4,
        boxShadow: `0 0 35px ${spotlightColor}80`,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        transition: { 
          y: { duration: 0.2 },
          boxShadow: { duration: 0.3 }
        }
      }}
      {...props}
    >
      {/* Glow effect */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        right: '-50%',
        bottom: '-50%',
        background: `radial-gradient(
          circle at 50% 50%,
          ${spotlightColor}20 0%,
          transparent 60%
        )`,
        opacity: 0.7,
        pointerEvents: 'none',
        transform: 'translateZ(0)',
        zIndex: 1
      }} />
      
      {/* Inner glow */}
      <div style={{
        position: 'absolute',
        inset: '1px',
        borderRadius: '15px',
        background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        pointerEvents: 'none',
        zIndex: 2
      }} />
      
      <div style={{ position: 'relative', zIndex: 3 }}>
        {children}
      </div>
    </motion.div>
  );
};

export default SpotlightCard;
