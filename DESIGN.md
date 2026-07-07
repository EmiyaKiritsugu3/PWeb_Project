# Aegis Fitness OS - Design System

This document outlines the master visual identity for **Aegis Fitness OS**, a next-generation gym and personal training platform.

## Design Philosophy

The application is built with a premium, high-end aesthetic, akin to Apple Fitness+ or a luxury boutique gym. It is strictly **Dark Mode-first**. The UI is immersive, highly legible, and visually striking without being cluttered.

- **Backgrounds:** Deep, OLED blacks to ensure contrast and reduce eye strain.
- **Surfaces/Cards:** Subtle, elevated dark grays to provide depth and separation.
- **Accents:** High-contrast neon/electric accents (Electric Cyan) for primary actions, active states, glowing indicators, and progress rings.
- **Text:** High-contrast white for primary headings, and muted grays for secondary or tertiary text to establish clear hierarchy.
- **Component Architecture:** Clean, modern borders (`border-white/10`) and radii (`rounded-xl`). Usage of subtle glowing drop-shadows instead of flat background colors for active states.
- **Motion:** Spring-based hover effects and hardware-accelerated layout transitions to make the UI feel fluid and responsive.

---

## 🎨 Tailwind CSS Configuration (v4)

Add these variables to your global CSS to define the core color palette.

```css
@theme {
  /* ========================================= */
  /* COLOR PALETTE                             */
  /* ========================================= */

  /* Backgrounds & Surfaces (OLED Black -> Dark Gray) */
  --color-background: #000000;
  --color-surface-100: #09090b;
  --color-surface-200: #18181b;
  --color-surface-300: #27272a;

  /* Text Colors */
  --color-text-primary: #ffffff;
  --color-text-secondary: #a1a1aa; /* Zinc 400 */
  --color-text-tertiary: #71717a; /* Zinc 500 */

  /* Borders */
  --color-border-subtle: rgb(255 255 255 / 0.1);

  /* Primary Accent: Electric Cyan */
  --color-accent-50: #ecfeff;
  --color-accent-100: #cffafe;
  --color-accent-200: #a5f3fc;
  --color-accent-300: #67e8f9;
  --color-accent-400: #22d3ee; /* Primary Action / Core Cyan */
  --color-accent-500: #06b6d4;
  --color-accent-600: #0891b2;
  --color-accent-700: #0e7490;
  --color-accent-800: #155e75;
  --color-accent-900: #164e63;
  --color-accent-950: #083344;

  /* ========================================= */
  /* TYPOGRAPHY                                */
  /* ========================================= */

  --font-sans: 'Inter', 'Roboto', 'Helvetica Neue', sans-serif;
  --font-headline: 'Outfit', 'Inter', sans-serif;
  --font-mono:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
    monospace;

  /* ========================================= */
  /* EFFECTS & SHADOWS                         */
  /* ========================================= */

  /* Subtle glow for active states */
  --shadow-glow-accent: 0 0 15px rgba(34, 211, 238, 0.4);
}
```

---

## 🏃 Framer Motion Animation Variants

Use these standardized Framer Motion variants for consistent, spring-based interactions across all components.

```typescript
// src/lib/motion.ts
import { Variants } from 'framer-motion';

/**
 * Standard spring transition for layout changes and hovers.
 * Hardware-accelerated and smooth.
 */
export const springTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 20,
};

/**
 * Workout Cards and interactive surface hover states.
 */
export const cardHover: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: springTransition,
  },
  tap: {
    scale: 0.98,
    transition: { type: 'spring', stiffness: 400, damping: 15 },
  },
};

/**
 * Primary action buttons hover states (with subtle glow).
 */
export const buttonHover: Variants = {
  initial: { scale: 1, boxShadow: 'none' },
  hover: {
    scale: 1.05,
    boxShadow: '0 0 15px rgba(34, 211, 238, 0.4)', // Electric Cyan glow
    transition: springTransition,
  },
  tap: { scale: 0.95 },
};

/**
 * Page and content fade-in animations.
 */
export const fadeIn: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};
```

---

## 📐 Layout & Spacing Rules

Adhere strictly to these parameters when building components with `shadcn/ui` and Tailwind.

### Component Styling

| Element                | Tailwind Class                | Description                                           |
| :--------------------- | :---------------------------- | :---------------------------------------------------- |
| **Cards / Containers** | `rounded-xl`                  | Standard modern corner radius for all main surfaces.  |
| **Buttons / Badges**   | `rounded-md`                  | Subtly rounded for interactive actions and tags.      |
| **Borders**            | `border border-white/10`      | Subtle, clean separation without being harsh.         |
| **Glassmorphism**      | `bg-white/5 backdrop-blur-md` | Reserved for floating nav bars or overlays.           |

### Typography Guidelines

| Text Type               | Font Family | Tailwind Classes                           | Description                                                  |
| :---------------------- | :---------- | :----------------------------------------- | :----------------------------------------------------------- |
| **Body Text**           | Inter       | `font-body`                                | Standard body text, buttons, labels, metadata.               |
| **Headlines**           | Outfit      | `font-headline font-extrabold tracking-tight` | Large headings, section titles, hero text.               |
| **Metrics & Numbers**   | Mono        | `font-mono font-bold tracking-tight`       | BPM, Kcal, Duration, Sets/Reps. High legibility.             |
| **Secondary Text**      | Inter       | `text-zinc-400 font-medium`                | Labels, descriptions, tertiary info.                         |

---
