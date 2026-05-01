# HMC — Mobile App Design Prompt

## Brief
Design the complete visual system for **HMC**, a mobile habit-tracking and self-accountability app for iOS and Android (React Native + Expo). HMC is not a typical habit tracker. It is a **daily self-scoring system** built on four pillars — Identity, Execution, Outcome, Penalty — that produces a single Total Score each day. The user measures who they are becoming, not just whether they checked boxes.

Deliver: high-fidelity mockups for every screen listed below, plus a tight design system (color, type, spacing, components) the dev team can implement in NativeWind.

## Brand thesis (read this before designing)
HMC is for serious people. The user is someone who wants measurable progress on identity, work, and discipline — not someone who wants confetti and streak fires. The product voice is **direct, unapologetic, and adult**. Examples from the user's own language: "No BS Discipline," "Kept My Word," "Broke My Word," "Tomorrow Non-Negotiable."

Design implications:
- **No streaks. No badges. No gamification.** The score itself is the reward. The user's notes explicitly reject streaks as "fake dopamine."
- **No emoji-heavy interface.** Use them sparingly as section anchors at most, never as the dominant visual.
- **No "great job!" microcopy.** No congratulation screens. The app respects the user's intelligence.
- **The interface should feel like a private command center**, not a social product.

## Visual direction: Premium Dark
- **Base palette**: deep blacks (`#0A0A0B`, `#111113`, `#1A1A1D`) layered for depth, off-white text (`#F5F5F7`, `#A1A1A6` for secondary)
- **Accent color**: a single, restrained accent for scores, progress, and CTAs. Recommended: a near-electric green like `#00D26A` (signals progress without being lime/cartoonish), OR a deep amber `#FFB020` (signals premium/discipline). Pick one and use it sparingly — every accent appearance should mean something.
- **Subtle gradients**: dark-to-darker radial gradients on hero surfaces (the daily score card, weekly summary). Avoid colorful gradients.
- **Texture**: very subtle noise/grain on hero surfaces to avoid flat-black flatness. Optional.
- **Glass/blur**: tasteful use on overlays and tab bar. Not overdone.

## Typography
- **Display**: a strong geometric or neo-grotesk sans for scores and headlines (e.g., Inter Display, Söhne, GT America, or system: SF Pro Display). Tight letter spacing on big numbers.
- **Body**: same family, regular weight, comfortable line height. Inter or SF Pro is fine.
- **Numbers must feel weighty.** The Total Score is the visual hero of the app — render it large (96–120pt), tabular figures, slightly tightened tracking.
- **No serifs.** No script. No personality fonts.

## Iconography
- Thin-line icons (Lucide or Phosphor at 1.5px stroke). Outline style, never filled.
- Icons are utility, not decoration.

## Tone of microcopy
Write all copy as if for an adult who chose this app deliberately. Examples:
- ✅ "Did you keep your word today?" 
- ❌ "Time to crush your goals! 🚀"
- ✅ "0 alcohol. Logged."
- ❌ "Yay, you're doing amazing!"
- ✅ "Tomorrow's non-negotiable:"
- ❌ "What will you crush tomorrow?"

---

# Screens to design

## 1. Onboarding (8–10 screens)

The user is defining their own scoring system. This is the most important flow in the app — if onboarding feels like a chore, no one finishes it. Make it feel like **clarity**, not a form.

### 1.1 Welcome
- Full-bleed black screen
- Logo (HMC wordmark, monospaced or geometric)
- Tagline: "Become measurable."
- Single CTA: "Start"
- No "Sign in" link clutter — that goes on the next screen

### 1.2 Sign in / Sign up
- Email + password fields
- "Continue with Google" button (use Google's brand-compliant button styling but match the dark theme)
- Link to terms/privacy at bottom
- No social proof, no testimonials, no marketing copy

### 1.3 Identity setup — "Who are you becoming?"
- Single text field, full-screen prompt: *"In one sentence, who are you becoming?"*
- Optional, can skip
- This sentence will be shown above the daily check-in every day. Treat it like a vow.

### 1.4 Identity habits — "Your daily non-negotiables"
- Pre-filled defaults from the user's notes (each worth 5 points): Wake On Time, Visualization, No BS Discipline, Kept My Word
- User can edit each label, add up to 2 more, or delete one
- Brief explainer at top: "These are the four things that define who you are. Each is worth 5 points. Total: 20."
- Inline editable list, not a modal

### 1.5 Execution habits — "What moves you forward"
- Pre-filled defaults with point values: Deep Work AM (15), Evening Work (10), Gym (10), Learning (5), Sales/Outreach (5), Content/Brand (5), Public Speaking (5)
- User can edit labels, edit point values (constrained 1–20), reorder, add/remove
- Plus a **9-5 Performance** field (numeric input, 0–10) — explainer: "How well did you perform at your day job today? Auto-added to execution score."

### 1.6 Outcome metrics — "What you're producing"
- Four 0–5 scale items (defaults from notes): Revenue / Deals, Authority / Content Output, Relationships, Mission Progress
- User can rename, but keep the count at 4 for MVP (don't over-flex it)
- Explainer: "Rate each from 0 to 5 each night. These reflect what you actually shipped."

### 1.7 Penalties — "What costs you"
- Three 0–5 scale items: Alcohol, Nicotine, Wasted Time
- User can rename or remove (but explainer makes clear: penalties are deductions from total)
- Tone: matter-of-fact. "These get subtracted. Be honest."

### 1.8 Score preview
- Show the user a sample day with all categories filled and the Total Score calculated
- "This is what your score looks like."
- Big number (e.g., 87), broken down by category below
- This is the moment they understand the system

### 1.9 Reminder time
- Single picker: "When do you check in?"
- Default: 9:00 PM
- Explainer: "Once a day. End of day. Honest."
- Permission prompt for notifications follows OS pattern

### 1.10 Done
- "You're set up. Tomorrow starts now."
- CTA: "Open HMC"
- No confetti.

## 2. Daily check-in screen (the home screen)

The screen the user opens every night. Must be **fast** — fillable in under 2 minutes — but **complete**.

### Layout
- Top: today's date, the user's identity sentence (the "vow"), and a live-updating Total Score in massive type (changes as user fills in)
- Below: collapsible sections for each pillar (Identity, Execution, Outcome, Penalty), pre-expanded
  - **Identity**: row of large checkboxes with labels, each tap animates the score
  - **Execution**: same, plus 9-5 Performance numeric field
  - **Outcome**: four 0–5 sliders or segmented controls
  - **Penalty**: three 0–5 segmented controls (visually distinct — slightly red-tinged accent or warning color)
- **Reflection** section at bottom (text fields):
  - "Win today"
  - "Broke my word"
  - "Tomorrow's non-negotiable"
- Sticky "Save day" button at bottom — only enabled when user has actually engaged with the form (don't let them save an empty day)

### Interactions
- Each checkbox tap should give satisfying haptic feedback (no animation hype, just feel)
- Total Score number animates smoothly when values change
- Saving a day shows a quiet confirmation, NOT a celebration screen
- Past days are read-only by default; one extra tap to edit (prevents accidental retroactive optimism)

## 3. Weekly review

Triggered every Sunday night via notification, OR accessible anytime via a "Week" tab.

### Layout
- Header: week range (e.g., "April 22 – 28") and **Weekly Score** (sum of 7 daily totals, plus average)
- **Bar chart**: 7 vertical bars, one per day, color-graded (deeper accent for higher scores)
- **Pillar breakdown**: four mini-cards showing average Identity / Execution / Outcome / Penalty for the week
- **Best day / worst day**: surfaced with the score and the user's "Win" or "Broke my word" reflection from that day
- **Photo of the week**: see section 4
- **Weekly reflection** (text fields):
  - "Theme of this week"
  - "What I'm changing next week"
- Save → archives the week

### Tone
- The weekly review is the introspection moment. It can be slightly more spacious than the daily screen. Slightly more breathing room. But still not warm/fuzzy.

## 4. Photos system

User uploads weekly photos. Use cases include physique check-ins, workspace photos, mood, location — user-defined.

### Setup (in settings or weekly review)
- User defines 1–4 "photo slots" for the week, each with a label (e.g., "Physique," "Workspace," "Whiteboard")
- Each slot is a single image upload per week

### Weekly upload screen
- Grid of slots, each shows the previous week's photo dimmed in the background for quick comparison
- Tap to upload new photo (camera or library)
- Photos store in Supabase Storage (private bucket, RLS scoped to user)

### Photo timeline
- Dedicated tab/section
- Vertical scroll: weeks down the page, photos in horizontal row per week
- Tap any photo to expand fullscreen
- Long-press for delete option
- This becomes the visual long-term feedback loop

## 5. Trends

The data view. For users who want to see patterns.

### Layout
- Tab: "Trends"
- Time range selector at top: 7d / 30d / 90d / 1y / All
- **Total Score line chart** (hero, large)
- **Pillar lines**: smaller stacked or toggleable line charts for each of the four pillars
- **Habit heatmap**: GitHub-contributions-style grid, but for individual habits — user can tap a habit name to see its consistency over time. Color-graded with the accent color.
- **Stats cards**:
  - Average daily score
  - Best week
  - Worst week
  - Most-broken habit
  - Most-consistent habit

No "you're on a 7-day streak!" copy. The data speaks for itself.

## 6. Profile / Settings

Spartan. Sections:
- Identity sentence (editable)
- Habits config (edit any of the four pillars — labels, point values, add/remove)
- Reminder time
- Photo slots
- Subscription status (see section 7)
- Sign out
- Delete account (gated, since it deletes all data)

## 7. Paywall / Subscription screen

HMC monetizes via subscription IAP (Apple + Google).

### Layout
- One screen, no tricks
- Headline: "HMC Premium"
- Three lines of value (no exhaustive feature lists):
  - "Unlimited history"
  - "Photo timeline"
  - "Trend analytics"
- Toggle: monthly / yearly (yearly highlighted as "Save 40%" or actual math)
- Single CTA: "Start"
- "Restore purchases" link
- Tiny terms/privacy footer
- No countdown timers, no "limited offer," no scarcity tactics

The free tier should still be useful (daily check-in, last 7 days of history) — paywall should feel like an upgrade, not a wall.

---

# Design system deliverables

Provide alongside the screen mockups:

1. **Color tokens**: every named color used (background-base, background-elevated, text-primary, text-secondary, accent, accent-muted, danger, etc.) with hex values and dark-mode-only assumption (HMC has no light mode for v1)
2. **Type scale**: display-xl (the score), display-lg, heading, body, caption — with sizes, weights, line heights
3. **Spacing scale**: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 (matches Tailwind defaults)
4. **Component library**: Button (primary, secondary, ghost, danger), Input, Checkbox, SegmentedControl (for 0–5 scales), Slider, Card, BottomSheet, TabBar
5. **Iconography choice**: Lucide or Phosphor, document which
6. **Motion**: brief notes on transitions — keep it tight (200–300ms ease-out), no spring bounce, no hero-page choreography. The app feels controlled.

# What to NOT design

- Light mode (v1 is dark only)
- Social features (no friends, no leaderboards, no sharing)
- AI assistant / chat / coach (not in scope)
- Apple Watch / wearables companion (later)
- Widgets (later)

# Format for delivery

For each screen, produce:
- A high-fidelity mobile mockup (390×844 iPhone reference frame, but design responsively)
- A short caption explaining the screen's job in one sentence
- Notes on any non-obvious interactions

Group screens by section (Onboarding, Daily, Weekly, Photos, Trends, Settings, Paywall).

Bring restraint. The best version of HMC is one where every screen could survive being printed in a luxury watch ad. No clutter. Real type. Honest data.
