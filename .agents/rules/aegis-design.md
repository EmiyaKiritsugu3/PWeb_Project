# Aegis OS Design Guidelines

## Core Identity
Aegis OS is a premium dark-mode application. The visual language conveys modern, high-performance, and secure fitness operations.
- **Electric Cyan/Blue accents:** Used for primary CTAs and active states.
- **Deep Blacks/Grays:** Used for background and surface elevation.
- **Glassmorphism:** Subdued blurs with subtle borders for cards and nav.

## Rules
- When generating React components, always default to a dark background string like `bg-slate-950` or `bg-neutral-900`.
- Use Framer Motion or Tailwind's `transition-all` with custom durations (`duration-300` or `duration-500`) for all state changes (hover, focus, active).
- Never use plain browser default colors (`blue-500`) without intentional context. Rely on the defined custom tokens in CSS or carefully curated Tailwind shades (e.g., `cyan-400` to `blue-500` gradients).
- For forms and inputs, focus rings should be glowing and distinct.
