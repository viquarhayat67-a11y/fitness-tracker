import React from "react";
import * as Icons from "lucide-react";
import { motion } from "motion/react";

interface ProgressCardProps {
  id: string;
  title: string;
  value: number;
  target: number;
  unit: string;
  iconName: keyof typeof Icons;
  colorClass: string; // Tailwind gradient or text color
  bgClass: string;
  glowClass: string;
  quickIncrements: { label: string; amount: number }[];
  onIncrement: (amount: number) => void;
}

export default function ProgressCard({
  id,
  title,
  value,
  target,
  unit,
  iconName,
  colorClass,
  bgClass,
  glowClass,
  quickIncrements,
  onIncrement,
}: ProgressCardProps) {
  // SVG Ring calculation
  const radius = 36;
  const stroke = 6;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((value / target) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Dynamically resolve icon from name
  const IconComponent = Icons[iconName] as React.ComponentType<{ className?: string }>;

  return (
    <motion.div
      id={`card-${id}`}
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, scale: 1.01, borderColor: "rgb(63, 63, 70)" }}
      className="bg-zinc-900 rounded-[32px] border border-zinc-800 p-6 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between"
    >
      {/* Card Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
            {title}
          </span>
          <div className="flex items-baseline gap-1 overflow-hidden">
            <motion.span 
              key={value}
              initial={{ opacity: 0.6, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="font-display text-3xl font-black text-white tracking-tight inline-block"
            >
              {value.toLocaleString()}
            </motion.span>
            <span className="text-xs text-zinc-500 font-semibold font-mono">
              / {target.toLocaleString()} {unit}
            </span>
          </div>
        </div>
        
        {/* Decorative Mini Icon Container with high contrast bento background */}
        <div className={`p-2.5 rounded-2xl ${bgClass.replace('bg-', 'bg-').replace('-50', '-950/40')} ${colorClass}`}>
          {IconComponent && <IconComponent className="w-5 h-5 stroke-[2.2]" />}
        </div>
      </div>

      {/* Progress Center Core */}
      <div className="flex justify-center items-center py-4 relative">
        <svg className="w-24 h-24 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            className="text-zinc-800"
            strokeWidth={stroke}
            fill="transparent"
            stroke="currentColor"
          />
          {/* Active progress path */}
          <motion.circle
            cx="48"
            cy="48"
            r={radius}
            strokeWidth={stroke}
            fill="transparent"
            className={`${glowClass}`}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ type: "spring", stiffness: 60, damping: 12, mass: 0.8 }}
            strokeLinecap="round"
          />
        </svg>

        {/* Floating Percentage Indicator */}
        <div className="absolute inset-0 flex flex-col justify-center items-center select-none overflow-hidden">
          <motion.span 
            key={percentage}
            initial={{ scale: 0.8, opacity: 0.55 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 14 }}
            className="font-display font-black text-xl text-white inline-block"
          >
            {Math.round((value / target) * 100)}%
          </motion.span>
        </div>
      </div>

      {/* Daily Target Progress Message */}
      <div className="mt-2 text-center">
        {value >= target ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-lime-400 bg-lime-950/40 border border-lime-800/30 px-3 py-1 rounded-full">
            <Icons.CheckCircle className="w-3.5 h-3.5 fill-lime-950" /> Goal Achieved!
          </span>
        ) : (
          <span className="text-[11px] text-zinc-500 font-bold tracking-tight">
            {(target - value).toLocaleString()} {unit} to target
          </span>
        )}
      </div>

      {/* Custom Increments Buttons Grid */}
      <div className="mt-5 grid grid-cols-2 gap-2">
        {quickIncrements.map((inc, i) => (
          <button
            key={i}
            id={`btn-${id}-inc-${i}`}
            onClick={() => onIncrement(inc.amount)}
            className="flex items-center justify-center gap-1 text-[11px] font-bold text-zinc-300 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 py-2.5 px-2 rounded-xl border border-zinc-700/40 transition-all active:scale-[0.97]"
          >
            <Icons.Plus className="w-3.5 h-3.5 text-zinc-500" />
            {inc.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
