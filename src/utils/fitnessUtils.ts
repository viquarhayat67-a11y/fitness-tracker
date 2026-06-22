import { WorkoutSession, DailyProgress, ActivityGoal } from "../types";

export const WORKOUT_TYPES = [
  { id: "running", label: "Running", icon: "Flame", color: "from-orange-500 to-amber-500", bgLight: "bg-orange-50", textCol: "text-orange-600", borderCol: "border-orange-200", kcalPerMin: 11.4 },
  { id: "strength", label: "Strength Training", icon: "Dumbbell", color: "from-blue-500 to-indigo-500", bgLight: "bg-blue-50", textCol: "text-blue-600", borderCol: "border-blue-200", kcalPerMin: 6.0 },
  { id: "cycling", label: "Cycling", icon: "Bike", color: "from-emerald-500 to-teal-500", bgLight: "bg-emerald-50", textCol: "text-emerald-600", borderCol: "border-emerald-200", kcalPerMin: 8.5 },
  { id: "yoga", label: "Yoga / Pilates", icon: "Sparkles", color: "from-purple-500 to-pink-500", bgLight: "bg-purple-50", textCol: "text-purple-600", borderCol: "border-purple-200", kcalPerMin: 4.0 },
  { id: "walking", label: "Walking", icon: "Footprints", color: "from-cyan-500 to-blue-500", bgLight: "bg-cyan-50", textCol: "text-cyan-600", borderCol: "border-cyan-200", kcalPerMin: 4.5 },
];

export const DEFAULT_GOAL: ActivityGoal = {
  steps: 10000,
  water: 8, // 8 cups (2 liters)
  calories: 600, // active kcal goal
  minutes: 60, // active minutes goal
};

// Helper to get formatted date string (YYYY-MM-DD)
export function getLocalDateString(date: Date): string {
  const offset = date.getTimezoneOffset();
  const adjusted = new Date(date.getTime() - offset * 60 * 1000);
  return adjusted.toISOString().split("T")[0];
}

// Generate the last 7 days of dates (YYYY-MM-DD)
export function getLast7Days(): string[] {
  const result: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    result.push(getLocalDateString(d));
  }
  return result;
}

// Map day numbers (0-6) to day abbreviations
export function getDayAbbreviation(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    // Avoid timezone shift using local constructor
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString("en-US", { weekday: "short" });
  }
  return dateStr;
}

// Default initial historic records if none exist in localStorage
export function generateInitialHistory(): {
  history: DailyProgress[];
  workouts: WorkoutSession[];
} {
  const dates = getLast7Days();
  
  // Create solid historical data for previous 6 days + today
  const history: DailyProgress[] = [
    {
      date: dates[0],
      steps: 8420,
      water: 6,
      caloriesBurned: 420,
      activeMinutes: 40,
    },
    {
      date: dates[1],
      steps: 10150,
      water: 8,
      caloriesBurned: 580,
      activeMinutes: 55,
    },
    {
      date: dates[2],
      steps: 6890,
      water: 5,
      caloriesBurned: 320,
      activeMinutes: 30,
    },
    {
      date: dates[3],
      steps: 12400,
      water: 9,
      caloriesBurned: 780,
      activeMinutes: 80,
    },
    {
      date: dates[4],
      steps: 9200,
      water: 7,
      caloriesBurned: 510,
      activeMinutes: 45,
    },
    {
      date: dates[5],
      steps: 11200,
      water: 8,
      caloriesBurned: 710,
      activeMinutes: 75,
    },
    {
      date: dates[6], // Today
      steps: 3400,
      water: 3,
      caloriesBurned: 180,
      activeMinutes: 15,
    }
  ];

  const workouts: WorkoutSession[] = [
    {
      id: "w1",
      type: "running",
      duration: 30,
      calories: 340,
      date: dates[1],
      notes: "Morning jog. Felt energetic!"
    },
    {
      id: "w2",
      type: "strength",
      duration: 45,
      calories: 270,
      date: dates[3],
      notes: "Full body push session."
    },
    {
      id: "w3",
      type: "cycling",
      duration: 40,
      calories: 340,
      date: dates[5],
      notes: "Evening trail bike ride."
    },
    {
      id: "w4",
      type: "yoga",
      duration: 25,
      calories: 100,
      date: dates[6], // Today
      notes: "Morning flexibility stretch."
    }
  ];

  return { history, workouts };
}
