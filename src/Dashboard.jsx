import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useTheme } from "./ThemeContext";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import Game from "./Game";
import LevelRoadmap from "./LevelRoadmap";
import Leaderboard from "./Leaderboard";
import CalorieTracker from "./CalorieTracker";
import UserProfile from "./UserProfile";
import AIAssistant from "./AIAssistant";
import Icon from "./components/ui/Icon";

// GlassIcon component (Unchanged)
const GlassIcon = ({ icon, color = 'rgba(255, 255, 255, 0.1)', size = 'md', className = '' }) => {
  const sizeMap = {
    sm: { container: 'w-8 h-8', iconSize: 14 },
    md: { container: 'w-12 h-12', iconSize: 20 },
    lg: { container: 'w-16 h-16', iconSize: 28 },
  };

  return (
    <div 
      className={`${sizeMap[size].container} ${className} rounded-full flex items-center justify-center backdrop-blur-lg`}
      style={{
        background: `linear-gradient(135deg, ${color}20, ${color}40)`,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Icon 
        name={icon} 
        size={sizeMap[size].iconSize} 
        color={color} 
      />
    </div>
  );
};

const API_URL = 'http://localhost:5000/api';

// Task categories (Unchanged)
const xpTasks = [
  { id: 'drink_water', name: 'Drink Water', xp: 5, icon: 'water', color: '#06b6d4' },
  { id: 'breakfast', name: 'Breakfast', xp: 10, icon: 'food', color: '#f59e0b' },
  { id: 'lunch', name: 'Lunch', xp: 15, icon: 'food', color: '#10b981' },
  { id: 'dinner', name: 'Dinner', xp: 15, icon: 'food', color: '#ef4444' },
  { id: 'take_break', name: 'Take Break', xp: 8, icon: 'coffee', color: '#8b5cf6' },
  { id: 'run', name: 'Run', xp: 20, icon: 'run', color: '#f97316' },
  { id: 'coding', name: 'Coding', xp: 25, icon: 'code', color: '#3b82f6' },
  { id: 'reading', name: 'Reading', xp: 12, icon: 'book', color: '#6366f1' },
  { id: 'meditation', name: 'Meditation', xp: 18, icon: 'meditation', color: '#14b8a6' },
  { id: 'exercise', name: 'Exercise', xp: 22, icon: 'exercise', color: '#ec4899' },
  { id: 'early_bedtime', name: 'Early Bedtime', xp: 12, icon: 'moon', color: '#8b5cf6' },
  { id: 'stretching', name: 'Stretching', xp: 10, icon: 'stretch', color: '#10b981' },
  { id: 'journaling', name: 'Journaling', xp: 15, icon: 'write', color: '#f59e0b' },
  { id: 'walking', name: 'Walking', xp: 18, icon: 'walk', color: '#06b6d4' },
  { id: 'gratitude', name: 'Gratitude Practice', xp: 8, icon: 'heart', color: '#fbbf24' },
  { id: 'learning', name: 'Learn Something New', xp: 20, icon: 'learn', color: '#6366f1' },
  { id: 'music', name: 'Listen to Music', xp: 8, icon: 'music', color: '#ec4899' },
  { id: 'cleaning', name: 'Quick Tidy Up', xp: 10, icon: 'clean', color: '#64748b' },
];

// Navigation items (Unchanged)
const navItems = [
  { title: 'Daily Tasks', icon: 'list' },
  { title: 'Levels', icon: 'trophy' },
  { title: 'AI Assistant', icon: 'ai' },
  { title: 'Challenges', icon: 'target' },
  { title: 'Leaderboard', icon: 'leaderboard' },
  { title: 'Calories', icon: 'flame' },
  { title: 'Profile', icon: 'user' }
];

// --- MODAL COMPONENTS (Unchanged - Already good glassmorphism) ---

const TaskModal = ({ isOpen, onClose, title, task, onSave, onTaskChange, isEdit = false }) => {
  if (!isOpen) return null;
  // ... (Modal code is unchanged)
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
              background: "rgba(25, 35, 55, 0.8)", backdropFilter: "blur(20px) saturate(180%)",
              borderRadius: "25px", padding: "30px", border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)", width: "100%", maxWidth: "500px", color: "#fff"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "25px" }}>
              <span style={{ fontSize: "1.5rem" }}>{isEdit ? '✏️' : '➕'}</span>
              <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "700" }}>{title}</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#cbd5e1", marginBottom: "8px" }}>Task Name</label>
                <input type="text" value={task.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Enter task name..." style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.2)", background: "rgba(255, 255, 255, 0.05)", color: "#fff", fontSize: "0.9rem", outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#cbd5e1", marginBottom: "8px" }}>XP Points</label>
                <input type="number" value={task.xp || ''} onChange={(e) => handleInputChange('xp', parseInt(e.target.value) || 0)} placeholder="Enter XP points..." min="1" style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.2)", background: "rgba(255, 255, 255, 0.05)", color: "#fff", fontSize: "0.9rem", outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#cbd5e1", marginBottom: "8px" }}>Icon</label>
                <select value={task.icon || '⭐'} onChange={(e) => handleInputChange('icon', e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.2)", background: "rgba(255, 255, 255, 0.05)", color: "#fff", fontSize: "0.9rem", outline: "none" }}>
                  {['⭐', '🎯', '🚀', '💪', '🧠', '💡', '🔥', '⚡', '🌟', '🎨', '📚', '🏃‍♂️', '💻', '🎵', '🧘‍♀️'].map(icon => <option key={icon} value={icon}>{icon}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#cbd5e1", marginBottom: "8px" }}>Color Theme</label>
                <select value={task.color || '#60a5fa'} onChange={(e) => handleInputChange('color', e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.2)", background: "rgba(255, 255, 255, 0.05)", color: "#fff", fontSize: "0.9rem", outline: "none" }}>
                  <option value="#60a5fa">🔵 Blue</option><option value="#f59e0b">🟡 Yellow</option><option value="#10b981">🟢 Green</option><option value="#ef4444">🔴 Red</option><option value="#8b5cf6">🟣 Purple</option><option value="#f97316">🟠 Orange</option><option value="#ec4899">🩷 Pink</option><option value="#06b6d4">🩵 Cyan</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "30px", justifyContent: "flex-end" }}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClose} style={{ padding: "12px 24px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.2)", background: "transparent", color: "#cbd5e1", fontWeight: "600", cursor: "pointer" }}>Cancel</motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onSave} style={{ padding: "12px 24px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", fontWeight: "600", cursor: "pointer" }}>{isEdit ? 'Update Task' : 'Add Task'}</motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, icon }) => {
  if (!isOpen) return null;
  // ... (Modal code is unchanged)
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
            style={{ background: "rgba(25, 35, 55, 0.8)", backdropFilter: "blur(20px) saturate(180%)", borderRadius: "25px", padding: "30px", border: "1px solid rgba(255, 255, 255, 0.1)", boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)", width: "100%", maxWidth: "450px", textAlign: "center", color: "#fff" }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }} style={{ fontSize: "3rem", marginBottom: "20px" }}>{icon}</motion.div>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "1.3rem", fontWeight: "700" }}>{title}</h3>
            <p style={{ margin: "0 0 25px 0", fontSize: "0.9rem", color: "#cbd5e1", lineHeight: "1.5" }}>{message}</p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClose} style={{ padding: "12px 24px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.2)", background: "transparent", color: "#cbd5e1", fontWeight: "600", cursor: "pointer", flex: 1 }}>Cancel</motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onConfirm} style={{ padding: "12px 24px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "#fff", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 15px rgba(239, 68, 68, 0.3)", flex: 1 }}>{confirmText}</motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


function Dashboard({ user, setUser, token, setToken }) {
  const { theme } = useTheme();
  const [profile, setProfile] = useState(null);
  const [userStats, setUserStats] = useState({ level: 1, xp: 0, streak: 0, tasksCompleted: 0, skillsUnlocked: 0, mindfulMinutes: 0 });
  const [activeSection, setActiveSection] = useState(0);
  const [roadmapAnimation, setRoadmapAnimation] = useState(false);
  const [xpAnimations, setXpAnimations] = useState([]);
  const [tasks, setTasks] = useState(xpTasks);

  // Modal States (Unchanged)
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showProgressResetModal, setShowProgressResetModal] = useState(false);

  // Daily Progress States (Unchanged)
  const [dailyProgress, setDailyProgress] = useState(0); 
  const [taskXP, setTaskXP] = useState({}); 
  const [overallTaskXP, setOverallTaskXP] = useState({});
  const [overallStats, setOverallStats] = useState({ totalCompletions: 0, uniqueTasks: 0 });

  // Other States (Unchanged)
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({ name: '', xp: 10, icon: '⭐', color: '#60a5fa' });
  const [toast, setToast] = useState(null);

  // Memos (Unchanged)
  const totalAvailableTasks = Math.max(tasks.length, 1);
  const overallCompletionPercent = useMemo(() => {
    const rawPercent = (overallStats.totalCompletions / totalAvailableTasks) * 100;
    return Number.isFinite(rawPercent) ? Math.min(rawPercent, 100) : 0;
  }, [overallStats.totalCompletions, totalAvailableTasks]);
  const overallPercentRounded = Math.round(overallCompletionPercent);

  // --- API & Core Logic (Unchanged) ---
  const makeAuthenticatedRequest = async (url, data = null, method = 'GET') => {
    const config = { method, url: `${API_URL}${url}`, headers: { Authorization: `Bearer ${token}` } };
    if (data) config.data = data;
    return axios(config);
  };

  // --- Daily Progress Functions (Unchanged) ---
  const getTodayKey = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const loadDailyProgress = () => {
    try {
      const progressData = JSON.parse(localStorage.getItem('dailyTaskStatus') || '{}');
      const todaysTaskXP = progressData.todayTaskXP || progressData.taskXP || {};
      setTaskXP(todaysTaskXP);
      setDailyProgress(Object.keys(todaysTaskXP).length);
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

  // --- useEffect (Unchanged) ---
  useEffect(() => {
    setProfile({ name: "Growth Seeker", email: "demo@example.com", photoURL: null });
    loadDailyProgress(); 
    loadOverallProgress();
    if (user?._id && token) {
      makeAuthenticatedRequest('/users/profile-stats')
        .then(response => {
          const { progress, stats } = response.data;
          setUserStats({
            level: progress.level || 1, xp: progress.xp || 0,
            streak: stats.streak || 0, tasksCompleted: stats.tasksCompleted || 0,
            skillsUnlocked: stats.skillsUnlocked || 0, mindfulMinutes: 0
          });
        })
        .catch(error => {
          console.error('Error fetching user stats:', error);
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          setUserStats({
            level: storedUser.level || 1, xp: storedUser.xp || 0, streak: storedUser.streak || 0,
            tasksCompleted: storedUser.tasksCompleted || 0, skillsUnlocked: 0, mindfulMinutes: 0
          });
        });
    } else {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setUserStats({
            level: storedUser.level || 1, xp: storedUser.xp || 0, streak: storedUser.streak || 0,
            tasksCompleted: storedUser.tasksCompleted || 0, skillsUnlocked: 0, mindfulMinutes: 0
          });
    }
  }, [user, token]); 

  // --- addXP Function (Unchanged) ---
  const addXP = async (taskId, xpToAdd, clickPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 }) => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isOffline = !token || token.startsWith('offline_');

    const baseXp = typeof storedUser.xp === 'number' ? storedUser.xp : userStats.xp || 0;
    const baseLevel = storedUser.level || userStats.level || 1;
    const baseTasksCompleted = typeof storedUser.tasksCompleted === 'number'
      ? storedUser.tasksCompleted
      : userStats.tasksCompleted || 0;

    let finalXp = baseXp + xpToAdd;
    let finalLevel = Math.floor(finalXp / 100) + 1;
    let finalTasksCompleted = baseTasksCompleted + 1;

    if (!isOffline) {
      try {
        const response = await makeAuthenticatedRequest('/users/add-xp', { xp: xpToAdd }, 'POST');
        if (response?.data) {
          const { xp: remoteXp, level: remoteLevel, tasksCompleted: remoteTasks } = response.data;
          if (typeof remoteXp === 'number') finalXp = remoteXp;
          if (typeof remoteLevel === 'number') finalLevel = remoteLevel;
          if (typeof remoteTasks === 'number') finalTasksCompleted = remoteTasks;
        }
      } catch (error) {
        console.warn('API /add-xp failed, applying local fallback.', error);
      }
    }

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
      const uniqueCount = Object.keys(newTaskXP).length;
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

  // --- Task CRUD Functions (Unchanged) ---
  const openAddModal = () => {
    setNewTask({ name: '', xp: 10, icon: '⭐', color: '#60a5fa' });
    setShowAddModal(true);
  };

  const addNewTask = () => {
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

  const openEditModal = (task) => {
    setEditingTask({ ...task });
    setShowEditModal(true);
  };

  const editTask = () => {
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
    setTaskXP({});
    setDailyProgress(0); 
    saveDailyTaskStatus({}); 
    setShowResetModal(false);
    setToast({ message: 'Daily task counts reset! Ready for a fresh start! ✨', type: 'success' });
    setTimeout(() => setToast(null), 4000);
  };

  const confirmDeleteTask = (task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const deleteTask = () => {
    if (!taskToDelete) return;
    const deletedTaskName = taskToDelete.name; 

    setTasks(prev => prev.filter(task => task.id !== taskToDelete.id));
    
    setTaskXP(prev => {
      const newTaskXP = { ...prev };
      if (newTaskXP[taskToDelete.id]) {
        delete newTaskXP[taskToDelete.id];
        const uniqueCount = Object.keys(newTaskXP).length;
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

  // --- GLASSMORPHIC STYLES ---
  // Define the core glass style here to reuse
  const glassmorphicStyle = {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.2)",
    color: theme.textPrimary, // Ensure text is readable
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          minHeight: "100vh", background: theme.background, color: theme.textPrimary,
          position: "relative", overflow: "hidden"
        }}
      >
        {/* Background elements (Unchanged) */}
        <div style={{ position: "absolute", top: "10%", left: "5%", width: "300px", height: "300px", background: `radial-gradient(circle, ${theme.accent}10 0%, transparent 70%)`, borderRadius: "50%", animation: "float 20s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "60%", right: "8%", width: "200px", height: "200px", background: `radial-gradient(circle, ${theme.accentSecondary}10 0%, transparent 70%)`, borderRadius: "50%", animation: "float 25s ease-in-out infinite reverse" }} />

        {/* Header Navigation (STYLES UPDATED) */}
        <motion.div
          initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            ...glassmorphicStyle, // Apply base glass style
            position: "sticky",
            top: 16,
            zIndex: 100,
            width: "min(92%, 1100px)",
            margin: "0 auto",
            padding: "18px clamp(20px, 5vw, 40px)",
            borderRadius: "26px",
            backgroundClip: "padding-box",
            // Override/add specific styles
            boxShadow: "0 18px 48px rgba(0, 0, 0, 0.25)",
            border: `1px solid rgba(255, 255, 255, 0.1)`,
          }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px", display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
            {[
              { title: 'Daily Tasks', icon: '📋' }, { title: 'Levels', icon: '🏆' }, { title: 'AI Assistant', icon: '🤖' },
              { title: 'Challenges', icon: '🎮' }, { title: 'Leaderboard', icon: '👑' }, { title: 'Calories', icon: '🔥' }, { title: 'Profile', icon: '👤' }
            ].map((section, index) => {
              const isActive = activeSection === index;
              
              // STYLES UPDATED for buttons
              const activeStyle = {
                background: 'linear-gradient(135deg, #facc15, #f97316)',
                color: '#1f2937',
                boxShadow: '0 12px 30px rgba(250, 204, 21, 0.35)',
                border: '1px solid rgba(250, 204, 21, 0.65)',
              };
              
              const inactiveStyle = {
                background: 'rgba(255, 255, 255, 0.08)',
                color: theme.textSecondary,
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 6px 18px rgba(15, 23, 42, 0.35)',
              };

              return (
                <motion.button
                  key={section.title}
                  whileHover={{
                    scale: 1.08,
                    y: -4,
                    boxShadow: isActive ? '0 14px 32px rgba(250, 204, 21, 0.45)' : '0 12px 28px rgba(255, 255, 255, 0.15)',
                    background: isActive ? 'linear-gradient(135deg, #fde68a, #fbbf24)' : 'rgba(255, 255, 255, 0.15)',
                    color: isActive ? '#1f2937' : theme.textPrimary, // Brighter text on hover
                  }}
                  whileTap={{ scale: 0.94 }}
                  animate={isActive ? {
                    boxShadow: [
                      '0 8px 24px rgba(250, 204, 21, 0.3)',
                      '0 16px 36px rgba(250, 204, 21, 0.55)',
                      '0 10px 28px rgba(250, 204, 21, 0.35)'
                    ]
                  } : {}}
                  transition={isActive ? { duration: 2.2, repeat: Infinity, repeatType: 'reverse' } : {}}
                  onClick={() => setActiveSection(index)}
                  style={{
                    padding: "12px 24px",
                    borderRadius: "15px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.35s ease",
                    backgroundSize: '200% 200%',
                    ...(isActive ? activeStyle : inactiveStyle) // Apply dynamic styles
                  }}
                >
                  <motion.span
                    animate={{ rotate: isActive ? [0, 5, -5, 0] : 0 }}
                    transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
                  >
                    {section.icon}
                  </motion.span>
                  <span>{section.title}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div style={{ height: "calc(100vh - 100px)", overflowY: "auto", overflowX: "hidden", position: "relative" }}>
          <div style={{ width: "100%", minHeight: "calc(100vh - 100px)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "20px", paddingBottom: "50px" }}>
            <div style={{ width: "100%", maxWidth: "1400px", padding: "40px 20px" }}>
              <AnimatePresence mode="wait">
                {/* Daily Tasks Section */}
                {activeSection === 0 && (
                  <motion.div key={0} {...sectionAnimation}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "30px", width: '100%' }}>
                      
                      {/* Section Header (STYLES UPDATED) */}
                      <motion.div 
                        initial={{ opacity: 0, y: -20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.6 }} 
                        style={{ 
                          ...glassmorphicStyle, // Apply base glass style
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center", 
                          borderRadius: "25px", 
                          padding: "25px 30px", 
                        }}
                      >
                        <div>
                          <h2 style={{ fontSize: "1.8rem", fontWeight: "700", margin: 0, background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentSecondary})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Daily Tasks</h2>
                          <p style={{ fontSize: "1rem", color: theme.textSecondary, margin: "8px 0 0" }}>{tasks.length} tasks available • {dailyProgress} unique completed today</p>
                        </div>
                        <div style={{ display: "flex", gap: "15px" }}>
                          {/* Reset Button (STYLES UPDATED) */}
                          <motion.button 
                            whileHover={{ scale: 1.05, boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4)' }} 
                            whileTap={{ scale: 0.95 }} 
                            onClick={() => setShowResetModal(true)} 
                            style={{ 
                              padding: "12px 20px", 
                              borderRadius: "15px", 
                              border: "1px solid rgba(239, 68, 68, 0.5)", 
                              background: "rgba(239, 68, 68, 0.2)", // Glassy Red
                              backdropFilter: "blur(10px)",
                              color: "#fff", 
                              fontWeight: "600", 
                              cursor: "pointer", 
                              display: "flex", 
                              alignItems: "center", 
                              gap: "8px" 
                            }}
                          >
                            <span>🔄</span> Reset Daily
                          </motion.button>
                          {/* Add Task Button (STYLES UPDATED) */}
                          <motion.button 
                            whileHover={{ scale: 1.05, boxShadow: '0 8px 25px rgba(34, 197, 94, 0.4)' }} 
                            whileTap={{ scale: 0.95 }} 
                            onClick={openAddModal} 
                            style={{ 
                              padding: "12px 20px", 
                              borderRadius: "15px", 
                              border: "1px solid rgba(34, 197, 94, 0.5)", 
                              background: "rgba(34, 197, 94, 0.2)", // Glassy Green
                              backdropFilter: "blur(10px)",
                              color: "#fff", 
                              fontWeight: "600", 
                              cursor: "pointer", 
                              display: "flex", 
                              alignItems: "center", 
                              gap: "8px" 
                            }}
                          >
                            <span>➕</span> Add Task
                          </motion.button>
                        </div>
                      </motion.div>
                      
                      {/* Daily Progress Card (STYLES UPDATED) */}
                      <motion.div 
                        initial={{ opacity: 0, y: -20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.6, delay: 0.1 }} 
                        style={{ 
                          ...glassmorphicStyle, // Apply base glass style
                          borderRadius: "20px", 
                          padding: "25px", 
                          // Override border/bg for a neutral look
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)" 
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ fontSize: "1.5rem" }}>📊</span>
                            <h3 style={{ fontSize: "1.3rem", fontWeight: "700", margin: 0, color: theme.textPrimary }}>Daily Progress</h3>
                          </div>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowProgressResetModal(true)} style={{ padding: "8px 16px", borderRadius: "12px", border: "1px solid rgba(239, 68, 68, 0.3)", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", fontWeight: "600", cursor: "pointer", fontSize: "0.85rem" }}>🔄 Reset</motion.button>
                        </div>

                        {/* Stats Cards Row (STYLES UPDATED) */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "20px" }}>
                          
                          {/* Daily Tasks Progress */}
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                            style={{ 
                              background: "rgba(139, 92, 246, 0.15)", // Keep color tint
                              backdropFilter: "blur(10px)",
                              borderRadius: "15px", 
                              padding: "15px", 
                              border: "1px solid rgba(139, 92, 246, 0.25)", 
                              textAlign: "center" 
                            }}
                            key={`unique-progress-${dailyProgress}-${tasks.length}`}
                          >
                            <GlassIcon icon="list" color="#8b5cf6" size="md" />
                            <h4 style={{ fontSize: "0.9rem", color: theme.textSecondary, margin: "0 0 5px 0", fontWeight: "600" }}>Unique Tasks Done</h4>
                            <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#8b5cf6" }}>
                              {dailyProgress}/{Math.max(tasks.length, 1)} 
                            </div>
                            <div style={{ fontSize: "0.8rem", color: theme.textSecondary, marginTop: "5px" }}>
                              {Math.round((dailyProgress / Math.max(tasks.length, 1)) * 100)}% Complete
                            </div>
                          </motion.div>

                          {/* Total XP Gained Today */}
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                            style={{ 
                              background: "rgba(251, 191, 36, 0.15)", // Keep color tint
                              backdropFilter: "blur(10px)",
                              borderRadius: "15px", 
                              padding: "15px", 
                              border: "1px solid rgba(251, 191, 36, 0.25)", 
                              textAlign: "center" 
                            }}
                            key={`xp-gained-${Object.values(taskXP).reduce((sum, count) => sum + count, 0)}`}
                          >
                            <GlassIcon icon="star" color="#fbbf24" size="md" />
                            <h4 style={{ fontSize: "0.9rem", color: theme.textSecondary, margin: "0 0 5px 0", fontWeight: "600" }}>XP Gained Today</h4>
                            <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#fbbf24" }}>
                              {Object.entries(taskXP).reduce((sum, [taskId, count]) => {
                                const task = tasks.find(t => t.id === taskId);
                                return sum + (count * (task?.xp || 0)); 
                              }, 0)}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: theme.textSecondary, marginTop: "5px" }}>
                              From {Object.values(taskXP).reduce((sum, count) => sum + count, 0)} completions
                            </div>
                          </motion.div>

                          {/* Current Level Progress */}
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                            style={{ 
                              background: "rgba(16, 185, 129, 0.15)", // Keep color tint
                              backdropFilter: "blur(10px)",
                              borderRadius: "15px", 
                              padding: "15px", 
                              border: "1px solid rgba(16, 185, 129, 0.25)", 
                              textAlign: "center" 
                            }}
                            key={`level-${userStats.level}-${userStats.xp}`}
                          >
                            <GlassIcon icon="trophy" color="#10b981" size="md" />
                            <h4 style={{ fontSize: "0.9rem", color: theme.textSecondary, margin: "0 0 5px 0", fontWeight: "600" }}>Current Level</h4>
                            <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#10b981" }}>
                                Level {userStats.level}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: theme.textSecondary, marginTop: "5px" }}>
                                {userStats.xp} / {userStats.level * 100} XP 
                            </div>
                          </motion.div>
                        </div>

                        {/* Overall Progress (STYLES UPDATED) */}
                        <div style={{ marginBottom: "20px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", width: "100%" }}>
                            <span style={{ fontSize: "0.9rem", color: theme.textSecondary, fontWeight: "600" }}>Overall Task Progress</span>
                            <span style={{ fontSize: "0.8rem", color: theme.textSecondary }}>
                              {overallStats.totalCompletions} total completions • {overallStats.uniqueTasks} unique tasks explored
                            </span>
                          </div>
                          
                          {/* Progress Bar Container (STYLES UPDATED) */}
                          <div style={{ 
                            position: "relative", 
                            height: "32px", 
                            background: "rgba(0, 0, 0, 0.25)", // Darker glass base
                            borderRadius: "16px", 
                            overflow: "hidden", 
                            boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.2)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            width: "100%" 
                          }}>
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 900,
                                fontSize: "0.95rem",
                                color: "#fff",
                                textShadow: "0 2px 6px rgba(0, 0, 0, 0.7)"
                              }}
                            >
                              {overallPercentRounded}%
                            </div>
                            <div
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                bottom: 0,
                                width: `${overallCompletionPercent}%`,
                                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 30%, #ec4899 60%, #f59e0b 100%)",
                                transition: "width 0.1s ease",
                                borderRadius: "16px",
                                boxShadow: "0 0 15px rgba(59, 130, 246, 0.4)"
                              }}
                            />
                          </div>

                          {dailyProgress >= tasks.length && (
                            <div style={{ marginTop: "10px", textAlign: "center" }}>
                              <GlassIcon icon="celebration" color="#f59e0b" size="sm" style={{ display: 'inline-block', margin: '0 5px' }} />
                              <GlassIcon icon="sparkles" color="#ec4899" size="sm" style={{ display: 'inline-block', margin: '0 5px' }} />
                            </div>
                          )}

                          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", width: "100%" }}>
                            {[0, 25, 50, 75, 100].map((milestone) => {
                              const reached = (dailyProgress / Math.max(tasks.length, 1)) * 100 >= milestone;
                              return (
                                <div
                                  key={`milestone-${milestone}`}
                                  style={{
                                    width: "8px",
                                    height: "8px",
                                    borderRadius: "50%",
                                    background: reached ? "linear-gradient(135deg, #3b82f6, #8b5cf6)" : "rgba(255, 255, 255, 0.2)",
                                    boxShadow: reached ? "0 0 8px rgba(59, 130, 246, 0.6)" : "none",
                                  }}
                                />
                              );
                            })}
                          </div>
                        </div>

                        {/* Motivational Message (STYLES UPDATED) */}
                        <motion.div
                          key={`motivation-${dailyProgress}`} 
                          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
                          style={{
                            fontSize: "0.85rem", color: theme.textSecondary, textAlign: "center", padding: "12px",
                            background: dailyProgress >= tasks.length 
                              ? "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.15))" 
                              : "rgba(255, 255, 255, 0.05)", // Neutral glass
                            backdropFilter: "blur(5px)",
                            borderRadius: "12px",
                            border: dailyProgress >= tasks.length 
                              ? "1px solid rgba(16, 185, 129, 0.3)" 
                              : "1px solid rgba(255, 255, 255, 0.1)"
                          }}
                        >
                          {(() => {
                            const uniqueTasksCompleted = dailyProgress; 
                            const allTasksCompleted = uniqueTasksCompleted >= tasks.length;

                            if (uniqueTasksCompleted === 0) {
                              return "🚀 Start your day by completing some tasks!";
                            } else if (allTasksCompleted) {
                              return (
                                <motion.span
                                  animate={{ scale: [1, 1.05, 1], color: ["#64748b", "#10b981", "#059669", "#10b981"] }}
                                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                                >
                                  🎉 FANTASTIC! All {tasks.length} unique tasks completed today! You're absolutely crushing it! 🔥
                                </motion.span>
                              );
                            } else {
                              const remainingTasks = tasks.length - uniqueTasksCompleted;
                              return `💪 Great progress! ${uniqueTasksCompleted}/${tasks.length} unique tasks completed. ${remainingTasks} remaining today. Keep it up!`;
                            }
                          })()}
                        </motion.div>
                      </motion.div>

                      {/* Task Grid (STYLES UPDATED) */}
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px", width: "100%" }}>
                        <AnimatePresence>
                          {tasks.map((task, index) => (
                            <motion.div
                              key={task.id}
                              layout
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.4, delay: index * 0.03, ease: "easeOut" }}
                              whileHover={{ scale: 1.02, y: -8, boxShadow: `0 15px 40px ${task.color}20` }}
                              style={{
                                // Use the glassmorphic style from the progress card, but keep task-specific border
                                background: "rgba(255, 255, 255, 0.05)",
                                backdropFilter: "blur(20px) saturate(180%)",
                                WebkitBackdropFilter: "blur(20px) saturate(180%)",
                                border: `1px solid ${task.color}40`, // Use task color for border
                                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                                borderRadius: "25px",
                                padding: "25px", 
                                textAlign: "center",
                                position: "relative", 
                                overflow: "hidden", 
                                cursor: "pointer",
                                color: theme.textPrimary,
                              }}
                              onClick={(event) => {
                                const bounds = event.currentTarget.getBoundingClientRect();
                                const clickPosition = {
                                  x: event.clientX,
                                  y: event.clientY,
                                  centerX: bounds.left + bounds.width / 2,
                                  centerY: bounds.top + bounds.height / 2,
                                };
                                addXP(task.id, task.xp, clickPosition);
                              }}
                            >
                              <GlassIcon icon={task.icon} color={task.color} size="lg" />
                              <div style={{ fontSize: "1.2rem", fontWeight: "700", color: task.color, marginBottom: "12px", marginTop: "10px" }}>{task.name}</div>
                              <div style={{ background: `linear-gradient(135deg, ${task.color}, ${task.color}cc)`, padding: "8px 16px", borderRadius: "20px", fontSize: "0.9rem", fontWeight: "800", color: "#fff", display: "inline-block", marginBottom: "20px" }}>+{task.xp} XP</div>
                              {taskXP[task.id] > 0 && (
                                <motion.div
                                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                                  style={{
                                    position: "absolute", top: "15px", left: "15px", background: `linear-gradient(135deg, ${task.color}, ${task.color}dd)`,
                                    color: "#fff", padding: "6px 12px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "800"
                                  }}
                                >
                                  ✓ {taskXP[task.id]}
                                </motion.div>
                              )}
                              <div style={{ position: "absolute", bottom: "15px", right: "15px", display: "flex", gap: "8px" }}>
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); openEditModal(task); }} style={{ background: "rgba(255, 255, 255, 0.1)", border: "none", borderRadius: "10px", padding: "8px", color: "#fff", cursor: "pointer", backdropFilter: "blur(5px)" }}>✏️</motion.button>
                                <motion.button whileHover={{ scale: 1.1, background: "rgba(239, 68, 68, 0.8)" }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); confirmDeleteTask(task); }} style={{ background: "rgba(239, 68, 68, 0.6)", border: "none", borderRadius: "10px", padding: "8px", color: "#fff", cursor: "pointer", backdropFilter: "blur(5px)" }}>🗑️</motion.button>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
                {/* Other Sections (Unchanged) */}
                {activeSection === 1 && (
                  <motion.div key={1} {...sectionAnimation}>
                      <LevelRoadmap 
                        level={userStats.level} 
                        xp={userStats.xp} 
                        triggerAnimation={roadmapAnimation} 
                    />
                  </motion.div>
                )}
                {activeSection === 2 && (<motion.div key={2} {...sectionAnimation}><AIAssistant /></motion.div>)}
                {activeSection === 3 && (<motion.div key={3} {...sectionAnimation}><Game /></motion.div>)}
                {activeSection === 4 && (
                  <motion.div key={4} {...sectionAnimation}>
                    <Leaderboard user={user} />
                  </motion.div>
                )}
                {activeSection === 5 && (<motion.div key={5} {...sectionAnimation}><CalorieTracker user={user} addXP={addXP} userStats={userStats} setUserStats={setUserStats} /></motion.div>)}
                {activeSection === 6 && (<motion.div key={6} {...sectionAnimation}><UserProfile user={user} setUser={setUser} /></motion.div>)}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* XP Animations (Unchanged) */}
        <AnimatePresence>
          {xpAnimations.map(anim => (
            <motion.div key={anim.id} initial={{ opacity: 1, scale: 0.5, x: anim.x - 30, y: anim.y - 30, color: "#f59e0b" }}
              animate={{ opacity: 0, scale: 1.5, y: anim.y - 120, x: anim.x - 30 + (Math.random() - 0.5) * 60 }}
              transition={{ duration: 2, ease: "easeOut" }}
              style={{ position: "fixed", fontSize: "1.5rem", fontWeight: "900", pointerEvents: "none", zIndex: 1000 }}>
              +{anim.xp} XP
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Toast Notifications (Unchanged) */}
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
              style={{ position: "fixed", bottom: "30px", left: "50%", transform: "translateX(-50%)", padding: "16px 30px", borderRadius: "15px", zIndex: 1001, background: toast.type === 'error' ? "linear-gradient(135deg, #ef4444, #dc2626)" : "linear-gradient(135deg, #10b981, #059669)", color: "#fff", fontWeight: "600" }}>
              <GlassIcon 
                icon={toast.type === 'error' ? 'error' : 'success'} 
                size="sm" 
                color={toast.type === 'error' ? '#ef4444' : '#10b981'} 
                style={{ marginRight: '10px' }} 
              />
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CSS Animations (Unchanged) */}
        <style>{`
          @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-30px) rotate(5deg); } }
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 25px rgba(59, 130, 246, 0.5); }
            50% { box-shadow: 0 0 35px rgba(139, 92, 246, 0.7), 0 0 45px rgba(236, 72, 153, 0.4); }
          }
          @keyframes progress-sparkle {
            0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
            50% { opacity: 1; transform: scale(1) rotate(180deg); }
          }
          .progress-container:hover .progress-fill { animation: pulse-glow 1.8s ease-in-out infinite; }
          .progress-sparkle {
            position: absolute;
            border-radius: 50%;
            animation: progress-sparkle 2s ease-in-out infinite;
            pointer-events: none;
          }
        `}</style>
      </motion.div>

      {/* Modals (Unchanged) */}
      <TaskModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Task" task={newTask} onTaskChange={setNewTask} onSave={addNewTask} isEdit={false} />
      <TaskModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Task" task={editingTask} onTaskChange={setEditingTask} onSave={editTask} isEdit={true} />
      <ConfirmationModal isOpen={showResetModal} onClose={() => setShowResetModal(false)} onConfirm={resetAllTasks} title="Reset Daily Counts?" message="This will reset today's completion counts for all tasks. This action cannot be undone." confirmText="Reset Daily" icon="🔄" />
      <ConfirmationModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={deleteTask} title="Delete Task?" message={`Are you sure you want to delete the task "${taskToDelete?.name}"? This cannot be undone.`} confirmText="Delete Task" icon="🗑️" />
      <ConfirmationModal isOpen={showProgressResetModal} onClose={() => setShowProgressResetModal(false)} onConfirm={resetDailyProgress} title="Reset Daily Progress?" message="This will clear today's task completion counts and start fresh. This action cannot be undone." confirmText="Reset Progress" icon="🔄" />
    </>
  );
}

export default Dashboard;