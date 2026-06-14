"use client";

import { getCharLimit } from "./caption-editor";

type PlatformPreviewProps = {
  platforms: string[];
  content: string;
  mediaUrls: string[];
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "Twitter / X",
  linkedin: "LinkedIn",
  threads: "Threads",
  youtube: "YouTube",
  tiktok: "TikTok",
  pinterest: "Pinterest",
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
};

export function PlatformPreview({ platforms, content, mediaUrls }: PlatformPreviewProps) {
  if (platforms.length === 0) {
    return (
      <div style={{ padding: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
          Platform Preview
        </div>
        <p className="text-xs text-muted-foreground text-center py-8">
          Select platforms to see preview
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: 0 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
        Platform Preview
      </div>
      {platforms.map((platform) => {
        const limit = getCharLimit([platform]);
        const isOverLimit = content.length > limit;
        return (
          <div
            key={platform}
            style={{
              background: "#12121e",
              border: "1px solid #1e1e2e",
              borderRadius: 12,
              padding: 16,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                marginBottom: 8,
                color: PLATFORM_COLORS[platform] || "#7c6ff7",
              }}
            >
              {PLATFORM_LABELS[platform] || platform.toUpperCase()}
              <span style={{ fontSize: 10, marginLeft: 8, opacity: 0.5 }}>
                ({limit.toLocaleString()} char limit)
              </span>
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#c0c0d8",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {content || (
                <span style={{ opacity: 0.3, fontStyle: "italic" }}>
                  Your caption will appear here...
                </span>
              )}
            </div>
            {isOverLimit && (
              <div style={{ fontSize: 10, color: "#ef4444", marginTop: 4, fontWeight: 500 }}>
                Exceeds {PLATFORM_LABELS[platform] || platform} character limit by{" "}
                {(content.length - limit).toLocaleString()} characters
              </div>
            )}
            {mediaUrls.length > 0 && (
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  gap: 6,
                }}
              >
                {mediaUrls.slice(0, 3).map((url, i) => (
                  <div
                    key={i}
                    style={{
                      width: "100%",
                      height: 96,
                      background: "#1e1e2e",
                      borderRadius: 8,
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={url}
                      alt={`Media ${i + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
