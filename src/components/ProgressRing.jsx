import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const ProgressRing = ({ progress, size = 120, strokeWidth = 10, color = '#3b82f6' }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  useEffect(() => {
    const animation = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(animation);
  }, [progress]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: [0.65, 0, 0.35, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span 
          className="text-3xl font-bold"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {Math.round(progress)}%
        </motion.span>
        <motion.span 
          className="text-xs opacity-60 mt-1"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Complete
        </motion.span>
      </div>
    </div>
  );
};

export default ProgressRing;
