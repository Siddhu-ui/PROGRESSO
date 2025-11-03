import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider } from "./ThemeContext";
import LandingPage from "./components/LandingPage";
import Auth from "./Auth";
import Dashboard from "./Dashboard";
import { onAuthStateChange, logout } from './firebase';

// AppRoutes component handles all routing
function AppRoutes({ user, setUser }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Page transition animations
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    out: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.2, ease: 'easeIn' }
    }
  };

  // Handle successful authentication
  const handleAuthSuccess = () => {
    navigate('/dashboard');
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
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
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              className="min-h-screen"
            >
              <LandingPage onGetStarted={() => navigate('/auth')} />
            </motion.div>
          }
        />

        {/* Auth Page */}
        <Route
          path="/auth"
          element={
            !user ? (
              <motion.div
                variants={pageVariants}
                initial="initial"
                animate="in"
                exit="out"
                className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"
              >
                <Auth onSuccess={handleAuthSuccess} />
              </motion.div>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        {/* Dashboard - Protected Route */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <motion.div
                variants={pageVariants}
                initial="initial"
                animate="in"
                exit="out"
                className="min-h-screen bg-gray-50 dark:bg-gray-900"
              >
                <Dashboard user={user} onLogout={handleLogout} />
              </motion.div>
            ) : (
              <Navigate to="/auth" replace state={{ from: '/dashboard' }} />
            )
          }
        />

        {/* Catch all other routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

// AppContent manages authentication state
function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check auth state when component mounts
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <AppRoutes user={user} setUser={setUser} />
    </div>
  );
}

// Main App component
function App() {
  return (
    <Router>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Router>
  );
}

export default App;
