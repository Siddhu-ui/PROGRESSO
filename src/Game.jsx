import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaFire, FaStar, FaGamepad, FaBolt, FaMedal } from 'react-icons/fa';
import { useTheme } from './ThemeContext';

function Game() {
  const { theme } = useTheme();
  const currentTheme = theme || {};
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [targets, setTargets] = useState([]);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lastHitTime, setLastHitTime] = useState(0);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [particles, setParticles] = useState([]);
  const [topScores, setTopScores] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [newHighScore, setNewHighScore] = useState(false);

  useEffect(() => {
    const savedHighScore = localStorage.getItem('gameHighScore');
    const savedTopScores = localStorage.getItem('gameTopScores');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
    if (savedTopScores) {
      setTopScores(JSON.parse(savedTopScores));
    }
  }, []);

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, gameActive]);

  useEffect(() => {
    if (gameActive) {
      const interval = setInterval(() => {
        spawnTarget();
      }, 800);
      return () => clearInterval(interval);
    }
  }, [gameActive]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameActive(true);
    setTargets([]);
  };

  const endGame = async () => {
    setGameActive(false);
    setTargets([]);
    setCombo(0);
    
    // Check for new high score
    const isNewHigh = score > highScore;
    if (isNewHigh) {
      setHighScore(score);
      setNewHighScore(true);
      localStorage.setItem('gameHighScore', score.toString());
    }

    // Update top scores
    const newTopScores = [...topScores, score].sort((a, b) => b - a).slice(0, 3);
    setTopScores(newTopScores);
    localStorage.setItem('gameTopScores', JSON.stringify(newTopScores));

    // Add XP based on score
    const xpEarned = Math.floor(score / 10);
    if (xpEarned > 0) {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await fetch('http://localhost:5000/api/users/add-xp', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ xp: xpEarned }),
          });
        }
      } catch (error) {
        console.error('Error adding XP:', error);
      }
    }
  };

  const spawnTarget = () => {
    const id = Date.now() + Math.random();
    const x = Math.random() * 80 + 5; // 5-85%
    const y = Math.random() * 70 + 10; // 10-80%
    const size = Math.random() * 40 + 40; // 40-80px
    const emoji = ['🎯', '⭐', '💎', '🔥', '⚡', '🏆'][Math.floor(Math.random() * 6)];
    
    setTargets(prev => [...prev, { id, x, y, size, emoji }]);

    setTimeout(() => {
      setTargets(prev => prev.filter(t => t.id !== id));
    }, 1500);
  };

  const hitTarget = (targetId, size, x, y) => {
    const target = targets.find(t => t.id === targetId);
    if (!target) return;

    setTargets(prev => prev.filter(t => t.id !== targetId));
    
    // Calculate points with combo multiplier
    const basePoints = Math.floor(100 / size * 40);
    const now = Date.now();
    const timeSinceLastHit = now - lastHitTime;
    
    // Combo logic: if hit within 1 second, increase combo
    let newCombo = combo;
    if (timeSinceLastHit < 1000 && combo < 10) {
      newCombo = combo + 1;
      setCombo(newCombo);
    } else if (timeSinceLastHit >= 1000) {
      newCombo = 1;
      setCombo(1);
    }
    
    const multiplier = 1 + (newCombo - 1) * 0.2; // 20% bonus per combo
    const finalPoints = Math.floor(basePoints * multiplier);
    setScore(score + finalPoints);
    setLastHitTime(now);

    // Add floating text
    addFloatingText(`+${finalPoints}`, x, y, newCombo > 1);

    // Add particles
    createParticles(x, y, target.emoji);

    // Play sound effect (placeholder)
    // playSound('hit');
  };

  const addFloatingText = (text, x, y, isCombo) => {
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, text, x, y, isCombo }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 1000);
  };

  const createParticles = (x, y, emoji) => {
    const particleCount = 8;
    const newParticles = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = 2 + Math.random() * 2;
      newParticles.push({
        id: Date.now() + Math.random(),
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        emoji,
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 800);
  };

  const containerStyle = {
    ...styles.container,
    background: currentTheme.background || styles.container.background,
    color: currentTheme.textPrimary || styles.container.color,
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <FaGamepad /> Quick Tap Game
        </h1>
        <p style={styles.subtitle}>Click the targets as fast as you can!</p>
      </div>

      {/* Game Stats */}
      <div style={styles.statsContainer}>
        <motion.div 
          style={styles.statBox}
          whileHover={{ scale: 1.05 }}
        >
          <FaStar size={30} color="#fbbf24" />
          <div>
            <motion.div 
              key={score}
              initial={{ scale: 1.5, color: '#fbbf24' }}
              animate={{ scale: 1, color: '#ffffff' }}
              style={styles.statValue}
            >
              {score}
            </motion.div>
            <div style={styles.statLabel}>Score</div>
          </div>
        </motion.div>

        <motion.div 
          style={styles.statBox}
          whileHover={{ scale: 1.05 }}
        >
          <FaFire size={30} color={timeLeft <= 5 ? '#ef4444' : '#f59e0b'} />
          <div>
            <div style={styles.statValue}>{timeLeft}s</div>
            <div style={styles.statLabel}>Time Left</div>
            {/* Time Progress Bar */}
            {gameActive && (
              <div style={styles.timeBarBg}>
                <motion.div
                  style={{
                    ...styles.timeBarFill,
                    background: timeLeft <= 5 ? '#ef4444' : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                  }}
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / 30) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          style={styles.statBox}
          whileHover={{ scale: 1.05 }}
        >
          <FaTrophy size={30} color="#10b981" />
          <div>
            <div style={styles.statValue}>{highScore}</div>
            <div style={styles.statLabel}>High Score</div>
          </div>
        </motion.div>

        {/* Combo Indicator */}
        <AnimatePresence>
          {combo > 1 && gameActive && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              style={styles.comboBox}
            >
              <FaBolt size={24} color="#fbbf24" />
              <div>
                <div style={styles.comboValue}>x{combo}</div>
                <div style={styles.comboLabel}>COMBO!</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Game Area */}
      <div style={styles.gameArea}>
        {!gameActive ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.startScreen}
          >
            {newHighScore && score > 0 && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                style={styles.newHighScoreBanner}
              >
                <FaTrophy size={40} color="#fbbf24" />
                <h2>NEW HIGH SCORE!</h2>
              </motion.div>
            )}
            
            <h2 style={styles.startTitle}>
              {score > 0 ? `Game Over! Score: ${score}` : 'Ready to Play?'}
            </h2>
            
            {score > 0 && (
              <motion.p 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={styles.xpEarned}
              >
                You earned {Math.floor(score / 10)} XP! 🎉
              </motion.p>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(139, 92, 246, 0.6)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setNewHighScore(false);
                startGame();
              }}
              style={styles.startButton}
            >
              {score > 0 ? 'Play Again' : 'Start Game'}
            </motion.button>

            {/* Top Scores */}
            {topScores.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={styles.topScoresContainer}
              >
                <h3 style={styles.topScoresTitle}>
                  <FaMedal color="#fbbf24" /> Top Scores
                </h3>
                {topScores.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    style={styles.topScoreItem}
                  >
                    <span style={styles.topScoreRank}>#{i + 1}</span>
                    <span style={styles.topScoreValue}>{s}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
            
            <div style={styles.instructions}>
              <h3>How to Play:</h3>
              <p>• Click targets before they disappear</p>
              <p>• Smaller targets = More points</p>
              <p>• Hit targets quickly for combo bonuses!</p>
              <p>• 30 seconds to get the highest score</p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Targets */}
            <AnimatePresence>
              {targets.map(target => (
                <motion.div
                  key={target.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: 1,
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.15 }}
                  onClick={() => hitTarget(target.id, target.size, target.x, target.y)}
                  style={{
                    ...styles.target,
                    left: `${target.x}%`,
                    top: `${target.y}%`,
                    width: `${target.size}px`,
                    height: `${target.size}px`,
                    fontSize: `${target.size * 0.6}px`,
                    boxShadow: `0 0 ${target.size * 0.3}px rgba(139, 92, 246, 0.6)`,
                  }}
                >
                  {target.emoji}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Floating Score Texts */}
            <AnimatePresence>
              {floatingTexts.map(text => (
                <motion.div
                  key={text.id}
                  initial={{ opacity: 1, y: 0, scale: 1 }}
                  animate={{ opacity: 0, y: -100, scale: 1.5 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  style={{
                    ...styles.floatingText,
                    left: `${text.x}%`,
                    top: `${text.y}%`,
                    color: text.isCombo ? '#fbbf24' : '#10b981',
                    fontSize: text.isCombo ? '2rem' : '1.5rem',
                  }}
                >
                  {text.text}
                  {text.isCombo && ' 🔥'}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Particles */}
            <AnimatePresence>
              {particles.map(particle => (
                <motion.div
                  key={particle.id}
                  initial={{ 
                    opacity: 1, 
                    x: `${particle.x}%`, 
                    y: `${particle.y}%`,
                    scale: 1,
                  }}
                  animate={{ 
                    opacity: 0,
                    x: `${particle.x + particle.vx * 10}%`,
                    y: `${particle.y + particle.vy * 10}%`,
                    scale: 0,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  style={styles.particle}
                >
                  {particle.emoji}
                </motion.div>
              ))}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
    padding: '20px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    color: '#fff',
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '3rem',
    fontWeight: '900',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#9ca3af',
  },
  statsContainer: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
  },
  statBox: {
    background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9), rgba(31, 41, 55, 0.8))',
    padding: '20px 30px',
    borderRadius: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    backdropFilter: 'blur(10px)',
    minWidth: '150px',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#d1d5db',
  },
  timeBarBg: {
    width: '100%',
    height: '6px',
    background: 'rgba(17, 24, 39, 0.8)',
    borderRadius: '10px',
    overflow: 'hidden',
    marginTop: '8px',
    border: '1px solid rgba(75, 85, 99, 0.3)',
  },
  timeBarFill: {
    height: '100%',
    borderRadius: '10px',
    transition: 'width 0.5s ease',
    boxShadow: '0 0 10px rgba(245, 158, 11, 0.6)',
  },
  comboBox: {
    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2))',
    padding: '15px 25px',
    borderRadius: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    border: '2px solid #fbbf24',
    boxShadow: '0 0 30px rgba(251, 191, 36, 0.5)',
    animation: 'pulse 0.5s ease-in-out infinite',
  },
  comboValue: {
    fontSize: '1.8rem',
    fontWeight: '900',
    color: '#fbbf24',
  },
  comboLabel: {
    fontSize: '0.8rem',
    color: '#fbbf24',
    fontWeight: '700',
  },
  gameArea: {
    position: 'relative',
    width: '100%',
    maxWidth: '1000px',
    height: '500px',
    margin: '0 auto',
    background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.8), rgba(31, 41, 55, 0.6))',
    borderRadius: '20px',
    overflow: 'hidden',
    border: '2px solid rgba(139, 92, 246, 0.4)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 60px rgba(139, 92, 246, 0.1)',
  },
  startScreen: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '40px',
  },
  newHighScoreBanner: {
    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    padding: '20px 40px',
    borderRadius: '15px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    boxShadow: '0 8px 30px rgba(251, 191, 36, 0.6)',
  },
  startTitle: {
    fontSize: '2.5rem',
    marginBottom: '20px',
    textAlign: 'center',
    color: '#ffffff',
  },
  xpEarned: {
    fontSize: '1.5rem',
    color: '#22c55e',
    marginBottom: '20px',
    fontWeight: '700',
    textShadow: '0 0 20px rgba(34, 197, 94, 0.6)',
  },
  startButton: {
    padding: '20px 50px',
    fontSize: '1.5rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
    color: '#fff',
    border: 'none',
    borderRadius: '15px',
    cursor: 'pointer',
    boxShadow: '0 8px 30px rgba(168, 85, 247, 0.5)',
    marginBottom: '30px',
    transition: 'all 0.3s',
  },
  topScoresContainer: {
    background: 'rgba(17, 24, 39, 0.8)',
    padding: '20px',
    borderRadius: '15px',
    marginBottom: '20px',
    minWidth: '250px',
    border: '1px solid rgba(139, 92, 246, 0.3)',
  },
  topScoresTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#ffffff',
  },
  topScoreItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px',
    marginBottom: '8px',
    background: 'rgba(139, 92, 246, 0.1)',
    borderRadius: '8px',
  },
  topScoreRank: {
    color: '#d1d5db',
    fontWeight: '600',
  },
  topScoreValue: {
    color: '#fbbf24',
    fontWeight: '700',
  },
  instructions: {
    textAlign: 'left',
    background: 'rgba(17, 24, 39, 0.6)',
    padding: '20px',
    borderRadius: '10px',
    maxWidth: '400px',
    border: '1px solid rgba(139, 92, 246, 0.2)',
  },
  target: {
    position: 'absolute',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
    transition: 'transform 0.1s',
    userSelect: 'none',
    border: '2px solid rgba(255, 255, 255, 0.2)',
  },
  floatingText: {
    position: 'absolute',
    fontWeight: '900',
    pointerEvents: 'none',
    textShadow: '0 0 10px rgba(0, 0, 0, 0.8)',
    zIndex: 100,
  },
  particle: {
    position: 'absolute',
    fontSize: '1.5rem',
    pointerEvents: 'none',
    zIndex: 99,
  },
};

// Add CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
`;
if (!document.head.querySelector('style[data-game-animations]')) {
  styleSheet.setAttribute('data-game-animations', 'true');
  document.head.appendChild(styleSheet);
}

export default Game;
