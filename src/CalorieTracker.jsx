import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Load Dependencies from CDN ---
// In a real project, you would install these via npm.
// For this self-contained file, we pull them from the window object.
const { CircularProgressbar, buildStyles } = window.ReactCircularProgressbar || {};
const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } = window.Recharts || {};

// --- Helper Functions & Initial Data ---
const generatePast7DaysData = () => {
    const today = new Date();
    const data = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const day = date.toLocaleString('en-US', { weekday: 'short' });
        // Simulate some random calorie data for the chart
        const calories = Math.floor(Math.random() * (2500 - 1500 + 1) + 1500);
        data.push({ day, calories });
    }
    return data;
};

// --- Main App Component ---
export default function App() {
    // --- State Management ---
    const [foodLog, setFoodLog] = useState(() => {
        const savedLog = localStorage.getItem('foodLog');
        return savedLog ? JSON.parse(savedLog) : [];
    });
    
    const [calorieHistory, setCalorieHistory] = useState(generatePast7DaysData());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // --- Daily Goals ---
    const goals = { calories: 2200 };

    // --- Memoized Calculations ---
    const dailyTotals = useMemo(() => {
        return foodLog.reduce((acc, item) => {
            acc.calories += item.calories;
            return acc;
        }, { calories: 0 });
    }, [foodLog]);
    
    // --- Effects ---
    useEffect(() => {
        localStorage.setItem('foodLog', JSON.stringify(foodLog));
        setCalorieHistory(prevHistory => {
            const newHistory = [...prevHistory];
            const todayEntry = newHistory[newHistory.length - 1];
            if (todayEntry) {
                todayEntry.calories = dailyTotals.calories;
            }
            return newHistory;
        });
    }, [foodLog, dailyTotals.calories]);

    // --- Event Handlers ---
    const addFoodItem = (newItem) => {
        setFoodLog(prevLog => [{ ...newItem, id: Date.now() }, ...prevLog]);
        setIsModalOpen(false);
    };
    
    const removeFoodItem = (id) => {
        setFoodLog(prevLog => prevLog.filter(item => item.id !== id));
    };

    const resetTracker = () => {
        setFoodLog([]);
    }

    // --- Render ---
    return (
        <div className="bg-slate-900 min-h-screen font-sans text-white p-4 sm:p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
            {/* Inject CSS for Circular Progressbar */}
            <style>{`
                .CircularProgressbar {
                    width: 100%;
                }
                .CircularProgressbar .CircularProgressbar-path {
                    stroke-linecap: round;
                    transition: stroke-dashoffset 0.5s ease 0s;
                }
                .CircularProgressbar .CircularProgressbar-trail {
                    stroke-linecap: round;
                }
                .CircularProgressbar .CircularProgressbar-text {
                    dominant-baseline: middle;
                    text-anchor: middle;
                }
            `}</style>
            <div className="container mx-auto max-w-4xl">
                <Header />
                <motion.main
                    className="flex flex-col gap-8 mt-6"
                    initial="hidden"
                    animate="show"
                    variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } }}
                >
                    <TodayStatus totals={dailyTotals} goals={goals} />
                    <ActionButtons onAdd={() => setIsModalOpen(true)} onHistory={() => setIsHistoryOpen(true)} onReset={resetTracker} />
                    <CalorieChart data={calorieHistory} />
                </motion.main>
            </div>
            <AddFoodModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={addFoodItem} />
            <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} log={foodLog} onRemove={removeFoodItem}/>
        </div>
    );
}


// --- Sub-components ---

const Header = () => (
    <header className="text-center mb-8">
        <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="text-6xl mb-4 inline-block">
            🔥
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Daily Fuel Tracker</h1>
        <p className="mt-2 text-lg text-slate-400">A simple and smart way to track your nutrition</p>
    </header>
);

const TodayStatus = ({ totals, goals }) => {
    const progress = Math.min(Math.round((totals.calories / goals.calories) * 100), 100);
    const caloriesRemaining = goals.calories - totals.calories;

    return (
        <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="flex justify-center items-center">
                    <div className="w-48 h-48 relative">
                        {CircularProgressbar ? (
                            <CircularProgressbar
                                value={progress}
                                styles={buildStyles({
                                    pathColor: `url(#calorieGradient)`,
                                    trailColor: 'rgba(255, 255, 255, 0.1)',
                                    strokeLinecap: 'round',
                                })}
                            />
                        ) : <ChartPlaceholder />}
                        <svg className="absolute inset-0 w-full h-full -rotate-90" style={{ zIndex: -1 }}>
                            <defs>
                                <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#22C55E" />
                                    <stop offset="100%" stopColor="#84CC16" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="text-4xl font-bold">{totals.calories}</span>
                            <span className="text-sm text-slate-400">of {goals.calories} kcal</span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                    <StatBox label="Goal" value={goals.calories} unit="kcal" color="text-green-400" />
                    <StatBox label="Consumed" value={totals.calories} unit="kcal" color="text-lime-400" />
                    <StatBox label="Remaining" value={caloriesRemaining > 0 ? caloriesRemaining : 0} unit="kcal" color={caloriesRemaining < 0 ? 'text-red-500' : 'text-slate-300'} />
                    <StatBox label="Progress" value={progress} unit="%" color="text-green-400" />
                </div>
            </div>
        </Card>
    );
};

const CalorieChart = ({ data }) => (
    <Card>
        <h2 className="text-xl font-bold mb-4">Weekly Summary</h2>
        <div style={{ width: '100%', height: 300 }}>
             {ResponsiveContainer ? (
                <ResponsiveContainer>
                    <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="day" tick={{ fill: '#94a3b8' }} fontSize={12} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#94a3b8' }} fontSize={12} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(30, 41, 59, 0.8)',
                                backdropFilter: 'blur(5px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '0.75rem',
                                color: '#fff'
                            }}
                            cursor={{fill: 'rgba(255, 255, 255, 0.1)'}}
                        />
                        <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#84cc16" stopOpacity={0.8}/>
                            </linearGradient>
                        </defs>
                        <Bar dataKey="calories" name="Calories" fill="url(#barGradient)" barSize={30} radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            ) : <ChartPlaceholder />}
        </div>
    </Card>
);

const ActionButtons = ({ onAdd, onHistory, onReset }) => (
    <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4" variants={cardVariants}>
        <ActionButton onClick={onAdd} icon="➕" label="Add Meal" gradient="from-green-500 to-lime-500" />
        <ActionButton onClick={onHistory} icon="📊" label="History" gradient="from-sky-500 to-cyan-500" />
        <ActionButton onClick={onReset} icon="🔄" label="Reset" gradient="from-red-500 to-rose-500" />
    </motion.div>
);

const ActionButton = ({ onClick, icon, label, gradient }) => (
     <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05, y: -2, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
        whileTap={{ scale: 0.95 }}
        className={`w-full py-4 px-6 bg-gradient-to-br ${gradient} text-white font-semibold rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg`}
    >
        <span className="text-xl">{icon}</span>
        <span>{label}</span>
    </motion.button>
);


const Modal = ({ isOpen, onClose, children }) => (
     <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl w-full max-w-md"
                    onClick={(e) => e.stopPropagation()}
                >
                    {children}
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

const AddFoodModal = ({ isOpen, onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [calories, setCalories] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if(name && calories) {
            onAdd({ name, calories: +calories, timestamp: new Date().toISOString() });
            setName('');
            setCalories('');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-xl font-bold mb-4">Add Meal</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <InputField label="Meal Name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Breakfast Sandwich" required />
                <InputField label="Calories" type="number" value={calories} onChange={e => setCalories(e.target.value)} placeholder="e.g., 450" required />
                <div className="flex gap-3 pt-4">
                    <ActionButton onClick={handleSubmit} icon="➕" label="Add Meal" gradient="from-green-500 to-lime-500" />
                    <button type="button" onClick={onClose} className="w-full bg-slate-600 hover:bg-slate-700 font-semibold py-3 rounded-xl transition-colors">Cancel</button>
                </div>
            </form>
        </Modal>
    );
};

const HistoryModal = ({ isOpen, onClose, log, onRemove }) => (
    <Modal isOpen={isOpen} onClose={onClose}>
        <div className="max-h-[80vh] flex flex-col">
            <h2 className="text-xl font-bold mb-4">Calorie History</h2>
            <div className="flex-grow overflow-y-auto space-y-3 pr-2">
                {log.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No meals logged yet.</p>
                ) : (
                    log.map(entry => (
                        <motion.div
                            key={entry.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                            className="bg-slate-700/50 rounded-lg p-4 border border-white/10 flex justify-between items-center group"
                        >
                            <div>
                                <div className="font-semibold">{entry.name}</div>
                                <div className="text-sm text-slate-400">
                                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                               <span className="font-bold text-green-400">{entry.calories} kcal</span>
                               <button onClick={() => onRemove(entry.id)} className="text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                               </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
            <div className="mt-6 pt-4 border-t border-white/20">
                <button onClick={onClose} className="w-full bg-slate-600 hover:bg-slate-700 font-semibold py-3 rounded-xl transition-colors">Close</button>
            </div>
        </div>
    </Modal>
);

// --- Generic UI Components ---

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const Card = ({ children }) => (
    <motion.div
        className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl"
        variants={cardVariants}
    >
        {children}
    </motion.div>
);

const InputField = ({ label, ...props }) => (
    <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">{label}</label>
        <input
            {...props}
            className="w-full px-4 py-3 bg-slate-700/50 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
        />
    </div>
);

const StatBox = ({ label, value, unit, color }) => (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        <div className="text-sm text-slate-400">{label} {unit && `(${unit})`}</div>
    </div>
);


const ChartPlaceholder = () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-700/50 rounded-lg">
        <p className="text-slate-400 text-sm">Component is loading...</p>
    </div>
);