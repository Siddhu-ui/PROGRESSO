import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format XP with K/M/B suffixes
export function formatXP(xp) {
  if (xp >= 1000000000) {
    return (xp / 1000000000).toFixed(1) + 'B';
  }
  if (xp >= 1000000) {
    return (xp / 1000000).toFixed(1) + 'M';
  }
  if (xp >= 1000) {
    return (xp / 1000).toFixed(1) + 'K';
  }
  return xp.toString();
}

// Calculate level from XP
export function calculateLevel(xp) {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

// Calculate XP needed for next level
export function xpForNextLevel(level) {
  return Math.pow(level, 2) * 100;
}

// Calculate progress to next level
export function progressToNextLevel(xp, level) {
  const currentLevelXP = Math.pow(level - 1, 2) * 100;
  const nextLevelXP = Math.pow(level, 2) * 100;
  const xpInCurrentLevel = xp - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  
  return {
    progress: (xpInCurrentLevel / xpNeeded) * 100,
    xpNeeded,
    xpInCurrentLevel
  };
}

// Generate a gradient from a string (for avatars, etc.)
export function stringToGradient(str) {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const h = Math.abs(hash % 360);
  return `linear-gradient(135deg, hsl(${h}, 70%, 60%), hsl(${(h + 30) % 360}, 70%, 60%))`;
}
