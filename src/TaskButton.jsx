import React from 'react';
import { motion } from 'framer-motion';

const TaskButton = ({ task, isCompleted, onClick }) => {
  if (!task) return null;
  
  const handleClick = (e) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const clickPosition = {
      x: e.clientX,
      y: e.clientY,
      centerX: bounds.left + bounds.width / 2,
      centerY: bounds.top + bounds.height / 2,
    };
    onClick(clickPosition);
  };

  const glowColor = isCompleted 
    ? `${task.color}80` 
    : `${task.color}40`;

  return (
    <motion.div
      className="task-button"
      onClick={handleClick}
      whileHover={{ 
        scale: 1.03,
        boxShadow: `0 0 25px ${glowColor}`,
        borderColor: `${task.color}80`,
      }}
      whileTap={{ 
        scale: 0.98,
        boxShadow: `0 0 15px ${glowColor}`
      }}
      style={{
        background: 'rgba(30, 41, 59, 0.5)',
        border: `1px solid ${task.color}30`,
        borderRadius: '14px',
        padding: '18px 12px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        height: '100%',
        minHeight: '110px',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(8px)',
        boxShadow: `0 4px 15px ${glowColor}20`
      }}
    >
      {/* Glow effect */}
      <div style={{
        position: 'absolute',
        inset: '0',
        background: `radial-gradient(circle at center, ${glowColor}10 0%, transparent 70%)`,
        opacity: isCompleted ? 0.8 : 0.3,
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none',
      }} />

      <div style={{ 
        fontSize: '2rem',
        color: isCompleted ? task.color : 'rgba(255, 255, 255, 0.6)',
        filter: isCompleted ? 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' : 'none',
        transition: 'all 0.3s ease',
        position: 'relative',
        zIndex: 2
      }}>
        {task.icon}
      </div>

      <div style={{
        fontSize: '0.85rem',
        fontWeight: '600',
        color: isCompleted ? '#fff' : 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        textShadow: isCompleted ? '0 0 10px rgba(255,255,255,0.3)' : 'none',
        transition: 'all 0.3s ease',
        position: 'relative',
        zIndex: 2
      }}>
        {task.name}
      </div>

      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: isCompleted 
          ? `linear-gradient(135deg, ${task.color}dd, ${task.color}aa)` 
          : 'rgba(100, 116, 139, 0.2)',
        color: isCompleted ? '#fff' : 'rgba(255, 255, 255, 0.7)',
        borderRadius: '20px',
        padding: '4px 10px',
        fontSize: '0.7rem',
        fontWeight: '800',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        backdropFilter: 'blur(4px)',
        border: `1px solid ${isCompleted ? task.color + '80' : 'rgba(255,255,255,0.05)'}`,
        boxShadow: isCompleted 
          ? `0 2px 10px ${task.color}40` 
          : '0 2px 5px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        zIndex: 2
      }}>
        {isCompleted && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          >
            ✓
          </motion.span>
        )}
        +{task.xp} XP
      </div>
    </motion.div>
  );
};

export default TaskButton;
