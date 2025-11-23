/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useTheme } from "./ThemeContext";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import Game from "./Game";
import Expenses from "./Expenses";
import LevelRoadmap from "./LevelRoadmap";
import Leaderboard from "./Leaderboard";
import CalorieTracker from "./CalorieTracker";
import UserProfile from "./UserProfile";
import AIAssistant from "./AIAssistant";
import Icon from "./components/ui/Icon";
import CalendarSection from "./CalendarSection";

// --- Utility Components ---
const CircularProgress = ({ percentage, size = 140, strokeWidth = 10, color = '#8B7FC7', children }) => {
  // ... (Code for CircularProgress remains the same)
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ 
      position: 'relative', 
      width: size + 40, 
      height: size + 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Decorative outer ring */}
      <div style={{
        position: 'absolute',
        width: size + 30,
        height: size + 30,
        borderRadius: '50%',
        border: '2px dashed rgba(139, 127, 199, 0.2)',
        animation: 'spin 30s linear infinite'
      }} />
      
      {/* Decorative dots */}
      {[0, 90, 180, 270].map((angle, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          style={{
            position: 'absolute',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            // Unified solid background instead of gradient for consistency
            background: '#ffffff',
            transform: `rotate(${angle}deg) translateY(-${(size + 30) / 2 + 5}px)`,
            boxShadow: '0 2px 8px rgba(139, 127, 199, 0.15)'
          }}
        />
      ))}
      
      {/* Main progress circle */}
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(139, 127, 199, 0.12)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#gradient-${percentage})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            style={{ filter: `drop-shadow(0 0 12px ${color}60)` }}
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id={`gradient-${percentage}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E8D5F2" />
              <stop offset="50%" stopColor="#8B7FC7" />
              <stop offset="100%" stopColor="#D4F1F4" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center content */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};
const HabitIcon = ({ icon, color = '#8b5cf6', size = 'md', className = '' }) => {
  // ... (Code for HabitIcon remains the same)
  const sizeMap = {
    sm: { container: 'w-8 h-8', iconSize: 14 },
    md: { container: 'w-10 h-10', iconSize: 18 },
    lg: { container: 'w-12 h-12', iconSize: 22 },
  };
  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div 
      className={`${currentSize.container} ${className} rounded-xl flex items-center justify-center transition-all duration-300`}
      style={{
        backgroundColor: `${color}25`,
        border: `2px solid ${color}50`,
        minWidth: currentSize.container.split(' ')[0].replace('w-', '') + 'px',
        minHeight: currentSize.container.split(' ')[0].replace('w-', '') + 'px',
      }}
    >
      <Icon 
        name={icon} 
        size={currentSize.iconSize} 
        color={color} 
      />
    </div>
  );
};
const TodoListCard = ({ glassmorphicStyle, theme }) => {
  // ... (Code for TodoListCard remains the same)
  const [todos, setTodos] = useState([
    { id: 1, text: 'Plan today’s tasks', completed: false },
    { id: 2, text: 'Review meeting notes', completed: true },
    { id: 3, text: 'Schedule a call', completed: false },
  ]);
  const [newTodo, setNewTodo] = useState('');

  const addTodo = () => {
    if (newTodo.trim() !== '') {
      setTodos([...todos, { id: Date.now(), text: newTodo.trim(), completed: false }]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id, e) => {
    e.stopPropagation();
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      style={{
        ...glassmorphicStyle,
        padding: "32px",
        borderRadius: "24px",
        display: 'flex',
        flexDirection: 'column',
        margin: "0",
        width: "100%",
        boxSizing: "border-box",
        minHeight: "400px",
        background: "linear-gradient(135deg, rgba(232, 213, 242, 0.1), rgba(255, 255, 255, 0.95))",
        border: "2px solid rgba(139, 127, 199, 0.2)",
        boxShadow: "0 12px 40px rgba(139, 127, 199, 0.15), 0 4px 16px rgba(0, 0, 0, 0.08)",
        gridColumn: "span 2"
      }}
    >
      {/* Header with Progress */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "700", color: theme.textPrimary, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>🎯</span> Quick To-Do List
          </h3>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="app-btn app-btn-sm"
            style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
              color: theme.accent,
              fontWeight: '700'
            }}
          >
            {completedCount}/{totalCount}
          </motion.div>
        </div>
        {/* Progress Bar */}
        <div style={{ 
          width: '100%', 
          height: '8px', 
          background: 'rgba(139, 127, 199, 0.15)', 
          borderRadius: '20px', 
          overflow: 'hidden' 
        }}>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="app-btn app-btn-primary app-btn-sm w-full"
            style={{
              marginTop: '12px',
              background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`
            }}
            onClick={addTodo}
          >
            Add Task
          </motion.button>
          placeholder="✨ Add a new task..."
          style={{
            flex: 1,
            padding: "14px 18px",
            borderRadius: "16px",
            border: "2px solid rgba(139, 127, 199, 0.2)",
            background: "rgba(255, 255, 255, 0.6)",
            color: theme.textPrimary,
            fontSize: "1rem",
            outline: "none",
            transition: "all 0.3s ease",
          }}
        />
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 8px 20px rgba(139, 127, 199, 0.3)' }}
          whileTap={{ scale: 0.95 }}
          onClick={addTodo}
          style={{
            padding: "14px 20px",
            borderRadius: "16px",
            border: "none",
            background: `linear-gradient(135deg, ${theme.accent}, #a78bfa)`,
            color: "#fff",
            fontWeight: "700",
            fontSize: "1.1rem",
            cursor: "pointer",
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(139, 127, 199, 0.3)'
          }}
        >
          + Add
        </motion.button>
      </div>

      {/* To-Do List with Enhanced Design */}
      <div style={{ flex: 1, overflowY: 'auto', maxHeight: '400px', paddingRight: '8px' }}>
        <AnimatePresence>
          {todos.map((todo, index) => (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, x: -20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.02, x: 4 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                marginBottom: '12px',
                borderRadius: '16px',
                background: todo.completed 
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(255, 255, 255, 0.5))'
                  : 'rgba(255, 255, 255, 0.7)',
                border: `2px solid ${todo.completed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(139, 127, 199, 0.15)'}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }} onClick={() => toggleTodo(todo.id)}>
                <motion.span 
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                  style={{ 
                    fontSize: '1.3rem', 
                    marginRight: '16px', 
                    color: todo.completed ? '#10b981' : theme.textSecondary,
                    transition: 'all 0.3s ease'
                  }}
                >
                  {todo.completed ? '✅' : '⭕'}
                </motion.span>
                <span style={{ 
                  fontSize: '1rem', 
                  color: todo.completed ? theme.textSecondary : theme.textPrimary, 
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  transition: 'all 0.3s ease',
                  fontWeight: todo.completed ? '400' : '500'
                }}>
                  {todo.text}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => deleteTodo(todo.id, e)}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '10px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                🗑️
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
        {todos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ 
              textAlign: 'center', 
              color: theme.textSecondary, 
              marginTop: '40px',
              fontSize: '1.1rem',
              fontWeight: '500'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
            All clear! Time for a new challenge.
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
const CalendarCard = ({ glassmorphicStyle, theme }) => {
  // ... (Code for CalendarCard remains the same)
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [notes, setNotes] = useState({});
  const [reminders, setReminders] = useState({});
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [currentReminder, setCurrentReminder] = useState('');

  const currentDay = date.getDate();
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateClick = (day) => {
    const dateKey = `${currentYear}-${currentMonth}-${day}`;
    setSelectedDate(dateKey);
    setCurrentNote(notes[dateKey] || '');
    setCurrentReminder(reminders[dateKey] || '');
    setShowNoteModal(true);
  };

  const saveNote = () => {
    if (selectedDate) {
      if (currentNote.trim()) {
        setNotes({...notes, [selectedDate]: currentNote.trim()});
      }
      if (currentReminder.trim()) {
        setReminders({...reminders, [selectedDate]: currentReminder.trim()});
      }
      setShowNoteModal(false);
      setSelectedDate(null);
      setCurrentNote('');
      setCurrentReminder('');
    }
  };

  const deleteNote = () => {
    if (selectedDate) {
      const newNotes = {...notes};
      const newReminders = {...reminders};
      delete newNotes[selectedDate];
      delete newReminders[selectedDate];
      setNotes(newNotes);
      setReminders(newReminders);
      setShowNoteModal(false);
      setSelectedDate(null);
      setCurrentNote('');
      setCurrentReminder('');
    }
  };

  const renderCalendar = () => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div style={{ padding: '8px 0', fontSize: '0.9rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: '600', color: theme.textSecondary, marginBottom: '12px', fontSize: '0.85rem' }}>
          {daysOfWeek.map((d, idx) => <div key={`dow-${idx}`}>{d}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', gap: '6px' }}>
          {Array.from({ length: firstDay }).map((_, i) => <div key={`pad-${i}`} style={{ height: '36px' }} />)}
          
          {days.map(day => {
            const dateKey = `${currentYear}-${currentMonth}-${day}`;
            const hasNote = notes[dateKey] || reminders[dateKey];
            const isToday = day === currentDay && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
            
            return (
              <motion.div
                key={day}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDateClick(day)}
                style={{
                  padding: '8px 4px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: isToday ? '700' : '500',
                  backgroundColor: isToday ? theme.accent : hasNote ? 'rgba(139, 127, 199, 0.15)' : 'transparent',
                  color: isToday ? '#fff' : theme.textPrimary,
                  transition: 'all 0.2s',
                  lineHeight: 1.2,
                  position: 'relative',
                  border: hasNote ? '2px solid rgba(139, 127, 199, 0.3)' : 'none',
                  minHeight: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {day}
                {hasNote && (
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: reminders[dateKey] ? '#ef4444' : '#8b5cf6'
                  }} />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          ...glassmorphicStyle,
          padding: "32px",
          borderRadius: "24px",
          margin: "0",
          width: "100%",
          boxSizing: "border-box",
          minHeight: "450px",
          background: "linear-gradient(135deg, rgba(212, 241, 244, 0.1), rgba(255, 255, 255, 0.95))",
          border: "2px solid rgba(139, 127, 199, 0.2)",
          boxShadow: "0 12px 40px rgba(139, 127, 199, 0.15), 0 4px 16px rgba(0, 0, 0, 0.08)",
          gridColumn: "span 2"
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "700", color: theme.textPrimary, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>🗓️</span> Calendar & Notes
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDate(new Date(currentYear, currentMonth - 1, 1))}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                background: 'rgba(139, 127, 199, 0.1)',
                border: '1px solid rgba(139, 127, 199, 0.3)',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              ◀
            </motion.button>
            <span style={{ fontSize: "1rem", color: theme.textSecondary, fontWeight: '600', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
              {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDate(new Date(currentYear, currentMonth + 1, 1))}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                background: 'rgba(139, 127, 199, 0.1)',
                border: '1px solid rgba(139, 127, 199, 0.3)',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              ▶
            </motion.button>
          </div>
        </div>
        
        {renderCalendar()}
        
        <div style={{ marginTop: '20px', padding: '16px', borderRadius: '16px', background: 'rgba(139, 127, 199, 0.08)' }}>
          <div style={{ fontSize: '0.85rem', color: theme.textSecondary, display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#8b5cf6' }} />
              <span>Has Note</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
              <span>Has Reminder</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: theme.accent }} />
              <span>Today</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Note Modal */}
      <AnimatePresence>
        {showNoteModal && (
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
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => setShowNoteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                padding: '32px',
                borderRadius: '24px',
                maxWidth: '500px',
                width: '90%',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                border: '2px solid rgba(139, 127, 199, 0.2)'
              }}
            >
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '20px', color: theme.textPrimary }}>
                📝 Add Note & Reminder
              </h3>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: theme.textSecondary }}>
                  Note:
                </label>
                <textarea
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  placeholder="Write your note here..."
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '2px solid rgba(139, 127, 199, 0.2)',
                    fontSize: '0.95rem',
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: theme.textSecondary }}>
                  ⏰ Reminder:
                </label>
                <input
                  type="text"
                  value={currentReminder}
                  onChange={(e) => setCurrentReminder(e.target.value)}
                  placeholder="Set a reminder..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '2px solid rgba(239, 68, 68, 0.2)',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={deleteNote}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Delete
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNoteModal(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    border: '1px solid rgba(139, 127, 199, 0.3)',
                    background: 'rgba(139, 127, 199, 0.1)',
                    color: theme.accent,
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 8px 20px rgba(139, 127, 199, 0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={saveNote}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    background: `linear-gradient(135deg, ${theme.accent}, #a78bfa)`,
                    color: '#fff',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(139, 127, 199, 0.3)'
                  }}
                >
                  💾 Save
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// --- CORE DATA REDUCTION ---
const API_URL = 'http://localhost:5000/api';

const minimalXpTasks = [
  { id: 'exercise', name: 'Exercise', xp: 25, icon: 'run', color: '#8b5cf6', category: 'Fitness', description: 'Complete your daily workout' },
  { id: 'hydration', name: 'Drink Water', xp: 15, icon: 'water', color: '#60a5fa', category: 'Health', description: 'Stay hydrated (8 glasses)' },
  { id: 'learning', name: 'Deep Work', xp: 30, icon: 'learn', color: '#f59e0b', category: 'Growth', description: 'Focus on a key project' },
  { id: 'sleep', name: 'Prioritize Sleep', xp: 20, icon: 'sleep', color: '#14b8a6', category: 'Wellness', description: 'Go to bed on time' },
];

const navItems = [
  { title: 'Daily Tasks', icon: 'list' },
  { title: 'Levels', icon: 'trophy' },
  { title: 'AI Assistant', icon: 'ai' },
  { title: 'Expenses', icon: 'dollar-sign' },
  { title: 'Leaderboard', icon: 'leaderboard' },
  { title: 'Calories', icon: 'flame' },
  { title: 'Profile', icon: 'user' }
];

// --- Sidebar Component ---
const Sidebar = ({ activeSection, setActiveSection, isVisible = true }) => {
  // ... (Code for Sidebar shapes remains the same)
  const shapes = [
    { borderRadius: '50%' }, // Circle - Daily Tasks
    { borderRadius: '15px', transform: 'rotate(45deg)' }, // Diamond - Levels
    { borderRadius: '25% 75% 75% 25% / 25% 25% 75% 75%' }, // Blob 1 - AI Assistant
    { borderRadius: '8px' }, // Square - Challenges
    { borderRadius: '50% 0 50% 0' }, // Leaf - Leaderboard
    { borderRadius: '0 50% 50% 50%' }, // Drop - Calories
    { borderRadius: '75% 25% 75% 25% / 25% 75% 25% 75%' }, // Blob 2 - Profile
  ];

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ 
        x: isVisible ? 0 : -100, 
        opacity: isVisible ? 1 : 0 
      }}
      transition={{ duration: 0.3 }}
      className="sidebar-container"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: '80px',
        // --- THIS IS THE WHITE GLASS STYLE THAT MATCHES YOUR CARDS ---
        background: 'rgba(255, 255, 255, 0.9)', 
        backdropFilter: 'blur(15px) saturate(180%)',
        WebkitBackdropFilter: 'blur(15px) saturate(180%)',
        borderRight: '2px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '4px 0 25px rgba(139, 92, 246, 0.1)',
        // --- END OF STYLE CHANGE ---
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 0',
        zIndex: 1000,
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      {navItems.map((item, index) => {
        const isActive = activeSection === index;
        const shape = shapes[index] || shapes[0];
        
        return (
          <motion.div
            key={index}
            whileHover={{ 
              scale: 1.15,
              rotate: index === 1 ? 0 : index % 2 === 0 ? 5 : -5,
            }}
            whileTap={{ scale: 0.9 }}
            style={{
              margin: '10px 0',
              position: 'relative',
            }}
          >
            <motion.button
              onClick={() => setActiveSection(index)}
              animate={{
                background: isActive 
                  ? 'linear-gradient(135deg, #8b5cf6, #a78bfa)' 
                  : '#8b5cf6',
                boxShadow: isActive 
                  ? '0 8px 20px rgba(139, 92, 246, 0.4), 0 0 0 4px rgba(139, 92, 246, 0.15)' 
                  : '0 4px 12px rgba(139, 92, 246, 0.3)',
              }}
              whileHover={{
                boxShadow: '0 12px 28px rgba(139, 92, 246, 0.5), 0 0 0 2px rgba(139, 92, 246, 0.2)',
              }}
              transition={{ duration: 0.3 }}
              style={{
                width: '54px',
                height: '54px',
                ...shape,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'visible',
              }}
              title={item.title}
            >
              <div style={{
                transform: index === 1 ? 'rotate(-45deg)' : 'none', // Counter-rotate icon for diamond
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {/* === THIS IS THE ONLY LINE I CHANGED === */}
                <Icon name={item.icon} size={22} color="#E8D5F2" /> 
              </div>
              
              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#22c55e',
                    border: '2px solid white',
                    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.4)',
                  }}
                />
              )}
            </motion.button>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

// --- MODAL COMPONENTS ---
const TaskModal = ({ isOpen, onClose, title, task, onSave, onTaskChange, isEdit = false }) => {
  // ... (Code for TaskModal remains the same)
  if (!isOpen) return null;
  const handleInputChange = (field, value) => {
    onTaskChange({ ...task, [field]: value });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(5px)",
            zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(20px) saturate(180%)",
              borderRadius: "25px", padding: "30px", border: "1px solid rgba(0, 0, 0, 0.1)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)", width: "100%", maxWidth: "500px", color: "#1A1A1A"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "25px" }}>
              <span style={{ fontSize: "1.5rem" }}>{isEdit ? '✏️' : '➕'}</span>
              <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "700" }}>{title}</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#4b5563", marginBottom: "8px" }}>Task Name</label>
                <input type="text" value={task.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Enter task name..." style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid rgba(0, 0, 0, 0.2)", background: "rgba(255, 255, 255, 0.8)", color: "#1A1A1A", fontSize: "0.9rem", outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#4b5563", marginBottom: "8px" }}>XP Points</label>
                <input type="number" value={task.xp || ''} onChange={(e) => handleInputChange('xp', parseInt(e.target.value) || 0)} placeholder="Enter XP points..." min="1" style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid rgba(0, 0, 0, 0.2)", background: "rgba(255, 255, 255, 0.8)", color: "#1A1A1A", fontSize: "0.9rem", outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#4b5563", marginBottom: "8px" }}>Icon</label>
                <select value={task.icon || '⭐'} onChange={(e) => handleInputChange('icon', e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid rgba(0, 0, 0, 0.2)", background: "rgba(255, 255, 255, 0.8)", color: "#1A1A1A", fontSize: "0.9rem", outline: "none" }}>
                  {['⭐', '🎯', '🚀', '💪', '🧠', '💡', '🔥', '⚡', '🌟', '🎨', '📚', '🏃‍♂️', '💻', '🎵', '🧘‍♀️'].map(icon => <option key={icon} value={icon}>{icon}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#4b5563", marginBottom: "8px" }}>Color Theme</label>
                <select value={task.color || '#60a5fa'} onChange={(e) => handleInputChange('color', e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid rgba(0, 0, 0, 0.2)", background: "rgba(255, 255, 255, 0.8)", color: "#1A1A1A", fontSize: "0.9rem", outline: "none" }}>
                  <option value="#60a5fa">🔵 Blue</option><option value="#f59e0b">🟡 Yellow</option><option value="#10b981">🟢 Green</option><option value="#ef4444">🔴 Red</option><option value="#8b5cf6">🟣 Purple</option><option value="#f97316">🟠 Orange</option><option value="#ec4899">🩷 Pink</option><option value="#06b6d4">🩵 Cyan</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "30px", justifyContent: "flex-end" }}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClose} style={{ padding: "12px 24px", borderRadius: "12px", border: "1px solid rgba(0, 0, 0, 0.2)", background: "transparent", color: "#4b5563", fontWeight: "600", cursor: "pointer" }}>Cancel</motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onSave} style={{ padding: "12px 24px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", fontWeight: "600", cursor: "pointer" }}>{isEdit ? 'Update Task' : 'Add Task'}</motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, icon }) => {
  // ... (Code for ConfirmationModal remains the same)
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(5px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(20px) saturate(180%)", borderRadius: "25px", padding: "30px", border: "1px solid rgba(0, 0, 0, 0.1)", boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)", width: "100%", maxWidth: "450px", textAlign: "center", color: "#1A1A1A" }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }} style={{ fontSize: "3rem", marginBottom: "20px" }}>{icon}</motion.div>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "1.3rem", fontWeight: "700" }}>{title}</h3>
            <p style={{ margin: "0 0 25px 0", fontSize: "0.9rem", color: "#4b5563", lineHeight: "1.5" }}>{message}</p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClose} style={{ padding: "12px 24px", borderRadius: "12px", border: "1px solid rgba(0, 0, 0, 0.2)", background: "transparent", color: "#4b5563", fontWeight: "600", cursor: "pointer", flex: 1 }}>Cancel</motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onConfirm} style={{ padding: "12px 24px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "#fff", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 15px rgba(239, 68, 68, 0.3)", flex: 1 }}>{confirmText}</motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Dashboard Component ---

function Dashboard({ user, setUser, token }) {
  // ... (Code for Dashboard logic remains the same)
  useTheme();
  const [userStats, setUserStats] = useState({ level: 1, xp: 0, streak: 0, tasksCompleted: 0, skillsUnlocked: 0, mindfulMinutes: 0 });
  const [activeSection, setActiveSection] = useState(0);
  const [roadmapAnimation, setRoadmapAnimation] = useState(false);
  const [xpAnimations, setXpAnimations] = useState([]);
  const [tasks, setTasks] = useState(minimalXpTasks);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showProgressResetModal, setShowProgressResetModal] = useState(false);

  // Daily Progress States
  const [dailyProgress, setDailyProgress] = useState(0); 
  const [taskXP, setTaskXP] = useState({}); 
  const [overallTaskXP, setOverallTaskXP] = useState({});
  const [overallStats, setOverallStats] = useState({ totalCompletions: 0, uniqueTasks: 0 });

  // Other States
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({ name: '', xp: 10, icon: '⭐', color: '#60a5fa' });
  const [toast, setToast] = useState(null);

  // Memos
  const totalAvailableTasks = Math.max(tasks.length, 1);
  useMemo(() => {
    const rawPercent = (overallStats.totalCompletions / totalAvailableTasks) * 100;
    return Number.isFinite(rawPercent) ? Math.min(rawPercent, 100) : 0;
  }, [overallStats.totalCompletions, totalAvailableTasks]);

  // --- Daily Progress Functions (Kept essential parts) ---
  const getTodayKey = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const loadDailyProgress = () => {
    try {
      const progressData = JSON.parse(localStorage.getItem('dailyTaskStatus') || '{}');
      const todaysTaskXP = progressData.todayTaskXP || progressData.taskXP || {};
      setTaskXP(todaysTaskXP);
      setDailyProgress(Object.keys(todaysTaskXP).filter(id => tasks.some(t => t.id === id)).length); // Filter by current tasks
    } catch (error) {
      console.error('Error loading daily progress:', error);
      setTaskXP({});
      setDailyProgress(0);
    }
  };
    
  const saveDailyTaskStatus = (currentTaskXP) => {
    try {
      const progressData = {
        todayTaskXP: currentTaskXP,
        lastUpdated: getTodayKey()
      };
      localStorage.setItem('dailyTaskStatus', JSON.stringify(progressData));
    } catch (error) {
      console.error('Error saving daily task status:', error);
    }
  };

  const loadOverallProgress = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('overallTaskStatus') || '{}');
      const storedTaskXP = stored.taskXP || {};
      const uniqueTasks = Object.keys(storedTaskXP).length;
      const totalCompletions = Object.values(storedTaskXP).reduce((sum, count) => sum + (count || 0), 0);
      setOverallTaskXP(storedTaskXP);
      setOverallStats({ totalCompletions, uniqueTasks });
    } catch (error) {
      console.error('Error loading overall progress:', error);
      setOverallTaskXP({});
      setOverallStats({ totalCompletions: 0, uniqueTasks: 0 });
    }
  };

  const saveOverallTaskStatus = (currentTaskXP) => {
    try {
      localStorage.setItem('overallTaskStatus', JSON.stringify({ taskXP: currentTaskXP }));
    } catch (error) {
      console.error('Error saving overall task status:', error);
    }
  };
    
  const resetDailyProgress = () => {
    setTaskXP({}); 
    setDailyProgress(0); 
    saveDailyTaskStatus({}); 
    setShowProgressResetModal(false);
    setToast({ message: 'Daily progress reset! Start fresh today! 🌟', type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  // --- useEffect (Simplified/Adapted) ---
  useEffect(() => {
    loadDailyProgress(); 
    loadOverallProgress();
    // Simulate user stats fetching if token is present, otherwise load from local storage
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUserStats({
      level: storedUser.level || 1, xp: storedUser.xp || 0, streak: storedUser.streak || 0,
      tasksCompleted: storedUser.tasksCompleted || 0, skillsUnlocked: 0, mindfulMinutes: 0
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]); 

  // --- addXP Function (Kept logic) ---
  const addXP = async (taskId, xpToAdd, clickPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 }) => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

    const baseXp = typeof storedUser.xp === 'number' ? storedUser.xp : userStats.xp || 0;
    const baseLevel = storedUser.level || userStats.level || 1;
    const baseTasksCompleted = typeof storedUser.tasksCompleted === 'number'
      ? storedUser.tasksCompleted
      : userStats.tasksCompleted || 0;

    let finalXp = baseXp + xpToAdd;
    let finalLevel = Math.floor(finalXp / 100) + 1;
    let finalTasksCompleted = baseTasksCompleted + 1;

    // API call logic removed for brevity but kept in principle 
    // to focus on frontend changes.

    const leveledUp = finalLevel > baseLevel;

    const firebaseUid = user?.uid || storedUser.uid || storedUser.id || storedUser._id || user?._id || user?.id || null;
    const resolvedEmail = user?.email || storedUser.email || '';
    const resolvedName = user?.displayName || storedUser.name || storedUser.username || resolvedEmail.split('@')[0] || 'Explorer';
    const resolvedStreak = typeof storedUser.streak === 'number' ? storedUser.streak : userStats.streak || 0;

    const updatedUser = {
      ...storedUser,
      uid: firebaseUid || storedUser.uid,
      id: firebaseUid || storedUser.id,
      _id: storedUser._id || user?._id,
      email: resolvedEmail,
      name: resolvedName,
      xp: finalXp,
      level: finalLevel,
      tasksCompleted: finalTasksCompleted,
      streak: resolvedStreak,
    };

    localStorage.setItem('user', JSON.stringify(updatedUser));
    if (setUser) {
      setUser(updatedUser);
    }

    setUserStats((prev) => ({
      ...(prev || {}),
      xp: finalXp,
      level: finalLevel,
      tasksCompleted: finalTasksCompleted,
    }));

    if (leveledUp) {
      setToast({ message: `Level Up! Reached Level ${finalLevel}! ✨`, type: 'success' });
    } else {
      setToast({ message: `+${xpToAdd} XP Gained!`, type: 'success' });
    }
    setTimeout(() => setToast(null), 3000);

    setRoadmapAnimation(true);
    setTimeout(() => setRoadmapAnimation(false), 2000);

    const animationId = Date.now();
    const newAnimation = { id: animationId, xp: xpToAdd, x: clickPosition.x - 30, y: clickPosition.y - 30 };
    setXpAnimations((prev) => [...prev, newAnimation]);
    setTimeout(() => setXpAnimations((prev) => prev.filter((anim) => anim.id !== animationId)), 2500);

    setTaskXP((prev) => {
      const newTaskXP = { ...prev, [taskId]: (prev[taskId] || 0) + 1 };
      const uniqueCount = Object.keys(newTaskXP).filter(id => tasks.some(t => t.id === id && (newTaskXP[id] || 0) > 0)).length;
      setDailyProgress(uniqueCount);
      saveDailyTaskStatus(newTaskXP);
      return newTaskXP;
    });

    setOverallTaskXP((prev) => {
      const updated = { ...prev, [taskId]: (prev[taskId] || 0) + 1 };
      const uniqueTasks = Object.keys(updated).length;
      const totalCompletions = Object.values(updated).reduce((sum, count) => sum + (count || 0), 0);
      setOverallStats({ totalCompletions, uniqueTasks });
      saveOverallTaskStatus(updated);
      return updated;
    });

    if (firebaseUid) {
      try {
        await setDoc(
          doc(db, 'users', firebaseUid),
          {
            name: resolvedName,
            email: resolvedEmail,
            xp: finalXp,
            level: finalLevel,
            tasksCompleted: finalTasksCompleted,
            streak: resolvedStreak,
            last_updated: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (firestoreError) {
        console.error('Error syncing leaderboard to Firestore:', firestoreError);
      }
    }
  };

  // --- Task CRUD Functions (Kept logic for custom tasks) ---
  const addNewTask = () => {
    // ... (Code for addNewTask remains the same)
    if (!newTask.name.trim() || newTask.xp <= 0) {
      setToast({ message: 'Please enter a valid task name and XP value', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    const task = { ...newTask, id: `custom_${Date.now()}` };
    setTasks(prev => [task, ...prev]); 
    setShowAddModal(false);
    setToast({ message: `New task "${task.name}" added!`, type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };
  const editTask = () => {
    // ... (Code for editTask remains the same)
    if (!editingTask || !editingTask.name.trim() || editingTask.xp <= 0) {
      setToast({ message: 'Invalid task details', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setTasks(prev => prev.map(task => task.id === editingTask.id ? editingTask : task));
    setShowEditModal(false);
    setToast({ message: 'Task updated successfully!', type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };
  const resetAllTasks = () => {
    // ... (Code for resetAllTasks remains the same)
    setTaskXP({});
    setDailyProgress(0); 
    saveDailyTaskStatus({}); 
    setShowResetModal(false);
    setToast({ message: 'Daily task counts reset! Ready for a fresh start! ✨', type: 'success' });
    setTimeout(() => setToast(null), 4000);
  };
  const deleteTask = () => {
    // ... (Code for deleteTask remains the same)
    if (!taskToDelete) return;
    const deletedTaskName = taskToDelete.name; 

    setTasks(prev => prev.filter(task => task.id !== taskToDelete.id));
    
    setTaskXP(prev => {
      const newTaskXP = { ...prev };
      if (newTaskXP[taskToDelete.id]) {
        delete newTaskXP[taskToDelete.id];
        const uniqueCount = Object.keys(newTaskXP).filter(id => tasks.some(t => t.id === id && (newTaskXP[id] || 0) > 0)).length;
        setDailyProgress(uniqueCount); 
        saveDailyTaskStatus(newTaskXP); 
      }
      return newTaskXP;
    });

    setShowDeleteModal(false);
    setTaskToDelete(null);
    setToast({ message: `Task "${deletedTaskName}" deleted!`, type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  // --- Animation Config (Unchanged) ---
  const sectionAnimation = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
    transition: { duration: 0.4, ease: "easeInOut" }
  };

  // --- MODERN PASTEL THEME WITH 3 COLORS ---
  const pastelTheme = {
    primary: '#E8D5F2',    // Soft Lavender
    secondary: '#D4F1F4',   // Light Cyan
    tertiary: '#FFE5E5',    // Soft Pink
    // Unified background (removed gradient per "same background color" requirement)
    background: '#ffffff',
    textPrimary: '#2D3748',
    textSecondary: '#718096',
    accent: '#8B7FC7',     // Muted Purple
    success: '#A7C7E7',    // Pastel Blue
    white: '#FFFFFF',
  };

  const glassmorphicStyle = {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1.5px solid rgba(0, 0, 0, 0.12)",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
    color: pastelTheme.textPrimary,
  };

  const cardStyle = {
    ...glassmorphicStyle,
    padding: "24px",
    margin: "16px",
    borderRadius: "20px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  };

  return (
    <>
      {/* Sidebar Component */}
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        isVisible={sidebarVisible}
      />
      
      {/* Mobile Menu Toggle Button */}
      <motion.button
        className="mobile-menu-toggle"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setSidebarVisible(!sidebarVisible)}
        style={{
          position: 'fixed',
          top: '20px',
          left: sidebarVisible ? '90px' : '20px',
          zIndex: 1001,
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.98)',
          border: 'none',
          boxShadow: '0 4px 12px rgba(139, 127, 199, 0.25)',
          cursor: 'pointer',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
        }}
      >
        <Icon name={sidebarVisible ? 'x' : 'menu'} size={20} color="#ffffff" />
      </motion.button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="dashboard-content"
        style={{
          minHeight: "100vh", 
          // This is the background you wanted
          background: "linear-gradient(135deg, #f0e6ff 0%, #e0d9ff 100%)",
          color: pastelTheme.textPrimary,
          position: "relative", 
          overflow: "hidden",
          marginLeft: "80px",
          padding: "0 16px"
        }}
      >
        {/* Background elements (adjusted for light theme) */}
        <div style={{ position: "absolute", top: "10%", left: "5%", width: "300px", height: "300px", background: `radial-gradient(circle, #8b5cf615 0%, transparent 70%)`, borderRadius: "50%", animation: "float 20s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "60%", right: "8%", width: "200px", height: "200px", background: `radial-gradient(circle, #f59e0b15 0%, transparent 70%)`, borderRadius: "50%", animation: "float 25s ease-in-out infinite reverse" }} />

        {/* Welcome Header - Enhanced with Pastel Theme */}
        <motion.div
          initial={{ opacity: 0, y: -30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, delay: 0.2 }}
          className="welcome-header"
          style={{
            ...glassmorphicStyle,
            position: "sticky",
            top: 16,
            zIndex: 100,
            width: "min(95%, 1200px)",
            margin: "24px auto 40px",
            padding: "20px 32px",
            borderRadius: "24px",
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)",
            border: "2px solid rgba(0, 0, 0, 0.08)",
            background: "rgba(255, 255, 255, 0.98)",
            boxSizing: "border-box"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  fontSize: "1.5rem", // Reduced font size
                  fontWeight: "700",
                  margin: 0,
                  color: pastelTheme.textPrimary,
                  letterSpacing: "-0.02em"
                }}
              >
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.displayName || user?.name || 'Explorer'}! 👋
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                  fontSize: "0.9rem", // Reduced font size
                  color: pastelTheme.textSecondary,
                  margin: "4px 0 0",
                  fontWeight: "400"
                }}
              >
                Let's make today count! You're on a roll 🚀
              </motion.p>
            </div>
            {/* Stats Badges - Enhanced with Pastel Theme */}
            <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                style={{
                  padding: "14px 24px",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #E8D5F2, #E8D5F2)",
                  border: "2px solid rgba(0, 0, 0, 0.08)",
                  boxShadow: "0 4px 12px rgba(232, 213, 242, 0.3), 0 2px 4px rgba(0, 0, 0, 0.04)",
                  transition: "all 0.3s ease",
                }}>
                <div style={{ fontSize: "0.7rem", color: pastelTheme.textSecondary, marginBottom: "4px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Level</div>
                <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#8B7FC7" }}>{userStats.level}</div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                style={{
                  padding: "14px 24px",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #D4F1F4, #D4F1F4)",
                  border: "2px solid rgba(0, 0, 0, 0.08)",
                  boxShadow: "0 4px 12px rgba(212, 241, 244, 0.3), 0 2px 4px rgba(0, 0, 0, 0.04)",
                  transition: "all 0.3s ease",
                }}>
                <div style={{ fontSize: "0.7rem", color: pastelTheme.textSecondary, marginBottom: "4px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total XP</div>
                <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#8B7FC7" }}>{userStats.xp}</div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div style={{ height: "calc(100vh - 100px)", overflowY: "auto", overflowX: "hidden", position: "relative" }}>
          <div style={{ width: "100%", minHeight: "calc(100vh - 100px)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "0px", paddingBottom: "50px" }}>
            <div style={{ width: "100%", maxWidth: "1200px", padding: "0 20px" }}>
              <AnimatePresence mode="wait">
                {/* Daily Tasks Section - Redesigned Grid Layout */}
                {activeSection === 0 && (
                  <motion.div key={0} {...sectionAnimation}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "30px", width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
                      
                      {/* New Calendar Section with Modern Design */}
                      <CalendarSection 
                        user={user}
                        userStats={userStats} 
                        tasks={tasks} 
                        dailyProgress={dailyProgress}
                        taskXP={taskXP}
                        onResetDaily={() => setShowResetModal(true)}
                      />

                      {/* To-Do List Card - Full Width Separate */}
                      <TodoListCard glassmorphicStyle={glassmorphicStyle} theme={pastelTheme} />

                      {/* Main Daily Tasks Grid - 2x2 Grid */}
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.6, delay: 0.2 }} 
                        className="tasks-grid"
                        style={{ 
                          display: "grid", 
                          gridTemplateColumns: "repeat(2, 1fr)", 
                          gap: "24px", 
                          width: "100%",
                          padding: "0"
                        }}
                      >
                        
                        {/* Task Cards - Compact Redesign */}
                        <AnimatePresence mode="popLayout">
                          {tasks.map((task, index) => {
                            const completionCount = taskXP[task.id] || 0;
                            const isCompleted = completionCount > 0;
                            
                            return (
                              <motion.div
                                key={task.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                transition={{ 
                                  duration: 0.3, 
                                  delay: index * 0.05, 
                                  ease: [0.25, 0.46, 0.45, 0.94],
                                  layout: { duration: 0.3 }
                                }}
                                whileHover={{ scale: 1.02, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                  background: isCompleted 
                                    ? `linear-gradient(135deg, #E8D5F210, #D4F1F410)`
                                    : "rgba(255, 255, 255, 0.98)",
                                  backdropFilter: "blur(20px) saturate(150%)",
                                  WebkitBackdropFilter: "blur(20px) saturate(150%)",
                                  border: `2px solid ${isCompleted ? '#8B7FC7' : 'rgba(0, 0, 0, 0.12)'}`,
                                  boxShadow: isCompleted 
                                    ? `0 12px 32px rgba(139, 127, 199, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08)`
                                    : "0 8px 24px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04)",
                                  borderRadius: "24px",
                                  padding: "24px",
                                  margin: "0",
                                  position: "relative",
                                  overflow: "hidden",
                                  cursor: "pointer",
                                  color: pastelTheme.textPrimary,
                                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  minHeight: '200px',
                                  width: '100%',
                                  boxSizing: 'border-box'
                                }}
                                onClick={(event) => {
                                  const clickPosition = {
                                    x: event.clientX,
                                    y: event.clientY,
                                  };
                                  addXP(task.id, task.xp, clickPosition);
                                }}
                              >
                                
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                  <HabitIcon icon={task.icon} color={task.color} size="md" />
                                  {isCompleted && (
                                    <motion.div
                                      initial={{ scale: 0, rotate: -180 }} 
                                      animate={{ scale: 1, rotate: 0 }}
                                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                      style={{
                                        background: `linear-gradient(135deg, ${task.color}, ${task.color}CC)`,
                                        color: "#fff", 
                                        padding: "4px 10px", 
                                        borderRadius: "10px", 
                                        fontSize: "0.8rem", 
                                        fontWeight: "700",
                                        boxShadow: `0 2px 8px ${task.color}60`,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px"
                                      }}
                                    >
                                      <span style={{ fontSize: "0.9rem" }}>✓</span> {completionCount}
                                    </motion.div>
                                  )}
                                </div>
                                
                                <div style={{ flexGrow: 1 }}>
                                  <h3 style={{ 
                                    fontSize: "1.1rem", 
                                    fontWeight: "700", 
                                    color: pastelTheme.textPrimary, 
                                    marginBottom: "4px",
                                    letterSpacing: "-0.01em"
                                  }}>
                                    {task.name}
                                  </h3>
                                  <p style={{ 
                                    fontSize: "0.85rem", 
                                    color: pastelTheme.textSecondary, 
                                    lineHeight: "1.4"
                                  }}>
                                    {task.description}
                                  </p>
                                </div>

                                {/* XP Badge at the bottom */}
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  style={{ 
                                    background: `linear-gradient(135deg, ${task.color}, ${task.color}DD)`, 
                                    padding: "8px 16px", 
                                    borderRadius: "12px", 
                                    fontSize: "0.9rem", 
                                    fontWeight: "700", 
                                    color: "#fff", 
                                    boxShadow: `0 4px 10px ${task.color}40`,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    marginTop: '16px',
                                    alignSelf: 'flex-start'
                                  }}
                                >
                                  <span style={{ fontSize: "1rem" }}>⭐</span> +{task.xp} XP
                                </motion.div>

                                {/* Glow Effect */}
                                <div 
                                  style={{
                                    position: 'absolute',
                                    top: '-50%',
                                    left: '-50%',
                                    width: '200%',
                                    height: '200%',
                                    background: `radial-gradient(circle, ${task.color}10 0%, transparent 70%)`, // Lighter glow
                                    opacity: isCompleted ? 0.4 : 0, // Reduced opacity
                                    transition: 'opacity 0.3s ease',
                                    pointerEvents: 'none'
                                  }}
                                />
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </motion.div>

                      {/* Motivational Section (Kept for completion) */}
                      {dailyProgress >= tasks.length && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5 }}
                          style={{
                            ...glassmorphicStyle,
                            borderRadius: "20px",
                            padding: "30px",
                            textAlign: "center",
                            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(139, 92, 246, 0.1))",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                            boxShadow: "0 4px 20px rgba(16, 185, 129, 0.15)"
                          }}
                        >
                          <motion.div
                            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                            style={{ fontSize: "3rem", marginBottom: "15px" }}
                          >
                            🎉
                          </motion.div>
                          <h3 style={{
                            fontSize: "1.6rem",
                            fontWeight: "700",
                            color: "#10b981",
                            marginBottom: "8px",
                            letterSpacing: "-0.02em"
                          }}>
                            All Tasks Completed!
                          </h3>
                          <p style={{
                            fontSize: "1rem",
                            color: pastelTheme.textSecondary,
                            lineHeight: "1.5"
                          }}>
                            Amazing work! You've completed all your daily habits. Keep the momentum going! 🚀
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
                {/* Other Sections (Unchanged) */}
                {activeSection === 1 && (<motion.div key={1} {...sectionAnimation}> <LevelRoadmap level={userStats.level} xp={userStats.xp} triggerAnimation={roadmapAnimation} /> </motion.div>)}
                
                {/* --- THIS IS THE UPDATED LINE --- */}
                {activeSection === 2 && (<motion.div key={2} {...sectionAnimation}><AIAssistant addXP={addXP} /></motion.div>)}
                
                {activeSection === 3 && (<motion.div key={3} {...sectionAnimation}><Expenses addXP={addXP} /></motion.div>)}
                {activeSection === 4 && (<motion.div key={4} {...sectionAnimation}> <Leaderboard user={user} /> </motion.div>)}
                {activeSection === 5 && (<motion.div key={5} {...sectionAnimation}><CalorieTracker user={user} addXP={addXP} userStats={userStats} setUserStats={setUserStats} /></motion.div>)}
                {activeSection === 6 && (<motion.div key={6} {...sectionAnimation}><UserProfile user={user} setUser={setUser} /></motion.div>)}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* XP Animations (Unchanged) */}
        <AnimatePresence>
          {xpAnimations.map(anim => (
            <motion.div 
              key={anim.id} 
              initial={{ 
                opacity: 1, 
                scale: 0.5, 
                x: anim.x - 30, 
                y: anim.y - 30 
              }}
              animate={{ 
                opacity: 0, 
                scale: 1.8, 
                y: anim.y - 140, 
                x: anim.x - 30 + (Math.random() - 0.5) * 40 
              }}
              transition={{ 
                duration: 1.8, 
                ease: [0.25, 0.46, 0.45, 0.94] 
              }}
              style={{ 
                position: "fixed", 
                fontSize: "1.4rem", 
                fontWeight: "800", 
                pointerEvents: "none", 
                zIndex: 1000,
                color: "#fbbf24",
                textShadow: "0 2px 10px rgba(251, 191, 36, 0.5), 0 0 20px rgba(251, 191, 36, 0.3)"
              }}
            >
              +{anim.xp} XP
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Toast Notifications (Unchanged) */}
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.9 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 30, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              style={{ 
                position: "fixed", 
                bottom: "30px", 
                left: "50%", 
                transform: "translateX(-50%)", 
                padding: "16px 28px", 
                borderRadius: "16px", 
                zIndex: 1001, 
                background: toast.type === 'error' 
                  ? "rgba(239, 68, 68, 0.95)" 
                  : "rgba(16, 185, 129, 0.95)", 
                backdropFilter: "blur(12px)",
                color: "#fff", 
                fontWeight: "600",
                boxShadow: toast.type === 'error'
                  ? "0 8px 32px rgba(239, 68, 68, 0.4)"
                  : "0 8px 32px rgba(16, 185, 129, 0.4)",
                border: `1.5px solid rgba(255, 255, 255, 0.2)`,
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "0.95rem"
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>
                {toast.type === 'error' ? '⚠️' : '✅'}
              </span>
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modern CSS Animations and Responsive Styles */}
        <style>{`
          /* ... (All CSS styles remain the same) ... */
          @keyframes float { 
            0%, 100% { transform: translateY(0px) rotate(0deg); } 
            50% { transform: translateY(-20px) rotate(3deg); } 
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes pulse-glow {
            0%, 100% { 
              box-shadow: 0 0 20px rgba(59, 130, 246, 0.4); 
            }
            50% { 
              box-shadow: 0 0 30px rgba(139, 92, 246, 0.6), 0 0 40px rgba(236, 72, 153, 0.3); 
            }
          }
          
          @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          
          .progress-container:hover .progress-fill { 
            animation: pulse-glow 1.5s ease-in-out infinite; 
          }

          /* Card Hover Effects */
          .tasks-grid > * {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .tasks-grid > *:hover {
            transform: translateY(-4px);
          }

          /* Comprehensive Responsive Styles */
          @media (max-width: 1200px) {
            .tasks-grid {
              gridTemplateColumns: repeat(auto-fit, minmax(280px, 1fr)) !important;
              gap: 20px !important;
            }
          }

          @media (max-width: 768px) {
            .sidebar-container {
              width: 70px !important;
              padding: 15px 0 !important;
            }
            .sidebar-container > div {
              margin: 8px 0 !important;
            }
            .sidebar-container button {
              width: 48px !important;
              height: 48px !important;
            }
            .dashboard-content {
              margin-left: 70px !important;
              padding: 0 12px !important;
            }
            .mobile-menu-toggle {
              display: flex !important;
            }
            .tasks-grid {
              gridTemplateColumns: repeat(auto-fit, minmax(260px, 1fr)) !important;
              gap: 20px !important;
              padding: 0 !important;
            }
          }

          @media (max-width: 480px) {
            .sidebar-container {
              width: 60px !important;
              padding: 10px 0 !important;
            }
            .sidebar-container > div {
              margin: 6px 0 !important;
            }
            .sidebar-container button {
              width: 42px !important;
              height: 42px !important;
            }
            .dashboard-content {
              margin-left: 0 !important;
              padding: 0 8px !important;
            }
            .mobile-menu-toggle {
              display: flex !important;
              left: 20px !important;
            }
            .tasks-grid {
              gridTemplateColumns: 1fr !important;
              gap: 16px !important;
              padding: 0 !important;
            }
          }

          /* Responsive for Progress Overview */
          @media (max-width: 1024px) {
            .tasks-grid {
              gridTemplateColumns: repeat(2, 1fr) !important;
              gap: 20px !important;
            }
          }

          @media (max-width: 768px) {
            .progress-overview {
              gridTemplateColumns: 1fr !important;
              gap: 16px !important;
            }
            .tasks-grid {
              gridTemplateColumns: 1fr !important;
              gap: 20px !important;
            }
          }

          @media (max-width: 640px) {
            .tasks-grid {
              gridTemplateColumns: 1fr !important;
              gap: 16px !important;
            }
            .welcome-header {
              padding: 16px 20px !important;
              margin: 16px auto 24px !important;
            }
            .welcome-header h1 {
              fontSize: 1.2rem !important;
            }
            .welcome-header p {
              fontSize: 0.8rem !important;
            }
          }

          /* Smooth transitions for responsive changes */
          .sidebar-container,
          .sidebar-container button,
          .dashboard-content,
          .mobile-menu-toggle,
          .tasks-grid,
          .progress-overview {
            transition: all 0.3s ease;
          }
        `}</style>
      </motion.div>

      {/* Modals (Unchanged in functionality, slight style adjustment for light theme) */}
      <TaskModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Task" task={newTask} onTaskChange={setNewTask} onSave={addNewTask} isEdit={false} />
      <TaskModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Task" task={editingTask} onTaskChange={setEditingTask} onSave={editTask} isEdit={true} />
      <ConfirmationModal isOpen={showResetModal} onClose={() => setShowResetModal(false)} onConfirm={resetAllTasks} title="Reset Daily Counts?" message="This will reset today's completion counts for all tasks. This action cannot be undone." confirmText="Reset Daily" icon="🔄" />
      <ConfirmationModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={deleteTask} title="Delete Task?" message={`Are you sure you want to delete the task "${taskToDelete?.name}"? This cannot be undone.`} confirmText="Delete Task" icon="🗑️" />
      <ConfirmationModal isOpen={showProgressResetModal} onClose={() => setShowProgressResetModal(false)} onConfirm={resetDailyProgress} title="Reset Daily Progress?" message="This will clear today's task completion counts and start fresh. This action cannot be undone." confirmText="Reset Progress" icon="🔄" />
    </>
  );
}

export default Dashboard;