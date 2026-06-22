import React, { useState } from "react";
import * as Icons from "lucide-react";
import { WORKOUT_TYPES } from "../utils/fitnessUtils";
import { WorkoutSession } from "../types";

interface QuickWorkoutLoggerProps {
  onLogWorkout: (session: Omit<WorkoutSession, "id">) => void;
}

export default function QuickWorkoutLogger({ onLogWorkout }: QuickWorkoutLoggerProps) {
  const [type, setType] = useState(WORKOUT_TYPES[0].id);
  const [duration, setDuration] = useState<number>(30);
  const [calories, setCalories] = useState<string>("340");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Auto-estimate calories whenever type or duration changes
  const handleDurationChange = (minutes: number) => {
    setDuration(minutes);
    const meta = WORKOUT_TYPES.find((w) => w.id === type) || WORKOUT_TYPES[0];
    setCalories(Math.round(minutes * meta.kcalPerMin).toString());
  };

  const handleTypeChange = (newType: string) => {
    setType(newType);
    const meta = WORKOUT_TYPES.find((w) => w.id === newType) || WORKOUT_TYPES[0];
    setCalories(Math.round(duration * meta.kcalPerMin).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (duration <= 0) {
      alert("Please enter a valid workout duration!");
      return;
    }

    onLogWorkout({
      type,
      duration,
      calories: Number(calories) || 0,
      date,
      notes: notes.trim() || undefined,
    });

    // Reset Form
    setNotes("");
    setIsOpen(false);
  };

  return (
    <div id="quick-logger-container" className="bg-zinc-900 rounded-[32px] border border-zinc-800 p-6 shadow-xl hover:border-zinc-700 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <Icons.PlusCircle className="w-5 h-5 text-lime-400" /> Log Historic Session
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manually record exercises or gym logs
          </p>
        </div>

        <button
          id="toggle-logger-btn"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-tight transition-all cursor-pointer ${
            isOpen
              ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              : "bg-lime-950/40 text-lime-400 hover:bg-lime-900/40 border border-lime-800/20"
          }`}
        >
          {isOpen ? "Collapse Form" : "Open Manual Form"}
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 border-t border-zinc-800 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Workout Type */}
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">
                Workout Activity Type
              </label>
              <select
                id="logger-select-type"
                value={type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 outline-none focus:bg-zinc-900 focus:border-lime-500 transition-all font-sans"
              >
                {WORKOUT_TYPES.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">
                Workout Date
              </label>
              <input
                type="date"
                id="logger-input-date"
                value={date}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 outline-none focus:bg-zinc-900 focus:border-lime-500 transition-all font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Duration */}
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">
                Duration (minutes)
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  id="logger-input-duration"
                  min="1"
                  max="480"
                  value={duration}
                  onChange={(e) => handleDurationChange(Number(e.target.value))}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 outline-none focus:bg-zinc-900 focus:border-lime-500 transition-all font-sans"
                />
                <span className="absolute right-3.5 text-zinc-500 font-semibold text-xs">
                  mins
                </span>
              </div>
            </div>

            {/* Estimated Active Calories */}
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5 flex items-center gap-1 justify-between">
                <span>Active Calories (kcal)</span>
                <span className="text-[9px] text-lime-400 lowercase font-semibold">Estimated</span>
              </label>
              <input
                type="number"
                id="logger-input-calories"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 outline-none focus:bg-zinc-900 focus:border-lime-500 transition-all font-sans"
              />
            </div>
          </div>

          {/* Quick Notes */}
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">
              Reflections / Notes
            </label>
            <textarea
              id="logger-input-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Completed with barbell, outdoor pace, average heart rate 145"
              rows={2}
              className="w-full text-xs px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 placeholder-zinc-650 outline-none focus:bg-zinc-900 focus:border-lime-500 transition-all font-sans resize-none"
            ></textarea>
          </div>

          {/* Submit form */}
          <button
            type="submit"
            id="logger-submit-btn"
            className="w-full flex items-center justify-center gap-1.5 py-3.5 rounded-xl font-bold bg-lime-400 hover:bg-lime-500 text-zinc-950 shadow-md shadow-lime-950/15 transition-all active:scale-[0.98] text-xs uppercase tracking-wider cursor-pointer"
          >
            <Icons.Check className="w-4 h-4 text-zinc-950 stroke-zinc-950" /> Log Session
          </button>
        </form>
      )}
    </div>
  );
}
