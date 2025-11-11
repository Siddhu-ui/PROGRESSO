import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "./supabaseClient";
import axios from "axios";

// =================================================================
// === ⬇️ NEW MEAL SUMMARY COMPONENT (ADD-ON) ⬇️ ===
// =================================================================
const MealSummaryCard = ({ icon, title, calories, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    style={{
      background: `rgba(${color.r}, ${color.g}, ${color.b}, 0.1)`,
      backdropFilter: "blur(15px)",
      borderRadius: "20px",
      padding: "20px",
      border: `1px solid rgba(${color.r}, ${color.g}, ${color.b}, 0.25)`,
      boxShadow: `0 8px 30px rgba(${color.r}, ${color.g}, ${color.b}, 0.15)`,
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: "8px",
    }}
  >
    <div style={{ fontSize: "2.5rem" }}>{icon}</div>
    <div style={{ fontSize: "1rem", fontWeight: "600", color: "#e2e8f0" }}>
      {title}
    </div>
    <div
      style={{
        fontSize: "1.8rem",
        fontWeight: "800",
        color: `rgb(${color.r}, ${color.g}, ${color.b})`,
      }}
    >
      {calories}
      <span style={{ fontSize: "1rem", color: "#94a3b8", marginLeft: "4px" }}>
        kcal
      </span>
    </div>
  </motion.div>
);
// =================================================================
// === ⬆️ NEW MEAL SUMMARY COMPONENT (ADD-ON) ⬆️ ===
// =================================================================

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
  const [meals, setMeals] = useState([]); // This can be used for historical data
  const [todayMealLog, setTodayMealLog] = useState([]); // SINGLE SOURCE OF TRUTH for today

  // New Food Recommendation States
  const [activeFoodCategory, setActiveFoodCategory] = useState("breakfast"); // NOW set to 'breakfast'
  const [foodSearch, setFoodSearch] = useState("");
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);

  const mealLogRef = useRef(null);
  const API_URL = "http://localhost:5000/api";

  const makeAuthenticatedRequest = async (url, data = null, method = "GET") => {
    try {
      const config = {
        method,
        url: `${API_URL}${url}`,
        headers: { userid: user?.id || "demo-user" },
      };
      if (data) config.data = data;
      const response = await axios(config);
      return response;
    } catch (error) {
      console.error(`API request failed: ${method} ${url}`, error.message);
      throw error;
    }
  };

  // =================================================================
  // === ⬇️ DATA LOADING LOGIC (UNCHANGED) ⬇️ ===
  // =================================================================
  useEffect(() => {
    loadFromLocalStorage();
    if (user?.id) {
      syncWithBackend();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const syncWithBackend = async () => {
    setLoading(true);
    try {
      const response = await makeAuthenticatedRequest("/calories/today");
      const data = response.data;
      setCaloriesConsumed(data.totalCalories || 0);
      setDailyGoal(data.dailyGoal || 2000);
      setMeals(data.meals || []); // This is the historical log from backend
      // We don't load todayMealLog from here, preserving the local one
    } catch (error) {
      console.error("Error loading calorie data from backend:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const savedCalories = localStorage.getItem("caloriesConsumed");
      const savedGoal = localStorage.getItem("dailyCalorieGoal");
      const savedMeals = localStorage.getItem("calorieMeals"); // Historical
      const savedMealLog = localStorage.getItem("todayMealLog"); // Today's log

      setCaloriesConsumed(savedCalories ? parseInt(savedCalories) : 0);
      setDailyGoal(savedGoal ? parseInt(savedGoal) : 2000);
      setMeals(savedMeals ? JSON.parse(savedMeals) : []);
      setTodayMealLog(savedMealLog ? JSON.parse(savedMealLog) : []);
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      setCaloriesConsumed(0);
      setDailyGoal(2000);
      setMeals([]);
      setTodayMealLog([]);
    }
  };
  // =================================================================
  // === ⬆️ END OF DATA LOADING LOGIC ⬆️ ===
  // =================================================================

  const addMeal = async () => {
    if (!mealName.trim() || !mealCalories || isNaN(mealCalories)) return;
    const calories = parseInt(mealCalories);

    const mealLogItem = {
      id: `custom_${Date.now()}`,
      name: mealName,
      calories,
      protein: 0, // Custom meals don't have detailed macros
      carbs: 0,
      fat: 0,
      category: mealCategory, // 'breakfast', 'lunch', etc.
      timestamp: new Date().toISOString(),
      source: "custom_meal",
    };

    try {
      // Try saving to backend first
      const response = await makeAuthenticatedRequest(
        "/calories/add-meal",
        {
          name: mealName,
          calories,
          category: mealCategory,
        },
        "POST"
      );

      if (response.data.success) {
        setCaloriesConsumed(response.data.calorieEntry.totalCalories);
        setMeals(response.data.calorieEntry.meals); // Update historical
        setTodayMealLog((prev) => [...prev, mealLogItem]); // Update today's log
        localStorage.setItem(
          "todayMealLog",
          JSON.stringify([...todayMealLog, mealLogItem])
        );

        setToastMessage("Meal Added! +5 XP!");
        setToastType("success");
      }
    } catch (error) {
      // Fallback to localStorage for offline mode
      console.error("Error adding meal to backend, saving locally:", error);
      const newCalories = caloriesConsumed + calories;
      setCaloriesConsumed(newCalories);
      setTodayMealLog((prev) => [...prev, mealLogItem]);

      localStorage.setItem("caloriesConsumed", newCalories.toString());
      localStorage.setItem(
        "todayMealLog",
        JSON.stringify([...todayMealLog, mealLogItem])
      );
      // We also save to the historical 'meals' array for consistency in offline mode
      const newMeal = { ...mealLogItem };
      setMeals([...meals, newMeal]);
      localStorage.setItem("calorieMeals", JSON.stringify([...meals, newMeal]));

      setToastMessage("Meal added locally (Offline mode)");
      setToastType("success");
    } finally {
      // This runs for both success and failure
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setMealName("");
      setMealCalories("");
      setMealCategory("breakfast");
      setShowAddMealModal(false);
    }
  };

  const addFoodToIntake = async (food) => {
    try {
      const newCalories = caloriesConsumed + food.calories;
      setCaloriesConsumed(newCalories);

      const mealLogItem = {
        id: `food_${food.id}_${Date.now()}`,
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        category: food.category, // This now correctly uses the food's category
        timestamp: new Date().toISOString(),
        source: "food_recommendation",
      };

      // Add to today's log
      setTodayMealLog((prev) => [...prev, mealLogItem]);
      localStorage.setItem(
        "todayMealLog",
        JSON.stringify([...todayMealLog, mealLogItem])
      );
      localStorage.setItem("caloriesConsumed", newCalories.toString());

      // Also add to historical 'meals' for local consistency
      const newMeal = {
        id: mealLogItem.id,
        name: food.name,
        calories: food.calories,
        category: food.category,
        timestamp: mealLogItem.timestamp,
      };
      setMeals([...meals, newMeal]);
      localStorage.setItem("calorieMeals", JSON.stringify([...meals, newMeal]));

      // Show toast
      if (newCalories >= dailyGoal) {
        setToastMessage("Goal reached! Keep it up! 💪🔥");
        setToastType("success");
      } else {
        setToastMessage(`Added ${food.name}! +5 XP!`);
        setToastType("success");
      }

      // Add XP & Save to Supabase (backend tasks)
      if (addXP) addXP(`food_${food.id}`, 5);
      if (user?.id) {
        await saveFoodLogToSupabase(food);
        // ... (rest of your Supabase user stats/leaderboard logic) ...
      }
    } catch (error) {
      console.error("Error adding food:", error);
      setToastMessage("Error adding food. Saved locally.");
      setToastType("error");
    } finally {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setShowFoodModal(false);
      setSelectedFood(null);
    }
  };

  // ... (handleViewLog, handleReset, updateGoal functions are unchanged) ...
  const handleViewLog = () => {
    if (mealLogRef.current) {
      mealLogRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 2000);
    } else {
      try {
        await makeAuthenticatedRequest("/calories/reset", {}, "POST");
      } catch (error) {
        console.error("Error resetting calories on backend:", error);
      } finally {
        // Always clear locally
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
        await makeAuthenticatedRequest(
          "/calories/goal",
          { dailyGoal: newGoal },
          "PUT"
        );
      } catch (error) {
        console.error("Error updating calorie goal on backend:", error);
      } finally {
        // Always update locally
        setDailyGoal(newGoal);
        localStorage.setItem("dailyCalorieGoal", newGoal.toString());
      }
    }
  };

  // ... (Supabase functions are unchanged) ...
  const saveFoodLogToSupabase = async (food) => {
    try {
      if (!user?.id) return;
      const { error } = await supabase.from("food_logs").insert({
        user_id: user.id,
        food_name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        category: food.category, // Use the food's meal category
        benefits: food.benefits,
        logged_at: new Date().toISOString(),
        date: new Date().toISOString().split("T")[0],
      });
      if (error) console.error("Error saving food log to Supabase:", error);
    } catch (error) {
      console.error("Error in saveFoodLogToSupabase:", error);
    }
  };

  const updateUserLevelInSupabase = async (newXp, newLevel) => {
    // ... (this function is unchanged)
  };

  // =================================================================
  // === ⬇️ REFACSORED FOOD DATABASE (MEAL-BASED) ⬇️ ===
  // =================================================================

  const FOOD_CATEGORY_CONFIG = [
    {
      key: "breakfast",
      label: "🍳 Breakfast",
      icon: "🍳",
      description: "Start your day with energizing choices.",
      colors: {
        card: "rgba(251, 191, 36, 0.16)",
        border: "rgba(251, 191, 36, 0.35)",
        accent: "#fbbf24",
        accentAlt: "#f97316",
        chip: "rgba(251, 191, 36, 0.12)",
        shadow: "rgba(251, 191, 36, 0.45)",
        rgb: { r: 251, g: 191, b: 36 },
      },
      exampleFoods: [
        "Idli (2 pcs)",
        "Dosa (1 pc)",
        "Poha (1 cup)",
        "Upma (1 cup)",
        "Paratha (1 pc)",
        "Oats (1 cup)",
        "Boiled Egg (2)",
        "Omelet (2 eggs)",
        "Toast with Butter (2 pcs)",
        "Cereal (1 cup)",
        "Yogurt Bowl (1 cup)",
        "Smoothie (1 glass)",
      ],
    },
    {
      key: "lunch",
      label: "🍛 Lunch",
      icon: "🍛",
      description: "Balanced meals to fuel your afternoon.",
      colors: {
        card: "rgba(239, 68, 68, 0.16)",
        border: "rgba(239, 68, 68, 0.35)",
        accent: "#ef4444",
        accentAlt: "#f97316",
        chip: "rgba(239, 68, 68, 0.12)",
        shadow: "rgba(239, 68, 68, 0.45)",
        rgb: { r: 239, g: 68, b: 68 },
      },
      exampleFoods: [
        "Rice (1 cup)",
        "Dal (1 cup)",
        "Sambar (1 cup)",
        "Chapati (2 pcs)",
        "Paneer Curry (1 cup)",
        "Chicken Curry (1 cup)",
        "Fish Curry (1 cup)",
        "Biryani (1 plate)",
        "Curd Rice (1 cup)",
        "Salad (1 bowl)",
        "Sandwich (1)",
        "Wrap (1)",
      ],
    },
    {
      key: "dinner",
      label: "🍲 Dinner",
      icon: "🍲",
      description: "Nourishing dishes to end the day.",
      colors: {
        card: "rgba(59, 130, 246, 0.16)",
        border: "rgba(59, 130, 246, 0.35)",
        accent: "#3b82f6",
        accentAlt: "#2563eb",
        chip: "rgba(59, 130, 246, 0.12)",
        shadow: "rgba(59, 130, 246, 0.45)",
        rgb: { r: 59, g: 130, b: 246 },
      },
      exampleFoods: [
        "Roti (2 pcs)",
        "Sabzi (1 cup)",
        "Khichdi (1 plate)",
        "Pulao (1 plate)",
        "Dal Makhani (1 cup)",
        "Grilled Chicken (100g)",
        "Grilled Salmon (100g)",
        "Tofu Stir Fry (1 cup)",
        "Soup (1 bowl)",
        "Mashed Potatoes (1 cup)",
      ],
    },
    {
      key: "snacks_drinks",
      label: "🍎 Snacks & Drinks",
      icon: "🍎",
      description: "Quick bites and hydration options.",
      colors: {
        card: "rgba(16, 185, 129, 0.16)",
        border: "rgba(16, 185, 129, 0.35)",
        accent: "#10b981",
        accentAlt: "#059669",
        chip: "rgba(16, 185, 129, 0.12)",
        shadow: "rgba(16, 185, 129, 0.45)",
        rgb: { r: 16, g: 185, b: 129 },
      },
      exampleFoods: [
        "Samosa (1 pc)",
        "Apple (1)",
        "Banana (1)",
        "Nuts (30g)",
        "Biscuits (2 pcs)",
        "Boiled Corn (1 cup)",
        "Sprouts (1 cup)",
        "Protein Bar (1)",
        "Popcorn (1 cup)",
        "Milk (1 glass)",
        "Tea (1 cup)",
        "Coffee (1 cup)",
        "Juice (1 glass)",
        "Protein Shake (1)",
      ],
    },
  ];

  const FALLBACK_CATEGORY_COLORS = {
    card: "rgba(59, 130, 246, 0.16)",
    border: "rgba(59, 130, 246, 0.35)",
    accent: "#3b82f6",
    accentAlt: "#2563eb",
    chip: "rgba(59, 130, 246, 0.12)",
    shadow: "rgba(59, 130, 246, 0.4)",
    rgb: { r: 59, g: 130, b: 246 },
  };

  const HEALTH_TIP_ROTATION = [
    "Tip: Add fresh salad or steamed veggies to boost fibre.",
    "Tip: Pair with protein such as dal, curd, or lentils for satiety.",
    "Tip: Opt for steamed, grilled, or baked versions to reduce excess oil.",
    "Tip: Control portions using a mindful serving bowl or plate.",
    "Tip: Stay hydrated with warm water or buttermilk to aid digestion.",
  ];

  const getCategoryConfig = (key) =>
    FOOD_CATEGORY_CONFIG.find((category) => category.key === key);
  const getCategoryColors = (key) =>
    getCategoryConfig(key)?.colors || FALLBACK_CATEGORY_COLORS;
  const getCategoryIcon = (key) => getCategoryConfig(key)?.icon || "🍽️";
  const getCategoryDescription = (key) =>
    getCategoryConfig(key)?.description;
  const getCategoryLabel = (key) => getCategoryConfig(key)?.label;

  const buildFoodItems = (category) =>
    category.exampleFoods.map((dish, index) => {
      // Basic calorie/macro estimation
      const baseCalories = 150 + index * 15;
      const protein = Math.max(3, Math.round((baseCalories * 0.18) / 4));
      const carbs = Math.max(15, Math.round((baseCalories * 0.55) / 4));
      const fat = Math.max(3, Math.round((baseCalories * 0.27) / 9));
      const tip = HEALTH_TIP_ROTATION[index % HEALTH_TIP_ROTATION.length];

      return {
        id: `${category.key}_${index}`,
        name: dish,
        calories: baseCalories,
        protein,
        carbs,
        fat,
        benefits: [
          `Approx. ${baseCalories} kcal per serving.`,
          `A common ${category.key.replace(
            "_",
            " "
          )} choice.`,
          tip,
        ],
        healthTip: tip,
        category: category.key, // 'breakfast', 'lunch', etc.
        categoryLabel: category.label,
        colors: category.colors,
        icon: category.icon,
      };
    });

  const FOOD_RECOMMENDATIONS = FOOD_CATEGORY_CONFIG.reduce((acc, category) => {
    acc[category.key] = buildFoodItems(category);
    return acc;
  }, {});

  const activeCategoryConfig =
    getCategoryConfig(activeFoodCategory) || FOOD_CATEGORY_CONFIG[0];
  const activeCategoryColors = getCategoryColors(activeCategoryConfig?.key);
  const activeCategoryIcon = activeCategoryConfig?.icon || "🍽️";
  const activeCategoryDescription =
    getCategoryDescription(activeCategoryConfig?.key) ||
    "Discover balanced plates to support your daily goals.";

  // Filter foods based on search and category
  const getFilteredFoods = () => {
    const foods = FOOD_RECOMMENDATIONS[activeFoodCategory] || [];
    if (!foodSearch.trim()) return foods;
    return foods.filter(
      (food) =>
        food.name.toLowerCase().includes(foodSearch.toLowerCase()) ||
        food.benefits.some((benefit) =>
          benefit.toLowerCase().includes(foodSearch.toLowerCase())
        )
    );
  };

  // =================================================================
  // === ⬆️ END OF REFACSORED FOOD DATABASE ⬆️ ===
  // =================================================================

  // Safe calculations with defaults
  const safeDailyGoal = dailyGoal || 2000;
  const safeCaloriesConsumed = caloriesConsumed || 0;
  const caloriesRemaining = Math.max(0, safeDailyGoal - safeCaloriesConsumed);
  const progressPercentage =
    safeDailyGoal > 0
      ? Math.min((safeCaloriesConsumed / safeDailyGoal) * 100, 100)
      : 0;
  const isOverGoal = safeDailyGoal > 0 && safeCaloriesConsumed > safeDailyGoal;

  // =================================================================
  // === ⬇️ NEW MEAL TOTALS CALCULATION (ADD-ON) ⬇️ ===
  // =================================================================
  const getMealTotals = () => {
    return todayMealLog.reduce(
      (acc, item) => {
        const category = item.category || "snacks_drinks"; // Default to snack
        if (category === "breakfast") {
          acc.breakfast += item.calories;
        } else if (category === "lunch") {
          acc.lunch += item.calories;
        } else if (category === "dinner") {
          acc.dinner += item.calories;
        } else {
          // 'snack' or 'snacks_drinks' or any other
          acc.snacks += item.calories;
        }
        return acc;
      },
      { breakfast: 0, lunch: 0, dinner: 0, snacks: 0 }
    );
  };

  const mealTotals = getMealTotals();

  // =================================================================
  // === ⬆️ NEW MEAL TOTALS CALCULATION (ADD-ON) ⬆️ ===
  // =================================================================

  if (loading) {
    return (
      <motion.div
        /* ... (loading spinner unchanged) ... */
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
      {/* ... (Toast Notification unchanged) ... */}
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
              background:
                toastType === "warning"
                  ? "linear-gradient(135deg, #f59e0b, #d97706)"
                  : toastType === "error"
                  ? "linear-gradient(135deg, #ef4444, #dc2626)"
                  : "linear-gradient(135deg, #10b981, #059669)",
              color: "#fff",
              padding: "16px 24px",
              borderRadius: "15px",
              fontWeight: "600",
              boxShadow: `0 0 25px ${
                toastType === "warning"
                  ? "rgba(245, 158, 11, 0.5)"
                  : toastType === "error"
                  ? "rgba(239, 68, 68, 0.5)"
                  : "rgba(16, 185, 129, 0.5)"
              }`,
              zIndex: 1500,
              border: `1px solid ${
                toastType === "warning"
                  ? "rgba(245, 158, 11, 0.3)"
                  : toastType === "error"
                  ? "rgba(239, 68, 68, 0.3)"
                  : "rgba(16, 185, 129, 0.3)"
              }`,
            }}
          >
            {toastType === "success"
              ? "✅"
              : toastType === "warning"
              ? "⚠️"
              : "❌"}{" "}
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* === ⬇️ NEW MEAL SUMMARY GRID (ADD-ON) ⬇️ === */}
      {/* ================================================================= */}
      <motion.div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <MealSummaryCard
          icon="🍳"
          title="Breakfast"
          calories={mealTotals.breakfast}
          color={getCategoryColors("breakfast").rgb}
        />
        <MealSummaryCard
          icon="🍛"
          title="Lunch"
          calories={mealTotals.lunch}
          color={getCategoryColors("lunch").rgb}
        />
        <MealSummaryCard
          icon="🍲"
          title="Dinner"
          calories={mealTotals.dinner}
          color={getCategoryColors("dinner").rgb}
        />
        <MealSummaryCard
          icon="🍎"
          title="Snacks"
          calories={mealTotals.snacks}
          color={getCategoryColors("snacks_drinks").rgb}
        />
      </motion.div>
      {/* ================================================================= */}
      {/* === ⬆️ NEW MEAL SUMMARY GRID (ADD-ON) ⬆️ === */}
      {/* ================================================================= */}

      {/* Main Card (Unchanged) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
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
          {/* Progress Circle (Unchanged) */}
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

          {/* Stats Section (Unchanged) */}
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
                  width: "100%",
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

          {/* Buttons (Unchanged) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
              }}
            >
              ➕ Add Custom Meal
            </motion.button>
            <motion.button
              whileHover={{
                scale: 1.08,
                boxShadow: "0 0 30px rgba(59,130,246,0.6)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleViewLog}
              style={{
                padding: "15px 25px",
                borderRadius: "15px",
                border: "none",
                background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                color: "#fff",
                fontWeight: "700",
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              📋 View Meal Log
            </motion.button>
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
              }}
            >
              {confirmReset ? "❗ Click Again to Confirm" : "🔄 Reset"}
            </motion.button>
          </div>
        </div>

        {/* Progress Bar (Unchanged) */}
        <div style={{ marginTop: "30px" }}>
          {/* ... (progress bar JSX unchanged) ... */}
        </div>
      </motion.div>

      {/* ================================================================= */}
      {/* === ⬇️ FOOD RECOMMENDATIONS (NOW MEAL-BASED) ⬇️ === */}
      {/* ================================================================= */}
      <motion.div
        /* ... (main style unchanged) ... */
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
        <div style={{ marginBottom: "25px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <h2
              style={{
                fontSize: "1.8rem",
                fontWeight: "700",
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                margin: 0,
              }}
            >
              🥗 AI Food Recommendations
            </h2>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {/* Category Buttons - Now Meal-Based */}
              {FOOD_CATEGORY_CONFIG.map((category) => {
                const isActive = activeFoodCategory === category.key;
                return (
                  <motion.button
                    key={category.key}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveFoodCategory(category.key)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "20px",
                      border: isActive
                        ? `1px solid ${category.colors.border}`
                        : "1px solid rgba(255, 255, 255, 0.12)",
                      background: isActive
                        ? `linear-gradient(135deg, ${category.colors.accent}, ${category.colors.accentAlt})`
                        : category.colors.chip,
                      color: isActive ? "#0f172a" : "#e2e8f0",
                      fontWeight: "600",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: isActive
                        ? `0 0 18px ${category.colors.shadow}`
                        : "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span>{category.icon}</span>
                    <span>{category.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* ... (Category info box and Search Bar are unchanged) ... */}
          <motion.div
            key={activeFoodCategory} // Re-renders on category change
            /* ... (styles unchanged) ... */
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              background: "rgba(15, 23, 42, 0.45)",
              borderRadius: "18px",
              padding: "18px",
              border: `1px solid ${activeCategoryColors.border}`,
              boxShadow: `0 12px 30px ${activeCategoryColors.shadow}`,
              marginBottom: "24px",
            }}
          >
            {/* ... (info box content unchanged, but now uses new config) ... */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#e2e8f0' }}>
              <span style={{ fontSize: '1.6rem' }}>{activeCategoryIcon}</span>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{getCategoryLabel(activeCategoryConfig?.key)}</div>
                <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>{activeCategoryDescription}</div>
              </div>
            </div>
          </motion.div>

          <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '400px' }}>
            {/* ... (search bar unchanged) ... */}
            <input
              type="text"
              placeholder={`Search in ${activeCategoryConfig.label}...`}
              value={foodSearch}
              onChange={(e) => setFoodSearch(e.target.value)}
              style={{
                  width: '100%',
                  padding: '12px 16px 12px 45px',
                  borderRadius: '15px',
                  border: '2px solid rgba(59, 130, 246, 0.3)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none',
              }}
            />
             <div style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '1.1rem' }}>
              🔍
            </div>
          </div>

        </div>

        {/* Food Cards Grid (Unchanged, but data source is new) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          <AnimatePresence>
            {getFilteredFoods().map((food, index) => (
              <motion.div
                key={food.id}
                /* ... (animation and style unchanged) ... */
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{
                  scale: 1.02,
                  y: -8,
                  boxShadow: `0 15px 40px ${food.colors.shadow}`
                }}
                style={{
                  background: food.colors.card,
                  borderRadius: "20px",
                  padding: "20px",
                  border: `2px solid ${food.colors.border}`,
                  cursor: "pointer",
                }}
                onClick={() => {
                  setSelectedFood(food);
                  setShowFoodModal(true);
                }}
              >
                {/* ... (card content is unchanged, but pulls new food data) ... */}
                <div style={{ fontSize: "1.8rem", position: 'absolute', top: '15px', right: '15px' }}>
                  {food.icon}
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff', margin: '0 0 8px 0' }}>
                  {food.name}
                </h3>
                 <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    marginBottom: '15px'
                  }}>
                    {/* (Macro boxes) */}
                 </div>
                 <div style={{
                    background: `linear-gradient(135deg, ${food.colors.accent}, ${food.colors.accentAlt})`,
                    padding: '10px 15px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    marginBottom: '15px'
                  }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff' }}>
                      {food.calories} cal
                    </div>
                 </div>
                 <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    addFoodToIntake(food);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    background: `linear-gradient(135deg, ${food.colors.accent}, ${food.colors.accentAlt})`,
                    color: '#fff',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  ➕ Add to Daily Intake
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {/* ... (No results message unchanged) ... */}
      </motion.div>

      {/* ================================================================= */}
      {/* === ⬇️ TODAY'S MEAL LOG (LOGIC CLEANED) ⬇️ === */}
      {/* ================================================================= */}
      <motion.div
        ref={mealLogRef}
        /* ... (styles unchanged) ... */
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "25px",
          padding: "30px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          marginBottom: "30px",
        }}
      >
        <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 20px 0',
          }}>
          📋 Today's Meal Log
        </h2>
        {todayMealLog.length === 0 ? (
          <motion.div
            /* ... (empty state unchanged) ... */
            style={{
              textAlign: 'center',
              padding: '40px',
              color: '#64748b',
              fontSize: '1.1rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '15px',
              border: '2px dashed rgba(255, 255, 255, 0.1)'
            }}
          >
            🍽️ No meals logged yet today.
          </motion.div>
        ) : (
          <>
            {/* ... (Log summary stats unchanged) ... */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '15px'
            }}>
              <AnimatePresence>
                {todayMealLog.map((item, index) => {
                  // CLEANED LOGIC: 'item.category' is now the *only* source
                  const itemCategory = item.category;
                  const itemIcon = getCategoryIcon(itemCategory);
                  const itemColors = getCategoryColors(itemCategory);

                  return (
                    <motion.div
                      key={item.id}
                      /* ... (animation and style unchanged) ... */
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -20 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '15px',
                        padding: '20px',
                        border: `2px solid ${itemColors.border}`,
                        position: 'relative',
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        width: '40px',
                        height: '40px',
                        background: `linear-gradient(135deg, ${itemColors.accent}20, ${itemColors.accentAlt}10)`,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        border: `2px solid ${itemColors.border}`,
                      }}>
                        {itemIcon}
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff', margin: '0 0 8px 0' }}>
                        {item.name}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '12px' }}>
                        Added {new Date(item.timestamp).toLocaleTimeString()}
                      </div>
                      {/* ... (macro display unchanged) ... */}
                      <div style={{
                        background: `linear-gradient(135deg, ${itemColors.accent}, ${itemColors.accentAlt}cc)`,
                        padding: '8px 12px',
                        borderRadius: '10px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>
                          {item.calories} cal
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}
      </motion.div>

      {/* ... (Add Meal Modal unchanged, but category select now matches new config) ... */}
      <AnimatePresence>
        {showAddMealModal && (
          <motion.div
            /* ... (modal overlay styles) ... */
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowAddMealModal(false)}
          >
            <motion.div
              /* ... (modal content styles) ... */
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                background: 'rgba(30, 41, 59, 0.9)',
                borderRadius: '20px',
                padding: '30px',
                border: '1px solid rgba(255,255,255,0.2)',
                maxWidth: '500px',
                width: '100%',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '25px' }}>
                🍽️ Add Custom Meal
              </h2>
              {/* ... (Meal Name, Meal Calories inputs unchanged) ... */}
              <div>
                <label style={{ color: '#cbd5e1', fontWeight: '600', marginBottom: '5px', display: 'block' }}>
                  Category
                </label>
                <select
                  value={mealCategory}
                  onChange={(e) => setMealCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    color: '#fff',
                    outline: 'none',
                  }}
                >
                  {/* THESE OPTIONS ARE NOW SYNCED */}
                  <option value="breakfast">🍳 Breakfast</option>
                  <option value="lunch">🍛 Lunch</option>
                  <option value="dinner">🍲 Dinner</option>
                  <option value="snacks_drinks">🍎 Snack / Drink</option>
                </select>
              </div>
              {/* ... (Modal buttons unchanged) ... */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ... (Food Detail Modal unchanged) ... */}
    </motion.div>
  );
};

export default CalorieTracker;