# **Google Stitch and MCP SDK: The Definitive Architectural Encyclopedia and AI Execution Manual**

## **1\. The Foundation & Paradigm Shift (From Mockups to AI Generation)**

The architectural discipline of software engineering has historically been constrained by an impedance mismatch between human-centric visual design tooling and machine-readable execution environments. The traditional product development lifecycle requires a highly lossy translation phase where semantic visual intent, codified in static vector tools like Figma, must be imperatively reconstructed into Document Object Model (DOM) nodes, Cascading Style Sheets (CSS), and JavaScript logic by human developers. The introduction of Google Stitch, engineered upon the multimodal reasoning capabilities of the Gemini 3 Pro and Gemini 3.1 Pro large language models, fundamentally obliterates this bottleneck.1 Stitch operates as an AI-native software design canvas, instantiating a direct, machine-executable bridge between natural language descriptions, reference imagery, and production-ready frontend code.2

### **The Mental Model: "Vibe Designing" vs. Imperative UI Coding**

Imperative user interface (UI) coding dictates that the developer must manually author and orchestrate the underlying syntax. This requires explicitly defining the structural hierarchy (e.g., nesting HTML \<div\> elements), mathematically calculating viewport-specific breakpoints for responsive behavior, and managing the intricate cascading rules of CSS. It is a deterministic, low-level execution process. In stark contrast, "Vibe Designing" represents a declarative, aesthetic-first abstraction layer that leverages the latent space of advanced neural networks to synthesize these low-level implementations from high-level semantic directives.5

When an autonomous AI agent or human operator utilizes Stitch—particularly within specialized operational modes like Nano Banana Pro—the generation engine operates on a conceptual algorithmic formula: Idea \+ Theme \+ Content \+ Image.2 Rather than instructing the system to construct a flexbox container with specific padding and hexadecimal background colors, the architectural director issues a holistic environmental command. For example, an agent might request a dashboard utilizing a "Bento Grid layout, Glassmorphism surfacing, and Y2K typography".2 The underlying Gemini model ingests this semantic "vibe," cross-references it against its vast training corpus of UI/UX patterns, and autonomously synthesizes the raw, high-fidelity HTML and CSS necessary to manifest that aesthetic trajectory.1 This paradigm shift demands that AI coding agents completely abandon the mental model of assembling isolated, atomized components. Instead, agents must conceptualize applications as continuous visual environments governed by strict, tokenized design systems.9 The agent's primary function evolves from syntax generation to architectural orchestration, focusing on the fluid multimodal loop of generation, visual critique, and structural refinement.2

### **The Stitch MCP SDK: The Secure Execution Bridge**

While the standalone Google Stitch web interface is highly capable for human operators, its true enterprise utility is unlocked via the Model Context Protocol (MCP). The MCP establishes a standardized, bidirectional remote procedure call (RPC) architecture that allows autonomous AI coding agents—such as Antigravity, Claude Code, or Cursor—to securely interface with the remote Stitch generation engine from within a local Integrated Development Environment (IDE).10 By installing the @google/stitch-sdk and configuring a secure API key generated via the Stitch web portal, the agent binds its local context window directly to the remote AI design canvas.1

This integration fundamentally alters the agent's capability matrix. Rather than attempting to hallucinate complex JSX code from a blank slate, the agent utilizes the Stitch MCP to execute deterministic API calls that offload the visual generation to specialized Gemini design models. The MCP bridge provides the AI with real-time context and a robust suite of execution capabilities, transforming the IDE into an agent-first development environment.12 The following table delineates the core MCP tools exposed to the agent and their architectural purpose within the autonomous generation loop.

| MCP Tool Designation | Architectural Purpose and Execution Parameters | Network Payload Outcome |
| :---- | :---- | :---- |
| create\_project | Initializes a discrete, isolated temporal workspace within the Stitch cloud infrastructure. Requires a name, description, and surface type (WEB or APP) to optimize for scrolling behaviors.1 | Returns a unique project\_id string required for all subsequent contextual generation requests.1 |
| generate\_screen\_from\_text | Invokes the primary Gemini model to synthesize a complete UI view based on a highly structured prompt. Ingests layout, styling, and structural constraints.1 | Generates a new screen\_id and renders a remote high-fidelity UI representation.1 |
| edit\_screen | Executes surgical, localized DOM mutations or stylistic adjustments on an existing screen without collapsing the surrounding architectural hierarchy.1 | Overwrites the current screen\_id state with the requested targeted refinements.1 |
| generate\_variants | Utilizes the creative range algorithmic slider (e.g., EXPLORE vs REFINE) to output parallel aesthetic permutations targeting specific aspects like LAYOUT or COLOR\_SCHEME.1 | Returns an array of alternative screen\_id identifiers for A/B testing or visual exploration.1 |
| get\_screen | Retrieves the final, rendered artifacts from the remote workspace. This is the critical extraction mechanism for pulling generated assets into the local repository.1 | Returns the raw, synthesized HTML payload and a URL link to the generated screenshot for visual validation.1 |

Through this standardized bridge, an autonomous agent operating within the Antigravity IDE can seamlessly execute a prompt, command the Stitch MCP server to instantiate the design, fetch the resulting "Design DNA" via get\_screen, and subsequently scaffold a pixel-perfect, highly optimized Next.js 15 application natively on the host machine.12 This bypasses the need for manual asset export or the tedious extraction of typographic scales and hexadecimal codes.12

## **2\. Enterprise-Grade Design Architecture (The DESIGN.md Standard)**

When deploying autonomous AI agents at an enterprise scale, the most critical failure vector is generative inconsistency. Because Large Language Models operate statelessly across isolated inference events, requesting a "login screen" followed by a "dashboard screen" in two separate generate\_screen\_from\_text calls will invariably result in divergent outputs. The Gemini model, lacking a persistent anchor, will hallucinate differing color palettes, conflicting typography scales, and incongruous spatial relationships.9 To engineer a robust multi-page application, the agent must enforce an absolute, cryptographic-level visual contract prior to generation. This is achieved exclusively through the strict implementation of the DESIGN.md standard.9

### **The Absolute Necessity of the DESIGN.md Baseline**

The DESIGN.md file must never be conceptualized as a human-readable brand guideline document; rather, it functions as a machine-readable, strictly formatted design system manifest.9 Placed within the root directory of the repository (frequently managed under a .stitch/ hidden directory), this document serves as the definitive source of truth that the AI agent must programmatically inject into the context window prior to executing any UI generation commands.1

Traditional design systems, maintained within complex platforms like Figma or documented in Storybook, are engineered for human consumption, containing extensive rationale, UX philosophies, and behavioral guidelines.9 The DESIGN.md specification discards this prose entirely. It represents the distilled, executable subset of those rules, optimizing strictly for the mechanical ingestion of token-level parameters by an AI model.9 The success of the Stitch generation relies heavily on the precision of these definitions. Vague, qualitative descriptors—such as "a soft, trustworthy blue that feels corporate yet friendly" or "slightly rounded corners"—are strictly prohibited, as they introduce unacceptable variance into the latent space.9 Instead, the agent must define parameters with mathematical exactitude.

To establish this baseline, the agent leverages the @google-labs-code/stitch-skills repository, specifically invoking the design-md skill via the command npx skills add google-labs-code/stitch-skills \--skill design-md \--global.11 This skill analyzes existing project context to generate the comprehensive file, utilizing semantic language optimized explicitly for the Stitch generation engine.11 A compliant DESIGN.md file must rigidly adhere to a categorized structure that defines the entire visual language of the application.

| Design System Category | Required Token Precision | Executable AI Context Representation |
| :---- | :---- | :---- |
| **Color Palette Architecture** | Semantic functional names mapping to exact hexadecimal or modern oklch() values. Must define primary, secondary, background, surface, and semantic (error, warning, success) tokens.9 | Primary: \#1A73E8; Surface-Elevated: \#FFFFFF; Text-Secondary: \#5F6368; Border-Divider: \#E0E0E0; Error: \#D32F2F |
| **Typographic Hierarchy** | Primary and fallback font families. Explicit type scales delineating font size (in pixels or rems), font weight (numerical), line height, and letter spacing for every heading and body variant.9 | Font-Family: Inter, sans-serif; Heading-1: 32px, 700 weight, \-0.02em spacing; Body-Base: 16px, 400 weight, 1.5 line-height |
| **Spatial and Layout Mechanics** | Definition of the underlying baseline grid unit (typically 4px or 8px). Approved spacing increments. Explicit definition of container widths and responsive viewport breakpoints.9 | Base Unit: 8px; Scale: 4, 8, 16, 24, 32, 48px; Max-Container: 1280px; MD-Breakpoint: 768px; Grid-Columns: 12 |
| **Component Geometry** | Mathematical definitions for border radii applied to specific elements (buttons, cards, inputs). Shadow elevation matrix defining spread, blur, and opacity.9 | Button-Radius: 8px; Card-Radius: 16px; Elevation-High: 0 10px 15px \-3px rgba(0,0,0,0.1); Input-Border: 1px solid \#CCC |

By systematically parsing and appending this file to the prompt payload, the AI agent forcefully constrains the Gemini model's output. The DESIGN.md acts as an unbreakable boundary, guaranteeing that all generated raw HTML strictly complies with the established visual architecture, regardless of how many individual screens are sequentially requested.1

### **Translating Raw Output to Next.js 15 and Tailwind v4**

The generation of high-fidelity HTML and CSS via the Stitch MCP represents only the first phase of the autonomous workflow. The critical architectural challenge lies in the extraction and transformation phase. Once the agent executes the get\_screen tool 1, it receives a flat, monolithic HTML string. This output is entirely devoid of component logic, state management, or routing capabilities. The AI agent must subsequently execute a sophisticated Abstract Syntax Tree (AST) traversal and transformation algorithm to convert this raw output into a strictly typed, modular Next.js 15 application utilizing React Server Components (RSC) and the highly modernized Tailwind CSS v4 framework.

This complex transformation relies heavily on the procedural logic encapsulated within the react:components skill (found within the stitch-skills repository).11 This specialized skill is engineered to convert static Stitch screens into modular Vite or Next.js React components, emphasizing validated structures, data contract extraction, and exact alignment with target style systems.16 To execute this translation flawlessly within a Next.js 15 environment, the agent must orchestrate several precise architectural transitions.

First, the agent must align the project with Tailwind v4's radically altered configuration paradigm. Tailwind v4 abandons the traditional, JavaScript-heavy tailwind.config.js file in favor of a CSS-first, zero-configuration architecture built upon the high-performance Lightning CSS engine.18 The agent must autonomously read the previously established DESIGN.md file and map the explicit token values directly into the Next.js app/globals.css file using the newly introduced @theme block directive.18 Because Tailwind v4 exposes all theme values as native CSS variables, the agent must translate hexadecimal tokens into wide-gamut formats if necessary, writing configurations such as \--color-brand-primary: oklch(50% 0.2 250); directly into the CSS file.18 This enables the seamless use of custom utility classes like text-brand-primary throughout the generated React codebase.

Following the configuration of the styling engine, the agent initiates the AST traversal of the raw Stitch HTML. The monolithic code block is systematically disassembled. The agent identifies repeating visual patterns—such as navigation bars, user profile cards, and data tables—and surgically extracts them into discrete, reusable Next.js components, generating corresponding TypeScript prop interfaces (interface CardProps { title: string; children: React.ReactNode; }) to ensure strict type safety.16 During this process, standard HTML attributes like class and for are transformed into their React-compliant counterparts (className, htmlFor), and static text values are parameterized into data bindings.16

Crucially, the agent must navigate the architectural complexities of Next.js 15's App Router. The default assumption for all generated code must be the React Server Component (RSC) execution context, optimizing for zero client-side JavaScript bundling. The AI must algorithmically scan the component tree for any nodes requiring browser APIs, interactivity (such as onClick or onChange handlers), or React lifecycle hooks (useState, useEffect).19 Only upon detecting these specific interactive requirements will the agent inject the "use client"; directive at the absolute lowest necessary leaf node, thereby preserving the performance benefits of server-side rendering for the majority of the UI tree. Finally, the agent must map complex state changes mocked up in the Stitch design to Tailwind v4's advanced, composable state variants, leveraging modern CSS capabilities like group-has-\* or peer-not-data-active:\* to manage interactive styling without requiring heavy JavaScript logic.18

## **3\. Extreme Prompting & Advanced Optimization**

To yield deterministic, production-ready artifacts from the Google Stitch engine, AI agents must discard conversational, ambiguous, or poorly structured natural language requests. The system demands extreme prompt engineering techniques that strictly constrain the latent space of the generation model. The paramount methodology for achieving this level of control is the "Zoom-Out-Zoom-In" framework, a highly systematized prompt-writing structure that de-risks the UI generation process by anchoring the AI in high-level macroeconomic context before enforcing granular, node-level structural requirements.20

### **The "Zoom-Out-Zoom-In" Framework Mechanics**

This framework overcomes the "blank-canvas problem" by preventing the Gemini model from hallucinating fundamental product assumptions.23 An autonomous AI agent must programmatically compile its generation payloads into this exact seven-stage hierarchy prior to invoking the generate\_screen\_from\_text tool. Deviation from this structure results in high variability and elevated failure rates in the resulting HTML output.

1. **Context (Zoom-Out):** The payload must initiate by establishing the overarching domain ontology and the macroeconomic purpose of the software product.23 For example, the agent states, "A multi-tenant SaaS platform focused on asynchronous financial compliance monitoring and audit logging." This grounds the model's semantic understanding, ensuring it pulls from appropriate UI pattern libraries.23  
2. **User (Zoom-Out):** The agent defines the target demographic, their behavioral patterns, and their environmental constraints.23 Stating, "Senior financial auditors reviewing thousands of transaction rows on high-resolution desktop monitors under severe time constraints," implicitly commands the AI to prioritize high data density, avoid unnecessary whitespace, and ensure maximum contrast ratios for prolonged viewing.23  
3. **Goal of the Screen (Zoom-In):** The prompt narrows focus to the specific conversion objective or data-consumption mandate of the target page.23 For example, "Enable the user to instantly identify fraudulent transaction anomalies, view real-time API ingestion health, and approve or freeze user accounts." This defines the functional hierarchy.23  
4. **Layout Hierarchy (Zoom-In):** The agent imposes the macro-structural DOM architecture. It dictates spatial relationships with precision: "Implement a persistent left-hand navigation sidebar (250px fixed width), a sticky global header containing search functionality, and a primary content area utilizing a 3-column masonry CSS grid layout".23  
5. **Components (Zoom-In):** The payload explicitly lists the required functional widgets and interaction targets. This constraint explicitly prevents the model from hallucinating unnecessary decorative elements. "Include a data table with sortable column headers and pagination controls, three metric summary cards with trend-line spark charts, and a secondary action dropdown menu".23  
6. **Visual Direction (Zoom-In):** The agent injects the aesthetic directives, reinforcing the tokens established in the DESIGN.md file. "Adhere strictly to a clinical, minimalist aesthetic optimized for glanceability. Utilize light mode surface variables, neutral gray dividers, and limit primary brand colors strictly to actionable primary buttons".23  
7. **Constraints (Strict Bounds):** The final stage establishes the unbreakable rules for the generation engine. "Do not render a global footer. Ensure all text contrast ratios strictly meet or exceed WCAG 2.1 AA accessibility standards. Optimize layout for one-handed thumb reachability if viewed on a mobile viewport".23

By enforcing this rigorous structure, the agent provides the Stitch AI with a flawless conceptual blueprint, dramatically increasing the probability that the initial generate\_screen\_from\_text response will be structurally sound and visually coherent.23

### **The Strategy for Iterative Refinement**

Despite the efficacy of the Zoom-Out-Zoom-In framework, generating complex enterprise interfaces rarely yields absolute perfection on the first inference. A critical failure point for novice AI agents is attempting to execute sweeping architectural modifications and granular padding adjustments simultaneously within a single, overloaded follow-up prompt. The underlying architecture of the Stitch MCP dictates a strategy of highly targeted, incremental iterative refinement, primarily utilizing the edit\_screen tool.1

When the autonomous agent evaluates the generated Stitch UI against its internal requirements and detects a discrepancy, it must execute specific, isolated edits. The agent is required to limit the scope of change to a single vector per API call. If the generated layout is structurally correct but the visual hierarchy lacks necessary depth, the agent must issue an edit\_screen command focused entirely on elevation mapping: "Target the pricing tier table. Emphasize the 'Pro' middle card by increasing its container height, applying the Elevation-High drop shadow token from the DESIGN.md, and reducing the opacity of the sibling 'Basic' and 'Enterprise' cards".2

By artificially restricting the prompt's scope during an edit\_screen execution, the model successfully preserves the mathematical integrity of the surrounding DOM architecture while surgically mutating the targeted nodes. Conversely, overloading a refinement prompt (e.g., "Change the background color, convert the table to a list, and make the font bigger") will frequently cause the model's attention mechanism to collapse, resulting in the destruction of the previously established layout. Furthermore, for exploratory modifications, the agent should programmatically leverage the generate\_variants tool, specifically targeting isolated aspects such as or while setting the creative range to EXPLORE. This allows the agent to synthesize up to five parallel permutations simultaneously without permanently destroying the baseline design state, enabling rapid A/B evaluation before finalizing the code extraction.1

## **4\. Anti-Patterns & Deadly Traps (Strict Constraints)**

The integration of advanced AI models into the software engineering pipeline introduces unprecedented velocity, but it simultaneously exposes the architecture to novel failure modes. Autonomous AI agents, particularly those driven by generalized LLMs, exhibit a persistent tendency to over-optimize code, hallucinate capabilities beyond the scope of their provided tools, or fundamentally misunderstand the boundaries between design generation and code execution. When orchestrating Google Stitch via the MCP SDK for a local Next.js 15 environment, several deadly anti-patterns emerge. These operational traps must be strictly coded out of the agent's behavioral logic; failure to do so guarantees the generation of malformed code, broken hydration boundaries, and unmaintainable technical debt.

### **Trap 1: The Inconsistent Navbar/Footer Trap**

The most pervasive error encountered during multi-page generation is the hallucination of shared global elements. When an agent sequentially executes generate\_screen\_from\_text for a "Home Page," followed immediately by an execution for a "Dashboard Page," Stitch evaluates each request as a discrete, isolated inference event.1 Consequently, the generative model will frequently output slightly divergent variations of the global navigation bar and footer across the two payloads—altering padding values, swapping icon sets, or modifying link structures.

* **The Mitigation Strategy:** The autonomous agent must never rely upon the Stitch engine to maintain perfect structural continuity of shared layout components across multiple distinct screen generations. The architectural mandate requires the agent to generate a primary, foundational layout screen first. The agent must then utilize AST traversal to extract the \<nav\>, \<aside\>, and \<footer\> HTML nodes, converting them directly into a Next.js 15 app/layout.tsx Server Component. For all subsequent page generation requests, the agent's prompt must include a rigid negative constraint: "Do not render global navigation bars, sidebars, or footers. Generate strictly the inner main content boundary." The output from these subsequent calls is then mapped exclusively to individual page.tsx views, ensuring the Next.js routing system handles the global layout natively.19

### **Trap 2: Omitting Responsive Constraints**

Google Stitch, by default, optimizes its generation targeting either a specific viewport (MOBILE, DESKTOP, TABLET) or an AGNOSTIC rendering approach if not explicitly constrained by the prompt payload.1 If an agent requests a complex, multi-column dashboard without explicit viewport directives, Stitch will likely return a desktop-optimized layout heavily reliant on fixed pixel widths or rigid CSS grids. When this code is extracted and processed, it completely breaks the foundational mobile-first responsive paradigm enforced by Tailwind v4.

* **The Mitigation Strategy:** The agent must forcefully inject responsive constraints into the "Constraints" layer of the Zoom-Out-Zoom-In framework. The prompt must explicitly command: "Architect this interface utilizing a strict mobile-first design philosophy. Ensure all multi-column CSS grid structures gracefully collapse to a single-column flex layout on mobile viewports. Utilize responsive utility classes exclusively." Following the extraction via get\_screen, the agent must run a programmatic regex or AST validation step to confirm the existence of Tailwind v4 responsive prefixes (e.g., md:, lg:) within the className attributes before committing the code to the Next.js file system.18

### **Trap 3: Expecting Next.js 15 Execution Logic from Stitch**

A critical and highly destructive anti-pattern is prompting Google Stitch to write functional React Server Components, manage Next.js file-system routing parameters, or implement asynchronous data hydration logic. Stitch is fundamentally an AI-native design canvas; its generated payload is strictly limited to high-fidelity HTML, cascading stylesheets, and structural design tokens.1 It does not execute JavaScript logic, it is entirely unaware of React component lifecycles, and it cannot synthesize backend functionality.

* **The Mitigation Strategy:** The agent must treat the Stitch engine strictly as the visual and structural formatting layer. The agent must NEVER pollute a Stitch prompt with commands such as "Create a Next.js 15 Server Component that fetches data from an external API." Instead, the agent instructs Stitch to generate the static visual representation of the loading state and the populated data table. Once the raw HTML is extracted via get\_screen 1, the agent assumes full control locally, autonomously authoring the async/await fetch logic, implementing React state (useState), and establishing client-side routing (next/link) within its own IDE environment, utilizing tools like the Gemini API or Claude to finalize the JavaScript execution layer.19

### **Trap 4: Sweeping Layout Changes via edit\_screen**

The edit\_screen MCP tool is engineered for localized DOM mutations. However, agents frequently misinterpret its capability, issuing massive structural redesign commands such as "Change the entire application theme to dark mode, remove the sidebar, and convert the main grid into a vertical list." Executing this command forces the underlying Gemini model to attempt a complete recreation of the layout while constrained by the existing AST. This inevitably causes the DOM hierarchy to collapse, resulting in malformed HTML output containing deeply nested, broken \<div\> tags and nonsensical Tailwind utility combinations.

* **The Mitigation Strategy:** The agent must restrict the use of edit\_screen strictly to non-destructive, localized mutations (e.g., altering padding on a specific button, changing text content, or updating a singular color token).1 Any request requiring macroscopic changes to the layout architecture demands a full generate\_screen\_from\_text execution to establish a new, clean AST base, or the utilization of the generate\_variants tool specifically targeting the LAYOUT aspect to safely explore structural permutations.1

### **Trap 5: Failure to Decouple Hardcoded Mock Data**

Because Stitch operates as a design engine, the HTML it generates is populated entirely with static, hardcoded placeholder data (e.g., "John Doe", "$1,234.56", "Lorem ipsum"). If an agent blindly converts this raw HTML into React components without decoupling the data layer, the resulting application is inherently unscalable and tightly coupled to the placeholder content.

* **The Mitigation Strategy:** Adhering to the philosophy of the react:components skill 16, the agent must execute a post-processing decoupling algorithm. During the AST traversal, the agent identifies nodes containing static content. It must systematically extract these hardcoded strings and replace them with dynamic React props (e.g., replacing "John Doe" with {user.fullName}). The agent then synthesizes external mock data files or TypeScript interfaces to represent the expected data shape, ensuring a clean separation of concerns between the visual presentation layer generated by Stitch and the logical data layer managed by Next.js.11

## **5\. State-of-the-Art Agent Workflows (10 High-Density Examples)**

To programmatically execute the complex design-to-code pipeline efficiently, an autonomous AI agent must utilize highly structured MCP tool calls coupled with precise algorithmic logic. The following ten workflows represent the elite, state-of-the-art standards for orchestrating the Google Stitch engine within an autonomous Next.js 15 development loop. These examples detail the exact API payloads, necessary agent preprocessing, and expected architectural outcomes.

### **Domain 1: Project & Context Initialization**

**Example 1: Foundational Project Creation Workspace Setup**

Applicability Rule: Use this foundational create\_project tool call to initialize an isolated temporal workspace within the Stitch cloud infrastructure prior to generating any screens, ensuring all generated assets and variants are logically bound to a single context window.

JSON

// MCP Tool Execution Payload: create\_project  
{  
  "name": "Acme Corp Next-Gen Landing Page",  
  "description": "High-conversion marketing site for Acme Corp focusing on enterprise software solutions",  
  "surface\_type": "WEB"   
}

*Architectural Commentary:* The payload specifies surface\_type: "WEB". This critical parameter alters the underlying generation engine's heuristics, optimizing the output for multi-column CSS grids, expansive horizontal sprawl, and desktop-first viewing patterns, as opposed to the vertical scrolling and bottom-aligned navigation prioritized by the APP surface type.1 The agent must capture the returned project\_id string and append it to all subsequent tool executions to maintain session continuity.1

**Example 2: Enterprise DESIGN.md Cryptographic Generation**

Applicability Rule: Use this workflow to autonomously author and save the DESIGN.md manifest to the local file system (e.g., .stitch/DESIGN.md) prior to any UI generation, cementing the unbreakable visual contract that governs the Gemini model.

// Local File Generation:.stitch/DESIGN.md

## **Colors**

* Brand-Primary: oklch(50% 0.2 250\)  
* Surface-Base: oklch(98% 0.01 250\)  
* Surface-Elevated: oklch(100% 0 0\)  
* Text-Primary: oklch(20% 0.05 250\)

## **Typography**

* Font-Family: Inter, ui-sans-serif, system-ui  
* Heading-1: 3rem, 700 weight, \-0.02em tracking  
* Body-Base: 1rem, 400 weight, 1.5 leading

## **Spacing & Components**

* Base Unit: 8px  
* Container-Max: 1280px  
* Card-Border-Radius: 12px  
* Base-Shadow: 0 4px 6px \-1px rgb(0 0 0 / 0.1), 0 2px 4px \-2px rgb(0 0 0 / 0.1) *Architectural Commentary:* This explicit markup eliminates all generative ambiguity. The agent utilizes modern OKLCH color spaces to ensure wide-gamut compatibility.18 Following the generation of this file via the design-md skill 11, the agent executes a local file system write operation to map these exact cryptographic tokens into the Next.js 15 app/globals.css file, utilizing the Tailwind v4 @theme directive (e.g., \--color-brand-primary: oklch(50% 0.2 250);) to establish the application's core CSS variable structure.18

### **Domain 2: The Master Prompt (Zoom-Out-Zoom-In)**

**Example 3: Foundational UI Form Generation**

Applicability Rule: Use this densely structured prompt payload within generate\_screen\_from\_text when scaffolding a standard, single-purpose interactive component, such as an authentication portal or data entry form.

JSON

// MCP Tool Execution Payload: generate\_screen\_from\_text  
{  
  "project\_id": "proj\_123abc",  
  "prompt": "Context: Secure portal for a B2B SaaS application. User: Enterprise IT administrators requiring rapid access. Goal: Frictionless and secure user authentication. Layout: A perfectly centered flexbox container occupying 100vh viewport height against a subtle gradient background. Components: Form container with email input field, password input field with visibility toggle, two primary SSO OAuth buttons (Google, Microsoft), and a highly prominent primary submit button. Visual Direction: Minimalist, corporate-trust aesthetic. Constraints: Adhere strictly to the color and typography tokens defined in DESIGN.md. Ensure fully responsive mobile scaling."  
}

*Architectural Commentary:* This prompt executes the full Zoom-Out-Zoom-In framework.23 By explicitly defining the layout as a centered flexbox container and dictating the exact required inputs, the agent prevents the AI from hallucinating unnecessary promotional banners or complex navigation trees that often clutter generic login screen requests.

**Example 4: Enterprise Dashboard Complex Architecture Generation**

Applicability Rule: Use this exhaustive, mathematically precise prompt when generating highly complex, data-dense interfaces that demand strict grid structures, hierarchical component layout, and high information density.

JSON

// MCP Tool Execution Payload: generate\_screen\_from\_text  
{  
  "project\_id": "proj\_123abc",  
  "prompt": "Context: Real-time financial compliance and audit monitoring platform. User: Compliance officers requiring extreme information density and immediate anomaly detection. Goal: Visualize transaction volume and flag fraudulent activity. Layout: A strict CSS Grid architecture featuring a 250px fixed-width left navigation sidebar, a 64px tall top sticky header containing global search, and a fluid main content area. Components: Top row containing four KPI summary cards with trend-line spark charts. Middle row featuring a large, expansive area chart visualizing transaction volume over time. Bottom row containing a detailed data table with sortable headers, pagination controls, and color-coded status badges. Visual Direction: Nano Banana Pro aesthetic. High contrast, monochrome data visualizations utilizing the Surface-Elevated token for all card backgrounds and strictly applying the Error/Success tokens from DESIGN.md for status indicators. Constraints: Strict adherence to DESIGN.md. Do not render global footers. Ensure the data table implements horizontal scrolling overflow on viewports under 768px."  
}

*Architectural Commentary:* This enterprise prompt leverages the Nano Banana Pro mode 2 to enforce a highly specific "vibe." It dictates precise pixel dimensions for structural elements to guarantee a stable layout foundation, enabling the agent to later extract the sidebar and header directly into a Next.js layout.tsx Server Component without layout shift.19

### **Domain 3: Iterative Editing**

**Example 5: Foundational Single-Vector Token Adjustment**

Applicability Rule: Use this targeted edit\_screen prompt ONLY when adjusting a specific component's visual token (such as color mapping, typography weight, or padding), explicitly avoiding layout-breaking, sweeping structural changes.

JSON

// MCP Tool Execution Payload: edit\_screen  
{  
  "screen\_id": "scr\_456def",  
  "prompt": "Target the primary 'Submit' button located within the authentication form container. Change its background color from the current gray to the 'Brand-Primary' token defined in the DESIGN.md context. Increase the horizontal padding (px) to 24px and the vertical padding (py) to 12px to improve the interaction target area."  
}

*Architectural Commentary:* The agent isolates a single DOM node (the submit button) and provides exact mutation parameters. Because the requested changes involve only CSS class replacement, the Stitch engine alters the necessary utility strings without recalculating the underlying DOM hierarchy.1

**Example 6: Enterprise Internal Structural Re-Flow**

Applicability Rule: Use this highly constrained edit\_screen prompt to manipulate the internal spatial layout of a specific parent container without altering the external, page-level DOM flow.

JSON

// MCP Tool Execution Payload: edit\_screen  
{  
  "screen\_id": "scr\_789ghi",  
  "prompt": "Target the four KPI summary cards located in the top row of the dashboard. Convert their internal layout structure from a vertical stack (flex-col) to a horizontal, space-between row (flex-row justify-between). Ensure the trend-line spark chart aligns to the far right, while the metric value typography remains anchored to the left. Do not alter or collapse the overarching CSS Grid layout of the main page; restrict changes solely to the interior of the KPI cards."  
}

*Architectural Commentary:* This prompt represents the maximum safe operational limit of the edit\_screen tool. The agent explicitly commands the AI to respect the boundary of the edit\_screen scope by defining negative constraints ("Do not alter... overarching CSS Grid layout"). This prevents the model's attention mechanism from accidentally re-rendering the sidebar or header during the update.1

### **Domain 4: Code Extraction & Next.js Conversion**

**Example 7: Foundational Payload Extraction**

Applicability Rule: Use the get\_screen tool to programmatically retrieve the final generated artifacts from the Google Stitch cloud infrastructure once all iterative visual design loops are concluded.

JavaScript

// MCP Tool Execution via Agent Logic  
const screenData \= await mcp.callTool("get\_screen", { screen\_id: "scr\_123" });  
// screenData.html contains the raw HTML/Tailwind payload  
// screenData.image\_url contains the screenshot for visual validation 

// Agent executes regex validation to confirm response integrity  
if (\!screenData.html.includes("class=")) {  
   throw new Error("Invalid HTML payload received from Stitch MCP.");  
}

*Architectural Commentary:* This operation pulls the raw representation from the cloud. The agent utilizes the provided image\_url to run internal computer vision validations or present a "Vibe Check" to the human operator via the Antigravity integrated browser before committing the code.12

**Example 8: Enterprise RSC AST Conversion Pipeline**

Applicability Rule: Execute this internal logic loop immediately following get\_screen to sanitize Stitch's raw HTML, map it to the Tailwind v4 framework, and scaffold a strictly typed, modular Next.js 15 React Server Component.16

TypeScript

// AI Agent Internal AST Transformation Algorithm  
1\. Parse raw HTML string from Stitch into a workable Abstract Syntax Tree (AST).  
2\. Execute global substitution: transform \`class=\` to \`className=\`, \`for=\` to \`htmlFor=\`.  
3\. Traverse AST to locate inline \`\<svg\>\` elements; extract them into distinct reusable components (e.g., \`components/icons/TrendUpIcon.tsx\`) to reduce DOM bloat.  
4\. Locate all standard \`\<a\>\` anchor tags; replace them with Next.js \`\<Link href="..."\>\` components to preserve the App Router client-side cache and prevent full page reloads.\[19\]  
5\. Validate extracted Tailwind classes against the \`@theme\` variables injected into \`app/globals.css\`, resolving any mismatched arbitrary values (e.g., converting \`bg-\[\#1A73E8\]\` to \`bg-brand-primary\`).\[18\]  
6\. Write the sanitized React element tree to \`app/(dashboard)/compliance/page.tsx\`.  
7\. Analyze tree for interactivity (onClick, onChange). If found, inject \`"use client";\` at the file header to explicitly define the Client Component boundary.

*Architectural Commentary:* This workflow details the exact programmatic steps the react:components skill executes.16 The agent must act as a transpiler, converting static markup into dynamic, performant React code that adheres to Next.js 15 server-first routing paradigms.19

### **Domain 5: Multi-Screen Consistency**

**Example 9: Foundational Exploratory Variant Generation**

Applicability Rule: Use the generate\_variants tool when exploring alternative aesthetic trajectories or layout structures for a screen without requiring complex prompt engineering or risking the destruction of the baseline design state.

JSON

// MCP Tool Execution Payload: generate\_variants  
{  
  "screen\_id": "scr\_123",  
  "prompt": "Explore highly saturated, high-contrast dark mode aesthetic variations.",  
  "variantCount": 3,  
  "creativeRange": "EXPLORE",   
  "aspects":   
}

*Architectural Commentary:* The aspects array is crucial.1 By passing COLOR\_SCHEME and TEXT\_FONT, the agent forces the model to hold the DOM structure relatively static while rapidly mutating the CSS parameters. The agent can then analyze the resulting array of screen\_ids to determine the optimal aesthetic direction for the project.1

**Example 10: Enterprise Multi-Tenant Inheritance Generation**

Applicability Rule: Use this prompt when requesting secondary or tertiary pages to force the Stitch generative model to inherit the visual context and DOM structure of the primary layout, ensuring seamless multi-page coherence.

JSON

// MCP Tool Execution Payload: generate\_screen\_from\_text  
{  
  "project\_id": "proj\_123abc",  
  "prompt": "Context: User Settings configuration page for the financial compliance platform. User & Visual Direction: Inherit all stylistic decisions, typography scales, spacing units, and token usage exactly as established in the previously generated Dashboard screen and the DESIGN.md context file. Layout: Render ONLY the inner main content area. Do not render the left navigation sidebar or the top global header. Components: A vertical list of user configuration toggle switches, a profile image upload drag-and-drop zone, and a danger-zone account deletion button encased in a red border. Constraints: Maintain the exact container padding widths and maximum width constraints utilized in the main dashboard view."  
}

*Architectural Commentary:* This prompt explicitly mitigates the Inconsistent Navbar/Footer trap. By commanding the model to inherit styling while restricting the generation strictly to the inner content boundary, the agent guarantees that the resulting HTML can be cleanly injected into the \<main\> tag of the Next.js layout.tsx Server Component without causing jarring visual layout shifts during navigation routing.

## **6\. Strict AI Implementation Directives (Execution Rules)**

To function reliably as an Elite AI-Native Frontend Architect, the autonomous agent must internalize, validate against, and obey the following absolute technical directives before executing any interaction with the Google Stitch MCP, Next.js 15 runtime, or the Tailwind v4 styling engine. These directives represent unbreakable operational laws; failure to adhere to them will result in the synthesis of hallucinated code, broken React hydration boundaries, and fundamentally unmaintainable technical debt.

* **Rule 1:** Always generate, read, and parse the DESIGN.md file located in the .stitch/ directory prior to invoking create\_project or generate\_screen\_from\_text. You must inject these exact tokens into the prompt payload to enforce cryptographic-level visual consistency across inference events.9  
* **Rule 2:** Never prompt Google Stitch to output Next.js specific JavaScript logic, React lifecycles (useState, useEffect), or state management hooks. Stitch strictly generates the static structural DOM and visual CSS layer; you must assume full responsibility for authoring the interactive logic locally.1  
* **Rule 3:** Always utilize the complete Zoom-Out-Zoom-In framework hierarchy (Context → User → Goal → Layout → Components → Visual Direction → Constraints) for every generate\_screen\_from\_text payload to prevent the generative model from hallucinating baseline architectural assumptions.23  
* **Rule 4:** Never combine macro-level layout architecture changes (e.g., changing grid structures) and granular UI component styling (e.g., button padding) within a single edit\_screen prompt. You must execute iterative, single-vector mutations to prevent DOM collapse.1  
* **Rule 5:** Always map the design tokens extracted from the DESIGN.md manifest directly into the Next.js app/globals.css file utilizing Tailwind v4’s @theme block directive. Do not attempt to construct a legacy, JavaScript-based tailwind.config.js file.18  
* **Rule 6:** Never permit the Stitch engine to generate global shared components (navbars, sidebars, footers) on secondary or tertiary screen prompts. You must restrict generation to the inner content boundary and handle global layout persistence natively within the Next.js app/layout.tsx component.19  
* **Rule 7:** Always traverse the AST of the HTML returned by get\_screen to algorithmically convert standard HTML anchor tags (\<a\>) to Next.js \<Link\> components. This prevents full-page browser reloads and preserves the App Router's client-side cache integrity.19  
* **Rule 8:** Default all Next.js code generation translation targets to React Server Components (RSC). You must surgically inject the "use client"; directive strictly at the highest necessary leaf node where browser APIs or interactivity is explicitly required.19  
* **Rule 9:** Always explicitly define mobile-first responsive constraints within the final layer of the Zoom-Out-Zoom-In payload. You must programmatically verify the existence of Tailwind v4 native cascade layer prefixes (e.g., md:, lg:) during the code extraction phase.18  
* **Rule 10:** Verify the structural integrity and validation of the secure API Key context before initiating any MCP RPC call across the network bridge. You must gracefully fallback and prompt the human operator if authentication with the Google Stitch cloud infrastructure fails or times out.1  
* **Rule 11:** Always execute a post-processing data decoupling algorithm upon the raw HTML AST. You must extract hardcoded Stitch placeholder strings and replace them with dynamic React props or mapped data interfaces to ensure the UI component remains scalable and data-agnostic.11

#### **Referências citadas**

1. Claude Code can now generate full UI designs with Google Stitch — Here's what you need to know \- Reddit, acessado em março 27, 2026, [https://www.reddit.com/r/ClaudeCode/comments/1s31vwq/claude\_code\_can\_now\_generate\_full\_ui\_designs\_with/](https://www.reddit.com/r/ClaudeCode/comments/1s31vwq/claude_code_can_now_generate_full_ui_designs_with/)  
2. UI Automation is Here: My Experience with Google's AI Design Tool ..., acessado em março 27, 2026, [https://medium.com/google-cloud/ui-automation-is-here-my-experience-with-googles-ai-design-tool-stitch-7e59405ecc56](https://medium.com/google-cloud/ui-automation-is-here-my-experience-with-googles-ai-design-tool-stitch-7e59405ecc56)  
3. NEW Google Stitch Update is INSANE\!, acessado em março 27, 2026, [https://www.youtube.com/watch?v=9N65u11sxVY](https://www.youtube.com/watch?v=9N65u11sxVY)  
4. Introducing “vibe design” with Stitch \- Google Blog, acessado em março 27, 2026, [https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-ai-ui-design/](https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-ai-ui-design/)  
5. Google's Stitch lets you easily cook up a fantastic-looking UI with "vibe designing", acessado em março 27, 2026, [https://www.xda-developers.com/googles-stitch-lets-you-easily-cook-up-a-fantastic-looking-ui-with-vibe-designing/](https://www.xda-developers.com/googles-stitch-lets-you-easily-cook-up-a-fantastic-looking-ui-with-vibe-designing/)  
6. How I overhauled my app UI in minutes with Stitch and AI Studio | by Karl Weinmeister | Google Cloud \- Community | Mar, 2026 | Medium, acessado em março 27, 2026, [https://medium.com/google-cloud/how-i-overhauled-my-app-ui-in-minutes-with-stitch-and-ai-studio-524b965c3d45](https://medium.com/google-cloud/how-i-overhauled-my-app-ui-in-minutes-with-stitch-and-ai-studio-524b965c3d45)  
7. Vibe coders — how do you handle UI design? Everything looks like a shadcn template : r/vibecoding \- Reddit, acessado em março 27, 2026, [https://www.reddit.com/r/vibecoding/comments/1s4mn5h/vibe\_coders\_how\_do\_you\_handle\_ui\_design/](https://www.reddit.com/r/vibecoding/comments/1s4mn5h/vibe_coders_how_do_you_handle_ui_design/)  
8. GUIs are built at least 2.5 times \- Hacker News, acessado em março 27, 2026, [https://news.ycombinator.com/item?id=44143045](https://news.ycombinator.com/item?id=44143045)  
9. What Is Google Stitch's Design.md File? How AI Design Systems ..., acessado em março 27, 2026, [https://www.mindstudio.ai/blog/what-is-google-stitch-design-md-file](https://www.mindstudio.ai/blog/what-is-google-stitch-design-md-file)  
10. google-labs-code/stitch-sdk: Generate UI screens from text ... \- GitHub, acessado em março 27, 2026, [https://github.com/google-labs-code/stitch-sdk](https://github.com/google-labs-code/stitch-sdk)  
11. google-labs-code/stitch-skills · GitHub \- GitHub, acessado em março 27, 2026, [https://github.com/google-labs-code/stitch-skills](https://github.com/google-labs-code/stitch-skills)  
12. Design-to-Code with Antigravity and Stitch MCP \- Google Codelabs, acessado em março 27, 2026, [https://codelabs.developers.google.com/design-to-code-with-antigravity-stitch](https://codelabs.developers.google.com/design-to-code-with-antigravity-stitch)  
13. Antigravity Editor: MCP Integration, acessado em março 27, 2026, [https://antigravity.google/docs/mcp](https://antigravity.google/docs/mcp)  
14. stitch \- Skill | Smithery, acessado em março 27, 2026, [https://smithery.ai/skills/neversight/stitch](https://smithery.ai/skills/neversight/stitch)  
15. partme-ai/stitch-skills: 指挥 Stitch 生成 UI 的 Agent Skills 集合 \- GitHub, acessado em março 27, 2026, [https://github.com/partme-ai/stitch-skills](https://github.com/partme-ai/stitch-skills)  
16. react-components | Skills Marketplace \- LobeHub, acessado em março 27, 2026, [https://lobehub.com/it/skills/jscraik-agent-skills-react-components](https://lobehub.com/it/skills/jscraik-agent-skills-react-components)  
17. GitHub \- VoltAgent/awesome-agent-skills: Claude Code Skills and 1000+ agent skills from official dev teams and the community, compatible with Codex, Antigravity, Gemini CLI, Cursor and others., acessado em março 27, 2026, [https://github.com/VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills)  
18. Open-sourcing our progress on Tailwind CSS v4.0 \- Tailwind CSS, acessado em março 27, 2026, [https://tailwindcss.com/blog/tailwindcss-v4-alpha](https://tailwindcss.com/blog/tailwindcss-v4-alpha)  
19. Vibe-based UI building with Google Stitch — Is this the future of frontend? \- LogRocket Blog, acessado em março 27, 2026, [https://blog.logrocket.com/google-stitch-tutorial/](https://blog.logrocket.com/google-stitch-tutorial/)  
20. Google Stitch Tutorial: Design Your First App in 5 Minutes (2026) | NxCode, acessado em março 27, 2026, [https://www.nxcode.io/resources/news/google-stitch-tutorial-design-first-app-2026](https://www.nxcode.io/resources/news/google-stitch-tutorial-design-first-app-2026)  
21. Google Stitch Tutorial: Build Pro App UIs with AI (No Code) \- YouTube, acessado em março 27, 2026, [https://www.youtube.com/watch?v=oXpD9daQbW4](https://www.youtube.com/watch?v=oXpD9daQbW4)  
22. Build Apps in Minutes: Google Stitch & The End of the Blank Canvas, acessado em março 27, 2026, [https://www.youtube.com/watch?v=EA3mb0QJgBs](https://www.youtube.com/watch?v=EA3mb0QJgBs)  
23. Google Stitch for UI Design \- UX Planet, acessado em março 27, 2026, [https://uxplanet.org/google-stitch-for-ui-design-544cf8b42d52](https://uxplanet.org/google-stitch-for-ui-design-544cf8b42d52)