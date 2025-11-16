import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- UPDATED: Import FaTrophy and FaStar from 'fa' ---
import { 
  FaTrophy, FaStar, FaMedal, FaCrown, FaFire, FaChartLine, FaCalendarAlt, 
  FaExclamationTriangle, FaRedo, FaSpinner, FaSeedling, FaSpa, FaRegStar, 
  FaStarOfLife, FaGem, FaRocket, FaMeteor, FaUsers, FaGlobe, FaHandsHelping 
} from "react-icons/fa";

// --- UPDATED: Correct Fi icons from 'fi' (Added FiGlobe) ---
import {
  FiSearch, FiAward, FiChevronUp, FiAlertTriangle, FiRefreshCw, FiLoader, 
  FiHeart, FiLink, FiCopy, FiCheck, 
  FiStar as FiStarEmpty, FiTrendingUp, FiGitPullRequest, FiCoffee, FiMoon, FiBox, FiSun
} from "react-icons/fi"; 
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

// --- (All your level and badge functions remain the same) ---
const LEVEL_XP_REQUIREMENTS = {
  1: 0, 2: 250, 3: 500, 4: 750, 5: 1000, 6: 1250, 7: 1500, 8: 1750, 9: 2000, 
  10: 2250, 11: 2500, 12: 2750, 13: 3000, 14: 3250, 15: 3500,
};
const getXPForLevel = (level) => {
  return LEVEL_XP_REQUIREMENTS[level] || 0;
};
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
const getProgressPercentage = (currentXP, currentLevel) => {
  const currentLevelXP = getXPForLevel(currentLevel);
  const nextLevelXP = getXPForLevel(currentLevel + 1);
  if (nextLevelXP === 0 || currentLevel >= 15) return 100;
  const xpForNextLevel = nextLevelXP - currentLevelXP;
  const currentLevelProgress = currentXP - currentLevelXP;
  return Math.min((currentLevelProgress / xpForNextLevel) * 100, 100);
};
// --- Badges using React Icons ---
const XP_BADGES = [
  { name: "Seedling", min: 0, max: 249, color: "#22c55e", icon: <FaSeedling /> },
  { name: "Sprout", min: 250, max: 749, color: "#3b82f6", icon: <FaSeedling /> },
  { name: "Bud", min: 750, max: 1499, color: "#8b5cf6", icon: <FaSeedling /> },
  { name: "Flower", min: 1500, max: 2499, color: "#ec4899", icon: <FaSpa /> },
  { name: "Blossom", min: 2500, max: 3749, color: "#f59e0b", icon: <FaSpa /> },
  { name: "Bloom", min: 3750, max: 5249, color: "#ef4444", icon: <FaSpa /> },
  { name: "Radiant", min: 5250, max: 6999, color: "#fbbf24", icon: <FaRegStar /> },
  { name: "Luminous", min: 7000, max: 8999, color: "#06b6d4", icon: <FaStarOfLife /> },
  { name: "Brilliant", min: 9000, max: 11249, color: "#8b5cf6", icon: <FaGem /> },
  { name: "Aureate", min: 11250, max: 13749, color: "#f59e0b", icon: <FaTrophy /> },
  { name: "Celestial", min: 13750, max: 16499, color: "#ec4899", icon: <FaMeteor /> },
  { name: "Ethereal", min: 16500, max: 19499, color: "#a855f7", icon: <FaMeteor /> },
  { name: "Transcendent", min: 19500, max: 22999, color: "#3b82f6", icon: <FaMeteor /> },
  { name: "Ascendant", min: 23000, max: 26999, color: "#f43f5e", icon: <FaRocket /> },
  { name: "Mythic", min: 27000, max: 31499, color: "#8b5cf6", icon: <FaTrophy /> },
  { name: "Legendary", min: 31500, max: Infinity, color: "#f59e0b", icon: <FaStarOfLife /> }
];

const getBadge = (xp) => {
  return XP_BADGES.find(badge => xp >= badge.min && xp <= badge.max) || XP_BADGES[0];
};

// --- UPDATED: Pastel Level Colors ---
const LEVEL_COLORS = {
  1: "#d8b4fe",  // Pastel Purple
  2: "#a5f3fc",  // Pastel Cyan
  3: "#a7f3d0",  // Pastel Mint
  4: "#fecdd3",  // Pastel Pink
  5: "#fde68a",  // Pastel Yellow
  6: "#c4b5fd",  // Lavender
  7: "#bae6fd",  // Pastel Blue
  8: "#86efac",  // Pastel Green
  9: "#fbcfe8",  // Deeper Pink
  10: "#fcd34d", // Pastel Orange
  11: "#a78bfa", // Deeper Purple
  12: "#60a5fa", // Deeper Blue
  13: "#6ee7b7", // Deeper Mint
  14: "#f9a8d4", // Deeper Pink
  15: "#fdba74", // Deeper Orange
  16: "#8b5cf6", // Vibrant Purple
  17: "#38bdf8", // Vibrant Blue
  18: "#34d399", // Vibrant Green
  19: "#f472b6", // Vibrant Pink
  20: "#fb923c", // Vibrant Orange
};
// --- (End of helper functions) ---


// --- MOCK FRIENDS DATA (Placeholder) ---
const mockFriendsData = [
  {
    user_id: "user_friend_1",
    email: "shreya.vixm@gmail.com",
    username: "Shreeya V",
    xp: 135,
    level: 1,
  },
  {
    user_id: "user_friend_2",
    email: "sanjana@gmail.com",
    username: "Sanjana",
    xp: 120,
    level: 1,
  },
  {
    user_id: "user_friend_3",
    email: "shreya@gmail.com",
    username: "Shreya",
    xp: 0,
    level: 1,
  },
];
// --- END MOCK DATA ---


// --- NEW: Invite Friends Card Component ---
const InviteFriendsCard = ({ user }) => {
  const [copied, setCopied] = useState(false);
  
  const username = user?.username || 'user';
  const inviteLink = `${window.location.origin}/invite/${username.toLowerCase().replace(/\s/g, '')}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      style={styles.inviteCard}
    >
      <div style={styles.inviteIcon}>
        <FiLink size={24} />
      </div>
      <div>
        <h3 style={styles.inviteTitle}>Invite Your Friends</h3>
        <p style={styles.inviteSubtitle}>Share your unique link to add friends and compete!</p>
      </div>
      <div style={styles.inviteLinkBox}>
        <span style={styles.inviteLinkText}>{inviteLink}</span>
        <motion.button
          onClick={handleCopy}
          style={styles.inviteCopyButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
          {copied ? "Copied!" : "Copy"}
        </motion.button>
      </div>
    </motion.div>
  );
};


function Leaderboard({ user }) {
  const [search, setSearch] = useState("");
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState("all");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [view, setView] = useState("global");
  const [friendsData, setFriendsData] = useState(mockFriendsData);
  const [cheerSent, setCheerSent] = useState(null);

  const resolvedUser = useMemo(() => {
    if (user) return user;
    try {
      const stored = localStorage.getItem('user');
      const parsed = stored ? JSON.parse(stored) : null;
      if (parsed && !parsed.username) {
        parsed.username = parsed.email?.split('@')[0] || 'explorer';
      }
      return parsed;
    } catch (err) {
      console.warn('Unable to parse stored user for leaderboard highlight:', err);
      return null;
    }
  }, [user]);

  // (This useEffect for fetching GLOBAL leaderboard is unchanged)
  useEffect(() => {
    let unsubscribe;
    let cancelled = false;

    const resolvedUserId = resolvedUser?.user_id || resolvedUser?.id || resolvedUser?._id || resolvedUser?.uid || null;
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

  useEffect(() => {
    if (view === 'friends') {
      const sortedFriends = [...mockFriendsData]
        .sort((a, b) => b.xp - a.xp)
        .map((friend, index) => ({ ...friend, rank: index + 1 }));
      setFriendsData(sortedFriends);
    }
  }, [view]);


  const retryLoad = () => {
    setError(null);
    setReloadKey(prev => prev + 1);
  };

  const filteredGlobalData = leaderboardData.filter((user) =>
    user.username?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  );
  
  const filteredFriendsData = friendsData.filter((user) =>
    user.username?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCheer = (friendId) => {
    console.log(`Sending cheer to ${friendId}!`);
    setCheerSent(friendId);
    setTimeout(() => setCheerSent(null), 1500);
  };

  if (loading && view === 'global') {
    return (
      <div style={styles.loadingContainer}>
        <FiLoader className="animate-spin" size={32} color="#8b5cf6" />
        <p>Loading leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <FiAlertTriangle size={50} color="#ef4444" />
        <h3 style={styles.errorTitle}>Leaderboard Issue</h3>
        <p style={styles.errorText}>{error}</p>
        {user ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={retryLoad}
            style={styles.retryButton}
          >
            <FiRefreshCw size={14} />
            Try Again
          </motion.button>
        ) : (
          <p>Please sign in to view the leaderboard</p>
        )}
      </div>
    );
  }

  const dataToRender = view === 'global' ? filteredGlobalData : filteredFriendsData;

  return (
    <div style={styles.container}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.header}
      >
        <h1 style={styles.title}>
          <FaTrophy color="#f59e0b" size={40} />
          Global Leaderboard
        </h1>
        <p style={styles.subtitle}>
          Compete with the best and climb to the top!
          {userStats && (
            <span style={{ color: "#a855f7", marginLeft: "15px" }}>
              Your Rank: #{userStats.rank}
            </span>
          )}
        </p>
      </motion.div>

      {/* --- UPDATED: Filters & Search --- */}
      <div style={styles.controlsContainer}>
        {/* --- NEW: View Toggle (Global/Friends) --- */}
        <div style={styles.viewToggleContainer}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setView('global')}
            style={{
              ...styles.viewToggleButton,
              ...(view === 'global' && styles.viewToggleButtonActive),
            }}
          >
            <FaGlobe size={14} />
            Global
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setView('friends')}
            style={{
              ...styles.viewToggleButton,
              ...(view === 'friends' && styles.viewToggleButtonActive),
            }}
          >
            <FaUsers size={14} />
            Friends
          </motion.button>
        </div>

        {/* Time Filter (Only show for Global view) */}
        <AnimatePresence>
          {view === 'global' && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              style={styles.timeFilterContainer}
            >
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Bar */}
        <div style={styles.searchContainer}>
          <FiSearch style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* --- UPDATED: Conditional Rendering for Podium/Invite Card --- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view} // This key makes the animation work when switching
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.4 }}
        >
          {/* --- NEW: Show Invite Card if Friends tab is selected --- */}
          {view === 'friends' && (
            <InviteFriendsCard user={resolvedUser} />
          )}

          {/* Top 3 Podium */}
          <div style={styles.podiumContainer}>
            {dataToRender.slice(0, 3).map((user, index) => {
              const badge = getBadge(user.xp);
              const isCurrentUser = user.user_id === currentUserId;

              let podiumStyle = {};
              if (index === 0) podiumStyle = styles.podiumFirst;
              if (index === 1) podiumStyle = styles.podiumSecond;
              if (index === 2) podiumStyle = styles.podiumThird;
              
              const cardStyle = isCurrentUser 
                ? { ...styles.podiumCard, ...podiumStyle, ...styles.currentUserHighlight }
                : { ...styles.podiumCard, ...podiumStyle };

              return (
                <motion.div
                  key={user.user_id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={cardStyle}
                >
                  <div style={styles.podiumRankBadge}>
                    {index === 0 && <FaCrown color="#f59e0b" size={30} />}
                    {index === 1 && <FaMedal color="#9ca3af" size={28} />}
                    {index === 2 && <FaMedal color="#f97316" size={26} />}
                  </div>
                  <div style={{
                    ...styles.podiumAvatar,
                    background: `linear-gradient(135deg, ${LEVEL_COLORS[user.level] || '#8b5cf6'}, ${badge.color})`,
                  }}>
                    {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <h3 style={styles.podiumName}>{user.username || 'Unknown User'}</h3>
                  <div style={{
                    ...styles.podiumBadge,
                    background: `${badge.color}22`,
                    border: `1px solid ${badge.color}`,
                    color: badge.color,
                  }}>
                    {badge.icon} {badge.name}
                  </div>
                  <div style={styles.podiumEmail}>{user.email}</div>
                  <div style={styles.podiumXP}>
                    <FaStar color="#f59e0b" />
                    <span>{user.xp?.toLocaleString() || 0} XP</span>
                  </div>
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
              {dataToRender.slice(3).map((user, index) => {
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
                    <div style={styles.rankNumber}>
                      #{actualRank}
                    </div>
                    <div style={{
                      ...styles.listAvatar,
                      background: `linear-gradient(135deg, ${LEVEL_COLORS[user.level] || '#8b5cf6'}, ${badge.color})`,
                      boxShadow: isCurrentUser ? `0 0 20px ${badge.color}` : 'none',
                    }}>
                      {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div style={styles.listUserInfo}>
                      <div style={styles.listName}>
                        {user.username || 'Unknown User'}
                        {isCurrentUser && <span style={styles.youBadge}>YOU</span>}
                      </div>
                      <div style={styles.listEmail}>{user.email}</div>
                    </div>
                    <div style={{
                      ...styles.listBadge,
                      background: `${badge.color}22`,
                      border: `1px solid ${badge.color}`,
                      color: badge.color,
                    }}>
                      {badge.icon} {badge.name}
                    </div>
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
                      <div style={styles.nextLevelInfo}>
                        Next: Lv. {user.level + 1} ({getXPForLevel(user.level + 1) - (user.xp || 0)} XP to go)
                      </div>
                    </div>
                    
                    {/* --- NEW: Cheer Button (only for friends view) --- */}
                    {view === 'friends' && !isCurrentUser && (
                      <div style={{ position: 'relative' }}>
                        <motion.button
                          onClick={() => handleCheer(user.user_id)}
                          whileHover={{ scale: 1.1, rotate: [0, 10, -10, 0] }}
                          whileTap={{ scale: 0.9 }}
                          transition={{ repeat: Infinity, repeatDelay: 1, duration: 0.5 }}
                          style={styles.cheerButton}
                        >
                          <FiHeart size={18} />
                        </motion.button>
                        <AnimatePresence>
                          {cheerSent === user.user_id && (
                            <motion.div
                              initial={{ opacity: 1, y: 0, scale: 0.5 }}
                              animate={{ opacity: 0, y: -60, scale: 1.5 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              style={styles.cheerAnimation}
                            >
                              ❤️
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    <div style={styles.listLevel}>
                      Lv. {user.level || 1}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>


      {/* Empty State */}
      {dataToRender.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={styles.emptyState}
        >
          <FiSearch size={50} color="#6b7280" />
          <p>No players found</p>
        </motion.div>
      )}
    </div>
  );
}

// =================================================================
// === UPDATED STYLES OBJECT (LIGHT THEME) ===
// =================================================================
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    color: '#374151', // Dark text
    background: 'linear-gradient(135deg, #f7f3ff 0%, #e9dfff 100%)', // Lavender gradient
    minHeight: '100vh',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#6b7280', // Darker text
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
    color: '#1e0a40', // Dark purple text
    textShadow: 'none',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#4f46e5', // Medium purple text
  },
  controlsContainer: {
    display: 'flex',
    gap: '20px',
    marginBottom: '40px',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // --- NEW: View Toggle Styles ---
  viewToggleContainer: {
    display: 'flex',
    gap: '0px', // No gap, buttons are joined
    background: 'rgba(255, 255, 255, 0.7)', // White glass
    padding: '6px',
    borderRadius: '12px',
    border: '1px solid rgba(139, 92, 246, 0.2)',
  },
  viewToggleButton: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: '#4f46e5', // Dark purple text
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s',
  },
  viewToggleButtonActive: {
    background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
    color: '#ffffff',
    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.4)',
  },
  // --- End View Toggle Styles ---
  timeFilterContainer: {
    display: 'flex',
    gap: '10px',
    background: 'rgba(255, 255, 255, 0.7)', // White glass
    padding: '6px',
    borderRadius: '12px',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    overflow: 'hidden', // For animation
  },
  timeFilterButton: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: '#4f46e5', // Dark purple text
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s',
    whiteSpace: 'nowrap',
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
    color: '#9ca3b8', // Gray
  },
  searchInput: {
    width: '100%',
    padding: '14px 14px 14px 45px',
    borderRadius: '12px',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    background: 'rgba(255, 255, 255, 0.8)', // White glass
    color: '#1e0a40', // Dark text
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.3s',
  },
  podiumContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
    alignItems: 'flex-end', // Align cards
  },
  podiumCard: {
    background: 'rgba(255, 255, 255, 0.7)', // White glass
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '30px 20px',
    textAlign: 'center',
    position: 'relative',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    transition: 'all 0.3s',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', // Soft shadow
  },
  podiumFirst: {
    transform: 'scale(1.05)',
    border: '2px solid #a78bfa',
    boxShadow: '0 12px 40px rgba(167, 139, 250, 0.4)',
  },
  podiumSecond: {
    border: '2px solid #c4b5fd', // Lighter purple
    boxShadow: '0 8px 32px rgba(196, 181, 253, 0.2)',
  },
  podiumThird: {
    border: '2px solid rgba(255, 255, 255, 0.5)',
  },
  currentUserHighlight: { // This will apply to a podium card if user is top 3
    boxShadow: '0 0 40px rgba(168, 85, 247, 0.8)',
    border: '2px solid #8b5cf6',
  },
  podiumRankBadge: {
    position: 'absolute',
    top: '-15px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(135deg, #f9fafb, #e5e7eb)', // Light gray
    padding: '12px',
    borderRadius: '50%',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
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
    color: '#ffffff', // Keep text white on colored bg
    boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
    border: '3px solid rgba(255, 255, 255, 0.3)',
  },
  podiumName: {
    fontSize: '1.4rem',
    fontWeight: '700',
    marginBottom: '10px',
    color: '#1e0a40', // Dark text
  },
  podiumBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: '700',
    marginBottom: '15px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  podiumXP: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '1.3rem',
    fontWeight: '700',
    marginBottom: '10px',
    color: '#374151', // Dark text
  },
  podiumEmail: {
    fontSize: '0.9rem',
    color: '#6b7280', // Gray text
    marginBottom: '15px',
  },
  podiumLevel: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#4f46e5', // Purple text
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  listCard: {
    background: 'rgba(255, 255, 255, 0.7)', // White glass
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    transition: 'all 0.3s',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
  },
  currentUserCard: {
    background: 'rgba(255, 255, 255, 0.9)', // More opaque white
    border: '2px solid #8b5cf6', // Purple border
    boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)', // Purple glow
  },
  rankNumber: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: '#9ca3b8', // Gray text
    minWidth: '60px',
    textShadow: 'none',
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
    color: '#ffffff', // Keep text white
    flexShrink: 0,
    border: '3px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', // Softer shadow
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
    color: '#1e0a40', // Dark text
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
    color: '#6b7280', // Gray text
  },
  listBadge: {
    display: 'flex', // Added
    alignItems: 'center', // Added
    gap: '6px', // Added
    padding: '8px 14px',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  listXPContainer: {
    minWidth: '160px',
  },
  listXPValue: {
    fontSize: '1.1rem',
    fontWeight: '700',
    marginBottom: '6px',
    color: '#374151', // Dark text
  },
  nextLevelInfo: {
    fontSize: '0.8rem',
    color: '#9ca3b8', // Gray text
    marginTop: '4px',
    textAlign: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: '10px',
    background: 'rgba(0, 0, 0, 0.1)', // Light gray bg
    borderRadius: '10px',
    overflow: 'hidden',
    border: 'none',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '10px',
    transition: 'width 0.5s ease',
    boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
  },
  listLevel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontSize: '1rem',
    fontWeight: '700',
    minWidth: '50px',
    color: '#1e0a40', // Dark text
  },
  // --- NEW: Cheer Button Styles ---
  cheerButton: {
    background: 'rgba(139, 92, 246, 0.1)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    color: '#8b5cf6',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    margin: '0 15px',
  },
  cheerAnimation: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '2rem',
    pointerEvents: 'none',
    color: '#ef4444', // Make the heart red
  },
  // --- End Cheer Button Styles ---
  // --- NEW: Invite Card Styles ---
  inviteCard: {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '24px',
    border: '1px solid rgba(255, 255, 255, 0.6)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
  },
  inviteIcon: {
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  inviteTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e0a40',
    margin: 0,
  },
  inviteSubtitle: {
    fontSize: '0.9rem',
    color: '#6b7280',
    margin: 0,
  },
  inviteLinkBox: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(237, 233, 254, 0.8)', // Light lavender bg
    borderRadius: '12px',
    padding: '8px',
    border: '1px solid #c4b5fd',
    flex: 1,
  },
  inviteLinkText: {
    fontSize: '0.9rem',
    color: '#4f46e5',
    fontWeight: '500',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    paddingLeft: '12px',
    flex: 1,
  },
  inviteCopyButton: {
    background: '#8b5cf6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexShrink: 0,
  },
  // --- End Invite Card Styles ---
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
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#6b7280',
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