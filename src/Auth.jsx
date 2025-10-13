import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { useTheme } from "./ThemeContext";

function Auth({ setUser, setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const API_URL = 'http://localhost:5000/api/auth';

  // Check for existing token on component load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token with backend
      axios.get(`${API_URL}/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        setUser(response.data.user);
        setToken(token);
        navigate("/");
      })
      .catch(() => {
        localStorage.removeItem('token');
      });
    }
  }, []);

  const handleAuth = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      if (isLogin) {
        // Login - Try backend first, fallback to localStorage
        try {
          const response = await axios.post(`${API_URL}/login`, { email, password });
          const { user, token } = response.data;
          setUser(user);
          setToken(token);
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          navigate("/");
        } catch (backendError) {
          // Backend unavailable - use localStorage fallback
          console.log('Backend unavailable, using localStorage authentication');
          const storedUsers = JSON.parse(localStorage.getItem('offline_users') || '[]');
          const foundUser = storedUsers.find(u => u.email === email && u.password === password);
          
          if (foundUser) {
            const mockToken = 'offline_' + Date.now();
            const userData = {
              _id: foundUser.id,
              email: foundUser.email,
              name: foundUser.name,
              level: foundUser.level || 1,
              xp: foundUser.xp || 0,
              streak: foundUser.streak || 0,
              tasksCompleted: foundUser.tasksCompleted || 0
            };
            setUser(userData);
            setToken(mockToken);
            localStorage.setItem('token', mockToken);
            localStorage.setItem('user', JSON.stringify(userData));
            navigate("/");
          } else {
            setMessage("Invalid email or password. Please try again or create an account.");
          }
        }
      } else {
        // Register
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

        // Try backend first, fallback to localStorage
        try {
          const response = await axios.post(`${API_URL}/register`, { 
            email, 
            password, 
            name: name.trim() 
          });
          const { user, token } = response.data;
          setUser(user);
          setToken(token);
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          navigate("/");
        } catch (backendError) {
          // Backend unavailable - use localStorage fallback
          console.log('Backend unavailable, creating offline account');
          const storedUsers = JSON.parse(localStorage.getItem('offline_users') || '[]');
          
          // Check if email already exists
          if (storedUsers.find(u => u.email === email)) {
            setMessage("Email already registered. Please sign in.");
            setIsLoading(false);
            return;
          }

          const newUser = {
            id: 'offline_' + Date.now(),
            email,
            password, // In production, this should be hashed
            name: name.trim(),
            level: 1,
            xp: 0,
            streak: 0,
            tasksCompleted: 0,
            createdAt: new Date().toISOString()
          };

          storedUsers.push(newUser);
          localStorage.setItem('offline_users', JSON.stringify(storedUsers));

          const mockToken = 'offline_' + Date.now();
          const userData = {
            _id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            level: 1,
            xp: 0,
            streak: 0,
            tasksCompleted: 0
          };
          
          setUser(userData);
          setToken(mockToken);
          localStorage.setItem('token', mockToken);
          localStorage.setItem('user', JSON.stringify(userData));
          navigate("/");
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Authentication failed. Please try again.';
      setMessage(errorMessage);
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    navigate("/auth");
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
      }}
    >
      {/* Animated Background Elements */}
      <div style={{
        position: "absolute", top: "15%", left: "10%", width: "250px", height: "250px",
        background: `radial-gradient(circle, ${theme.accent}15 0%, transparent 70%)`,
        borderRadius: "50%", animation: "float 18s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", bottom: "15%", right: "10%", width: "200px", height: "200px",
        background: `radial-gradient(circle, ${theme.accentSecondary}15 0%, transparent 70%)`,
        borderRadius: "50%", animation: "float 22s ease-in-out infinite reverse",
      }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          background: theme.cardBg,
          backdropFilter: "blur(20px)",
          padding: "50px 40px",
          borderRadius: "25px",
          width: "400px",
          textAlign: "center",
          boxShadow: `0 20px 60px ${theme.shadow}`,
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
          {isLogin ? "👋" : "✨"}
        </motion.div>
        <h2
          style={{
            fontSize: "2rem",
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentSecondary})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontWeight: "700",
            marginBottom: "10px",
            letterSpacing: "-0.5px",
          }}
        >
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <p style={{
          fontSize: "0.95rem",
          color: theme.textSecondary,
          marginBottom: "30px",
          fontWeight: "500",
        }}>
          {isLogin ? "Sign in to continue your growth journey" : "Start your journey to daily growth"}
        </p>

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
              padding: "14px 16px",
              marginBottom: "16px",
              borderRadius: "12px",
              fontSize: "0.95rem",
              outline: "none",
              transition: "all 0.3s ease",
              fontWeight: "500",
              background: theme.cardBg,
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
            padding: "14px 16px",
            marginBottom: "16px",
            borderRadius: "12px",
            fontSize: "0.95rem",
            outline: "none",
            transition: "all 0.3s ease",
            fontWeight: "500",
            background: theme.cardBg,
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
            padding: "14px 16px",
            marginBottom: "16px",
            borderRadius: "12px",
            fontSize: "0.95rem",
            outline: "none",
            transition: "all 0.3s ease",
            fontWeight: "500",
            background: theme.cardBg,
            color: theme.textPrimary,
            border: `1px solid ${theme.border}`,
          }}
        />

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: `0 10px 40px ${theme.accent}40` }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAuth}
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "12px",
            border: "none",
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentSecondary})`,
            color: "#fff",
            fontWeight: "700",
            fontSize: "1.05rem",
            cursor: isLoading ? "not-allowed" : "pointer",
            letterSpacing: "0.5px",
            transition: "all 0.3s ease",
            opacity: isLoading ? 0.7 : 1,
            boxShadow: `0 8px 25px ${theme.accent}30`,
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


        <motion.p
          whileHover={{ scale: 1.02, x: 5 }}
          style={{
            marginTop: "20px",
            cursor: "pointer",
            color: theme.accent,
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

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: "15px",
              padding: "12px",
              borderRadius: "10px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              fontSize: "0.9rem",
              color: "#ef4444",
              fontWeight: "500",
            }}
          >
            ⚠️ {message}
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