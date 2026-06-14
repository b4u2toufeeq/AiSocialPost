"use client";

import { cn } from "@/lib/utils";

type CaptionEditorProps = {
  value: string;
  onChange: (value: string) => void;
  selectedPlatforms: string[];
  placeholder?: string;
};

const PLATFORM_LIMITS: Record<string, number> = {
  twitter: 280,
  instagram: 2200,
  facebook: 63206,
  linkedin: 3000,
  threads: 500,
  youtube: 5000,
  tiktok: 2200,
  pinterest: 500,
};

export function getCharLimit(platforms: string[]): number {
  if (platforms.length === 0) return 2200;
  const limits = platforms.map((p) => PLATFORM_LIMITS[p] || 2200);
  return Math.min(...limits);
}

export function CaptionEditor({
  value,
  onChange,
  selectedPlatforms,
  placeholder = "What's on your mind? Write your post here...",
}: CaptionEditorProps) {
  const chars = value.length;
  const limit = getCharLimit(selectedPlatforms);
  const isOver = chars > limit;

  return (
    <div className="bg-[#12121e] border border-[#1e1e2e] rounded-xl p-5">
      <div className="text-xs text-[#8888a8] mb-2.5">Post Content</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border-none text-[#f0f0f5] text-sm resize-none outline-none min-h-[120px] leading-relaxed placeholder:text-[#5555]"
        rows={5}
      />
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1e1e2e]">
        <span
          className={cn(
            "text-xs tabular-nums text-[#8888a8]",
            isOver && "text-red-500 font-medium"
          )}
        >
          {chars.toLocaleString()} / {limit.toLocaleString()} characters
        </span>
      </div>
    </div>
  );
}
