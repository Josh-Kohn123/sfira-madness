"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";

interface ScreenshotShareProps {
  children: React.ReactNode;
  filename?: string;
}

export function ScreenshotShare({
  children,
  filename = "sfira-madness",
}: ScreenshotShareProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState(false);

  async function capture() {
    if (!ref.current) return;
    setCapturing(true);
    try {
      const dataUrl = await toPng(ref.current, {
        backgroundColor: "#0a0a12",
        pixelRatio: 2,
      });

      // Try native share (mobile) first, fall back to download
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `${filename}.png`, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        const link = document.createElement("a");
        link.download = `${filename}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch {
      // User cancelled share or error — ignore
    } finally {
      setCapturing(false);
    }
  }

  return (
    <div>
      <div ref={ref} className="rounded-2xl">
        {children}
      </div>
      <button
        onClick={capture}
        disabled={capturing}
        className="mt-2 w-full rounded-xl border border-cosmos-border bg-white/[0.04] py-2 text-xs font-semibold text-cosmos-muted hover:bg-gold/[0.08] hover:text-gold transition-colors disabled:opacity-50"
      >
        {capturing ? "Capturing..." : "📸 Share Screenshot"}
      </button>
    </div>
  );
}
