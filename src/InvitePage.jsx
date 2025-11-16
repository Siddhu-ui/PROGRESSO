import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoginPage from './LoginPage'; // We are reusing your existing login page
import { FiGift } from 'react-icons/fi';

export default function InvitePage({ setUser, setToken }) {
  // Get the inviteId from the URL, e.g., "siddharth"
  const { inviteId } = useParams();

  // Capitalize the first letter for display
  const inviterName = inviteId ? inviteId.charAt(0).toUpperCase() + inviteId.slice(1) : 'a friend';

  return (
    <div style={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={styles.inviteCard}
      >
        <div style={styles.icon}>
          <FiGift size={32} color="#fff" />
        </div>
        <h1 style={styles.title}>You're Invited!</h1>
        <p style={styles.subtitle}>
          <strong>{inviterName}</strong> has invited you to join Daily Growth Tracker.
        </p>
        <p style={styles.subtitle}>
          Sign up below to start your journey and connect with them.
        </p>
      </motion.div>

      {/* Render the actual Login/Signup form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <LoginPage setUser={setUser} setToken={setToken} isInvite={true} />
      </motion.div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f7f3ff 0%, #e9dfff 100%)',
    padding: '20px',
  },
  inviteCard: {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '32px 40px',
    border: '1px solid rgba(255, 255, 255, 0.6)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    maxWidth: '500px',
    width: '100%',
    marginBottom: '30px',
  },
  icon: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1e0a40',
    margin: '0 0 10px',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#6b7280',
    margin: '5px 0 0',
    lineHeight: '1.5',
  },
};