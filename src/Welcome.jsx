import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";

function Welcome() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: theme.background,
        color: theme.textPrimary,
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated Background Elements */}
      <div style={{
        position: "absolute", top: "10%", left: "5%", width: "300px", height: "300px",
        background: `radial-gradient(circle, ${theme.accent}15 0%, transparent 70%)`,
        borderRadius: "50%", animation: "float 20s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", bottom: "10%", right: "8%", width: "250px", height: "250px",
        background: `radial-gradient(circle, ${theme.accentSecondary}15 0%, transparent 70%)`,
        borderRadius: "50%", animation: "float 25s ease-in-out infinite reverse",
      }} />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          textAlign: "center",
          maxWidth: "800px",
          zIndex: 1,
        }}
      >
        {/* Logo/Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ duration: 1, delay: 0.2, type: "spring" }}
          style={{
            fontSize: "5rem",
            marginBottom: "30px",
            filter: "drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))",
          }}
        >
          🌟
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{
            fontSize: "3.5rem",
            fontWeight: "900",
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentSecondary})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "20px",
            letterSpacing: "-1px",
          }}
        >
          Daily Growth Tracker
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          style={{
            fontSize: "1.4rem",
            color: theme.textSecondary,
            marginBottom: "50px",
            lineHeight: "1.6",
            fontWeight: "500",
          }}
        >
          Transform your daily habits into extraordinary achievements.
          <br />
          Track progress, earn XP, and level up your life! 🚀
        </motion.p>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "50px",
          }}
        >
          {[
            { icon: "📊", text: "Track Progress" },
            { icon: "🔥", text: "Build Streaks" },
            { icon: "🏆", text: "Earn Rewards" },
            { icon: "🎯", text: "Achieve Goals" },
          ].map((feature, index) => (
            <motion.div
              key={feature.text}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              style={{
                background: theme.cardBg,
                backdropFilter: "blur(20px)",
                padding: "20px 30px",
                borderRadius: "20px",
                border: `1px solid ${theme.border}`,
                boxShadow: `0 8px 32px ${theme.shadow}`,
                display: "flex",
                alignItems: "center",
                gap: "12px",
                minWidth: "160px",
              }}
            >
              <span style={{ fontSize: "2rem" }}>{feature.icon}</span>
              <span style={{ fontSize: "1rem", fontWeight: "600", color: theme.textPrimary }}>
                {feature.text}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          style={{
            display: "flex",
            gap: "20px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: `0 10px 40px ${theme.accent}40` }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/auth")}
            style={{
              padding: "18px 40px",
              fontSize: "1.2rem",
              fontWeight: "700",
              borderRadius: "15px",
              border: "none",
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentSecondary})`,
              color: "#fff",
              cursor: "pointer",
              boxShadow: `0 8px 25px ${theme.accent}30`,
              transition: "all 0.3s ease",
            }}
          >
            Get Started 🚀
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            style={{
              padding: "18px 40px",
              fontSize: "1.2rem",
              fontWeight: "700",
              borderRadius: "15px",
              border: `2px solid ${theme.border}`,
              background: theme.cardBg,
              backdropFilter: "blur(20px)",
              color: theme.textPrimary,
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            Explore Dashboard
          </motion.button>
        </motion.div>

        {/* Additional Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          style={{
            marginTop: "40px",
            fontSize: "0.95rem",
            color: theme.textSecondary,
            fontWeight: "500",
          }}
        >
          Join thousands of users transforming their lives, one day at a time ✨
        </motion.p>
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
        `}
      </style>
    </div>
  );
}

export default Welcome;
