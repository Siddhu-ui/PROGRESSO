import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Palette, LogOut } from "lucide-react";
import { ThemeProvider, useTheme } from "./ThemeContext";
import ThemeCustomizer from "./ThemeCustomizer";
import Welcome from "./Welcome";
import Auth from "./Auth";
import Dashboard from "./Dashboard";
import Profile from "./ProfilePage";
import Leaderboard from "./Leaderboard";
import AdventureMap from "./AdventureMap.jsx";
import Game from "./Game";
import AIAssistant from "./AIAssistant";
import LevelRoadmap from "./LevelRoadmap";
// Removed Firebase import - using JWT auth instead

function AnimatedRoutes({ user, setUser, token, setToken }) {
  const location = useLocation();
  const { theme } = useTheme();

  const pageVariants = {
    initial: {
      opacity: 0,
      scale: 0.98,
      y: 20
    },
    in: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    out: {
      opacity: 0,
      scale: 1.02,
      y: -20,
      transition: {
        duration: 0.4,
        ease: "easeIn"
      }
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Welcome Page */}
        <Route
          path="/welcome"
          element={
            <motion.div
              custom="welcome"
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
            >
              <Welcome />
            </motion.div>
          }
        />

        {/* Dashboard - No auth required */}
        <Route
          path="/"
          element={
            <motion.div
              custom="dashboard"
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
            >
              <Dashboard user={user} setUser={setUser} token={token} setToken={setToken} />
            </motion.div>
          }
        />

        {/* Auth - Optional */}
        <Route
          path="/auth"
          element={
            <motion.div
              custom="auth"
              variants={{
                initial: { opacity: 0, scale: 0.95 },
                in: {
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.4, ease: "easeOut" }
                },
                out: {
                  opacity: 0,
                  scale: 0.9,
                  transition: { duration: 0.3, ease: "easeIn" }
                }
              }}
              initial="initial"
              animate="in"
              exit="out"
            >
              <Auth setUser={setUser} setToken={setToken} />
            </motion.div>
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <motion.div
              custom="profile"
              variants={{
                initial: { opacity: 0, x: 50 },
                in: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.5, ease: "easeOut" }
                },
                out: {
                  opacity: 0,
                  x: -50,
                  transition: { duration: 0.3, ease: "easeIn" }
                }
              }}
              initial="initial"
              animate="in"
              exit="out"
            >
              <Profile user={user} setUser={setUser} />
            </motion.div>
          }
        />

        {/* Leaderboard */}
        <Route
          path="/leaderboard"
          element={
            <motion.div
              custom="leaderboard"
              variants={{
                initial: { opacity: 0, scale: 0.9, y: 30 },
                in: {
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: "easeOut" }
                },
                out: {
                  opacity: 0,
                  scale: 0.95,
                  y: -30,
                  transition: { duration: 0.3, ease: "easeIn" }
                }
              }}
              initial="initial"
              animate="in"
              exit="out"
            >
              <Leaderboard />
            </motion.div>
          }
        />

        {/* Adventure Map */}
        <Route
          path="/adventure"
          element={
            <motion.div
              custom="adventure"
              variants={{
                initial: { opacity: 0, scale: 0.8 },
                in: {
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.6, ease: "easeOut" }
                },
                out: {
                  opacity: 0,
                  scale: 0.9,
                  transition: { duration: 0.4, ease: "easeIn" }
                }
              }}
              initial="initial"
              animate="in"
              exit="out"
            >
              <AdventureMap />
            </motion.div>
          }
        />

        {/* Game */}
        <Route
          path="/game"
          element={
            <motion.div
              custom="game"
              variants={{
                initial: { opacity: 0, rotateY: -90 },
                in: {
                  opacity: 1,
                  rotateY: 0,
                  transition: { duration: 0.6, ease: "easeOut" }
                },
                out: {
                  opacity: 0,
                  rotateY: 90,
                  transition: { duration: 0.4, ease: "easeIn" }
                }
              }}
              initial="initial"
              animate="in"
              exit="out"
            >
              <Game />
            </motion.div>
          }
        />

        {/* AI Assistant */}
        <Route
          path="/ai-assistant"
          element={
            <motion.div
              custom="ai"
              variants={{
                initial: { opacity: 0, x: -100 },
                in: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.5, ease: "easeOut" }
                },
                out: {
                  opacity: 0,
                  x: 100,
                  transition: { duration: 0.3, ease: "easeIn" }
                }
              }}
              initial="initial"
              animate="in"
              exit="out"
            >
              <AIAssistant />
            </motion.div>
          }
        />

        {/* Level Roadmap */}
        <Route
          path="/levels"
          element={
            <motion.div
              custom="levels"
              variants={{
                initial: { opacity: 0, y: 100, scale: 0.8 },
                in: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.7, ease: "easeOut" }
                },
                out: {
                  opacity: 0,
                  y: -100,
                  scale: 0.9,
                  transition: { duration: 0.4, ease: "easeIn" }
                }
              }}
              initial="initial"
              animate="in"
              exit="out"
            >
              <LevelRoadmap user={user} />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function AppContent() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isThemeCustomizerOpen, setIsThemeCustomizerOpen] = useState(false);
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Check for existing token on app load
  useEffect(() => {
    const existingToken = localStorage.getItem('token');
    if (existingToken) {
      // Check if offline token
      if (existingToken.startsWith('offline_')) {
        // Use localStorage user data
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setToken(existingToken);
            setLoading(false);
          } catch (err) {
            console.error('Error parsing stored user:', err);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setLoading(false);
            navigate('/auth');
          }
        } else {
          localStorage.removeItem('token');
          setLoading(false);
          navigate('/auth');
        }
      } else {
        // Verify token with backend
        fetch('http://localhost:5000/api/auth/verify', {
          headers: { Authorization: `Bearer ${existingToken}` }
        })
        .then(response => response.json())
        .then(data => {
          if (data.valid) {
            setUser(data.user);
            setToken(existingToken);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/auth');
          }
        })
        .catch(() => {
          // Backend unavailable, try offline mode
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              setUser(userData);
              setToken(existingToken);
            } catch (err) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/auth');
            }
          } else {
            localStorage.removeItem('token');
            navigate('/auth');
          }
        })
        .finally(() => {
          setLoading(false);
        });
      }
    } else {
      setLoading(false);
      navigate('/auth');
    }
  }, [navigate]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    navigate('/welcome');
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
          color: "#fff",
          fontFamily: "Segoe UI, sans-serif",
        }}
      >
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "3px solid rgba(255,255,255,0.3)",
              borderTop: "3px solid #fff",
              borderRadius: "50%",
              margin: "0 auto 20px",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <p>Loading your growth journey...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Top Header with Theme and Sign Out */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          zIndex: 200,
          display: "flex",
          gap: "12px",
          padding: "20px",
        }}
      >
        {/* Theme Button */}
        <motion.button
          whileHover={{ scale: 1.05, rotate: 15 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsThemeCustomizerOpen(true)}
          style={{
            padding: "12px",
            borderRadius: "12px",
            border: `1px solid ${theme.border}`,
            background: theme.cardBg,
            backdropFilter: "blur(20px)",
            color: theme.textPrimary,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 15px ${theme.shadow}`,
            transition: "all 0.3s ease",
          }}
          title="Theme Settings"
        >
          <Palette size={20} />
        </motion.button>

        {/* Sign Out Button - Only show if user is logged in */}
        {user && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            style={{
              padding: "12px 20px",
              borderRadius: "12px",
              border: "none",
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              color: "#fff",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 15px rgba(239, 68, 68, 0.3)",
              transition: "all 0.3s ease",
            }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </motion.button>
        )}
      </motion.div>

      {/* Optional Navbar - Only show if user is logged in */}
      {user && (
        <motion.nav
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            display: "flex",
            justifyContent: "center",
            gap: "2rem",
            padding: "16px 40px",
            marginBottom: "20px",
            marginTop: "60px",
            backdropFilter: "blur(20px) saturate(180%)",
            background: theme.navBg,
            borderRadius: "18px",
            boxShadow: `0 8px 32px ${theme.shadow}`,
          }}
        >
          {[
            { to: "/", label: "🏠 Dashboard" },
            { to: "/levels", label: "⭐ Levels" },
            { to: "/leaderboard", label: "🏆 Leaderboard" },
            { to: "/profile", label: "👤 Profile" },
            { to: "/adventure", label: "🗺 Adventure" },
            { to: "/game", label: "🎮 Game" },
            { to: "/ai-assistant", label: "🤖 AI" },
          ].map((link) => (
            <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} key={link.to}>
              <Link
                to={link.to}
                style={{
                  fontWeight: 600,
                  color: theme.textPrimary,
                  textDecoration: "none",
                  fontSize: "1rem",
                  transition: "color 0.3s ease",
                }}
                onMouseEnter={(e) => (e.target.style.color = theme.accent)}
                onMouseLeave={(e) => (e.target.style.color = theme.textPrimary)}
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </motion.nav>
      )}

      {/* Theme Customizer Modal */}
      <ThemeCustomizer 
        isOpen={isThemeCustomizerOpen} 
        onClose={() => setIsThemeCustomizerOpen(false)} 
      />

      {/* Routes - All accessible without authentication */}
      <AnimatedRoutes user={user} setUser={setUser} token={token} setToken={setToken} />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
