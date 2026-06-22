export interface WorkoutSession {
  id: string;
  type: string;
  duration: number; // in minutes
  calories: number; // in kcal
  date: string; // ISO string or YYYY-MM-DD
  notes?: string;
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD
  steps: number;
  water: number; // in ml or glasses (we'll track in glasses/cups of 250ml)
  caloriesBurned: number; // from steps and active exercises
  activeMinutes: number;
}

export interface ActivityGoal {
  steps: number;
  water: number; // in cups
  calories: number; // active calories goal
  minutes: number; // active minutes goal
}

export interface ChartDayData {
  dayName: string;
  activeMinutes: number;
  calories: number;
  steps: number;
}
