import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { signInWithEmail, signUpWithEmail, resetPassword, onAuthStateChange } from './firebase';
import { useTheme } from "./ThemeContext";

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

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        // User is signed in
        setUser(user);
        user.getIdToken().then(token => {
          setToken(token);
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
        });
      } else {
        // User is signed out
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    });

    return () => unsubscribe();
  }, [setUser, setToken]);

  const [authStatus, setAuthStatus] = useState('idle'); // idle, loading, success, error

  const handleAuth = async () => {
    setIsLoading(true);
    setMessage("");
    setAuthStatus('loading');

    try {
      let result;
      if (isLogin) {
        result = await signInWithEmail(email, password);
      } else {
        // Register
        if (password.length < 6) {
          setMessage("❌ Password must be at least 6 characters");
          setAuthStatus('error');
          setIsLoading(false);
          return;
        }

        if (!name.trim()) {
          setMessage("❌ Name is required");
          setAuthStatus('error');
          setIsLoading(false);
          return;
        }

        result = await signUpWithEmail(email, password, name.trim());
      }

      if (result.error) {
        setMessage(result.error);
        setAuthStatus('error');
      } else {
        setAuthStatus('success');
        setMessage(isLogin ? "✅ Welcome back! Redirecting..." : "✅ Account created successfully! Redirecting...");

        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      }
    } catch (err) {
      setMessage('❌ Authentication failed. Please check your connection and try again.');
      setAuthStatus('error');
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
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
        setMessage("✅ Password reset email sent! Check your inbox.");
        setTimeout(() => {
          setShowForgotPassword(false);
          setResetEmail("");
          setMessage("");
        }, 3000);
      }
    } catch (error) {
      setMessage("❌ Failed to send reset email. Please try again.");
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
        background: theme.background,
        position: "relative",
        overflow: "hidden",
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Enhanced Animated Background Elements */}
      <div style={{
        position: "absolute",
        top: "10%",
        left: "5%",
        width: "300px",
        height: "300px",
        background: `radial-gradient(circle at 30% 20%, ${theme.accent}25 0%, ${theme.accentSecondary}15 40%, transparent 70%)`,
        borderRadius: "50%",
        animation: "float 40s ease-in-out infinite",
        filter: "blur(120px)",
      }} />
      <div style={{
        position: "absolute",
        bottom: "10%",
        right: "5%",
        width: "250px",
        height: "250px",
        background: `radial-gradient(circle at 70% 80%, ${theme.accentSecondary}25 0%, ${theme.accent}15 40%, transparent 70%)`,
        borderRadius: "50%",
        animation: "float 45s ease-in-out infinite reverse",
        filter: "blur(120px)",
      }} />
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "400px",
        height: "400px",
        background: `conic-gradient(from 0deg, ${theme.accent}10, ${theme.accentSecondary}10, transparent, ${theme.accent}10)`,
        borderRadius: "50%",
        animation: "rotate 60s linear infinite",
        filter: "blur(120px)",
      }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          background: theme.background === '#121212' ? 'rgba(30, 30, 30, 0.25)' : 'rgba(250, 250, 250, 0.3)',
          backdropFilter: "blur(40px) saturate(150%)",
          WebkitBackdropFilter: "blur(40px) saturate(150%)",
          padding: "50px 45px",
          borderRadius: "28px",
          width: "420px",
          textAlign: "center",
          boxShadow: '0 16px 60px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${theme.border}`,
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
            fontSize: "2.25rem",
            background: 'none',
            WebkitBackgroundClip: 'unset',
            WebkitTextFillColor: 'unset',
            backgroundClip: 'unset',
            color: theme.textPrimary,
            fontWeight: "700",
            marginBottom: "10px",
            letterSpacing: "-0.5px",
          }}
        >
          {showForgotPassword ? "Reset Password" : isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <p style={{
          fontSize: "1rem",
          color: theme.textSecondary,
          marginBottom: "35px",
          fontWeight: "400",
          maxWidth: '300px',
          margin: '0 auto 35px auto'
        }}>
          {showForgotPassword
            ? "Enter your email and we'll send you a reset link"
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
                whileFocus={{ scale: 1.02, boxShadow: `0 0 0 3px ${theme.accent}30` }}
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "16px",
                  marginBottom: "16px",
                  borderRadius: "14px",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "all 0.3s ease",
                  fontWeight: "500",
                  background: theme.background === '#121212' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.04)',
                  color: theme.textPrimary,
                  border: `1px solid ${theme.border}`,
                }}
              />
            )}

            <motion.input
              whileFocus={{ scale: 1.02, boxShadow: `0 0 0 3px ${theme.accent}30` }}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "16px",
                marginBottom: "16px",
                borderRadius: "14px",
                fontSize: "1rem",
                outline: "none",
                transition: "all 0.3s ease",
                fontWeight: "500",
                background: theme.background === '#121212' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.04)',
                color: theme.textPrimary,
                border: `1px solid ${theme.border}`,
              }}
            />

            <motion.input
              whileFocus={{ scale: 1.02, boxShadow: `0 0 0 3px ${theme.accent}30` }}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "16px",
                marginBottom: "16px",
                borderRadius: "14px",
                fontSize: "1rem",
                outline: "none",
                transition: "all 0.3s ease",
                fontWeight: "500",
                background: theme.background === '#121212' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.04)',
                color: theme.textPrimary,
                border: `1px solid ${theme.border}`,
              }}
            />
          </>
        )}

        {!showForgotPassword ? (
          <>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: `0 10px 40px ${theme.accent}40` }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAuth}
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "14px",
                border: "none",
                background: theme.accent,
                color: "#fff",
                fontWeight: "600",
                fontSize: "1rem",
                cursor: isLoading ? "not-allowed" : "pointer",
                letterSpacing: "0.5px",
                transition: "all 0.3s ease",
                opacity: isLoading ? 0.7 : 1,
                boxShadow: `0 5px 20px ${theme.accent}30`,
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
                  color: theme.textSecondary,
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

            <motion.p
              whileHover={{ scale: 1.02, x: 5 }}
              style={{
                marginTop: "20px",
                cursor: "pointer",
                color: theme.accent,
                fontWeight: "500",
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
              whileFocus={{ scale: 1.02, boxShadow: `0 0 0 3px ${theme.accent}30` }}
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "16px",
                marginBottom: "16px",
                borderRadius: "14px",
                fontSize: "1rem",
                outline: "none",
                transition: "all 0.3s ease",
                fontWeight: "500",
                background: theme.background === '#121212' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.04)',
                color: theme.textPrimary,
                border: `1px solid ${theme.border}`,
              }}
            />

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: `0 10px 40px ${theme.accent}40` }}
              whileTap={{ scale: 0.95 }}
              onClick={handleForgotPassword}
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "14px",
                border: "none",
                background: theme.accent,
                color: "#fff",
                fontWeight: "600",
                fontSize: "1rem",
                cursor: isLoading ? "not-allowed" : "pointer",
                letterSpacing: "0.5px",
                transition: "all 0.3s ease",
                opacity: isLoading ? 0.7 : 1,
                boxShadow: `0 5px 20px ${theme.accent}30`,
              }}
            >
              {isLoading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                  <span style={{ animation: "spin 1s linear infinite" }}>⏳</span>
                  Sending Reset Email...
                </span>
              ) : (
                "Send Reset Email"
              )}
            </motion.button>

            <motion.p
              whileHover={{ scale: 1.02, x: -5 }}
              style={{
                marginTop: "20px",
                cursor: "pointer",
                color: theme.accent,
                fontWeight: "500",
                fontSize: "0.95rem",
                transition: "all 0.3s ease",
              }}
              onClick={() => {
                setShowForgotPassword(false);
                setMessage("");
                setResetEmail("");
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
              borderRadius: "12px",
              background: message.includes("✅")
                ? "rgba(34, 197, 94, 0.15)"
                : "rgba(239, 68, 68, 0.15)",
              border: "none",
              fontSize: "0.95rem",
              color: message.includes("✅")
                ? "#22c55e"
                : "#ef4444",
              fontWeight: "500",
            }}
          >
            {message}
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
          @keyframes particle {
            0%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
            25% { transform: translateY(-15px) scale(1.1); opacity: 1; }
            50% { transform: translateY(-5px) scale(0.9); opacity: 0.8; }
            75% { transform: translateY(-20px) scale(1.05); opacity: 0.9; }
          }
          @keyframes rotate {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default Auth;


















