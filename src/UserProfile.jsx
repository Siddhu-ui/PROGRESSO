import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

function UserProfile({ user, setUser }) {
  const [userStats, setUserStats] = useState({
    level: 1,
    xp: 0,
    streak: 0,
    tasksCompleted: 0,
    totalXP: 0,
    joinDate: new Date().toLocaleDateString()
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserStats = () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setUserStats({
          level: storedUser.level || 1,
          xp: storedUser.xp || 0,
          streak: storedUser.streak || 0,
          tasksCompleted: storedUser.tasksCompleted || 0,
          totalXP: storedUser.xp || 0,
          joinDate: storedUser.joinDate || new Date().toLocaleDateString()
        });
      } catch (error) {
        console.error('Error loading user stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUserStats();
  }, [user]);

  const myProgress = [
    { name: "Active streak", description: `${userStats.streak} days`, status: "active", color: "#ef4444" },
    { name: "Paused goals", description: "Resume anytime", status: "blocked", color: "#10b981" }
  ];

  const myActivities = [
    { name: "Daily Tasks", status: "completed", count: userStats.tasksCompleted, color: "#10b981" },
    { name: "Weekly Goals", status: "completed", count: Math.floor(userStats.tasksCompleted / 7), color: "#10b981" },
    { name: "Level Progress", status: "completed", count: userStats.level, color: "#10b981" },
    { name: "Total XP Earned", status: "completed", count: userStats.totalXP, color: "#10b981" }
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{
            width: "64px",
            height: "64px",
            border: "4px solid #8b5cf6",
            borderTopColor: "transparent",
            borderRadius: "50%"
          }}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
        gap: "24px"
      }}
    >
      {/* Left Column - Profile Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px) saturate(180%)",
          borderRadius: "25px",
          padding: "32px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
          height: "fit-content"
        }}
      >
        {/* Profile Image */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{
            width: "180px",
            height: "180px",
            margin: "0 auto",
            borderRadius: "20px",
            overflow: "hidden",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "4px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)"
          }}>
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                fontSize: "80px",
                opacity: 0.8
              }}
            >
              👤
            </motion.div>
          </div>
        </div>

        {/* Profile Info */}
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#f1f5f9",
            marginBottom: "8px",
            background: "linear-gradient(135deg, #60a5fa, #a855f7)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>My Profile</h2>
          <p style={{
            fontSize: "14px",
            color: "#94a3b8",
            marginBottom: "24px"
          }}>
            Last login: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>

          {/* Contact Info */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "16px 0",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              marginBottom: "12px"
            }}>
              <span style={{
                color: "#cbd5e1",
                fontSize: "15px",
                fontWeight: "500"
              }}>
                {user?.displayName || user?.name || "Growth Seeker"}
              </span>
              <motion.span
                animate={{
                  scale: [1, 1.1, 1],
                  color: ["#f59e0b", "#fbbf24", "#f59e0b"]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  color: "#f59e0b",
                  fontWeight: "700",
                  fontSize: "16px"
                }}
              >
                Level {userStats.level}
              </motion.span>
            </div>
            <div style={{
              padding: "12px 0",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <span style={{ color: "#94a3b8", fontSize: "14px" }}>
                {user?.email || "user@example.com"}
              </span>
            </div>
          </div>

          {/* Stats Summary */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
            marginBottom: "24px"
          }}>
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                padding: "16px",
                borderRadius: "12px",
                textAlign: "center",
                border: "1px solid rgba(255, 255, 255, 0.1)"
              }}
            >
              <div style={{
                fontSize: "24px",
                fontWeight: "800",
                color: "#10b981",
                marginBottom: "4px"
              }}>
                {userStats.tasksCompleted}
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>Tasks Done</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                padding: "16px",
                borderRadius: "12px",
                textAlign: "center",
                border: "1px solid rgba(255, 255, 255, 0.1)"
              }}
            >
              <div style={{
                fontSize: "24px",
                fontWeight: "800",
                color: "#f59e0b",
                marginBottom: "4px"
              }}>
                {userStats.streak}
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>Day Streak</div>
            </motion.div>
          </div>

          {/* Level Progress Bar */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
              fontSize: "14px",
              color: "#cbd5e1"
            }}>
              <span>Level Progress</span>
              <span>{userStats.xp}/100 XP</span>
            </div>
            <div style={{
              width: "100%",
              height: "8px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "4px",
              overflow: "hidden"
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((userStats.xp / 100) * 100, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, #f59e0b, #f97316)",
                  borderRadius: "4px",
                  boxShadow: "0 0 10px rgba(245, 158, 11, 0.5)"
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Column - Stats & Activities */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* My Progress Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px) saturate(180%)",
            borderRadius: "25px",
            padding: "32px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)"
          }}
        >
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px"
          }}>
            <h3 style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#f1f5f9",
              background: "linear-gradient(135deg, #60a5fa, #a855f7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>My Progress</h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {myProgress.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "20px",
                  borderRadius: "16px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)"
                }}
              >
                <div>
                  <div style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#f1f5f9",
                    marginBottom: "4px"
                  }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: "14px", color: "#94a3b8" }}>
                    {item.description}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "20px",
                    border: "none",
                    background: item.status === "active" ? item.color : "#10b981",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    boxShadow: `0 4px 15px ${item.color}40`
                  }}
                >
                  {item.status === "active" ? "Active" : "Resume"}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* My Activities Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px) saturate(180%)",
            borderRadius: "25px",
            padding: "32px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)"
          }}
        >
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px"
          }}>
            <h3 style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#f1f5f9",
              background: "linear-gradient(135deg, #60a5fa, #a855f7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>My Activities</h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {myActivities.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 20px",
                  borderRadius: "16px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 360]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.5,
                      ease: "easeInOut"
                    }}
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: activity.color,
                      boxShadow: `0 0 10px ${activity.color}60`
                    }}
                  />
                  <span style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#f1f5f9"
                  }}>
                    {activity.name}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "20px",
                    border: "none",
                    background: activity.color,
                    color: "white",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow: `0 4px 15px ${activity.color}50`,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  {activity.count}
                  {activity.status === "completed" && (
                    <motion.span
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                    >
                      ✓
                    </motion.span>
                  )}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default UserProfile;
