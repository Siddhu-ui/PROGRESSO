import React from 'react';
import * as Progress from '@radix-ui/react-progress';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

const XPRing = ({ level = 1, currentXP = 0, xpGainedToday = 0, className }) => {
  const xpForNextLevel = level * 100;
  const progress = Math.min((currentXP / xpForNextLevel) * 100, 100);
  
  // Animation values
  const progressValue = useMotionValue(0);
  
  // Animate progress on mount
  React.useEffect(() => {
    const animation = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      progressValue.set(progress);
    };
    
    animation();
  }, [progress, progressValue]);
  
  const circumference = 2 * Math.PI * 90; // For a 90px radius
  const strokeDashoffset = useTransform(
    progressValue,
    [0, 100],
    [circumference, 0]
  );

  return (
    <div className={cn("relative w-48 h-48 flex items-center justify-center", className)}>
      {/* Background circle */}
      <svg className="absolute w-full h-full" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="12"
        />
      </svg>
      
      {/* Progress circle */}
      <motion.svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 200 200">
        <motion.circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="url(#xpGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset }}
          initial={{ strokeDashoffset: circumference }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        <defs>
          <linearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </motion.svg>
      
      {/* Center content */}
      <div className="flex flex-col items-center justify-center z-10 text-center">
        <span className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Lvl {level}
        </span>
        <span className="text-sm text-gray-300 mt-1">
          {currentXP} / {xpForNextLevel} XP
        </span>
        {xpGainedToday > 0 && (
          <span className="text-xs text-green-400 mt-1">
            +{xpGainedToday} XP today
          </span>
        )}
      </div>
    </div>
  );
};

export default XPRing;
