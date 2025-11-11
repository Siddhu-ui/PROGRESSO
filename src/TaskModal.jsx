import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './components/ui/Icon';

const TaskModal = ({
  isOpen,
  onClose,
  onSave,
  onTaskChange,
  task: initialTask = {
    name: '',
    xp: 10,
    icon: '✅',
    category: 'productivity',
  },
  title = 'Task',
  isEdit = false,
}) => {
  const [task, setTask] = useState(initialTask);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update local state when initialTask changes
  useEffect(() => {
    setTask(initialTask);
  }, [initialTask]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedTask = {
      ...task,
      [name]: name === 'xp' ? parseInt(value, 10) || 0 : value,
    };
    setTask(updatedTask);
    if (onTaskChange) onTaskChange(updatedTask);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task.name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave(task);
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const categories = [
    { id: 'food', name: 'Food & Nutrition', icon: '🍴', color: '#f59e0b' },
    { id: 'productivity', name: 'Productivity', icon: '💼', color: '#3b82f6' },
    { id: 'fitness', name: 'Workout & Fitness', icon: '💪', color: '#10b981' },
  ];

  const icons = [
    { emoji: '✅', label: 'Checkmark' },
    { emoji: '📚', label: 'Book' },
    { emoji: '🏋️', label: 'Workout' },
    { emoji: '🍎', label: 'Apple' },
    { emoji: '💧', label: 'Water' },
    { emoji: '📝', label: 'Document' },
    { emoji: '🧘', label: 'Yoga' },
    { emoji: '🏃', label: 'Run' },
    { emoji: '💡', label: 'Idea' },
    { emoji: '🎯', label: 'Target' },
  ];

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
            maxWidth: '500px',
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
            background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 60%)',
            opacity: 0.7,
            pointerEvents: 'none',
            zIndex: 1,
          }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '25px',
            }}>
              <h2 style={{
                margin: 0,
                color: '#fff',
                fontSize: '1.5rem',
                fontWeight: '700',
              }}>
                {isEdit ? 'Edit Task' : 'Add New Task'}
              </h2>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '5px',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => (e.target.style.background = 'rgba(255, 255, 255, 0.1)')}
                onMouseOut={(e) => (e.target.style.background = 'transparent')}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                }}>
                  Task Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={task.name}
                  onChange={handleChange}
                  placeholder="Enter task name"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    fontSize: '1rem',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.target.border = '1px solid rgba(59, 130, 246, 0.5)';
                    e.target.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.border = '1px solid rgba(255, 255, 255, 0.1)';
                    e.target.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                }}>
                  XP Value
                </label>
                <input
                  type="number"
                  name="xp"
                  min="1"
                  max="1000"
                  value={task.xp}
                  onChange={handleChange}
                  style={{
                    width: '100px',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    fontSize: '1rem',
                    transition: 'all 0.2s ease',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                }}>
                  Category
                </label>
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap',
                }}>
                  {categories.map((cat) => (
                    <motion.button
                      key={cat.id}
                      type="button"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        const updatedTask = { ...task, category: cat.id };
                        setTask(updatedTask);
                        if (onTaskChange) onTaskChange(updatedTask);
                      }}
                      style={{
                        flex: 1,
                        minWidth: '120px',
                        padding: '12px',
                        borderRadius: '10px',
                        border: `1px solid ${task.category === cat.id ? cat.color : 'rgba(255, 255, 255, 0.1)'}`,
                        background: task.category === cat.id 
                          ? `${cat.color}20` 
                          : 'rgba(255, 255, 255, 0.05)',
                        color: task.category === cat.id ? '#fff' : 'rgba(255, 255, 255, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                }}>
                  Icon
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
                  gap: '10px',
                }}>
                  {icons.map((icon, index) => (
                    <motion.button
                      key={index}
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const updatedTask = { ...task, icon: icon.emoji };
                        setTask(updatedTask);
                        if (onTaskChange) onTaskChange(updatedTask);
                      }}
                      title={icon.label}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        border: `1px solid ${task.icon === icon.emoji ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                        background: task.icon === icon.emoji 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {icon.emoji}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '15px',
                marginTop: '30px',
              }}>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  disabled={isSubmitting}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={isSubmitting || !task.name.trim()}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                    color: 'white',
                    fontWeight: '600',
                    cursor: !task.name.trim() || isSubmitting ? 'not-allowed' : 'pointer',
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                    transition: 'all 0.2s ease',
                    opacity: !task.name.trim() ? 0.6 : 1,
                  }}
                >
                  {isSubmitting ? (
                    <span>Saving...</span>
                  ) : isEdit ? (
                    'Update Task'
                  ) : (
                    'Add Task'
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TaskModal;
