import React, { useState } from "react";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from "./firebase";
import { useNavigate } from "react-router-dom";

export default function LoginPage({ setUser, setToken }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let result;
      if (isSignUp) {
        result = await signUpWithEmail(email, password, email.split('@')[0]);
      } else {
        result = await signInWithEmail(email, password);
      }

      if (result.error) {
        setError(result.error);
        return;
      }

      // Success - redirect to dashboard
      console.log("Login successful, navigating to /dashboard");
      navigate("/dashboard");
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await signInWithGoogle();

      if (result.error) {
        setError(result.error);
        return;
      }

      // Success - redirect to dashboard
      console.log("Google login successful, navigating to /dashboard");
      navigate("/dashboard");
    } catch (err) {
      setError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "3rem 2.5rem",
          width: "90%",
          maxWidth: "420px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
          textAlign: "center",
        }}
      >
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            marginBottom: "0.5rem",
            fontWeight: "700",
            fontSize: "1.8rem",
            color: "#333",
          }}
        >
          {isSignUp ? "Create Account 🌱" : "Welcome Back 👋"}
        </motion.h2>
        <p style={{ color: "#666", marginBottom: "1.5rem" }}>
          Track your daily growth, earn XP, and level up!
        </p>

        {error && (
          <div style={{
            padding: "0.75rem",
            marginBottom: "1rem",
            background: "#fee",
            color: "#c33",
            borderRadius: "8px",
            fontSize: "0.9rem"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} style={{ marginBottom: "1rem" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              marginBottom: "0.75rem",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "1rem",
              boxSizing: "border-box"
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              marginBottom: "1rem",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "1rem",
              boxSizing: "border-box"
            }}
          />
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            style={{
              width: "100%",
              padding: "0.8rem",
              borderRadius: "12px",
              border: "none",
              background: loading ? "#ccc" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
            }}
          >
            {loading ? "Loading..." : (isSignUp ? "Sign Up" : "Login")}
          </motion.button>
        </form>

        <div style={{ margin: "1rem 0", color: "#999", fontSize: "0.9rem" }}>or</div>

        <motion.button
          onClick={handleGoogleLogin}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            width: "100%",
            padding: "0.8rem 1rem",
            borderRadius: "12px",
            border: "1px solid #ddd",
            background: "#fff",
            color: "#333",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <FcGoogle size={24} /> Continue with Google
        </motion.button>

        <div style={{ marginTop: "1.5rem", fontSize: "0.9rem", color: "#666" }}>
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            style={{
              background: "none",
              border: "none",
              color: "#667eea",
              fontWeight: "600",
              cursor: "pointer",
              textDecoration: "underline"
            }}
          >
            {isSignUp ? "Login" : "Sign Up"}
          </button>
        </div>

        <div
          style={{
            marginTop: "1rem",
            fontSize: "0.85rem",
            color: "#999",
          }}
        >
          <p>✨ Stay consistent. Grow every day.</p>
        </div>
      </motion.div>
    </div>
  );
}
