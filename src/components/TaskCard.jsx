import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../ThemeContext';

const TaskCard = ({ task, completed, onClick, onEdit, onDelete, count = 0 }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl p-6 cursor-pointer"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        color: theme.textPrimary,
      }}
    >
      {/* Completion indicator */}
      <div className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center"
        style={{
          background: completed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)',
          border: `1px solid ${completed ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
        }}
      >
        {completed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-3 h-3 rounded-full"
            style={{ background: '#10b981' }}
          />
        )}
      </div>

      {/* Task icon */}
      <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
        style={{
          background: `linear-gradient(135deg, ${task.color}15, ${task.color}30)`,
          border: `1px solid ${task.color}20`,
        }}
      >
        <span className="text-2xl">{task.icon}</span>
      </div>

      {/* Task name */}
      <h3 className="text-lg font-semibold mb-1">{task.name}</h3>
      
      {/* XP badge */}
      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2"
        style={{
          background: `linear-gradient(135deg, ${task.color}15, ${task.color}25)`,
          color: task.color,
          border: `1px solid ${task.color}20`,
        }}
      >
        +{task.xp} XP
      </div>

      {/* Completion counter */}
      {count > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 right-4 text-xs font-medium"
          style={{ color: theme.textSecondary }}
        >
          {count}×
        </motion.div>
      )}

      {/* Action buttons */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          ✏️
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.8)' }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: 'rgba(239, 68, 68, 0.6)',
            backdropFilter: 'blur(10px)',
          }}
        >
          🗑️
        </motion.button>
      </div>
    </motion.div>
  );
};

export default TaskCard;
