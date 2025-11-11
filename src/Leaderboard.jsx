import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTrophy, FaSearch, FaMedal, FaCrown, FaStar,
  FaFire, FaChartLine, FaCalendarAlt, FaExclamationTriangle, FaRedo, FaSpinner
} from "react-icons/fa";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

// XP Requirements for each level (cumulative) - Updated to match LevelRoadmap progression
const LEVEL_XP_REQUIREMENTS = {
  1: 0,      // Level 1: 0-249 XP (Sprout)
  2: 250,    // Level 2: 250-499 XP (Seedling)
  3: 500,    // Level 3: 500-749 XP (Bloom)
  4: 750,    // Level 4: 750-999 XP (Growth)
  5: 1000,   // Level 5: 1000-1249 XP (Flourish)
  6: 1250,   // Level 6: 1250-1499 XP (Thrive)
  7: 1500,   // Level 7: 1500-1749 XP (Excel)
  8: 1750,   // Level 8: 1750-1999 XP (Master)
  9: 2000,   // Level 9: 2000-2249 XP (Sage)
  10: 2250,  // Level 10: 2250-2499 XP (Legend)
  11: 2500,  // Level 11: 2500-2749 XP (Champion)
  12: 2750,  // Level 12: 2750-2999 XP (Hero)
  13: 3000,  // Level 13: 3000-3249 XP (Titan)
  14: 3250,  // Level 14: 3250-3499 XP (Oracle)
  15: 3500,  // Level 15: 3500+ XP (Divine)
};

// Function to get XP required for next level
const getXPForLevel = (level) => {
  return LEVEL_XP_REQUIREMENTS[level] || 0;
};

// Function to calculate current level based on XP
const getLevelFromXP = (xp) => {
  let level = 1;
  for (let i = 2; i <= 15; i++) {
    if (xp >= LEVEL_XP_REQUIREMENTS[i]) {
      level = i;
    } else {
      break;
    }
  }
  return level;
};

// Function to calculate progress percentage towards next level
const getProgressPercentage = (currentXP, currentLevel) => {
  const currentLevelXP = getXPForLevel(currentLevel);
  const nextLevelXP = getXPForLevel(currentLevel + 1);

  if (nextLevelXP === 0 || currentLevel >= 15) return 100; // Max level (15) reached

  const xpForNextLevel = nextLevelXP - currentLevelXP;
  const currentLevelProgress = currentXP - currentLevelXP;

  return Math.min((currentLevelProgress / xpForNextLevel) * 100, 100);
};

// XP Badge Thresholds with updated progression
const XP_BADGES = [
  { name: "Seedling", min: 0, max: 249, color: "#22c55e", icon: "🌱" },
  { name: "Sprout", min: 250, max: 749, color: "#3b82f6", icon: "🌿" },
  { name: "Bud", min: 750, max: 1499, color: "#8b5cf6", icon: "🌱" },
  { name: "Flower", min: 1500, max: 2499, color: "#ec4899", icon: "🌸" },
  { name: "Blossom", min: 2500, max: 3749, color: "#f59e0b", icon: "🌺" },
  { name: "Bloom", min: 3750, max: 5249, color: "#ef4444", icon: "🌼" },
  { name: "Radiant", min: 5250, max: 6999, color: "#fbbf24", icon: "✨" },
  { name: "Luminous", min: 7000, max: 8999, color: "#06b6d4", icon: "🌟" },
  { name: "Brilliant", min: 9000, max: 11249, color: "#8b5cf6", icon: "💎" },
  { name: "Aureate", min: 11250, max: 13749, color: "#f59e0b", icon: "🏆" },
  { name: "Celestial", min: 13750, max: 16499, color: "#ec4899", icon: "🌠" },
  { name: "Ethereal", min: 16500, max: 19499, color: "#a855f7", icon: "🌌" },
  { name: "Transcendent", min: 19500, max: 22999, color: "#3b82f6", icon: "🌠" },
  { name: "Ascendant", min: 23000, max: 26999, color: "#f43f5e", icon: "🚀" },
  { name: "Mythic", min: 27000, max: 31499, color: "#8b5cf6", icon: "🏆" },
  { name: "Legendary", min: 31500, max: Infinity, color: "#f59e0b", icon: "🌟" }
];

const getBadge = (xp) => {
  return XP_BADGES.find(badge => xp >= badge.min && xp <= badge.max) || XP_BADGES[0];
};

// Level Colors for avatar backgrounds
const LEVEL_COLORS = {
  1: "#22c55e",   // Green
  2: "#3b82f6",   // Blue
  3: "#a855f7",   // Purple
  4: "#ec4899",   // Pink
  5: "#f59e0b",   // Orange
  6: "#ef4444",   // Red
  7: "#fbbf24",   // Yellow
  8: "#06b6d4",   // Cyan
  9: "#8b5cf6",   // Violet
  10: "#10b981",  // Emerald
  11: "#f97316",  // Orange
  12: "#84cc16",  // Lime
  13: "#6366f1",  // Indigo
  14: "#14b8a6",  // Teal
  15: "#dc2626",  // Red
  16: "#7c3aed",  // Purple
  17: "#059669",  // Green
  18: "#0d9488",  // Teal
  19: "#7c2d12",  // Orange
  20: "#1e40af",  // Blue
};

function Leaderboard({ user }) {
  const [search, setSearch] = useState("");
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState("all"); // all, weekly, monthly
  const [currentUserId, setCurrentUserId] = useState(user?.id || user?._id || user?.uid || null);
  const [userStats, setUserStats] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const resolvedUser = useMemo(() => {
    if (user) return user;
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      console.warn('Unable to parse stored user for leaderboard highlight:', err);
      return null;
    }
  }, [user]);

  useEffect(() => {
    let unsubscribe;
    let cancelled = false;

    const resolvedUserId = resolvedUser?.id || resolvedUser?._id || resolvedUser?.uid || null;
    setCurrentUserId(resolvedUserId);
    setLoading(true);
    setError(null);

    const leaderboardQuery = query(
      collection(db, 'users'),
      orderBy('xp', 'desc'),
      limit(100)
    );

    const computeLastUpdatedDate = (rawValue) => {
      if (!rawValue) return null;
      if (typeof rawValue === 'string') {
        const parsed = new Date(rawValue);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
      }
      if (rawValue instanceof Date) {
        return rawValue;
      }
      if (typeof rawValue.toDate === 'function') {
        try {
          return rawValue.toDate();
        } catch (err) {
          console.warn('Unable to convert Firestore timestamp:', err);
        }
      }
      return null;
    };

    const passesTimeFilter = (lastUpdated) => {
      if (timeFilter === 'all') return true;
      if (!lastUpdated) return true;
      const windowMs = timeFilter === 'weekly' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
      return Date.now() - lastUpdated.getTime() <= windowMs;
    };

    unsubscribe = onSnapshot(
      leaderboardQuery,
      (snapshot) => {
        if (cancelled) return;

        const users = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            const xp = typeof data.xp === 'number' ? data.xp : Number(data.xp) || 0;
            const level = typeof data.level === 'number' ? data.level : Number(data.level) || 1;
            const tasksCompleted = data.tasksCompleted ?? data.totalPoints ?? 0;
            const streak = data.streak ?? data.streak_days ?? 0;
            const lastUpdated = computeLastUpdatedDate(
              data.last_updated || data.updatedAt || data.updated_at || data.lastUpdated
            );

            return {
              user_id: doc.id,
              email: data.email || '',
              username: data.name || data.username || data.email?.split('@')[0] || 'Explorer',
              xp,
              level,
              tasksCompleted,
              streak,
              last_updated: lastUpdated?.toISOString?.() || null,
              _lastUpdatedDate: lastUpdated,
            };
          })
          .filter((entry) => passesTimeFilter(entry._lastUpdatedDate))
          .sort((a, b) => (b.xp || 0) - (a.xp || 0))
          .map((entry, index) => ({
            ...entry,
            rank: index + 1,
          }));

        users.forEach((entry) => {
          delete entry._lastUpdatedDate;
        });

        setLeaderboardData(users);
        setUserStats(users.find((u) => u.user_id === resolvedUserId) || null);
        setLoading(false);
      },
      (err) => {
        if (cancelled) return;
        console.error('Error loading leaderboard:', err);
        setError('Failed to load leaderboard. Please try again.');
        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [resolvedUser, timeFilter, reloadKey]);

  // Retry loading leaderboard data
  const retryLoad = () => {
    setError(null);
    setReloadKey(prev => prev + 1);
  };

  const getBadge = (xp) => {
    return XP_BADGES.find(badge => xp >= badge.min && xp <= badge.max) || XP_BADGES[0];
  };

  const filteredData = leaderboardData.filter((user) =>
    user.username?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <FaSpinner className="animate-spin" size={32} color="#8b5cf6" />
        <p>Loading leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <FaExclamationTriangle size={50} color="#ef4444" />
        <h3 style={styles.errorTitle}>Leaderboard Issue</h3>
        <p style={styles.errorText}>{error}</p>
        {user ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={retryLoad}
            style={styles.retryButton}
          >
            <FaRedo size={14} />
            Try Again
          </motion.button>
        ) : (
          <p>Please sign in to view the leaderboard</p>
        )}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.header}
      >
        <h1 style={styles.title}>
          <FaTrophy color="#fbbf24" size={40} />
          Global Leaderboard
        </h1>
        <p style={styles.subtitle}>
          Compete with the best and climb to the top!
          {userStats && (
            <span style={{ color: "#a855f7", marginLeft: "15px" }}>
              Your Rank: #{userStats.rank}
            </span>
          )}
          {error && error.includes('demo') && (
            <span style={{ color: "#f59e0b", marginLeft: "15px", fontSize: "0.9rem" }}>
              (Demo Mode)
            </span>
          )}
        </p>
      </motion.div>

      {/* Filters & Search */}
      <div style={styles.controlsContainer}>
        {/* Time Filter */}
        <div style={styles.timeFilterContainer}>
          {['all', 'weekly', 'monthly'].map((filter) => (
            <motion.button
              key={filter}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTimeFilter(filter)}
              style={{
                ...styles.timeFilterButton,
                ...(timeFilter === filter && styles.timeFilterButtonActive),
              }}
            >
              <FaCalendarAlt size={14} />
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </motion.button>
          ))}
        </div>

        {/* Search Bar */}
        <div style={styles.searchContainer}>
          <FaSearch style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* Top 3 Podium */}
      <div style={styles.podiumContainer}>
        {filteredData.slice(0, 3).map((user, index) => {
          const badge = getBadge(user.xp);
          const isCurrentUser = user.user_id === currentUserId;

          return (
            <motion.div
              key={user.user_id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                ...styles.podiumCard,
                ...(index === 0 && styles.podiumFirst),
                ...(index === 1 && styles.podiumSecond),
                ...(index === 2 && styles.podiumThird),
                ...(isCurrentUser && styles.currentUserHighlight),
              }}
            >
              {/* Rank Badge */}
              <div style={styles.podiumRankBadge}>
                {index === 0 && <FaCrown color="#FFD700" size={30} />}
                {index === 1 && <FaMedal color="#C0C0C0" size={28} />}
                {index === 2 && <FaMedal color="#CD7F32" size={26} />}
              </div>

              {/* Avatar */}
              <div style={{
                ...styles.podiumAvatar,
                background: `linear-gradient(135deg, ${LEVEL_COLORS[user.level] || '#8b5cf6'}, ${badge.color})`,
              }}>
                {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
              </div>

              {/* User Info */}
              <h3 style={styles.podiumName}>{user.username || 'Unknown User'}</h3>
              <div style={{
                ...styles.podiumBadge,
                background: `${badge.color}33`,
                border: `2px solid ${badge.color}`,
                color: badge.color,
              }}>
                {badge.icon} {badge.name}
              </div>
              <div style={styles.podiumEmail}>{user.email}</div>

              {/* XP Display */}
              <div style={styles.podiumXP}>
                <FaStar color="#fbbf24" />
                <span>{user.xp?.toLocaleString() || 0} XP</span>
              </div>

              {/* Level */}
              <div style={styles.podiumLevel}>
                Level {user.level || 1}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Rest of Leaderboard */}
      <div style={styles.listContainer}>
        <AnimatePresence>
          {filteredData.slice(3).map((user, index) => {
            const badge = getBadge(user.xp);
            const isCurrentUser = user.user_id === currentUserId;
            const actualRank = index + 4;

            return (
              <motion.div
                key={user.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 5 }}
                style={{
                  ...styles.listCard,
                  ...(isCurrentUser && styles.currentUserCard),
                }}
              >
                {/* Rank Number */}
                <div style={styles.rankNumber}>
                  #{actualRank}
                </div>

                {/* Avatar */}
                <div style={{
                  ...styles.listAvatar,
                  background: `linear-gradient(135deg, ${LEVEL_COLORS[user.level] || '#8b5cf6'}, ${badge.color})`,
                  boxShadow: isCurrentUser ? `0 0 20px ${badge.color}` : 'none',
                }}>
                  {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                </div>

                {/* User Info */}
                <div style={styles.listUserInfo}>
                  <div style={styles.listName}>
                    {user.username || 'Unknown User'}
                    {isCurrentUser && <span style={styles.youBadge}>YOU</span>}
                  </div>
                  <div style={styles.listEmail}>{user.email}</div>
                </div>

                {/* Badge */}
                <div style={{
                  ...styles.listBadge,
                  background: `${badge.color}22`,
                  border: `1px solid ${badge.color}`,
                  color: badge.color,
                }}>
                  {badge.icon} {badge.name}
                </div>

                {/* XP Progress */}
                <div style={styles.listXPContainer}>
                  <div style={styles.listXPValue}>
                    {user.xp?.toLocaleString() || 0} XP
                  </div>
                  <div style={styles.progressBarBg}>
                    <div style={{
                      ...styles.progressBarFill,
                      width: `${getProgressPercentage(user.xp || 0, user.level || 1)}%`,
                      background: `linear-gradient(90deg, ${LEVEL_COLORS[user.level] || '#8b5cf6'}, ${badge.color})`,
                    }} />
                  </div>
                  {/* Next Level Info */}
                  <div style={styles.nextLevelInfo}>
                    Next: Lv. {user.level + 1} ({getXPForLevel(user.level + 1) - (user.xp || 0)} XP to go)
                  </div>
                </div>

                {/* Level */}
                <div style={styles.listLevel}>
                  Lv. {user.level || 1}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredData.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={styles.emptyState}
        >
          <FaSearch size={50} color="#555" />
          <p>No players found</p>
        </motion.div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    color: '#ffffff',
    background: 'transparent',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#d1d5db',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(139, 92, 246, 0.2)',
    borderTop: '4px solid #a855f7',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px',
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
    color: '#ffffff',
    textShadow: '0 2px 10px rgba(0,0,0,0.5)',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#d1d5db',
  },
  controlsContainer: {
    display: 'flex',
    gap: '20px',
    marginBottom: '40px',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeFilterContainer: {
    display: 'flex',
    gap: '10px',
    background: 'rgba(17, 24, 39, 0.8)',
    padding: '6px',
    borderRadius: '12px',
    border: '1px solid rgba(139, 92, 246, 0.2)',
  },
  timeFilterButton: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: '#d1d5db',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s',
  },
  timeFilterButtonActive: {
    background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
    color: '#ffffff',
    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.4)',
  },
  searchContainer: {
    position: 'relative',
    flex: 1,
    minWidth: '250px',
    maxWidth: '400px',
  },
  searchIcon: {
    position: 'absolute',
    left: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#d1d5db',
  },
  searchInput: {
    width: '100%',
    padding: '14px 14px 14px 45px',
    borderRadius: '12px',
    border: '2px solid rgba(139, 92, 246, 0.3)',
    background: 'rgba(17, 24, 39, 0.8)',
    color: '#ffffff',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.3s',
  },
  podiumContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  podiumCard: {
    background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.9))',
    borderRadius: '20px',
    padding: '30px 20px',
    textAlign: 'center',
    position: 'relative',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(75, 85, 99, 0.3)',
    transition: 'all 0.3s',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  },
  podiumFirst: {
    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.08))',
    border: '2px solid rgba(255, 215, 0, 0.6)',
    transform: 'scale(1.05)',
    boxShadow: '0 12px 40px rgba(255, 215, 0, 0.3)',
  },
  podiumSecond: {
    background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.15), rgba(192, 192, 192, 0.08))',
    border: '2px solid rgba(192, 192, 192, 0.6)',
    boxShadow: '0 8px 32px rgba(192, 192, 192, 0.2)',
  },
  podiumThird: {
    background: 'linear-gradient(135deg, rgba(205, 127, 50, 0.15), rgba(205, 127, 50, 0.08))',
    border: '2px solid rgba(205, 127, 50, 0.6)',
    boxShadow: '0 8px 32px rgba(205, 127, 50, 0.2)',
  },
  currentUserHighlight: {
    boxShadow: '0 0 40px rgba(168, 85, 247, 0.8)',
    border: '2px solid rgba(168, 85, 247, 0.8)',
  },
  podiumRankBadge: {
    position: 'absolute',
    top: '-15px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(135deg, #1f2937, #111827)',
    padding: '12px',
    borderRadius: '50%',
    border: '2px solid rgba(75, 85, 99, 0.5)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
  },
  podiumAvatar: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    margin: '20px auto 15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.2rem',
    fontWeight: '700',
    boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
    border: '3px solid rgba(255, 255, 255, 0.1)',
  },
  podiumName: {
    fontSize: '1.4rem',
    fontWeight: '700',
    marginBottom: '10px',
    color: '#ffffff',
  },
  podiumBadge: {
    display: 'inline-block',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: '700',
    marginBottom: '15px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
  },
  podiumXP: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '1.3rem',
    fontWeight: '700',
    marginBottom: '10px',
    color: '#ffffff',
  },
  podiumEmail: {
    fontSize: '0.9rem',
    color: '#d1d5db',
    marginBottom: '15px',
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  listCard: {
    background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9), rgba(31, 41, 55, 0.85))',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    border: '2px solid rgba(75, 85, 99, 0.3)',
    transition: 'all 0.3s',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
  },
  currentUserCard: {
    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(124, 58, 237, 0.15))',
    border: '2px solid rgba(168, 85, 247, 0.6)',
    boxShadow: '0 8px 32px rgba(168, 85, 247, 0.4)',
  },
  rankNumber: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: '#d1d5db',
    minWidth: '60px',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  },
  listAvatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.6rem',
    fontWeight: '700',
    flexShrink: 0,
    border: '3px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
  },
  listUserInfo: {
    flex: 1,
    minWidth: 0,
  },
  listName: {
    fontSize: '1.15rem',
    fontWeight: '700',
    marginBottom: '5px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#ffffff',
  },
  youBadge: {
    background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
    padding: '3px 12px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#ffffff',
    boxShadow: '0 2px 8px rgba(168, 85, 247, 0.4)',
  },
  listEmail: {
    fontSize: '0.9rem',
    color: '#d1d5db',
  },
  listBadge: {
    padding: '8px 14px',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
  },
  listXPContainer: {
    minWidth: '160px',
  },
  listXPValue: {
    fontSize: '1.1rem',
    fontWeight: '700',
    marginBottom: '6px',
    color: '#ffffff',
  },
  nextLevelInfo: {
    fontSize: '0.8rem',
    color: '#d1d5db',
    marginTop: '4px',
    textAlign: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: '10px',
    background: 'rgba(17, 24, 39, 0.8)',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid rgba(75, 85, 99, 0.3)',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '10px',
    transition: 'width 0.5s ease',
    boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
  },
  listStreak: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '1.05rem',
    fontWeight: '700',
    minWidth: '70px',
    color: '#ffffff',
  },
  listLevel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontSize: '1rem',
    fontWeight: '700',
    minWidth: '50px',
    color: '#ffffff',
  },
  errorContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'rgba(239, 68, 68, 0.1)',
    borderRadius: '20px',
    border: '2px solid rgba(239, 68, 68, 0.3)',
    margin: '40px auto',
    maxWidth: '600px',
  },
  errorTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '10px',
    color: '#ef4444',
  },
  errorText: {
    fontSize: '1rem',
    color: '#dc2626',
    marginBottom: '20px',
  },
  retryButton: {
    padding: '12px 24px',
    borderRadius: '12px',
    border: '2px solid #a855f7',
    background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
    color: '#ffffff',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    marginTop: '20px',
    transition: 'all 0.3s',
  },
};

// Add CSS animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
if (!document.head.querySelector('style[data-leaderboard]')) {
  styleSheet.setAttribute('data-leaderboard', 'true');
  document.head.appendChild(styleSheet);
}

export default Leaderboard;
