import React, { useState, useEffect } from "react";
import { WorkoutSession, DailyProgress, ActivityGoal } from "./types";
import {
  generateInitialHistory,
  getLocalDateString,
  DEFAULT_GOAL,
  WORKOUT_TYPES,
} from "./utils/fitnessUtils";
import ProgressCard from "./components/ProgressCard";
import ActiveWorkoutTimer from "./components/ActiveWorkoutTimer";
import WeeklyChart from "./components/WeeklyChart";
import QuickWorkoutLogger from "./components/QuickWorkoutLogger";
import RecentWorkoutsList from "./components/RecentWorkoutsList";
import {
  Activity,
  Award,
  Settings2,
  Calendar,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  TrendingUp,
} from "lucide-react";

export default function App() {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [history, setHistory] = useState<DailyProgress[]>([]);
  const [goal, setGoal] = useState<ActivityGoal>(DEFAULT_GOAL);
  
  // Settings view toggle
  const [showGoalSettings, setShowGoalSettings] = useState(false);
  const [goalSteps, setGoalSteps] = useState(DEFAULT_GOAL.steps);
  const [goalWater, setGoalWater] = useState(DEFAULT_GOAL.water);
  const [goalCalories, setGoalCalories] = useState(DEFAULT_GOAL.calories);
  const [goalMinutes, setGoalMinutes] = useState(DEFAULT_GOAL.minutes);

  // Status values
  const [hydrationTip, setHydrationTip] = useState("Stay hydrated! Aim for at least 8 cups (2L) of water today.");

  // Get Today's Date representation in local timezone
  const todayDateStr = getLocalDateString(new Date());

  // Init State on first render
  useEffect(() => {
    const savedWorkouts = localStorage.getItem("fit_workouts");
    const savedHistory = localStorage.getItem("fit_history");
    const savedGoal = localStorage.getItem("fit_goal");

    let initialWorkouts: WorkoutSession[] = [];
    let initialHistory: DailyProgress[] = [];
    let activeGoal: ActivityGoal = DEFAULT_GOAL;

    if (savedGoal) {
      try {
        activeGoal = JSON.parse(savedGoal);
        setGoal(activeGoal);
        setGoalSteps(activeGoal.steps);
        setGoalWater(activeGoal.water);
        setGoalCalories(activeGoal.calories);
        setGoalMinutes(activeGoal.minutes);
      } catch (e) {
        // use default
      }
    }

    if (savedWorkouts && savedHistory) {
      try {
        initialWorkouts = JSON.parse(savedWorkouts);
        initialHistory = JSON.parse(savedHistory);
      } catch (e) {
        // fallback to generating
        const generated = generateInitialHistory();
        initialHistory = generated.history;
        initialWorkouts = generated.workouts;
      }
    } else {
      // First boot: pre-populate beautiful sample records
      const generated = generateInitialHistory();
      initialHistory = generated.history;
      initialWorkouts = generated.workouts;
    }

    // Ensure we have today's progress initialized
    const hasToday = initialHistory.some((h) => h.date === todayDateStr);
    if (!hasToday) {
      initialHistory.push({
        date: todayDateStr,
        steps: 0,
        water: 0,
        caloriesBurned: 0,
        activeMinutes: 0,
      });
    }

    setWorkouts(initialWorkouts);
    setHistory(initialHistory);

    // Save initial load
    localStorage.setItem("fit_workouts", JSON.stringify(initialWorkouts));
    localStorage.setItem("fit_history", JSON.stringify(initialHistory));
    localStorage.setItem("fit_goal", JSON.stringify(activeGoal));
  }, []);

  // Sync state helpers
  const saveGameState = (updatedWorkouts: WorkoutSession[], updatedHistory: DailyProgress[]) => {
    setWorkouts(updatedWorkouts);
    setHistory(updatedHistory);
    localStorage.setItem("fit_workouts", JSON.stringify(updatedWorkouts));
    localStorage.setItem("fit_history", JSON.stringify(updatedHistory));
  };

  // Find today's statistics
  const getTodayProgress = (): DailyProgress => {
    const todayRecord = history.find((h) => h.date === todayDateStr);
    if (todayRecord) return todayRecord;
    return {
      date: todayDateStr,
      steps: 0,
      water: 0,
      caloriesBurned: 0,
      activeMinutes: 0,
    };
  };

  const todayData = getTodayProgress();

  // Dynamically update today's values inline in the list
  const updateTodayProgressProperty = (updater: (prev: DailyProgress) => DailyProgress) => {
    const updatedHistory = history.map((day) => {
      if (day.date === todayDateStr) {
        return updater(day);
      }
      return day;
    });
    saveGameState(workouts, updatedHistory);
  };

  // Quick Increments callbacks
  const handleIncrementSteps = (amount: number) => {
    updateTodayProgressProperty((prev) => {
      const nextSteps = prev.steps + amount;
      // Formula for steps-energy conversion (approx 0.04 calories burned per step)
      // New energy is direct workouts energy + steps calories
      const stepsCalories = amount * 0.04;
      return {
        ...prev,
        steps: nextSteps,
        caloriesBurned: Math.round(prev.caloriesBurned + stepsCalories),
      };
    });
  };

  const handleIncrementWater = (amount: number) => {
    updateTodayProgressProperty((prev) => {
      const nextWater = Math.min(prev.water + amount, 32); // ceiling at 32 cups
      
      // Update custom water tips
      if (nextWater >= goal.water) {
        setHydrationTip("Superb job! You reached your daily hydration goal. Your body is fully fueled.");
      } else if (nextWater >= Math.floor(goal.water / 2)) {
        setHydrationTip("Halfway to your daily hydration goal! Drink up to keep muscular performance high.");
      }
      
      return {
        ...prev,
        water: nextWater,
      };
    });
  };

  const handleIncrementCalories = (amount: number) => {
    updateTodayProgressProperty((prev) => ({
      ...prev,
      caloriesBurned: prev.caloriesBurned + amount,
    }));
  };

  const handleIncrementMinutes = (amount: number) => {
    updateTodayProgressProperty((prev) => ({
      ...prev,
      activeMinutes: prev.activeMinutes + amount,
    }));
  };

  // Add a fully finished workout session
  const handleLogWorkout = (newSession: Omit<WorkoutSession, "id">) => {
    const session: WorkoutSession = {
      ...newSession,
      id: "w_" + Date.now().toString(),
    };

    const nextWorkouts = [session, ...workouts];

    // If the logged workout represents today's date, we increment active minutes and calories burned dynamically!
    // If it's a historical date, we increment that specific date's stats, building rich accuracy!
    const updatedHistory = history.map((day) => {
      if (day.date === session.date) {
        return {
          ...day,
          caloriesBurned: day.caloriesBurned + session.calories,
          activeMinutes: day.activeMinutes + session.duration,
        };
      }
      return day;
    });

    // If logging a workout for a historical date that isn't fully in the 7-day array, we append a daily metric record
    const hasTargetDate = updatedHistory.some((day) => day.date === session.date);
    if (!hasTargetDate) {
      updatedHistory.push({
        date: session.date,
        steps: 0,
        water: 0,
        caloriesBurned: session.calories,
        activeMinutes: session.duration,
      });
    }

    saveGameState(nextWorkouts, updatedHistory);
  };

  // Delete logged workout session
  const handleDeleteWorkout = (id: string) => {
    const targetSession = workouts.find((w) => w.id === id);
    if (!targetSession) return;

    const nextWorkouts = workouts.filter((w) => w.id !== id);

    // Retract the deleted exercises duration and active calories from that specific date
    const updatedHistory = history.map((day) => {
      if (day.date === targetSession.date) {
        return {
          ...day,
          caloriesBurned: Math.max(0, day.caloriesBurned - targetSession.calories),
          activeMinutes: Math.max(0, day.activeMinutes - targetSession.duration),
        };
      }
      return day;
    });

    saveGameState(nextWorkouts, updatedHistory);
  };

  // Save customized activity goals
  const handleSaveGoalSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const newGoal: ActivityGoal = {
      steps: goalSteps,
      water: goalWater,
      calories: goalCalories,
      minutes: goalMinutes,
    };
    setGoal(newGoal);
    localStorage.setItem("fit_goal", JSON.stringify(newGoal));
    setShowGoalSettings(false);
  };

  // Reset all records to pristine dynamic samples
  const handleResetData = () => {
    if (confirm("Are you sure you want to revert to initial default stats? This will clear local logs.")) {
      const generated = generateInitialHistory();
      
      // Ensure today's date is appended properly
      const hasToday = generated.history.some((h) => h.date === todayDateStr);
      if (!hasToday) {
        generated.history.push({
          date: todayDateStr,
          steps: 0,
          water: 0,
          caloriesBurned: 0,
          activeMinutes: 0,
        });
      }

      setGoal(DEFAULT_GOAL);
      setGoalSteps(DEFAULT_GOAL.steps);
      setGoalWater(DEFAULT_GOAL.water);
      setGoalCalories(DEFAULT_GOAL.calories);
      setGoalMinutes(DEFAULT_GOAL.minutes);
      
      saveGameState(generated.workouts, generated.history);
      localStorage.setItem("fit_goal", JSON.stringify(DEFAULT_GOAL));
    }
  };

  // Compute stats metrics
  const completedGoalsCount = [
    todayData.steps >= goal.steps,
    todayData.water >= goal.water,
    todayData.caloriesBurned >= goal.calories,
    todayData.activeMinutes >= goal.minutes,
  ].filter(Boolean).length;

  // Render Date greeting beautifully (eg. Monday, June 22)
  const renderHeaderDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    };
    return new Date().toLocaleDateString("en-US", options);
  };

  // Compute past 7 days averages for display in headers
  const get7DayActiveMinsAvg = () => {
    if (history.length === 0) return 0;
    const sum = history.slice(-7).reduce((acc, current) => acc + current.activeMinutes, 0);
    return Math.round(sum / Math.min(history.length, 7));
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-16 font-sans antialiased text-zinc-100 selection:bg-lime-400 selection:text-zinc-950">
      
      {/* Visual Navigation Top Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Logo Title Group */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-lime-400 text-zinc-950 shadow-md shadow-lime-950/20 flex items-center justify-center">
              <Activity className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="font-display font-black text-xl text-white tracking-tight leading-none">
                PULSETRACK
              </h1>
              <span className="text-xs text-zinc-500 font-bold tracking-tight mt-1 px-1 block flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-lime-400" />
                {renderHeaderDate()}
              </span>
            </div>
          </div>

          {/* Action and settings triggers */}
          <div className="flex items-center gap-2">
            <button
              id="header-goal-settings-btn"
              onClick={() => setShowGoalSettings(!showGoalSettings)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
            >
              <Settings2 className="w-4 h-4 text-zinc-500" /> Goal Targets
            </button>
            <button
              id="header-reset-btn"
              onClick={handleResetData}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-rose-400 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
              title="Reset metrics"
            >
              <RotateCcw className="w-4 h-4 text-zinc-500" /> Reset Layout
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid View Dashboard content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-6">

        {/* Dynamic Goal Target Form overlay */}
        {showGoalSettings && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-6 shadow-2xl mb-6 animate-fadeIn transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Settings2 className="w-4.5 h-4.5 text-lime-400" /> Customize Daily Fitness Goals
              </h3>
              <button
                id="close-settings-btn"
                onClick={() => setShowGoalSettings(false)}
                className="text-xs font-bold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 py-1.5 px-3 rounded-lg border border-zinc-700 cursor-pointer"
              >
                Cancel
              </button>
            </div>
            
            <form onSubmit={handleSaveGoalSettings} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">
                  Daily Step Goal
                </label>
                <input
                  type="number"
                  id="goal-input-steps"
                  min="1000"
                  max="50000"
                  value={goalSteps}
                  onChange={(e) => setGoalSteps(Number(e.target.value))}
                  className="w-full text-xs px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 outline-none focus:bg-zinc-900 focus:border-lime-500 transition-all font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">
                  Water Goal (Cups)
                </label>
                <input
                  type="number"
                  id="goal-input-water"
                  min="2"
                  max="24"
                  value={goalWater}
                  onChange={(e) => setGoalWater(Number(e.target.value))}
                  className="w-full text-xs px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 outline-none focus:bg-zinc-900 focus:border-lime-500 transition-all font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">
                  Energy Goal (kcal)
                </label>
                <input
                  type="number"
                  id="goal-input-calories"
                  min="100"
                  max="5000"
                  value={goalCalories}
                  onChange={(e) => setGoalCalories(Number(e.target.value))}
                  className="w-full text-xs px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 outline-none focus:bg-zinc-900 focus:border-lime-500 transition-all font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">
                  Workout Goal (mins)
                </label>
                <input
                  type="number"
                  id="goal-input-minutes"
                  min="10"
                  max="300"
                  value={goalMinutes}
                  onChange={(e) => setGoalMinutes(Number(e.target.value))}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 outline-none focus:bg-zinc-900 focus:border-lime-500 transition-all font-mono"
                />
              </div>

              <div className="col-span-2 lg:col-span-4 flex justify-end gap-2 mt-2">
                <button
                  type="submit"
                  id="save-goal-submit-btn"
                  className="px-4 py-2.5 bg-lime-400 hover:bg-lime-500 text-zinc-950 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Save Fitness Goals
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Motivative Insight Banner Box */}
        <div id="motivational-banner" className="bg-zinc-900 rounded-[32px] border border-zinc-800 p-6 md:p-8 text-white relative overflow-hidden shadow-2xl mb-8">
          <div className="absolute inset-0 bg-radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops)) from-zinc-800/20 via-zinc-900 to-zinc-950 opacity-95"></div>
          
          {/* Subtle grid accent */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-lime-950/40 text-lime-400 border border-lime-800/30 text-xs font-bold uppercase tracking-wider mb-3">
                <Award className="w-3.5 h-3.5 text-lime-400" /> Core Daily Summary
              </div>
              
              <h2 className="font-display font-bold text-2xl md:text-3xl text-white tracking-tight leading-none">
                You resolved <span className="text-lime-400 font-extrabold">{completedGoalsCount} of 4</span> daily target goals
              </h2>
              <p className="text-sm text-zinc-400 mt-2.5 max-w-xl font-sans leading-relaxed">
                {hydrationTip} Your weekly exercise logs average <span className="text-lime-400 font-bold">{get7DayActiveMinsAvg()} minutes</span> of targeted physical training.
              </p>
            </div>

            {/* Motivational Badge Display */}
            <div className="bg-zinc-950/50 backdrop-blur-md rounded-2xl p-4 border border-zinc-800/80 shrink-0 self-start md:self-auto flex items-center gap-3.5">
              <div className="p-3 bg-lime-950/40 border border-lime-800/20 rounded-xl text-yellow-400">
                <TrendingUp className="w-6 h-6 stroke-[2]" />
              </div>
              <div className="font-sans">
                <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">
                  Current Status
                </span>
                <span className="font-display font-bold text-base text-white block mt-0.5">
                  {completedGoalsCount === 4
                    ? "Peak Performer! 🌟"
                    : completedGoalsCount >= 2
                    ? "Active & Progressing 🏃"
                    : "Warming Up... Get Active!"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Grid Daily Metrics */}
        <div id="bento-metrics-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <ProgressCard
            id="steps"
            title="Daily Active Steps"
            value={todayData.steps}
            target={goal.steps}
            unit="steps"
            iconName="Footprints"
            colorClass="text-lime-400"
            bgClass="bg-lime-950/40"
            glowClass="text-lime-400 drop-shadow-[0_0_8px_rgba(163,230,53,0.4)]"
            quickIncrements={[
              { label: "+1k Steps", amount: 1000 },
              { label: "+3k Steps", amount: 3000 },
            ]}
            onIncrement={handleIncrementSteps}
          />

          <ProgressCard
            id="water"
            title="Hydration Counter"
            value={todayData.water}
            target={goal.water}
            unit="cups"
            iconName="Droplet"
            colorClass="text-sky-400"
            bgClass="bg-sky-950/40"
            glowClass="text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]"
            quickIncrements={[
              { label: "+1 Cup", amount: 1 },
              { label: "+2 Cups", amount: 2 },
            ]}
            onIncrement={handleIncrementWater}
          />

          <ProgressCard
            id="calories"
            title="Active Energy Burned"
            value={todayData.caloriesBurned}
            target={goal.calories}
            unit="kcal"
            iconName="Flame"
            colorClass="text-orange-500"
            bgClass="bg-orange-950/40"
            glowClass="text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]"
            quickIncrements={[
              { label: "+50 kcal", amount: 50 },
              { label: "+100 kcal", amount: 100 },
            ]}
            onIncrement={handleIncrementCalories}
          />

          <ProgressCard
            id="active-time"
            title="Active Workout Time"
            value={todayData.activeMinutes}
            target={goal.minutes}
            unit="mins"
            iconName="Clock"
            colorClass="text-violet-400"
            bgClass="bg-violet-950/40"
            glowClass="text-violet-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.4)]"
            quickIncrements={[
              { label: "+10 mins", amount: 10 },
              { label: "+15 mins", amount: 15 },
            ]}
            onIncrement={handleIncrementMinutes}
          />

        </div>

        {/* Central Analytics and Active Tracker Rows */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* 7-Day Chart Block */}
          <div className="lg:col-span-7 h-full">
            <WeeklyChart history={history} />
          </div>

          {/* Active Timer Block */}
          <div className="lg:col-span-5 h-full">
            <ActiveWorkoutTimer onLogWorkout={handleLogWorkout} />
          </div>

        </div>

        {/* Manual Tracker & History Log lists rows */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Quick manual form - left col */}
          <div className="lg:col-span-5">
            <QuickWorkoutLogger onLogWorkout={handleLogWorkout} />
          </div>

          {/* Feed list of logged sessions - right col */}
          <div className="lg:col-span-7">
            <RecentWorkoutsList
              workouts={workouts}
              onDeleteWorkout={handleDeleteWorkout}
            />
          </div>

        </div>

      </main>

    </div>
  );
}
