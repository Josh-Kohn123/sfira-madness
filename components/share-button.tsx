"use client";

import { useState, useEffect } from "react";

interface ShareButtonProps {
  inviteCode: string;
  groupName: string;
}

export function ShareButton({ inviteCode, groupName }: ShareButtonProps) {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const url = `${origin}/join/${inviteCode}`;
  const whatsappText = encodeURIComponent(
    `Join me on Sfira Madness! 🔥 Guess how far your friends will count the Omer — 49 days of bragging rights.\n\n${url}`
  );

  return (
    <div className="flex gap-2">
      <a
        href={`https://wa.me/?text=${whatsappText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 rounded-xl border border-[#25d366]/30 bg-white/[0.04] py-2.5 text-center text-xs font-semibold text-[#25d366] hover:bg-[#25d366]/[0.08] transition-colors"
      >
        📱 WhatsApp
      </a>
      <button
        onClick={() => navigator.clipboard.writeText(url)}
        className="flex-1 rounded-xl border border-gold/20 bg-white/[0.04] py-2.5 text-center text-xs font-semibold text-gold hover:bg-gold/[0.08] transition-colors"
      >
        📋 Copy Link
      </button>
    </div>
  );
}
