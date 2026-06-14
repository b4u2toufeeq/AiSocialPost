"use client";

import { cn } from "@/lib/utils";

type ConnectedAccount = {
  id: string;
  platform: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

type PlatformSelectorProps = {
  accounts: ConnectedAccount[];
  selected: string[];
  onChange: (ids: string[]) => void;
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#E4405F",
  facebook: "#1877F2",
  twitter: "#000000",
  linkedin: "#0A66C2",
  threads: "#000000",
  youtube: "#FF0000",
  tiktok: "#000000",
  pinterest: "#BD081C",
  telegram: "#26A5E4",
  discord: "#5865F2",
  slack: "#4A154B",
};

export function PlatformSelector({ accounts, selected, onChange }: PlatformSelectorProps) {
  if (accounts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No connected accounts. Connect accounts first.
      </p>
    );
  }

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {accounts.map((account) => {
        const isSelected = selected.includes(account.id);
        const color = PLATFORM_COLORS[account.platform] || "#7c6ff7";
        return (
          <button
            key={account.id}
            type="button"
            onClick={() => toggle(account.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all border",
              isSelected
                ? "border-transparent text-white"
                : "border-border text-muted-foreground bg-transparent hover:bg-muted/50"
            )}
            style={isSelected ? { backgroundColor: color, borderColor: color } : undefined}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
            {account.displayName || account.username}
          </button>
        );
      })}
    </div>
  );
}
