import React, { useState } from "react";
import { DailyProgress } from "../types";
import { getDayAbbreviation } from "../utils/fitnessUtils";
import { BarChart3, Flame, Footprints, Clock } from "lucide-react";

interface WeeklyChartProps {
  history: DailyProgress[];
}

type ChartMetric = "activeMinutes" | "caloriesBurned" | "steps";

export default function WeeklyChart({ history }: WeeklyChartProps) {
  const [metric, setMetric] = useState<ChartMetric>("activeMinutes");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Constants for Chart Layout
  const chartHeight = 160;
  const paddingBottom = 25;
  const paddingTop = 15;
  const graphHeight = chartHeight - paddingTop - paddingBottom;

  // Extract values based on metric
  const dataPoints = history.map((day) => {
    let value = 0;
    if (metric === "activeMinutes") value = day.activeMinutes;
    if (metric === "caloriesBurned") value = day.caloriesBurned;
    if (metric === "steps") value = day.steps;
    return {
      date: day.date,
      dayAbbr: getDayAbbreviation(day.date),
      value: value,
    };
  });

  const maxVal = Math.max(...dataPoints.map((dp) => dp.value), 10);
  // Round max value upstream to next beautiful increment
  const roundedMaxVal = Math.ceil(maxVal * 1.15 / 10) * 10;

  // Render Horizontal Gridlines info
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  // Map Metric to metadata
  const getMetricMetadata = () => {
    switch (metric) {
      case "activeMinutes":
        return { label: "Active Minutes", unit: "mins", color: "from-violet-500 to-indigo-500", icon: Clock };
      case "caloriesBurned":
        return { label: "Calories", unit: "kcal", color: "from-orange-500 to-amber-500", icon: Flame };
      case "steps":
        return { label: "Steps", unit: "steps", color: "from-lime-400 to-emerald-500", icon: Footprints };
    }
  };

  const meta = getMetricMetadata();

  return (
    <div id="weekly-chart-container" className="bg-zinc-900 rounded-[32px] border border-zinc-800 p-6 shadow-xl hover:border-zinc-700 transition-all flex flex-col h-full justify-between">
      <div>
        {/* Chart Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-lime-400" /> 7-Day Analytics Trend
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Reflecting actual historic logs and manual trackers
            </p>
          </div>

          {/* Metric Selector Pills */}
          <div className="flex bg-zinc-950 border border-zinc-800/80 p-1 rounded-xl self-start sm:self-auto">
            {(["activeMinutes", "caloriesBurned", "steps"] as ChartMetric[]).map((m) => {
              const isSelected = m === metric;
              let label = "Mins";
              if (m === "caloriesBurned") label = "Calories";
              if (m === "steps") label = "Steps";

              return (
                <button
                  key={m}
                  id={`metric-btn-${m}`}
                  onClick={() => setMetric(m)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-tight transition-all cursor-pointer ${
                    isSelected
                      ? "bg-lime-400 text-zinc-950 shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* SVG Container */}
        <div className="relative w-full">
          {/* Main SVG Graphic */}
          <svg viewBox={`0 0 500 ${chartHeight}`} className="w-full overflow-visible">
            {/* Definitions for gorgeous color gradients */}
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={metric === "activeMinutes" ? "#a78bfa" : metric === "caloriesBurned" ? "#f97316" : "#a3e635"} />
                <stop offset="100%" stopColor={metric === "activeMinutes" ? "#c084fc" : metric === "caloriesBurned" ? "#ffedd5" : "#4d7c0f"} stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            {gridLines.map((ratio, idx) => {
              const yVal = chartHeight - paddingBottom - ratio * graphHeight;
              const gridLabel = Math.round(ratio * roundedMaxVal);
              return (
                <g key={idx}>
                  <line
                    x1="45"
                    y1={yVal}
                    x2="495"
                    y2={yVal}
                    stroke="#27272a"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x="35"
                    y={yVal + 3}
                    textAnchor="end"
                    className="font-mono text-[9px] fill-zinc-500 font-semibold"
                  >
                    {gridLabel >= 1000 ? `${(gridLabel / 1000).toFixed(1)}k` : gridLabel}
                  </text>
                </g>
              );
            })}

            {/* Render Columns/Bars */}
            {dataPoints.map((dp, idx) => {
              const barWidth = 32;
              const innerGutter = 10;
              const startX = 55 + idx * (barWidth + innerGutter + 18);
              
              const barRatio = dp.value / roundedMaxVal;
              const activeBarHeight = Math.max(3, barRatio * graphHeight);
              const barY = chartHeight - paddingBottom - activeBarHeight;

              const isHovered = hoveredIdx === idx;

              return (
                <g
                  key={idx}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="cursor-pointer"
                >
                  {/* Invisible broad hitbox for hovering ease */}
                  <rect
                    x={startX - 10}
                    y={paddingTop}
                    width={barWidth + 20}
                    height={graphHeight}
                    fill="transparent"
                  />

                  {/* Visual Bar Column */}
                  <rect
                    x={startX}
                    y={barY}
                    width={barWidth}
                    height={activeBarHeight}
                    rx="6"
                    className={`${
                      isHovered ? "filter drop-shadow-md" : ""
                    } transition-all duration-200`}
                    fill="url(#chartGradient)"
                    stroke={isHovered ? (metric === "activeMinutes" ? "#a78bfa" : metric === "caloriesBurned" ? "#fb923c" : "#a3e635") : "none"}
                    strokeWidth="1.5"
                  />

                  {/* Mini floating hover indicator with direct value */}
                  {isHovered && (
                    <g>
                      <rect
                        x={startX - 15}
                        y={barY - 26}
                        width={barWidth + 30}
                        height={18}
                        rx="4"
                        fill="#18181b"
                        stroke="#27272a"
                        strokeWidth="1"
                      />
                      <text
                        x={startX + barWidth / 2}
                        y={barY - 14}
                        textAnchor="middle"
                        className="font-mono text-[9px] font-bold fill-white"
                      >
                        {dp.value.toLocaleString()}
                      </text>
                    </g>
                  )}

                  {/* X-Axis Date label */}
                  <text
                    x={startX + barWidth / 2}
                    y={chartHeight - 8}
                    textAnchor="middle"
                    className={`font-sans text-[10px] font-bold tracking-tight ${
                      isHovered ? "fill-lime-400" : "fill-zinc-500"
                    } transition-colors`}
                  >
                    {dp.dayAbbr}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Selected Day/Metric Explanatory Tooltip summary */}
      <div className="bg-zinc-950 rounded-xl p-3.5 mt-4 border border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {React.createElement(meta.icon, { className: `w-4 h-4 text-${metric === 'activeMinutes' ? 'purple' : metric === 'caloriesBurned' ? 'orange' : 'lime'}-400` })}
          <span className="text-xs text-zinc-400 font-semibold font-sans">
            Log Breakdown:
          </span>
          <span className="text-xs font-bold text-zinc-200">
            {hoveredIdx !== null
              ? `${dataPoints[hoveredIdx].dayAbbr}: ${dataPoints[hoveredIdx].value.toLocaleString()} ${meta.unit}`
              : `7D Avg: ${Math.round(dataPoints.reduce((acc, current) => acc + current.value, 0) / 7).toLocaleString()} ${meta.unit}`}
          </span>
        </div>
        <div className="text-[10px] text-zinc-600 font-mono">
          Interactive columns
        </div>
      </div>
    </div>
  );
}
