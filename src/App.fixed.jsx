import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Palette, LogOut } from "lucide-react";
import { ThemeProvider, useTheme } from "./ThemeContext";
import ThemeCustomizer from "./ThemeCustomizer";
import LandingPage from "./components/LandingPage";
import LoginPage from "./LoginPage";
import Dashboard from "./Dashboard";
import Profile from "./ProfilePage";
import Leaderboard from "./Leaderboard";
import AdventureMap from "./AdventureMap.jsx";
import Game from "./Game";
import AIAssistant from "./AIAssistant";
import LevelRoadmap from "./LevelRoadmap";
import { onAuthStateChange, db, logout } from './firebase';
import { doc, getDoc } from "firebase/firestore";

function AnimatedRoutes({ user, setUser, token, setToken }) {
  const location = useLocation();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Theme variants for page transitions
  const pageVariants = {
    initial: { opacity: 0, scale: 0.98, y: 20 },
    in: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    out: { 
      opacity: 0, 
      scale: 1.02, 
      y: -20,
      transition: { duration: 0.4, ease: "easeIn" }
    }
  };

  // Handle sign in from LandingPage
  const handleSignIn = () => {
    console.log('Sign in clicked, navigating to /auth');
    navigate('/auth');
  };

  // Handle enter app (after sign in)
  const handleEnterApp = () => {
    console.log('Enter app clicked, user:', user);
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Landing Page */}
        <Route
          path="/"
          element={
            <motion.div
              custom="landing"
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
            >
              <LandingPage 
                user={user} 
                onSignIn={handleSignIn} 
                onEnterApp={handleEnterApp} 
              />
            </motion.div>
          }
        />

        {/* Auth Page */}
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
              <LoginPage 
                setUser={setUser} 
                setToken={setToken} 
                onSuccess={() => navigate('/dashboard')}
              />
            </motion.div>
          }
        />

        {/* Dashboard */}
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
              <Navigate to="/auth" replace />
            )
          }
        />

        {/* Other protected routes */}
        <Route 
          path="/profile" 
          element={
            user ? (
              <motion.div
                custom="profile"
                variants={pageVariants}
                initial="initial"
                animate="in"
                exit="out"
              >
                <Profile user={user} />
              </motion.div>
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
        
        <Route 
          path="/leaderboard" 
          element={
            user ? (
              <motion.div
                custom="leaderboard"
                variants={pageVariants}
                initial="initial"
                animate="in"
                exit="out"
              >
                <Leaderboard />
              </motion.div>
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />

        {/* 404 - Not Found */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function AppContent() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isThemeCustomizerOpen, setIsThemeCustomizerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  // Theme configuration - single source of truth
  const fallbackTheme = useMemo(() => ({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    cardBg: 'rgba(255, 255, 255, 0.1)',
    textPrimary: '#ffffff',
    textSecondary: '#e2e8f0',
    accent: '#fbbf24',
    accentSecondary: '#f59e0b',
    border: 'rgba(255, 255, 255, 0.2)',
    shadow: 'rgba(0, 0, 0, 0.2)',
    navBg: 'linear-gradient(135deg, rgba(102, 126, 234, 0.32), rgba(118, 75, 162, 0.2))'
  }), []);
  
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

          setUser({
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName || authUser.email.split('@')[0],
            ...(firestoreDoc.exists() ? firestoreDoc.data() : {})
          });
          
          setToken(tokenValue);
          localStorage.setItem('token', tokenValue);
        } catch (error) {
          console.error('Error during auth state change:', error);
        }
      } else {
        setUser(null);
        setToken('');
        localStorage.removeItem('token');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Navigation items
  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/profile", label: "Profile" },
    { path: "/leaderboard", label: "Leaderboard" },
    { path: "/adventure", label: "Adventure" },
    { path: "/game", label: "Game" },
    { path: "/ai-assistant", label: "AI Assistant" },
    { path: "/roadmap", label: "Level Roadmap" }
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {/* Navigation */}
      {user && (
        <motion.nav 
          className="fixed top-0 left-0 right-0 z-50 bg-opacity-80 backdrop-blur-sm"
          style={{ background: currentTheme.navBg }}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold" style={{ color: currentTheme.textPrimary }}>
              GameLife
            </Link>
            
            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="px-3 py-2 rounded-md text-sm font-medium"
                  style={{ color: currentTheme.textPrimary }}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsThemeCustomizerOpen(true)}
                className="p-2 rounded-full"
                style={{ color: currentTheme.textPrimary }}
              >
                <Palette size={20} />
              </button>
              
              {user ? (
                <button
                  onClick={async () => {
                    await logout();
                    navigate('/');
                  }}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium"
                  style={{ color: currentTheme.textPrimary }}
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              ) : (
                <Link
                  to="/auth"
                  className="px-4 py-2 rounded-md text-sm font-medium"
                  style={{
                    background: currentTheme.accent,
                    color: '#1a1a1a'
                  }}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </motion.nav>
      )}

      {/* Theme Customizer Modal */}
      <ThemeCustomizer 
        isOpen={isThemeCustomizerOpen} 
        onClose={() => setIsThemeCustomizerOpen(false)} 
      />

      {/* Main Content */}
      <div className="pt-16 min-h-screen">
        <AnimatedRoutes user={user} setUser={setUser} token={token} setToken={setToken} />
      </div>
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
