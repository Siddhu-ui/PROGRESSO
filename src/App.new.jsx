import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import { AnimatePresence, motion } from "framer-motion";
import { Palette, LogOut } from "lucide-react";
import { ThemeProvider, useTheme } from "./ThemeContext";
import ThemeCustomizer from "./ThemeCustomizer";
import Welcome from "./Welcome";
// Removed Auth (not used)
import LoginPage from "./LoginPage";
import Dashboard from "./Dashboard";
import Profile from "./ProfilePage"; // Make sure this is unused if Dashboard handles it
import Leaderboard from "./Leaderboard"; // Make sure this is unused if Dashboard handles it
import AdventureMap from "./AdventureMap.jsx"; // Make sure this is unused if Dashboard handles it
import Game from "./Game"; // Make sure this is unused if Dashboard handles it
import AIAssistant from "./AIAssistant"; // Make sure this is unused if Dashboard handles it
import LevelRoadmap from "./LevelRoadmap"; // Make sure this is unused if Dashboard handles it
import { onAuthStateChange, db, logout } from './firebase';
import { doc, getDoc } from "firebase/firestore";

// --- NEW: We will create this component next ---
// import InvitePage from "./InvitePage"; 

// --- This component holds all the animated routes ---
function AnimatedRoutes({ user, setUser, token, setToken }) {
  const location = useLocation(); // Added location for AnimatePresence

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
        {/* Welcome Page (NEW LANDING PAGE) */}
        <Route
          path="/"
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
        
        {/* Redirect old /welcome to new root / */}
        <Route path="/welcome" element={<Navigate to="/" replace />} />

        {/* Dashboard - (NEW PATH & PROTECTED) */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <motion.div
                custom="dashboard"
                variants={pageVariants}
                initial="initial"
                animate="in"
                exit="out"
              >
                <Dashboard user={user} setUser={setUser} token={token} setToken={setToken} />
              </motion.div>
            ) : (
              <Navigate to="/auth" state={{ from: location }} replace />
            )
          }
        />

        {/* Auth - (PROTECTED from logged-in users) */}
        <Route
          path="/auth"
          element={
            !user ? (
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
                <LoginPage setUser={setUser} setToken={setToken} />
              </motion.div>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        {/* --- NEW: INVITE ROUTE --- */}
        <Route
          path="/invite/:inviteId"
          element={
            !user ? (
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
                {/* This will show the login page.
                  We can create a new <InvitePage /> component later.
                */}
                <LoginPage setUser={setUser} setToken={setToken} isInvite={true} />
              </motion.div>
            ) : (
              <Navigate to="/dashboard" replace /> // If already logged in, just go to dashboard
            )
          }
        />

        {/* NOTE: Your Profile, Leaderboard, etc. are all inside your Dashboard component,
          so we don't need separate routes for them here. This is correct.
        */}

        {/* Fallback route - if no other route matches, go to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
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

  console.log('AppContent rendering, loading:', loading, 'user:', user);

  const fallbackTheme = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    cardBg: 'rgba(255, 255, 255, 0.1)',
    textPrimary: '#ffffff',
    textSecondary: '#e2e8f0',
    accent: '#fbbf24',
    accentSecondary: '#f59e0b',
    border: 'rgba(255, 255, 255, 0.2)',
    shadow: 'rgba(0, 0, 0, 0.2)',
    navBg: 'linear-gradient(135deg, rgba(102, 126, 234, 0.32), rgba(118, 75, 162, 0.2))'
  };

  const currentTheme = theme || fallbackTheme;

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (authUser) => {
      if (authUser) {
        try {
          const [tokenValue, firestoreDoc] = await Promise.all([
            authUser.getIdToken(),
            getDoc(doc(db, 'users', authUser.uid))
          ]);

          const firestoreData = firestoreDoc.exists() ? firestoreDoc.data() : {};
          const existingLocalUser = JSON.parse(localStorage.getItem('user') || '{}');

          const mergedUser = {
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName,
            photoURL: authUser.photoURL,
            xp: firestoreData.xp ?? existingLocalUser.xp ?? 0,
            level: firestoreData.level ?? existingLocalUser.level ?? 1,
            tasksCompleted: firestoreData.tasksCompleted ?? existingLocalUser.tasksCompleted ?? 0,
            streak: firestoreData.streak ?? existingLocalUser.streak ?? 0,
            mindfulMinutes: firestoreData.mindfulMinutes ?? existingLocalUser.mindfulMinutes ?? 0,
            skillsUnlocked: firestoreData.skillsUnlocked ?? existingLocalUser.skillsUnlocked ?? 0,
            last_updated: firestoreData.last_updated ?? existingLocalUser.last_updated ?? null,
            createdAt: firestoreData.createdAt ?? existingLocalUser.createdAt ?? null,
            // Ensure username is set for the invite link
            username: firestoreData.username || authUser.displayName || authUser.email?.split('@')[0] || 'explorer'
          };

          setUser(mergedUser);
          setToken(tokenValue);

          localStorage.setItem('token', tokenValue);
          localStorage.setItem('user', JSON.stringify(mergedUser));
        } catch (err) {
          console.error('Failed to hydrate user profile:', err);
          const fallbackToken = await authUser.getIdToken();
          const fallbackUser = {
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName,
            photoURL: authUser.photoURL,
          };
          setUser(fallbackUser);
          setToken(fallbackToken);
          localStorage.setItem('token', fallbackToken);
          localStorage.setItem('user', JSON.stringify(fallbackUser));
        }
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]); // Added navigate as a dependency

  // Logout function
  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/');
    }
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
            border: `1px solid ${currentTheme.border}`,
            background: currentTheme.cardBg,
            backdropFilter: "blur(20px)",
            color: currentTheme.textPrimary,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 15px ${currentTheme.shadow}`,
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

      {/* Theme Customizer Modal */}
      <ThemeCustomizer 
        isOpen={isThemeCustomizerOpen} 
        onClose={() => setIsThemeCustomizerOpen(false)} 
      />

      {/* --- RENDER THE ROUTES --- */}
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