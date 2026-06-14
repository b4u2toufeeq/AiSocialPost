"use client";

import { cn } from "@/lib/utils";

type SchedulePickerProps = {
  mode: "now" | "schedule";
  onModeChange: (mode: "now" | "schedule") => void;
  date: string;
  onDateChange: (date: string) => void;
};

export function SchedulePicker({ mode, onModeChange, date, onDateChange }: SchedulePickerProps) {
  const now = new Date();
  const minDate = now.toISOString().slice(0, 16);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex rounded-lg border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => onModeChange("now")}
          className={cn(
            "px-4 py-1.5 text-xs font-medium transition-colors",
            mode === "now"
              ? "bg-primary text-primary-foreground"
              : "bg-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Post Now
        </button>
        <button
          type="button"
          onClick={() => onModeChange("schedule")}
          className={cn(
            "px-4 py-1.5 text-xs font-medium transition-colors",
            mode === "schedule"
              ? "bg-primary text-primary-foreground"
              : "bg-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Schedule
        </button>
      </div>

      {mode === "schedule" && (
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          min={minDate}
          className="h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
      )}
    </div>
  );
}
