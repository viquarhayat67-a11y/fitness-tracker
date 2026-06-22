import React, { useState, useEffect, useRef } from "react";
import * as Icons from "lucide-react";
import { WORKOUT_TYPES } from "../utils/fitnessUtils";
import { WorkoutSession } from "../types";

interface ActiveWorkoutTimerProps {
  onLogWorkout: (session: Omit<WorkoutSession, "id">) => void;
}

export default function ActiveWorkoutTimer({ onLogWorkout }: ActiveWorkoutTimerProps) {
  const [selectedType, setSelectedType] = useState(WORKOUT_TYPES[0].id);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [time, setTime] = useState(0); // in seconds
  const [notes, setNotes] = useState("");

  const incrementRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && !isPaused) {
      incrementRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (incrementRef.current) {
        clearInterval(incrementRef.current);
      }
    }
    return () => {
      if (incrementRef.current) {
        clearInterval(incrementRef.current);
      }
    };
  }, [isActive, isPaused]);

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsPaused(true);
    setTime(0);
    setNotes("");
  };

  const currentWorkoutMeta = WORKOUT_TYPES.find((w) => w.id === selectedType) || WORKOUT_TYPES[0];
  const minutes = time / 60;
  const estimatedCalories = Math.round(minutes * currentWorkoutMeta.kcalPerMin);

  const handleSaveSession = () => {
    if (time < 5) {
      alert("Workout time is too short! Keep active for at least 5 seconds.");
      return;
    }

    onLogWorkout({
      type: selectedType,
      duration: Math.max(1, Math.round(minutes)), // ensure at least 1 min
      calories: estimatedCalories,
      date: new Date().toISOString().split("T")[0],
      notes: notes.trim() || undefined,
    });

    // Reset after logging
    handleReset();
  };

  // Time Formatter (HH:MM:SS)
  const formatTime = () => {
    const getSeconds = `0${time % 60}`.slice(-2);
    const m = Math.floor(time / 60);
    const getMinutes = `0${m % 60}`.slice(-2);
    const getHours = `0${Math.floor(time / 3600)}`.slice(-2);
    return `${getHours}:${getMinutes}:${getSeconds}`;
  };

  return (
    <div id="workout-timer-container" className="bg-zinc-900 rounded-[32px] border border-zinc-800 p-6 shadow-xl hover:border-zinc-700 transition-all flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <Icons.Timer className="w-5 h-5 text-lime-400" /> Active Workout Tracker
          </h2>
          {isActive && !isPaused && (
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
          )}
        </div>

        {/* Workout Selection Tabs */}
        {!isActive ? (
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
              Select Workout Activity
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {WORKOUT_TYPES.map((workout) => {
                const WIcon = Icons[workout.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
                const isSelected = selectedType === workout.id;
                return (
                  <button
                    key={workout.id}
                    id={`timer-select-${workout.id}`}
                    onClick={() => setSelectedType(workout.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? `bg-lime-950/40 border-lime-800/40 text-lime-400 font-bold shadow-xs`
                        : "bg-zinc-800/40 hover:bg-zinc-800 border-zinc-800/60 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {WIcon && <WIcon className={`w-5 h-5 mb-1 ${isSelected ? "text-lime-400" : "text-zinc-500"}`} />}
                    <span className="text-xs leading-none mt-1">{workout.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-zinc-950 rounded-xl p-4 mb-4 border border-zinc-800 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${currentWorkoutMeta.bgLight.replace('bg-', 'bg-').replace('-50', '-950/40')} ${currentWorkoutMeta.textCol}`}>
                {React.createElement(Icons[currentWorkoutMeta.icon as keyof typeof Icons] as any, { className: "w-5 h-5" })}
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-500 block uppercase tracking-widest">
                  Current Session
                </span>
                <span className="font-semibold text-white">{currentWorkoutMeta.label}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">
                Est. Burn rate
              </span>
              <span className="font-mono text-xs font-semibold text-zinc-400">
                {currentWorkoutMeta.kcalPerMin} kcal/m
              </span>
            </div>
          </div>
        )}

        {/* Big Digit Countdown Timer Display with custom bento-styling */}
        <div className="flex flex-col items-center justify-center py-6 bg-zinc-950 rounded-2xl border border-zinc-800/60 relative overflow-hidden mb-4">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest block mb-1 relative z-10">
            Elapsed Time
          </span>
          <span id="elapsed-time-digits" className="font-mono text-4xl sm:text-5xl font-black text-white tracking-widest relative z-10 select-none">
            {formatTime()}
          </span>

          <div className="flex items-center gap-4 mt-2 font-mono text-xs text-lime-400 relative z-10 font-bold">
            <span className="flex items-center gap-1">
              <Icons.Flame className="w-3.5 h-3.5 text-orange-500" />
              {estimatedCalories} kcal burned
            </span>
            <span className="text-zinc-800">|</span>
            <span className="text-zinc-400">
              {Math.max(1, Math.round(minutes))} active min
            </span>
          </div>
        </div>

        {/* Optional quick notes container */}
        <div className="mb-4">
          <input
            type="text"
            id="workout-notes-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add comments / notes (e.g., Run outdoors, Cardio level 8)"
            className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 placeholder-zinc-600 outline-none focus:bg-zinc-900 focus:border-lime-500 transition-all font-sans"
          />
        </div>
      </div>

      {/* Timer Controls Grid */}
      <div className="flex items-center gap-2 mt-2">
        {!isActive ? (
          <button
            id="start-workout-button"
            onClick={handleStart}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold bg-lime-400 hover:bg-lime-500 text-zinc-950 shadow-md shadow-lime-950/20 transition-all active:scale-[0.98] text-xs uppercase tracking-wider cursor-pointer"
          >
            <Icons.Play className="w-4 h-4 fill-zinc-950 stroke-zinc-950" /> Start Workout
          </button>
        ) : (
          <>
            {isPaused ? (
              <button
                id="resume-workout-button"
                onClick={handleStart}
                className="flex-1 flex items-center justify-center gap-1.5 py-3.5 px-2 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all text-xs cursor-pointer"
              >
                <Icons.Play className="w-3.5 h-3.5 fill-white" /> Resume
              </button>
            ) : (
              <button
                id="pause-workout-button"
                onClick={handlePause}
                className="flex-1 flex items-center justify-center gap-1.5 py-3.5 px-2 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all text-xs cursor-pointer"
              >
                <Icons.Pause className="w-3.5 h-3.5 fill-white" /> Pause
              </button>
            )}

            <button
              id="save-workout-button"
              onClick={handleSaveSession}
              className="flex-1 flex items-center justify-center gap-1.5 py-3.5 px-2 rounded-xl font-bold bg-lime-400 hover:bg-lime-500 text-zinc-950 transition-all text-xs shadow-lg shadow-lime-950/10 cursor-pointer"
            >
              <Icons.Save className="w-3.5 h-3.5" /> Save Workout
            </button>

            <button
              id="reset-workout-button"
              onClick={handleReset}
              className="px-3.5 py-3.5 rounded-xl font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all text-xs cursor-pointer"
              title="Reset Workout"
            >
              <Icons.RotateCcw className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
