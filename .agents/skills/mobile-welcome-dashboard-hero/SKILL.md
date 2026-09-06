---
name: mobile-welcome-dashboard-hero
description: Reusable blueprint and strict implementation guide for the signature mobile welcome dashboard UI with the mascot on the left and the speech bubble system message card on the right, curved arch banner, and quick stats grid.
---

# Mobile Welcome Dashboard Hero UI & System Message Blueprint

A mobile-first welcome dashboard header blueprint with the signature **left-side mascot illustration** and **right-side floating system message speech bubble card**.

---

## 🏗️ 2-Column Banner Architecture: Mascot (Left) + System Message (Right)

The signature hero slice is built with a dual visual anchor:
1. **Left Anchor**: Mascot / Character illustration overflowing the top of the curved arch.
2. **Right Anchor (MANDATORY)**: Floating System Message Card with an arrow pointer notch pointing left to the mascot.

```
+-- [ HERO SLICE CONTAINER: relative h-[120px] sm:h-[185px] lg:h-[200px] overflow-visible ] -------+
|                                                                                                   |
|  [ LAYER 1: Solid Primary Brand Color Bar (absolute inset-0 bg-primary) ]                         |
|  [ LAYER 2: White Concave Arch Wave (absolute top-[-58px] sm:top-[-80px] r:0 0 50% 50% / 74% 74%)]|
|                                                                                                   |
|  [ LAYER 3: MASCOT (LEFT) ]                       [ LAYER 4: SYSTEM MESSAGE SPEECH BUBBLE (RIGHT)]|
|  +-------------------------+                      +---------------------------------------------+ |
|  |                         |                      | 🏷️ APP SPACE / SYSTEM TAG                  | |
|  |     [MASCOT IMAGE]      |  <--- Arrow Notch    | 💬 "Your workspace and 48 items are ready.  | |
|  |   pinned bottom-0       |       (pointer tail) |    Check replies or open your planner."     | |
|  |   left-[-14px] / left-0 |                      +---------------------------------------------+ |
|  |   z-index: 60           |                      (absolute left-[48%] sm:left-[42%] lg:left-[34%]|
|  |   height: 140px-225px   |                       right-2 sm:right-3 top-[-4px] sm:top-2 z-50)   |
|  +-------------------------+                                                                      |
+---------------------------------------------------------------------------------------------------+
```

---

## 🎯 Master Prompt for Google AI Studio / Gemini / Claude

```text
Create a standalone React (TypeScript + Tailwind CSS) component named `WelcomeDashboardHero`.

MANDATORY COMPONENTS & 5-LAYER STACKING (DO NOT OMIT THE SYSTEM MESSAGE OR USE A FLEX ROW):

1. TOP HEADER:
   - Date Pill Badge: inline-flex rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.22em].
   - Dynamic Greeting: "Good morning / afternoon / evening, {userName}." (font-serif font-black text-2xl sm:text-3xl).

2. HERO BANNER WITH LEFT MASCOT & RIGHT SYSTEM MESSAGE (Exact 5 layers):
   - Outer container: `relative left-1/2 -translate-x-1/2 w-screen max-w-[calc(100%+2rem)] sm:w-auto sm:max-w-none sm:translate-x-0 h-[120px] sm:h-[185px] lg:h-[200px] overflow-visible`.
   - Layer 1 (Background): `absolute inset-0 bg-primary` (or `brandColor`).
   - Layer 2 (Curved Arch Cutout): `absolute inset-x-[-32%] sm:inset-x-[-24%] top-[-58px] sm:top-[-80px] lg:top-[-85px] h-[112px] sm:h-[140px] lg:h-[150px] bg-white z-10` with inline style `style={{ borderRadius: '0 0 50% 50% / 0 0 74% 74%' }}`.
   - Layer 3 (Left Mascot Illustration): `absolute bottom-0 left-[-14px] sm:left-0 lg:left-2 z-[60] h-[140px] sm:h-[205px] lg:h-[225px] w-auto object-contain drop-shadow-2xl`. (Height is taller than container to pop out above the arch).
   - Layer 4 (Right Floating Speech Bubble / System Message Card - REQUIRED):
     `absolute left-[48%] sm:left-[42%] lg:left-[34%] right-2 sm:right-3 lg:right-5 top-[-4px] sm:top-2 z-50 rounded-[1.2rem] sm:rounded-[1.4rem] bg-white border border-primary/20 p-3 sm:px-5 sm:py-3 shadow-xl ring-1 ring-black/5`.
     Inside the speech bubble card:
     * Pointer notch tail on left: `<span className="absolute -left-[8px] top-1/2 -translate-y-1/2 h-4 w-4 rotate-45 border-b border-l border-primary/20 bg-white" />`.
     * Title Tag: `text-[11px] sm:text-xs font-black uppercase tracking-wider text-primary` (e.g., "Workspace Hub" / "System Update").
     * Message Body: `text-[11px] sm:text-sm font-medium leading-relaxed text-gray-600` (dynamic context message).

3. BOTTOM ROW:
   - 3-column micro-stats grid: icon in `bg-primary/10 text-primary` box (turns solid `bg-primary text-white` on hover), uppercase micro-label, bold serif value.
   - Responsive CTA buttons: primary CTA uses `bg-primary text-white shadow-primary/25`, secondary CTA uses `border border-gray-200 text-primary hover:bg-primary/5`.

4. DYNAMIC BRANDING:
   - Accept a dynamic `brandColor` prop or default to `var(--primary, #18181B)`.
```

---

## 💎 Full Production Component (`WelcomeDashboardHero.tsx`)

```tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, ArrowRight, Calendar, Users, Heart, Sparkles } from 'lucide-react';

export interface FocusMetricItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
}

export interface WelcomeDashboardHeroProps {
  /** First name or display name */
  userName?: string;
  /** Transparent PNG/WebP for pop-out character on the left */
  characterImageUrl?: string;
  /** System message category tag (e.g. 'Workspace Hub', 'System Status') */
  bubbleTag?: string;
  /** Dynamic context message displayed inside the speech bubble on the right */
  bubbleMessage?: string;
  /** 3 micro-metric focus items */
  focusItems?: FocusMetricItem[];
  /** Primary button label */
  primaryActionLabel?: string;
  /** Primary button onClick handler */
  onPrimaryAction?: () => void;
  /** Secondary button label */
  secondaryActionLabel?: string;
  /** Secondary button icon */
  secondaryActionIcon?: LucideIcon;
  /** Secondary button onClick handler */
  onSecondaryAction?: () => void;
  /** Optional custom date string (e.g. 'WEDNESDAY, AUGUST 19') */
  customDateLabel?: string;
  /** Optional top-right quick icons */
  topActionsSlot?: React.ReactNode;
  /** 
   * Brand Color Hex (e.g. '#4F46E5', '#059669', '#18181B').
   * If omitted, automatically defaults to CSS variable `var(--primary, #18181B)`.
   */
  brandColor?: string;
}

export function WelcomeDashboardHero({
  userName = 'there',
  characterImageUrl = '/assets/mascot.png',
  bubbleTag = 'Workspace Hub',
  bubbleMessage = 'Your workspace and 48 items are ready. Check updates or open your project planner.',
  focusItems = [
    { label: 'Active Items', value: '12', icon: Heart },
    { label: 'Responses', value: '48', icon: Users },
    { label: 'Upcoming', value: '3', icon: Calendar },
  ],
  primaryActionLabel = 'Continue Workspace',
  onPrimaryAction,
  secondaryActionLabel = 'Open Details',
  secondaryActionIcon: SecondaryIcon = Sparkles,
  onSecondaryAction,
  customDateLabel,
  topActionsSlot,
  brandColor,
}: WelcomeDashboardHeroProps) {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  const todayLabel = customDateLabel || new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date()).toUpperCase();

  const activeBrandColor = brandColor || 'var(--primary, #18181B)';

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative isolate mb-6 overflow-hidden rounded-[1.75rem] border border-gray-200 bg-white shadow-xl shadow-black/5 sm:mb-8 sm:rounded-[2rem]"
    >
      <div className="p-4 sm:p-6 lg:p-6">
        {/* 1. TOP ROW: Date Badge & Greeting */}
        <div className="relative z-[80] flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p 
              className="inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.22em] ring-1 ring-black/5"
              style={{ 
                backgroundColor: brandColor ? `${brandColor}15` : 'color-mix(in srgb, var(--primary, #18181B) 10%, transparent)',
                color: activeBrandColor 
              }}
            >
              {todayLabel}
            </p>
            <h1 className="mt-1.5 max-w-3xl font-serif text-[1.75rem] font-black leading-[1.1] text-gray-900 sm:text-3xl lg:text-3xl">
              {greeting}, <span style={{ color: activeBrandColor }}>{userName}</span>
              <span style={{ color: activeBrandColor }}>.</span>
            </h1>
          </div>

          {topActionsSlot && (
            <div className="hidden shrink-0 items-center gap-2 sm:flex">
              {topActionsSlot}
            </div>
          )}
        </div>

        {/* 2. HERO SLICE: Mascot on LEFT + System Message Card on RIGHT */}
        <div className="relative left-1/2 mt-3 h-[120px] w-screen max-w-[calc(100%+2rem)] -translate-x-1/2 overflow-visible sm:-mx-6 sm:left-auto sm:w-auto sm:max-w-none sm:translate-x-0 sm:mt-4 sm:h-[185px] lg:-mx-6 lg:h-[200px]">
          {/* Layer 1: Solid Primary Brand Color Bar */}
          <div className="absolute inset-0" style={{ backgroundColor: activeBrandColor }} />

          {/* Layer 2: White Concave Arch Wave Overlay */}
          <div
            className="absolute inset-x-[-32%] top-[-58px] z-10 h-[112px] bg-white sm:inset-x-[-24%] sm:top-[-80px] sm:h-[140px] lg:top-[-85px] lg:h-[150px]"
            style={{ borderRadius: '0 0 50% 50% / 0 0 74% 74%' }}
          />

          {/* Layer 3: Character / Mascot on LEFT (Taller than slice, pops out over arch) */}
          <img
            src={characterImageUrl}
            alt="Welcome character"
            className="absolute bottom-0 left-[-14px] z-[60] h-[140px] w-auto object-contain drop-shadow-2xl transition duration-500 hover:-translate-y-1 hover:scale-[1.02] sm:left-0 sm:h-[205px] lg:left-2 lg:h-[225px]"
          />

          {/* Layer 4: System Message Speech Bubble on RIGHT (MANDATORY) */}
          <div 
            className="absolute left-[48%] right-2 top-[-4px] z-50 rounded-[1.2rem] bg-white px-3 py-2 pr-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.12)] ring-1 ring-black/5 sm:left-[42%] sm:right-3 sm:top-2 sm:rounded-[1.4rem] sm:px-5 sm:py-3 sm:pr-5 lg:left-[34%] lg:right-5 lg:max-w-2xl border"
            style={{ borderColor: brandColor ? `${brandColor}30` : 'color-mix(in srgb, var(--primary, #18181B) 20%, transparent)' }}
          >
            {/* Arrow Notch Pointer Tail pointing left towards the mascot */}
            <span 
              className="absolute -left-[8px] top-1/2 -translate-y-1/2 h-4 w-4 rotate-45 border-b border-l bg-white"
              style={{ borderColor: brandColor ? `${brandColor}30` : 'color-mix(in srgb, var(--primary, #18181B) 20%, transparent)' }}
            />
            
            <div className="relative z-10">
              {/* System Tag */}
              <p 
                className="text-[11px] font-black uppercase tracking-wider sm:text-xs"
                style={{ color: activeBrandColor }}
              >
                {bubbleTag}
              </p>
              {/* Dynamic Context Message */}
              <p className="mt-0.5 text-[11px] font-medium leading-relaxed text-gray-600 sm:text-sm sm:leading-snug">
                {bubbleMessage}
              </p>
            </div>
          </div>
        </div>

        {/* 3. BOTTOM ROW: Micro-Metrics & Action Buttons */}
        <div className="mt-3.5 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          {/* Micro Stats Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            {focusItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="group rounded-xl border border-gray-200 bg-white p-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-2.5"
                >
                  <div 
                    className="mb-1 flex h-6 w-6 items-center justify-center rounded-lg transition sm:h-7 sm:w-7 group-hover:opacity-90"
                    style={{ 
                      backgroundColor: brandColor ? `${brandColor}15` : 'color-mix(in srgb, var(--primary, #18181B) 10%, transparent)',
                      color: activeBrandColor
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-[7px] font-bold uppercase leading-tight tracking-[0.12em] text-gray-500 sm:text-[8px]">
                    {item.label}
                  </p>
                  <p className="mt-0.5 font-serif text-sm font-bold leading-none text-gray-900 sm:text-base">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col gap-2 sm:flex-row lg:flex-row">
            {primaryActionLabel && (
              <button
                type="button"
                onClick={onPrimaryAction}
                style={{ backgroundColor: activeBrandColor }}
                className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:opacity-95 sm:text-sm"
              >
                {primaryActionLabel} <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}

            {secondaryActionLabel && (
              <button
                type="button"
                onClick={onSecondaryAction}
                style={{ color: activeBrandColor }}
                className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-bold transition hover:-translate-y-0.5 hover:bg-gray-50 sm:text-sm"
              >
                <SecondaryIcon className="h-3.5 w-3.5" />
                {secondaryActionLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
```
