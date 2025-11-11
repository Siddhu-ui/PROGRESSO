import React, { useState, useEffect, useMemo, useCallback, createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaFire, FaStar, FaTrophy, FaChartLine, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { Plus, Edit, Trash2, RotateCw, X, Award, Check } from 'lucide-react';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc } from 'firebase/firestore';
// Make sure this path is correct for your project
import { db } from './firebase'; 

// --- Constants (Copied from original) ---
const LEVELS = [
  { id: 1, name: "Sprout", xpRequired: 0, icon: "🌱", color: "#10b981" },
  { id: 2, name: "Seedling", xpRequired: 250, icon: "🌿", color: "#3b82f6" },
  { id: 3, name: "Bloom", xpRequired: 500, icon: "🌸", color: "#8b5cf6" },
  { id: 4, name: "Growth", xpRequired: 750, icon: "🌳", color: "#ec4899" },
  { id: 5, name: "Flourish", xpRequired: 1000, icon: "🌺", color: "#f59e0b" },
  { id: 6, name: "Thrive", xpRequired: 1250, icon: "🌴", color: "#ef4444" },
  { id: 7, name: "Excel", xpRequired: 1500, icon: "⭐", color: "#dc2626" },
  { id: 8, name: "Master", xpRequired: 1750, icon: "👑", color: "#7c3aed" },
  { id: 9, name: "Sage", xpRequired: 2000, icon: "🧙", color: "#db2777" },
  { id: 10, name: "Legend", xpRequired: 2250, icon: "🏆", color: "#06b6d4" },
  { id: 11, name: "Champion", xpRequired: 2500, icon: "⚡", color: "#fbbf24" },
  { id: 12, name: "Hero", xpRequired: 2750, icon: "🦸", color: "#a855f7" },
  { id: 13, name: "Titan", xpRequired: 3000, icon: "💪", color: "#f97316" },
  { id: 14, name: "Oracle", xpRequired: 3250, icon: "🔮", color: "#0ea5e9" },
  { id: 15, name: "Divine", xpRequired: 3500, icon: "✨", color: "#fcd34d" },
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

// --- Mock Theme Context (as requested) ---
// Replace this with your actual ThemeContext import
const ThemeContext = createContext({ theme: 'dark' });
const useTheme = () => useContext(ThemeContext);
// ------------------------------------------

// --- Helper Components ---

/**
 * Animated background blobs
 */
const BackgroundBlobs = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute -top-40 -left-60 h-[30rem] w-[50rem] animate-blob rounded-full bg-purple-400 opacity-20 blur-3xl filter dark:opacity-10" />
    <div className="animation-delay-2000 absolute -bottom-40 -right-40 h-[30rem] w-[50rem] animate-blob rounded-full bg-cyan-400 opacity-20 blur-3xl filter dark:opacity-10" />
    <div className="animation-delay-4000 absolute -bottom-20 -left-20 h-[20rem] w-[30rem] animate-blob rounded-full bg-pink-400 opacity-20 blur-3xl filter dark:opacity-10" />
  </div>
);

/**
 * Apple Fitness-style progress ring
 */
const ProgressRing = ({ progress, levelColor }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative h-40 w-40">
      <svg className="h-full w-full" viewBox="0 0 120 120">
        <circle
          className="stroke-gray-200 dark:stroke-gray-700"
          strokeWidth="12"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
        <motion.circle
          strokeWidth="12"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          transform="rotate(-90 60 60)"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          style={{ stroke: levelColor, strokeLinecap: 'round' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-bold text-gray-900 dark:text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {Math.round(progress)}%
        </motion.span>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Done
        </span>
      </div>
    </div>
  );
};

ProgressRing.propTypes = {
  progress: PropTypes.number.isRequired,
  levelColor: PropTypes.string.isRequired,
};

/**
 * Glassmorphic Task Card
 */
const TaskCard = ({ task, isCompleted, onComplete, onEdit, onDelete }) => {
  const { theme } = useTheme();
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`relative flex items-center gap-4 overflow-hidden rounded-2xl border p-4 shadow-md transition-all duration-300
        ${isCompleted 
          ? 'bg-white/20 dark:bg-gray-800/20' 
          : 'bg-white/40 dark:bg-gray-800/40 cursor-pointer hover:bg-white/60 dark:hover:bg-gray-700/60'}
        ${theme === 'dark' ? 'border-white/10' : 'border-black/5'}
        backdrop-blur-lg
      `}
      onClick={() => !isCompleted && onComplete(task)}
    >
      {/* Completion Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation(); // Prevent card click
          onComplete(task);
        }}
        className={`relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300
          ${isCompleted 
            ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white' 
            : 'border-2 border-gray-400/50 text-transparent dark:border-gray-500/50'}
        `}
      >
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            >
              <Check size={18} strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
      
      {/* Task Info */}
      <div className={`flex-grow ${isCompleted ? 'opacity-50' : ''}`}>
        <h3 className="font-semibold text-gray-900 dark:text-white">{task.name}</h3>
        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">+{task.xp} XP</p>
      </div>

      {/* Edit/Delete Buttons (only for custom tasks) */}
      {task.id.startsWith('custom_') && !isCompleted && (
        <div className="flex flex-shrink-0 gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-black/10 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Edit task"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(task); }}
            className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-500 dark:text-gray-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            aria-label="Delete task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {/* Strikethrough line */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            className="absolute left-4 right-4 h-0.5 bg-gray-600 dark:bg-gray-400"
            style={{ top: '50%', transform: 'translateY(-50%)' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

TaskCard.propTypes = {
  task: PropTypes.object.isRequired,
  isCompleted: PropTypes.bool.isRequired,
  onComplete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

/**
 * Modal for Adding/Editing Tasks
 */
const TaskModal = ({ isOpen, onClose, onSave, taskToEdit }) => {
  const [name, setName] = useState('');
  const [xp, setXp] = useState(10);
  const { theme } = useTheme();
  
  useEffect(() => {
    if (taskToEdit) {
      setName(taskToEdit.name);
      setXp(taskToEdit.xp);
    } else {
      setName('');
      setXp(10);
    }
  }, [taskToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const taskData = {
      name: name.trim(),
      xp: Math.min(100, Math.max(1, parseInt(xp, 10) || 10)),
    };
    
    onSave(taskData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`relative w-full max-w-md rounded-3xl border shadow-2xl
              ${theme === 'dark' ? 'border-white/10' : 'border-black/5'}
              bg-white/60 dark:bg-gray-800/60 backdrop-blur-2xl
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {taskToEdit ? 'Edit Task' : 'Add New Task'}
                </h2>
                <button
                  onClick={onClose}
                  className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-black/10 dark:text-gray-400 dark:hover:bg-white/10"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="taskName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Task Name</label>
                  <input
                    id="taskName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Go for a 30-min walk"
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300/50 bg-white/50 px-3 py-2 text-gray-900 shadow-sm backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600/50 dark:bg-gray-700/50 dark:text-white dark:placeholder-gray-400"
                  />
                </div>
                <div>
                  <label htmlFor="taskXP" className="block text-sm font-medium text-gray-700 dark:text-gray-300">XP Value (1-100)</label>
                  <input
                    id="taskXP"
                    type="number"
                    value={xp}
                    onChange={(e) => setXp(e.target.value)}
                    min="1"
                    max="100"
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300/50 bg-white/50 px-3 py-2 text-gray-900 shadow-sm backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600/50 dark:bg-gray-700/50 dark:text-white"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
                  >
                    {taskToEdit ? 'Save Changes' : 'Add Task'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

TaskModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  taskToEdit: PropTypes.object,
};

/**
 * Level Up Celebration Modal
 */
const LevelUpModal = ({ isOpen, onClose, levelInfo }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 to-blue-600 p-8 text-center text-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-10 -left-10 text-white/10"
          >
            <Award size={150} />
          </motion.div>
          <motion.div
            className="mb-4 text-yellow-300"
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [-15, 15, -10, 10, 0] }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
          >
            <FaTrophy size={60} />
          </motion.div>
          <h2 className="text-3xl font-bold">LEVEL UP!</h2>
          <p className="mt-2 text-lg text-white/90">
            You've reached {levelInfo.icon} Level {levelInfo.id}!
          </p>
          <h3 className="mt-1 text-2xl font-semibold text-yellow-300">{levelInfo.name}</h3>
          <button
            onClick={onClose}
            className="mt-6 rounded-full bg-white/20 px-6 py-2 font-semibold backdrop-blur-sm transition-all hover:bg-white/30"
          >
            Continue
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

LevelUpModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  levelInfo: PropTypes.object.isRequired,
};

/**
 * Floating +XP Animation
 */
const XPCelebration = ({ xpData }) => (
  <AnimatePresence>
    {xpData && (
      <motion.div
        key={xpData.key}
        initial={{ opacity: 0, y: 0, scale: 0.5 }}
        animate={{ opacity: 1, y: -80, scale: 1 }}
        exit={{ opacity: 0, y: -120, scale: 0.8 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="pointer-events-none fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="flex items-center gap-2 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 px-4 py-2 text-lg font-bold text-black shadow-lg">
          <FaStar />
          <span>+{xpData.xp} XP!</span>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

XPCelebration.propTypes = {
  xpData: PropTypes.shape({
    key: PropTypes.number,
    xp: PropTypes.number,
  }),
};


// --- Main DailyTasks Component ---

function DailyTasks({ user, onTaskComplete }) {
  // --- Original State ---
  const [completedTasks, setCompletedTasks] = useState([]);
  const [dailyXP, setDailyXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [totalXP, setTotalXP] = useState(0);
  // Replaced showCelebration with xpCelebrationData
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [lastCompletedDate, setLastCompletedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [customTasks, setCustomTasks] = useState([]);
  // new* states are now managed by the modal
  
  // --- New State for UI ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [xpCelebrationData, setXpCelebrationData] = useState(null); // { key: Date.now(), xp: 10 }
  
  const { theme } = useTheme();

  // --- Original useMemo Hooks (Unchanged) ---
  const allTasks = useMemo(() => [...DAILY_TASKS, ...customTasks], [customTasks]);

  const totalPossibleXP = useMemo(() => {
    return allTasks.reduce((sum, task) => sum + task.xp, 0);
  }, [allTasks]);

  const progressPercent = useMemo(() => {
    return totalPossibleXP > 0 ? (dailyXP / totalPossibleXP) * 100 : 0;
  }, [dailyXP, totalPossibleXP]);

  const groupedTasks = useMemo(() => {
    return allTasks.reduce((acc, task) => {
      const category = task.category || 'Custom'; // Ensure custom tasks have a category
      if (!acc[category]) acc[category] = [];
      acc[category].push(task);
      return acc;
    }, {});
  }, [allTasks]);

  // --- Original useEffect[user] (Data Loading Logic - Unchanged) ---
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
          const lastDate = userData.lastCompletedDate; // Keep as string
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
          // Create new user doc
          await setDoc(userRef, {
            completedTasks: [],
            dailyXP: 0,
            totalXP: 0,
            level: 1,
            streak: 0,
            lastCompletedDate: today,
            customTasks: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            name: user.displayName || user.email.split('@')[0],
            email: user.email
          });
          // Set initial state for new user
          setCompletedTasks([]);
          setDailyXP(0);
          setTotalXP(0);
          setUserLevel(1);
          setStreak(0);
          setLastCompletedDate(today);
          setCustomTasks([]);
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

  // --- Original useCallback Hooks (Leveling Logic) ---
  
  const getCurrentLevelInfo = useCallback(() => {
    return LEVELS.find(l => l.id === userLevel) || LEVELS[0];
  }, [userLevel]);

  const getNextLevelInfo = useCallback(() => {
    return LEVELS.find(l => l.id === userLevel + 1) || LEVELS[LEVELS.length - 1];
  }, [userLevel]);

  // *** IMPROVED/FIXED calculateLevel function ***
  const calculateLevel = useCallback((xp) => {
    let newLevel = 1;
    for (let i = 0; i < LEVELS.length; i++) {
      if (xp >= LEVELS[i].xpRequired) {
        newLevel = LEVELS[i].id;
      } else {
        // Stop as soon as we find a level they don't qualify for
        break;
      }
    }
    return newLevel;
  }, []); // Removed LEVELS from dependency array as it's a constant

  const getProgressPercentage = useCallback(() => {
    if (userLevel === LEVELS.length) return 100; // Max level
    
    const currentLevelInfo = getCurrentLevelInfo();
    const nextLevelInfo = getNextLevelInfo();
    
    if (!nextLevelInfo || currentLevelInfo.id === nextLevelInfo.id) return 100;

    const xpInCurrentLevel = totalXP - currentLevelInfo.xpRequired;
    const xpNeededForNextLevel = nextLevelInfo.xpRequired - currentLevelInfo.xpRequired;
    
    if (xpNeededForNextLevel <= 0) return 100; // Avoid division by zero
    
    return Math.min(Math.max((xpInCurrentLevel / xpNeededForNextLevel) * 100, 0), 100);
  }, [totalXP, userLevel, getCurrentLevelInfo, getNextLevelInfo]);


  // --- New/Refactored CRUD Handlers ---

  const handleOpenModal = (task = null) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTaskToEdit(null);
  };

  const handleSaveTask = async (taskData) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    
    try {
      if (taskToEdit) {
        // --- Edit Logic ---
        // 1. Create the updated task
        const updatedTask = { ...taskToEdit, ...taskData };
        // 2. Remove the old task from Firebase
        await updateDoc(userRef, {
          customTasks: arrayRemove(taskToEdit)
        });
        // 3. Add the new task to Firebase
        await updateDoc(userRef, {
          customTasks: arrayUnion(updatedTask)
        });
        // 4. Update local state
        setCustomTasks(prev => prev.map(t => t.id === taskToEdit.id ? updatedTask : t));

      } else {
        // --- Add New Logic ---
        const newTask = {
          ...taskData,
          id: `custom_${Date.now()}`,
          icon: '📝', // Default icon
          category: 'Custom',
        };
        await updateDoc(userRef, {
          customTasks: arrayUnion(newTask),
        });
        setCustomTasks(prev => [...prev, newTask]);
      }
      handleCloseModal();
    } catch (err) {
      console.error("Error saving task:", err);
      setError("Failed to save task. Please try again.");
    }
  };

  const handleDeleteTask = async (taskToDelete) => {
    if (!user || !window.confirm(`Are you sure you want to delete "${taskToDelete.name}"?`)) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        customTasks: arrayRemove(taskToDelete)
      });
      setCustomTasks(prev => prev.filter(t => t.id !== taskToDelete.id));
      
      // If deleted task was completed, we should also remove it from completedTasks
      if (completedTasks.includes(taskToDelete.id)) {
        // We can optionally trigger the un-complete logic, but simpler to just remove
        await updateDoc(userRef, {
          completedTasks: arrayRemove(taskToDelete.id)
        });
        setCompletedTasks(prev => prev.filter(id => id !== taskToDelete.id));
        // Note: This simple removal doesn't refund XP. For that, we'd call
        // handleTaskComplete(taskToDelete) *if* it was completed.
        // For simplicity, we'll just remove it.
      }

    } catch (err) {
      console.error("Error deleting task:", err);
      setError("Failed to delete task. Please try again.");
    }
  };
  
  const handleResetTasks = async () => {
    if (!user || !window.confirm("Are you sure you want to reset all daily tasks? This will reset today's XP to 0.")) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      // We also need to subtract the dailyXP from totalXP
      const newTotalXP = Math.max(0, totalXP - dailyXP);
      const newLevel = calculateLevel(newTotalXP);

      await updateDoc(userRef, {
        completedTasks: [],
        dailyXP: 0,
        totalXP: newTotalXP,
        level: newLevel,
        updatedAt: new Date(),
      });
      
      setCompletedTasks([]);
      setDailyXP(0);
      setTotalXP(newTotalXP);
      setUserLevel(newLevel);

    } catch (err) {
      console.error("Error resetting tasks:", err);
      setError("Failed to reset tasks. Please try again.");
    }
  };

  // --- Original handleTaskComplete (with minor change for XP animation) ---
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
        // --- UN-complete Logic ---
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
        // --- COMPLETE Logic ---
        const newDailyXP = dailyXP + task.xp;
        const newTotalXP = totalXP + task.xp;
        const newLevel = calculateLevel(newTotalXP);
        const oldLevel = userLevel; // Capture old level
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

        // *** NEW Animation Trigger ***
        setXpCelebrationData({ key: Date.now(), xp: task.xp });
        setTimeout(() => setXpCelebrationData(null), 1500);

        if (onTaskComplete) {
          onTaskComplete(task.id, task.xp);
        }

        if (newLevel > oldLevel) {
          setShowLevelUp(true);
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task. Please try again.');
    }
  }, [user, completedTasks, dailyXP, totalXP, userLevel, lastCompletedDate, streak, calculateLevel, onTaskComplete]);

  
  // --- Render Logic ---

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
        <FaSpinner className="animate-spin text-5xl text-purple-500" />
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Loading your tasks...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 text-center dark:bg-gray-900">
        <FaExclamationTriangle className="text-6xl text-red-500" />
        <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Something went wrong</h2>
        <p className="mt-2 max-w-md text-lg text-gray-600 dark:text-gray-400">{error}</p>
        <button
          onClick={() => setRetryCount(prev => prev + 1)}
          className="mt-8 rounded-lg bg-purple-600 px-6 py-3 text-lg font-semibold text-white shadow-lg transition-all hover:bg-purple-700 hover:shadow-xl"
        >
          Try Again
        </button>
      </div>
    );
  }

  const currentLevelInfo = getCurrentLevelInfo();
  const nextLevelInfo = getNextLevelInfo();
  const levelProgressPercent = getProgressPercentage();
  const levelColor = currentLevelInfo.color || '#8b5cf6';
  
  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      <BackgroundBlobs />
      
      {/* --- Main Content --- */}
      <main className="relative z-10 mx-auto max-w-6xl p-4 py-8 md:p-8">
        
        {/* --- Header & Action Buttons --- */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Daily Growth</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Today's tasks to help you flourish.
            </p>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleResetTasks}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold
                ${theme === 'dark' ? 'border-white/10' : 'border-black/5'}
                bg-white/40 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300
                hover:bg-white/60 dark:hover:bg-gray-700/60 backdrop-blur-lg
              `}
            >
              <RotateCw size={16} />
              Reset
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleOpenModal(null)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              <Plus size={16} />
              Add Task
            </motion.button>
          </div>
        </motion.header>

        {/* --- Progress Overview Card --- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`relative mb-8 overflow-hidden rounded-3xl border p-6 shadow-lg
            ${theme === 'dark' ? 'border-white/10' : 'border-black/5'}
            bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl
          `}
        >
          <div className="flex flex-col items-center gap-6 md:flex-row">
            {/* Daily Progress Ring */}
            <ProgressRing progress={progressPercent} levelColor={levelColor} />
            
            {/* Stats */}
            <div className="flex-grow">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Today's Progress</h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                You've completed {completedTasks.length} of {allTasks.length} tasks.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-black/5 p-4 dark:bg-white/5">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    <FaStar className="text-yellow-500" />
                    Today's XP
                  </div>
                  <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{dailyXP}</div>
                </div>
                <div className="rounded-lg bg-black/5 p-4 dark:bg-white/5">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    <FaFire className="text-orange-500" />
                    Streak
                  </div>
                  <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{streak} Days</div>
                </div>
              </div>
            </div>
            
            {/* Level Progress */}
            <div className="w-full md:w-auto">
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">{currentLevelInfo.icon}</span>
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Level {currentLevelInfo.id}</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{currentLevelInfo.name}</div>
                </div>
              </div>
              <div className="mt-3 w-full max-w-xs">
                <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
                  <span>{totalXP.toLocaleString()} XP</span>
                  <span>To {nextLevelInfo.name}</span>
                </div>
                <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: levelColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${levelProgressPercent}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* --- Task Categories --- */}
        <AnimatePresence>
          {Object.entries(groupedTasks).map(([category, tasks], index) => (
            <motion.section 
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
              className="mb-8"
            >
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">{category}</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {tasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isCompleted={completedTasks.includes(task.id)}
                      onComplete={handleTaskComplete}
                      onEdit={handleOpenModal}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.section>
          ))}
        </AnimatePresence>

      </main>

      {/* --- Modals & Animations --- */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />
      
      <LevelUpModal
        isOpen={showLevelUp}
        onClose={() => setShowLevelUp(false)}
        levelInfo={currentLevelInfo}
      />

      <XPCelebration xpData={xpCelebrationData} />

      {/* Persistent Error Toast */}
      <AnimatePresence>
        {error && user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-lg bg-red-600 px-6 py-3 text-white shadow-lg"
          >
            <div className="flex items-center gap-3">
              <FaExclamationTriangle />
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-2 font-bold opacity-80 hover:opacity-100">X</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

DailyTasks.propTypes = {
  user: PropTypes.object,
  onTaskComplete: PropTypes.func,
};

export default DailyTasks;