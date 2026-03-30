"use client";

import { useState } from "react";

const EMOJI_OPTIONS = [
  "😎", "🔥", "👑", "🦁", "🌟", "💎", "🎯", "🧠",
  "🦅", "🐉", "🌙", "⚡", "🎵", "🌊", "🍀", "🪐",
  "🦊", "🐺", "🌸", "🎲", "🏹", "🗡️", "🛡️", "🧿",
  "🐢", "🦋", "🌻", "🍄", "🎭", "🎪", "🚀", "🛸",
  "🐝", "🦉", "🐙", "🦈", "🐧", "🦩", "🦚", "🐳",
  "🌈", "☀️", "🌕", "❄️", "🔮", "💫", "🪬", "🕎",
  "🎸", "🎺", "🥁", "🎻", "🏔️", "🌋", "🏝️", "🗻",
  "🍕", "🍩", "🌮", "🍣", "☕", "🧋", "🍉", "🥑",
  "⚽", "🏀", "🎾", "♟️", "🃏", "🎰", "🧩", "🪁",
];

interface EmojiPickerProps {
  currentEmoji?: string | null;
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ currentEmoji, onSelect }: EmojiPickerProps) {
  const [selected, setSelected] = useState<string | null>(currentEmoji ?? null);
  const [open, setOpen] = useState(false);

  function pick(emoji: string) {
    setSelected(emoji);
    onSelect(emoji);
    setOpen(false);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-20 h-20 rounded-full border-2 border-dashed border-cosmos-border flex items-center justify-center cursor-pointer overflow-hidden hover:border-gold/40 hover:bg-gold/5 transition-all"
      >
        {selected ? (
          <span className="text-4xl">{selected}</span>
        ) : (
          <div className="text-center">
            <div className="text-2xl">😀</div>
            <div className="text-[9px] text-cosmos-muted mt-0.5">Pick emoji</div>
          </div>
        )}
      </button>

      {open && (
        <div className="grid grid-cols-8 gap-1.5 p-3 rounded-2xl bg-cosmos-card border border-cosmos-border">
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => pick(emoji)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-xl hover:bg-gold/10 transition-colors ${
                selected === emoji ? "bg-gold/20 ring-1 ring-gold/40" : ""
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
