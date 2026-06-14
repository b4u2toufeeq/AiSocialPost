"use client";

import { useState } from "react";
import { Dialog, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { HugeiconsIcon } from "@hugeicons/react";
import { MagicWand01Icon } from "@hugeicons/core-free-icons";

type CaptionVariant = {
  title: string;
  text: string;
};

type AICaptionDialogProps = {
  platforms: string[];
  onSelect: (caption: string) => void;
  trigger?: React.ReactNode;
};

export function AICaptionDialog({ platforms, onSelect, trigger }: AICaptionDialogProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [captions, setCaptions] = useState<CaptionVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), platforms }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate");
      }
      const data = await res.json();
      setCaptions(data.captions || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const select = (text: string) => {
    onSelect(text);
    setOpen(false);
    setCaptions([]);
    setPrompt("");
  };

  return (
    <>
      <span onClick={() => setOpen(true)}>
        {trigger || (
          <Button variant="outline" size="sm">
            <HugeiconsIcon icon={MagicWand01Icon} className="w-3.5 h-3.5" />
            AI Generate Caption
          </Button>
        )}
      </span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent className="sm:max-w-lg">
            <DialogTitle>AI Caption Generator</DialogTitle>
            <DialogDescription>
              Describe what you want to post and AI will generate caption variants for you.
            </DialogDescription>

            <div className="space-y-3 mt-2">
              <Input
                placeholder="e.g. A motivational post about productivity..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    generate();
                  }
                }}
              />
              <Button
                onClick={generate}
                disabled={loading || !prompt.trim()}
                className="w-full"
              >
                {loading && <Spinner className="w-3.5 h-3.5" />}
                {loading ? "Generating..." : "Generate Captions"}
              </Button>

              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}

              {captions.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {captions.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => select(c.text)}
                      className="w-full text-left p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-xs font-semibold text-primary block mb-1">
                        {c.title}
                      </span>
                      <span className="text-xs text-foreground/80 line-clamp-4">
                        {c.text}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <DialogClose render={<Button variant="ghost" size="sm" className="mt-2">Cancel</Button>} />
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
}
