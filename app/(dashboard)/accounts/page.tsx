"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  InstagramIcon,
  Facebook01Icon,
  ThreadsIcon,
  NewTwitterIcon,
  Linkedin01Icon,
  YoutubeIcon,
  TiktokIcon,
  PinterestIcon,
  TelegramIcon,
  DiscordIcon,
  SlackIcon,
} from "@hugeicons/core-free-icons";

// ────────────────────────────────────────
// Types
// ────────────────────────────────────────

type PlatformId =
  | "instagram" | "facebook" | "threads" | "twitter" | "linkedin"
  | "youtube" | "tiktok" | "pinterest" | "telegram" | "discord" | "slack";

interface PlatformMeta {
  id: PlatformId;
  name: string;
  color: string;
  bgLight: string;
  bgDark: string;
  icon: IconSvgElement;
}

interface ConnectedAccount {
  id: string;
  platform: string;
  platformUserId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  expiresAt: string | null;
}

// ────────────────────────────────────────
// Platform definitions
// ────────────────────────────────────────

const PLATFORMS: PlatformMeta[] = [
  { id: "instagram", name: "Instagram", color: "#E4405F", bgLight: "bg-pink-50 dark:bg-pink-950/20", bgDark: "", icon: InstagramIcon },
  { id: "facebook", name: "Facebook", color: "#1877F2", bgLight: "bg-blue-50 dark:bg-blue-950/20", bgDark: "", icon: Facebook01Icon },
  { id: "threads", name: "Threads", color: "#000000", bgLight: "bg-slate-100 dark:bg-slate-800", bgDark: "", icon: ThreadsIcon },
  { id: "twitter", name: "Twitter / X", color: "#000000", bgLight: "bg-slate-100 dark:bg-slate-800", bgDark: "", icon: NewTwitterIcon },
  { id: "linkedin", name: "LinkedIn", color: "#0A66C2", bgLight: "bg-blue-50 dark:bg-blue-950/20", bgDark: "", icon: Linkedin01Icon },
  { id: "youtube", name: "YouTube", color: "#FF0000", bgLight: "bg-red-50 dark:bg-red-950/20", bgDark: "", icon: YoutubeIcon },
  { id: "tiktok", name: "TikTok", color: "#000000", bgLight: "bg-slate-100 dark:bg-slate-800", bgDark: "", icon: TiktokIcon },
  { id: "pinterest", name: "Pinterest", color: "#BD081C", bgLight: "bg-red-50 dark:bg-red-950/20", bgDark: "", icon: PinterestIcon },
  { id: "telegram", name: "Telegram", color: "#26A5E4", bgLight: "bg-sky-50 dark:bg-sky-950/20", bgDark: "", icon: TelegramIcon },
  { id: "discord", name: "Discord", color: "#5865F2", bgLight: "bg-indigo-50 dark:bg-indigo-950/20", bgDark: "", icon: DiscordIcon },
  { id: "slack", name: "Slack", color: "#4A154B", bgLight: "bg-purple-50 dark:bg-purple-950/20", bgDark: "", icon: SlackIcon },
];

function tokenExpiresSoon(expiresAt: string | null): "expired" | "soon" | "ok" {
  if (!expiresAt) return "ok";
  const expiry = new Date(expiresAt).getTime();
  const now = Date.now();
  if (expiry < now) return "expired";
  if (expiry < now + 7 * 24 * 60 * 60 * 1000) return "soon";
  return "ok";
}

function formatExpiry(expiresAt: string | null): string {
  if (!expiresAt) return "";
  const d = new Date(expiresAt);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// ────────────────────────────────────────
// Page component – wrapped in Suspense for useSearchParams
// ────────────────────────────────────────

export default function AccountsPage() {
  return (
    <Suspense fallback={<div className="space-y-6"><div className="flex flex-col gap-1.5"><div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" /><div className="h-4 w-72 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse mt-1" /></div></div>}>
      <AccountsContent />
    </Suspense>
  );
}

function AccountsContent() {
  const { t } = useLocale();
  const searchParams = useSearchParams();

  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnectTarget, setDisconnectTarget] = useState<ConnectedAccount | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Success/error from OAuth callback redirect
  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");
    if (connected) {
      setToast({ type: "success", message: `${t.accounts.successConnected} — ${connected}` });
    } else if (error) {
      setToast({ type: "error", message: `${t.accounts.errorConnect}: ${decodeURIComponent(error)}` });
    }
    // Clean query params without full reload
    if (connected || error) {
      const url = new URL(window.location.href);
      url.searchParams.delete("connected");
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams, t.accounts.successConnected, t.accounts.errorConnect]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/accounts");
      const data = await res.json();
      setAccounts(data.accounts || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleConnect = async (platformId: PlatformId) => {
    try {
      const res = await fetch(`/api/oauth/${platformId}/connect`);
      const data = await res.json();

      if (data.requiresManualToken) {
        // TODO: open a dialog to input bot token
        return;
      }

      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else if (data.missingConfig) {
        setToast({ type: "error", message: `${data.platform}: ${t.accounts.configureOAuth}` });
      }
    } catch {
      setToast({ type: "error", message: t.accounts.errorConnect });
    }
  };

  const handleDisconnect = async () => {
    if (!disconnectTarget) return;
    try {
      setDisconnecting(true);
      const res = await fetch(`/api/accounts/${disconnectTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        setAccounts((prev) => prev.filter((a) => a.id !== disconnectTarget.id));
        setDisconnectTarget(null);
      }
    } catch {
      // silent
    } finally {
      setDisconnecting(false);
    }
  };

  const connectedMap = new Map(accounts.map((a) => [a.platform, a]));

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{t.accounts.title}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t.accounts.subtitle}</p>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all duration-300 ${
            toast.type === "success"
              ? "bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Platform grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {PLATFORMS.map((platform) => {
          const account = connectedMap.get(platform.id);
          const isConnected = !!account;
          const tokenStatus = account ? tokenExpiresSoon(account.expiresAt) : "ok";

          return (
            <div
              key={platform.id}
              className={`relative rounded-2xl border transition-all duration-200 ${
                isConnected
                  ? "border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-sm"
              }`}
            >
              {/* Card content */}
              <div className="p-5 flex flex-col gap-4">
                {/* Top row: icon + status */}
                <div className="flex items-start justify-between">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs ${platform.bgLight}`}
                    style={{ backgroundColor: isConnected ? platform.color : undefined }}
                  >
                    <HugeiconsIcon
                      icon={platform.icon}
                      strokeWidth={1.5}
                      className={`w-5 h-5 ${isConnected ? "text-white" : "text-slate-400 dark:text-slate-500"}`}
                    />
                  </div>

                  {isConnected ? (
                    <Badge variant="default" className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2.5} className="w-3 h-3 me-1" />
                      {t.accounts.connected}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-400 dark:text-slate-500 text-[10px] px-2 py-0.5 rounded-full">
                      {t.accounts.disconnected}
                    </Badge>
                  )}
                </div>

                {/* Platform name */}
                <div>
                  <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                    {platform.name}
                  </h3>
                  {isConnected && account && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {account.displayName || account.username || account.platformUserId}
                    </p>
                  )}
                </div>

                {/* Token expiry warning */}
                {isConnected && tokenStatus !== "ok" && (
                  <div className={`text-[11px] font-medium px-3 py-1.5 rounded-lg ${
                    tokenStatus === "expired"
                      ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900"
                      : "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900"
                  }`}>
                    {tokenStatus === "expired"
                      ? t.accounts.tokenExpired
                      : `${t.accounts.tokenExpiring} — ${formatExpiry(account!.expiresAt)}`}
                  </div>
                )}

                {/* Action button */}
                <div className="mt-auto">
                  {isConnected ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => setDisconnectTarget(account)}
                    >
                      {t.accounts.disconnect}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                      onClick={() => handleConnect(platform.id)}
                    >
                      {t.accounts.connect}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading skeletons */}
        {loading && PLATFORMS.map((p) => (
          <div key={`skeleton-${p.id}`} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-start justify-between mb-4">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <Skeleton className="w-16 h-5 rounded-full" />
            </div>
            <Skeleton className="h-5 w-28 mb-2" />
            <Skeleton className="h-8 w-full rounded-lg mt-4" />
          </div>
        ))}
      </div>

      {/* Empty state when no accounts */}
      {!loading && accounts.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">{t.accounts.placeholderTitle}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">{t.accounts.placeholderDesc}</p>
        </div>
      )}

      {/* Disconnect confirmation dialog */}
      <Dialog open={!!disconnectTarget} onOpenChange={(open) => { if (!open) setDisconnectTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.accounts.confirmDisconnect}</DialogTitle>
            <DialogDescription>{t.accounts.confirmDisconnectDesc}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisconnectTarget(null)} disabled={disconnecting}>
              {t.accounts.cancel}
            </Button>
            <Button variant="destructive" onClick={handleDisconnect} disabled={disconnecting}>
              {disconnecting ? "..." : t.accounts.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
