import React from "react";
import * as Icons from "lucide-react";
import { WorkoutSession } from "../types";
import { WORKOUT_TYPES } from "../utils/fitnessUtils";

interface RecentWorkoutsListProps {
  workouts: WorkoutSession[];
  onDeleteWorkout: (id: string) => void;
}

export default function RecentWorkoutsList({ workouts, onDeleteWorkout }: RecentWorkoutsListProps) {
  // Sort workouts latest first
  const sortedWorkouts = [...workouts].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div id="workouts-list-container" className="bg-zinc-900 rounded-[32px] border border-zinc-800 p-6 shadow-xl hover:border-zinc-700 transition-all flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Icons.History className="w-5 h-5 text-lime-400" /> Workout History Log
            </h2>
            <span className="text-xs text-zinc-500 mt-1 block font-bold">
              Showing {workouts.length} recorded {workouts.length === 1 ? "session" : "sessions"}
            </span>
          </div>
        </div>

        {/* List Content */}
        {sortedWorkouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-zinc-950 border border-dashed border-zinc-800 rounded-[24px]">
            <Icons.Activity className="w-8 h-8 text-zinc-700 stroke-[1.5] mb-2" />
            <span className="text-xs font-bold text-zinc-400 block">
              No Workouts Logged Yet
            </span>
            <span className="text-[11px] text-zinc-600 mt-1">
              Use the live timer or manual form to get started!
            </span>
          </div>
        ) : (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {sortedWorkouts.map((session) => {
              const meta = WORKOUT_TYPES.find((w) => w.id === session.type) || WORKOUT_TYPES[0];
              const WIcon = Icons[meta.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
              
              // Format date cleanly (e.g. Jun 21, 2026)
              let dateFormatted = session.date;
              try {
                const parts = session.date.split("-");
                if (parts.length === 3) {
                  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                  dateFormatted = d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                }
              } catch (e) {
                // fall back to default
              }

              return (
                <div
                  key={session.id}
                  id={`workout-item-${session.id}`}
                  className="group flex items-start justify-between p-3.5 rounded-[20px] border border-zinc-800 hover:border-zinc-700 bg-zinc-950/80 hover:bg-zinc-950 transition-all hover:shadow-2xl relative"
                >
                  <div className="flex gap-3">
                    {/* Activity Icon Box with bento colors */}
                    <div className={`p-2.5 rounded-xl shrink-0 self-start ${meta.bgLight.replace('bg-', 'bg-').replace('-50', '-950/40')} ${meta.textCol}`}>
                      {WIcon && <WIcon className="w-5 h-5" />}
                    </div>

                    {/* Meta info */}
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-white leading-none">
                          {meta.label}
                        </span>
                        <span className="text-[10px] text-zinc-700">&bull;</span>
                        <span className="text-[10px] text-zinc-500 font-bold font-mono">
                          {dateFormatted}
                        </span>
                      </div>

                      {/* Workout Quick Metrics */}
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-400 font-bold font-mono">
                        <span className="flex items-center gap-0.5">
                          <Icons.Clock className="w-3.5 h-3.5 text-zinc-500" />
                          {session.duration}m
                        </span>
                        <span className="text-zinc-800">|</span>
                        <span className="flex items-center gap-0.5 text-rose-400">
                          <Icons.Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-950/40" />
                          {session.calories} kcal
                        </span>
                      </div>

                      {/* Session Notes */}
                      {session.notes && (
                        <p className="mt-1.5 text-[11px] text-zinc-500 italic font-medium leading-relaxed">
                          &ldquo;{session.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Deletion Command Container */}
                  <button
                    id={`btn-delete-${session.id}`}
                    onClick={() => onDeleteWorkout(session.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 opacity-0 group-hover:opacity-100 transition-all absolute right-2 md:relative md:opacity-0 cursor-pointer"
                    title="Delete workout"
                  >
                    <Icons.Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mini motivative footer banner */}
      <div className="mt-5 bg-lime-950/10 rounded-xl p-3 border border-lime-900/10 flex items-center gap-2">
        <Icons.Heart className="w-4 h-4 text-lime-400 fill-lime-950/50" />
        <span className="text-[11px] text-lime-400 font-bold leading-none">
          Active streak logged! Every session counts.
        </span>
      </div>
    </div>
  );
}
