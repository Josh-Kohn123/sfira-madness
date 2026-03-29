"use client";

import { useRef } from "react";

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function PinInput({ value, onChange }: PinInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, char: string) {
    if (!/^\d?$/.test(char)) return;
    const arr = value.split("");
    arr[index] = char;
    const newVal = arr.join("").slice(0, 4);
    onChange(newVal);
    if (char && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, key: string) {
    if (key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  return (
    <div className="flex gap-2 justify-center">
      {[0, 1, 2, 3].map((i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="tel"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e.key)}
          className="w-12 h-14 rounded-xl border-2 border-cosmos-border bg-cosmos-card text-center text-2xl font-bold text-gold outline-none focus:border-gold/50 focus:bg-gold/5 transition-colors"
        />
      ))}
    </div>
  );
}
