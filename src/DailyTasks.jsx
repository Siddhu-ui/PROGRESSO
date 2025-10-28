import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaFire, FaStar, FaTrophy, FaChartLine, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const LEVELS = [
  { id: 1, name: "Novice", xpRequired: 1000, icon: "🌱", color: "#10b981" },
  { id: 2, name: "Apprentice", xpRequired: 2000, icon: "📚", color: "#3b82f6" },
  { id: 3, name: "Warrior", xpRequired: 3000, icon: "⚔️", color: "#8b5cf6" },
  { id: 4, name: "Champion", xpRequired: 4000, icon: "🛡️", color: "#ec4899" },
  { id: 5, name: "Gladiator", xpRequired: 5000, icon: "🏆", color: "#f59e0b" },
  { id: 6, name: "Conqueror", xpRequired: 6000, icon: "👑", color: "#ef4444" },
  { id: 7, name: "Warlord", xpRequired: 7000, icon: "⚡", color: "#dc2626" },
  { id: 8, name: "Titan", xpRequired: 8000, icon: "💪", color: "#7c3aed" },
  { id: 9, name: "Immortal", xpRequired: 9000, icon: "🔥", color: "#db2777" },
  { id: 10, name: "Celestial", xpRequired: 10000, icon: "✨", color: "#06b6d4" },
  { id: 11, name: "Divine", xpRequired: 11000, icon: "🌟", color: "#fbbf24" },
  { id: 12, name: "Mythic", xpRequired: 12000, icon: "🦄", color: "#a855f7" },
  { id: 13, name: "Ascendant", xpRequired: 13000, icon: "🚀", color: "#f97316" },
  { id: 14, name: "Transcendent", xpRequired: 14000, icon: "💎", color: "#0ea5e9" },
  { id: 15, name: "Omnipotent", xpRequired: 15000, icon: "👁️", color: "#fcd34d" },
];

const DAILY_TASKS = [
  { id: 'water', name: 'Drink Water', xp: 5, icon: '💧', category: 'Health' },
  { id: 'breakfast', name: 'Breakfast', xp: 10, icon: '🍳', category: 'Nutrition' },
  { id: 'lunch', name: 'Lunch', xp: 5, icon: '🍱', category: 'Nutrition' },
  { id: 'snack', name: 'Evening Snack', xp: 3, icon: '🍎', category: 'Nutrition' },
  { id: 'dinner', name: 'Dinner', xp: 8, icon: '🍽️', category: 'Nutrition' },
  { id: 'running', name: 'Running', xp: 15, icon: '🏃', category: 'Fitness' },
  { id: 'workout', name: 'Workout', xp: 20, icon: '💪', category: 'Fitness' },
  { id: 'meditation', name: 'Meditation', xp: 10, icon: '🧘', category: 'Wellness' },
  { id: 'reading', name: 'Reading', xp: 12, icon: '📚', category: 'Learning' },
  { id: 'coding', name: 'Coding Practice', xp: 25, icon: '💻', category: 'Learning' },
];

function DailyTasks({ user }) {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [dailyXP, setDailyXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [totalXP, setTotalXP] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [lastCompletedDate, setLastCompletedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [customTasks, setCustomTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskXP, setNewTaskXP] = useState(10);

  const allTasks = useMemo(() => [...DAILY_TASKS, ...customTasks], [customTasks]);

  const totalPossibleXP = useMemo(() => {
    return allTasks.reduce((sum, task) => sum + task.xp, 0);
  }, [allTasks]);

  const progressPercent = useMemo(() => {
    return totalPossibleXP > 0 ? (dailyXP / totalPossibleXP) * 100 : 0;
  }, [dailyXP, totalPossibleXP]);

  const completionRate = useMemo(() => {
    return allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0;
  }, [completedTasks.length, allTasks]);

  const groupedTasks = useMemo(() => {
    return allTasks.reduce((acc, task) => {
      if (!acc[task.category]) acc[task.category] = [];
      acc[task.category].push(task);
      return acc;
    }, {});
  }, [allTasks]);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        setLoading(false);
        setError('Please sign in to view tasks');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        const today = new Date().toDateString();

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const lastDate = userData.lastCompletedDate?.toDate?.()?.toDateString();
          setCustomTasks(userData.customTasks || []);

          if (lastDate !== today) {
            await updateDoc(userRef, {
              completedTasks: [],
              dailyXP: 0,
              lastCompletedDate: today,
              updatedAt: new Date()
            });

            setCompletedTasks([]);
            setDailyXP(0);
          } else {
            setCompletedTasks(userData.completedTasks || []);
            setDailyXP(userData.dailyXP || 0);
          }

          setTotalXP(userData.totalXP || 0);
          setUserLevel(userData.level || 1);
          setStreak(userData.streak || 0);
          setLastCompletedDate(lastDate || today);
        } else {
          await setDoc(userRef, {
            completedTasks: [],
            dailyXP: 0,
            totalXP: 0,
            level: 1,
            streak: 0,
            lastCompletedDate: today,
            createdAt: new Date(),
            updatedAt: new Date(),
            name: user.displayName || user.email.split('@')[0],
            email: user.email
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setError('Failed to load your data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user, retryCount]);

  const getCurrentLevelInfo = useCallback(() => {
    return LEVELS.find(l => l.id === userLevel) || LEVELS[0];
  }, [userLevel]);

  const getNextLevelInfo = useCallback(() => {
    return LEVELS.find(l => l.id === userLevel + 1) || LEVELS[LEVELS.length - 1];
  }, [userLevel]);

  const calculateLevel = useCallback((xp) => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].xpRequired) {
        return LEVELS[i].id;
      }
    }
    return 1;
  }, []);

  const getProgressPercentage = useCallback(() => {
    const currentLevel = getCurrentLevelInfo();
    const nextLevel = getNextLevelInfo();
    const xpInCurrentLevel = totalXP - (currentLevel.xpRequired - 1000);
    const xpNeededForNextLevel = nextLevel.xpRequired - currentLevel.xpRequired;
    return Math.min((xpInCurrentLevel / xpNeededForNextLevel) * 100, 100);
  }, [totalXP, getCurrentLevelInfo, getNextLevelInfo]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskName.trim() || !user) return;

    const newTask = {
      id: `custom_${Date.now()}`,
      name: newTaskName.trim(),
      xp: Math.min(100, Math.max(1, parseInt(newTaskXP, 10) || 10)),
      icon: '📝',
      category: 'Custom',
    };

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        customTasks: arrayUnion(newTask),
      });

      setCustomTasks(prev => [...prev, newTask]);
      setNewTaskName('');
      setNewTaskXP(10);
    } catch (error) {
      console.error('Error adding task:', error);
      setError('Failed to add task. Please try again.');
    }
  };

  const handleTaskComplete = useCallback(async (task) => {
    if (!user) {
      setError('Please sign in to complete tasks');
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const isCompleted = completedTasks.includes(task.id);
      const today = new Date().toDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (isCompleted) {
        const newDailyXP = Math.max(0, dailyXP - task.xp);
        const newTotalXP = Math.max(0, totalXP - task.xp);
        const newLevel = calculateLevel(newTotalXP);

        await updateDoc(userRef, {
          completedTasks: arrayRemove(task.id),
          dailyXP: newDailyXP,
          totalXP: newTotalXP,
          level: newLevel,
          updatedAt: new Date(),
        });

        setCompletedTasks(prev => prev.filter(id => id !== task.id));
        setDailyXP(newDailyXP);
        setTotalXP(newTotalXP);
        setUserLevel(newLevel);
      } else {
        const newDailyXP = dailyXP + task.xp;
        const newTotalXP = totalXP + task.xp;
        const newLevel = calculateLevel(newTotalXP);
        let newStreak = streak;

        if (lastCompletedDate === yesterdayStr) {
          newStreak = (streak || 0) + 1;
        } else if (lastCompletedDate !== today) {
          newStreak = 1;
        }

        const updateData = {
          completedTasks: arrayUnion(task.id),
          dailyXP: newDailyXP,
          totalXP: newTotalXP,
          level: newLevel,
          lastCompletedDate: today,
          updatedAt: new Date(),
        };

        if (newStreak !== streak) {
          updateData.streak = newStreak;
        }

        await updateDoc(userRef, updateData);

        setCompletedTasks(prev => [...prev, task.id]);
        setDailyXP(newDailyXP);
        setTotalXP(newTotalXP);
        setUserLevel(newLevel);
        setStreak(newStreak);
        setLastCompletedDate(today);

        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 1500);

        if (newLevel > userLevel) {
          setShowLevelUp(true);
          setTimeout(() => setShowLevelUp(false), 2500);
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task. Please try again.');
    }
  }, [user, completedTasks, dailyXP, totalXP, userLevel, lastCompletedDate, streak, calculateLevel]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <FaSpinner className="animate-spin" size={40} color="#8b5cf6" />
        <p style={{ marginTop: '20px', color: '#fff' }}>Loading your tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <FaExclamationTriangle size={50} color="#ef4444" />
        <h2 style={{ color: '#fff', margin: '20px 0' }}>Something went wrong</h2>
        <p style={{ color: '#9ca3af', marginBottom: '30px' }}>{error}</p>
        <button
          onClick={() => setRetryCount(prev => prev + 1)}
          style={styles.retryButton}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          style={{
            background: '#ef4444',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            maxWidth: '800px',
            margin: '0 auto 20px'
          }}
        >
          <FaExclamationTriangle size={20} />
          <span>{error}</span>
        </motion.div>
      )}
      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            style={styles.celebration}
          >
            <FaStar size={40} color="#fbbf24" />
            <p style={styles.celebrationText}>+XP!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.header}
      >
        <h1 style={styles.title}>
          <FaFire color="#f59e0b" /> Daily Tasks
        </h1>
        <p style={styles.subtitle}>Complete tasks to earn XP and level up!</p>
      </motion.div>

      {/* Progress Bar Section */}
      <div style={styles.progressSection}>
        <div style={styles.progressHeader}>
          <span style={styles.progressLabel}>Daily Progress</span>
          <span style={styles.progressValue}>
            {dailyXP}/{totalPossibleXP} XP ({Math.round(progressPercent)}%)
          </span>
        </div>
        <div style={styles.progressBarBg}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8 }}
            style={{
              ...styles.progressBarFill,
              background: `linear-gradient(90deg, ${getCurrentLevelInfo().color}, ${getNextLevelInfo().color})`,
            }}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          style={{ ...styles.statCard, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
        >
          <FaStar size={30} />
          <div>
            <h3 style={styles.statValue}>{dailyXP} XP</h3>
            <p style={styles.statLabel}>Today's XP</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          style={{ ...styles.statCard, background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
        >
          <FaFire size={30} />
          <div>
            <h3 style={styles.statValue}>{streak} Days</h3>
            <p style={styles.statLabel}>Streak</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          style={{ ...styles.statCard, background: 'linear-gradient(135deg, #10b981, #059669)' }}
        >
          <FaTrophy size={30} />
          <div>
            <h3 style={styles.statValue}>{completedTasks.length}/{DAILY_TASKS.length}</h3>
            <p style={styles.statLabel}>Completed</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          style={{ ...styles.statCard, background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}
        >
          <FaChartLine size={30} />
          <div>
            <h3 style={styles.statValue}>{completionRate.toFixed(0)}%</h3>
            <p style={styles.statLabel}>Progress</p>
          </div>
        </motion.div>
      </div>

      {/* Level Progress Section */}
      <div style={styles.levelProgressSection}>
        <div style={styles.levelHeader}>
          <div style={styles.levelInfo}>
            <div style={{
              ...styles.levelBadge,
              background: `linear-gradient(135deg, ${getCurrentLevelInfo().color}, ${getNextLevelInfo().color})`,
            }}>
              {getCurrentLevelInfo().icon} Level {userLevel}
            </div>
            <h2 style={styles.levelName}>{getCurrentLevelInfo().name}</h2>
          </div>
          <div style={styles.xpInfo}>
            <span style={styles.totalXP}>{totalXP.toLocaleString()} Total XP</span>
          </div>
        </div>

        <div style={styles.levelProgressBar}>
          <div style={styles.levelProgressBg}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${getProgressPercentage()}%` }}
              transition={{ duration: 0.8 }}
              style={{
                ...styles.levelProgressFill,
                background: `linear-gradient(90deg, ${getCurrentLevelInfo().color}, ${getNextLevelInfo().color})`,
              }}
            />
          </div>
          <div style={styles.levelProgressText}>
            <span>{getProgressPercentage().toFixed(1)}% to {getNextLevelInfo().name}</span>
          </div>
        </div>
      </div>

      {/* Add Task Form */}
      <form onSubmit={handleAddTask} style={styles.addTaskForm}>
        <input
          type="text"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          placeholder="Add a new daily task..."
          style={styles.taskInput}
          required
        />
        <input
          type="number"
          value={newTaskXP}
          onChange={(e) => setNewTaskXP(e.target.value)}
          min="1"
          max="100"
          style={styles.xpInput}
          title="XP (1-100)"
        />
        <button type="submit" style={styles.addButton}>Add</button>
      </form>

      {/* Level Up Animation */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            style={styles.levelUpCelebration}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <FaTrophy size={60} color="#fbbf24" />
            </motion.div>
            <h2 style={styles.levelUpText}>🎉 LEVEL UP!</h2>
            <p style={styles.levelUpSubtext}>Welcome to {getCurrentLevelInfo().name}!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Categories */}
      <div style={styles.tasksContainer}>
        {Object.entries(groupedTasks).map(([category, tasks]) => (
          <div key={category} style={styles.categorySection}>
            <h2 style={styles.categoryTitle}>{category}</h2>
            <div style={styles.taskGrid}>
              {tasks.map((task) => {
                const isCompleted = completedTasks.includes(task.id);
                return (
                  <motion.div
                    key={task.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTaskComplete(task)}
                    style={{
                      ...styles.taskCard,
                      ...(isCompleted && styles.taskCardCompleted),
                    }}
                  >
                    <div style={styles.taskIcon}>{task.icon}</div>
                    <div style={styles.taskInfo}>
                      <h3 style={styles.taskName}>{task.name}</h3>
                      <p style={styles.taskXP}>+{task.xp} XP</p>
                    </div>
                    <div style={{
                      ...styles.checkbox,
                      ...(isCompleted && styles.checkboxCompleted),
                    }}>
                      {isCompleted && <FaCheck size={16} />}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Motivational Message */}
      {completedTasks.length === DAILY_TASKS.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.completionMessage}
        >
          <FaTrophy size={50} color="#fbbf24" />
          <h2>🎉 All Tasks Completed!</h2>
          <p>You've earned {dailyXP} XP today. Keep up the amazing work!</p>
        </motion.div>
      )}
    </div>
  );
}

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    padding: '20px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
  },
  retryButton: {
    background: '#8b5cf6',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem',
    transition: 'all 0.2s',
    '&:hover': {
      background: '#7c3aed',
      transform: 'translateY(-2px)'
    }
  },
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
    padding: '40px 20px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    color: '#fff',
  },
  celebration: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(0,0,0,0.8)',
    padding: '30px 50px',
    borderRadius: '20px',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    boxShadow: '0 20px 60px rgba(251, 191, 36, 0.5)',
  },
  celebrationText: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#fbbf24',
    margin: 0,
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '3rem',
    fontWeight: '900',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#9ca3af',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    maxWidth: '1200px',
    margin: '0 auto 40px',
  },
  statCard: {
    padding: '25px',
    borderRadius: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
    cursor: 'pointer',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    margin: 0,
  },
  statLabel: {
    fontSize: '0.9rem',
    opacity: 0.9,
    margin: 0,
  },
  progressSection: {
    maxWidth: '1200px',
    margin: '0 auto 20px',
    background: 'rgba(255,255,255,0.05)',
    padding: '20px',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  progressLabel: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#e2e8f0',
  },
  progressValue: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#a78bfa',
  },
  progressBarBg: {
    width: '100%',
    height: '12px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '6px',
    transition: 'width 0.3s ease-out',
    boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '15px',
  },
  progressLabel: {
    fontSize: '1.1rem',
    fontWeight: '600',
  },
  progressValue: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#8b5cf6',
  },
  progressBarBg: {
    width: '100%',
    height: '25px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '15px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #8b5cf6, #6366f1, #10b981)',
    borderRadius: '15px',
  },
  levelProgressSection: {
    maxWidth: '1200px',
    margin: '0 auto 40px',
    background: 'rgba(255,255,255,0.08)',
    padding: '30px',
    borderRadius: '20px',
    backdropFilter: 'blur(15px)',
    border: '2px solid rgba(139, 92, 246, 0.3)',
    boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2)',
  },
  levelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '20px',
  },
  levelInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  levelBadge: {
    padding: '12px 24px',
    borderRadius: '25px',
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
  },
  levelName: {
    fontSize: '1.8rem',
    fontWeight: '700',
    margin: 0,
    color: '#fff',
  },
  xpInfo: {
    textAlign: 'right',
  },
  totalXP: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#8b5cf6',
  },
  levelProgressBar: {
    position: 'relative',
  },
  levelProgressBg: {
    width: '100%',
    height: '30px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '20px',
    overflow: 'hidden',
    border: '2px solid rgba(139, 92, 246, 0.2)',
  },
  levelProgressFill: {
    height: '100%',
    borderRadius: '20px',
    transition: 'width 0.8s ease',
  },
  levelProgressText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '1rem',
    fontWeight: '700',
    color: '#fff',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
  },
  levelUpCelebration: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    padding: '40px 60px',
    borderRadius: '25px',
    zIndex: 1000,
    textAlign: 'center',
    boxShadow: '0 25px 80px rgba(139, 92, 246, 0.6)',
    border: '3px solid #fbbf24',
  },
  levelUpText: {
    fontSize: '2.5rem',
    fontWeight: '900',
    margin: '15px 0 10px 0',
    color: '#fff',
  },
  levelUpSubtext: {
    fontSize: '1.2rem',
    color: '#e5e7eb',
    margin: 0,
  },
  tasksContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  categorySection: {
    marginBottom: '40px',
  },
  categoryTitle: {
    fontSize: '1.8rem',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#fff',
  },
  taskGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '15px',
  },
  taskCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      background: 'rgba(255, 255, 255, 0.05)',
      borderColor: 'rgba(255, 255, 255, 0.15)'
    },
    '&:active': {
      transform: 'translateY(0)'
    }
  },
  taskCardCompleted: {
    opacity: 0.6,
    '&:after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '15px',
      right: '15px',
      height: '2px',
      background: 'rgba(255, 255, 255, 0.5)',
      transform: 'scaleX(0.9)'
    },
    '&:hover': {
      opacity: 0.8,
      transform: 'none',
      boxShadow: 'none',
      background: 'rgba(255, 255, 255, 0.03)'
    }
  },
  taskIcon: {
    fontSize: '2.5rem',
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    margin: '0 0 5px 0',
  },
  taskXP: {
    fontSize: '0.9rem',
    color: '#8b5cf6',
    fontWeight: '700',
    margin: 0,
  },
  checkbox: {
    width: '24px',
    height: '24px',
    borderRadius: '8px',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
    flexShrink: 0,
    transition: 'all 0.2s ease',
    background: 'rgba(0, 0, 0, 0.2)',
    '&:hover': {
      borderColor: 'rgba(255, 255, 255, 0.4)',
      transform: 'scale(1.05)'
    }
  },
  checkboxCompleted: {
    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    borderColor: 'transparent',
    boxShadow: '0 2px 8px rgba(139, 92, 246, 0.4)',
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.6)'
    }
  },
  addTaskForm: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    maxWidth: '800px',
    margin: '0 auto 30px',
  },
  taskInput: {
    flex: 1,
    padding: '12px 15px',
    borderRadius: '8px',
    border: '1px solid #4b5563',
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'white',
    fontSize: '1rem',
  },
  xpInput: {
    width: '80px',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #4b5563',
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'white',
    textAlign: 'center',
  },
  addButton: {
    padding: '12px 20px',
    background: '#8b5cf6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  completionMessage: {
    maxWidth: '600px',
    margin: '40px auto',
    padding: '40px',
    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    borderRadius: '20px',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(139, 92, 246, 0.5)',
  },
};

export default DailyTasks;
