"use client";

import { useState, useEffect } from "react";
import { getDaySefirot, getKavanah, OMER_BRACHA, getOmerCount } from "@/lib/sefirot";
import { getLocalOmerDay } from "@/lib/omer-date-client";

interface DayCounterProps {
  /** Server-computed day, used as initial value before client takes over */
  day: number;
}

export function DayCounter({ day: serverDay }: DayCounterProps) {
  const [localDay, setLocalDay] = useState(serverDay);

  useEffect(() => {
    const computed = getLocalOmerDay();
    if (computed) setLocalDay(computed);
  }, []);

  const sefirot = getDaySefirot(localDay);
  const kavanah = getKavanah(localDay);
  const omerCount = getOmerCount(localDay);
  const progress = localDay / 49;
  const circumference = 2 * Math.PI * 70;
  const offset = circumference * (1 - progress);

  return (
    <div className="text-center">
      <div className="relative mx-auto w-40 h-40 flex items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 160 160">
          <defs>
            <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f6d365" />
              <stop offset="100%" stopColor="#fda085" />
            </linearGradient>
          </defs>
          <circle
            cx="80" cy="80" r="70"
            fill="none" stroke="#2a2060" strokeWidth="6"
          />
          <circle
            cx="80" cy="80" r="70"
            fill="none" stroke="url(#ring-grad)" strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="relative z-10">
          <div className="text-5xl font-black">{localDay}</div>
          <div className="text-xs text-cosmos-muted -mt-1">of 49</div>
        </div>
      </div>
      <div className="mt-3">
        <div className="text-lg text-gold font-serif">{sefirot.hebrew}</div>
        <div className="text-xs text-cosmos-muted mt-0.5">{sefirot.english}</div>
      </div>
      {/* Bracha & daily count */}
      <div className="mt-4 mx-auto max-w-xs rounded-xl bg-white/[0.04] border border-gold/15 p-3 text-right" dir="rtl">
        <div className="text-[10px] uppercase tracking-wider text-cosmos-muted mb-1.5 text-center" dir="ltr">
          Tonight&apos;s Bracha
        </div>
        <div className="text-sm text-white/90 leading-relaxed font-serif">
          {OMER_BRACHA}
        </div>
        <div className="mt-2 pt-2 border-t border-white/10 text-sm text-gold font-serif leading-relaxed">
          {omerCount}
        </div>
        <div className="mt-2 pt-2 border-t border-white/10 text-center" dir="ltr">
          <p className="text-[10px] text-cosmos-muted leading-snug">
            Day updates at 7:30 PM local time. Please verify your local{" "}
            <a
              href="https://www.myzmanim.com/search.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold/70 underline underline-offset-2 hover:text-gold"
            >
              tzeit hakochavim
            </a>{" "}
            for accuracy.
          </p>
        </div>
      </div>
      {/* Kavanah */}
      <div className="mt-3 mx-auto max-w-xs border-l-2 border-gold/30 pl-3 text-left">
        <div className="text-[10px] uppercase tracking-wider text-cosmos-muted mb-1">
          Today&apos;s Kavanah
        </div>
        <div className="text-sm text-white/80 italic leading-relaxed">
          &quot;{kavanah}&quot;
        </div>
      </div>
    </div>
  );
}
