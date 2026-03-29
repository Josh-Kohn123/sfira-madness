# Sfira Madness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a web app where friends predict how long each person will last counting Sefirat HaOmer, with a fun gamified interface.

**Architecture:** Next.js 16 App Router with Server Components and Server Actions. Neon Postgres for data, Vercel Blob for avatar uploads, cookie-based identity with 4-digit PIN. Mobile-first cosmic purple design with Tailwind CSS.

**Tech Stack:** Next.js 16, TypeScript, Neon Postgres (`@neondatabase/serverless`), Vercel Blob (`@vercel/blob`), `@vercel/og` (share cards), `web-push` (notifications), `bcryptjs` (PIN hashing), Tailwind CSS, Google Fonts (Rubik, Secular One)

---

## File Structure

```
sfira-madness/
├── app/
│   ├── layout.tsx                    # Root layout: fonts, theme, metadata
│   ├── page.tsx                      # Landing page: create or join
│   ├── create/
│   │   └── page.tsx                  # Create group form
│   ├── join/
│   │   └── [code]/
│   │       └── page.tsx              # Join flow (code pre-filled)
│   ├── group/
│   │   └── [code]/
│   │       ├── page.tsx              # Main dashboard (phase-adaptive)
│   │       ├── predict/
│   │       │   └── page.tsx          # Prediction submission sliders
│   │       └── bracket/
│   │           └── page.tsx          # Full prediction matrix
│   ├── api/
│   │   ├── og/
│   │   │   └── [code]/
│   │   │       └── route.tsx         # OG image / share card generation
│   │   ├── cron/
│   │   │   └── reminders/
│   │   │       └── route.ts          # Cron: evening push notifications
│   │   ├── push/
│   │   │   └── subscribe/
│   │   │       └── route.ts          # Register push subscription
│   │   └── upload/
│   │       └── route.ts              # Avatar upload (Vercel Blob token)
│   └── manifest.ts                   # PWA manifest for push notifications
├── lib/
│   ├── db.ts                         # Neon connection + query helpers
│   ├── schema.sql                    # Database schema
│   ├── auth.ts                       # Cookie read/write, PIN hash/verify
│   ├── sefirot.ts                    # Sefirot data, day calculation, kavanot
│   ├── scoring.ts                    # Score computation logic
│   ├── achievements.ts               # Achievement definitions + computation
│   ├── omer-date.ts                  # Omer start date + current day helpers
│   └── actions/
│       ├── groups.ts                 # Server Actions: create/join group
│       ├── predictions.ts            # Server Actions: submit predictions
│       ├── elimination.ts            # Server Actions: self-report, reactions
│       └── reclaim.ts                # Server Actions: cookie reclaim
├── components/
│   ├── ui/
│   │   ├── button.tsx                # Styled button (primary, secondary, ghost)
│   │   ├── input.tsx                 # Styled input field
│   │   ├── card.tsx                  # Glass card component
│   │   └── particles.tsx             # Floating particle background
│   ├── day-counter.tsx               # Animated progress ring + sefirah
│   ├── player-card.tsx               # Player row (avatar, name, status, guess)
│   ├── prediction-slider.tsx         # Slider input for predictions (client)
│   ├── leaderboard.tsx               # Leaderboard table
│   ├── reveal-card.tsx               # Prediction reveal grid for eliminated
│   ├── elimination-card.tsx          # Elimination moment card + reactions
│   ├── achievement-badge.tsx         # Single achievement badge
│   ├── milestone-card.tsx            # Milestone celebration card
│   ├── share-button.tsx              # WhatsApp share + copy link
│   ├── invite-code.tsx               # Big invite code display
│   ├── avatar-upload.tsx             # Photo upload circle (client)
│   ├── pin-input.tsx                 # 4-digit PIN entry (client)
│   └── reminder-toggle.tsx           # Push notification opt-in (client)
├── public/
│   ├── sw.js                         # Service worker for push notifications
│   └── icons/                        # PWA icons
├── tailwind.config.ts                # Custom theme (cosmic purple, gold)
├── vercel.json                       # Cron job configuration
├── next.config.ts                    # Next.js config
└── package.json
```

---

### Task 1: Project Scaffold + Dependencies

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `app/layout.tsx`, `app/page.tsx`, `.gitignore`, `vercel.json`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd /Users/orbs/Desktop/sfira-madness
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack
```

- [ ] **Step 2: Install dependencies**

```bash
npm install @neondatabase/serverless @vercel/blob @vercel/og bcryptjs web-push
npm install -D @types/bcryptjs @types/web-push
```

- [ ] **Step 3: Configure Tailwind theme**

Replace `tailwind.config.ts` with cosmic purple theme:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmos: {
          bg: "#1a1040",
          deep: "#0d0820",
          card: "rgba(255,255,255,0.06)",
          border: "rgba(255,255,255,0.1)",
          muted: "#9b8ec4",
        },
        gold: {
          DEFAULT: "#f6d365",
          warm: "#fda085",
        },
        counting: "#6ee7a0",
        stopped: "#fbbf24",
      },
      fontFamily: {
        sans: ["var(--font-rubik)", "system-ui", "sans-serif"],
        display: ["var(--font-secular-one)", "sans-serif"],
      },
      backgroundImage: {
        "cosmos-gradient":
          "linear-gradient(135deg, #1a1040 0%, #2d1b69 30%, #1a1040 60%, #0f2027 100%)",
        "gold-gradient": "linear-gradient(135deg, #f6d365, #fda085)",
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 4: Create root layout with fonts**

`app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Rubik, Secular_One } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  subsets: ["latin", "hebrew"],
  variable: "--font-rubik",
});

const secularOne = Secular_One({
  weight: "400",
  subsets: ["latin", "hebrew"],
  variable: "--font-secular-one",
});

export const metadata: Metadata = {
  title: "Sfira Madness",
  description:
    "Predict your friends. Count the Omer. Bragging rights for 49 days.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${rubik.variable} ${secularOne.variable}`}>
      <body className="min-h-screen bg-cosmos-gradient font-sans text-white antialiased">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Add global CSS**

Replace `app/globals.css`:

```css
@import "tailwindcss";

@layer base {
  body {
    @apply bg-cosmos-bg;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.15;
  }
  25% {
    transform: translateY(-20px) rotate(5deg);
    opacity: 0.25;
  }
  50% {
    transform: translateY(-10px) rotate(-3deg);
    opacity: 0.1;
  }
  75% {
    transform: translateY(-25px) rotate(4deg);
    opacity: 0.2;
  }
}

@keyframes shimmer {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-float {
  animation: float 15s ease-in-out infinite;
}

.animate-shimmer {
  background-size: 200% 200%;
  animation: shimmer 3s ease-in-out infinite;
}
```

- [ ] **Step 6: Create placeholder landing page**

`app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="font-display text-4xl bg-gold-gradient bg-clip-text text-transparent animate-shimmer">
        Sfira Madness 🔥
      </h1>
      <p className="mt-2 text-cosmos-muted text-sm">Coming soon...</p>
    </main>
  );
}
```

- [ ] **Step 7: Add vercel.json with cron**

```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0,30 * * * *"
    }
  ]
}
```

- [ ] **Step 8: Update .gitignore**

Add to `.gitignore`:

```
.env*.local
.superpowers/
```

- [ ] **Step 9: Initialize git and commit**

```bash
git init
git add -A
git commit -m "feat: scaffold Next.js project with cosmic purple theme"
```

---

### Task 2: Database Schema + Connection

**Files:**
- Create: `lib/schema.sql`, `lib/db.ts`

- [ ] **Step 1: Write the SQL schema**

`lib/schema.sql`:

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  omer_start_date DATE NOT NULL
);

CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cookie_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  pin_hash TEXT NOT NULL,
  avatar_url TEXT,
  is_creator BOOLEAN NOT NULL DEFAULT false,
  eliminated_on_day INTEGER CHECK (eliminated_on_day >= 1 AND eliminated_on_day <= 49),
  predictions_locked BOOLEAN NOT NULL DEFAULT false,
  timezone TEXT,
  push_subscription JSONB,
  reminders_enabled BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, name)
);

CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  predictor_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  predicted_day INTEGER NOT NULL CHECK (predicted_day >= 1 AND predicted_day <= 49),
  UNIQUE(predictor_id, subject_id)
);

CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  reactor_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL CHECK (emoji IN ('😱', '🫡', '💀', '🕯️', '😂')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(reactor_id, subject_id, emoji)
);

CREATE INDEX idx_members_group ON members(group_id);
CREATE INDEX idx_members_cookie ON members(cookie_token);
CREATE INDEX idx_predictions_group ON predictions(group_id);
CREATE INDEX idx_predictions_predictor ON predictions(predictor_id);
CREATE INDEX idx_reactions_subject ON reactions(subject_id);
```

- [ ] **Step 2: Create database connection module**

`lib/db.ts`:

```ts
import { neon } from "@neondatabase/serverless";

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  return neon(process.env.DATABASE_URL);
}

// Helper for single-row queries
export async function queryOne<T>(
  sql: TemplateStringsArray,
  ...params: unknown[]
): Promise<T | null> {
  const db = getDb();
  const rows = await db(sql, ...params);
  return (rows[0] as T) ?? null;
}

// Helper for multi-row queries
export async function queryMany<T>(
  sql: TemplateStringsArray,
  ...params: unknown[]
): Promise<T[]> {
  const db = getDb();
  const rows = await db(sql, ...params);
  return rows as T[];
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/schema.sql lib/db.ts
git commit -m "feat: add database schema and connection module"
```

---

### Task 3: Sefirot Data + Omer Date Utilities

**Files:**
- Create: `lib/sefirot.ts`, `lib/omer-date.ts`

- [ ] **Step 1: Create sefirot data and computation**

`lib/sefirot.ts`:

```ts
export interface Sefirah {
  hebrew: string;
  transliteration: string;
  english: string;
}

export const SEFIROT: Sefirah[] = [
  { hebrew: "חסד", transliteration: "Chesed", english: "Lovingkindness" },
  { hebrew: "גבורה", transliteration: "Gevurah", english: "Discipline" },
  { hebrew: "תפארת", transliteration: "Tiferet", english: "Harmony" },
  { hebrew: "נצח", transliteration: "Netzach", english: "Endurance" },
  { hebrew: "הוד", transliteration: "Hod", english: "Humility" },
  { hebrew: "יסוד", transliteration: "Yesod", english: "Connection" },
  { hebrew: "מלכות", transliteration: "Malchut", english: "Sovereignty" },
];

export function getDaySefirot(day: number) {
  if (day < 1 || day > 49) throw new Error(`Invalid omer day: ${day}`);
  const weekIdx = Math.ceil(day / 7) - 1;
  const dayIdx = ((day - 1) % 7);
  const primary = SEFIROT[weekIdx];
  const secondary = SEFIROT[dayIdx];
  return {
    primary,
    secondary,
    hebrew: `${secondary.hebrew} שב${primary.hebrew}`,
    english: `${secondary.english} within ${primary.english}`,
  };
}

// 49 unique kavanot (spiritual reflections), one per day
export const KAVANOT: string[] = [
  "Begin with pure lovingkindness — let your generosity flow without reservation.",
  "Find the discipline within your kindness — boundaries make love sustainable.",
  "Discover the harmony in giving — balance between self and other.",
  "Persist in your lovingkindness — endurance transforms a moment of generosity into a way of life.",
  "Be humble in your giving — true kindness seeks no recognition.",
  "Connect your lovingkindness to something deeper — let generosity become a bond.",
  "Let your kindness build something lasting — sovereignty is lovingkindness that leads.",
  "Bring lovingkindness into your discipline — even boundaries can be drawn with warmth.",
  "Discipline your discipline — know when strictness serves and when it harms.",
  "Find beauty in structure — harmony emerges when discipline is applied with grace.",
  "Stay committed to your principles — endurance gives discipline its strength.",
  "Practice humility in your judgments — the strongest boundaries bend without breaking.",
  "Ground your discipline in connection — rules exist to bring people closer, not push them apart.",
  "Let your discipline lead — sometimes the kindest thing is holding the line.",
  "Be kind to your sense of beauty — let harmony begin with self-acceptance.",
  "Bring structure to your creativity — discipline is the canvas for harmony.",
  "Rest in balance — true harmony doesn't need to be forced.",
  "Let your sense of balance endure — harmony is not a destination but a practice.",
  "Find the humility in compromise — not every hill is worth climbing.",
  "Connect through shared beauty — harmony is what we build together.",
  "Let your balanced perspective guide others — harmony that leads creates peace.",
  "Be generous with your endurance — encourage those who are struggling to persist.",
  "Know when to push and when to rest — disciplined endurance outlasts brute force.",
  "Find the beauty in perseverance — harmony isn't just balance, it's knowing that endurance itself can be graceful.",
  "Endure in your endurance — the middle of the journey is where most people quit.",
  "Stay humble in your persistence — the one who endures quietly often goes furthest.",
  "Let your endurance connect you to purpose — perseverance without meaning is just stubbornness.",
  "Lead through endurance — your persistence gives others permission to keep going.",
  "Be kind in your humility — gentleness with yourself is not weakness.",
  "Discipline your humility — know the difference between modesty and self-erasure.",
  "Find the harmony in stepping back — sometimes beauty is letting others shine.",
  "Persist in your humility — it's easy to be humble once, harder to stay humble always.",
  "Today is Lag BaOmer! Celebrate the fire within your humility — even the humble have a spark that lights the world. 🔥🏹",
  "Ground your humility in real connection — let modesty be a bridge, not a wall.",
  "Let humility lead — the quietest voice in the room often has the most to say.",
  "Bring lovingkindness into your connections — every bond starts with an open heart.",
  "Set healthy boundaries in your relationships — connection without limits becomes enmeshment.",
  "Find beauty in your bonds — the best relationships are works of art, built over time.",
  "Commit to your connections — enduring relationships require showing up even when it's hard.",
  "Be humble in your relationships — listen more than you speak.",
  "Deepen your connections — a bond that goes to the root can weather any storm.",
  "Let your connections lead to something greater — together we build what none of us can alone.",
  "Rule with kindness — true leadership begins with caring for those you lead.",
  "Lead with discipline — a leader without principles is just a person in front.",
  "Lead with grace — sovereignty is most beautiful when it serves harmony.",
  "Lead with endurance — the crown is heavy, but those who persist earn it.",
  "Lead with humility — the greatest leaders know they still have everything to learn.",
  "Connect your leadership to your deepest values — sovereignty grounded in truth transforms the world.",
  "You made it. Day 49 — sovereignty within sovereignty. You are the master of your own commitment. 👑",
];

export function getKavanah(day: number): string {
  if (day < 1 || day > 49) throw new Error(`Invalid omer day: ${day}`);
  return KAVANOT[day - 1];
}
```

- [ ] **Step 2: Create omer date utilities**

`lib/omer-date.ts`:

```ts
// Omer 2026 starts evening of April 2, 2026 (16 Nisan 5786)
// Day 1 counting is the night of April 2 / calendar date April 3
// We use the calendar date of the *morning after* as the reference date
export const OMER_START_DATE = new Date("2026-04-03");
export const OMER_END_DATE = new Date("2026-05-21"); // Day 49

export function getCurrentOmerDay(): number | null {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(
    OMER_START_DATE.getFullYear(),
    OMER_START_DATE.getMonth(),
    OMER_START_DATE.getDate()
  );

  const diffMs = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const day = diffDays + 1; // Day 1 = start date

  if (day < 1 || day > 49) return null;
  return day;
}

export type OmerPhase = "pre" | "during" | "post";

export function getOmerPhase(): OmerPhase {
  const day = getCurrentOmerDay();
  if (day === null) {
    const now = new Date();
    const start = new Date(
      OMER_START_DATE.getFullYear(),
      OMER_START_DATE.getMonth(),
      OMER_START_DATE.getDate()
    );
    return now < start ? "pre" : "post";
  }
  return "during";
}

export function daysUntilOmer(): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(
    OMER_START_DATE.getFullYear(),
    OMER_START_DATE.getMonth(),
    OMER_START_DATE.getDate()
  );
  const diffMs = start.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/sefirot.ts lib/omer-date.ts
git commit -m "feat: add sefirot data, kavanot, and omer date utilities"
```

---

### Task 4: Identity System (Cookies + PIN)

**Files:**
- Create: `lib/auth.ts`

- [ ] **Step 1: Create auth utilities**

`lib/auth.ts`:

```ts
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { queryOne } from "./db";

const COOKIE_NAME = "sfira_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 60; // 60 days

interface MemberRow {
  id: string;
  group_id: string;
  name: string;
  cookie_token: string;
  avatar_url: string | null;
  is_creator: boolean;
  eliminated_on_day: number | null;
  predictions_locked: boolean;
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

export async function verifyPin(
  pin: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

export async function setAuthCookie(cookieToken: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, cookieToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function getCurrentMember(): Promise<MemberRow | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  return queryOne<MemberRow>`
    SELECT id, group_id, name, cookie_token, avatar_url,
           is_creator, eliminated_on_day, predictions_locked
    FROM members
    WHERE cookie_token = ${token}
  `;
}

export async function getCurrentMemberForGroup(
  groupId: string
): Promise<MemberRow | null> {
  const member = await getCurrentMember();
  if (!member || member.group_id !== groupId) return null;
  return member;
}

export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
    if (i === 2) code += "-"; // Format: ABC-D23
  }
  return code;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/auth.ts
git commit -m "feat: add cookie-based identity with PIN hashing"
```

---

### Task 5: Scoring Logic

**Files:**
- Create: `lib/scoring.ts`

- [ ] **Step 1: Create scoring computation**

`lib/scoring.ts`:

```ts
import { queryMany } from "./db";

interface PredictionRow {
  predictor_id: string;
  predictor_name: string;
  subject_id: string;
  subject_name: string;
  predicted_day: number;
  eliminated_on_day: number | null;
}

interface ScoreEntry {
  memberId: string;
  memberName: string;
  totalScore: number;
  resolvedCount: number;
  eliminatedOnDay: number | null;
}

export async function getGroupScores(
  groupId: string
): Promise<ScoreEntry[]> {
  const predictions = await queryMany<PredictionRow>`
    SELECT
      p.predictor_id,
      pm.name as predictor_name,
      p.subject_id,
      sm.name as subject_name,
      p.predicted_day,
      sm.eliminated_on_day
    FROM predictions p
    JOIN members pm ON p.predictor_id = pm.id
    JOIN members sm ON p.subject_id = sm.id
    WHERE p.group_id = ${groupId}
  `;

  // Group by predictor
  const byPredictor = new Map<
    string,
    { name: string; scores: number[]; eliminatedOnDay: number | null }
  >();

  // First pass: collect all members as predictors
  const members = await queryMany<{
    id: string;
    name: string;
    eliminated_on_day: number | null;
  }>`
    SELECT id, name, eliminated_on_day FROM members WHERE group_id = ${groupId}
  `;

  for (const m of members) {
    byPredictor.set(m.id, {
      name: m.name,
      scores: [],
      eliminatedOnDay: m.eliminated_on_day,
    });
  }

  // Second pass: compute per-subject scores
  for (const p of predictions) {
    const actual = p.eliminated_on_day ?? 49;
    const score = Math.abs(actual - p.predicted_day);
    const entry = byPredictor.get(p.predictor_id);
    if (entry) entry.scores.push(score);
  }

  return Array.from(byPredictor.entries())
    .map(([id, data]) => ({
      memberId: id,
      memberName: data.name,
      totalScore: data.scores.reduce((a, b) => a + b, 0),
      resolvedCount: data.scores.length,
      eliminatedOnDay: data.eliminatedOnDay,
    }))
    .sort((a, b) => a.totalScore - b.totalScore);
}

export function computeScore(
  predictedDay: number,
  eliminatedOnDay: number | null
): number {
  const actual = eliminatedOnDay ?? 49;
  return Math.abs(actual - predictedDay);
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/scoring.ts
git commit -m "feat: add scoring computation logic"
```

---

### Task 6: Achievements System

**Files:**
- Create: `lib/achievements.ts`

- [ ] **Step 1: Create achievement definitions and computation**

`lib/achievements.ts`:

```ts
import { queryMany } from "./db";

export interface Achievement {
  id: string;
  emoji: string;
  name: string;
  description: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "week-one", emoji: "🔥", name: "Week One", description: "Survived first 7 days" },
  { id: "halfway", emoji: "🌅", name: "Halfway", description: "Still counting on day 25" },
  { id: "lag-baomer", emoji: "🏹", name: "Lag BaOmer", description: "Still counting on day 33" },
  { id: "iron-will", emoji: "👑", name: "Iron Will", description: "Made it all 49 days" },
  { id: "prophet", emoji: "🎯", name: "Prophet", description: "Predicted within 1 day of actual" },
  { id: "mastermind", emoji: "🧠", name: "Mastermind", description: "Lowest total score (winner)" },
  { id: "way-off", emoji: "🫢", name: "Way Off", description: "Missed a prediction by 20+" },
  { id: "underdog", emoji: "💪", name: "Underdog", description: "Outlasted everyone's prediction for you" },
];

export async function getEarnedAchievements(
  memberId: string,
  groupId: string,
  currentDay: number | null
): Promise<string[]> {
  const earned: string[] = [];

  const member = await queryMany<{
    eliminated_on_day: number | null;
  }>`SELECT eliminated_on_day FROM members WHERE id = ${memberId}`;

  const elim = member[0]?.eliminated_on_day;
  const effectiveDay = elim ?? (currentDay ?? 0);

  // Streak-based
  if (effectiveDay >= 7 && elim === null) earned.push("week-one");
  if (effectiveDay >= 25 && elim === null) earned.push("halfway");
  if (effectiveDay >= 33 && elim === null) earned.push("lag-baomer");
  if (currentDay === null && elim === null) earned.push("iron-will"); // post-omer, never eliminated

  // Prediction-based
  const predictions = await queryMany<{
    predicted_day: number;
    eliminated_on_day: number | null;
  }>`
    SELECT p.predicted_day, sm.eliminated_on_day
    FROM predictions p
    JOIN members sm ON p.subject_id = sm.id
    WHERE p.predictor_id = ${memberId}
      AND sm.eliminated_on_day IS NOT NULL
  `;

  for (const p of predictions) {
    const diff = Math.abs(p.eliminated_on_day! - p.predicted_day);
    if (diff <= 1) earned.push("prophet");
    if (diff >= 20) earned.push("way-off");
  }

  // Underdog: outlasted ALL predictions about you
  const aboutMe = await queryMany<{ predicted_day: number }>`
    SELECT predicted_day FROM predictions
    WHERE subject_id = ${memberId} AND predictor_id != ${memberId}
  `;
  if (
    aboutMe.length > 0 &&
    elim === null &&
    aboutMe.every((p) => p.predicted_day < (currentDay ?? 49))
  ) {
    earned.push("underdog");
  }

  return [...new Set(earned)]; // dedupe prophet/way-off if multiple
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/achievements.ts
git commit -m "feat: add achievement definitions and computation"
```

---

### Task 7: UI Components

**Files:**
- Create: all files in `components/ui/` and `components/`

- [ ] **Step 1: Create base UI components**

`components/ui/particles.tsx`:

```tsx
export function Particles() {
  const items = ["✨", "🌙", "⭐", "✡", "🔥", "✨", "🌾", "⭐"];
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {items.map((emoji, i) => (
        <span
          key={i}
          className="absolute text-xl opacity-15 animate-float"
          style={{
            top: `${10 + i * 12}%`,
            left: `${5 + ((i * 23) % 90)}%`,
            animationDelay: `${-i * 3}s`,
            fontSize: `${14 + (i % 4) * 4}px`,
          }}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
}
```

`components/ui/button.tsx`:

```tsx
import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-gold-gradient text-cosmos-deep font-bold hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gold/25",
  secondary:
    "bg-cosmos-card border border-cosmos-border text-white hover:bg-white/10",
  ghost:
    "bg-transparent border border-cosmos-border text-cosmos-muted hover:bg-white/5 hover:text-white",
  danger:
    "bg-cosmos-card border border-stopped/30 text-stopped hover:bg-stopped/10",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`w-full rounded-xl px-6 py-3.5 text-[15px] font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
```

`components/ui/input.tsx`:

```tsx
import { InputHTMLAttributes } from "react";

export function Input({
  label,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-[11px] uppercase tracking-wider text-cosmos-muted">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-xl border border-cosmos-border bg-cosmos-card px-3.5 py-3 text-[15px] text-white placeholder:text-cosmos-muted/30 outline-none focus:border-gold/40 focus:bg-white/[0.08] transition-colors ${className}`}
        {...props}
      />
    </div>
  );
}
```

`components/ui/card.tsx`:

```tsx
import { HTMLAttributes } from "react";

export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-cosmos-border bg-cosmos-card p-4 ${className}`}
      {...props}
    />
  );
}
```

- [ ] **Step 2: Create avatar upload component**

`components/avatar-upload.tsx`:

```tsx
"use client";

import { useState, useRef } from "react";

interface AvatarUploadProps {
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
}

export function AvatarUpload({ currentUrl, onUploaded }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const res = await fetch(`/api/upload?filename=${file.name}`, {
        method: "POST",
        body: file,
      });
      const data = await res.json();
      setPreview(data.url);
      onUploaded(data.url);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className="mx-auto w-20 h-20 rounded-full border-2 border-dashed border-cosmos-border flex items-center justify-center cursor-pointer overflow-hidden hover:border-gold/40 hover:bg-gold/5 transition-all"
      onClick={() => inputRef.current?.click()}
    >
      {preview ? (
        <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        <div className="text-center">
          <div className="text-2xl">{uploading ? "⏳" : "📷"}</div>
          <div className="text-[9px] text-cosmos-muted mt-0.5">Add photo</div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
```

- [ ] **Step 3: Create PIN input component**

`components/pin-input.tsx`:

```tsx
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
```

- [ ] **Step 4: Create prediction slider component**

`components/prediction-slider.tsx`:

```tsx
"use client";

import { useState } from "react";

interface PredictionSliderProps {
  name: string;
  avatarUrl: string | null;
  initial: string;
  value: number;
  onChange: (value: number) => void;
  locked?: boolean;
  isSelf?: boolean;
}

export function PredictionSlider({
  name,
  avatarUrl,
  initial,
  value,
  onChange,
  locked = false,
  isSelf = false,
}: PredictionSliderProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl p-3 ${
        isSelf
          ? "bg-gold/[0.06] border border-gold/[0.12]"
          : "bg-cosmos-card"
      }`}
    >
      <div
        className={`w-9 h-9 rounded-full flex-shrink-0 overflow-hidden border-2 ${
          isSelf ? "border-gold" : "border-cosmos-border"
        }`}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-counting to-counting/60 flex items-center justify-center text-sm font-bold text-cosmos-deep">
            {initial}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold flex items-center gap-1.5">
          {isSelf ? "You" : name}
          {isSelf && (
            <span className="text-[10px] text-cosmos-muted font-normal">
              always 49
            </span>
          )}
        </div>
        {!locked && !isSelf ? (
          <input
            type="range"
            min={1}
            max={49}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full mt-1 accent-gold"
          />
        ) : isSelf ? (
          <div className="text-[11px] text-cosmos-muted mt-0.5">
            Miss a day? You eat the penalty 💀
          </div>
        ) : null}
      </div>

      <div
        className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-center ${
          isSelf
            ? "bg-gold/15 border border-gold/20"
            : "bg-gold/[0.12] border border-gold/20"
        }`}
      >
        <div className={`text-xl font-black ${isSelf ? "text-gold" : "text-gold"}`}>
          {value}
        </div>
        <div className="text-[8px] uppercase text-cosmos-muted">
          {locked || isSelf ? "locked" : "days"}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create day counter component**

`components/day-counter.tsx`:

```tsx
import { getDaySefirot, getKavanah } from "@/lib/sefirot";

interface DayCounterProps {
  day: number;
}

export function DayCounter({ day }: DayCounterProps) {
  const sefirot = getDaySefirot(day);
  const kavanah = getKavanah(day);
  const progress = day / 49;
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
          <div className="text-5xl font-black">{day}</div>
          <div className="text-xs text-cosmos-muted -mt-1">of 49</div>
        </div>
      </div>
      <div className="mt-3">
        <div className="text-lg text-gold font-serif">{sefirot.hebrew}</div>
        <div className="text-xs text-cosmos-muted mt-0.5">{sefirot.english}</div>
      </div>
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
```

- [ ] **Step 6: Create player card, leaderboard, reveal card, share button, invite code**

`components/player-card.tsx`:

```tsx
interface PlayerCardProps {
  name: string;
  avatarUrl: string | null;
  isYou?: boolean;
  isCounting: boolean;
  eliminatedOnDay?: number | null;
  streak?: number;
  yourPrediction?: number;
  yourScore?: number | null;
}

export function PlayerCard({
  name,
  avatarUrl,
  isYou = false,
  isCounting,
  eliminatedOnDay,
  streak,
  yourPrediction,
  yourScore,
}: PlayerCardProps) {
  const initial = name[0].toUpperCase();
  const borderColor = isYou
    ? "border-gold"
    : isCounting
      ? "border-counting"
      : "border-stopped";

  return (
    <div
      className={`flex items-center gap-3 rounded-xl p-3 transition-all hover:translate-x-1 ${
        isYou ? "bg-gold/[0.08] border border-gold/15" : "bg-cosmos-card"
      } ${!isCounting ? "opacity-65" : ""}`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden border-2 ${borderColor} ${
          !isCounting ? "grayscale-[50%]" : ""
        }`}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center text-base font-bold ${
              isCounting
                ? "bg-gradient-to-br from-counting to-counting/60 text-cosmos-deep"
                : "bg-gradient-to-br from-stopped to-stopped/60 text-cosmos-deep"
            }`}
          >
            {initial}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-bold text-[15px] flex items-center gap-1.5">
          {isYou ? `You (${name})` : name}
          {isCounting && streak && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-gold-warm/15 px-2 py-0.5 text-[11px] font-semibold text-gold-warm">
              🔥 {streak}
            </span>
          )}
        </div>
        <div
          className={`text-xs ${isCounting ? "text-counting" : "text-stopped"}`}
        >
          {isCounting
            ? isYou
              ? "locked at 49 — let's go!"
              : "on a roll"
            : `stopped on day ${eliminatedOnDay}`}
        </div>
      </div>

      {yourPrediction !== undefined && (
        <div className="text-right flex-shrink-0">
          <div className="text-[10px] uppercase text-cosmos-muted">
            {isCounting ? "Your call" : "You said"}
          </div>
          <div className="text-lg font-bold">{yourPrediction}</div>
          {yourScore !== null && yourScore !== undefined && (
            <div className="text-xs font-semibold text-stopped">
              +{yourScore} pts
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

`components/leaderboard.tsx`:

```tsx
interface LeaderboardEntry {
  memberId: string;
  memberName: string;
  totalScore: number;
  eliminatedOnDay: number | null;
  isYou: boolean;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  resolvedCount: number;
  totalMembers: number;
}

export function Leaderboard({
  entries,
  resolvedCount,
  totalMembers,
}: LeaderboardProps) {
  return (
    <div>
      <div className="space-y-1">
        {entries.map((entry, i) => (
          <div
            key={entry.memberId}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-all hover:translate-x-1 ${
              i === 0
                ? "bg-gradient-to-r from-gold/[0.12] to-gold-warm/[0.08] border border-gold/20"
                : entry.isYou
                  ? "bg-gold/[0.08] border border-gold/[0.12]"
                  : "bg-white/[0.04]"
            }`}
          >
            <div
              className={`text-xl font-black w-7 text-center ${
                i === 0 ? "text-gold" : "text-cosmos-muted"
              }`}
            >
              {i === 0 ? "👑" : i + 1}
            </div>
            <div
              className={`flex-1 font-semibold text-sm ${
                entry.isYou ? "text-gold" : "text-white"
              }`}
            >
              {entry.isYou ? `You (${entry.memberName})` : entry.memberName}
              {entry.eliminatedOnDay && (
                <span className="text-[10px] text-stopped font-normal ml-1.5">
                  stopped
                </span>
              )}
            </div>
            <div
              className={`text-xl font-black ${
                i === 0 ? "text-gold" : "text-white"
              }`}
            >
              {entry.totalScore}{" "}
              <span className="text-[11px] font-normal text-cosmos-muted">
                pts
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="text-[11px] text-cosmos-muted/50 mt-1.5 italic">
        {resolvedCount} of {totalMembers} resolved
      </div>
    </div>
  );
}
```

`components/reveal-card.tsx`:

```tsx
interface RevealEntry {
  predictorName: string;
  predictedDay: number;
  isYou: boolean;
  isSelf: boolean;
}

interface RevealCardProps {
  subjectName: string;
  eliminatedOnDay: number;
  predictions: RevealEntry[];
}

export function RevealCard({
  subjectName,
  eliminatedOnDay,
  predictions,
}: RevealCardProps) {
  return (
    <div className="rounded-2xl border border-cosmos-border bg-cosmos-card p-3.5">
      <div className="text-sm font-bold text-stopped mb-2">
        {subjectName} — stopped day {eliminatedOnDay}
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {predictions.map((p) => {
          const diff = Math.abs(eliminatedOnDay - p.predictedDay);
          const isClose = diff <= 1;
          const isSelfPenalty = p.isSelf;
          return (
            <div
              key={p.predictorName}
              className={`rounded-lg p-2 text-center ${
                p.isYou ? "bg-gold/[0.08]" : "bg-white/[0.04]"
              }`}
            >
              <div
                className={`text-[10px] uppercase ${
                  p.isYou ? "text-gold" : "text-cosmos-muted"
                }`}
              >
                {p.isYou ? "You" : p.predictorName}
              </div>
              <div className="text-base font-bold">{p.predictedDay}</div>
              <div
                className={`text-[11px] font-semibold ${
                  isClose ? "text-counting" : "text-stopped"
                }`}
              >
                +{diff}
                {isClose && " 🎯"}
                {isSelfPenalty && " 💀"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

`components/share-button.tsx`:

```tsx
"use client";

interface ShareButtonProps {
  inviteCode: string;
  groupName: string;
}

export function ShareButton({ inviteCode, groupName }: ShareButtonProps) {
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/join/${inviteCode}`;
  const whatsappText = encodeURIComponent(
    `Join me on Sfira Madness! 🔥 Predict who'll make it all 49 days of the Omer.\n\n${url}`
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
```

`components/invite-code.tsx`:

```tsx
interface InviteCodeProps {
  code: string;
}

export function InviteCode({ code }: InviteCodeProps) {
  return (
    <div className="text-center">
      <div className="inline-block rounded-xl border border-gold/15 bg-gold/[0.08] px-5 py-3 font-mono text-3xl font-black tracking-widest text-gold">
        {code}
      </div>
    </div>
  );
}
```

`components/elimination-card.tsx`:

```tsx
"use client";

import { useTransition } from "react";

const EMOJIS = ["😱", "🫡", "💀", "🕯️", "😂"] as const;

interface EliminationCardProps {
  subjectName: string;
  avatarUrl: string | null;
  eliminatedOnDay: number;
  selfPenalty: number;
  reactions: Record<string, number>;
  myReactions: string[];
  onReact: (emoji: string) => Promise<void>;
}

export function EliminationCard({
  subjectName,
  avatarUrl,
  eliminatedOnDay,
  selfPenalty,
  reactions,
  myReactions,
  onReact,
}: EliminationCardProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-2xl border border-stopped/15 bg-cosmos-card p-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-gradient from-stopped/5 to-transparent animate-pulse" />

      <div className="relative z-10">
        <div className="mx-auto w-[72px] h-[72px] rounded-full overflow-hidden border-[3px] border-stopped mb-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={subjectName}
              className="w-full h-full object-cover grayscale-[40%]"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-stopped to-stopped/60 flex items-center justify-center text-2xl font-bold text-cosmos-deep">
              {subjectName[0]}
            </div>
          )}
        </div>

        <div className="text-xl font-black">{subjectName} is out 😞</div>
        <div className="text-sm text-stopped mt-1">
          Lasted {eliminatedOnDay} of 49 days
        </div>

        <div className="inline-block mt-3 rounded-xl border border-red-500/30 bg-red-500/15 px-4 py-2 text-sm text-red-300">
          Self-penalty: <strong className="text-red-400 text-lg">+{selfPenalty}</strong> pts
        </div>

        <div className="flex justify-center gap-2 mt-4">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              disabled={isPending}
              onClick={() => startTransition(() => onReact(emoji))}
              className={`w-11 h-11 rounded-full flex items-center justify-center text-xl transition-all hover:scale-110 ${
                myReactions.includes(emoji)
                  ? "bg-gold/15 border border-gold/30 scale-110"
                  : "bg-white/[0.08] border border-cosmos-border"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
        {Object.values(reactions).some((v) => v > 0) && (
          <div className="flex justify-center gap-2 mt-1.5">
            {EMOJIS.map((emoji) =>
              reactions[emoji] ? (
                <div key={emoji} className="text-[10px] text-cosmos-muted w-11 text-center">
                  {reactions[emoji]}
                </div>
              ) : (
                <div key={emoji} className="w-11" />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

`components/achievement-badge.tsx`:

```tsx
interface AchievementBadgeProps {
  emoji: string;
  name: string;
  description: string;
  earned: boolean;
}

export function AchievementBadge({
  emoji,
  name,
  description,
  earned,
}: AchievementBadgeProps) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border p-3 min-w-[180px] ${
        earned
          ? "border-gold/20 bg-gold/[0.06]"
          : "border-cosmos-border bg-cosmos-card opacity-35 grayscale-[80%]"
      }`}
    >
      <div className="text-2xl flex-shrink-0">{emoji}</div>
      <div>
        <div className="text-[13px] font-bold">{name}</div>
        <div className="text-[11px] text-cosmos-muted">{description}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add components/
git commit -m "feat: add all UI components"
```

---

### Task 8: Server Actions — Groups + Join

**Files:**
- Create: `lib/actions/groups.ts`

- [ ] **Step 1: Create group and join server actions**

`lib/actions/groups.ts`:

```ts
"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { hashPin, setAuthCookie, generateInviteCode } from "@/lib/auth";
import { OMER_START_DATE } from "@/lib/omer-date";

export async function createGroup(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const groupName = (formData.get("groupName") as string)?.trim();
  const pin = formData.get("pin") as string;
  const avatarUrl = (formData.get("avatarUrl") as string) || null;

  if (!name || !groupName || !pin || pin.length !== 4) {
    throw new Error("Missing required fields");
  }

  const db = getDb();
  const inviteCode = generateInviteCode();
  const pinHash = await hashPin(pin);

  const [group] = await db`
    INSERT INTO groups (name, invite_code, omer_start_date)
    VALUES (${groupName}, ${inviteCode}, ${OMER_START_DATE.toISOString().split("T")[0]})
    RETURNING id, invite_code
  `;

  const [member] = await db`
    INSERT INTO members (group_id, name, pin_hash, avatar_url, is_creator)
    VALUES (${group.id}, ${name}, ${pinHash}, ${avatarUrl}, true)
    RETURNING cookie_token
  `;

  await setAuthCookie(member.cookie_token);
  redirect(`/group/${group.invite_code}`);
}

export async function joinGroup(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const pin = formData.get("pin") as string;
  const inviteCode = (formData.get("inviteCode") as string)?.trim();
  const avatarUrl = (formData.get("avatarUrl") as string) || null;

  if (!name || !pin || pin.length !== 4 || !inviteCode) {
    throw new Error("Missing required fields");
  }

  const db = getDb();

  const [group] = await db`
    SELECT id, invite_code FROM groups WHERE invite_code = ${inviteCode}
  `;
  if (!group) throw new Error("Group not found");

  // Check for duplicate name in group
  const [existing] = await db`
    SELECT id FROM members WHERE group_id = ${group.id} AND name = ${name}
  `;
  if (existing) throw new Error("Name already taken in this group");

  const pinHash = await hashPin(pin);

  const [member] = await db`
    INSERT INTO members (group_id, name, pin_hash, avatar_url)
    VALUES (${group.id}, ${name}, ${pinHash}, ${avatarUrl})
    RETURNING cookie_token
  `;

  await setAuthCookie(member.cookie_token);
  redirect(`/group/${group.invite_code}`);
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/actions/groups.ts
git commit -m "feat: add create and join group server actions"
```

---

### Task 9: Server Actions — Predictions, Elimination, Reclaim

**Files:**
- Create: `lib/actions/predictions.ts`, `lib/actions/elimination.ts`, `lib/actions/reclaim.ts`

- [ ] **Step 1: Create prediction server action**

`lib/actions/predictions.ts`:

```ts
"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { getCurrentMember } from "@/lib/auth";
import { getOmerPhase } from "@/lib/omer-date";

export async function submitPredictions(formData: FormData) {
  if (getOmerPhase() !== "pre") {
    throw new Error("Predictions are locked — Omer has started");
  }

  const member = await getCurrentMember();
  if (!member) throw new Error("Not authenticated");

  const db = getDb();

  // Parse predictions from form: "pred_<memberId>" = day number
  const predictions: { subjectId: string; day: number }[] = [];

  for (const [key, value] of formData.entries()) {
    if (key.startsWith("pred_")) {
      const subjectId = key.replace("pred_", "");
      const day = Number(value);
      if (day < 1 || day > 49) throw new Error(`Invalid day: ${day}`);
      // Self-prediction must be 49
      if (subjectId === member.id && day !== 49) {
        throw new Error("Self-prediction must be 49");
      }
      predictions.push({ subjectId, day });
    }
  }

  if (predictions.length === 0) throw new Error("No predictions submitted");

  // Delete existing predictions and insert new ones
  await db`DELETE FROM predictions WHERE predictor_id = ${member.id}`;

  for (const p of predictions) {
    await db`
      INSERT INTO predictions (group_id, predictor_id, subject_id, predicted_day)
      VALUES (${member.group_id}, ${member.id}, ${p.subjectId}, ${p.day})
    `;
  }

  // Mark predictions as locked
  await db`
    UPDATE members SET predictions_locked = true WHERE id = ${member.id}
  `;

  redirect(`/group/${formData.get("inviteCode")}`);
}
```

- [ ] **Step 2: Create elimination and reaction server actions**

`lib/actions/elimination.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { getCurrentMember } from "@/lib/auth";
import { getCurrentOmerDay } from "@/lib/omer-date";

export async function reportMissed(groupInviteCode: string) {
  const member = await getCurrentMember();
  if (!member) throw new Error("Not authenticated");
  if (member.eliminated_on_day !== null) throw new Error("Already eliminated");

  const currentDay = getCurrentOmerDay();
  if (!currentDay) throw new Error("Omer is not active");

  // Eliminated on the previous day (they missed counting, so their last successful day is yesterday)
  const eliminatedDay = currentDay - 1;

  const db = getDb();
  await db`
    UPDATE members SET eliminated_on_day = ${Math.max(eliminatedDay, 1)}
    WHERE id = ${member.id}
  `;

  revalidatePath(`/group/${groupInviteCode}`);
}

export async function toggleReaction(
  groupInviteCode: string,
  subjectId: string,
  emoji: string
) {
  const member = await getCurrentMember();
  if (!member) throw new Error("Not authenticated");

  const db = getDb();

  // Check if reaction exists
  const [existing] = await db`
    SELECT id FROM reactions
    WHERE reactor_id = ${member.id}
      AND subject_id = ${subjectId}
      AND emoji = ${emoji}
  `;

  if (existing) {
    await db`DELETE FROM reactions WHERE id = ${existing.id}`;
  } else {
    await db`
      INSERT INTO reactions (group_id, reactor_id, subject_id, emoji)
      VALUES (${member.group_id}, ${member.id}, ${subjectId}, ${emoji})
    `;
  }

  revalidatePath(`/group/${groupInviteCode}`);
}
```

- [ ] **Step 3: Create reclaim server action**

`lib/actions/reclaim.ts`:

```ts
"use server";

import { getDb } from "@/lib/db";
import { verifyPin, setAuthCookie } from "@/lib/auth";

export async function reclaimAccount(formData: FormData) {
  const memberId = formData.get("memberId") as string;
  const pin = formData.get("pin") as string;

  if (!memberId || !pin) throw new Error("Missing fields");

  const db = getDb();
  const [member] = await db`
    SELECT id, cookie_token, pin_hash, group_id FROM members WHERE id = ${memberId}
  `;

  if (!member) throw new Error("Member not found");

  const valid = await verifyPin(pin, member.pin_hash);
  if (!valid) throw new Error("Incorrect PIN");

  // Generate new cookie token
  const [updated] = await db`
    UPDATE members
    SET cookie_token = encode(gen_random_bytes(32), 'hex')
    WHERE id = ${memberId}
    RETURNING cookie_token
  `;

  await setAuthCookie(updated.cookie_token);
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/actions/
git commit -m "feat: add server actions for predictions, elimination, and reclaim"
```

---

### Task 10: Upload API Route

**Files:**
- Create: `app/api/upload/route.ts`

- [ ] **Step 1: Create Vercel Blob upload handler**

`app/api/upload/route.ts`:

```ts
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const filename = request.nextUrl.searchParams.get("filename");
  if (!filename) {
    return NextResponse.json({ error: "Missing filename" }, { status: 400 });
  }

  const blob = await put(`avatars/${Date.now()}-${filename}`, request.body!, {
    access: "public",
  });

  return NextResponse.json({ url: blob.url });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/upload/route.ts
git commit -m "feat: add avatar upload API route"
```

---

### Task 11: Pages — Landing, Create, Join

**Files:**
- Create: `app/page.tsx` (replace), `app/create/page.tsx`, `app/join/[code]/page.tsx`

- [ ] **Step 1: Build landing page**

Replace `app/page.tsx`:

```tsx
import Link from "next/link";
import { Particles } from "@/components/ui/particles";
import { Button } from "@/components/ui/button";
import { daysUntilOmer } from "@/lib/omer-date";

export default function Home() {
  const daysLeft = daysUntilOmer();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6">
      <Particles />
      <div className="relative z-10 w-full max-w-sm text-center">
        <div className="text-5xl mb-4">🔥</div>
        <h1 className="font-display text-3xl bg-gold-gradient bg-clip-text text-transparent animate-shimmer">
          Sfira Madness
        </h1>
        <p className="mt-3 text-sm text-cosmos-muted leading-relaxed">
          Predict your friends.
          <br />
          Count the Omer.
          <br />
          Bragging rights for 49 days.
        </p>

        <div className="mt-8 space-y-2.5">
          <Link href="/create">
            <Button>🏆 Create a Group</Button>
          </Link>
          <Link href="/join/enter">
            <Button variant="secondary">Join with Code</Button>
          </Link>
        </div>

        {daysLeft > 0 && (
          <div className="mt-8 text-[11px] text-cosmos-muted/40">
            Omer starts in {daysLeft} days
          </div>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Build create group page**

`app/create/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Particles } from "@/components/ui/particles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PinInput } from "@/components/pin-input";
import { AvatarUpload } from "@/components/avatar-upload";
import { createGroup } from "@/lib/actions/groups";

export default function CreatePage() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [pin, setPin] = useState("");

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6">
      <Particles />
      <div className="relative z-10 w-full max-w-sm">
        <h1 className="font-display text-2xl bg-gold-gradient bg-clip-text text-transparent animate-shimmer text-center">
          Sfira Madness 🔥
        </h1>
        <p className="text-xs text-cosmos-muted text-center mt-1 mb-6">
          Set up your group
        </p>

        <form action={createGroup}>
          <AvatarUpload onUploaded={setAvatarUrl} />
          <input type="hidden" name="avatarUrl" value={avatarUrl ?? ""} />

          <div className="mt-4 space-y-3">
            <Input name="name" label="Your Name" placeholder="How your friends know you" required />
            <Input name="groupName" label="Group Name" placeholder='e.g. "The Shul Boys"' required />

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-cosmos-muted">
                Set a 4-digit PIN
              </label>
              <p className="text-[10px] text-cosmos-muted/60 -mt-1">
                Used to reclaim your account on a new device
              </p>
              <PinInput value={pin} onChange={setPin} />
              <input type="hidden" name="pin" value={pin} />
            </div>
          </div>

          <Button type="submit" className="mt-6" disabled={pin.length !== 4}>
            Create Group 🎉
          </Button>

          <p className="text-center mt-4 text-xs text-cosmos-muted">
            Already have a code?{" "}
            <a href="/join/enter" className="text-gold">
              Join instead
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Build join page**

`app/join/[code]/page.tsx`:

```tsx
import { getDb } from "@/lib/db";
import { Particles } from "@/components/ui/particles";
import { JoinForm } from "./join-form";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function JoinPage({ params }: Props) {
  const { code } = await params;

  // If code is "enter", show code entry form
  if (code === "enter") {
    return <CodeEntryPage />;
  }

  // Look up group
  const db = getDb();
  const [group] = await db`
    SELECT id, name, invite_code FROM groups WHERE invite_code = ${code}
  `;

  if (!group) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center p-6">
        <Particles />
        <div className="relative z-10 text-center">
          <div className="text-4xl mb-4">😕</div>
          <h1 className="text-xl font-bold">Group not found</h1>
          <p className="text-sm text-cosmos-muted mt-2">
            Check the code and try again
          </p>
          <a href="/join/enter" className="text-gold text-sm mt-4 inline-block">
            Enter a different code →
          </a>
        </div>
      </main>
    );
  }

  const members = await db`
    SELECT id, name, avatar_url FROM members WHERE group_id = ${group.id}
    ORDER BY joined_at ASC
  `;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6">
      <Particles />
      <div className="relative z-10 w-full max-w-sm">
        <h1 className="font-display text-2xl bg-gold-gradient bg-clip-text text-transparent animate-shimmer text-center">
          Join Group
        </h1>

        <div className="mt-4 rounded-2xl border border-counting/20 bg-cosmos-card p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🔥</div>
            <div>
              <div className="font-bold">{group.name}</div>
              <div className="text-[11px] text-cosmos-muted">
                {members.length} member{members.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
          <div className="flex mt-3 -space-x-1.5">
            {members.slice(0, 5).map((m: { id: string; name: string; avatar_url: string | null }) => (
              <div
                key={m.id}
                className="w-8 h-8 rounded-full border-2 border-cosmos-deep overflow-hidden"
              >
                {m.avatar_url ? (
                  <img src={m.avatar_url} alt={m.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-counting to-counting/60 flex items-center justify-center text-xs font-bold text-cosmos-deep">
                    {m.name[0]}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-[11px] text-cosmos-muted mt-2">
            {members.map((m: { name: string }) => m.name).join(", ")}
          </div>
        </div>

        <JoinForm inviteCode={group.invite_code} />
      </div>
    </main>
  );
}

function CodeEntryPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6">
      <Particles />
      <div className="relative z-10 w-full max-w-sm text-center">
        <h1 className="font-display text-2xl bg-gold-gradient bg-clip-text text-transparent animate-shimmer">
          Join a Group
        </h1>
        <p className="text-xs text-cosmos-muted mt-1 mb-6">
          Enter the code your friend shared
        </p>
        <form
          action={(fd) => {
            const code = (fd.get("code") as string)?.trim().toUpperCase();
            if (code) window.location.href = `/join/${code}`;
          }}
        >
          <input
            name="code"
            placeholder="ABC-D23"
            className="w-full rounded-xl border-2 border-cosmos-border bg-cosmos-card px-4 py-4 text-center text-2xl font-mono font-bold tracking-[0.3em] text-gold placeholder:text-cosmos-muted/30 outline-none focus:border-gold/50"
            maxLength={7}
            autoFocus
          />
          <button
            type="submit"
            className="w-full mt-4 rounded-xl bg-gold-gradient px-6 py-3.5 text-[15px] font-bold text-cosmos-deep"
          >
            Find Group →
          </button>
        </form>
      </div>
    </main>
  );
}
```

`app/join/[code]/join-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PinInput } from "@/components/pin-input";
import { AvatarUpload } from "@/components/avatar-upload";
import { joinGroup } from "@/lib/actions/groups";

export function JoinForm({ inviteCode }: { inviteCode: string }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [pin, setPin] = useState("");

  return (
    <form action={joinGroup} className="mt-4">
      <input type="hidden" name="inviteCode" value={inviteCode} />
      <input type="hidden" name="avatarUrl" value={avatarUrl ?? ""} />
      <input type="hidden" name="pin" value={pin} />

      <AvatarUpload onUploaded={setAvatarUrl} />
      <div className="mt-4 space-y-3">
        <Input name="name" label="Your Name" placeholder="How your friends know you" required />
        <div className="space-y-1.5">
          <label className="text-[11px] uppercase tracking-wider text-cosmos-muted">
            Set a 4-digit PIN
          </label>
          <PinInput value={pin} onChange={setPin} />
        </div>
      </div>
      <Button type="submit" className="mt-5" disabled={pin.length !== 4}>
        Join Group 🎉
      </Button>
      <p className="text-center mt-3 text-[11px] text-cosmos-muted/60">
        📸 Photo is optional — you&apos;ll get a colored initial if you skip it.
      </p>
    </form>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/create/ app/join/
git commit -m "feat: add landing, create group, and join pages"
```

---

### Task 12: Dashboard Page (Phase-Adaptive)

**Files:**
- Create: `app/group/[code]/page.tsx`

This is the largest page — it shows different content based on the omer phase (pre/during/post). The server component fetches all data and passes it to presentational components.

- [ ] **Step 1: Build the dashboard page**

`app/group/[code]/page.tsx`:

```tsx
import { getDb } from "@/lib/db";
import { getCurrentMemberForGroup } from "@/lib/auth";
import { getOmerPhase, getCurrentOmerDay, daysUntilOmer } from "@/lib/omer-date";
import { getGroupScores, computeScore } from "@/lib/scoring";
import { getEarnedAchievements, ACHIEVEMENTS } from "@/lib/achievements";
import { Particles } from "@/components/ui/particles";
import { DayCounter } from "@/components/day-counter";
import { PlayerCard } from "@/components/player-card";
import { Leaderboard } from "@/components/leaderboard";
import { RevealCard } from "@/components/reveal-card";
import { InviteCode } from "@/components/invite-code";
import { ShareButton } from "@/components/share-button";
import { AchievementBadge } from "@/components/achievement-badge";
import { DashboardActions } from "./dashboard-actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function GroupDashboard({ params }: Props) {
  const { code } = await params;
  const db = getDb();

  const [group] = await db`
    SELECT id, name, invite_code FROM groups WHERE invite_code = ${code}
  `;
  if (!group) redirect("/");

  const member = await getCurrentMemberForGroup(group.id);
  const members = await db`
    SELECT id, name, avatar_url, eliminated_on_day, predictions_locked, is_creator
    FROM members WHERE group_id = ${group.id}
    ORDER BY joined_at ASC
  `;

  const phase = getOmerPhase();
  const currentDay = getCurrentOmerDay();
  const scores = await getGroupScores(group.id);

  // Get current user's predictions
  let myPredictions: Record<string, number> = {};
  if (member) {
    const preds = await db`
      SELECT subject_id, predicted_day FROM predictions
      WHERE predictor_id = ${member.id}
    `;
    myPredictions = Object.fromEntries(
      preds.map((p: { subject_id: string; predicted_day: number }) => [
        p.subject_id,
        p.predicted_day,
      ])
    );
  }

  // Get all predictions for eliminated members (for reveals)
  const eliminatedMembers = members.filter(
    (m: { eliminated_on_day: number | null }) => m.eliminated_on_day !== null
  );
  const reveals: Record<
    string,
    { predictions: { predictorName: string; predictedDay: number; isYou: boolean; isSelf: boolean }[] }
  > = {};

  for (const em of eliminatedMembers) {
    const preds = await db`
      SELECT p.predictor_id, pm.name as predictor_name, p.predicted_day
      FROM predictions p
      JOIN members pm ON p.predictor_id = pm.id
      WHERE p.subject_id = ${em.id}
      ORDER BY pm.joined_at ASC
    `;
    reveals[em.id] = {
      predictions: preds.map(
        (p: { predictor_id: string; predictor_name: string; predicted_day: number }) => ({
          predictorName: p.predictor_name,
          predictedDay: p.predicted_day,
          isYou: member ? p.predictor_id === member.id : false,
          isSelf: p.predictor_id === em.id,
        })
      ),
    };
  }

  // Get reactions for eliminated members
  const reactions = await db`
    SELECT subject_id, emoji, COUNT(*)::int as count
    FROM reactions WHERE group_id = ${group.id}
    GROUP BY subject_id, emoji
  `;
  const myReactions = member
    ? await db`
        SELECT subject_id, emoji FROM reactions
        WHERE reactor_id = ${member.id}
      `
    : [];

  // Achievements
  let earnedAchievements: string[] = [];
  if (member) {
    earnedAchievements = await getEarnedAchievements(
      member.id,
      group.id,
      currentDay
    );
  }

  const counting = members.filter(
    (m: { eliminated_on_day: number | null }) => m.eliminated_on_day === null
  );
  const stopped = members.filter(
    (m: { eliminated_on_day: number | null }) => m.eliminated_on_day !== null
  );

  return (
    <main className="relative min-h-screen pb-10">
      <Particles />
      <div className="relative z-10 mx-auto max-w-md px-4 pt-6">
        {/* Header */}
        <div className="text-center mb-1">
          <h1 className="font-display text-2xl bg-gold-gradient bg-clip-text text-transparent animate-shimmer">
            Sfira Madness 🔥
          </h1>
          <div className="text-[11px] text-cosmos-muted uppercase tracking-widest mt-0.5">
            {group.name}
          </div>
        </div>

        {/* Phase: During Omer */}
        {phase === "during" && currentDay && (
          <>
            <div className="mt-6">
              <DayCounter day={currentDay} />
            </div>

            {/* Stats bar */}
            <div className="flex justify-center gap-6 mt-5 p-3 rounded-2xl bg-white/5 backdrop-blur">
              <div className="text-center">
                <div className="text-2xl font-black text-counting">{counting.length}</div>
                <div className="text-[10px] text-cosmos-muted uppercase tracking-wider">Still In</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-stopped">{stopped.length}</div>
                <div className="text-[10px] text-cosmos-muted uppercase tracking-wider">Stopped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black">{members.length}</div>
                <div className="text-[10px] text-cosmos-muted uppercase tracking-wider">Players</div>
              </div>
            </div>
          </>
        )}

        {/* Phase: Pre-Omer */}
        {phase === "pre" && (
          <div className="mt-6 text-center">
            <div className="text-4xl mb-2">⏳</div>
            <div className="text-lg font-bold">
              Omer starts in {daysUntilOmer()} days
            </div>
            <div className="text-xs text-cosmos-muted mt-1">
              {members.filter((m: { predictions_locked: boolean }) => m.predictions_locked).length} of{" "}
              {members.length} predictions submitted
            </div>
            {member && !member.predictions_locked && (
              <Link href={`/group/${code}/predict`}>
                <Button className="mt-4">Make My Predictions →</Button>
              </Link>
            )}
          </div>
        )}

        {/* Phase: Post-Omer */}
        {phase === "post" && (
          <div className="mt-6 text-center">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-lg font-bold text-gold">It&apos;s Over!</div>
            <div className="text-xs text-cosmos-muted mt-1">
              49 days complete. Final scores below.
            </div>
          </div>
        )}

        {/* Player list (during/post) */}
        {phase !== "pre" && (
          <>
            {counting.length > 0 && (
              <div className="mt-6">
                <SectionHeader>Still Counting</SectionHeader>
                <div className="space-y-2">
                  {counting.map((m: { id: string; name: string; avatar_url: string | null }) => (
                    <PlayerCard
                      key={m.id}
                      name={m.name}
                      avatarUrl={m.avatar_url}
                      isYou={member?.id === m.id}
                      isCounting
                      streak={currentDay ?? undefined}
                      yourPrediction={myPredictions[m.id]}
                    />
                  ))}
                </div>
              </div>
            )}

            {stopped.length > 0 && (
              <div className="mt-6">
                <SectionHeader>Stopped Counting</SectionHeader>
                <div className="space-y-2">
                  {stopped.map(
                    (m: {
                      id: string;
                      name: string;
                      avatar_url: string | null;
                      eliminated_on_day: number;
                    }) => (
                      <PlayerCard
                        key={m.id}
                        name={m.name}
                        avatarUrl={m.avatar_url}
                        isYou={member?.id === m.id}
                        isCounting={false}
                        eliminatedOnDay={m.eliminated_on_day}
                        yourPrediction={myPredictions[m.id]}
                        yourScore={
                          myPredictions[m.id] !== undefined
                            ? computeScore(myPredictions[m.id], m.eliminated_on_day)
                            : null
                        }
                      />
                    )
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Reveals */}
        {eliminatedMembers.length > 0 && (
          <div className="mt-6">
            <SectionHeader>Predictions Revealed</SectionHeader>
            <div className="space-y-3">
              {eliminatedMembers.map(
                (m: { id: string; name: string; eliminated_on_day: number }) =>
                  reveals[m.id] && (
                    <RevealCard
                      key={m.id}
                      subjectName={m.name}
                      eliminatedOnDay={m.eliminated_on_day}
                      predictions={reveals[m.id].predictions}
                    />
                  )
              )}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        {scores.length > 0 && (
          <div className="mt-6">
            <SectionHeader>Leaderboard</SectionHeader>
            <Leaderboard
              entries={scores.map((s) => ({
                ...s,
                isYou: member?.id === s.memberId,
              }))}
              resolvedCount={eliminatedMembers.length}
              totalMembers={members.length}
            />
          </div>
        )}

        {/* Achievements */}
        {member && (phase === "during" || phase === "post") && (
          <div className="mt-6">
            <SectionHeader>Achievements</SectionHeader>
            <div className="flex flex-wrap gap-2">
              {ACHIEVEMENTS.map((a) => (
                <AchievementBadge
                  key={a.id}
                  emoji={a.emoji}
                  name={a.name}
                  description={a.description}
                  earned={earnedAchievements.includes(a.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Actions (client component for self-report + reactions) */}
        {member && phase === "during" && !member.eliminated_on_day && (
          <DashboardActions inviteCode={code} />
        )}

        {/* Pre-omer: member list + invite */}
        {phase === "pre" && (
          <div className="mt-6">
            <SectionHeader>
              Joined ({members.length})
            </SectionHeader>
            <div className="space-y-1.5">
              {members.map(
                (m: {
                  id: string;
                  name: string;
                  avatar_url: string | null;
                  predictions_locked: boolean;
                  is_creator: boolean;
                }) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2.5 rounded-xl bg-cosmos-card p-2.5"
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-cosmos-border flex-shrink-0">
                      {m.avatar_url ? (
                        <img
                          src={m.avatar_url}
                          alt={m.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-counting to-counting/60 flex items-center justify-center text-sm font-bold text-cosmos-deep">
                          {m.name[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-sm font-semibold">{m.name}</div>
                    {m.is_creator && (
                      <span className="text-[10px] text-gold bg-gold/10 px-2 py-0.5 rounded-lg">
                        Creator
                      </span>
                    )}
                    {m.predictions_locked && (
                      <span className="text-[11px] text-counting">✓</span>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Invite code + share */}
        <div className="mt-8">
          <InviteCode code={code} />
          <div className="mt-3">
            <ShareButton inviteCode={code} groupName={group.name} />
          </div>
        </div>

        {/* Reclaim prompt if no cookie */}
        {!member && (
          <div className="mt-6 text-center">
            <p className="text-xs text-cosmos-muted">
              Already a member?{" "}
              <Link href={`/join/${code}`} className="text-gold">
                Reclaim your account →
              </Link>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <span className="text-[11px] text-cosmos-muted uppercase tracking-widest">
        {children}
      </span>
      <span className="flex-1 h-px bg-gradient-to-r from-cosmos-muted/20 to-transparent" />
    </div>
  );
}
```

- [ ] **Step 2: Create dashboard client actions component**

`app/group/[code]/dashboard-actions.tsx`:

```tsx
"use client";

import { reportMissed } from "@/lib/actions/elimination";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function DashboardActions({ inviteCode }: { inviteCode: string }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="mt-6 rounded-xl border border-stopped/20 bg-cosmos-card p-4 text-center">
        <p className="text-sm mb-3">Are you sure? This can&apos;t be undone.</p>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => setConfirming(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => reportMissed(inviteCode)}
          >
            Yes, I missed 😞
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="mt-6 w-full rounded-xl border border-dashed border-white/15 bg-white/5 py-3.5 text-sm text-cosmos-muted transition-all hover:border-stopped/30 hover:bg-stopped/[0.08] hover:text-stopped"
    >
      I missed a day... 😞
    </button>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/group/
git commit -m "feat: add phase-adaptive dashboard with leaderboard, reveals, and achievements"
```

---

### Task 13: Prediction Page

**Files:**
- Create: `app/group/[code]/predict/page.tsx`

- [ ] **Step 1: Build prediction submission page**

`app/group/[code]/predict/page.tsx`:

```tsx
import { getDb } from "@/lib/db";
import { getCurrentMemberForGroup } from "@/lib/auth";
import { getOmerPhase } from "@/lib/omer-date";
import { Particles } from "@/components/ui/particles";
import { redirect } from "next/navigation";
import { PredictionForm } from "./prediction-form";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function PredictPage({ params }: Props) {
  const { code } = await params;

  if (getOmerPhase() !== "pre") redirect(`/group/${code}`);

  const db = getDb();
  const [group] = await db`
    SELECT id, invite_code FROM groups WHERE invite_code = ${code}
  `;
  if (!group) redirect("/");

  const member = await getCurrentMemberForGroup(group.id);
  if (!member) redirect(`/join/${code}`);
  if (member.predictions_locked) redirect(`/group/${code}`);

  const members = await db`
    SELECT id, name, avatar_url FROM members WHERE group_id = ${group.id}
    ORDER BY joined_at ASC
  `;

  return (
    <main className="relative min-h-screen pb-10">
      <Particles />
      <div className="relative z-10 mx-auto max-w-md px-4 pt-6">
        <h1 className="font-display text-2xl bg-gold-gradient bg-clip-text text-transparent animate-shimmer text-center">
          Your Predictions
        </h1>
        <p className="text-xs text-cosmos-muted text-center mt-1 mb-6">
          How far will each person make it?
        </p>

        <PredictionForm
          members={members.map((m: { id: string; name: string; avatar_url: string | null }) => ({
            id: m.id,
            name: m.name,
            avatarUrl: m.avatar_url,
            isSelf: m.id === member.id,
          }))}
          inviteCode={code}
        />
      </div>
    </main>
  );
}
```

`app/group/[code]/predict/prediction-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { PredictionSlider } from "@/components/prediction-slider";
import { Button } from "@/components/ui/button";
import { submitPredictions } from "@/lib/actions/predictions";

interface Member {
  id: string;
  name: string;
  avatarUrl: string | null;
  isSelf: boolean;
}

export function PredictionForm({
  members,
  inviteCode,
}: {
  members: Member[];
  inviteCode: string;
}) {
  const [values, setValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const m of members) {
      init[m.id] = m.isSelf ? 49 : 25;
    }
    return init;
  });

  return (
    <form action={submitPredictions}>
      <input type="hidden" name="inviteCode" value={inviteCode} />
      <div className="space-y-2">
        {members.map((m) => (
          <div key={m.id}>
            <input type="hidden" name={`pred_${m.id}`} value={values[m.id]} />
            <PredictionSlider
              name={m.name}
              avatarUrl={m.avatarUrl}
              initial={m.name[0]}
              value={values[m.id]}
              onChange={(v) => setValues((prev) => ({ ...prev, [m.id]: v }))}
              isSelf={m.isSelf}
              locked={m.isSelf}
            />
          </div>
        ))}
      </div>
      <Button type="submit" className="mt-5">
        🔒 Lock In Predictions
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/group/*/predict/
git commit -m "feat: add prediction submission page with sliders"
```

---

### Task 14: OG Image / Share Card

**Files:**
- Create: `app/api/og/[code]/route.tsx`

- [ ] **Step 1: Create OG image generation route**

`app/api/og/[code]/route.tsx`:

```tsx
import { ImageResponse } from "@vercel/og";
import { getDb } from "@/lib/db";
import { getCurrentOmerDay } from "@/lib/omer-date";
import { getDaySefirot } from "@/lib/sefirot";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const db = getDb();

  const [group] = await db`
    SELECT id, name FROM groups WHERE invite_code = ${code}
  `;
  if (!group) return new Response("Not found", { status: 404 });

  const members = await db`
    SELECT eliminated_on_day FROM members WHERE group_id = ${group.id}
  `;
  const counting = members.filter(
    (m: { eliminated_on_day: number | null }) => m.eliminated_on_day === null
  ).length;
  const currentDay = getCurrentOmerDay();
  const sefirot = currentDay ? getDaySefirot(currentDay) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a1040, #2d1b69, #1a1040)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 24, color: "#f6d365", marginBottom: 16 }}>
          Sfira Madness 🔥
        </div>
        {currentDay && (
          <>
            <div style={{ fontSize: 14, color: "#9b8ec4", textTransform: "uppercase" as const }}>
              Day
            </div>
            <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1 }}>
              {currentDay}
            </div>
            {sefirot && (
              <div style={{ fontSize: 20, color: "#f6d365", marginTop: 8 }}>
                {sefirot.hebrew}
              </div>
            )}
          </>
        )}
        <div
          style={{
            display: "flex",
            gap: 32,
            marginTop: 24,
          }}
        >
          <div style={{ textAlign: "center" as const }}>
            <div style={{ fontSize: 36, fontWeight: 900 }}>{counting}</div>
            <div style={{ fontSize: 12, color: "#9b8ec4" }}>Still In</div>
          </div>
          <div style={{ textAlign: "center" as const }}>
            <div style={{ fontSize: 36, fontWeight: 900 }}>
              {members.length}
            </div>
            <div style={{ fontSize: 12, color: "#9b8ec4" }}>Players</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "#9b8ec466", marginTop: 24 }}>
          sfira-madness.vercel.app
        </div>
      </div>
    ),
    { width: 600, height: 400 }
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/og/
git commit -m "feat: add OG image generation for share cards"
```

---

### Task 15: Push Notifications + Cron

**Files:**
- Create: `app/api/push/subscribe/route.ts`, `app/api/cron/reminders/route.ts`, `public/sw.js`, `app/manifest.ts`, `components/reminder-toggle.tsx`

- [ ] **Step 1: Create service worker**

`public/sw.js`:

```js
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Sfira Madness 🔥", {
      body: data.body ?? "Don't forget to count!",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
```

- [ ] **Step 2: Create PWA manifest**

`app/manifest.ts`:

```ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sfira Madness",
    short_name: "Sfira",
    description: "Predict your friends. Count the Omer.",
    start_url: "/",
    display: "standalone",
    background_color: "#1a1040",
    theme_color: "#1a1040",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
```

- [ ] **Step 3: Create push subscription endpoint**

`app/api/push/subscribe/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sfira_token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { subscription, timezone } = await request.json();
  const db = getDb();

  await db`
    UPDATE members
    SET push_subscription = ${JSON.stringify(subscription)},
        timezone = ${timezone},
        reminders_enabled = true
    WHERE cookie_token = ${token}
  `;

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Create cron reminder endpoint**

`app/api/cron/reminders/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { getDb } from "@/lib/db";
import { getCurrentOmerDay } from "@/lib/omer-date";
import { getDaySefirot } from "@/lib/sefirot";

webpush.setVapidDetails(
  "mailto:sfira-madness@example.com",
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentDay = getCurrentOmerDay();
  if (!currentDay) {
    return NextResponse.json({ message: "Omer not active" });
  }

  const sefirot = getDaySefirot(currentDay);
  const db = getDb();

  // Find members who should get a reminder now (8:30pm in their timezone)
  // We check where the current UTC time = 20:30 in their timezone
  const members = await db`
    SELECT id, push_subscription, timezone FROM members
    WHERE reminders_enabled = true
      AND eliminated_on_day IS NULL
      AND push_subscription IS NOT NULL
      AND timezone IS NOT NULL
      AND EXTRACT(HOUR FROM now() AT TIME ZONE timezone) = 20
      AND EXTRACT(MINUTE FROM now() AT TIME ZONE timezone) BETWEEN 15 AND 44
  `;

  let sent = 0;
  for (const m of members) {
    try {
      await webpush.sendNotification(
        m.push_subscription as webpush.PushSubscription,
        JSON.stringify({
          title: `Sfira Madness 🔥 Day ${currentDay}`,
          body: `Don't forget to count! ${sefirot.hebrew} · ${sefirot.english}`,
        })
      );
      sent++;
    } catch {
      // Subscription expired — disable
      await db`
        UPDATE members SET reminders_enabled = false, push_subscription = NULL
        WHERE id = ${m.id}
      `;
    }
  }

  return NextResponse.json({ sent, total: members.length });
}
```

- [ ] **Step 5: Create reminder toggle component**

`components/reminder-toggle.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";

export function ReminderToggle({ enabled: initial }: { enabled: boolean }) {
  const [enabled, setEnabled] = useState(initial);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported("serviceWorker" in navigator && "PushManager" in window);
  }, []);

  if (!supported) return null;

  async function toggle() {
    if (enabled) {
      setEnabled(false);
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      setEnabled(true);
    } catch {
      // Permission denied or error
    }
  }

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs transition-all ${
        enabled
          ? "bg-gold/10 border border-gold/20 text-gold"
          : "bg-cosmos-card border border-cosmos-border text-cosmos-muted"
      }`}
    >
      {enabled ? "🔔 Reminders on" : "🔕 Enable reminders"}
    </button>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add public/sw.js app/manifest.ts app/api/push/ app/api/cron/ components/reminder-toggle.tsx
git commit -m "feat: add push notifications with cron-based evening reminders"
```

---

### Task 16: Vercel Deployment

- [ ] **Step 1: Link to Vercel**

```bash
npx vercel link
```

Follow prompts to create/link a project.

- [ ] **Step 2: Add Neon Postgres via Marketplace**

```bash
npx vercel integration add neon
```

This auto-provisions `DATABASE_URL`.

- [ ] **Step 3: Add Vercel Blob**

Blob is auto-configured when you use `@vercel/blob` — just needs `BLOB_READ_WRITE_TOKEN` which is auto-provisioned.

- [ ] **Step 4: Generate VAPID keys and set env vars**

```bash
npx web-push generate-vapid-keys
```

Then set them:

```bash
npx vercel env add VAPID_PUBLIC_KEY
npx vercel env add VAPID_PRIVATE_KEY
npx vercel env add NEXT_PUBLIC_VAPID_PUBLIC_KEY
npx vercel env add CRON_SECRET
```

- [ ] **Step 5: Pull env vars locally**

```bash
npx vercel env pull .env.local
```

- [ ] **Step 6: Run the SQL schema against the database**

```bash
npx vercel env pull .env.local
# Then run schema
psql "$(grep DATABASE_URL .env.local | cut -d= -f2-)" -f lib/schema.sql
```

Or if `psql` isn't available, use the Neon dashboard SQL editor to run `lib/schema.sql`.

- [ ] **Step 7: Test locally**

```bash
npm run dev
```

Open http://localhost:3000 — verify landing page renders.

- [ ] **Step 8: Deploy**

```bash
npx vercel --prod
```

- [ ] **Step 9: Commit any remaining changes**

```bash
git add -A
git commit -m "feat: configure Vercel deployment with Neon, Blob, and push notifications"
```

---

### Task 17: PWA Icons

- [ ] **Step 1: Create simple placeholder icons**

Create `public/icons/` directory with basic icons. For now, we can generate simple ones or use a placeholder:

```bash
mkdir -p public/icons
```

Generate a 192x192 and 512x512 icon (can be done with any image editor or an online generator). For MVP, a simple gradient square with "🔥" works.

- [ ] **Step 2: Commit**

```bash
git add public/icons/
git commit -m "feat: add PWA icons"
```

---

### Task 18: Final Integration Pass

- [ ] **Step 1: Add OG metadata to group page**

Add to `app/group/[code]/page.tsx` (as a named export above the component):

```tsx
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { code } = await params;
  return {
    title: "Sfira Madness 🔥",
    description: "Predict your friends. Count the Omer. Bragging rights for 49 days.",
    openGraph: {
      images: [`/api/og/${code}`],
    },
  };
}
```

- [ ] **Step 2: Add reminder toggle to dashboard**

In the dashboard page, add the `ReminderToggle` component in the actions area:

```tsx
import { ReminderToggle } from "@/components/reminder-toggle";

// In the JSX, after the invite code section:
{member && phase === "during" && (
  <div className="mt-3 flex justify-center">
    <ReminderToggle enabled={member.reminders_enabled ?? false} />
  </div>
)}
```

(Note: this requires adding `reminders_enabled` to the member query in the dashboard.)

- [ ] **Step 3: Final deploy**

```bash
git add -A
git commit -m "feat: add OG metadata and reminder toggle to dashboard"
npx vercel --prod
```

---

## Post-Launch Enhancements (Not in initial scope)

These can be added after the MVP is live:
- Full bracket view page (`/group/[code]/bracket`)
- Milestone celebration animations (day 7, 25, 33, 49)
- End-of-omer summary card generation
- Year-over-year tracking
