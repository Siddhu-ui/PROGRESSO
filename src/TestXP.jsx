import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { db } from './firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

export default function TestXP() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const addXP = async (amount) => {
    setLoading(true);
    setMessage('');
    
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setMessage('❌ Please sign in first');
        setLoading(false);
        return;
      }

      const userData = JSON.parse(storedUser);
      const userRef = doc(db, 'users', userData._id);

      await updateDoc(userRef, {
        xp: increment(amount),
        totalPoints: increment(amount),
        updatedAt: new Date()
      });

      setMessage(`✅ Added ${amount} XP!`);
      
      // Update localStorage
      const updatedUser = {
        ...userData,
        xp: (userData.xp || 0) + amount,
        totalPoints: (userData.totalPoints || 0) + amount
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
    } catch (error) {
      console.error('Error adding XP:', error);
      setMessage('❌ Failed to add XP: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(17, 24, 39, 0.95)',
      padding: '20px',
      borderRadius: '16px',
      border: '2px solid rgba(168, 85, 247, 0.5)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      minWidth: '250px'
    }}>
      <h3 style={{ 
        color: '#fff', 
        marginBottom: '15px',
        fontSize: '1.1rem',
        fontWeight: '700'
      }}>
        🧪 Test XP System
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => addXP(100)}
          disabled={loading}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: '#fff',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          +100 XP
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => addXP(500)}
          disabled={loading}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: '#fff',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          +500 XP
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => addXP(1000)}
          disabled={loading}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
            color: '#fff',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          +1000 XP
        </motion.button>
      </div>

      {message && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          borderRadius: '8px',
          background: message.includes('✅') ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          border: `1px solid ${message.includes('✅') ? '#22c55e' : '#ef4444'}`,
          color: message.includes('✅') ? '#22c55e' : '#ef4444',
          fontSize: '0.9rem',
          fontWeight: '600'
        }}>
          {message}
        </div>
      )}

      <p style={{
        marginTop: '15px',
        fontSize: '0.75rem',
        color: '#9ca3af',
        textAlign: 'center'
      }}>
        For testing purposes only
      </p>
    </div>
  );
}
