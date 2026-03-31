# Next.js UI Engineering

## Scope
This skill defines the architectural rules for writing components, pages, and layouts in the Next.js 15 (App Router) environment for the frontend of Aegis Fitness OS.

## 1. Component Boundaries
- The project default is `Server Components`.
- You MUST explicitly include `"use client";` at the exact top of the file *only* if the component requires:
    - `useState`, `useEffect`, `useRef`, or `useContext`
    - Browser APIs (`window`, `document`)
    - Event listeners (`onClick`, `onChange`)
- Whenever possible, fetch data on the server and pass it down as props to client components to reduce client-side JavaScript payloads.

## 2. Tailwind V4 & Styling
- This project utilizes Tailwind CSS v4. Standard Tailwind v3 arbitrary values may require testing.
- Rely on modern spacing, fluid typography scaling, and Grid/Flex layouts. Never use float or legacy tabular layouts.
- **Glassmorphism:** To create our premium cards, combine background color opacity with backdrop-blur. 
  Example: `bg-slate-900/60 backdrop-blur-md border border-slate-800`.
- **Micro-Animations:** Enhance interactivity using the `group` class and transition utilities.
  Example: `group-hover:translate-x-1 transition-all duration-300 ease-in-out`.
- Refer to ▶️ @.agents/rules/aegis-design.md before generating complex color palettes.

## 3. Form Handling
- For input states and validations, use standard React-hook-form bindings gracefully tied to Zod validation states.
- Always display explicit error messages below the input fields in a subtle `text-red-400`.
- Icons should utilize `lucide-react`. Ensure appropriate strokewidth and sizing matching the font scaling.

## 4. Deep Context Technical Manuals
When architecting complex UI layouts or performance-intensive animations, consult:
▶️ @docs/tech_stack/Tailwind CSS v4 Deep Dive.md
▶️ @docs/tech_stack/Framer Motion_ Next.js Performance Mastery.md
