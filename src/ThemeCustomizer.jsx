import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeContext';
import { X, Palette, Sun, Moon, Sparkles } from 'lucide-react';

function ThemeCustomizer({ isOpen, onClose }) {
  const { currentTheme, changeTheme, customColors, updateCustomColor, resetCustomTheme, theme } = useTheme();
  const [activeTab, setActiveTab] = useState('preset');
  const [tempColors, setTempColors] = useState(customColors);

  // Sync tempColors when customColors change
  useEffect(() => {
    setTempColors(customColors);
  }, [customColors]);

  const colorOptions = [
    { key: 'background', label: 'Background Gradient', type: 'gradient' },
    { key: 'cardBg', label: 'Card Background', type: 'color' },
    { key: 'textPrimary', label: 'Primary Text', type: 'color' },
    { key: 'textSecondary', label: 'Secondary Text', type: 'color' },
    { key: 'accent', label: 'Accent Color', type: 'color' },
    { key: 'accentSecondary', label: 'Secondary Accent', type: 'color' },
  ];

  const handleColorChange = (key, value) => {
    setTempColors(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyCustomColors = () => {
    Object.keys(tempColors).forEach(key => {
      updateCustomColor(key, tempColors[key]);
    });
    changeTheme('custom');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)',
              zIndex: 999,
            }}
          />

          {/* Modal */}
          <motion.div
            className="theme-modal"
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: theme.cardBg,
              backdropFilter: 'blur(20px)',
              borderRadius: '25px',
              padding: '30px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              border: `1px solid ${theme.border}`,
              boxShadow: `0 20px 60px ${theme.shadow}`,
              zIndex: 1000,
              color: theme.textPrimary,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '25px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Palette size={28} color={theme.accent} />
                <h2 style={{
                  fontSize: '1.8rem',
                  fontWeight: '700',
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentSecondary})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Theme Settings
                </h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={24} color={theme.textSecondary} />
              </motion.button>
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '20px',
              borderBottom: `1px solid ${theme.border}`,
              paddingBottom: '10px',
              flexShrink: 0,
            }}>
              {[
                { id: 'preset', label: 'Preset Themes', icon: Sun },
                { id: 'custom', label: 'Customize', icon: Sparkles },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      flex: 1,
                      padding: '12px 20px',
                      borderRadius: '12px',
                      border: 'none',
                      background: activeTab === tab.id
                        ? `linear-gradient(135deg, ${theme.accent}, ${theme.accentSecondary})`
                        : 'rgba(255, 255, 255, 0.05)',
                      color: activeTab === tab.id ? '#fff' : theme.textSecondary,
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </motion.button>
                );
              })}
            </div>

            {/* Content - Scrollable */}
            <div 
              className="theme-content-scroll"
              style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                paddingRight: '10px',
                minHeight: 0,
              }}
            >
            {activeTab === 'preset' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {/* Light Theme */}
                <motion.div
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => changeTheme('light')}
                  style={{
                    padding: '20px',
                    borderRadius: '15px',
                    background: currentTheme === 'light'
                      ? `linear-gradient(135deg, ${theme.accent}20, ${theme.accentSecondary}20)`
                      : 'rgba(255, 255, 255, 0.03)',
                    border: currentTheme === 'light'
                      ? `2px solid ${theme.accent}`
                      : `1px solid ${theme.border}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Sun size={32} color="#f59e0b" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '5px' }}>
                      Light Theme
                    </div>
                    <div style={{ fontSize: '0.9rem', color: theme.textSecondary }}>
                      Clean and bright interface
                    </div>
                  </div>
                  {currentTheme === 'light' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentSecondary})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                      }}
                    >
                      ✓
                    </motion.div>
                  )}
                </motion.div>

                {/* Dark Theme */}
                <motion.div
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => changeTheme('dark')}
                  style={{
                    padding: '20px',
                    borderRadius: '15px',
                    background: currentTheme === 'dark'
                      ? `linear-gradient(135deg, ${theme.accent}20, ${theme.accentSecondary}20)`
                      : 'rgba(255, 255, 255, 0.03)',
                    border: currentTheme === 'dark'
                      ? `2px solid ${theme.accent}`
                      : `1px solid ${theme.border}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Moon size={32} color="#60a5fa" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '5px' }}>
                      Dark Theme
                    </div>
                    <div style={{ fontSize: '0.9rem', color: theme.textSecondary }}>
                      Easy on the eyes, perfect for night
                    </div>
                  </div>
                  {currentTheme === 'dark' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentSecondary})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                      }}
                    >
                      ✓
                    </motion.div>
                  )}
                </motion.div>

                {/* Custom Theme */}
                <motion.div
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => changeTheme('custom')}
                  style={{
                    padding: '20px',
                    borderRadius: '15px',
                    background: currentTheme === 'custom'
                      ? `linear-gradient(135deg, ${theme.accent}20, ${theme.accentSecondary}20)`
                      : 'rgba(255, 255, 255, 0.03)',
                    border: currentTheme === 'custom'
                      ? `2px solid ${theme.accent}`
                      : `1px solid ${theme.border}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Sparkles size={32} color="#a855f7" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '5px' }}>
                      Custom Theme
                    </div>
                    <div style={{ fontSize: '0.9rem', color: theme.textSecondary }}>
                      Create your own unique style
                    </div>
                  </div>
                  {currentTheme === 'custom' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentSecondary})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                      }}
                    >
                      ✓
                    </motion.div>
                  )}
                </motion.div>
              </div>
            )}

            {activeTab === 'custom' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{
                  padding: '15px',
                  borderRadius: '12px',
                  background: 'rgba(251, 191, 36, 0.1)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  fontSize: '0.9rem',
                  color: theme.textSecondary,
                }}>
                  💡 Tip: Edit the colors below and click "Apply Custom Theme" to see your changes
                </div>

                {colorOptions.map((option) => (
                  <div key={option.key} style={{ marginBottom: '15px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      color: theme.textPrimary,
                    }}>
                      {option.label}
                    </label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={tempColors[option.key]}
                        onChange={(e) => handleColorChange(option.key, e.target.value)}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: '10px',
                          border: `1px solid ${theme.border}`,
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: theme.textPrimary,
                          fontSize: '0.9rem',
                          outline: 'none',
                        }}
                        placeholder="e.g., #667eea or rgba(102, 126, 234, 0.5)"
                      />
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '10px',
                        background: tempColors[option.key],
                        border: `2px solid ${theme.border}`,
                        boxShadow: `0 4px 12px ${theme.shadow}`,
                      }} />
                    </div>
                  </div>
                ))}

                {/* Apply Button */}
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: `0 8px 25px ${theme.accent}40` }}
                  whileTap={{ scale: 0.95 }}
                  onClick={applyCustomColors}
                  style={{
                    padding: '16px 32px',
                    borderRadius: '12px',
                    border: 'none',
                    background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentSecondary})`,
                    color: '#fff',
                    fontWeight: '700',
                    fontSize: '1.05rem',
                    cursor: 'pointer',
                    marginTop: '10px',
                    boxShadow: `0 4px 15px ${theme.accent}30`,
                  }}
                >
                  ✨ Apply Custom Theme
                </motion.button>

                {/* Reset Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    resetCustomTheme();
                    setTempColors(customColors);
                  }}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: `1px solid ${theme.border}`,
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: theme.textPrimary,
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginTop: '10px',
                  }}
                >
                  🔄 Reset to Default
                </motion.button>
              </div>
            )}
            </div>
          </motion.div>

          {/* Custom Scrollbar Styles */}
          <style>
            {`
              .theme-content-scroll {
                scrollbar-width: thin;
                scrollbar-color: ${theme.accent} rgba(255, 255, 255, 0.1);
              }
              
              .theme-content-scroll::-webkit-scrollbar {
                width: 8px;
              }
              
              .theme-content-scroll::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
              }
              
              .theme-content-scroll::-webkit-scrollbar-thumb {
                background: ${theme.accent};
                border-radius: 10px;
                transition: background 0.3s ease;
              }
              
              .theme-content-scroll::-webkit-scrollbar-thumb:hover {
                background: ${theme.accentSecondary};
              }
            `}
          </style>
        </>
      )}
    </AnimatePresence>
  );
}

export default ThemeCustomizer;
