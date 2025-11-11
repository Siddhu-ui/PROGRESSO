import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFire, FaTrophy, FaRobot, FaUser, FaListUl, FaHome, FaFireAlt, FaMedal, FaChartLine } from 'react-icons/fa';
import XPRing from './ui/XPRing';
import NavigationDock from './NavigationDock';
import { cn } from '@/lib/utils';

// Mock data - replace with your actual data fetching logic
const MOCK_DATA = {
  user: {
    name: 'Alex Johnson',
    avatar: '',
    level: 12,
    xp: 14500,
    xpGainedToday: 320,
    streak: 7,
  },
  dailyTasks: [
    { id: 'water', name: 'Drink Water', xp: 5, completed: true, icon: 'water' },
    { id: 'breakfast', name: 'Eat Breakfast', xp: 10, completed: true, icon: 'food' },
    { id: 'exercise', name: 'Exercise', xp: 20, completed: false, icon: 'run' },
    { id: 'read', name: 'Read 30min', xp: 15, completed: false, icon: 'book' },
  ],
  leaderboard: [
    { id: 1, name: 'Sarah K.', level: 15, xp: 22500 },
    { id: 2, name: 'Mike T.', level: 14, xp: 19600 },
    { id: 3, name: 'You', level: 12, xp: 14500 },
  ],
  aiInsights: {
    message: "You're on a 7-day streak! Keep it up to unlock a weekly bonus.",
    tip: "Try completing your reading goal to earn extra XP.",
  },
};

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [data, setData] = useState(MOCK_DATA);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleCompleteTask = (taskId) => {
    // In a real app, this would be an API call
    setData(prev => ({
      ...prev,
      dailyTasks: prev.dailyTasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ),
      user: {
        ...prev.user,
        xp: prev.user.xp + (prev.dailyTasks.find(t => t.id === taskId)?.xp || 0),
        xpGainedToday: prev.user.xpGainedToday + (prev.dailyTasks.find(t => t.id === taskId)?.xp || 0),
      },
    }));
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <HomeSection data={data} onCompleteTask={handleCompleteTask} />;
      case 'tasks':
        return <TasksSection tasks={data.dailyTasks} onCompleteTask={handleCompleteTask} />;
      case 'calories':
        return <CaloriesSection />;
      case 'ai':
        return <AIAssistantSection insights={data.aiInsights} />;
      case 'leaderboard':
        return <LeaderboardSection leaderboard={data.leaderboard} userLevel={data.user.level} />;
      case 'profile':
        return <ProfileSection user={data.user} />;
      default:
        return <HomeSection data={data} onCompleteTask={handleCompleteTask} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="animate-pulse text-white text-xl">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white pb-32">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-purple-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-500/10 rounded-full filter blur-3xl"></div>
      </div>

      <main className="relative z-10 container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </main>

      <NavigationDock 
        activeSection={activeSection} 
        onNavigate={setActiveSection} 
      />
    </div>
  );
};

// Section Components
const HomeSection = ({ data, onCompleteTask }) => (
  <div className="space-y-8">
    <header className="text-center pt-8">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
        Welcome back, {data.user.name.split(' ')[0]}!
      </h1>
      <p className="text-gray-400 mt-2">Keep up the great work! 🔥</p>
    </header>

    <div className="flex justify-center">
      <XPRing 
        level={data.user.level} 
        currentXP={data.user.xp} 
        xpGainedToday={data.user.xpGainedToday} 
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Current Streak</span>
          <FaFireAlt className="text-orange-400" />
        </div>
        <div className="text-2xl font-bold mt-1">{data.user.streak} days</div>
      </div>
      
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Rank</span>
          <FaMedal className="text-yellow-400" />
        </div>
        <div className="text-2xl font-bold mt-1">#{data.leaderboard.findIndex(u => u.name === 'You') + 1}</div>
      </div>
    </div>

    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <FaListUl className="mr-2 text-indigo-400" />
        Today's Tasks
      </h2>
      <div className="space-y-3">
        {data.dailyTasks.slice(0, 3).map(task => (
          <TaskItem key={task.id} task={task} onComplete={onCompleteTask} />
        ))}
      </div>
    </div>
  </div>
);

const TaskItem = ({ task, onComplete }) => (
  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
    <div className="flex items-center">
      <button
        onClick={() => onComplete(task.id)}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${
          task.completed 
            ? 'bg-green-500 border-green-500' 
            : 'border-gray-500 hover:border-indigo-400'
        }`}
      >
        {task.completed && <span className="text-white text-xs">✓</span>}
      </button>
      <span className={task.completed ? 'line-through text-gray-400' : ''}>
        {task.name}
      </span>
    </div>
    <span className="text-sm text-indigo-400">+{task.xp} XP</span>
  </div>
);

const TasksSection = ({ tasks, onCompleteTask }) => (
  <div className="space-y-6">
    <header className="pt-8">
      <h1 className="text-2xl font-bold">Daily Tasks</h1>
      <p className="text-gray-400">Complete tasks to earn XP and level up!</p>
    </header>

    <div className="space-y-3">
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} onComplete={onCompleteTask} />
      ))}
    </div>
  </div>
);

const CaloriesSection = () => (
  <div className="space-y-6">
    <header className="pt-8">
      <h1 className="text-2xl font-bold">Calorie Tracker</h1>
      <p className="text-gray-400">Track your daily nutrition</p>
    </header>

    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold">Today's Intake</h3>
          <p className="text-3xl font-bold">1,842 <span className="text-sm font-normal text-gray-400">/ 2,200 cal</span></p>
        </div>
        <div className="w-20 h-20 rounded-full border-4 border-indigo-500/30 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl font-bold">84%</div>
            <div className="text-xs text-gray-400">of goal</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Protein</span>
            <span>128g <span className="text-gray-400">/ 150g</span></span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Carbs</span>
            <span>210g <span className="text-gray-400">/ 250g</span></span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: '84%' }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Fat</span>
            <span>65g <span className="text-gray-400">/ 80g</span></span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-500 rounded-full" style={{ width: '81%' }}></div>
          </div>
        </div>
      </div>

      <button className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-4 rounded-xl font-medium transition-colors">
        Log Meal
      </button>
    </div>
  </div>
);

const AIAssistantSection = ({ insights }) => (
  <div className="space-y-6">
    <header className="pt-8">
      <h1 className="text-2xl font-bold flex items-center">
        <FaRobot className="mr-2 text-indigo-400" />
        AI Assistant
      </h1>
      <p className="text-gray-400">Your personal growth companion</p>
    </header>

    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
      <div className="flex items-start mb-6">
        <div className="bg-indigo-500/20 p-3 rounded-xl mr-4">
          <FaRobot className="text-indigo-400 text-xl" />
        </div>
        <div>
          <h3 className="font-semibold">GrowthBot</h3>
          <p className="text-sm text-gray-300">Your AI Assistant</p>
        </div>
      </div>

      <div className="bg-black/20 rounded-xl p-4 mb-6">
        <p className="text-sm">{insights.message}</p>
        <p className="text-sm mt-2 text-indigo-300">💡 {insights.tip}</p>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-sm text-gray-300">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 text-sm transition-colors">
            Set a new goal
          </button>
          <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 text-sm transition-colors">
            View progress
          </button>
          <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 text-sm transition-colors">
            Get motivation
          </button>
          <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 text-sm transition-colors">
            Suggest tasks
          </button>
        </div>
      </div>

      <div className="mt-6 relative">
        <input
          type="text"
          placeholder="Ask me anything..."
          className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-500 p-2 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  </div>
);

const LeaderboardSection = ({ leaderboard, userLevel }) => (
  <div className="space-y-6">
    <header className="pt-8">
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      <p className="text-gray-400">See how you compare to others</p>
    </header>

    <div className="space-y-4">
      {leaderboard.map((user, index) => (
        <div 
          key={user.id}
          className={`flex items-center p-4 rounded-2xl ${user.name === 'You' ? 'bg-indigo-500/10 border border-indigo-500/30' : 'bg-white/5 border border-white/10'}`}
        >
          <div className="text-2xl font-bold w-10 text-center">
            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
          </div>
          
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-sm font-bold mr-3">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          
          <div className="flex-1">
            <div className="font-medium">{user.name}</div>
            <div className="text-xs text-gray-400">Level {user.level}</div>
          </div>
          
          <div className="text-right">
            <div className="font-bold">{user.xp.toLocaleString()} XP</div>
            <div className="text-xs text-gray-400">
              {user.xp - (leaderboard[Math.min(index + 1, leaderboard.length - 1)]?.xp || 0)} XP ahead
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="mt-8">
      <h3 className="font-medium mb-3">Your Stats</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold">#{leaderboard.findIndex(u => u.name === 'You') + 1}</div>
          <div className="text-xs text-gray-400">Rank</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold">{userLevel}</div>
          <div className="text-xs text-gray-400">Level</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold">7</div>
          <div className="text-xs text-gray-400">Day Streak</div>
        </div>
      </div>
    </div>
  </div>
);

const ProfileSection = ({ user }) => (
  <div className="space-y-6">
    <header className="pt-8 text-center">
      <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 mb-4 flex items-center justify-center text-2xl font-bold">
        {user.name.split(' ').map(n => n[0]).join('')}
      </div>
      <h1 className="text-2xl font-bold">{user.name}</h1>
      <p className="text-gray-400">Level {user.level} • {user.xp.toLocaleString()} XP</p>
    </header>

    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
      <h2 className="text-lg font-semibold mb-4">Account Settings</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
          <input 
            type="text" 
            defaultValue={user.name}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input 
            type="email" 
            value="alex.johnson@example.com"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Daily Goal</label>
          <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            <option>Easy - 3 tasks/day</option>
            <option selected>Medium - 5 tasks/day</option>
            <option>Hard - 8 tasks/day</option>
          </select>
        </div>
      </div>
      
      <div className="mt-6 space-y-3">
        <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded-lg font-medium transition-colors">
          Save Changes
        </button>
        <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-2 px-4 rounded-lg font-medium transition-colors">
          Sign Out
        </button>
      </div>
    </div>

    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
      <h2 className="text-lg font-semibold mb-4">Your Stats</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-300">Current Streak</div>
            <div className="font-medium">{user.streak} days</div>
          </div>
          <FaFireAlt className="text-orange-400 text-xl" />
        </div>
        
        <div className="h-px bg-white/10"></div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-300">Tasks Completed</div>
            <div className="font-medium">128</div>
          </div>
          <div>
            <div className="text-sm text-gray-300">Total XP</div>
            <div className="font-medium">{user.xp.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-gray-300">Level</div>
            <div className="font-medium">{user.level}</div>
          </div>
          <div>
            <div className="text-sm text-gray-300">Rank</div>
            <div className="font-medium">#3</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Dashboard;
