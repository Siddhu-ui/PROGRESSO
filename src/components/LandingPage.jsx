import React from "react";
// We don't need ThemeToggle for this simplified example
// import ThemeToggle from "./ThemeToggle"; 

// A new component to hold the progress bars, to be used *inside* the phone
function AppScreenContent() {
  const categories = [
    { name: "HEALTH", color: "#FF595E", progress: 0.7 },
    { name: "FINANCIAL", color: "#FFCA3A", progress: 0.4 },
    { name: "KNOWLEDGE", color: "#8AC926", progress: 0.9 },
    { name: "RELATIONSHIPS", color: "#1982C4", progress: 0.5 },
  ];

  return (
    <div className="p-4 bg-gray-900 h-full text-white">
      <h2 className="text-xl font-bold mb-1">My Daily Growth</h2>
      <p className="text-sm text-gray-400 mb-6">Your progress for the week:</p>
      
      <div className="flex flex-col gap-4">
        {categories.map((cat) => (
          <div key={cat.name}>
            <div className="flex justify-between text-xs text-gray-300 mb-1">
              <span>{cat.name}</span>
              <span>{Math.round(cat.progress * 100)}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-700"
                style={{
                  width: `${cat.progress * 100}%`,
                  backgroundColor: cat.color,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gray-800 rounded-lg p-3">
         <p className="text-gray-400 text-xs mb-1">Your next quest</p>
         <p className="text-white font-semibold">
           Learn the basics of flying a plane
         </p>
      </div>
    </div>
  );
}

// This is the new, refactored Landing Page
export default function NewLandingPage({ user, onSignIn, onEnterApp, onSignOut }) {
  const isAuthenticated = Boolean(user);

  return (
    // 1. SIMPLIFIED BACKGROUND
    // We use a clean, light background like your example.
    // You could also use a simple dark one like 'bg-gray-900'.
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      
      {/* 2. CLEAN HEADER (like the example) */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5">
        <nav className="flex justify-between items-center">
          {/* Logo */}
          <div className="text-2xl font-bold text-black">
            GROWTH TRACKER
          </div>
          
          {/* Nav Links */}
          <div className="hidden md:flex gap-6 text-gray-600 font-medium">
            <a href="#" className="hover:text-black">About</a>
            <a href="#" className="hover:text-black">Features</a>
            <a href="#" className="hover:text-black">Blog</a>
          </div>

          {/* Auth Button */}
          {isAuthenticated ? (
             <button
              onClick={onEnterApp}
              className="bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-lg font-semibold transition-all"
            >
              Enter App
            </button>
          ) : (
            <button
              onClick={onSignIn}
              className="bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-lg font-semibold transition-all"
            >
              Sign In
            </button>
          )}
        </nav>
      </header>

      {/* 3. TWO-COLUMN HERO LAYOUT */}
      <main className="flex-1 flex items-center w-full max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">

          {/* LEFT SIDE: FOCUSED TEXT */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl md:text-7xl font-extrabold text-black">
              Gamify Your
              <br />
              <span className="text-purple-600">Daily Growth</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-lg mx-auto lg:mx-0">
              Stop procrastinating and start achieving. Turn your habits,
              goals, and daily tasks into a fun game.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={isAuthenticated ? onEnterApp : onSignIn}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
              >
                Get Started
              </button>
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-lg font-semibold text-lg transition-all"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: "SHOW THE PRODUCT" */}
          {/* This is the phone mockup, just like your "Easy Trip" example. */}
          <div className="flex justify-center">
            <div className="w-[300px] h-[600px] bg-gray-800 rounded-[48px] border-[14px] border-black shadow-2xl relative overflow-hidden">
              {/* Phone "Notch" */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-black rounded-b-xl"></div>
              
              {/* 4. APP SCREEN (Using your features!) */}
              {/* We moved your progress bars and quest info INSIDE the phone! */}
              <div className="absolute inset-[10px] top-8 rounded-[34px] overflow-hidden">
                <AppScreenContent />
              </div>
            </div>
          </div>
          
        </div>
      </main>

      {/* Simple footer area */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} Growth Tracker. All rights reserved.</p>
      </footer>
    </div>
  );
}