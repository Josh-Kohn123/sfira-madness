# Sfira Madness — Design Spec

A web app where friends predict how long each person will last counting Sefirat HaOmer (49 days), March Madness-style. Lowest score (most accurate predictions) wins.

**Target audience:** Modern religious 18-28 year olds. Social, competitive, meme-literate, genuinely care about the mitzvah.

## Core Mechanics

### Scoring
- Each player submits a prediction (1-49) for every other player in the group
- Your prediction for **yourself** is forced to **49** (you must commit to going all the way)
- When the omer ends (or a player stops counting), score per subject = `|actual_day - predicted_day|`
- If a player is still counting, their actual day is treated as 49
- **Total score** = sum of all your per-subject scores. **Lowest score wins.**
- Players who stop counting are **not disqualified** — their remaining predictions still accumulate points. They also eat a self-penalty since they predicted 49 for themselves.

### Prediction Visibility
- **Hidden until a subject stops counting** — when someone is eliminated, everyone's predictions *for that person* are revealed
- Active counters' predictions remain hidden to prevent influence
- Full bracket revealed at the end of the 49 days

### Timing
- Predictions are submitted **all at once before Omer starts** (no rolling updates)
- A countdown shows how long until predictions lock
- Reporting that you missed a day is **honor system** — no daily check-in enforcement

## User Flows

### Group Creation
1. Landing page: "Create a Group" or "Join with Code"
2. Create: enter your name + group name, optional photo upload → group created with invite code
3. Waiting room: shows invite code + share buttons (WhatsApp, copy link), live member list

### Join Flow
1. **Via link** (primary path): tap WhatsApp link → goes straight to profile setup with group pre-loaded
2. **Via code**: enter 6-character code → group preview card appears (name, creator, members) → tap "Join"
3. Profile: enter name, optional photo → confirmed → prompted to make predictions

### Cookie Reclaim
If a user loses their cookie (new device, cleared cache):
- Visit the group link
- App sees no cookie → shows "Already a member?" with the member list
- Tap your name → enter your 4-digit PIN → cookie re-issued
- PIN is set during group creation or join (lightweight, prevents friends from pranking each other)

### Prediction Submission
- Slider-based input (1-49) for each friend — drag to pick days
- Your own row locked at 49 with explanation of the self-penalty mechanic
- "Lock In Predictions" button
- Status shows who has/hasn't submitted

### Dashboard (During Omer)
- **Day counter** with animated progress ring
- **Sefirah of the day** in Hebrew + English (e.g., "תפארת שבנצח · Harmony within Endurance")
- **Daily kavanah** — one-liner spiritual reflection tied to the sefirah combo
- **Player list** split into "Still Counting" (with fire streak badges) and "Stopped Counting"
  - Active players: show your prediction for them
  - Stopped players: show your prediction + your score for them
- **Revealed predictions** section for eliminated members — grid showing what everyone guessed
- **Leaderboard** — running scores (partial, updated as people drop out)
- **"I missed a day"** self-report button
- **Invite code** persistent at bottom

### Elimination Moment
When someone reports they missed:
- Animated card appears: photo, how long they lasted, self-penalty
- Emoji reactions from friends (😱 🫡 💀 🕯️ 😂)
- Designed to be screenshottable for WhatsApp

### Post-Omer
- Final leaderboard with complete scores
- Full bracket reveal — everyone's predictions for everyone
- Winner highlighted
- End-of-omer shareable summary card

## Fun Features

### Shareable Story Cards
- One-tap generated image for WhatsApp Status / Instagram Stories
- Shows: day, streak, rank, sefirah
- Generated server-side with Satori / @vercel/og
- Also serves as OG image when sharing invite link
- This is the primary organic growth mechanic

### Achievements
| Badge | Name | Criteria |
|-------|------|----------|
| 🔥 | Week One | Survived first 7 days |
| 🎯 | Prophet | Predicted within 1 day of actual |
| 🏹 | Lag BaOmer | Still counting on day 33 |
| 👑 | Iron Will | Made it all 49 days |
| 🧠 | Mastermind | Lowest total score (winner) |
| 🫢 | Way Off | Missed a prediction by 20+ |
| 💪 | Underdog | Outlasted everyone's prediction for you |
| 🌅 | Halfway | Still counting on day 25 |

### Milestone Celebrations
Special cards/animations on:
- Day 7 (first full week)
- Day 25 (halfway)
- Day 33 (Lag BaOmer — bonfire theme 🏹🔥)
- Day 49 (FINISH!)

### Sefirot System
Static data structure — 7 sefirot, 49 combinations:

| # | Hebrew | Transliteration | English |
|---|--------|----------------|---------|
| 1 | חסד | Chesed | Lovingkindness |
| 2 | גבורה | Gevurah | Discipline |
| 3 | תפארת | Tiferet | Harmony |
| 4 | נצח | Netzach | Endurance |
| 5 | הוד | Hod | Humility |
| 6 | יסוד | Yesod | Connection |
| 7 | מלכות | Malchut | Sovereignty |

**Formula:** Day `d` (1-indexed):
- Week (primary) = `Math.ceil(d / 7)` → sefirah index
- Day within week (secondary) = `((d - 1) % 7) + 1` → sefirah index
- Display: `{secondary} שב{primary}`

Each day also has a **kavanah** — a short one-liner reflection tied to the sefirah combo. 49 unique reflections, hardcoded.

### Emoji Reactions
Preset reactions on elimination cards. Lightweight social interaction without a full chat system.

## Data Model

### `groups`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | e.g., "The Shul Boys" |
| invite_code | text | unique, 6 chars (e.g., "SHU-L42") |
| created_at | timestamp | |
| omer_start_date | date | first night of counting |

### `members`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| group_id | uuid | FK → groups |
| name | text | |
| cookie_token | text | unique, signed token for identity |
| pin_hash | text | bcrypt hash of 4-digit PIN |
| avatar_url | text | nullable, Vercel Blob URL |
| is_creator | boolean | |
| eliminated_on_day | int | nullable. null = still counting. 1-49 = last day successfully counted |
| predictions_locked | boolean | default false, true once submitted |
| timezone | text | nullable, IANA timezone (e.g., "America/New_York"), auto-detected |
| push_subscription | jsonb | nullable, Web Push API subscription object |
| reminders_enabled | boolean | default false |
| joined_at | timestamp | |

### `predictions`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| group_id | uuid | FK → groups |
| predictor_id | uuid | FK → members |
| subject_id | uuid | FK → members |
| predicted_day | int | 1-49 |
| Constraint | | predictor = subject → predicted_day must be 49 |
| Unique | | (predictor_id, subject_id) |

### `reactions`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| group_id | uuid | FK → groups |
| reactor_id | uuid | FK → members |
| subject_id | uuid | FK → members (the eliminated person) |
| emoji | text | one of: 😱 🫡 💀 🕯️ 😂 |
| Unique | | (reactor_id, subject_id, emoji) |

### Scoring (computed, not stored)
Score is computed on read:
- For each (predictor, subject) pair:
  - If subject has stopped: `score = |eliminated_on_day - predicted_day|`
  - If subject is still counting (null): `score = |49 - predicted_day|` (assumes they make it — this score may change if they later stop)
- Total score = sum across all subjects
- During the omer, the leaderboard is live and updates as people stop counting
- After the omer, scores are final — anyone still counting gets actual = 49

## Tech Stack

### Framework & Deployment
- **Next.js 16** (App Router, Server Components, Server Actions)
- **Vercel** (deployment, free tier)
- **TypeScript**

### Database
- **Neon Postgres** (via Vercel Marketplace, free tier)
- Accessed with `@neondatabase/serverless`

### File Storage
- **Vercel Blob** for avatar photo uploads
- Client-side upload, URL stored in `members.avatar_url`

### Share Card Generation
- **Satori / @vercel/og** for server-side image generation
- Used for: shareable story cards, OG images for invite links, elimination moment cards

### Identity
- No auth library. Cookie-based identity within groups.
- Signed HTTP-only cookie containing the member's `cookie_token`
- 4-digit PIN set on creation/join — used only for cookie reclaim (prevents prank logins)
- PIN stored as bcrypt hash, never in plain text
- Reclaim: tap your name → enter PIN → cookie re-issued

### Evening Reminders
- **Web Push Notifications** (Push API + Service Worker)
- On join or from dashboard settings, user opts in to reminders
- Browser auto-detects timezone (stored in `members.timezone`)
- **Vercel Cron Job** runs every 30 minutes during omer season
  - Queries members where `reminders_enabled = true` and local time is 8:30pm (±15min window)
  - Sends push notification: "Don't forget to count! Day {n} · {sefirah_hebrew}"
- Only sent to members who are still counting (`eliminated_on_day IS NULL`)
- Requires VAPID key pair (stored as env vars)
- iOS Safari requires "Add to Home Screen" for push — show a prompt for iOS users

### Styling
- **Tailwind CSS** + custom design system
- Dark purple/cosmic theme with golden accents
- Rubik + Secular One fonts (Google Fonts)
- Mobile-first (primary usage will be phone via WhatsApp links)

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing — create or join |
| `/create` | Create group + profile |
| `/join/[code]` | Join flow (code pre-filled from URL) |
| `/group/[code]` | Main dashboard — adaptive based on phase (pre-omer, during, post) |
| `/group/[code]/predict` | Prediction submission form |
| `/group/[code]/bracket` | Full prediction matrix (visible post-omer, partial during) |
| `/api/og/[code]` | OG image / share card generation |
| `/api/cron/reminders` | Cron endpoint — sends evening push notifications |
| `/api/push/subscribe` | Register push subscription |

## Design Aesthetic

- **Cosmic purple gradient** background with floating particle animations (✨🌙⭐🔥✡🌾)
- **Golden accent** (#f6d365 → #fda085 gradient) for CTAs, highlights, sefirah text
- **Card-based UI** with glassmorphism touches (rgba backgrounds, subtle borders)
- **Photo avatars** with colored borders (green = counting, amber = stopped, gold = you)
- **Fire streak badges** (🔥 23) on active counters
- **Mobile-first** — designed for phone screens, shared via WhatsApp
- Fun, game-like feel — not a form, not a spreadsheet

## Non-Goals (Explicitly Out of Scope)
- Real authentication (OAuth, passwords, etc.)
- Daily check-in enforcement / nightfall time tracking
- Rolling/daily prediction updates
- Full chat system
- Multi-year tracking / returning players (v2 consideration)
