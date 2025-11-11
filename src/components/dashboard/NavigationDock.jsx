import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHome, 
  FaListUl, 
  FaFire, 
  FaRobot, 
  FaTrophy, 
  FaUser 
} from 'react-icons/fa';

const navItems = [
  { id: 'home', icon: FaHome, label: 'Home' },
  { id: 'tasks', icon: FaListUl, label: 'Tasks' },
  { id: 'calories', icon: FaFire, label: 'Calories' },
  { id: 'ai', icon: FaRobot, label: 'AI Assistant' },
  { id: 'leaderboard', icon: FaTrophy, label: 'Leaderboard' },
  { id: 'profile', icon: FaUser, label: 'Profile' },
];

const NavigationDock = ({ activeSection, onNavigate }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <motion.div 
        className="flex items-center justify-center gap-2 p-2 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative p-3 rounded-xl transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg -z-10"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </AnimatePresence>
              <div className="relative z-10 flex flex-col items-center">
                <Icon className="w-5 h-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </div>
            </button>
          );
        })}
      </motion.div>
    </div>
  );
};

export default NavigationDock;
