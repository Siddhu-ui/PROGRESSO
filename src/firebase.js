// ============================================
// FIREBASE CONFIGURATION & INITIALIZATION
// Firebase v10+ Modular SDK
// ============================================

// Import Firebase core
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc, onSnapshot, collection, addDoc, getDocs, query, where, orderBy, limit, deleteDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ============================================
// FIREBASE CONFIG
// ============================================
// 🔑 Firebase configuration
// NOTE: Values pulled from Vite environment variables so they can differ per environment (local, Netlify, etc.).
// Make sure to define these in Netlify (Site Settings -> Environment) prefixed with VITE_.
// If any are missing we log a clear warning to aid debugging of auth errors like unauthorized-domain.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Basic validation to surface missing config early instead of silent runtime failures.
const missingKeys = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k);
if (missingKeys.length) {
  console.warn("⚠️ Firebase config missing env vars:", missingKeys.join(", "));
  console.warn("Add them as VITE_ vars in Netlify & your .env.local (VITE_FIREBASE_API_KEY, etc.)");
}

// ============================================
// INITIALIZE FIREBASE SERVICES
// ============================================
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (optional)
let analytics;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}
export { analytics };

// ============================================
// GOOGLE AUTH PROVIDER SETUP
// ============================================
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Debug: Log Firebase auth configuration
console.log('🔧 Firebase Auth initialized:', auth);
console.log('🔧 Google Provider configured:', googleProvider);

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Auth state observer
 * @param {Function} callback - Function to call when auth state changes
 * @returns {Function} Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Sign up with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} displayName - User display name
 * @returns {Promise<{user: Object|null, error: string|null}>}
 */
export const signUpWithEmail = async (email, password, displayName) => {
  try {
    console.log('🔐 Creating user account...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile with display name
    await updateProfile(userCredential.user, { displayName });
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      name: displayName,
      email: email,
      level: 1,
      xp: 0,
      totalPoints: 0,
      streak: 0,
      tasksCompleted: 0,
      skillsUnlocked: 0,
      mindfulMinutes: 0,
      badges: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ User account created successfully');
    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error('❌ Sign up failed:', error);
    let errorMessage = 'Sign up failed. Please try again.';
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'An account with this email already exists.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password should be at least 6 characters.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your connection.';
    }
    
    return { user: null, error: errorMessage };
  }
};

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{user: Object|null, error: string|null}>}
 */
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create or update user document in Firestore
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    const userData = {
      email: user.email,
      lastLogin: new Date(),
      updatedAt: new Date()
    };
    
    if (userDoc.exists()) {
      // Update existing user
      await updateDoc(userRef, userData);
    } else {
      // Create new user with default values
      await setDoc(userRef, {
        ...userData,
        name: email.split('@')[0],
        level: 1,
        xp: 0,
        totalPoints: 0,
        streak: 0,
        tasksCompleted: 0,
        skillsUnlocked: 0,
        mindfulMinutes: 0,
        badges: [],
        createdAt: new Date()
      });
    }
    
    return { user: user, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    let errorMessage = 'Failed to sign in. Please check your email and password.';
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      errorMessage = 'Invalid email or password.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'This account has been disabled.';
    }
    
    return { user: null, error: errorMessage };
  }
};

/**
 * Sign in with Google
 * @returns {Promise<{user: Object|null, error: string|null}>}
 */
export const signInWithGoogle = async () => {
  try {
    console.log('🔄 Starting Google sign-in...');
    
    if (!googleProvider) {
      throw new Error('Google authentication not configured');
    }
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }

    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Create or update user document in Firestore
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    const userData = {
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      lastLogin: new Date(),
      updatedAt: new Date()
    };
    
    if (!userDoc.exists()) {
      // New user - set initial values
      await setDoc(userRef, {
        ...userData,
        level: 1,
        xp: 0,
        totalPoints: 0,
        streak: 0,
        tasksCompleted: 0,
        skillsUnlocked: 0,
        mindfulMinutes: 0,
        badges: [],
        createdAt: new Date()
      });
    } else {
      // Existing user - update last login and any missing fields
      await updateDoc(userRef, userData);
    }

    return { user: user, error: null };
  } catch (error) {
    console.error('❌ Google sign-in failed:', error);
    let errorMessage = 'Google sign in failed. Please try again.';

    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign in cancelled. Please try again.';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Popup blocked by browser. Please allow popups for this site.';
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'Google sign-in is not enabled. Please check Firebase Console settings.';
    } else if (error.code === 'auth/configuration-not-found') {
      errorMessage = 'Google authentication not configured in Firebase project.';
    } else if (error.code === 'auth/unauthorized-domain') {
      errorMessage = 'Domain not authorized for Google sign-in. Check Firebase Console.';
    } else if (error.code === 'auth/cancelled-popup-request') {
      errorMessage = 'Another sign-in popup is already open. Please close it and try again.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your connection and try again.';
    }

    return { user: null, error: errorMessage };
  }
};

/**
 * Log out current user
 * @returns {Promise<{error: string|null}>}
 */
export const logout = async () => {
  try {
    await signOut(auth);
    console.log('✅ Logged out successfully');
    return { error: null };
  } catch (error) {
    console.error('❌ Logout failed:', error);
    return { error: 'Logout failed. Please try again.' };
  }
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise<{error: string|null}>}
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('✅ Password reset email sent');
    return { error: null };
  } catch (error) {
    console.error('❌ Password reset failed:', error);
    let errorMessage = 'Password reset failed. Please try again.';
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email address.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    }
    
    return { error: errorMessage };
  }
};

// ============================================
// FIRESTORE FUNCTIONS
// ============================================

/**
 * Get user profile from Firestore
 * @param {string} uid - User ID
 * @returns {Promise<Object|null>} User profile data or null
 */
export const getUserProfile = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    // Return default profile on error
    return {
      name: 'Growth Seeker',
      level: 1,
      xp: 0,
      tasksCompleted: 0,
      skillsUnlocked: 0,
      mindfulMinutes: 0,
      badges: []
    };
  }
};

/**
 * Update user profile in Firestore
 * @param {string} uid - User ID
 * @param {Object} data - Data to update
 * @returns {Promise<{error: string|null}>}
 */
export const updateUserProfile = async (uid, data) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: new Date()
    });
    console.log('✅ Profile updated successfully');
    return { error: null };
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    return { error: 'Failed to update profile. Please try again.' };
  }
};

/**
 * Set today's goal for user
 * @param {string} uid - User ID
 * @param {string} goal - Goal text
 * @returns {Promise<{error: string|null}>}
 */
export const setTodayGoal = async (uid, goal) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    await setDoc(doc(db, 'userGoals', uid), {
      [today]: goal,
      updatedAt: new Date()
    }, { merge: true });
    console.log('✅ Goal saved successfully');
    return { error: null };
  } catch (error) {
    console.error('❌ Error saving goal:', error);
    return { error: 'Failed to save goal. Please try again.' };
  }
};

/**
 * Get today's goal for user
 * @param {string} uid - User ID
 * @returns {Promise<string|null>} Today's goal or null
 */
export const getTodayGoal = async (uid) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const goalDoc = await getDoc(doc(db, 'userGoals', uid));
    if (goalDoc.exists()) {
      return goalDoc.data()[today] || null;
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting goal:', error);
    return null;
  }
};

/**
 * Subscribe to real-time user profile updates
 * @param {string} uid - User ID
 * @param {Function} callback - Function to call with updated data
 * @returns {Function} Unsubscribe function
 */
export const subscribeToUserProfile = (uid, callback) => {
  try {
    return onSnapshot(doc(db, 'users', uid), (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      }
    });
  } catch (error) {
    console.error('❌ Error subscribing to profile:', error);
    return () => {}; // Return empty unsubscribe function
  }
};

/**
 * Get a random motivational quote
 * @returns {Promise<{text: string, author: string}>}
 */
export const getQuoteOfTheDay = async () => {
  try {
    const quotes = [
      {
        text: "The journey of a thousand miles begins with a single step.",
        author: "Lao Tzu"
      },
      {
        text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill"
      },
      {
        text: "Your future is created by what you do today, not tomorrow.",
        author: "Robert Kiyosaki"
      },
      {
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs"
      },
      {
        text: "Innovation distinguishes between a leader and a follower.",
        author: "Steve Jobs"
      },
      {
        text: "Believe you can and you're halfway there.",
        author: "Theodore Roosevelt"
      },
      {
        text: "The best time to plant a tree was 20 years ago. The second best time is now.",
        author: "Chinese Proverb"
      },
      {
        text: "Don't watch the clock; do what it does. Keep going.",
        author: "Sam Levenson"
      }
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  } catch (error) {
    console.error('❌ Error getting quote:', error);
    return {
      text: "Every moment is a fresh beginning.",
      author: "T.S. Eliot"
    };
  }
};

// ============================================
// DEBUGGING FUNCTIONS
// ============================================

/**
 * Debug Firebase configuration
 * Call this in browser console to check Firebase setup
 */
export const debugFirebaseConfig = () => {
  console.log('🔍 Firebase Debug Information:');
  console.log('App:', app);
  console.log('Auth:', auth);
  console.log('Auth current user:', auth?.currentUser);
  console.log('DB:', db);
  console.log('Google Provider:', googleProvider);
  console.log('Firebase Config:', firebaseConfig);

  return {
    app: !!app,
    auth: !!auth,
    db: !!db,
    googleProvider: !!googleProvider,
    currentUser: auth?.currentUser
  };
};

// Make debug function available globally for console access
if (typeof window !== 'undefined') {
  window.debugFirebaseConfig = debugFirebaseConfig;
}

// Export the app instance as default
export default app;