import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "./ThemeContext";
import { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword, onAuthStateChange, logout } from "./firebase";

function Auth({ setUser, setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { theme } = useTheme();

  console.log('Auth component rendering');

  // Fallback theme values in case theme context fails
  const fallbackTheme = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    cardBg: 'rgba(255, 255, 255, 0.1)',
    textPrimary: '#ffffff',
    textSecondary: '#e2e8f0',
    accent: '#fbbf24',
    accentSecondary: '#f59e0b',
    border: 'rgba(255, 255, 255, 0.2)',
    shadow: 'rgba(0, 0, 0, 0.2)',
    navBg: 'rgba(102, 126, 234, 0.9)'
  };

  const currentTheme = theme || fallbackTheme;

  // Check for existing Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        const userData = {
          _id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'User',
          photoURL: firebaseUser.photoURL
        };
        setUser(userData);
        setToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate, setUser, setToken]);

  const handleAuth = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      if (isLogin) {
        // Firebase Login
        const result = await signInWithEmail(email, password);
        
        if (result.error) {
          setMessage(result.error);
          setIsLoading(false);
          return;
        }

        const user = result.user;
        const token = await user.getIdToken();
        const userData = {
          _id: user.uid,
          email: user.email,
          name: user.displayName || 'User',
          photoURL: user.photoURL
        };

        setUser(userData);
        setToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        navigate("/");
      } else {
        // Firebase Register
        if (password.length < 6) {
          setMessage("Password must be at least 6 characters");
          setIsLoading(false);
          return;
        }

        if (!name.trim()) {
          setMessage("Name is required");
          setIsLoading(false);
          return;
        }

        const result = await signUpWithEmail(email, password, name.trim());
        
        if (result.error) {
          setMessage(result.error);
          setIsLoading(false);
          return;
        }

        const user = result.user;
        const token = await user.getIdToken();
        const userData = {
          _id: user.uid,
          email: user.email,
          name: user.displayName || name.trim(),
          photoURL: user.photoURL
        };

        setUser(userData);
        setToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        navigate("/");
      }
    } catch (err) {
      setMessage(err.message || 'Authentication failed. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const result = await signInWithGoogle();
      
      if (result.error) {
        setMessage(result.error);
        setIsLoading(false);
        return;
      }

      const user = result.user;
      const token = await user.getIdToken();
      const userData = {
        _id: user.uid,
        email: user.email,
        name: user.displayName || 'User',
        photoURL: user.photoURL
      };

      setUser(userData);
      setToken(token);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      navigate("/");
    } catch (err) {
      setMessage(err.message || 'Google sign-in failed. Please try again.');
      console.error('Google sign-in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    navigate("/auth");
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      setMessage("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const result = await resetPassword(resetEmail);
      
      if (result.error) {
        setMessage(result.error);
      } else {
        setMessage("Password reset email sent! Check your inbox.");
        setTimeout(() => {
          setShowForgotPassword(false);
          setResetEmail("");
          setNewPassword("");
          setConfirmPassword("");
          setMessage("");
        }, 3000);
      }
    } catch (error) {
      setMessage("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: currentTheme.background,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated Background Elements */}
      <div style={{
        position: "absolute", top: "15%", left: "10%", width: "250px", height: "250px",
        background: `radial-gradient(circle, ${currentTheme.accent}15 0%, transparent 70%)`,
        borderRadius: "50%", animation: "float 18s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", bottom: "15%", right: "10%", width: "200px", height: "200px",
        background: `radial-gradient(circle, ${currentTheme.accentSecondary}15 0%, transparent 70%)`,
        borderRadius: "50%", animation: "float 22s ease-in-out infinite reverse",
      }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          background: currentTheme.cardBg,
          backdropFilter: "blur(20px)",
          padding: "50px 40px",
          borderRadius: "25px",
          width: "400px",
          textAlign: "center",
          boxShadow: `0 20px 60px ${currentTheme.shadow}`,
          border: `1px solid ${currentTheme.border}`,
          position: "relative",
          zIndex: 1,
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
          style={{
            fontSize: "3rem",
            marginBottom: "20px",
            filter: "drop-shadow(0 0 15px rgba(255, 255, 255, 0.3))",
          }}
        >
          {showForgotPassword ? "🔑" : isLogin ? "👋" : "✨"}
        </motion.div>
        <h2
          style={{
            fontSize: "2rem",
            background: `linear-gradient(135deg, ${currentTheme.accent}, ${currentTheme.accentSecondary})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontWeight: "700",
            marginBottom: "10px",
            letterSpacing: "-0.5px",
          }}
        >
          {showForgotPassword ? "Reset Your Password" : isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <p style={{
          fontSize: "0.95rem",
          color: currentTheme.textSecondary,
          marginBottom: "30px",
          fontWeight: "500",
        }}>
          {showForgotPassword 
            ? "Enter your email and choose a new password" 
            : isLogin 
            ? "Sign in to continue your growth journey" 
            : "Start your journey to daily growth"}
        </p>

        {!showForgotPassword && (
          <>
            {!isLogin && (
              <motion.input
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                whileFocus={{ scale: 1.02, boxShadow: `0 0 0 3px ${currentTheme.accent}30` }}
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  marginBottom: "16px",
                  borderRadius: "12px",
                  fontSize: "0.95rem",
                  outline: "none",
                  transition: "all 0.3s ease",
                  fontWeight: "500",
                  background: currentTheme.cardBg,
                  color: currentTheme.textPrimary,
                  border: `1px solid ${currentTheme.border}`,
                }}
              />
            )}

            <motion.input
              whileFocus={{ scale: 1.02, boxShadow: `0 0 0 3px ${currentTheme.accent}30` }}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px",
                marginBottom: "16px",
                borderRadius: "12px",
                fontSize: "0.95rem",
                outline: "none",
                transition: "all 0.3s ease",
                fontWeight: "500",
                background: currentTheme.cardBg,
                color: currentTheme.textPrimary,
                border: `1px solid ${currentTheme.border}`,
              }}
            />

            <motion.input
              whileFocus={{ scale: 1.02, boxShadow: `0 0 0 3px ${currentTheme.accent}30` }}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px",
                marginBottom: "16px",
                borderRadius: "12px",
                fontSize: "0.95rem",
                outline: "none",
                transition: "all 0.3s ease",
                fontWeight: "500",
                background: currentTheme.cardBg,
                color: currentTheme.textPrimary,
                border: `1px solid ${currentTheme.border}`,
              }}
            />
          </>
        )}

        {!showForgotPassword ? (
          <>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: `0 10px 40px ${currentTheme.accent}40` }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAuth}
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                border: "none",
                background: `linear-gradient(135deg, ${currentTheme.accent}, ${currentTheme.accentSecondary})`,
                color: "#fff",
                fontWeight: "700",
                fontSize: "1.05rem",
                cursor: isLoading ? "not-allowed" : "pointer",
                letterSpacing: "0.5px",
                transition: "all 0.3s ease",
                opacity: isLoading ? 0.7 : 1,
                boxShadow: `0 8px 25px ${currentTheme.accent}30`,
              }}
            >
              {isLoading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                  <span style={{ animation: "spin 1s linear infinite" }}>⏳</span>
                  Processing...
                </span>
              ) : (
                isLogin ? "Sign In" : "Create Account"
              )}
            </motion.button>

            {isLogin && (
              <motion.p
                whileHover={{ scale: 1.02 }}
                style={{
                  marginTop: "12px",
                  cursor: "pointer",
                  color: currentTheme.textSecondary,
                  fontWeight: "500",
                  fontSize: "0.9rem",
                  transition: "all 0.3s ease",
                  textAlign: "right",
                }}
                onClick={() => {
                  setShowForgotPassword(true);
                  setMessage("");
                  setResetEmail(email);
                }}
              >
                Forgot password?
              </motion.p>
            )}

            {/* Divider */}
            <div style={{
              display: "flex",
              alignItems: "center",
              margin: "20px 0",
              gap: "10px"
            }}>
              <div style={{
                flex: 1,
                height: "1px",
                background: currentTheme.border
              }} />
              <span style={{
                color: currentTheme.textSecondary,
                fontSize: "0.85rem",
                fontWeight: "500"
              }}>or</span>
              <div style={{
                flex: 1,
                height: "1px",
                background: currentTheme.border
              }} />
            </div>

            {/* Google Sign-In Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: `1px solid ${currentTheme.border}`,
                background: currentTheme.cardBg,
                color: currentTheme.textPrimary,
                fontWeight: "600",
                fontSize: "0.95rem",
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                opacity: isLoading ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
                <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </motion.button>

            <motion.p
              whileHover={{ scale: 1.02, x: 5 }}
              style={{
                marginTop: "20px",
                cursor: "pointer",
                color: currentTheme.accent,
                fontWeight: "600",
                fontSize: "0.95rem",
                transition: "all 0.3s ease",
              }}
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage("");
              }}
            >
              {isLogin ? "Don't have an account? Sign up →" : "Already have an account? Sign in →"}
            </motion.p>
          </>
        ) : (
          <>
            <motion.input
              whileFocus={{ scale: 1.02, boxShadow: `0 0 0 3px ${currentTheme.accent}30` }}
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px",
                marginBottom: "16px",
                borderRadius: "12px",
                fontSize: "0.95rem",
                outline: "none",
                transition: "all 0.3s ease",
                fontWeight: "500",
                background: currentTheme.cardBg,
                color: currentTheme.textPrimary,
                border: `1px solid ${currentTheme.border}`,
              }}
            />

            <motion.input
              whileFocus={{ scale: 1.02, boxShadow: `0 0 0 3px ${currentTheme.accent}30` }}
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px",
                marginBottom: "16px",
                borderRadius: "12px",
                fontSize: "0.95rem",
                outline: "none",
                transition: "all 0.3s ease",
                fontWeight: "500",
                background: currentTheme.cardBg,
                color: currentTheme.textPrimary,
                border: `1px solid ${currentTheme.border}`,
              }}
            />

            <motion.input
              whileFocus={{ scale: 1.02, boxShadow: `0 0 0 3px ${currentTheme.accent}30` }}
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px",
                marginBottom: "16px",
                borderRadius: "12px",
                fontSize: "0.95rem",
                outline: "none",
                transition: "all 0.3s ease",
                fontWeight: "500",
                background: currentTheme.cardBg,
                color: currentTheme.textPrimary,
                border: `1px solid ${currentTheme.border}`,
              }}
            />

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: `0 10px 40px ${currentTheme.accent}40` }}
              whileTap={{ scale: 0.95 }}
              onClick={handleForgotPassword}
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                border: "none",
                background: `linear-gradient(135deg, ${currentTheme.accent}, ${currentTheme.accentSecondary})`,
                color: "#fff",
                fontWeight: "700",
                fontSize: "1.05rem",
                cursor: isLoading ? "not-allowed" : "pointer",
                letterSpacing: "0.5px",
                transition: "all 0.3s ease",
                opacity: isLoading ? 0.7 : 1,
                boxShadow: `0 8px 25px ${currentTheme.accent}30`,
              }}
            >
              {isLoading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                  <span style={{ animation: "spin 1s linear infinite" }}>⏳</span>
                  Resetting...
                </span>
              ) : (
                "Reset Password"
              )}
            </motion.button>

            <motion.p
              whileHover={{ scale: 1.02, x: -5 }}
              style={{
                marginTop: "20px",
                cursor: "pointer",
                color: currentTheme.accent,
                fontWeight: "600",
                fontSize: "0.95rem",
                transition: "all 0.3s ease",
              }}
              onClick={() => {
                setShowForgotPassword(false);
                setMessage("");
                setResetEmail("");
                setNewPassword("");
                setConfirmPassword("");
              }}
            >
              ← Back to Sign In
            </motion.p>
          </>
        )}

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: "15px",
              padding: "12px",
              borderRadius: "10px",
              background: message.includes("sent") || message.includes("Check") 
                ? "rgba(34, 197, 94, 0.1)" 
                : "rgba(239, 68, 68, 0.1)",
              border: message.includes("sent") || message.includes("Check") 
                ? "1px solid rgba(34, 197, 94, 0.3)" 
                : "1px solid rgba(239, 68, 68, 0.3)",
              fontSize: "0.9rem",
              color: message.includes("sent") || message.includes("Check") 
                ? "#22c55e" 
                : "#ef4444",
              fontWeight: "500",
            }}
          >
            {message.includes("sent") || message.includes("Check") ? "✅" : "⚠️"} {message}
          </motion.div>
        )}
      </motion.div>

      {/* Floating Animation Keyframes */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0); }
            25% { transform: translateY(-20px) translateX(10px); }
            50% { transform: translateY(-10px) translateX(-10px); }
            75% { transform: translateY(-30px) translateX(5px); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default Auth;