"use client";

import { useState } from "react";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { HugeiconsIcon } from "@hugeicons/react";
import { MagicWand01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

type UploadedMedia = {
  url: string;
  fileId: string;
  thumbnailUrl?: string;
  name: string;
};

type AIImageTransformProps = {
  media: UploadedMedia[];
  onTransform: (fileId: string, newUrl: string, newFileId: string) => void;
  trigger?: React.ReactNode;
};

const TRANSFORMATIONS = [
  { id: "enhance", label: "Enhance", icon: "✨" },
  { id: "background_removal", label: "Remove BG", icon: "🎯" },
  { id: "colorize", label: "Colorize", icon: "🎨" },
  { id: "upscale", label: "Upscale", icon: "🔍" },
  { id: "generative_fill", label: "Generative Fill", icon: "🖌" },
  { id: "remove_text", label: "Remove Text", icon: "📝" },
];

export function AIImageTransform({
  media,
  onTransform,
  trigger,
}: AIImageTransformProps) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [selectedTransform, setSelectedTransform] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const applyTransform = async () => {
    if (!selectedFile || !selectedTransform) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/media/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: selectedFile,
          transformation: selectedTransform,
          prompt: selectedTransform === "generative_fill" ? prompt : undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Transformation failed");
      }
      const data = await res.json();
      onTransform(selectedFile, data.url, data.fileId);
      setOpen(false);
      setSelectedTransform("");
      setPrompt("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transformation failed");
    } finally {
      setLoading(false);
    }
  };

  if (media.length === 0) return null;

  return (
    <>
      <span onClick={() => setOpen(true)}>
        {trigger || (
          <Button variant="outline" size="sm" className="text-xs gap-1.5">
            <HugeiconsIcon icon={MagicWand01Icon} className="w-3.5 h-3.5" />
            AI Transform
          </Button>
        )}
      </span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent className="sm:max-w-lg">
            <DialogTitle>AI Image Transformations</DialogTitle>
            <DialogDescription>
              Apply AI-powered transformations to your uploaded images.
            </DialogDescription>

            <div className="space-y-4 mt-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  Select Image
                </label>
                <div className="flex gap-2 flex-wrap">
                  {media.map((m) => (
                    <button
                      key={m.fileId}
                      type="button"
                      onClick={() => setSelectedFile(m.fileId)}
                      className={cn(
                        "size-16 rounded-lg overflow-hidden border-2 transition-all",
                        selectedFile === m.fileId
                          ? "border-primary"
                          : "border-border hover:border-muted-foreground"
                      )}
                    >
                      <img
                        src={m.thumbnailUrl || m.url}
                        alt={m.name}
                        className="size-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  Transformation
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {TRANSFORMATIONS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTransform(t.id)}
                      className={cn(
                        "px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all",
                        selectedTransform === t.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-transparent text-muted-foreground border-border hover:border-muted-foreground"
                      )}
                    >
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {selectedTransform === "generative_fill" && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">
                    Fill Prompt
                  </label>
                  <Input
                    placeholder="Describe what to generate in the expanded area..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>
              )}

              {error && <p className="text-xs text-destructive">{error}</p>}

              <Button
                onClick={applyTransform}
                disabled={loading || !selectedFile || !selectedTransform}
                className="w-full"
              >
                {loading && <Spinner className="w-3.5 h-3.5" />}
                {loading ? "Applying..." : "Apply Transformation"}
              </Button>
            </div>

            <DialogClose render={<Button variant="ghost" size="sm" className="mt-2">Cancel</Button>} />
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
}
