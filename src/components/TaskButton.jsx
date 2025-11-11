import React from 'react';
import { motion } from 'framer-motion';

const TaskButton = ({ icon, name, xp, color, isCompleted, onClick }) => {
  const handleClick = (e) => {
    e.stopPropagation();
    const bounds = e.currentTarget.getBoundingClientRect();
    onClick({
      x: e.clientX,
      y: e.clientY,
      centerX: bounds.left + bounds.width / 2,
      centerY: bounds.top + bounds.height / 2,
    });
  };

  return (
    <motion.button
      whileHover={{ 
        scale: 1.03,
        boxShadow: `0 0 15px ${color}40`,
        borderColor: `${color}80`,
      }}
      whileTap={{ 
        scale: 0.97,
        boxShadow: `0 0 10px ${color}60`
      }}
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        borderRadius: '12px',
        background: `linear-gradient(135deg, ${color}15, ${color}08)`,
        border: `1px solid ${isCompleted ? `${color}60` : 'rgba(255, 255, 255, 0.1)'}`,
        color: isCompleted ? '#fff' : 'rgba(255, 255, 255, 0.8)',
        fontSize: '0.9rem',
        fontWeight: 500,
        textAlign: 'left',
        width: '100%',
        transition: 'all 0.2s ease',
        backdropFilter: 'blur(8px)',
        boxShadow: isCompleted ? `0 0 0 1px ${color}40` : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ 
          fontSize: '1.1rem',
          opacity: isCompleted ? 1 : 0.7,
          filter: isCompleted ? 'drop-shadow(0 0 4px rgba(255,255,255,0.3))' : 'none'
        }}>
          {icon}
        </span>
        <span style={{
          textDecoration: isCompleted ? 'line-through' : 'none',
          opacity: isCompleted ? 0.8 : 1,
        }}>
          {name}
        </span>
      </div>
      <span style={{
        background: isCompleted 
          ? `linear-gradient(135deg, ${color}dd, ${color}aa)` 
          : 'rgba(255, 255, 255, 0.1)',
        color: isCompleted ? '#fff' : 'rgba(255, 255, 255, 0.8)',
        padding: '2px 10px',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: '700',
        backdropFilter: 'blur(4px)',
        border: `1px solid ${isCompleted ? `${color}80` : 'rgba(255,255,255,0.05)'}`,
        boxShadow: isCompleted ? `0 2px 8px ${color}30` : 'none',
        transition: 'all 0.2s ease',
      }}>
        +{xp} XP
      </span>
    </motion.button>
  );
};

export default TaskButton;
