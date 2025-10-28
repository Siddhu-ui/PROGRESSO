import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db, getUserProfile, updateUserProfile, auth } from "./firebase";
import { doc, setDoc, getDoc, updateDoc, collection, addDoc, getDocs, query, where, orderBy, limit } from "firebase/firestore";

const CalorieTracker = ({ user, addXP, userStats, setUserStats }) => {
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [mealName, setMealName] = useState("");
  const [mealCalories, setMealCalories] = useState("");
  const [mealCategory, setMealCategory] = useState("breakfast");
  const [confirmReset, setConfirmReset] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState([]);
  const [todayMealLog, setTodayMealLog] = useState([]);

  // New Food Recommendation States
  const [activeFoodCategory, setActiveFoodCategory] = useState("balanced");
  const [foodSearch, setFoodSearch] = useState("");
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);

  // Ref for meal log section
  const mealLogRef = useRef(null);

  // Load today's calorie data from Firebase
  useEffect(() => {
    if (user?.uid) {
      loadTodayData();
    } else {
      // No user, use localStorage only
      loadFromLocalStorage();
      setLoading(false);
    }
  }, [user?.uid]);

  // Also load localStorage on initial mount (for offline mode)
  useEffect(() => {
    if (!user?.uid && !loading) {
      loadFromLocalStorage();
    }
  }, []); // Empty dependency array for initial mount only

  const loadTodayData = async () => {
    try {
      setLoading(true);

      // Get user profile for daily goal
      const userProfile = await getUserProfile(user.uid);
      const userGoal = userProfile?.dailyCalorieGoal || 2000;
      setDailyGoal(userGoal);

      // Get today's meals from Firestore
      const today = new Date().toISOString().split('T')[0];
      const mealsRef = collection(db, 'userMeals', user.uid, 'meals');
      const q = query(mealsRef, where('date', '==', today), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);

      const todayMeals = [];
      let totalCalories = 0;

      querySnapshot.forEach((doc) => {
        const meal = doc.data();
        todayMeals.push({ id: doc.id, ...meal });
        totalCalories += meal.calories || 0;
      });

      setMeals(todayMeals);
      setCaloriesConsumed(totalCalories);

    } catch (error) {
      console.error('Error loading calorie data from Firebase:', error);
      console.log('Falling back to localStorage...');
      // Fallback to localStorage for offline mode
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const savedCalories = localStorage.getItem("caloriesConsumed");
      const savedGoal = localStorage.getItem("dailyCalorieGoal");
      const savedMeals = localStorage.getItem("calorieMeals");
      const savedMealLog = localStorage.getItem("todayMealLog");

      setCaloriesConsumed(savedCalories ? parseInt(savedCalories) : 0);
      setDailyGoal(savedGoal ? parseInt(savedGoal) : 2000);

      if (savedMeals) {
        try {
          const mealsData = JSON.parse(savedMeals);
          setMeals(Array.isArray(mealsData) ? mealsData : []);
        } catch (parseError) {
          console.error('Error parsing saved meals:', parseError);
          setMeals([]);
        }
      } else {
        setMeals([]);
      }

      if (savedMealLog) {
        try {
          const mealLogData = JSON.parse(savedMealLog);
          setTodayMealLog(Array.isArray(mealLogData) ? mealLogData : []);
        } catch (parseError) {
          console.error('Error parsing saved meal log:', parseError);
          setTodayMealLog([]);
        }
      } else {
        setTodayMealLog([]);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      // Reset to defaults if there's any issue
      setCaloriesConsumed(0);
      setDailyGoal(2000);
      setMeals([]);
      setTodayMealLog([]);
    }
  };

  const addMeal = async () => {
    if (!mealName.trim() || !mealCalories || isNaN(mealCalories)) return;

    const calories = parseInt(mealCalories);

    try {
      if (user?.uid) {
        // Save to Firebase
        const today = new Date().toISOString().split('T')[0];
        const mealRef = collection(db, 'userMeals', user.uid, 'meals');

        const mealData = {
          name: mealName,
          calories,
          category: mealCategory,
          timestamp: new Date().toISOString(),
          date: today
        };

        await addDoc(mealRef, mealData);

        // Update total calories
        const newCalories = caloriesConsumed + calories;
        setCaloriesConsumed(newCalories);

        // Update meals list
        setMeals(prev => [{ id: Date.now(), ...mealData }, ...prev]);

        // Update user profile if needed
        await updateUserProfile(user.uid, { totalCalories: newCalories });

      } else {
        // Fallback to localStorage for offline mode
        const newCalories = caloriesConsumed + calories;
        setCaloriesConsumed(newCalories);

        // Save to localStorage
        localStorage.setItem("caloriesConsumed", newCalories.toString());
        localStorage.setItem("calorieMeals", JSON.stringify([...meals, {
          id: Date.now(),
          name: mealName,
          calories,
          category: mealCategory,
          timestamp: new Date().toISOString()
        }]));

        // Add to today's meal log
        const mealLogItem = {
          id: `meal_${Date.now()}`,
          name: mealName,
          calories,
          protein: 0,
          carbs: 0,
          fat: 0,
          category: mealCategory,
          timestamp: new Date().toISOString(),
          source: 'custom_meal'
        };
        setTodayMealLog(prev => [...prev, mealLogItem]);
        localStorage.setItem("todayMealLog", JSON.stringify([...todayMealLog, mealLogItem]));
      }

      // Show success toast with XP gained
      setToastMessage("Meal Added Successfully! +5 XP Gained!");
      setToastType("success");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      // Add XP for logging food (5 XP per food item)
      if (addXP) {
        addXP(`food_${Date.now()}`, 5);
      }

      // Update user stats if provided
      if (setUserStats) {
        setUserStats(prev => ({
          ...prev,
          xp: prev.xp + 5,
          tasksCompleted: prev.tasksCompleted + 1
        }));
      }

      // Reset form
      setMealName("");
      setMealCalories("");
      setMealCategory("breakfast");
      setShowAddMealModal(false);

    } catch (error) {
      console.error('Error adding meal:', error);

      // Fallback to localStorage for offline mode
      const newCalories = caloriesConsumed + calories;
      setCaloriesConsumed(newCalories);

      // Save to localStorage
      localStorage.setItem("caloriesConsumed", newCalories.toString());
      localStorage.setItem("calorieMeals", JSON.stringify([...meals, {
        id: Date.now(),
        name: mealName,
        calories,
        category: mealCategory,
        timestamp: new Date().toISOString()
      }]));

      // Show success toast
      setToastMessage("Meal added locally! (Offline mode)");
      setToastType("success");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      // Reset form
      setMealName("");
      setMealCalories("");
      setMealCategory("breakfast");
      setShowAddMealModal(false);
    }
  };

  const addFoodToIntake = async (food) => {
    try {
      const newCalories = caloriesConsumed + food.calories;

      // Check if user reached or exceeded goal
      const reachedGoal = newCalories >= dailyGoal;
      const exceededGoal = newCalories > dailyGoal;

      // Update calories
      setCaloriesConsumed(newCalories);

      // Add XP for logging food (5 XP per food item)
      if (addXP) {
        addXP(`food_${food.id}`, 5);
      }

      // Update user stats if provided
      if (setUserStats) {
        setUserStats(prev => ({
          ...prev,
          xp: prev.xp + 5,
          tasksCompleted: prev.tasksCompleted + 1
        }));
      }

      // Save to Firebase
      if (user?.uid) {
        const today = new Date().toISOString().split('T')[0];
        const mealRef = collection(db, 'userMeals', user.uid, 'meals');

        const mealData = {
          name: food.name,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          category: activeFoodCategory,
          benefits: food.benefits,
          timestamp: new Date().toISOString(),
          date: today,
          source: 'food_recommendation'
        };

        await addDoc(mealRef, mealData);
        await updateUserProfile(user.uid, { totalCalories: newCalories });
      }

      // Show appropriate toast message
      if (reachedGoal) {
        setToastMessage(exceededGoal
          ? "You're slightly above your goal — stay mindful! 🌱"
          : "Great job! You reached your goal today! 💪🔥");
        setToastType(exceededGoal ? "warning" : "success");
      } else {
        setToastMessage(`Added ${food.name}! +5 XP gained!`);
        setToastType("success");
      }

      // Add to today's meal log
      const mealLogItem = {
        id: `food_${food.id}_${Date.now()}`,
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        category: activeFoodCategory,
        timestamp: new Date().toISOString(),
        source: 'food_recommendation'
      };
      setTodayMealLog(prev => [...prev, mealLogItem]);
      localStorage.setItem("todayMealLog", JSON.stringify([...todayMealLog, mealLogItem]));

      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);

      // Close modal
      setShowFoodModal(false);
      setSelectedFood(null);

    } catch (error) {
      console.error('Error adding food:', error);

      // Fallback to localStorage for offline mode
      const newCalories = caloriesConsumed + food.calories;
      setCaloriesConsumed(newCalories);

      // Save to localStorage
      localStorage.setItem("caloriesConsumed", newCalories.toString());
      localStorage.setItem("calorieMeals", JSON.stringify([...meals, {
        id: `food_${food.id}_${Date.now()}`,
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        category: activeFoodCategory,
        timestamp: new Date().toISOString()
      }]));

      // Show error toast
      setToastMessage("Added food locally! (Offline mode)");
      setToastType("success");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      // Add to today's meal log (offline mode)
      const mealLogItem = {
        id: `food_${food.id}_${Date.now()}`,
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        category: activeFoodCategory,
        timestamp: new Date().toISOString(),
        source: 'food_recommendation'
      };
      setTodayMealLog(prev => [...prev, mealLogItem]);
      localStorage.setItem("todayMealLog", JSON.stringify([...todayMealLog, mealLogItem]));

      // Close modal
      setShowFoodModal(false);
      setSelectedFood(null);
    }
  };

  const handleReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 2000);
    } else {
      try {
        if (user?.uid) {
          // Clear Firebase data
          const today = new Date().toISOString().split('T')[0];
          const mealsRef = collection(db, 'userMeals', user.uid, 'meals');
          const q = query(mealsRef, where('date', '==', today));
          const querySnapshot = await getDocs(q);

          const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
          await Promise.all(deletePromises);

          await updateUserProfile(user.uid, { totalCalories: 0 });
        }

        setCaloriesConsumed(0);
        setMeals([]);
        setTodayMealLog([]);
        // Clear localStorage
        localStorage.removeItem("caloriesConsumed");
        localStorage.removeItem("calorieMeals");
        localStorage.removeItem("todayMealLog");
        setConfirmReset(false);
      } catch (error) {
        console.error('Error resetting calories:', error);
        // Fallback to local behavior
        setCaloriesConsumed(0);
        setMeals([]);
        setTodayMealLog([]);
        localStorage.removeItem("caloriesConsumed");
        localStorage.removeItem("calorieMeals");
        localStorage.removeItem("todayMealLog");
        setConfirmReset(false);
      }
    }
  };

  const updateGoal = async (newGoal) => {
    if (newGoal > 0) {
      try {
        if (user?.uid) {
          await updateUserProfile(user.uid, { dailyCalorieGoal: newGoal });
        }
        setDailyGoal(newGoal);
        // Save to localStorage as backup
        localStorage.setItem("dailyCalorieGoal", newGoal.toString());
      } catch (error) {
        console.error('Error updating calorie goal:', error);
        // Fallback to local behavior
        setDailyGoal(newGoal);
        localStorage.setItem("dailyCalorieGoal", newGoal.toString());
      }
    }
  };

  // Sample Food Recommendations Data (keeping this for offline mode)
  const FOOD_RECOMMENDATIONS = {
    fat_loss: [
      { id: "fl1", name: "Grilled Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 3.6, benefits: ["High protein for muscle maintenance", "Low calories for fat loss", "Rich in B vitamins"] },
      { id: "fl2", name: "Spinach Salad", calories: 23, protein: 3, carbs: 4, fat: 0.4, benefits: ["Low calorie density", "High in fiber", "Packed with vitamins A, C, K"] },
      { id: "fl3", name: "Greek Yogurt", calories: 59, protein: 10, carbs: 3.6, fat: 0.4, benefits: ["Probiotic for gut health", "High protein content", "Low calorie snack"] },
      { id: "fl4", name: "Almonds", calories: 161, protein: 6, carbs: 6, fat: 14, benefits: ["Healthy fats for satiety", "Fiber for digestion", "Rich in vitamin E"] },
      { id: "fl5", name: "Quinoa", calories: 120, protein: 4.4, carbs: 22, fat: 1.9, benefits: ["Complete protein source", "High in fiber", "Gluten-free grain"] }
    ],
    muscle_gain: [
      { id: "mg1", name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 3.6, benefits: ["High quality protein", "Essential amino acids", "Supports muscle repair"] },
      { id: "mg2", name: "Sweet Potato", calories: 86, protein: 2, carbs: 20, fat: 0.1, benefits: ["Complex carbohydrates", "Vitamin A for recovery", "Sustained energy"] },
      { id: "mg3", name: "Greek Yogurt", calories: 59, protein: 10, carbs: 3.6, fat: 0.4, benefits: ["Probiotic benefits", "Calcium for bones", "High protein content"] }
    ],
    balanced: [
      { id: "b1", name: "Avocado Toast", calories: 234, protein: 6, carbs: 22, fat: 15, benefits: ["Healthy fats", "Fiber rich", "Satisfying meal"] },
      { id: "b2", name: "Mixed Berry Smoothie", calories: 120, protein: 8, carbs: 20, fat: 2, benefits: ["Antioxidant rich", "Natural sweetness", "Vitamin C boost"] },
      { id: "b3", name: "Quinoa Bowl", calories: 180, protein: 8, carbs: 30, fat: 4, benefits: ["Complete protein", "Balanced macros", "Fiber for digestion"] }
    ]
  };

  // Filter foods based on search and category
  const getFilteredFoods = () => {
    const foods = FOOD_RECOMMENDATIONS[activeFoodCategory] || [];
    if (!foodSearch.trim()) return foods;

    return foods.filter(food =>
      food.name.toLowerCase().includes(foodSearch.toLowerCase()) ||
      food.benefits.some(benefit => benefit.toLowerCase().includes(foodSearch.toLowerCase()))
    );
  };

  // Safe calculations with defaults
  const safeDailyGoal = dailyGoal || 2000;
  const safeCaloriesConsumed = caloriesConsumed || 0;
  const caloriesRemaining = Math.max(0, safeDailyGoal - safeCaloriesConsumed);
  const progressPercentage = safeDailyGoal > 0 ? Math.min((safeCaloriesConsumed / safeDailyGoal) * 100, 100) : 0;
  const isOverGoal = safeDailyGoal > 0 && safeCaloriesConsumed > safeDailyGoal;

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          width: "100%",
          maxWidth: "1000px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{
            width: "50px",
            height: "50px",
            border: "4px solid rgba(255, 255, 255, 0.1)",
            borderTop: "4px solid #10b981",
            borderRadius: "50%",
          }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        width: "100%",
        maxWidth: "1000px",
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              background: toastType === "warning"
                ? "linear-gradient(135deg, #f59e0b, #d97706)"
                : toastType === "error"
                ? "linear-gradient(135deg, #ef4444, #dc2626)"
                : "linear-gradient(135deg, #10b981, #059669)",
              color: "#fff",
              padding: "16px 24px",
              borderRadius: "15px",
              fontWeight: "600",
              boxShadow: `0 0 25px ${toastType === "warning"
                ? "rgba(245, 158, 11, 0.5)"
                : toastType === "error"
                ? "rgba(239, 68, 68, 0.5)"
                : "rgba(16, 185, 129, 0.5)"}`,
              zIndex: 1500,
              border: `1px solid ${toastType === "warning"
                ? "rgba(245, 158, 11, 0.3)"
                : toastType === "error"
                ? "rgba(239, 68, 68, 0.3)"
                : "rgba(16, 185, 129, 0.3)"}`,
            }}
          >
            {toastType === "success" ? "✅" : toastType === "warning" ? "⚠️" : "❌"} {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        whileHover={{
          rotateX: 2,
          rotateY: -2,
          transition: { type: "spring", stiffness: 150 },
        }}
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px) saturate(180%)",
          borderRadius: "25px",
          padding: "30px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "30px",
            alignItems: "center",
          }}
        >
          {/* Progress Circle */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                width: "180px",
                height: "180px",
                position: "relative",
                background: `conic-gradient(${
                  isOverGoal ? "#ef4444" : "#10b981"
                } ${progressPercentage * 3.6}deg, rgba(255, 255, 255, 0.1) 0deg)`,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 30px ${
                  isOverGoal
                    ? "rgba(239, 68, 68, 0.3)"
                    : "rgba(16, 185, 129, 0.3)"
                }`,
              }}
            >
              <div
                style={{
                  width: "140px",
                  height: "140px",
                  background: "rgba(15, 23, 42, 0.8)",
                  borderRadius: "50%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}
              >
                <div
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: "800",
                    color: isOverGoal ? "#ef4444" : "#10b981",
                  }}
                >
                  {Math.round(progressPercentage)}%
                </div>
                <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                  Complete
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                padding: "20px",
                borderRadius: "15px",
                textAlign: "center",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <motion.input
                type="number"
                value={safeDailyGoal}
                onChange={(e) => updateGoal(parseInt(e.target.value))}
                whileFocus={{ scale: 1.05 }}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#f59e0b",
                  fontSize: "1.8rem",
                  fontWeight: "800",
                  textAlign: "center",
                }}
              />
              <div style={{ fontSize: "0.9rem", color: "#64748b" }}>
                Daily Goal
              </div>
            </div>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                padding: "20px",
                borderRadius: "15px",
                textAlign: "center",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div
                style={{
                  fontSize: "1.8rem",
                  fontWeight: "800",
                  color: isOverGoal ? "#ef4444" : "#3b82f6",
                }}
              >
                {safeCaloriesConsumed}
              </div>
              <div style={{ fontSize: "0.9rem", color: "#64748b" }}>
                Consumed
              </div>
            </div>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                padding: "20px",
                borderRadius: "15px",
                textAlign: "center",
                border: `1px solid ${
                  caloriesRemaining < 0
                    ? "rgba(239,68,68,0.3)"
                    : "rgba(16,185,129,0.3)"
                }`,
              }}
            >
              <div
                style={{
                  fontSize: "1.8rem",
                  fontWeight: "800",
                  color: caloriesRemaining < 0 ? "#ef4444" : "#10b981",
                }}
              >
                {caloriesRemaining > 0 ? caloriesRemaining : 0}
              </div>
              <div style={{ fontSize: "0.9rem", color: "#64748b" }}>
                Remaining
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Add Meal Button */}
            <motion.button
              whileHover={{
                scale: 1.08,
                boxShadow: "0 0 30px rgba(34,197,94,0.6)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddMealModal(true)}
              style={{
                padding: "15px 25px",
                borderRadius: "15px",
                border: "none",
                background: "linear-gradient(135deg,#10b981,#059669)",
                color: "#fff",
                fontWeight: "700",
                fontSize: "1rem",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <motion.span
                animate={{
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background:
                    "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), transparent)",
                }}
              />
              <span style={{ position: "relative", zIndex: 2 }}>➕ Add Meal</span>
            </motion.button>

            {/* View Meal Log Button */}
            <motion.button
              whileHover={{
                scale: 1.08,
                boxShadow: "0 0 30px rgba(59,130,246,0.6)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (mealLogRef.current) {
                  mealLogRef.current.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              style={{
                padding: "15px 25px",
                borderRadius: "15px",
                border: "none",
                background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                color: "#fff",
                fontWeight: "700",
                fontSize: "1rem",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <motion.span
                animate={{
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background:
                    "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), transparent)",
                }}
              />
              <span style={{ position: "relative", zIndex: 2 }}>📋 View Meal Log</span>
            </motion.button>

            {/* Reset Button */}
            <motion.button
              whileHover={{
                scale: 1.08,
                boxShadow: "0 0 30px rgba(239,68,68,0.6)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              style={{
                padding: "15px 25px",
                borderRadius: "15px",
                border: "none",
                background: "linear-gradient(135deg,#ef4444,#dc2626)",
                color: "#fff",
                fontWeight: "700",
                fontSize: "1rem",
                cursor: "pointer",
                position: "relative",
              }}
            >
              {confirmReset ? "❗ Click Again to Confirm" : "🔄 Reset"}
            </motion.button>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: "30px" }}>
          <div
            style={{
              width: "100%",
              height: "12px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "6px",
              overflow: "hidden",
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1 }}
              style={{
                height: "100%",
                background: `linear-gradient(90deg, ${
                  isOverGoal ? "#ef4444" : "#10b981"
                }, ${isOverGoal ? "#dc2626" : "#059669"})`,
                borderRadius: "6px",
                boxShadow: `0 0 20px ${
                  isOverGoal
                    ? "rgba(239,68,68,0.5)"
                    : "rgba(16,185,129,0.5)"
                }`,
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "8px",
              fontSize: "0.9rem",
              color: "#64748b",
            }}
          >
            <span>0 kcal</span>
            <span>{safeDailyGoal} kcal</span>
          </div>
        </div>
      </motion.div>

      {/* Add Meal Modal */}
      <AnimatePresence>
        {showAddMealModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(5px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={() => setShowAddMealModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{
                background: "rgba(30, 41, 59, 0.95)",
                backdropFilter: "blur(20px)",
                borderRadius: "20px",
                padding: "30px",
                width: "90%",
                maxWidth: "450px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: "700", marginBottom: "20px", textAlign: "center" }}>
                Add New Meal
              </h3>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ color: "#94a3b8", fontSize: "0.9rem", fontWeight: "500", display: "block", marginBottom: "8px" }}>
                  Meal Name
                </label>
                <input
                  type="text"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  placeholder="e.g., Breakfast Sandwich"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    background: "rgba(0, 0, 0, 0.2)",
                    color: "#fff",
                    fontSize: "1rem",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ color: "#94a3b8", fontSize: "0.9rem", fontWeight: "500", display: "block", marginBottom: "8px" }}>
                  Calories
                </label>
                <input
                  type="number"
                  value={mealCalories}
                  onChange={(e) => setMealCalories(e.target.value)}
                  placeholder="e.g., 450"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    background: "rgba(0, 0, 0, 0.2)",
                    color: "#fff",
                    fontSize: "1rem",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ marginBottom: "25px" }}>
                <label style={{ color: "#94a3b8", fontSize: "0.9rem", fontWeight: "500", display: "block", marginBottom: "8px" }}>
                  Category
                </label>
                <select
                  value={mealCategory}
                  onChange={(e) => setMealCategory(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    background: "rgba(0, 0, 0, 0.2)",
                    color: "#fff",
                    fontSize: "1rem",
                    outline: "none",
                  }}
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addMeal}
                  disabled={!mealName.trim() || !mealCalories}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "10px",
                    border: "none",
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "#fff",
                    fontWeight: "600",
                    fontSize: "1rem",
                    cursor: (!mealName.trim() || !mealCalories) ? "not-allowed" : "pointer",
                    opacity: (!mealName.trim() || !mealCalories) ? 0.6 : 1,
                  }}
                >
                  Add Meal
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddMealModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    background: "transparent",
                    color: "#fff",
                    fontWeight: "600",
                    fontSize: "1rem",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Food Recommendations Modal */}
      <AnimatePresence>
        {showFoodModal && selectedFood && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(5px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={() => {
              setShowFoodModal(false);
              setSelectedFood(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{
                background: "rgba(30, 41, 59, 0.95)",
                backdropFilter: "blur(20px)",
                borderRadius: "20px",
                padding: "30px",
                width: "90%",
                maxWidth: "500px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: "700", marginBottom: "15px" }}>
                {selectedFood.name}
              </h3>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
                gap: "15px",
                marginBottom: "20px"
              }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#10b981" }}>
                    {selectedFood.calories}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Calories</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#3b82f6" }}>
                    {selectedFood.protein}g
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Protein</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#f59e0b" }}>
                    {selectedFood.carbs}g
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Carbs</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#ef4444" }}>
                    {selectedFood.fat}g
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Fat</div>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "600", marginBottom: "10px" }}>
                  Benefits:
                </h4>
                <ul style={{ color: "#94a3b8", fontSize: "0.9rem", paddingLeft: "20px" }}>
                  {selectedFood.benefits.map((benefit, index) => (
                    <li key={index} style={{ marginBottom: "5px" }}>• {benefit}</li>
                  ))}
                </ul>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addFoodToIntake(selectedFood)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "10px",
                    border: "none",
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "#fff",
                    fontWeight: "600",
                    fontSize: "1rem",
                    cursor: "pointer",
                  }}
                >
                  Add to Intake (+5 XP)
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowFoodModal(false);
                    setSelectedFood(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    background: "transparent",
                    color: "#fff",
                    fontWeight: "600",
                    fontSize: "1rem",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Food Recommendations Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px) saturate(180%)",
          borderRadius: "25px",
          padding: "30px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
          marginBottom: "30px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
          <h3 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: "700" }}>
            🍎 Food Recommendations
          </h3>

          <div style={{ display: "flex", gap: "10px" }}>
            {["balanced", "fat_loss", "muscle_gain"].map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFoodCategory(category)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  border: "none",
                  background: activeFoodCategory === category
                    ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                    : "rgba(255, 255, 255, 0.1)",
                  color: activeFoodCategory === category ? "#fff" : "#94a3b8",
                  fontWeight: "500",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                {category === "fat_loss" ? "Weight Loss" : category === "muscle_gain" ? "Muscle Gain" : "Balanced"}
              </motion.button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          {getFilteredFoods().map((food) => (
            <motion.div
              key={food.id}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedFood(food);
                setShowFoodModal(true);
              }}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "15px",
                padding: "20px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              <div style={{ marginBottom: "15px" }}>
                <h4 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "600", marginBottom: "5px" }}>
                  {food.name}
                </h4>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.9rem",
                  color: "#94a3b8"
                }}>
                  <span>{food.calories} kcal</span>
                  <span>{food.protein}g protein</span>
                </div>
              </div>

              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                {food.benefits[0]}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Meal Log Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        ref={mealLogRef}
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px) saturate(180%)",
          borderRadius: "25px",
          padding: "30px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
          <h3 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: "700" }}>
            📋 Today's Meal Log
          </h3>
          <div style={{ fontSize: "0.9rem", color: "#64748b" }}>
            {meals.length} meals logged
          </div>
        </div>

        {meals.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "40px",
            color: "#64748b",
            fontSize: "1.1rem"
          }}>
            No meals logged yet. Add your first meal above! 🍽️
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {meals.map((meal) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "15px",
                  padding: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "600", marginBottom: "5px" }}>
                    {meal.name}
                  </div>
                  <div style={{ color: "#64748b", fontSize: "0.9rem" }}>
                    {meal.category} • {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#10b981", fontSize: "1.2rem", fontWeight: "700" }}>
                    {meal.calories} kcal
                  </div>
                  <div style={{ color: "#64748b", fontSize: "0.8rem" }}>
                    {meal.protein ? `${meal.protein}g protein` : ''}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CalorieTracker;
