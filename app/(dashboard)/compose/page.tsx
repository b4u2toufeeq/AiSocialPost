"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/providers/locale-provider";
import { PlatformSelector } from "@/components/compose/platform-selector";
import { CaptionEditor } from "@/components/compose/caption-editor";
import { AICaptionDialog } from "@/components/compose/ai-caption-dialog";
import { AIImageTransform } from "@/components/compose/ai-image-transform";
import { MediaUpload } from "@/components/compose/media-upload";
import { SchedulePicker } from "@/components/compose/schedule-picker";
import { PlatformPreview } from "@/components/compose/platform-preview";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { MagicWand01Icon } from "@hugeicons/core-free-icons";

type ConnectedAccount = {
  id: string;
  platform: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

type UploadedMedia = {
  url: string;
  fileId: string;
  thumbnailUrl?: string;
  name: string;
};

export default function ComposePage() {
  const router = useRouter();
  const { t } = useLocale();

  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [scheduleMode, setScheduleMode] = useState<"now" | "schedule">("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  useEffect(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((data) => {
        const accts = (data.accounts || data || []) as ConnectedAccount[];
        setAccounts(accts);
      })
      .catch(() => {});
  }, []);

  const selectedPlatforms = accounts
    .filter((a) => selectedAccountIds.includes(a.id))
    .map((a) => a.platform);

  const handleAISelect = useCallback((caption: string) => {
    setContent(caption);
  }, []);

  const handleMediaAdd = useCallback((newMedia: UploadedMedia) => {
    setMedia((prev) => [...prev, newMedia]);
  }, []);

  const handleMediaRemove = useCallback((index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleTransform = useCallback(
    (fileId: string, newUrl: string, newFileId: string) => {
      setMedia((prev) =>
        prev.map((m) =>
          m.fileId === fileId
            ? { ...m, url: newUrl, fileId: newFileId, thumbnailUrl: undefined }
            : m
        )
      );
      toast.success("Image transformation applied");
    },
    []
  );

  const handlePublish = async () => {
    if (selectedAccountIds.length === 0) {
      toast.error("Select at least one platform");
      return;
    }
    if (!content.trim()) {
      toast.error("Write some content for your post");
      return;
    }

    setPublishing(true);
    try {
      const body = {
        content: content.trim(),
        mediaUrls: media.map((m) => m.url),
        targetAccountIds: selectedAccountIds,
        scheduledFor:
          scheduleMode === "schedule" && scheduleDate
            ? new Date(scheduleDate).toISOString()
            : undefined,
      };

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create post");
      }

      toast.success(
        scheduleMode === "now"
          ? "Post published successfully!"
          : "Post scheduled successfully!"
      );

      setContent("");
      setMedia([]);
      setSelectedAccountIds([]);
      setScheduleMode("now");
      setScheduleDate("");

      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create post";
      toast.error(message);
    } finally {
      setPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!content.trim()) {
      toast.error("Write some content to save as draft");
      return;
    }

    setSavingDraft(true);
    try {
      const body = {
        content: content.trim(),
        mediaUrls: media.map((m) => m.url),
        targetAccountIds: selectedAccountIds,
        status: "draft",
        scheduledFor:
          scheduleMode === "schedule" && scheduleDate
            ? new Date(scheduleDate).toISOString()
            : undefined,
      };

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save draft");
      }

      toast.success("Draft saved!");

      setContent("");
      setMedia([]);
      setSelectedAccountIds([]);
      setScheduleMode("now");
      setScheduleDate("");

      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save draft";
      toast.error(message);
    } finally {
      setSavingDraft(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      <div className="flex-1 space-y-6 min-w-0">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t.composer.title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t.composer.contentPlaceholder}
          </p>
        </div>

        {/* Platform Selector */}
        <div>
          <div className="text-xs text-[#8888a8] mb-2.5">
            {t.composer.selectPlatforms}
          </div>
          <PlatformSelector
            accounts={accounts}
            selected={selectedAccountIds}
            onChange={setSelectedAccountIds}
          />
        </div>

        {/* Caption Editor */}
        <CaptionEditor
          value={content}
          onChange={setContent}
          selectedPlatforms={selectedPlatforms}
          placeholder={t.composer.contentPlaceholder}
        />

        {/* AI Caption Bar */}
        <div className="flex items-center gap-2">
          <AICaptionDialog
            platforms={selectedPlatforms}
            onSelect={handleAISelect}
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5"
                disabled={selectedPlatforms.length === 0}
              >
                <HugeiconsIcon icon={MagicWand01Icon} className="w-3.5 h-3.5" />
                {t.composer.generateCaption}
              </Button>
            }
          />
        </div>

        {/* Media Upload */}
        <div>
          <div className="text-xs text-[#8888a8] mb-2.5">Media</div>
          <div className="flex items-center gap-3">
            <MediaUpload
              media={media}
              onAdd={handleMediaAdd}
              onRemove={handleMediaRemove}
            />
            <AIImageTransform
              media={media}
              onTransform={handleTransform}
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5"
                  disabled={media.length === 0}
                >
                  <HugeiconsIcon icon={MagicWand01Icon} className="w-3.5 h-3.5" />
                  AI Transform
                </Button>
              }
            />
          </div>
        </div>

        {/* Schedule */}
        <div className="flex items-center gap-3 bg-[#12121e] dark:bg-slate-900 border border-[#1e1e2e] dark:border-slate-800 rounded-xl px-5 py-4 flex-wrap">
          <SchedulePicker
            mode={scheduleMode}
            onModeChange={setScheduleMode}
            date={scheduleDate}
            onDateChange={setScheduleDate}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={savingDraft || !content.trim()}
          >
            {savingDraft ? (
              <Spinner className="w-3.5 h-3.5" />
            ) : (
              "Save Draft"
            )}
          </Button>
          <Button
            onClick={handlePublish}
            disabled={publishing || selectedAccountIds.length === 0 || !content.trim()}
          >
            {publishing ? (
              <Spinner className="w-3.5 h-3.5" />
            ) : scheduleMode === "now" ? (
              "Publish Now"
            ) : (
              "Schedule Post"
            )}
          </Button>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="w-full lg:w-80 shrink-0">
        <PlatformPreview
          platforms={selectedPlatforms}
          content={content}
          mediaUrls={media.map((m) => m.url)}
        />
      </div>
    </div>
  );
}
