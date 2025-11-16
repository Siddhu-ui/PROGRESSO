import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GiWheat, GiHotMeal, GiNoodles, GiChickenOven, GiFruitBowl,
  GiRiceCooker, GiFlatfish, GiCupcake, GiCoffeeCup,
  GiBread, GiCorn, GiHotDog, GiMilkCarton, GiChocolateBar
} from 'react-icons/gi';
import { 
  IoFastFoodOutline, IoIceCreamOutline, IoNutrition, IoWaterOutline
} from 'react-icons/io5';
import { 
  MdRestaurant, MdOutlineFoodBank, MdLunchDining, MdFastfood,
  MdLocalDining, MdOutlineBreakfastDining, MdOutlineRiceBowl
} from 'react-icons/md';
import { 
  FaAppleAlt, FaBreadSlice, FaHamburger, FaLeaf, FaPizzaSlice,
  FaCarrot, FaCookie, FaDrumstickBite, FaCheese
} from 'react-icons/fa';
import { 
  BiDrink, BiDish 
} from 'react-icons/bi';

// =================================================================
// === ⬇️ DESIGN & DATA CONFIGURATION ⬇️ ===
// =================================================================

// Centralized design theme - Updated to match lavender/white theme
const designTheme = {
  background: "linear-gradient(135deg, #f8f9ff 0%, #e8eaff 100%)", // Soft lavender gradient
  cardBg: "rgba(255, 255, 255, 0.95)",     // White with slight transparency
  text: "#2d3748",         // Dark grey for readability
  textSecondary: "#718096", // Medium grey
  border: "#d8b4fe",      // Light lavender border
  shadow: "0 4px 12px rgba(139, 92, 246, 0.1)", // Soft purple shadow
  accent: "#8b5cf6", // Lavender accent
};

// Centralized configuration for all food categories
const FOOD_CATEGORY_CONFIG = [
  { key: "breakfast", label: "Breakfast", icon: MdOutlineBreakfastDining, accent: "#f59e0b", description: "Start your day with a balanced meal." },
  { key: "lunch", label: "Lunch", icon: MdLunchDining, accent: "#10b981", description: "Refuel for the afternoon." },
  { key: "dinner", label: "Dinner", icon: MdRestaurant, accent: "#3b82f6", description: "Wind down with a nourishing dinner." },
  { key: "snacks_drinks", label: "Snacks & Drinks", icon: FaAppleAlt, accent: "#ef4444", description: "Healthy snacks and hydration." },
];

// Helper functions to get data from the config
const getCategoryConfig = (key) => FOOD_CATEGORY_CONFIG.find(c => c.key === key) || FOOD_CATEGORY_CONFIG.find(c => c.key === 'snacks_drinks');
const getCategoryAccent = (key) => getCategoryConfig(key).accent;
const getCategoryLabel = (key) => getCategoryConfig(key).label;
const getCategoryIcon = (key) => getCategoryConfig(key).icon;
const getCategoryDescription = (key) => getCategoryConfig(key).description;
const getCategoryColors = (key) => {
  const config = getCategoryConfig(key);
  return {
    accent: config.accent,
    accentAlt: config.accent, // Simple version
    border: `${config.accent}40`, // accent with alpha
  };
};

// Icon mapping for each food item
const FOOD_ICON_MAP = {
  // Breakfast
  'Oatmeal': GiWheat,
  'Greek Yogurt': IoIceCreamOutline,
  'Scrambled Eggs (2)': MdOutlineBreakfastDining,
  'Idli (2 pcs)': MdOutlineRiceBowl,
  'Dosa (1 pc)': MdLocalDining,
  'Poha (1 cup)': GiRiceCooker,
  'Upma (1 cup)': GiWheat,
  'Paratha (1 pc)': FaBreadSlice,
  'Boiled Eggs (2)': MdOutlineBreakfastDining,
  'Pancakes (2)': GiCupcake,
  'French Toast': FaBreadSlice,
  'Cereal (1 cup)': GiWheat,
  'Smoothie Bowl': GiFruitBowl,
  'Avocado Toast': FaBreadSlice,
  'Bagel with Cream Cheese': FaBreadSlice,
  // Lunch
  'Chicken Salad': FaLeaf,
  'Quinoa Bowl': MdOutlineRiceBowl,
  'Rice & Dal (1 cup each)': GiRiceCooker,
  'Sambar Rice (1 plate)': MdOutlineRiceBowl,
  'Chapati (2) with Sabzi': FaBreadSlice,
  'Curd Rice (1 cup)': MdOutlineRiceBowl,
  'Paneer Curry (1 cup)': FaCheese,
  'Chicken Curry (1 cup)': GiChickenOven,
  'Fish Curry (1 cup)': GiFlatfish,
  'Biryani (1 plate)': GiRiceCooker,
  'Burger (Chicken)': FaHamburger,
  'Sandwich (Veg)': FaBreadSlice,
  'Pasta (1 plate)': GiNoodles,
  'Sushi Roll (8 pcs)': GiFlatfish,
  'Stir Fry Noodles': GiNoodles,
  // Dinner
  'Salmon & Asparagus': GiFlatfish,
  'Lentil Soup': BiDish,
  'Roti (2) with Dal': FaBreadSlice,
  'Khichdi (1 plate)': GiRiceCooker,
  'Grilled Chicken (200g)': GiChickenOven,
  'Tofu Stir Fry': IoNutrition,
  'Fish Fry (2 pcs)': GiFlatfish,
  'Dal Makhani (1 cup)': BiDish,
  'Pulao (1 plate)': GiRiceCooker,
  'Vegetable Curry': FaLeaf,
  'Grilled Vegetables': FaCarrot,
  'Paneer Tikka (6 pcs)': FaCheese,
  'Chicken Salad Bowl': FaDrumstickBite,
  'Steak (150g)': MdFastfood,
  'Veg Pasta': GiNoodles,
  // Snacks & Drinks
  'Apple': FaAppleAlt,
  'Almonds (30g)': IoNutrition,
  'Water': IoWaterOutline,
  'Banana': GiFruitBowl,
  'Samosa (1 pc)': MdFastfood,
  'Boiled Corn (1 cup)': GiCorn,
  'Sprouts (1 cup)': FaLeaf,
  'Protein Bar': IoNutrition,
  'Popcorn (2 cups)': GiCorn,
  'Milk (1 glass)': GiMilkCarton,
  'Tea (1 cup)': GiCoffeeCup,
  'Coffee (Black)': GiCoffeeCup,
  'Orange Juice (1 glass)': BiDrink,
  'Protein Shake': BiDrink,
  'Dark Chocolate (2 pcs)': GiChocolateBar,
  'Greek Yogurt Cup': IoIceCreamOutline,
  'Biscuits (2 pcs)': FaCookie,
  'Carrot Sticks (1 cup)': FaCarrot,
  'Roasted Chickpeas': IoNutrition,
  'Smoothie (Mixed Fruit)': BiDrink,
};

/**
 * Generates food items for a given category with extensive database.
 * Expanded with realistic Indian and international food options.
 */
const buildFoodItems = (category) => {
  const items = {
    breakfast: [
      // Traditional breakfast items
      { id: 'b1', name: 'Oatmeal', calories: 150, protein: 5, carbs: 27, fat: 3, benefits: ['Heart-healthy', 'Fiber'], healthTip: 'Add berries for antioxidants.' },
      { id: 'b2', name: 'Greek Yogurt', calories: 100, protein: 17, carbs: 6, fat: 0, benefits: ['High protein', 'Probiotics'], healthTip: 'Great for gut health.' },
      { id: 'b3', name: 'Scrambled Eggs (2)', calories: 210, protein: 18, carbs: 2, fat: 15, benefits: ['Protein-rich', 'Vitamins'], healthTip: 'Use olive oil instead of butter.' },
      { id: 'b4', name: 'Idli (2 pcs)', calories: 156, protein: 4, carbs: 32, fat: 1, benefits: ['Low fat', 'Fermented'], healthTip: 'Pair with sambar for protein.' },
      { id: 'b5', name: 'Dosa (1 pc)', calories: 168, protein: 5, carbs: 28, fat: 4, benefits: ['Fermented', 'Energy'], healthTip: 'Use less oil for healthier option.' },
      { id: 'b6', name: 'Poha (1 cup)', calories: 250, protein: 6, carbs: 45, fat: 6, benefits: ['Light', 'Iron'], healthTip: 'Add peanuts for extra protein.' },
      { id: 'b7', name: 'Upma (1 cup)', calories: 280, protein: 7, carbs: 50, fat: 5, benefits: ['Quick energy', 'Fiber'], healthTip: 'Add vegetables for nutrients.' },
      { id: 'b8', name: 'Paratha (1 pc)', calories: 300, protein: 6, carbs: 42, fat: 12, benefits: ['Filling', 'Traditional'], healthTip: 'Whole wheat is healthier.' },
      { id: 'b9', name: 'Boiled Eggs (2)', calories: 155, protein: 13, carbs: 1, fat: 11, benefits: ['Pure protein', 'Portable'], healthTip: 'Perfect pre-workout meal.' },
      { id: 'b10', name: 'Pancakes (2)', calories: 340, protein: 8, carbs: 58, fat: 8, benefits: ['Sweet treat', 'Energy'], healthTip: 'Use whole grain flour.' },
      { id: 'b11', name: 'French Toast', calories: 320, protein: 12, carbs: 48, fat: 10, benefits: ['Comfort food', 'Protein'], healthTip: 'Top with fruit instead of syrup.' },
      { id: 'b12', name: 'Cereal (1 cup)', calories: 220, protein: 6, carbs: 45, fat: 2, benefits: ['Quick', 'Fortified'], healthTip: 'Choose low-sugar options.' },
      { id: 'b13', name: 'Smoothie Bowl', calories: 280, protein: 10, carbs: 52, fat: 5, benefits: ['Antioxidants', 'Vitamins'], healthTip: 'Add chia seeds for omega-3.' },
      { id: 'b14', name: 'Avocado Toast', calories: 350, protein: 10, carbs: 35, fat: 20, benefits: ['Healthy fats', 'Fiber'], healthTip: 'A trendy nutritious choice.' },
      { id: 'b15', name: 'Bagel with Cream Cheese', calories: 380, protein: 12, carbs: 58, fat: 12, benefits: ['Filling', 'Calcium'], healthTip: 'Choose whole wheat bagel.' },
    ],
    lunch: [
      // Lunch options
      { id: 'l1', name: 'Chicken Salad', calories: 350, protein: 30, carbs: 10, fat: 20, benefits: ['Lean protein', 'Greens'], healthTip: 'Watch out for high-calorie dressings.' },
      { id: 'l2', name: 'Quinoa Bowl', calories: 450, protein: 15, carbs: 60, fat: 18, benefits: ['Complete protein', 'Fiber'], healthTip: 'A balanced vegetarian option.' },
      { id: 'l3', name: 'Rice & Dal (1 cup each)', calories: 420, protein: 14, carbs: 75, fat: 5, benefits: ['Complete meal', 'Protein'], healthTip: 'Indian staple combo.' },
      { id: 'l4', name: 'Sambar Rice (1 plate)', calories: 380, protein: 12, carbs: 68, fat: 6, benefits: ['Balanced', 'Vegetables'], healthTip: 'Rich in vitamins.' },
      { id: 'l5', name: 'Chapati (2) with Sabzi', calories: 400, protein: 12, carbs: 60, fat: 12, benefits: ['Whole grain', 'Vegetables'], healthTip: 'Use minimal oil in sabzi.' },
      { id: 'l6', name: 'Curd Rice (1 cup)', calories: 300, protein: 10, carbs: 52, fat: 6, benefits: ['Probiotic', 'Cooling'], healthTip: 'Great for digestion.' },
      { id: 'l7', name: 'Paneer Curry (1 cup)', calories: 420, protein: 18, carbs: 20, fat: 28, benefits: ['Calcium', 'Protein'], healthTip: 'High in saturated fat.' },
      { id: 'l8', name: 'Chicken Curry (1 cup)', calories: 380, protein: 32, carbs: 15, fat: 22, benefits: ['Protein-rich', 'Flavorful'], healthTip: 'Remove skin for less fat.' },
      { id: 'l9', name: 'Fish Curry (1 cup)', calories: 320, protein: 28, carbs: 12, fat: 18, benefits: ['Omega-3', 'Lean'], healthTip: 'Excellent for heart health.' },
      { id: 'l10', name: 'Biryani (1 plate)', calories: 550, protein: 20, carbs: 75, fat: 18, benefits: ['Festive', 'Complete'], healthTip: 'Portion control is key.' },
      { id: 'l11', name: 'Burger (Chicken)', calories: 520, protein: 28, carbs: 48, fat: 22, benefits: ['Satisfying', 'Portable'], healthTip: 'Skip fries to reduce calories.' },
      { id: 'l12', name: 'Sandwich (Veg)', calories: 320, protein: 12, carbs: 45, fat: 10, benefits: ['Quick', 'Balanced'], healthTip: 'Add more veggies.' },
      { id: 'l13', name: 'Pasta (1 plate)', calories: 480, protein: 14, carbs: 72, fat: 15, benefits: ['Energy', 'Filling'], healthTip: 'Choose whole wheat pasta.' },
      { id: 'l14', name: 'Sushi Roll (8 pcs)', calories: 380, protein: 16, carbs: 58, fat: 8, benefits: ['Light', 'Omega-3'], healthTip: 'Low-calorie if not fried.' },
      { id: 'l15', name: 'Stir Fry Noodles', calories: 460, protein: 18, carbs: 62, fat: 16, benefits: ['Vegetables', 'Quick'], healthTip: 'Control oil amount.' },
    ],
    dinner: [
      // Dinner options
      { id: 'd1', name: 'Salmon & Asparagus', calories: 500, protein: 40, carbs: 20, fat: 30, benefits: ['Omega-3', 'Vitamins'], healthTip: 'Baking or grilling is healthiest.' },
      { id: 'd2', name: 'Lentil Soup', calories: 300, protein: 18, carbs: 40, fat: 10, benefits: ['High fiber', 'Plant-based'], healthTip: 'A hearty, low-fat meal.' },
      { id: 'd3', name: 'Roti (2) with Dal', calories: 380, protein: 14, carbs: 62, fat: 8, benefits: ['Traditional', 'Balanced'], healthTip: 'Whole wheat roti is best.' },
      { id: 'd4', name: 'Khichdi (1 plate)', calories: 320, protein: 12, carbs: 55, fat: 6, benefits: ['Easy digestion', 'Comfort'], healthTip: 'Perfect for light dinner.' },
      { id: 'd5', name: 'Grilled Chicken (200g)', calories: 420, protein: 48, carbs: 0, fat: 24, benefits: ['High protein', 'Low carb'], healthTip: 'Excellent for muscle building.' },
      { id: 'd6', name: 'Tofu Stir Fry', calories: 340, protein: 22, carbs: 28, fat: 16, benefits: ['Plant protein', 'Iron'], healthTip: 'Vegan protein source.' },
      { id: 'd7', name: 'Fish Fry (2 pcs)', calories: 380, protein: 32, carbs: 15, fat: 22, benefits: ['Protein', 'Omega-3'], healthTip: 'Baked is healthier than fried.' },
      { id: 'd8', name: 'Dal Makhani (1 cup)', calories: 450, protein: 16, carbs: 45, fat: 22, benefits: ['Protein', 'Creamy'], healthTip: 'High in calories, enjoy in moderation.' },
      { id: 'd9', name: 'Pulao (1 plate)', calories: 420, protein: 10, carbs: 68, fat: 12, benefits: ['Aromatic', 'Filling'], healthTip: 'Add vegetables for nutrition.' },
      { id: 'd10', name: 'Vegetable Curry', calories: 280, protein: 8, carbs: 38, fat: 12, benefits: ['Fiber', 'Vitamins'], healthTip: 'Low-calorie, nutrient-rich.' },
      { id: 'd11', name: 'Grilled Vegetables', calories: 180, protein: 6, carbs: 28, fat: 6, benefits: ['Low cal', 'Fiber'], healthTip: 'Perfect side or light meal.' },
      { id: 'd12', name: 'Paneer Tikka (6 pcs)', calories: 380, protein: 20, carbs: 12, fat: 28, benefits: ['Protein', 'Calcium'], healthTip: 'Grilled is healthier.' },
      { id: 'd13', name: 'Chicken Salad Bowl', calories: 320, protein: 32, carbs: 18, fat: 14, benefits: ['High protein', 'Fresh'], healthTip: 'Ideal for weight loss.' },
      { id: 'd14', name: 'Steak (150g)', calories: 480, protein: 38, carbs: 0, fat: 36, benefits: ['Iron', 'Protein'], healthTip: 'Choose lean cuts.' },
      { id: 'd15', name: 'Veg Pasta', calories: 420, protein: 12, carbs: 64, fat: 14, benefits: ['Comfort', 'Vegetables'], healthTip: 'Use tomato-based sauce.' },
    ],
    snacks_drinks: [
      // Snacks and drinks
      { id: 's1', name: 'Apple', calories: 95, protein: 0, carbs: 25, fat: 0, benefits: ['Fiber', 'Vitamins'], healthTip: 'An apple a day keeps doctor away!' },
      { id: 's2', name: 'Almonds (30g)', calories: 160, protein: 6, carbs: 6, fat: 14, benefits: ['Healthy fats', 'Protein'], healthTip: 'Portion control is key.' },
      { id: 's3', name: 'Water', calories: 0, protein: 0, carbs: 0, fat: 0, benefits: ['Hydration'], healthTip: 'Drink at least 8 glasses a day.' },
      { id: 's4', name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0, benefits: ['Potassium', 'Energy'], healthTip: 'Perfect pre-workout snack.' },
      { id: 's5', name: 'Samosa (1 pc)', calories: 252, protein: 4, carbs: 32, fat: 12, benefits: ['Crispy', 'Traditional'], healthTip: 'High in calories, enjoy occasionally.' },
      { id: 's6', name: 'Boiled Corn (1 cup)', calories: 180, protein: 5, carbs: 38, fat: 2, benefits: ['Fiber', 'Vitamins'], healthTip: 'Healthy street food option.' },
      { id: 's7', name: 'Sprouts (1 cup)', calories: 120, protein: 8, carbs: 20, fat: 1, benefits: ['Protein', 'Fiber'], healthTip: 'Superfood snack.' },
      { id: 's8', name: 'Protein Bar', calories: 220, protein: 15, carbs: 25, fat: 8, benefits: ['Convenient', 'Protein'], healthTip: 'Check sugar content.' },
      { id: 's9', name: 'Popcorn (2 cups)', calories: 120, protein: 4, carbs: 24, fat: 3, benefits: ['Fiber', 'Low cal'], healthTip: 'Air-popped is best.' },
      { id: 's10', name: 'Milk (1 glass)', calories: 150, protein: 8, carbs: 12, fat: 8, benefits: ['Calcium', 'Protein'], healthTip: 'Choose low-fat for fewer calories.' },
      { id: 's11', name: 'Tea (1 cup)', calories: 30, protein: 1, carbs: 4, fat: 1, benefits: ['Antioxidants', 'Refreshing'], healthTip: 'Limit sugar.' },
      { id: 's12', name: 'Coffee (Black)', calories: 2, protein: 0, carbs: 0, fat: 0, benefits: ['Energy', 'Metabolism'], healthTip: 'Avoid excess sugar/cream.' },
      { id: 's13', name: 'Orange Juice (1 glass)', calories: 120, protein: 2, carbs: 28, fat: 0, benefits: ['Vitamin C', 'Refreshing'], healthTip: 'Fresh is better than packaged.' },
      { id: 's14', name: 'Protein Shake', calories: 180, protein: 25, carbs: 10, fat: 3, benefits: ['Muscle recovery', 'Convenient'], healthTip: 'Great post-workout.' },
      { id: 's15', name: 'Dark Chocolate (2 pcs)', calories: 110, protein: 1, carbs: 12, fat: 7, benefits: ['Antioxidants', 'Mood'], healthTip: 'Moderation is key.' },
      { id: 's16', name: 'Greek Yogurt Cup', calories: 140, protein: 15, carbs: 10, fat: 4, benefits: ['Probiotics', 'Protein'], healthTip: 'Choose plain to avoid sugar.' },
      { id: 's17', name: 'Biscuits (2 pcs)', calories: 120, protein: 2, carbs: 18, fat: 5, benefits: ['Quick snack', 'Portable'], healthTip: 'Check for trans fats.' },
      { id: 's18', name: 'Carrot Sticks (1 cup)', calories: 50, protein: 1, carbs: 12, fat: 0, benefits: ['Low cal', 'Beta-carotene'], healthTip: 'Perfect guilt-free snack.' },
      { id: 's19', name: 'Roasted Chickpeas', calories: 140, protein: 7, carbs: 22, fat: 2, benefits: ['Protein', 'Fiber'], healthTip: 'Crunchy healthy snack.' },
      { id: 's20', name: 'Smoothie (Mixed Fruit)', calories: 200, protein: 4, carbs: 45, fat: 2, benefits: ['Vitamins', 'Refreshing'], healthTip: 'Use whole fruits, not juice.' },
    ]
  };
  return (items[category.key] || []).map(item => ({
    ...item,
    category: category.key,
    categoryLabel: category.label,
    accent: category.accent,
    icon: FOOD_ICON_MAP[item.name] || MdOutlineFoodBank,
  }));
};

// Build the complete food database
const FOOD_RECOMMENDATIONS = FOOD_CATEGORY_CONFIG.reduce((acc, category) => {
  acc[category.key] = buildFoodItems(category);
  return acc;
}, {});

// =================================================================
// === ⬇️ PROFESSIONAL MEAL SUMMARY CARD ⬇️ ===
// =================================================================
const MealSummaryCard = ({ icon: IconComponent, title, calories, accent }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    style={{
      background: designTheme.cardBg,
      border: `2px solid ${accent}`,
      borderRadius: "18px",
      boxShadow: designTheme.shadow,
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      padding: "20px 0 16px 0",
      minHeight: 120,
    }}
  >
    <div style={{ color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <IconComponent size={40} />
    </div>
    <div style={{ fontSize: "1rem", fontWeight: 600, color: designTheme.textSecondary }}>{title}</div>
    <div style={{ fontSize: "1.7rem", fontWeight: 800, color: accent }}>
      {calories}
      <span style={{ fontSize: "1rem", color: designTheme.textSecondary, marginLeft: 4 }}>kcal</span>
    </div>
  </motion.div>
);

// =================================================================
// === ⬇️ MAIN CALORIE TRACKER COMPONENT ⬇️ ===
// =================================================================
function CalorieTracker({ user, addXP, userStats, setUserStats }) {
  // === State Variables ===
  const [loading, setLoading] = useState(false); // Mock loading state
  const [todayMealLog, setTodayMealLog] = useState([]); // Holds logged meals
  
  // Stats state (derived from userStats prop or local state)
  const [dailyGoal, setDailyGoal] = useState(userStats?.dailyGoal || 2000);
  
  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // 'success', 'warning', 'error'
  
  // Food Recommendation state
  const [activeFoodCategory, setActiveFoodCategory] = useState("breakfast");
  const [foodSearch, setFoodSearch] = useState("");
  
  // Modal states
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  
  // Add Custom Meal form state
  const [mealName, setMealName] = useState("");
  const [mealCalories, setMealCalories] = useState("");
  const [mealCategory, setMealCategory] = useState("breakfast");
  
  // Other UI state
  const [confirmReset, setConfirmReset] = useState(false);
  const mealLogRef = useRef(null);

  // === Toast Notification Helper ===
  const showAppToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // === Core Logic & Calculations ===

  // Calculate total calories consumed from the log
  const caloriesConsumed = todayMealLog.reduce((acc, item) => acc + item.calories, 0);

  // Safe calculations with defaults
  const safeDailyGoal = dailyGoal || 2000;
  const safeCaloriesConsumed = caloriesConsumed || 0;
  const caloriesRemaining = Math.max(0, safeDailyGoal - safeCaloriesConsumed);
  const progressPercentage =
    safeDailyGoal > 0
      ? Math.min((safeCaloriesConsumed / safeDailyGoal) * 100, 100)
      : 0;
  const isOverGoal = safeDailyGoal > 0 && safeCaloriesConsumed > safeDailyGoal;

  // Calculate totals for each meal category
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
  
  // === Event Handlers ===

  /**
   * Adds a food item from the recommendations list to the log.
   */
  const addFoodToIntake = (food) => {
    const mealLogItem = {
      ...food,
      id: `food_${Date.now()}`, // Unique ID for the log entry
      timestamp: Date.now(),
    };
    
    // In a real app, you'd save this to Firebase
    // await saveMealToFirebase(user.uid, mealLogItem);
    
    setTodayMealLog(prevLog => [mealLogItem, ...prevLog]);

    // Mock updating parent stats
    setUserStats(prevStats => ({
        ...prevStats,
        totalCalories: (prevStats.totalCalories || 0) + food.calories,
    }));
    addXP(10); // Give XP for logging
    
    showAppToast(`${food.name} added!`, "success");
    setShowFoodModal(false); // Close modal if open
  };

  /**
   * Adds a custom meal from the modal form to the log.
   */
  const addCustomMeal = () => {
    if (!mealName || !mealCalories) {
      showAppToast("Please enter a name and calorie amount.", "warning");
      return;
    }
    
    const calories = parseInt(mealCalories);
    if (isNaN(calories) || calories <= 0) {
      showAppToast("Please enter valid calories.", "warning");
      return;
    }

    const mealLogItem = {
      id: `custom_${Date.now()}`,
      name: mealName,
      calories: calories,
      protein: 0, // Custom meals don't have detailed macros
      carbs: 0,
      fat: 0,
      category: mealCategory, // 'breakfast', 'lunch', etc.
      timestamp: Date.now(),
    };

    // In a real app, you'd save this to Firebase
    // await saveMealToFirebase(user.uid, mealLogItem);
    
    setTodayMealLog(prevLog => [mealLogItem, ...prevLog]);
    
    // Mock updating parent stats
    setUserStats(prevStats => ({
        ...prevStats,
        totalCalories: (prevStats.totalCalories || 0) + calories,
    }));
    addXP(20); // Give XP for logging
    
    showAppToast("Custom meal added!", "success");
    
    // Reset modal
    setShowAddMealModal(false);
    setMealName("");
    setMealCalories("");
    setMealCategory("breakfast");
  };

  /**
   * Placeholder for viewing the full log (e.g., navigating to another page).
   */
  const handleViewLog = () => {
    // This could scroll down, or toggle a different view
    mealLogRef.current?.scrollIntoView({ behavior: "smooth" });
    showAppToast("Scrolled to meal log.", "success");
  };

  /**
   * Resets the daily log (with confirmation).
   */
  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      showAppToast("Click again to confirm reset.", "warning");
      setTimeout(() => setConfirmReset(false), 3000); // Reset confirmation
      return;
    }

    // In a real app, you'd clear this in Firebase
    // await resetDailyLog(user.uid);
    
    setTodayMealLog([]);
    // You might also reset parent stats here
    setUserStats(prevStats => ({
        ...prevStats,
        // Reset relevant daily stats
    }));
    
    showAppToast("Log reset!", "success");
    setConfirmReset(false);
  };
  
  // === Food Recommendation Filtering ===

  const activeCategoryConfig = getCategoryConfig(activeFoodCategory);
  const activeCategoryAccent = getCategoryAccent(activeCategoryConfig?.key);
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
  // === ⬇️ RENDER LOGIC ⬇️ ===
  // =================================================================

  if (loading) {
    return (
      <motion.div
        style={{
          // Full-bleed loading container
          width: "100vw",
          minHeight: "40dvh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: designTheme.background,
          marginLeft: "calc(50% - 50vw)",
          marginRight: "calc(50% - 50vw)",
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
        // Full-bleed section that breaks out of any centered parent
        width: "100vw",
        minHeight: "100dvh",
        position: "relative",
        background: designTheme.background,
        padding: "clamp(20px, 3vw, 40px)",
        boxSizing: "border-box",
        // Make this section span the full viewport width even if parent is centered
        marginLeft: "calc(50% - 50vw)",
        marginRight: "calc(50% - 50vw)",
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
                ? "#fbbf24"
                : toastType === "error"
                ? "#ef4444"
                : "#10b981",
              color: "#fff",
              padding: "16px 24px",
              borderRadius: "15px",
              fontWeight: "600",
              boxShadow: `0 0 25px ${toastType === "warning"
                  ? "rgba(251, 191, 36, 0.3)"
                  : toastType === "error"
                  ? "rgba(239, 68, 68, 0.3)"
                  : "rgba(16, 185, 129, 0.3)"}`,
              zIndex: 1500,
              border: "none",
            }}
          >
            {toastType === "success"
              ? "✅"
              : toastType === "warning"
              ? "⚠️"
              : "❌"} {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* === Meal Summary Grid === */}
      <motion.div
        style={{
          background: designTheme.cardBg,
          borderRadius: "20px",
          padding: "clamp(20px, 3vw, 30px)",
          marginBottom: "clamp(20px, 3vw, 30px)",
          border: `3px solid ${designTheme.border}`,
          boxShadow: designTheme.shadow,
        }}
      >
        <h2
          style={{
            fontSize: "clamp(1.3rem, 3vw, 1.8rem)",
            fontWeight: "700",
            color: designTheme.text,
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          📊 Today's Meal Summary
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 160px), 1fr))",
            gap: "16px",
            width: "100%",
            maxWidth: "clamp(360px, 90vw, 900px)",
            margin: "0 auto",
          }}
        >
        <MealSummaryCard
          icon={MdOutlineBreakfastDining}
          title="Breakfast"
          calories={mealTotals.breakfast}
          accent={getCategoryAccent("breakfast")}
        />
        <MealSummaryCard
          icon={MdLunchDining}
          title="Lunch"
          calories={mealTotals.lunch}
          accent={getCategoryAccent("lunch")}
        />
        <MealSummaryCard
          icon={MdRestaurant}
          title="Dinner"
          calories={mealTotals.dinner}
          accent={getCategoryAccent("dinner")}
        />
        <MealSummaryCard
          icon={FaAppleAlt}
          title="Snacks & Drinks"
          calories={mealTotals.snacks}
          accent={getCategoryAccent("snacks_drinks")}
        />
        </div>
      </motion.div>

      {/* === Progress Ring, Stats, and Buttons === */}
      <motion.div style={{
          background: designTheme.cardBg,
          borderRadius: "20px",
          padding: "clamp(20px, 3vw, 30px)",
          marginBottom: "clamp(20px, 3vw, 30px)",
          border: `3px solid ${designTheme.border}`,
          boxShadow: designTheme.shadow,
        }}>
        <h2
          style={{
            fontSize: "clamp(1.3rem, 3vw, 1.8rem)",
            fontWeight: "700",
            color: designTheme.text,
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          🎯 Progress & Actions
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
          gap: '24px',
          alignItems: 'center',
          marginBottom: '30px',
          width: "100%",
          maxWidth: "clamp(360px, 95vw, 1100px)",
          margin: "0 auto",
      }}>
        {/* --- Column 1: Progress Ring --- */}
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
                background: designTheme.cardBg, // Use theme
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

        {/* --- Column 2: Stats Section --- */}
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
                caloriesRemaining <= 0
                  ? "rgba(239,68,68,0.3)"
                  : "rgba(16,185,129,0.3)"
              }`,
            }}
          >
            <div
              style={{
                fontSize: "1.8rem",
                fontWeight: "800",
                color: caloriesRemaining <= 0 ? "#ef4444" : "#10b981",
              }}
            >
              {caloriesRemaining > 0 ? caloriesRemaining : 0}
            </div>
            <div style={{ fontSize: "0.9rem", color: "#64748b" }}>
              Remaining
            </div>
          </div>
        </div>

        {/* --- Column 3: Buttons --- */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <motion.button
            whileHover={{
              scale: 1.05, // Subtle hover
              boxShadow: "0 0 20px rgba(16, 185, 129,0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddMealModal(true)}
            style={{
              padding: "15px 25px",
              borderRadius: "15px",
              border: "none",
              background: "#10b981",
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
              scale: 1.05,
              boxShadow: "0 0 20px rgba(59,130,246,0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={handleViewLog}
            style={{
              padding: "15px 25px",
              borderRadius: "15px",
              border: "none",
              background: "#3b82f6",
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
              scale: 1.05,
              boxShadow: "0 0 20px rgba(239,68,68,0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            style={{
              padding: "15px 25px",
              borderRadius: "15px",
              border: "none",
              background: confirmReset
                ? "#facc15" // Yellow for confirm
                : "#ef4444",
              color: confirmReset ? "#1e293b" : "#fff",
              fontWeight: "700",
              fontSize: "1rem",
              cursor: "pointer",
              transition: "background 0.3s"
            }}
          >
            {confirmReset ? "❗ Click Again" : "🔄 Reset"}
          </motion.button>
        </div>
      </div>
      
      {/* Progress Bar (Unchanged) */}
      <div style={{ marginTop: "30px", marginBottom: "30px" }}>
        <div style={{
          height: '10px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '5px',
          overflow: 'hidden',
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{
              height: '100%',
              background: isOverGoal ? "#ef4444" : "#10b981",
              borderRadius: '5px',
            }}
          />
        </div>
      </div>
      </motion.div>

      {/* ================================================================= */}
      {/* === ⬇️ FOOD RECOMMENDATIONS (NOW MEAL-BASED) ⬇️ === */}
      {/* ================================================================= */}
      <motion.div
        style={{
          background: designTheme.cardBg,
          borderRadius: "20px",
          padding: "clamp(20px, 3vw, 35px)",
          border: `3px solid ${activeCategoryAccent}`,
          boxShadow: "0 8px 24px rgba(139, 92, 246, 0.15)",
          marginBottom: "clamp(20px, 3vw, 30px)",
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
                color: activeCategoryAccent,
                margin: 0,
              }}
            >
              🥗 Food Recommendations
            </h2>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
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
                        ? `2px solid ${category.accent}`
                        : `2px solid ${designTheme.border}`,
                      background: isActive
                        ? category.accent
                        : designTheme.cardBg,
                      color: isActive ? "#fff" : designTheme.text,
                      fontWeight: "600",
                      fontSize: "0.95rem",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: isActive
                        ? `0 0 12px ${category.accent}33`
                        : "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      {React.createElement(category.icon, { size: 20 })}
                    </span>
                    <span>{category.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <motion.div
            key={activeFoodCategory} // This makes it re-animate on change
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              background: designTheme.background,
              borderRadius: "18px",
              padding: "18px",
              border: `2px solid ${activeCategoryAccent}`,
              boxShadow: designTheme.shadow,
              marginBottom: "24px",
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: designTheme.text }}>
              <span style={{ fontSize: '1.6rem' }}>{activeCategoryIcon}</span>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{getCategoryLabel(activeCategoryConfig?.key)}</div>
                <div style={{ fontSize: '0.9rem', color: designTheme.textSecondary }}>{activeCategoryDescription}</div>
              </div>
            </div>
          </motion.div>

          <div style={{ position: 'relative', marginBottom: '20px', width: '100%' }}>
            <input
              type="text"
              placeholder={`Search in ${activeCategoryConfig.label}...`}
              value={foodSearch}
              onChange={(e) => setFoodSearch(e.target.value)}
              style={{
                  width: '100%',
                  padding: '12px 16px 12px 45px',
                  borderRadius: '15px',
                  border: `2px solid ${activeCategoryAccent}`,
                  background: designTheme.background,
                  color: designTheme.text,
                  fontSize: '0.9rem',
                  outline: 'none',
              }}
            />
             <div style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: designTheme.textSecondary, fontSize: '1.1rem' }}>
              🔍
            </div>
          </div>

        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 180px), 1fr))",
            gap: "16px",
            width: "100%",
          }}
        >
          <AnimatePresence>
            {getFilteredFoods().map((food, index) => (
              <motion.div
                key={food.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{
                  scale: 1.02,
                  y: -8,
                  boxShadow: `0 8px 24px ${food.accent}33`
                }}
                style={{
                  background: designTheme.background,
                  borderRadius: "16px",
                  padding: "18px 12px 14px 12px",
                  border: `2px solid ${food.accent}`,
                  cursor: "pointer",
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                }}
                onClick={() => {
                  setSelectedFood(food);
                  setShowFoodModal(true);
                }}
              >
                <div style={{ marginBottom: 6, color: food.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {React.createElement(food.icon, { size: 32 })}
                </div>
                <div style={{ fontWeight: 700, fontSize: "1.08rem", color: food.accent, marginBottom: 2, textAlign: 'center' }}>{food.name}</div>
                <div style={{ color: designTheme.textSecondary, fontSize: "0.98rem" }}>{food.calories} kcal</div>
                <div style={{ color: designTheme.textSecondary, fontSize: "0.92rem", marginBottom: 6, textAlign: 'center' }}>{food.protein}g P / {food.carbs}g C / {food.fat}g F</div>
                <button
                  style={{
                    marginTop: 4,
                    background: food.accent,
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "6px 14px",
                    fontWeight: 600,
                    fontSize: "0.98rem",
                    cursor: "pointer",
                    boxShadow: `0 2px 8px ${food.accent}33`,
                    transition: "background 0.2s",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    addFoodToIntake(food);
                  }}
                >
                  Add
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ================================================================= */}
      {/* === ⬇️ TODAY'S MEAL LOG (LOGIC CLEANED) ⬇️ === */}
      {/* ================================================================= */}
      <motion.div
        ref={mealLogRef}
        style={{
          background: designTheme.cardBg,
          borderRadius: "20px",
          padding: "clamp(20px, 3vw, 35px)",
          border: `3px solid #10b981`,
          boxShadow: "0 8px 24px rgba(16, 185, 129, 0.15)",
          marginBottom: "clamp(20px, 3vw, 30px)",
        }}
      >
        <h2 style={{
            fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
            fontWeight: '700',
            color: '#10b981',
            margin: '0 0 20px 0',
            textAlign: 'center',
          }}>
          📋 Today's Meal Log
        </h2>
        {todayMealLog.length === 0 ? (
          <motion.div
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
            {/* You can add summary stats here if needed */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 250px), 1fr))',
              gap: '16px',
              width: "100%",
            }}>
              <AnimatePresence>
                {todayMealLog.map((item, index) => {
                  const itemCategory = item.category;
                  const itemIcon = getCategoryIcon(itemCategory);
                  const itemColors = getCategoryColors(itemCategory);

                  return (
                    <motion.div
                      key={item.id}
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
                        overflow: 'hidden', // Ensure icon doesn't overflow
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
                        color: itemColors.accent,
                        border: `2px solid ${itemColors.border}`,
                      }}>
                        {React.createElement(itemIcon, { size: 22 })}
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff', margin: '0 0 8px 0', paddingRight: '40px' }}>
                        {item.name}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '12px' }}>
                        Added {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      
                      {/* Macro Display */}
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', color: designTheme.textSecondary, fontSize: '0.9rem' }}>
                        <span>P: {item.protein}g</span>
                        <span>C: {item.carbs}g</span>
                        <span>F: {item.fat}g</span>
                      </div>
                      
                      <div style={{
                        background: `linear-gradient(135deg, ${itemColors.accent}, ${itemColors.accentAlt}cc)`,
                        padding: '8px 12px',
                        borderRadius: '10px',
                        textAlign: 'center',
                        display: 'inline-block', // So it doesn't stretch full width
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

      {/* ================================================================= */}
      {/* === ⬇️ MODALS ⬇️ === */}
      {/* ================================================================= */}
      
      {/* --- Add Custom Meal Modal --- */}
      <AnimatePresence>
        {showAddMealModal && (
          <motion.div
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                background: 'rgba(255, 255, 255, 0.98)',
                borderRadius: '20px',
                padding: '30px',
                border: '2px solid #d8b4fe',
                maxWidth: 'min(90vw, 700px)',
                width: '90%',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ fontSize: '1.8rem', color: '#8b5cf6', marginBottom: '5px', textAlign: 'center', fontWeight: '700' }}>
                🍽️ Add Custom Meal
              </h2>
              
              {/* Meal Name */}
              <div>
                <label style={{ color: '#4b5563', fontWeight: '600', marginBottom: '5px', display: 'block' }}>
                  Meal Name
                </label>
                <input
                  type="text"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  placeholder="e.g., Homemade Sandwich"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(248, 249, 255, 0.8)',
                    border: '2px solid #e0e7ff',
                    borderRadius: '12px',
                    color: '#fff',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Meal Calories */}
              <div>
                <label style={{ color: '#4b5563', fontWeight: '600', marginBottom: '5px', display: 'block' }}>
                  Meal Calories (kcal)
                </label>
                <input
                  type="number"
                  value={mealCalories}
                  onChange={(e) => setMealCalories(e.target.value)}
                  placeholder="e.g., 450"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(248, 249, 255, 0.8)',
                    border: '2px solid #e0e7ff',
                    borderRadius: '12px',
                    color: '#2d3748',
                    outline: 'none',
                  }}
                />
              </div>
              
              {/* Category Select */}
              <div>
                <label style={{ color: '#4b5563', fontWeight: '600', marginBottom: '5px', display: 'block' }}>
                  Category
                </label>
                <select
                  value={mealCategory}
                  onChange={(e) => setMealCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(248, 249, 255, 0.8)',
                    border: '2px solid #e0e7ff',
                    borderRadius: '12px',
                    color: '#2d3748',
                    outline: 'none',
                  }}
                >
                  {/* Options are now synced with the config */}
                  {FOOD_CATEGORY_CONFIG.map(cat => (
                    <option key={cat.key} value={cat.key}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddMealModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: '2px solid #e0e7ff',
                    background: 'rgba(248, 249, 255, 0.8)',
                    color: '#4b5563',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 6px 16px rgba(139, 92, 246, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addCustomMeal}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#8b5cf6',
                    color: '#fff',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                  }}
                >
                  Add Meal
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Food Detail Modal --- */}
      <AnimatePresence>
        {showFoodModal && selectedFood && (
          <motion.div
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
            onClick={() => setShowFoodModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                background: `linear-gradient(160deg, ${designTheme.cardBg}, ${designTheme.background})`,
                borderRadius: '20px',
                padding: '30px',
                border: `2px solid ${selectedFood.accent}`,
                maxWidth: 'min(90vw, 700px)',
                width: '90%',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                boxShadow: `0 0 40px ${selectedFood.accent}33`
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: selectedFood.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                  {React.createElement(selectedFood.icon, { size: 60 })}
                </div>
                <h2 style={{ fontSize: '1.8rem', color: selectedFood.accent, margin: '10px 0 5px 0' }}>
                  {selectedFood.name}
                </h2>
                <div style={{ fontSize: '1.5rem', color: designTheme.text, fontWeight: '700' }}>
                  {selectedFood.calories} kcal
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-around', background: 'rgba(139, 92, 246, 0.08)', borderRadius: '12px', padding: '15px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.9rem', color: designTheme.textSecondary }}>Protein</div>
                  <div style={{ fontSize: '1.1rem', color: designTheme.text, fontWeight: '600' }}>{selectedFood.protein}g</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.9rem', color: designTheme.textSecondary }}>Carbs</div>
                  <div style={{ fontSize: '1.1rem', color: designTheme.text, fontWeight: '600' }}>{selectedFood.carbs}g</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.9rem', color: designTheme.textSecondary }}>Fat</div>
                  <div style={{ fontSize: '1.1rem', color: designTheme.text, fontWeight: '600' }}>{selectedFood.fat}g</div>
                </div>
              </div>

              <div>
                <h4 style={{ color: designTheme.text, margin: '10px 0 5px 0' }}>Benefits</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedFood.benefits.map(benefit => (
                    <span key={benefit} style={{ background: 'rgba(139, 92, 246, 0.12)', color: designTheme.text, padding: '5px 10px', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ color: designTheme.text, margin: '10px 0 5px 0' }}>💡 Health Tip</h4>
                <p style={{ color: designTheme.textSecondary, margin: 0, fontSize: '0.95rem' }}>
                  {selectedFood.healthTip}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => addFoodToIntake(selectedFood)}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: selectedFood.accent,
                  color: '#fff',
                  fontWeight: '700',
                  cursor: 'pointer',
                  marginTop: '15px',
                  fontSize: '1rem'
                }}
              >
                Add to Log
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

export default CalorieTracker;