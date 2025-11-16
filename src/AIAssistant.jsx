/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeContext';
import { theme as designTheme } from './theme';

// --- React Icon Imports ---
import { 
  FiTarget, FiPlus, FiCheck, FiCircle, FiX, FiHeart, FiZap, 
  FiBookOpen, FiSunrise, FiUsers, FiHelpCircle, FiActivity, 
  FiWind, FiCpu, FiUser, FiSend, FiTrash2, FiSun, FiAward
} from 'react-icons/fi';

// --- Default Welcome Message ---
const welcomeMessage = {
  role: 'assistant',
  content: "👋 Hi! I'm AURA, your AI Growth Coach. Ask me anything about building better habits, productivity, or health. What's on your mind?"
};

// Helper component for accordion icons
const AccordionIcon = ({ isOpen }) => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    style={{ width: '20px', height: '20px', flexShrink: 0 }}
    animate={{ rotate: isOpen ? 90 : 0 }}
    transition={{ duration: 0.3 }}
  >
    <path
      fillRule="evenodd"
      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
      clipRule="evenodd"
    />
  </motion.svg>
);

// Target setting panel component
const TargetSetterPanel = ({ goals, onAddGoal, onToggleGoal, onDeleteGoal, getCategoryIcon, getCategoryColor }) => {
  const completedGoals = goals.filter(goal => goal.completed).length;
  const totalGoals = goals.length;
  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      style={styles.panel}
    >
      <div style={styles.panelHeader}>
        <span style={styles.panelIcon}><FiTarget /></span>
        <h2 style={styles.panelTitle}>My Growth Targets</h2>
      </div>
      <div style={styles.panelContent}>
        {goals.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
            <p style={{ marginBottom: '16px' }}>No goals set yet. Start your growth journey!</p>
            <motion.button
              style={styles.panelButton}
              onClick={onAddGoal}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiPlus size={16} style={{ marginRight: '6px' }} /> Set Your First Goal
            </motion.button>
          </div>
        ) : (
          <>
            {/* Goals Summary */}
            <div style={{
              background: 'rgba(239, 246, 255, 0.8)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: '#059669', fontSize: '0.9rem', fontWeight: '600' }}>Progress</span>
                <span style={{ color: '#059669', fontSize: '1.2rem', fontWeight: '700' }}>{completionRate}%</span>
              </div>
              <div style={{
                background: 'rgba(0, 0, 0, 0.05)',
                borderRadius: '8px',
                height: '6px',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: '#10b981',
                  width: `${completionRate}%`,
                  height: '100%',
                  borderRadius: '8px',
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                  {completedGoals} of {totalGoals} completed
                </span>
                <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                  {totalGoals - completedGoals} remaining
                </span>
              </div>
            </div>

            {goals.map((goal) => (
              <div key={goal.id} style={{
                ...styles.targetItem,
                borderLeft: `4px solid ${getCategoryColor(goal.category)}`,
                opacity: goal.completed ? 0.7 : 1,
                background: goal.completed
                  ? 'rgba(16, 185, 129, 0.1)'
                  : 'rgba(255, 255, 255, 0.7)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexGrow: 1, overflow: 'hidden' }}>
                  <span style={{ fontSize: '1.2rem', color: goal.completed ? '#10b981' : getCategoryColor(goal.category), flexShrink: 0 }}>
                    {goal.completed ? <FiCheck /> : getCategoryIcon(goal.category)}
                  </span>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <span style={{
                      textDecoration: goal.completed ? 'line-through' : 'none',
                      color: goal.completed ? '#6b7280' : '#374151',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'block',
                    }}>
                      {goal.text}
                    </span>
                    <div style={{ fontSize: '0.8rem', color: '#8b5cf6', fontWeight: '500' }}>
                      +{goal.xpValue || 30} XP
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                  <motion.button
                    onClick={() => onToggleGoal(goal.id, goal.xpValue || 30)} // Pass XP value
                    style={{
                      background: goal.completed ? '#10b981' : 'rgba(139, 92, 246, 0.3)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: goal.completed ? '#fff' : '#4f46e5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={goal.completed ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {goal.completed ? <FiCheck size={12} /> : <FiCircle size={12} />}
                  </motion.button>
                  <motion.button
                    onClick={() => onDeleteGoal(goal.id)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '12px',
                      width: 'auto',
                      height: '24px',
                      padding: '0 10px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    whileHover={{ scale: 1.1, background: 'rgba(239, 68, 68, 0.3)' }}
                    whileTap={{ scale: 0.9 }}
                    title="Delete goal"
                  >
                    clear
                  </motion.button>
                </div>
              </div>
            ))}
            <motion.button
              style={styles.panelButton}
              onClick={onAddGoal}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiPlus size={16} style={{ marginRight: '6px' }} /> Add New Goal
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  );
};

// Guidance panel (Unchanged)
const GuidancePanel = () => {
  const [expanded, setExpanded] = useState(null);
  const tips = [
    { icon: <FiActivity />, title: 'Gym Workout Tips', content: '• Focus on compound lifts...\n• Ensure proper form...\n• Aim for progressive overload...' },
    { icon: <FiSunrise />, title: 'Yoga & Flexibility', content: '• Start with a 5-10 minute warm-up...\n• Listen to your body...\n• Hold stretches for 15-30 seconds.' },
    { icon: <FiWind />, title: 'Running & Cardio', content: '• Mix steady-state cardio with HIIT...\n• Invest in good running shoes...\n• Remember to hydrate.' },
    { icon: <FiHeart />, title: 'Food & Nutrition', content: '• Prioritize protein...\n• Eat a variety of colorful fruits...\n• A balanced meal includes protein, carbs, and healthy fats.' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      style={styles.panel}
    >
      <div style={styles.panelHeader}>
        <span style={styles.panelIcon}><FiHelpCircle /></span>
        <h2 style={styles.panelTitle}>Expert Guidance</h2>
      </div>
      <div style={styles.panelContent}>
        {tips.map((tip, index) => (
          <div key={index} style={styles.accordionItem}>
            <motion.header
              style={styles.accordionHeader}
              onClick={() => setExpanded(expanded === index ? null : index)}
              whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.2rem', color: '#8b5cf6' }}>{tip.icon}</span>
                <span>{tip.title}</span>
              </div>
              <AccordionIcon isOpen={expanded === index} />
            </motion.header>
            <AnimatePresence>
              {expanded === index && (
                <motion.section
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={styles.accordionContent}
                >
                  {tip.content}
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// --- Main AI Assistant component ---
export default function AIAssistant({ addXP }) {
  const { theme } = useTheme();
  const currentTheme = theme || {};
  const [prompt, setPrompt] = useState('');
  
  // --- UPDATED: Load messages from localStorage ---
  const [messages, setMessages] = useState(() => {
    try {
      const savedMessages = localStorage.getItem('aura-chat-messages');
      return savedMessages ? JSON.parse(savedMessages) : [welcomeMessage];
    } catch (e) {
      console.error("Failed to parse saved messages:", e);
      return [welcomeMessage];
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [goals, setGoals] = useState([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  
  const [newGoal, setNewGoal] = useState({
    text: '',
    category: 'health',
    xpValue: 30 // Default XP bonus
  });
  
  const [modalInputRef, setModalInputRef] = useState(null);
  // --- REMOVED: conversationHistory state (now derived from messages) ---
  const chatEndRef = useRef(null);
  const isInitialMount = useRef(true);

  // Load goals from localStorage on component mount
  useEffect(() => {
    const savedGoals = localStorage.getItem('growth-goals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  // Save goals to localStorage whenever goals change
  useEffect(() => {
    localStorage.setItem('growth-goals', JSON.stringify(goals));
  }, [goals]);

  // Focus textarea when modal opens
  useEffect(() => {
    if (showGoalModal && modalInputRef) {
      modalInputRef.focus();
    }
  }, [showGoalModal, modalInputRef]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // --- UPDATED: Save full message history to localStorage ---
  useEffect(() => {
    try {
      // Save only the last 10 messages (user + assistant) to avoid filling up localStorage
      localStorage.setItem('aura-chat-messages', JSON.stringify(messages.slice(-10)));
    } catch (e) {
      console.error("Failed to save messages:", e);
    }
  }, [messages]);


  // --- handleSubmit function ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      setError('Please enter a question!');
      setTimeout(() => setError(null), 3000);
      return;
    }

    // (Guardrails and keyword checks are unchanged)
    const growthKeywords = [
      'growth', 'habit', 'motivat', 'discipline', 'focus', 'goal', 'routine',
      'mindset', 'self improve', 'consistency', 'progress', 'success', 'reflection',
      'time management', 'energy', 'mental', 'confidence', 'productiv', 'mindfulness',
      'stress', 'peace', 'relax', 'calm', 'focus', 'study', 'learn better',
      'health', 'fit', 'fitness', 'gym', 'workout', 'train', 'training', 'exercise',
      'cardio', 'weight', 'muscle', 'strength', 'flexibility', 'stretch', 'recovery',
      'lose', 'loss', 'gain', 'burn', 'reduce', 'tone', 'cut', 'bulk', 'body fat', 'fat',
      'shape', 'physique', 'endurance', 'stamina', 'running', 'jogging', 'walking',
      'nutrition', 'food', 'diet', 'meal', 'plan', 'protein', 'calories', 'deficit',
      'carbs', 'fats', 'fiber', 'water', 'hydration', 'sleep', 'rest', 'eating',
      'metabolism', 'healthy', 'cook', 'snack', 'hydrating',
      'yoga', 'meditation', 'mindful', 'breathe', 'wellness', 'balance', 'rest day',
      'how are you', 'hi', 'hello'
    ];

    const bannedKeywords = [
      'python', 'java', 'javascript', 'c++', 'coding', 'programming', 'html', 'css',
      'react', 'node', 'api', 'database', 'project', 'git', 'terminal', 'command',
      'machine learning', 'data science', 'algorithm', 'ai model',
      'movie', 'film', 'actor', 'actress', 'series', 'music', 'song', 'game', 'gaming',
      'celebrity', 'politics', 'history', 'war', 'country', 'sports', 'team',
      'math', 'physics', 'chemistry', 'exam', 'formula'
    ];

    const promptLower = trimmedPrompt.toLowerCase();
    
    const isActionBasedFitnessQuery = /(lose|reduce|burn|gain|tone|build|cut|drop|increase|improve|boost|develop)\s?(fat|weight|muscle|stamina|strength|fitness|focus|discipline|productivity)/i.test(promptLower);
    const isGreeting = ['how are you', 'hi', 'hello'].some(keyword => promptLower.includes(keyword));
    const isGrowthRelated = growthKeywords.some(keyword => promptLower.includes(keyword)) || isActionBasedFitnessQuery;
    const isBanned = bannedKeywords.some(keyword => promptLower.includes(keyword));

    if (isBanned) {
      setMessages(prev => [
        ...prev,
        { role: 'user', content: trimmedPrompt },
        { role: 'assistant', content: "⚠️ Sorry! I can only help you with health, fitness, productivity, and personal growth — not coding or movies. 🌱" },
      ]);
      setPrompt('');
      return;
    }

    if (!isGrowthRelated && !isGreeting) {
      const isHealthQuestion = /(lose weight|weight loss|burn fat|how to slim|how to get fit|healthy diet|exercise routine)/i.test(trimmedPrompt);
      
      if (isHealthQuestion) {
        console.log('Health-related question detected:', trimmedPrompt);
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'user', content: trimmedPrompt },
          { role: 'assistant', content: "🤔 I'm here to help with health, fitness, personal growth, and productivity. Could you rephrase your question to be more specific about your goals?" },
        ]);
        setPrompt('');
        return;
      }
    }

    const userMessage = { role: 'user', content: trimmedPrompt };
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);
    setError(null);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setError('⚠️ Missing API Key. Add VITE_GEMINI_API_KEY to your .env file.');
      setIsLoading(false);
      return;
    }

    const completedGoalsCount = goals.filter(g => g.completed).length;
    const totalGoalsCount = goals.length;
    const pendingGoals = goals.filter(g => !g.completed);

    // --- UPDATED: Build memory from messages state ---
    const memorySummary = messages.length > 1
      ? messages.slice(1) // Get all but the welcome message
          .map(msg => `${msg.role}: ${msg.content}`)
          .slice(-6) // Get last 6 items (3 user, 3 assistant)
          .join('\n')
      : 'No prior questions yet. This is the start of the journey.';

    const pendingGoalText = pendingGoals.length > 0
        ? pendingGoals.map(g => `- "${g.text}" (Category: ${g.category}, Reward: ${g.xpValue} XP)`).join('\n')
        : 'No pending goals.';

    const goalsSummary = totalGoalsCount
      ? `Goals set: ${totalGoalsCount}, Completed: ${completedGoalsCount}, Pending: ${pendingGoals.length}`
      : 'No goals set yet.';
    
    const categorySummary =
      pendingGoals.length > 0
        ? `Here is the user's current list of pending goals:\n${pendingGoalText}`
        : 'The user has no pending goals right now — great job!';

    const moodPrompt =
      totalGoalsCount === 0
        ? 'Encourage them to set new goals.'
        : completedGoalsCount === 0
        ? 'Be uplifting — the user is starting out.'
        : completedGoalsCount / totalGoalsCount < 0.5
        ? 'Be motivating — help them stay consistent.'
        : 'Celebrate progress — inspire continued success.';

    // --- UPDATED: Get AURA's last message for context ---
    const lastMessage = messages[messages.length - 1]; // Get the last message
    const auraLastQuestion = (lastMessage && lastMessage.role === 'assistant') 
      ? lastMessage.content 
      : 'N/A (User spoke last or this is the first message)';
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // --- 🧠 PAYLOAD (PROMPT) UPDATED ---
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `You are **AURA**, the user's Personal AI Growth Coach integrated into the "Daily Growth Tracker" App.
Your mission is to guide the user in *fitness, health, nutrition, mindfulness, productivity, and personal growth* — like a wise, friendly mentor and trainer combined.

---

### 🧩 YOUR ROLE
You are a compassionate, knowledgeable coach who helps the user:
- Lose fat safely
- Build muscle naturally
- Improve focus, motivation, and consistency
- Design workouts, daily routines, and balanced meals
- Build sustainable discipline and a positive mindset
You are **NOT** a generic chatbot. You are the user's *long-term growth partner*.

---

### ⚙️ RULES & BEHAVIOR
1. **YOU ARE INTEGRATED (CRITICAL):** The user is inside the app. The \`CONTEXT DATA\` is **real-time data** from that app. Your primary job is to use this data to provide hyper-personalized advice. **NEVER** ask for information that is already provided in the context (like "What goal did you set?" when the goal list is available).

2. **ONLY** respond to questions about:
  - Health, fitness, food, habits, mindset, productivity, recovery, motivation, yoga, or mindfulness.

3. **NEVER** answer unrelated topics (coding, history, politics, movies, AI models, etc.). If asked, politely decline and remind them of your purpose (Rule #2).

4. **PROACTIVE ACKNOWLEDGEMENT (CRITICAL):** If the user's message is a statement *about* their goals (e.g., "I just set a goal," "I finished my homework goal"), **DO NOT ask what the goal was.** Look at the \`CONTEXT DATA\` and *state the goal back to them*.
    - *User says:* "i have set a goal"
    - *YOU respond (using context):* "Awesome! I see you've set a new goal to '[Goal Text]' for [XP Value] XP. I'm here to help you break that down. What's your first step, or would you like me to create a plan for you?"

5. **HANDLE "YES/NO" REPLIES (CRITICAL):** If the user's message is just "yes," "yep," "no," "do it," or "tell me how," look at \`AURA'S PREVIOUS MESSAGE\`. This is almost certainly an answer to a question you just asked.
    - *Example (AURA):* "...would you like me to create a plan for you?"
    - *User says:* "yes"
    - *YOU respond:* "Great! Here is a 3-step plan for '[Goal Text]': [Provide a brief, actionable 3-step plan based on their newest goal]."
    - *Example (AURA):* "...Could you rephrase your question?"
    - *User says:* "reduce weight"
    - *YOU respond:* "Perfect, thank you! To 'reduce weight', I recommend... [Provide the plan]."

6. Keep advice *realistic and beginner-safe*. Avoid extreme diets or medical recommendations.
7. Include motivational tone and emojis like 💪🥗🔥🧘🌿.
8. Structure answers clearly — use bullet points, sections, or 7-day/3-day templates if needed.
9. Personalize responses using the user's goals, progress, and memory.
10. If the user mentions *weight loss, muscle gain, or routine building*, generate detailed structured plans (like meal plans, workouts, or checklists).
11. Encourage tracking progress inside the Daily Growth Tracker app.
12. NEVER start every reply the same way — vary your tone naturally.

---

### 🧘‍♂️ CONTEXT DATA
User's current goals:
${goalsSummary}
${categorySummary}

Recent conversation history (last 6 messages):
${memorySummary}

Mood context:
${moodPrompt}

AURA'S PREVIOUS MESSAGE (to see if user is replying to you):
"${auraLastQuestion}"

---

### 🧭 RESPONSE EXAMPLES:
If the user says:
> "I want to lose 3 kg of fat."

Respond like:
> "🔥 Great goal! Here's a 7-day fat-loss starter plan:  
> 🥗 **Nutrition:** 400-calorie deficit daily (focus on eggs, dal, lean meats, veggies).  
> 🏋️‍♂️ **Workout:** 4 days strength + 2 days cardio (walking, cycling, or HIIT).  
> 💧 **Hydration:** 3L/day.  
> 💤 **Sleep:** 7–8 hours.  
> Track your meals and habits daily — small wins add up!"

If the user says:
> "How can I improve focus and motivation?"

Respond like:
> "🎯 Focus = mental fitness. Try:  
> 1. 25-min deep work sessions (Pomodoro).  
> 2. Journal 3 wins each day.  
> 3. Morning light walk ☀️  
> 4. One micro goal per day.  
> You'll feel momentum build within a week!"

---

### USER'S QUESTION:
"${trimmedPrompt}"`,
            },
          ],
        },
      ],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
    };
    // --- END OF PAYLOAD ---
    
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        if (res.status === 429) {
            setError('⚠️ Too many requests. Try again soon.');
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry! I\'m a bit busy. Please try again later.' }]);
        } else {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `API Error: ${res.status}`);
        }
        return;
      }

      const data = await res.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);

    } catch (err) {
      console.error('AI Error:', err);
      setError(`❌ ${err.message || 'Failed to get AI response.'}`);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry! An error occurred. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };


  // --- UPDATED `handleAddGoal` ---
  const handleAddGoal = () => {
    if (newGoal.text.trim()) { // Check newGoal.text
      const goal = {
        id: Date.now(),
        text: newGoal.text.trim(),
        category: newGoal.category, 
        xpValue: newGoal.xpValue || 30, // Save the XP value
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
      };
      setGoals(prev => [...prev, goal]);
      // Reset state object
      setNewGoal({ text: '', category: 'health', xpValue: 30 }); // --- FIX --- Default XP is 30
      setShowGoalModal(false);
      console.log('Goal added successfully:', goal);
    } else {
      console.log('Cannot add empty goal');
    }
  };

  // --- UPDATED `handleToggleGoal` ---
  const handleToggleGoal = (goalId, xpValue) => { // Accept xpValue
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const isCompleting = !goal.completed;
        if (isCompleting) {
          // If marking as complete, call addXP
          if (addXP) {
            console.log(`Adding ${xpValue} XP for completing goal!`);
            addXP(`goal-${goal.id}`, xpValue); 
          } else {
            console.warn('addXP function is not connected to AI Assistant');
          }
        }
        // Return updated goal
        return { 
          ...goal, 
          completed: isCompleting,
          completedAt: isCompleting ? new Date().toISOString() : null 
        };
      }
      return goal;
    }));
  };

  const handleDeleteGoal = (goalId) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleModalKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (newGoal.text.trim()) {
        handleAddGoal();
      }
    } else if (e.key === 'Escape') {
      setShowGoalModal(false);
    }
  };

  // --- `getCategoryIcon` returns icons ---
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'health': return <FiHeart />;
      case 'productivity': return <FiZap />;
      case 'learning': return <FiBookOpen />;
      case 'mindfulness': return <FiSunrise />;
      case 'social': return <FiUsers />;
      default: return <FiTarget />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'health': return '#10B981';
      case 'productivity': return '#F59E0B';
      case 'learning': return '#3B82F6';
      case 'mindfulness': return '#8B5CF6';
      case 'social': return '#EC4899';
      default: return '#6B7280';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundEffect}>
        <div style={styles.floatingOrb1} />
        <div style={styles.floatingOrb2} />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={styles.innerContainer}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={styles.header}
        >
          <h1 style={styles.title}>
            <span style={styles.icon}><FiCpu /></span>
            AI Growth Assistant
          </h1>
          <p style={styles.subtitle}>
            Your intelligent companion for personal development
          </p>
        </motion.div>

        <div style={styles.mainLayout}>
          <div style={styles.leftColumn}>
            <div style={styles.chatContainer}>
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    style={msg.role === 'user' ? styles.userMessage : styles.assistantMessage}
                  >
                    <div style={styles.messageIcon}>
                      {msg.role === 'user' ? <FiUser size={20} /> : <FiCpu size={20} />}
                    </div>
                    <div style={styles.messageContent}>
                      <div style={styles.messageRole}>
                        {msg.role === 'user' ? 'You' : 'AURA'}
                      </div>
                      <div style={styles.messageText}>
                        {msg.content}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={styles.loadingContainer}
                >
                  <div style={styles.loadingDots}>
                    <span style={styles.dot}>●</span>
                    <span style={{...styles.dot, animationDelay: '0.2s'}}>●</span>
                    <span style={{...styles.dot, animationDelay: '0.4s'}}>●</span>
                  </div>
                  <span style={styles.loadingText}>AURA is thinking...</span>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={styles.errorBanner}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onSubmit={handleSubmit}
              style={styles.form}
            >
              <div style={styles.inputWrapper}>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                  style={styles.input}
                  placeholder="Ask AURA about growth, habits, productivity..."
                  disabled={isLoading}
                  rows={1}
                />
                <motion.button
                  type="submit"
                  disabled={isLoading || !prompt.trim()}
                  style={{
                    ...styles.button,
                    opacity: isLoading || !prompt.trim() ? 0.5 : 1,
                    cursor: isLoading || !prompt.trim() ? 'not-allowed' : 'pointer'
                  }}
                  whileHover={!isLoading && prompt.trim() ? { scale: 1.05 } : {}}
                  whileTap={!isLoading && prompt.trim() ? { scale: 0.95 } : {}}
                >
                  {isLoading ? (
                    <>
                      <span style={styles.spinner}></span>
                      Thinking...
                    </>
                  ) : (
                    <>
                      <span style={styles.buttonIcon}><FiSend /></span>
                      Ask AURA
                    </>
                  )}
                </motion.button>
              </div>
            </motion.form>
            
            {/* --- UPDATED: Clear Memory Button --- */}
            <button
              onClick={() => {
                localStorage.removeItem('aura-chat-messages'); // Clear storage
                setMessages([welcomeMessage]); // Reset state to welcome message
              }}
              style={styles.clearButton}
            >
              <FiTrash2 size={12} style={{ marginRight: '6px' }} /> Clear Memory
            </button>


            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={styles.suggestions}
            >
              <p style={styles.suggestionsTitle}>
                <FiHelpCircle size={14} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} />
                Try asking:
              </p>
              <div style={styles.suggestionButtons}>
                {[
                  "How can I build a morning routine?",
                  "Tips for staying motivated",
                  "Best productivity techniques",
                  "How to set SMART goals?"
                ].map((suggestion, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setPrompt(suggestion)}
                    style={styles.suggestionButton}
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(139, 92, 246, 0.2)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          <div style={styles.rightColumn}>
            <TargetSetterPanel 
              goals={goals}
              onAddGoal={() => setShowGoalModal(true)}
              onToggleGoal={handleToggleGoal}
              onDeleteGoal={handleDeleteGoal}
              getCategoryIcon={getCategoryIcon}
              getCategoryColor={getCategoryColor}
            />
            <GuidancePanel />
          </div>
        </div>
      </motion.div>

      {/* --- Goal Modal (UPDATED with XP Field and FIXED Refs) --- */}
      <AnimatePresence>
        {showGoalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.modalOverlay}
            onClick={() => setShowGoalModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              style={styles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>
                  <FiTarget style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                  Set New Goal
                </h3>
                <motion.button
                  onClick={() => setShowGoalModal(false)}
                  style={styles.modalCloseButton}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiX size={18} />
                </motion.button>
              </div>
              <div style={styles.modalContent}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Goal Description</label>
                  <textarea
                    ref={setModalInputRef}
                    value={newGoal.text}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, text: e.target.value }))}
                    onKeyPress={handleModalKeyPress}
                    style={styles.modalInput}
                    placeholder="What do you want to achieve?"
                    rows={3}
                  />
                </div>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>XP Bonus</label>
                  <input
                    type="number"
                    value={newGoal.xpValue}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, xpValue: parseInt(e.target.value) || 0 }))}
                    style={styles.modalInput}
                    placeholder="e.g., 30"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Category</label>
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, category: e.target.value }))}
                    style={styles.modalSelect}
                  >
                    <option value="health">Health & Fitness</option>
                    <option value="productivity">Productivity</option>
                    <option value="learning">Learning</option>
                    <option value="mindfulness">Mindfulness</option>
                    <option value="social">Social</option>
                  </select>
                </div>
                <div style={styles.modalActions}>
                  <motion.button
                    onClick={() => setShowGoalModal(false)}
                    style={styles.modalCancelButton}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleAddGoal}
                    disabled={!newGoal.text.trim()}
                    style={{
                      ...styles.modalSaveButton,
                      opacity: newGoal.text.trim() ? 1 : 0.5,
                      cursor: newGoal.text.trim() ? 'pointer' : 'not-allowed'
                    }}
                    whileHover={newGoal.text.trim() ? { scale: 1.05 } : {}}
                    whileTap={newGoal.text.trim() ? { scale: 0.95 } : {}}
                  >
                    Save Goal
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =================================================================
// === STYLES OBJECT (Unchanged from last time) ===
// =================================================================
const styles = {
  // Main container with NEW lavender gradient background
  container: {
    background: 'linear-gradient(135deg, #f7f3ff 0%, #e9dfff 100%)', // Light lavender gradient
    minHeight: '100vh',
    padding: '32px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    position: 'relative',
    overflow: 'hidden',
    color: '#1e0a40', // NEW: Dark text for readability
  },
  
  // Decorative background effects (Updated to be softer)
  backgroundEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    overflow: 'hidden',
  },
  floatingOrb1: {
    position: 'absolute',
    top: '-100px',
    right: '-100px',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(138, 43, 226, 0.08) 0%, rgba(138, 43, 226, 0) 70%)', // NEW: Softer purple
    animation: 'pulse 8s ease-in-out infinite alternate',
  },
  floatingOrb2: {
    position: 'absolute',
    bottom: '-150px',
    left: '-100px',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.05) 0%, rgba(168, 85, 247, 0) 70%)', // NEW: Softer purple
    animation: 'pulse 10s ease-in-out infinite alternate-reverse',
  },
  
  // Content container
  innerContainer: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  
  // Header styles (Updated text color)
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    background: 'linear-gradient(90deg, #6d28d9 0%, #4c1d95 100%)', // NEW: Dark purple text
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    textShadow: 'none', // NEW: Removed shadow
  },
  icon: {
    fontSize: '2.2rem', // Icon size is controlled by font-size
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#5b21b6', // NEW: Darker lavender text
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: '700px',
    margin: '0 auto',
    lineHeight: '1.6',
  },
  
  // Main layout
  mainLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 350px',
    gap: '24px',
    marginTop: '24px',
    '@media (max-width: 1024px)': {
      gridTemplateColumns: '1fr',
    },
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    position: 'sticky',
    top: '32px',
    alignSelf: 'flex-start',
    '@media (max-width: 1024px)': {
      position: 'static',
    },
  },
  
  // Chat container (NEW: White Glassmorphic)
  chatContainer: {
    background: 'rgba(255, 255, 255, 0.7)', // NEW: White glass
    backdropFilter: 'blur(16px)',
    borderRadius: '20px',
    padding: '28px',
    minHeight: '500px',
    maxHeight: '600px',
    overflowY: 'auto',
    border: '1px solid rgba(255, 255, 255, 0.5)', // NEW: Lighter border
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)', // NEW: Softer shadow
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  
  // Message styles (Updated for light theme)
  messageContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  userMessage: {
    display: 'flex',
    gap: '12px',
    alignSelf: 'flex-end',
    maxWidth: '75%',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', // NEW: Solid accent color
    padding: '16px 20px',
    borderRadius: '16px 16px 4px 16px',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.2)', // NEW: Softer shadow
    color: '#ffffff', // NEW: White text on dark button
  },
  assistantMessage: {
    display: 'flex',
    gap: '12px',
    alignSelf: 'flex-start',
    maxWidth: '75%',
    background: '#ffffff', // NEW: Solid white
    padding: '16px 20px',
    borderRadius: '16px 16px 16px 4px',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
  },
  messageIcon: {
    marginTop: '2px', // Aligns icon with text
    flexShrink: 0,
    color: '#8b5cf6', // Default color for assistant icon
  },
  messageContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  messageRole: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#8b5cf6', // NEW: Accent color
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  messageText: {
    fontSize: '0.95rem',
    lineHeight: '1.6',
    color: '#374151', // NEW: Dark gray text
    whiteSpace: 'pre-wrap', // Ensures formatting is kept
  },
  
  // Loading state (Updated for light theme)
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '16px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.5)', // NEW: Light background
    margin: '12px 0',
  },
  loadingDots: {
    display: 'flex',
    gap: '6px',
  },
  dot: {
    fontSize: '1.2rem',
    color: '#818cf8',
    animation: 'bounce 1.4s infinite ease-in-out',
  },
  loadingText: {
    color: '#4338ca', // NEW: Darker text
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  
  // Error banner
  errorBanner: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444', // NEW: Darker red text
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    margin: '12px 0',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  
  // Input form (Updated for light theme)
  form: {
    marginTop: 'auto',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    background: '#ffffff', // NEW: Solid white
    border: '1px solid rgba(138, 43, 226, 0.3)', // NEW: Lavender border
    borderRadius: '14px',
    padding: '16px 20px',
    color: '#1e0a40', // NEW: Dark text
    fontSize: '1rem',
    fontFamily: 'inherit',
    resize: 'none',
    minHeight: '60px',
    maxHeight: '150px',
    transition: 'all 0.3s ease',
    '&:focus': {
      outline: 'none',
      borderColor: '#8b5cf6',
      boxShadow: '0 0 0 2px rgba(138, 43, 226, 0.2)',
    },
    '&::placeholder': {
      color: '#9ca3b8',
    },
  },
  button: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '14px',
    padding: '16px 28px',
    fontSize: '0.95rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 24px rgba(99, 102, 241, 0.4)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
    '&:disabled': {
      opacity: 0.7,
      cursor: 'not-allowed',
      transform: 'none',
    },
  },
  buttonIcon: {
    fontSize: '1.2rem', // Controls icon size in button
  },
  
  // Panel styles (NEW: White Glassmorphic - reflects your screenshot)
  panel: {
    background: 'rgba(255, 255, 255, 0.7)', // NEW: White glass
    backdropFilter: 'blur(16px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.5)', // NEW: Lighter border
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)', // NEW: Softer shadow
    overflow: 'hidden',
  },
  panelHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)', // NEW: Light border
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  panelIcon: {
    fontSize: '1.5rem', // Controls icon size
    color: '#818cf8',
    display: 'flex', // Added for centering
    alignItems: 'center', // Added for centering
  },
  panelTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e0a40', // NEW: Dark text
    margin: 0,
  },
  panelContent: {
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  panelButton: {
    width: '100%',
    background: 'rgba(99, 102, 241, 0.1)',
    color: '#4f46e5', // NEW: Darker text
    border: '1px dashed rgba(99, 102, 241, 0.3)',
    borderRadius: '12px',
    padding: '12px 16px',
    fontSize: '0.95rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: 'rgba(99, 102, 241, 0.2)',
      borderColor: 'rgba(99, 102, 241, 0.5)',
    },
  },

  // Accordion and Target Item styles (Updated for light theme)
  targetItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.7)',
    padding: '14px 18px',
    borderRadius: '14px',
    color: '#374151', // NEW: Dark text
    fontSize: '0.95rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  accordionItem: {
    border: '1px solid rgba(138, 43, 226, 0.1)', // NEW: Lighter border
    borderRadius: '14px',
    overflow: 'hidden',
    background: 'rgba(255, 255, 255, 0.6)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  accordionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.3s ease',
    color: '#374151', // NEW: Dark text
  },
  accordionContent: {
    padding: '0 18px 18px 18px',
    fontSize: '0.95rem',
    color: '#4A5568', // NEW: Dark text
    lineHeight: '1.7',
    whiteSpace: 'pre-wrap',
  },
  // Modal styles (Updated for light theme)
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay is fine
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
  },
  modal: {
    background: '#ffffff', // NEW: Solid white
    borderRadius: '20px',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid #e5e7eb', // NEW: Light border
    background: '#f9fafb', // NEW: Light header
  },
  modalTitle: {
    margin: 0,
    color: '#111827', // NEW: Dark text
    fontSize: '1.5rem',
    fontWeight: '700',
    display: 'flex', // Added for icon alignment
    alignItems: 'center', // Added for icon alignment
  },
  modalCloseButton: {
    background: 'rgba(239, 68, 68, 0.12)',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    color: '#ef4444',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    background: '#ffffff', // NEW: White
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    color: '#6b7280', // NEW: Gray text
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  modalInput: {
    background: '#ffffff',
    border: '1px solid #d1d5db', // NEW: Standard border
    borderRadius: '12px',
    padding: '16px',
    color: '#111827', // NEW: Dark text
    fontSize: '1rem',
    fontFamily: 'inherit',
    resize: 'vertical',
    transition: 'all 0.3s ease',
  },
  modalSelect: {
    background: '#ffffff',
    border: '1px solid #d1d5db', // NEW: Standard border
    borderRadius: '12px',
    padding: '16px',
    color: '#111827', // NEW: Dark text
    fontSize: '1rem',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '10px',
  },
  modalCancelButton: {
    background: '#e5e7eb', // NEW: Light gray
    color: '#374151', // NEW: Dark text
    border: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  modalSaveButton: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', // Accent color
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  
  // --- CLEAR MEMORY BUTTON (Updated for light theme) ---
  clearButton: {
    background: 'rgba(239, 68, 68, 0.08)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: '10px',
    padding: '8px 14px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    marginTop: '0px',
    marginBottom: '15px',
    width: 'fit-content',
    alignSelf: 'center', 
    transition: 'all 0.3s ease',
    display: 'flex', // Added for icon alignment
    alignItems: 'center', // Added for icon alignment
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  suggestions: {
    textAlign: 'center',
  },
  suggestionsTitle: {
    color: '#6b7280', // NEW: Gray text
    fontSize: '0.9rem',
    marginBottom: '12px',
    fontWeight: '600',
    display: 'flex', // Added for icon alignment
    alignItems: 'center', // Added for icon alignment
    justifyContent: 'center', // Added for icon alignment
  },
  suggestionButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    justifyContent: 'center',
  },
  suggestionButton: {
    background: 'rgba(139, 92, 246, 0.1)', // NEW: Lighter
    border: '1px solid rgba(139, 92, 246, 0.2)', // NEW: Lighter
    borderRadius: '20px',
    padding: '8px 16px',
    color: '#4f46e5', // NEW: Darker text
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};

// CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
    50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
    40% { transform: scale(1); opacity: 1; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Responsive styles */
  @media (max-width: 1024px) {
    .mainLayout {
      grid-template-columns: 1fr !important;
      gap: 24px !important;
    }
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 2rem !important;
    }
    .chatContainer {
      padding: 24px !important;
      min-height: 350px !important;
    }
    .inputWrapper {
      flex-direction: column !important;
      gap: 12px !important;
    }
    .button {
      width: 100% !important;
      justify-content: center !important;
    }
  }

  @media (max-width: 480px) {
    .container {
      padding: 16px !important;
    }
    h1 {
      font-size: 1.8rem !important;
    }
  }
`;
document.head.appendChild(styleSheet);