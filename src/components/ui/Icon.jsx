import React from 'react';
import { 
  FaWater, FaHamburger, FaCoffee, FaRunning, FaCode, FaBook, FaMedal, 
  FaBed, FaPencilAlt, FaWalking, FaHeart, FaGraduationCap, FaMusic, 
  FaBroom, FaList, FaTrophy, FaRobot, FaBullseye, FaCrown, FaFire, 
  FaUser, FaCheck, FaTimes, FaStar, FaTrophy as FaTrophySolid
} from 'react-icons/fa';

const iconMap = {
  // Task Icons
  water: FaWater,
  food: FaHamburger,
  coffee: FaCoffee,
  run: FaRunning,
  code: FaCode,
  book: FaBook,
  meditation: FaMedal,
  moon: FaBed,
  write: FaPencilAlt,
  walk: FaWalking,
  heart: FaHeart,
  learn: FaGraduationCap,
  music: FaMusic,
  clean: FaBroom,
  
  // Navigation Icons
  list: FaList,
  trophy: FaTrophy,
  ai: FaRobot,
  target: FaBullseye,
  leaderboard: FaCrown,
  flame: FaFire,
  user: FaUser,
  
  // Status Icons
  success: FaCheck,
  error: FaTimes,
  star: FaStar,
  celebration: FaTrophySolid
};

const Icon = ({ name, size = 20, color, className = '', ...props }) => {
  const IconComponent = iconMap[name] || FaStar;
  
  return (
    <IconComponent 
      size={size} 
      color={color} 
      className={`inline-block ${className}`}
      {...props}
    />
  );
};

export default Icon;
