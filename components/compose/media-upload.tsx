"use client";

import { useState, useRef } from "react";
import { Spinner } from "@/components/ui/spinner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Image01Icon, Delete01Icon } from "@hugeicons/core-free-icons";

type UploadedMedia = {
  url: string;
  fileId: string;
  thumbnailUrl?: string;
  name: string;
};

type MediaUploadProps = {
  media: UploadedMedia[];
  onAdd: (media: UploadedMedia) => void;
  onRemove: (index: number) => void;
  maxFiles?: number;
};

export function MediaUpload({ media, onAdd, onRemove, maxFiles = 4 }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onAdd(data);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = maxFiles - media.length;
    files.slice(0, remaining).forEach(upload);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        {media.map((m, i) => (
          <div key={m.fileId} className="relative group size-20 rounded-lg overflow-hidden border border-border">
            <img
              src={m.thumbnailUrl || m.url}
              alt={m.name}
              className="size-full object-cover"
            />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-0.5 right-0.5 size-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <HugeiconsIcon icon={Delete01Icon} className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}

        {media.length < maxFiles && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="size-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <Spinner className="w-5 h-5" />
              ) : (
                <HugeiconsIcon icon={Image01Icon} className="w-5 h-5" />
              )}
            </button>
          </>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground">
        {media.length}/{maxFiles} files
      </p>
    </div>
  );
}
