# **Google Antigravity IDE: The Definitive Agent Orchestration & High-Velocity Execution Manual**

## **1\. The Foundation & Paradigm Shift (From Copilots to Autonomous Agents)**

The transition from legacy integrated development environments (IDEs) to the Google Antigravity platform represents a fundamental architectural divergence in software engineering. The traditional model positioned artificial intelligence as a reactive copilot—a sophisticated text auto-completer restricted to the human developer's immediate cursor location. Treating Google Antigravity as a continuation of this legacy completely neutralizes its utility and kills development velocity.1 Antigravity is engineered as a VSCode fork that presupposes the AI operates not as a passive listener, but as an autonomous, multi-threaded actor capable of planning, executing, validating, and iterating on complex engineering tasks across distributed environments.3

### **The Dual-Surface Architecture and Mental Model**

Mastering the Antigravity platform demands an internalized understanding of its bifurcated interface, which physically separates synchronous human coding from asynchronous machine execution.5

The **Editor View** is reserved for high-fidelity, synchronous operations. It represents the classic IDE loop optimized for flow state. Within this interface, developers utilize inline commands via the Cmd \+ I shortcut and tab completions for immediate, localized code generation.1 This surface is mathematically optimal for operations requiring immediate human intuition, such as micro-optimizing a critical sorting algorithm or fine-tuning CSS physics for a localized component. Using the Editor View for broad architectural scaffolding is an anti-pattern.

The paradigm shift materializes within the **Manager Surface**.1 This environment is an asynchronous orchestration loop functioning as a centralized mission control. Historically, AI agents were embedded within the human's workspace panel. The Manager Surface inverts this hierarchy: the various development surfaces—terminals, file systems, and browser rendering engines—are embedded directly into the agent's context.2 Here, the human developer assumes the role of a Principal Architect, spawning, orchestrating, and observing multiple Gemini 3 series agents (e.g., Gemini 3.1 Pro, Gemini 3 Flash) as they operate in parallel across distinct, isolated workspaces.2

### **Absolute Prerequisites and Environment Configuration**

Before initializing a greenfield application, strict hardware and architectural prerequisites must be met to ensure the local runtime can sustain the computational overhead of local multi-agent orchestration and local browser subagent rendering.8 The platform operates locally, necessitating specific standard C library dependencies. For Linux distributions (e.g., Ubuntu 20, Fedora 36, RHEL 8), the system requires glibc \>= 2.28 and glibcxx \>= 3.4.25.6 macOS environments mandate version 12 (Monterey) or higher with Apple security update support, strictly excluding legacy X86 architectures, while Windows environments require a 64-bit Windows 10 architecture.6

Once the hardware baseline is established, the workspace must be explicitly configured through a hierarchy of persistent Markdown files. Development velocity in an agentic system is directly proportional to the rigidity and clarity of its initial boundary constraints. Relying on an agent's generalized training data for project-specific conventions is a critical failure mode.

The cognitive architecture of the workspace is dictated by three primary configuration vectors:

1. **Global Core Directives (\~/.gemini/GEMINI.md):** This file functions as the foundational cognitive blueprint for all agents operating on the host machine.10 It defines non-negotiable architectural principles. Elite configurations mandate "Atomic Modularity," enforce interface contracts at all system boundaries, and establish "Weightless Documentation" protocols that prioritize active metadata and Mermaid diagrams over verbose, token-heavy prose.11  
2. **Workspace Rules (.agent/rules/):** These files provide contextual, project-scoped boundaries.6 A rule file dictates local standards, ensuring that any agent spawned within the repository automatically adheres to chosen frameworks, such as strict TypeScript typing, Tailwind CSS utility class conventions, or standardized error-handling middleware.6  
3. **Domain-Specific Tooling (.agent/skills/SKILLS.md):** Skills introduce modular specialization without bloating the core agent context. Instead of embedding all domain knowledge into a single mega-prompt, the skills directory packages task-specific instructions, scripts, and validation standards that agents load dynamically at runtime, drastically reducing ambiguity and enforcing repeatable workflows.14

### **Launching a New Project: The Blueprinting Imperative**

When launching a new project, skipping the discovery and blueprinting phase guarantees architectural drift. An autonomous agent cannot safely orchestrate a microservices backend or a scalable frontend component library if it lacks a high-level, deterministic map of the system's components, interactions, and boundary conditions.16

The absolute first step in the Antigravity lifecycle is the generation of an Architectural Blueprint (blueprint.md).16 Operating strictly in Planning mode, the developer must instruct the Gemini 3.1 Pro agent to ingest the project requirements and draft a comprehensive execution plan.18 This process forces the creation of a Task Plan Artifact.6 The Task Plan acts as an immutable contract between the human architect and the AI agent.6 It visualizes the data flow, maps required API integration points, and establishes a phased delivery milestone checklist.16 Only after the Principal Architect explicitly reviews and mathematically validates this Artifact should the agent be granted the execution autonomy to begin manipulating the file system and scaffolding the underlying codebase.6

## **2\. Enterprise-Grade AI Setup & Orchestration**

Graduating from the generation of static, single-file boilerplate to engineering dynamic, production-ready enterprise systems requires agents to be firmly grounded in infrastructure reality. Code generation executed without live, verifiable context invariably results in severe AI hallucinations—invented database tables, deprecated API payloads, and fundamentally broken schema relationships. The Model Context Protocol (MCP) and the Manager Surface provide the underlying infrastructure required to eliminate these failure modes entirely.

### **Real-Time Grounding via Model Context Protocol (MCP)**

The Model Context Protocol (MCP) functions as a secure, standardized, and highly optimized bridge between the local Antigravity IDE and the broader enterprise infrastructure stack.20 By exposing external relational databases, real-time logging systems, and API registries directly to the Gemini 3 agent's context window, MCP ensures the AI possesses continuous, real-time awareness of the environment beyond the static files currently open in the text editor.20

Connections are managed via the built-in MCP Store GUI, which securely authenticates via Google Cloud IAM credentials, or through direct, hardcoded manipulation of the local configuration file located at \~/.gemini/antigravity/mcp\_config.json.13

**Connecting Live Schemas (Prisma & AlloyDB):** When engineering data-intensive applications, allowing an agent to infer or "guess" the database structure based on outdated context is catastrophic. By installing the MCP Toolbox for Databases or integrating the built-in Prisma MCP server, the agent gains introspective, read-only access to live schemas.13 For instance, integrating Prisma Postgres natively via MCP requires appending the following explicit configuration to the mcp\_config.json file:

JSON

{  
  "mcpServers": {  
    "Prisma": {  
      "command": "npx",  
      "args": \["-y", "prisma", "mcp"\]  
    }  
  }  
}

.22 Once this connection is initialized and verified, if a developer instructs the agent to "write a highly optimized SQL query for the user analytics dashboard," the agent will autonomously pause, query the live Prisma schema via the MCP bridge, identify the exact foreign key relationships, and draft a syntactically flawless, type-safe query that exactly matches the production or staging environment.13

**Routing Environments (Genkit Integration):** For enterprise AI routing, telemetry, and backend orchestration, connecting the Google Genkit MCP server is an absolute mandate.24 This integration securely exposes the Genkit routing environment to the IDE, granting the Antigravity agent the capability to autonomously discover, test, and wire AI model endpoints, orchestration flows, and tracing configurations.25 The technical setup involves adding the @toolbox-sdk/core to the MCP client configuration, effectively transforming the coding agent into a full-stack AI orchestrator capable of reasoning deeply about its own routing logic and model fallbacks.25

| MCP Server Category | Primary Enterprise Function | Technical Configuration Mechanism | Contextual Benefit & Hallucination Mitigation |
| :---- | :---- | :---- | :---- |
| **Google Data Cloud** (AlloyDB, BigQuery, Spanner) | Securely bridges agent reasoning directly to organizational data infrastructure. | MCP Store GUI with IAM credential binding or OAuth proxy.21 | Eliminates hallucinated SQL queries; ensures query construction is optimized based on live, existing table indices. |
| **ORM & Database Management** (Prisma Postgres) | Provisions databases, manages connection pools, and handles schema migrations autonomously. | Local mcp\_config.json command execution and CLI arguments.22 | Grants agents the ability to write type-safe queries matching live infrastructure without requiring manual schema dumps. |
| **AI Routing & Telemetry** (Firebase Genkit) | Facilitates the "Agent-as-a-Tool" collaboration paradigm and deep flow orchestration. | Genkit CLI initialization or @toolbox-sdk/core HTTP routing.24 | Allows agents to structure complex multi-model pipelines and debug local Firebase emulators without breaking existing backend logic. |
| **External Memory & CI/CD** (Pinecone, GitHub, Slack) | Provides long-term vector memory embeddings, direct repository access, and asynchronous messaging. | Native MCP Store installations and API key bindings.28 | Prevents critical context amnesia during multi-day, multi-agent refactoring sessions; allows direct integration with CI/CD pipelines. |

### **Asynchronous Orchestration via the Manager Surface**

Enterprise software development demands high concurrency. Relying on a single, synchronous chat window within an editor creates an unacceptable sequential bottleneck. The Manager Surface solves this by allowing the Principal AI Architect to deploy and monitor an entire virtual engineering team simultaneously.2

A high-velocity enterprise workflow operates via parallel delegation. Through the Manager Surface, the human developer spawns distinct, isolated agents assigned to hyper-specific domains.28

1. **The Frontend Agent (Workspace A):** Spawned in a dedicated workspace, this agent is tasked exclusively with iterating on a Next.js UI component. It is connected to a local Browser Subagent, allowing it to visually render changes in an isolated Chrome profile, verify responsive Tailwind CSS classes across viewports, and capture visual Screenshot Artifacts for the human architect to review.2  
2. **The Backend Agent (Workspace B):** Spawned simultaneously in a separate workspace, this agent connects directly to the Genkit MCP server. It begins wiring the telemetry, database connections, and routing endpoints required to support the new UI component being built by the Frontend Agent.25  
3. **The Testing/QA Agent (Background Daemon):** Spawned in the background, this agent strictly monitors the file system for active changes. As the Frontend and Backend agents commit code to the local buffer, the Testing Agent autonomously generates and executes end-to-end Playwright test suites, isolating failures and reporting them via structured Validation Logs.4

This multi-agent orchestration pattern physically and logically prevents context cross-contamination. Because each agent is tightly sandboxed with its specific objective and scoped MCP access, the AI never confuses backend database schemas with frontend React state management logic, preserving the integrity of the million-token context window.14

## **3\. Extreme Prompt Engineering & High-Velocity Workflows**

Prompt engineering within an agent-first IDE transcends basic conversational commands and natural language requests. It requires a rigorous methodology known as "Ambient Referencing"—structuring the local environment and the prompt parameters so the AI inherently understands the architectural context without requiring massive, repetitive, and token-heavy context dumps in every single prompt.30

### **Forcing Production-Ready Code Generation**

To extract elite, production-ready code from the Gemini 3.1 Pro model, prompts must be engineered as rigid technical specifications. Generic conversational requests yield generic, fragile boilerplate. High-velocity prompts utilize strict structural constraints, explicit capability targeting, and mandate the generation of verifiable Artifacts.28

A foundational prompt designed for Gemini 3.1 Pro must specify the exact architectural outcome, the specific external integrations required, and the expected constraints.31 An elite prompt structure operates as follows:

*"You are an expert full-stack engineer. Within this Antigravity workspace, scaffold a strict TypeScript Next.js app with: Google sign-in middleware, a server-side dashboard calling the Gemini 3.1 Pro API, a multimodal chat UI supporting base64 image uploads, and explicit TODO comments for environment variables. You must enforce atomic modularity and interface contracts exactly as defined in the global GEMINI.md file. Do not proceed with execution until an Implementation Plan Artifact is approved."* 6

### **Strategic Conversation Modes: Fast vs. Planning**

The Google Antigravity IDE introduces a highly optimized, bifurcated execution model via two distinct conversation modes. Selecting the incorrect mode for a given engineering task fundamentally degrades output quality, wastes computational tokens, and breaks developer flow.32

**Planning Mode (The Architectural Standard):** By default, all non-trivial tasks—such as cross-file refactoring, deep repository research, building complex full-stack features, or scaffolding a new project—must utilize Planning mode, powered by the deeper, slower reasoning capabilities of the Gemini 3 Pro model.32 In Planning mode, the agent operates as a deliberate collaborator. It will not execute code mutations immediately. Instead, it generates a comprehensive, structured Task Plan Artifact.6 This mode serves as an AI-driven "rubber ducking" session. It allows the human architect to review the agent's strategy, catch hallucinated architectural assumptions, and refine the logical flow before any source files are permanently altered.6

**Fast Mode (The Tactical Executioner):** Fast mode intentionally abandons the structured planning phase in favor of immediate, unilateral execution. This mode typically utilizes the highly optimized Gemini 3 Flash model for sub-second latency.6 If a developer is engaging in a rapid "fix it live" scenario—such as resolving a minor CSS grid alignment issue, updating a single API endpoint payload, or patching a simple collision detection bug in a C++ game engine file—Planning mode introduces massive, unnecessary cognitive overhead.32 In fact, using Planning mode for simple, localized tasks can actually degrade performance, leading to a "spinning wheel of token dispensing" where the model overcomplicates the logic.34 Fast mode must be strictly deployed for instantaneous refactoring, typo correction, and isolated, single-file logic adjustments.32

### **Automation via @workflows**

The true multiplier of development velocity in the Antigravity ecosystem is the Workflows feature. While Rules (stored in .agent/rules/) provide persistent, passive guidance to the models, Workflows provide active, structured, and highly deterministic sequences of automated actions.6

Workflows are saved as markdown files (limited to 12,000 characters) in the Customizations panel or the .agent/workflows/ directory, and are explicitly invoked via the /workflow-name command in the agent panel.11 They allow developers to encode repetitive, complex, multi-step architectural decisions into a single executable CLI command.35

For instance, an enterprise workflow named /generate-e2e-tests can be constructed to automatically trigger a sequential chain of operations:

1. Analyze the Git diff of the most recently modified routing controllers.  
2. Generate corresponding integration tests utilizing Playwright.  
3. Execute the test suite autonomously via the internal terminal.  
4. Capture the console output and network assertions.  
5. If a test assertion fails, autonomously trigger the /explain-and-fix sub-workflow to resolve the error before notifying the human.6

Because workflows possess the capability to sequentially call other workflows within their execution loop, Principal DX Engineers can architect massive, self-healing automation engines that drastically reduce the manual labor required for QA validation, documentation synchronization, and pre-deployment security checks.6

## **4\. Anti-Patterns & Deadly Traps (Strict Constraints)**

The introduction of highly autonomous agents into a production codebase introduces entirely new vectors for catastrophic failure. Mismanaging the AI's million-token context window or misusing the platform's execution features will invariably result in hallucinated code, overwritten business logic, and silent, cascading application crashes. The following anti-patterns represent deadly traps that must be strictly avoided by any engineer operating the Antigravity platform.

### **The Context Bloat Trap**

The most pervasive and damaging anti-pattern in agentic development is "context bloat"—the severe degradation of AI output quality and instruction adherence caused by indiscriminately dumping unstructured, oversized, or irrelevant data into the prompt context.38 While models like Gemini 3 Pro possess massive context windows, context saturation leads to attention diffusion, where the model loses track of the core prompt directives.4

A critical operational error is failing to utilize the IDE's targeted @ mentions.33 Developers must NEVER highlight entire root directories or dump unstructured base64 image strings into the chat unless explicitly required for a specific multimodal task.38 Injecting raw, unparsed visual data or demanding the agent ingest an entire node\_modules folder or massive .git history overwhelms the model's attention heads, directly leading to dropped real-time streaming updates, skipped safety instructions, and gateway mismatches.38

**Constraint Remediation:** Always use highly precise @file, @directory, or @mcp-server mentions to restrict the agent's attention strictly to the relevant computational surface area.33 If a backend routing bug occurs, the prompt must explicitly mention *only* the specific routing controller file and the relevant database schema via MCP, explicitly excluding all frontend CSS or state management assets from the context window.

### **The Terminal Avoidance Trap**

When an application fails to compile or throws a complex runtime error, the legacy human instinct is to manually read the terminal output, interpret the error stack, and attempt to manually type out a fix or paste the error into a separate web-based chatbot. In the Antigravity ecosystem, this is a deadly habit that wastes time, breaks the developer's flow state, and severs the AI's continuous context.6

**Constraint Remediation:** Developers must NEVER manually transcribe terminal errors or attempt to summarize stack traces for the agent. When a stack trace appears in the local runtime, the developer must simply select the problematic terminal output and immediately execute the Cmd \+ L keyboard shortcut.6 This action seamlessly binds the raw, unedited terminal error log directly to the agent's context alongside the currently active file AST. This allows the AI to autonomously trace the stack execution, identify the exact mismatched port or syntax error, and propose a highly localized, deterministic fix.33

### **The Raw Tool Call Trap**

During complex autonomous orchestration operations, the agent relies heavily on backend tools (e.g., executing bash scripts, reading files, curling endpoints). A severe anti-pattern is the human developer passively scrolling through endless, raw JSON tool calls and terminal execution logs in an attempt to discern what the AI is actually doing under the hood.6 This wastes immense human cognitive bandwidth, provides zero mathematical guarantees of code quality, and frequently hides subtle logical errors in the tool output.38

**Constraint Remediation:** Developers must forcefully demand verifiable Artifacts.6 An Artifact is a tangible, state-managed deliverable—such as a visual screenshot rendered from the headless Browser Subagent, a structured Validation Log detailing test assertions, or a formally documented Implementation Plan.6 Instead of watching the agent run headless commands in a loop, the developer must configure the Global Review Policy to halt execution and present a "Validation Log Artifact".6 This Artifact acts as a definitive QA stamp, summarizing exactly what was tested and proving the implementation works via a visual or structural guarantee before merging.6

### **The Sandbox Violation**

Granting an AI total, unsupervised autonomy over a live file system without first defining strict operational boundaries in the .agent/rules/ directory or utilizing the platform's native security sandboxes is an unacceptable architectural hazard.6

**Constraint Remediation:** The Antigravity IDE's "Secure Mode" toggle must remain perpetually active, and the "Terminal Command Auto Execution" settings must be heavily scrutinized based on the current workspace.6 Utilizing the "Turbo" setting (which grants the agent total, unprompted execution autonomy for speed) without simultaneously configuring an explicit Deny List for destructive shell commands (e.g., banning rm \-rf, raw database drop commands, or credential echo commands) will inevitably result in catastrophic data loss if the agent hallucinates a destructive path during a complex refactor.6 The environment configuration must physically dictate the agent's limits, rather than relying solely on the agent's internal safety alignment.

## **5\. State-of-the-Art Workflow Snippets (10 High-Density Examples)**

The following 10 execution snippets demonstrate elite agent orchestration parameters. Each domain features exactly one Foundational pattern (designed for rapid application scaffolding) and one Enterprise-grade pattern (designed for complex, data-driven system architecture).

### **Domain 1: Workspace Initialization**

**Snippet 1: Foundational Skeleton Scaffolding**

*Applicability Rule: Deploy this pattern when initializing a greenfield application from scratch to ensure standard boilerplate is generated autonomously without human keystrokes.*

* **Mode:** Planning  
* **Prompt:** "Initialize a Next.js 15 application for 'Aegis Fitness OS'. Utilize TypeScript, strict mode, and Tailwind CSS. Implement a standard directory structure (/app, /components, /lib). Configure the global GEMINI.md to enforce strict atomic modularity and require Mermaid diagrams for all complex component logic."  
* **Execution Profile:** The Gemini 3 Pro agent evaluates the dependencies and produces a comprehensive Task Plan Artifact detailing the exact directory tree and package.json requirements. Upon explicit human approval of the Artifact, it executes the necessary shell commands to scaffold the application, writing the configuration files directly to disk and initializing the Git repository.

**Snippet 2: Enterprise-Grade Live Schema Integration**

*Applicability Rule: Deploy this pattern immediately after scaffolding an enterprise application to bind the AI's reasoning engine directly to the live database infrastructure via MCP.*

* **Mode:** Planning  
* **Prompt:** "@mcp-server Prisma. Connect to the live PostgreSQL instance defined in the local .env.local file. Read the current active database schema. Generate a comprehensive schema-architecture.md Artifact mapping all primary and foreign key relationships for the 'User', 'Workout', and 'Telemetry' tables."  
* **Execution Profile:** The agent strictly bypasses hallucination by utilizing the Prisma MCP server to directly execute introspection queries against the live database. It outputs a precise, structurally sound Markdown Artifact detailing the exact live schema, ensuring all subsequent AI-generated SQL or ORM queries are perfectly typed against reality.

### **Domain 2: Full-Stack Execution**

**Snippet 3: Foundational Dashboard Assembly**

*Applicability Rule: Deploy this pattern to rapidly transform raw data requirements into a visual frontend interface using asynchronous task delegation.*

* **Mode:** Fast  
* **Prompt:** "@file components/Dashboard.tsx. Refactor this empty component into a 3-column glassmorphism CSS grid layout. Column 1: User Profile. Column 2: Weekly Activity Chart (utilize realistic placeholder data). Column 3: System Status. Output a visual screenshot Artifact via the local Browser Subagent upon completion."  
* **Execution Profile:** Utilizing the high-speed Gemini 3 Flash model, the agent rapidly rewrites the React component AST, spins up the local browser preview engine, navigates to the component route, and returns a high-fidelity visual screenshot for the human architect to verify the layout aesthetics without leaving the editor.

**Snippet 4: Enterprise-Grade Genkit Endpoint Orchestration**

*Applicability Rule: Deploy this pattern utilizing the Manager Surface to wire complex AI routing logic in the backend while simultaneously ensuring frontend compatibility.*

* **Mode:** Planning  
* **Prompt:** "Manager Surface Command: Spawn a dedicated Backend Agent. @mcp-server Genkit. Construct a new Genkit execution flow in backend/flows/activity-analyzer.ts that ingests a user's weekly workout telemetry, routes it through the Gemini 3.1 Pro model for sentiment analysis, and returns a structured JSON payload. Ensure the flow logic strictly adheres to the error-handling boundaries defined in .agent/rules/error-handling.md."  
* **Execution Profile:** The orchestrated background agent connects to the Genkit MCP, writes the flow execution logic, tests the endpoint locally against the Firebase emulator suite, and outputs a Validation Log Artifact confirming the payload structure, entirely isolated from the frontend developer's active workspace.

### **Domain 3: Refactoring & Debugging**

**Snippet 5: Foundational Instant UI Refactoring**

*Applicability Rule: Deploy this pattern during synchronous coding sessions to instantly resolve visual anomalies without breaking the "flow state" of the classic IDE loop.*

* **Mode:** Fast (Editor View)  
* **Prompt:** (Highlight the broken CSS module code block) Execute Cmd \+ I \-\> "Align this specific flexbox container to center its children vertically and apply a standard Tailwind padding utility of p-4."  
* **Execution Profile:** Operating synchronously, the Editor View instantly generates an inline diff overlay. The human developer reviews the suggested CSS changes and accepts the mutation via a single keystroke (Tab), resolving the localized issue in milliseconds without engaging the broader Agent Manager.

**Snippet 6: Enterprise-Grade Deep Architectural Resolution**

*Applicability Rule: Deploy this pattern when encountering cascading system failures or complex port mismatches during local deployment that require deep stack trace analysis.*

* **Mode:** Planning  
* **Prompt:** (Highlight the crashing terminal output) Execute Cmd \+ L \-\> "@directory backend/. Analyze this comprehensive stack trace. Trace the failure execution path back through the routing controllers to identify the specific port collision or unhandled promise rejection. Propose a multi-file architectural fix via an Implementation Plan Artifact."  
* **Execution Profile:** The agent absorbs the raw error log via the terminal bridge shortcut, cross-references the error strings with the entire backend directory AST, and identifies the root cause (e.g., a race condition in the Genkit telemetry initialization). It presents a detailed, step-by-step modification plan for human approval before mutating any underlying logic.

### **Domain 4: UI Iteration**

**Snippet 7: Foundational Style Guide Alignment**

*Applicability Rule: Deploy this pattern to enforce global visual consistency across disparate frontend components through an automated codebase sweep.*

* **Mode:** Fast  
* **Prompt:** "/workflow ui-consistency-sweep. @directory components/. Scan all React components for raw hex color codes or inline styles and replace them with the standard Tailwind variables defined in tailwind.config.ts. Consolidate all divergent button variants into a single, shared polymorphic component."  
* **Execution Profile:** The agent rapidly executes the predefined workflow script, sweeping the target directory, identifying UI drift via regex and AST parsing, replacing hardcoded values, and standardizing the component library output, returning a diff log upon completion.

**Snippet 8: Enterprise-Grade Visual Artifact Verification**

*Applicability Rule: Deploy this pattern to demand visual proof of a complex responsive design implementation across multiple device viewports without manually resizing browser windows.*

* **Mode:** Planning  
* **Prompt:** "@file pages/landing.tsx. Implement a highly responsive hero section utilizing CSS grid. Trigger the Browser Subagent to render this page locally. Capture and return three distinct Screenshot Artifacts representing specific breakpoints: Mobile (390px), Tablet (820px), and Desktop (1440px)."  
* **Execution Profile:** The agent writes the required responsive code, autonomously manipulates the headless Chrome subagent to inject the local URL and resize the viewport three sequential times, and delivers three verifiable image Artifacts to the human architect for final visual sign-off.

### **Domain 5: Automated Testing**

**Snippet 9: Foundational Unit Test Generation**

*Applicability Rule: Deploy this pattern to eliminate the manual labor of writing basic coverage tests for pure, deterministic utility functions.*

* **Mode:** Fast  
* **Prompt:** "@file utils/math-helpers.ts. Generate exhaustive Jest unit tests covering all edge cases, null inputs, type coercion failures, and standard boundary conditions for every exported function within this target file."  
* **Execution Profile:** The agent instantly evaluates the exported function signatures and generates a corresponding math-helpers.test.ts file alongside the target, ensuring 100% line and branch coverage without requiring architectural planning.

**Snippet 10: Enterprise-Grade Autonomous E2E Validation**

*Applicability Rule: Deploy this pattern via the Manager Surface to execute long-running, headless browser validation flows in the background without interrupting primary development tasks.*

* **Mode:** Planning  
* **Prompt:** "Manager Surface Command: Spawn a dedicated QA Agent. Utilize the Playwright framework to construct an End-to-End test suite for the user authentication flow. The agent must launch the browser context, attempt to log in using the mock credentials stored in .env.test, verify the subsequent redirect to the /dashboard, and output a Final Validation Artifact summarizing the pass/fail state of the assertions."  
* **Execution Profile:** The background agent orchestrates the entire headless testing suite asynchronously. It writes the test script, executes it, captures console output, network errors, and DOM states, and finally presents a comprehensive Validation Artifact to the main workspace, proving the authentication logic is secure and functional before the developer commits the code.

## **6\. Strict AI Implementation Directives (Execution Rules)**

To maintain absolute architectural control over the Antigravity IDE and maximize the utility of the Gemini 3 models, the Principal AI DX Engineer must enforce the following unbreakable execution laws across all workspaces. These directives represent the fundamental constraints an AI Agent must read and obey before managing an Antigravity workspace environment.

* **Law of Architectural Supremacy:** Never permit an agent to execute a complex backend migration, multi-file refactor, or architectural paradigm shift without first generating and receiving explicit human approval on a structured Task Plan Artifact.  
* **Law of Verifiable Outputs:** Never accept a scrolling terminal log or raw JSON tool call sequence as proof of success. Always mandate the generation of a Validation Log Artifact or a visual Screenshot Artifact to provide tangible, undeniable proof of implementation.  
* **Law of Contextual Precision:** Never dump entire root directories or unstructured base64 image strings into the chat interface. Always utilize explicit @file, @directory, and @mcp-server mentions to restrict the context window and prevent catastrophic attention degradation.  
* **Law of Terminal Integration:** Never manually transcribe runtime errors or summarize stack traces for the agent. Always utilize the Cmd \+ L shortcut to seamlessly inject precise, unedited, raw terminal outputs directly into the agent's context for forensic analysis.  
* **Law of Mode Segregation:** Never utilize Planning mode for minor, localized syntax fixes, as it wastes token bandwidth and introduces unnecessary latency. Conversely, never utilize Fast mode for multi-file architectural scaffolding, as it bypasses critical planning safeguards.  
* **Law of Flow State Preservation:** Always utilize the Editor View's Cmd \+ I shortcut for localized, synchronous boilerplate generation to preserve the developer's immediate flow state without engaging the broader, asynchronous Agent Manager.  
* **Law of Asynchronous Isolation:** Always utilize the Manager Surface to spawn parallel agents for disparate operational tasks. Never force a single agent to handle frontend UI iteration and backend database migration simultaneously within the same synchronous chat thread.  
* **Law of Live Grounding:** Never allow an agent to "guess," hallucinate, or assume database structures, external API payloads, or routing endpoints based on training data. Always enforce the mandatory use of Model Context Protocol (MCP) servers (e.g., Prisma, Genkit) to ground the agent in verifiable, live infrastructure.  
* **Law of Workflow Automation:** Never manually repeat multi-step tasks such as UI consistency sweeps, test generation, or documentation formatting. Always encode these deterministic sequences into reusable @workflows for instant, error-free execution.  
* **Law of Absolute Sandboxing:** Always configure the Review Policy and Terminal Command Auto Execution settings to reflect the explicit trust level of the current agent. Never run an agent in "Turbo" mode without a strict, pre-configured Deny List protecting critical file paths and production databases from hallucinated deletion commands.

#### **Referências citadas**

1. Build with Google Antigravity, our new agentic development platform, acessado em março 31, 2026, [https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/](https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/)  
2. Introducing Google Antigravity, a New Era in AI-Assisted Software Development, acessado em março 31, 2026, [https://antigravity.google/blog/introducing-google-antigravity](https://antigravity.google/blog/introducing-google-antigravity)  
3. Getting Started with Google Antigravity, acessado em março 31, 2026, [https://codelabs.developers.google.com/getting-started-google-antigravity](https://codelabs.developers.google.com/getting-started-google-antigravity)  
4. Google Antigravity vs Gemini CLI: Agent-First Development vs Terminal-Based AI (2026), acessado em março 31, 2026, [https://www.augmentcode.com/tools/google-antigravity-vs-gemini-cli](https://www.augmentcode.com/tools/google-antigravity-vs-gemini-cli)  
5. Google Antigravity (Public Preview): What It Is, How It Works, and What the Limits Really Mean \- DEV Community, acessado em março 31, 2026, [https://dev.to/blamsa0mine/google-antigravity-public-preview-what-it-is-how-it-works-and-what-the-limits-really-mean-4pe](https://dev.to/blamsa0mine/google-antigravity-public-preview-what-it-is-how-it-works-and-what-the-limits-really-mean-4pe)  
6. The Future of Coding? I Tested Google Gemini 3 and Its Antigravity ..., acessado em março 31, 2026, [https://medium.com/write-a-catalyst/the-future-of-coding-i-tested-google-gemini-3-and-its-antigravity-ide-and-heres-what-blew-my-mind-33a70011259c](https://medium.com/write-a-catalyst/the-future-of-coding-i-tested-google-gemini-3-and-its-antigravity-ide-and-heres-what-blew-my-mind-33a70011259c)  
7. Google Antigravity introduces agent-first architecture for asynchronous, verifiable coding workflows | VentureBeat, acessado em março 31, 2026, [https://venturebeat.com/orchestration/google-antigravity-introduces-agent-first-architecture-for-asynchronous](https://venturebeat.com/orchestration/google-antigravity-introduces-agent-first-architecture-for-asynchronous)  
8. Google Antigravity Agent Manager Explained: Deep Dive \- Arjan KC, acessado em março 31, 2026, [https://www.arjankc.com.np/blog/google-antigravity-agent-manager-explained/](https://www.arjankc.com.np/blog/google-antigravity-agent-manager-explained/)  
9. Google Antigravity Documentation, acessado em março 31, 2026, [https://antigravity.google/docs](https://antigravity.google/docs)  
10. How to Set Up Google Antigravity on macOS & Windows (2026) \- ITECS, acessado em março 31, 2026, [https://itecsonline.com/post/antigravity-setup-guide](https://itecsonline.com/post/antigravity-setup-guide)  
11. Two weeks later \- And What I Did in the Interim \- An Ode to Code Quality \- Google Antigravity, acessado em março 31, 2026, [https://discuss.ai.google.dev/t/two-weeks-later-and-what-i-did-in-the-interim-an-ode-to-code-quality/135183](https://discuss.ai.google.dev/t/two-weeks-later-and-what-i-did-in-the-interim-an-ode-to-code-quality/135183)  
12. Building my Portfolio Site in 2 Days Using Google AI Tools: Gemini CLI, Antigravity, Conductor, and Agent Starter Pack \- DEV Community, acessado em março 31, 2026, [https://dev.to/gde/building-my-portfolio-site-in-2-days-using-gemini-cli-antigravity-conductor-and-agent-starter-3bke](https://dev.to/gde/building-my-portfolio-site-in-2-days-using-gemini-cli-antigravity-conductor-and-agent-starter-3bke)  
13. Tutorial : Getting Started with Google Antigravity | by Romin Irani \- Medium, acessado em março 31, 2026, [https://medium.com/google-cloud/tutorial-getting-started-with-google-antigravity-b5cc74c103c2](https://medium.com/google-cloud/tutorial-getting-started-with-google-antigravity-b5cc74c103c2)  
14. Antigravity | My Big Data World, acessado em março 31, 2026, [https://weidongzhou.wordpress.com/category/ai/antigravity/](https://weidongzhou.wordpress.com/category/ai/antigravity/)  
15. Google AntiGravity IDE for Vibe Coding \- GitHub, acessado em março 31, 2026, [https://github.com/Dokhacgiakhoa/antigravity-ide](https://github.com/Dokhacgiakhoa/antigravity-ide)  
16. specification-architect — Claude Code Skill | FastMCP, acessado em março 31, 2026, [https://fastmcp.me/skills/details/388/specification-architect](https://fastmcp.me/skills/details/388/specification-architect)  
17. Baytech Consulting, acessado em março 31, 2026, [https://www.baytechconsulting.com/blog/author/bryan@baytechconsulting.com](https://www.baytechconsulting.com/blog/author/bryan@baytechconsulting.com)  
18. Google Antigravity: How to add custom MCP server to improve Vibe Coding \- Medium, acessado em março 31, 2026, [https://medium.com/google-developer-experts/google-antigravity-custom-mcp-server-integration-to-improve-vibe-coding-f92ddbc1c22d](https://medium.com/google-developer-experts/google-antigravity-custom-mcp-server-integration-to-improve-vibe-coding-f92ddbc1c22d)  
19. Claude Code Skill \- project-planner \- FastMCP, acessado em março 31, 2026, [https://fastmcp.me/skills/details/384/project-planner](https://fastmcp.me/skills/details/384/project-planner)  
20. MCP Integration \- Google Antigravity Documentation, acessado em março 31, 2026, [https://antigravity.google/docs/mcp](https://antigravity.google/docs/mcp)  
21. Looker using MCP | MCP Toolbox for Databases, acessado em março 31, 2026, [https://googleapis.github.io/genai-toolbox/how-to/connect-ide/looker\_mcp/](https://googleapis.github.io/genai-toolbox/how-to/connect-ide/looker_mcp/)  
22. Announcing Prisma's MCP Server: Vibe Code with Prisma Postgres, acessado em março 31, 2026, [https://www.prisma.io/blog/announcing-prisma-s-mcp-server-vibe-code-with-prisma-postgres](https://www.prisma.io/blog/announcing-prisma-s-mcp-server-vibe-code-with-prisma-postgres)  
23. Connect Google Antigravity IDE to Google's Data Cloud services | Google Cloud Blog, acessado em março 31, 2026, [https://cloud.google.com/blog/products/data-analytics/connect-google-antigravity-ide-to-googles-data-cloud-services](https://cloud.google.com/blog/products/data-analytics/connect-google-antigravity-ide-to-googles-data-cloud-services)  
24. Firebase MCP server | Develop with AI assistance \- Google, acessado em março 31, 2026, [https://firebase.google.com/docs/ai-assistance/mcp-server](https://firebase.google.com/docs/ai-assistance/mcp-server)  
25. GitHub \- googleapis/genai-toolbox: MCP Toolbox for Databases is an open source MCP server for databases., acessado em março 31, 2026, [https://github.com/googleapis/genai-toolbox](https://github.com/googleapis/genai-toolbox)  
26. Build a photo restoration app using Genkit Go and Nano Banana Pro | Google Codelabs, acessado em março 31, 2026, [https://codelabs.developers.google.com/cloud-genkit-go-nano-banana](https://codelabs.developers.google.com/cloud-genkit-go-nano-banana)  
27. Google Codelabs, acessado em março 31, 2026, [https://codelabs.developers.google.com/](https://codelabs.developers.google.com/)  
28. Google Antigravity Guide: How to Use Gemini 3 Better Than 99% of ..., acessado em março 31, 2026, [https://medium.com/@tentenco/google-antigravity-guide-how-to-use-gemini-3-better-than-99-of-people-e44f13e3be08](https://medium.com/@tentenco/google-antigravity-guide-how-to-use-gemini-3-better-than-99-of-people-e44f13e3be08)  
29. Claude Code vs Antigravity vs Cursor: The AI Coding Assistant Showdown of 2025 | by Aftab, acessado em março 31, 2026, [https://medium.com/@aftab001x/claude-code-vs-antigravity-vs-cursor-the-ai-coding-assistant-showdown-of-2025-0d6483c16bcc](https://medium.com/@aftab001x/claude-code-vs-antigravity-vs-cursor-the-ai-coding-assistant-showdown-of-2025-0d6483c16bcc)  
30. Gemini 3 Prompt Engineering Guide | PDF | Artificial Intelligence \- Scribd, acessado em março 31, 2026, [https://www.scribd.com/document/967925028/Humanity-s-Last-Prompt-Engineering-Guide-Built-for-the-Gemini](https://www.scribd.com/document/967925028/Humanity-s-Last-Prompt-Engineering-Guide-Built-for-the-Gemini)  
31. Antigravity Gemini 3.1 Pro: Setup, Pricing, Limits & Real Use Cases, acessado em março 31, 2026, [https://clgf.org.uk/detail.html?app=antigravity-gemini-3-1-pro-build-smarter-apps-faster-69ae78990df3b](https://clgf.org.uk/detail.html?app=antigravity-gemini-3-1-pro-build-smarter-apps-faster-69ae78990df3b)  
32. Planning vs Fast Modes Explained, Choose the Right \#LLM \#Model \#Google \#gemini \#Antigravity \#IDE \- YouTube, acessado em março 31, 2026, [https://www.youtube.com/shorts/5ImQNhfoH1s](https://www.youtube.com/shorts/5ImQNhfoH1s)  
33. Google Antigravity Editor \- Tips & Tricks \- Mete Atamel, acessado em março 31, 2026, [https://atamel.dev/posts/2025/12-01\_antigravity\_editor\_tips/](https://atamel.dev/posts/2025/12-01_antigravity_editor_tips/)  
34. Antigravity IDE: Sometimes, Fast mode is better than Planning mode\! : r/Bard \- Reddit, acessado em março 31, 2026, [https://www.reddit.com/r/Bard/comments/1pvicpd/antigravity\_ide\_sometimes\_fast\_mode\_is\_better/](https://www.reddit.com/r/Bard/comments/1pvicpd/antigravity_ide_sometimes_fast_mode_is_better/)  
35. Rules / Workflows \- Google Antigravity Documentation, acessado em março 31, 2026, [https://antigravity.google/docs/rules-workflows](https://antigravity.google/docs/rules-workflows)  
36. Google Antigravity Rules & Workflows SIMPLIFIED\! \- YouTube, acessado em março 31, 2026, [https://www.youtube.com/watch?v=jZ8c\_OlIc\_U](https://www.youtube.com/watch?v=jZ8c_OlIc_U)  
37. CHANGELOG.md \- Dokhacgiakhoa/antigravity-ide \- GitHub, acessado em março 31, 2026, [https://github.com/Dokhacgiakhoa/google-antigravity/blob/main/CHANGELOG.md](https://github.com/Dokhacgiakhoa/google-antigravity/blob/main/CHANGELOG.md)  
38. openclaw | Yarn, acessado em março 31, 2026, [https://classic.yarnpkg.com/en/package/openclaw](https://classic.yarnpkg.com/en/package/openclaw)  
39. Tutorial : Getting Started with Google Antigravity Skills, acessado em março 31, 2026, [https://medium.com/google-cloud/tutorial-getting-started-with-antigravity-skills-864041811e0d](https://medium.com/google-cloud/tutorial-getting-started-with-antigravity-skills-864041811e0d)  
40. Cloud Run AI Cookbook \- Google Cloud Documentation, acessado em março 31, 2026, [https://docs.cloud.google.com/run/docs/ai/cookbook](https://docs.cloud.google.com/run/docs/ai/cookbook)