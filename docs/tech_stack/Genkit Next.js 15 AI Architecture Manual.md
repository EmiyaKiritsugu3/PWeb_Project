# **Google Genkit (v1.x+) Native Integration in Next.js 15: The Definitive Architectural Encyclopedia**

## **1\. The Foundation & Paradigm Shift (From Basic to Mastery)**

The integration of Large Language Models (LLMs) into enterprise-scale web frameworks demands an architectural paradigm shift. It requires moving away from fragmented, ad-hoc HTTP API calls toward orchestrated, observable, and strongly typed execution graphs. Google Genkit (v1.x) establishes this foundation by functioning as a sophisticated AI orchestration layer that natively supports models from Google, Anthropic, OpenAI, and open-weight providers via a unified, extensible plugin ecosystem.1 When engineered within a Next.js 15 App Router environment, Genkit achieves its maximum architectural efficacy by intrinsically leveraging React 19 Server Actions. This integration effectively eradicates the boilerplate of traditional REST API routes, securing sensitive AI execution logic, proprietary prompts, and provider credentials entirely on the server.3

### **The Architecture of Genkit Initialization in Next.js 15**

The absolute correct initialization of Genkit in a Next.js 15 App Router environment mandates a strict singleton pattern. Modern serverless environments and Next.js hot-module replacement (HMR) during development can unpredictably tear down and spin up application instances. Initializing Genkit multiple times in these ephemeral lifecycles leads to memory leaks, detached OpenTelemetry tracing spans, and fatal plugin registration collisions.

Initialization must occur in a dedicated, isolated configuration file (e.g., src/ai/init.ts). This file must import the core genkit construct and inject the required model plugins (such as @genkit-ai/google-genai for Gemini or the corresponding Anthropic/OpenAI plugins).1 The registry must be instantiated exactly once, caching the instance on the global globalThis object during development to survive HMR rebuilds.

Furthermore, telemetry configuration must be explicitly defined during this singular initialization phase. Genkit utilizes OpenTelemetry internally, automatically instrumenting AI flows, model calls, and tool executions.7 By configuring the telemetry backend (e.g., @genkit-ai/google-cloud) during initialization, developers ensure that trace IDs and spans encompass the entirety of the Next.js server lifecycle, capturing the full lifecycle from the initial Next.js request down to the lowest-level token generation.9

### **The Mental Model of Genkit Flows and Next.js Server Actions**

To master Genkit, engineers must internalize the concept of "Flows." A Genkit Flow is fundamentally a Directed Acyclic Graph (DAG) of AI operations. It encompasses prompt compilation, vector store retrieval, tool execution, model invocation, and output schema validation, all wrapped within a strongly typed, observable asynchronous function.10 Flows are the primary unit of execution in the Genkit architecture, designed to provide built-in observability, type-safe inputs and outputs via Zod schemas, and deployable boundaries.1

The critical paradigm shift introduced in Next.js 15 is the direct architectural mapping of Genkit Flows to React Server Actions.4 Prior to the advent of Server Actions, executing a complex AI flow required exposing it via a dedicated HTTP API endpoint (using Express or Next.js Route Handlers). This forced developers to manually manage client-side fetch requests, handle complex loading states, implement cross-origin resource sharing (CORS) configurations, and write redundant type definitions for the API boundary.3

React Server Actions fundamentally rewrite this transport layer. An exported asynchronous function annotated with the "use server" directive acts as an implicit, automatically managed Remote Procedure Call (RPC) endpoint.3 By encapsulating a Genkit Flow within a Server Action, the architecture achieves a zero-API monolithic design. The frontend client invokes the Server Action as if it were a standard, local JavaScript function. Next.js natively intercepts this call, serializes the arguments via the React Server Components (RSC) wire format, and executes the Genkit Flow securely on the backend.4

| Architectural Component | Traditional Paradigm (API Route Handlers) | Next.js 15 Paradigm (Server Actions \+ Genkit Flows) |
| :---- | :---- | :---- |
| **Transport Layer Mechanism** | Explicit fetch() calls, REST/HTTP semantics. | Implicit RPC via the internal RSC wire format. |
| **Security & Authentication Boundary** | CORS management, manual CSRF protection, manual token verification. | Native "use server" encapsulation; guaranteed server-only execution. |
| **Type Safety Guarantees** | Disconnected; requires tRPC or OpenAPI schema generation. | End-to-end inferred TypeScript types derived directly from Zod schemas. |
| **Client State Orchestration** | Manual useState / useEffect orchestration. | Native React 19 useActionState and useOptimistic hooks. |
| **Deployment Complexity** | Requires maintaining routing schemas and explicit endpoint paths. | Deployed as a monolith without explicit routing configurations. |

This mapping guarantees that the AI execution environment remains impenetrable to the client. The browser never intercepts the intermediate retrieval steps, the underlying system prompts, or the raw, unvalidated LLM output. The client only receives the final, strictly validated JSON payload, drastically reducing the application's attack surface.

## **2\. Enterprise-Grade Architecture (The Gold Standard)**

Scaling a generative AI application beyond a prototype necessitates a rigorous physical and logical separation of concerns. Enterprise-grade Genkit architectures absolutely do not embed raw string prompts within standard application business logic, nor do they rely on implicit type casting for LLM outputs.

### **Industry-Standard Directory Structures and Separation of Concerns**

The industry-standard architectural pattern for Next.js 15 paired with Genkit mandates isolating AI orchestration from UI rendering and database logic. The architecture must be structured around Domain-Driven Design (DDD), treating prompts, tools, and retrievers as independent, testable entities.13

The Genkit dotprompt specification is the cornerstone of this separation.14 Dotprompt files (.prompt) operate as self-contained, executable prompt templates.15 They include YAML frontmatter that defines the exact model configuration, temperature, top-k values, input/output schemas, and tool bindings. This metadata is immediately followed by the prompt text, which utilizes Handlebars ({{variable}}) for dynamic context injection.16 By treating prompts as executable code, organizations decouple the "what" (the prompt logic) from the "how" (the TypeScript execution logic).14

By default, Genkit scans the root /prompts directory, but a highly engineered enterprise Next.js directory structure explicitly overrides this to look within a dedicated src/ai namespace, keeping all AI assets unified.13

| Directory Path | Architectural Responsibility |
| :---- | :---- |
| src/app/ | Next.js App Router. Contains Server/Client Components and route definitions. |
| src/app/actions/ | Next.js Server Actions ("use server"). Wraps Genkit flows to expose them to the UI. |
| src/ai/init.ts | The Genkit singleton initialization file. Configures plugins and OpenTelemetry. |
| src/ai/flows/ | Genkit Flows (ai.defineFlow). Orchestrates the business logic of AI execution. |
| src/ai/tools/ | External API connectors (ai.defineTool). Strongly typed functions the LLM can invoke. |
| src/ai/retrievers/ | Vector database search logic (RAG implementations via Pinecone, Chroma, etc.). |
| src/ai/prompts/ | .prompt files. Self-contained Dotprompt execution units. |
| src/ai/schemas/ | Shared Zod schemas utilized by both inputs, outputs, and database validation. |

This directory structure effectively resolves the "prompt spaghetti" anti-pattern.14 Prompt engineers or domain experts can modify .prompt files independently of the TypeScript logic. They can adjust temperatures or inject context via Handlebars partials (reusable templates prefixed with an underscore, e.g., \_guardrails.prompt) without requiring application recompilation or risking disruptions to the core business logic.13

### **Enforcing Structured Output via Zod Validation**

Large Language Models are inherently probabilistic token generators, which presents a fundamental challenge when integrating them into deterministic software systems. Enterprise architectures must establish rigid structural boundaries to process generative outputs. Genkit achieves this through native integration with the Zod schema validation library, establishing an absolute guarantee that the model will return strictly typed JSON instead of raw, unpredictable text.1

When an outputSchema is defined using Zod within a Genkit Flow or a .prompt file, the framework executes a complex background process. First, Genkit transpiles the Zod schema into a standard JSON Schema payload.18 This JSON Schema is then injected into the LLM's system instructions. For advanced models (such as Gemini 1.5 Pro or GPT-4o), Genkit interfaces directly with the provider's native structured output APIs, enabling constrained decoding.1 Constrained decoding mathematically restricts the model's output probabilities, ensuring it can only generate tokens that conform to the exact structural requirements of the provided JSON Schema.

Upon receiving the response from the model provider, Genkit intercepts the payload and processes it through the Zod schema's .parse() method.18 This constitutes a mandatory runtime validation phase. If the model hallucinates an invalid key, omits a required field, or provides an incorrect data type, the Zod parser immediately throws a validation error, halting execution.

This architectural pattern completely eradicates the danger of implicit type casting. Applications must never rely on native JSON.parse() combined with a TypeScript as Type assertion.14 Implicit casting creates a dangerous false sense of security, assuming the LLM obeyed instructions perfectly, which will inevitably result in catastrophic runtime panics and corrupt data entering downstream processing pipelines.

## **3\. Extreme Performance & Advanced Optimization**

Latency is the primary bottleneck and user-experience killer in generative AI applications. Time-to-First-Byte (TTFB) and total generation duration dictate the perceived performance of the system. Advanced Next.js 15 and Genkit architectures utilize two primary mechanisms to achieve extreme performance: native asynchronous streaming and parallel tool execution.

### **Native Streaming to React 19 Client Components**

Generative models process and emit tokens sequentially. Waiting for a massive, multi-paragraph response to generate entirely before transmitting the payload back to the client causes unacceptable latency, leaving the user staring at a loading spinner.20 Next.js 15 and React 19 introduce powerful streaming primitives that integrate flawlessly with Genkit's chunk-emission architecture.

Genkit flows support streaming via the streamSchema property and the ai.generateStream execution construct.6 When a Flow is configured to stream, it yields an AsyncGenerator. As the LLM produces tokens, Genkit emits discrete chunks of data.

In a Next.js 15 App Router environment, this streaming process is handled optimally using the new React 19 useActionState hook combined with Server Actions.5 The Server Action initiates the Genkit Flow on the backend and begins streaming the chunks over the network via Server-Sent Events (SSE) or React's internal multipart streaming protocol.25 The frontend state accumulates these chunks incrementally, rather than waiting to replace the state outright with the final payload.20

This architectural pattern requires a fundamental mental shift from traditional "fetch-then-render" mechanics to "render-as-you-fetch".20 The useActionState hook intelligently captures the previousState and the incoming formData, providing an isPending boolean to easily manage UI states.5 As the async generator yields chunks, the UI instantly displays the generative text as it forms. This architecture completely bypasses the need for manual useEffect API polling, complex WebSocket management, or third-party state synchronization libraries.

### **Parallel Tool and Function Calling**

In sophisticated Agentic architectures, an LLM frequently requires external data (e.g., querying a vector database, fetching real-time weather, or invoking an external calculator) to complete its reasoning process. When an interaction requires multiple disparate pieces of information, the naive architectural approach is to execute these tool calls serially. This means waiting for the first tool to resolve, returning the data to the LLM, waiting for the LLM to process it and request the second tool, and continuing this sequential loop.27 This serial execution drastically compounds latency, often resulting in interactions that take upwards of ten seconds.

Advanced Genkit architectures explicitly enforce Parallel Tool Calling.27 Modern foundational models are highly capable of determining when multiple tools can be invoked simultaneously without interdependent sequencing.28

To optimize this, developers define strongly typed, asynchronous tools using ai.defineTool.31 When a user prompt triggers the need for multiple tools, Genkit's generation engine captures the toolRequests array returned by the LLM. By leveraging explicit control mechanisms (returnToolRequests: true), or by relying on Genkit's automated parallel resolution engine, the Next.js server executes all independent tool requests concurrently via asynchronous event loops (e.g., Promise.all in Node.js).27

| Execution Model | Mathematical Latency Profile | Network Trips to LLM Provider |
| :---- | :---- | :---- |
| **Serial Tool Calling** | **![][image1]** \+ Model Overhead | ![][image2] interactions |
| **Parallel Tool Calling** | **![][image3]** \+ Model Overhead | ![][image4] interactions |

By mapping the tool executions to concurrent Promise.all wrappers, the overall I/O latency drops from the total sum of all execution times to merely the execution time of the single slowest tool in the batch. The aggregated responses are subsequently formatted into a unified array of ToolResponsePart objects and returned to the LLM in a single subsequent turn, drastically reducing the total completion time and network overhead.31

## **4\. Anti-Patterns & Deadly Traps (Strict Constraints)**

The intersection of Next.js 15 server-side environments and the non-deterministic nature of AI models introduces highly specific, often fatal failure modes. Designing resilient, enterprise-grade architectures requires the strict avoidance of the following deadly traps.

### **The Next.js Edge Runtime Trap**

A pervasive and often catastrophic anti-pattern occurs when developers attempt to execute heavy Genkit orchestration logic or specific authentication adapters within the Next.js Edge Runtime. The Next.js Edge Runtime is designed for ultra-low latency routing and provides only a highly restricted, limited subset of standard Node.js APIs.32 Specifically, it lacks full support for the native Node.js crypto module, gRPC bindings, and various file-system operations.33

When Genkit plugins, Firebase Admin SDKs, or OpenTelemetry backend exporters attempt to utilize these missing Node.js APIs, the application will compile successfully but experience fatal crashes at runtime.34

The absolute architectural rule to bypass this trap is to enforce the full Node.js runtime for any Next.js Route Handler or Server Action that processes Genkit flows. This is achieved by explicitly declaring export const runtime \= "nodejs"; at the top of the file housing the Server Action.35 Developers must never rely on the experimental-edge runtime for complex AI orchestration, as polyfills cannot adequately simulate the robust execution environments required by the underlying Genkit plugins.

### **Prompt Injection and Tool Scope Vulnerabilities**

Direct and indirect prompt injections represent the most critical vulnerabilities in generative AI applications.37 Direct prompt injection occurs when a malicious user inputs text designed to override system instructions. Indirect prompt injection is far more insidious: it occurs when the LLM ingests external data (such as parsing a customer's email or reading a webpage via a tool) that contains hidden commands instructing the LLM to execute malicious actions.37 If a Genkit tool is granted unfettered access to an internal database, an indirect prompt injection attack could trick the model into executing destructive queries or exfiltrating sensitive data.39

The deadly trap is treating the LLM as a trusted execution engine. The architectural safeguard is the strict enforcement of the Principle of Least Privilege combined with rigorous input/output validation.39 Tools defined via ai.defineTool must never accept raw SQL strings, shell commands, or unvalidated parameters directly from the model.43 Tool inputSchema parameters must be highly restricted via Zod enumerations or rigid regex patterns.

Furthermore, flows must utilize Genkit's internal authorization contexts (context.auth) to explicitly verify the requesting user's permissions *before* invoking any underlying tool logic. This ensures the LLM cannot physically act beyond the bounds of the authenticated user's access level, mitigating the impact of any successful prompt hijacking.45

### **Exposing Secrets and Implicit Casting Dangers**

Exposing provider API keys (e.g., GEMINI\_API\_KEY, OPENAI\_API\_KEY) to the client browser is a catastrophic security failure. Keys must strictly reside in server-side .env files and must never be prefixed with NEXT\_PUBLIC\_.46 Genkit flows must be exclusively executed on the server via Server Actions, acting as an impenetrable, secure proxy between the user's client and the external model provider.

Equally dangerous is the trap of handling AI responses without implementing Zod validation.14 Implicitly casting an LLM response (e.g., const data \= JSON.parse(response) as UserData) entirely circumvents runtime validation. If the model hallucinates an invalid structural hierarchy, the application will inevitably crash during downstream data processing. All generations must utilize the output: { schema: ZodSchema } parameter, forcing Genkit to mathematically validate and strip invalid properties before the payload ever interacts with the application's business logic.18

### **Telemetry and Developer UI Neglect**

Deploying AI applications to production without implementing distributed tracing is an operational anti-pattern. Genkit features deep, native integration with OpenTelemetry, allowing it to export traces to systems like Google Cloud Trace.7 Neglecting to initialize the @genkit-ai/google-cloud plugin leaves engineering teams entirely blind to anomalous token usage spikes, hidden generation latency, and silent tool failure rates.7

Furthermore, failing to utilize Genkit's local Developer UI (npx genkit start) during the engineering phase leads to highly inefficient prompt debugging.1 The Developer UI provides granular, visual trace inspections for every single step of a flow, making it an indispensable tool for identifying exactly which tool call, retrieval step, or sub-prompt is introducing latency or causing logical deviations.

## **5\. State-of-the-Art Code Snippets**

The following curated snippets demonstrate exact, high-density implementation architectures for Next.js 15 and Genkit, strictly adhering to the paradigms established in this encyclopedia.

### **Domain 1: Initialization & Config**

**Snippet 1 (Foundational): Secure Server-Side Initialization**

*Applicability Rule: Use this foundational singleton pattern in src/ai/init.ts to guarantee Genkit and its core model plugins are instantiated exactly once across the Next.js server lifecycle, avoiding memory leaks during HMR.*

TypeScript

import { genkit } from 'genkit';  
import { googleAI } from '@genkit-ai/google-genai';

// Initialize the registry as a singleton to prevent HMR memory leaks in Next.js  
export const ai \= genkit({  
  plugins: \[googleAI()\],  
  // Define default model configurations to standardize outputs globally  
  model: googleAI.model('gemini-2.5-flash', {  
    temperature: 0.4,  
    maxOutputTokens: 1024,  
  }),  
});

**Snippet 2 (Enterprise-Grade): Production Telemetry & Edge Bypass**

*Applicability Rule: Use this configuration in production to forcibly bind execution to the Node.js runtime, configure a custom prompt directory, and export all OpenTelemetry traces to Google Cloud Trace for profound observability.*

TypeScript

import { genkit } from 'genkit';  
import { googleAI } from '@genkit-ai/google-genai';  
import { enableGoogleCloudTelemetry } from '@genkit-ai/google-cloud';

// Enforce standard Node.js environment; never use 'edge' for AI tracing/crypto operations  
export const runtime \= 'nodejs';

// Bind OpenTelemetry exporters to GCP for trace, metrics, and log correlation  
enableGoogleCloudTelemetry({  
  projectId: process.env.GOOGLE\_CLOUD\_PROJECT\_ID,  
  forceDevExport: process.env.NODE\_ENV \=== 'development',  
});

export const ai \= genkit({  
  plugins: \[googleAI()\],  
  promptDir: './src/ai/prompts', // Explicitly route to the enterprise directory structure  
});

### **Domain 2: Structured Generation**

**Snippet 3 (Foundational): Strictly Typed Object Generation**

*Applicability Rule: Use this pattern to force the LLM to return a validated, strictly typed JavaScript object, entirely eliminating raw text parsing and implicit assertions.*

TypeScript

import { z } from 'genkit';  
import { ai } from '@/ai/init';

const UserProfileSchema \= z.object({  
  fullName: z.string().describe('The identified full name from the text'),  
  age: z.number().int().positive(),  
  tags: z.array(z.string()).describe('Exactly three descriptive keywords'),  
});

export async function extractProfile(textData: string) {  
  // Genkit transpiles the Zod schema to JSON Schema to enforce constrained decoding  
  const { output } \= await ai.generate({  
    prompt: \`Extract the user profile from this text: ${textData}\`,  
    output: { schema: UserProfileSchema },  
  });  
    
  // Output is mathematically guaranteed to match z.infer\<typeof UserProfileSchema\>  
  return output;   
}

**Snippet 4 (Enterprise-Grade): Server Action with Schema Validation & Context Auth**

*Applicability Rule: Use this architecture to map a secure Genkit Flow to a Next.js Server Action while authenticating the payload context to prevent unauthorized model invocation.*

TypeScript

'use server';

import { z, UserFacingError } from 'genkit';  
import { ai } from '@/ai/init';  
import { getServerSession } from '@/lib/auth';

const FinancialReportSchema \= z.object({  
  revenue: z.number(),  
  growth: z.number().min(-100).max(1000),  
  riskFactors: z.array(z.string()),  
});

// The Flow encapsulates observability, Zod validation, and logic  
export const generateFinancialReport \= ai.defineFlow({  
  name: 'generateFinancialReport',  
  inputSchema: z.object({ quarter: z.string() }),  
  outputSchema: FinancialReportSchema,  
}, async (input, { context }) \=\> {  
  // Strict authorization gate intercepting the flow execution  
  if (\!context?.userId) {  
    throw new UserFacingError('UNAUTHENTICATED', 'Missing valid session context.');  
  }

  const { output } \= await ai.generate({  
    prompt: \`Generate the financial breakdown for ${input.quarter}.\`,  
    output: { schema: FinancialReportSchema },  
  });

  if (\!output) throw new Error("Generation failed to meet schema constraints");  
  return output;  
});

// Next.js Server Action wrapper injecting the secure auth context  
export async function executeReportAction(quarter: string) {  
  const session \= await getServerSession();  
  // Pass the verified user ID directly into the flow's context  
  return generateFinancialReport({ quarter }, { withLocalAuthContext: { userId: session?.id } });  
}

### **Domain 3: Dotprompt Mastery**

**Snippet 5 (Foundational): Basic YAML Frontmatter & Handlebars**

*Applicability Rule: Use this Dotprompt configuration ONLY when defining isolated prompts that require basic variable injection and strict Zod output schemas defined directly in the file.*

YAML

\---  
\# src/ai/prompts/sentiment.prompt  
model: googleai/gemini-2.5-flash  
config:  
  temperature: 0.1  
input:  
  schema:  
    reviewText: string  
output:  
  format: json  
  schema:  
    sentiment: enum(POSITIVE, NEUTRAL, NEGATIVE)  
    confidenceScore: number  
\---  
Analyze the following customer review and determine the precise sentiment.  
Review: {{reviewText}}

**Snippet 6 (Enterprise-Grade): Multi-Message System Prompts & Partial Injections**

*Applicability Rule: Use this advanced Dotprompt structure when constructing multi-turn interactions that require reusable system guardrails via Handlebars partials and explicit external tool bindings.*

YAML

\---  
\# src/ai/prompts/customerServiceAgent.prompt  
model: googleai/gemini-2.5-pro  
config:  
  temperature: 0.4  
tools:  
  \- checkOrderDatabase  
input:  
  schema:  
    customerId: string  
    userQuery: string  
\---  
{{role "system"}}  
{{\> \_enterpriseGuardrails }}  
You are a tier-3 support agent. Use the tools provided to answer queries.  
Never expose internal system IDs. Customer ID is: {{customerId}}.

{{role "user"}}  
{{userQuery}}

### **Domain 4: Tool Creation & Function Calling**

**Snippet 7 (Foundational): Strongly Typed External Tool Definition**

*Applicability Rule: Use ai.defineTool with exhaustive Zod descriptions to provide the LLM with deterministic access to external APIs, ensuring it understands exactly what the tool requires.*

TypeScript

import { z } from 'genkit';  
import { ai } from '@/ai/init';

export const checkWeatherTool \= ai.defineTool({  
  name: 'checkWeather',  
  description: 'Fetches the real-time weather conditions for a given US city.',  
  inputSchema: z.object({  
    city: z.string().describe('The US city name, e.g., Seattle'),  
    state: z.string().length(2).describe('Two-letter state code, e.g., WA'),  
  }),  
  outputSchema: z.object({ temperature: z.number(), condition: z.string() }),  
}, async ({ city, state }) \=\> {  
  // Execute external HTTP fetch or database query securely  
  const res \= await fetch(\`https://api.weather.com/v1/${state}/${city}\`);  
  return await res.json();  
});

**Snippet 8 (Enterprise-Grade): Explicit Parallel Tool Resolution Array**

*Applicability Rule: Use this parallel resolution pattern when manually intercepting toolRequests to execute independent functions concurrently via Promise.all, slashing overall I/O latency.*

TypeScript

import { ToolResponsePart } from 'genkit';  
import { ai } from '@/ai/init';  
import { checkWeatherTool, fetchUserDbTool } from '@/ai/tools';

export async function manualParallelToolAgent(prompt: string) {  
  let response \= await ai.generate({  
    prompt,  
    tools:,  
    returnToolRequests: true, // Hijack automated resolution for manual concurrent mapping  
  });

  const toolRequests \= response.toolRequests;  
  if (toolRequests && toolRequests.length \> 0) {  
    // Map requests to promises and execute concurrently via Promise.all  
    const toolResponses: ToolResponsePart \= await Promise.all(  
      toolRequests.map(async (part) \=\> {  
        if (part.toolRequest.name \=== 'checkWeather') {  
          return {  
            toolResponse: {  
              name: part.toolRequest.name,  
              ref: part.toolRequest.ref,  
              output: await checkWeatherTool(part.toolRequest.input),  
            }  
          };  
        }  
        throw new Error(\`Tool ${part.toolRequest.name} not found\`);  
      })  
    );  
    // Recursively return tool payloads back to the LLM for final synthesis  
    response \= await ai.generate({  
      messages: response.messages,  
      prompt: toolResponses,  
    });  
  }  
  return response.text;  
}

### **Domain 5: Streaming & UI Integration**

**Snippet 9 (Foundational): Server-Side Chunk Emitter (Flow)**

*Applicability Rule: Use this Flow configuration to pipe an ai.generateStream through a sendChunk callback, setting up the backend to continuously emit text tokens to the Next.js client.*

TypeScript

'use server';

import { z } from 'genkit';  
import { ai } from '@/ai/init';

export const streamingChatFlow \= ai.defineFlow({  
  name: 'streamingChatFlow',  
  inputSchema: z.string(),  
  streamSchema: z.string(), // Define the shape of the emitted chunk  
}, async (prompt, { sendChunk }) \=\> {  
  const { stream, response } \= ai.generateStream({  
    model: 'gemini-2.5-flash',  
    prompt,  
  });

  // Yield tokens synchronously to the network layer  
  for await (const chunk of stream) {  
    sendChunk(chunk.text);  
  }  
    
  // Wait for the full generation to conclude for trace completeness  
  const { text } \= await response;  
  return text;  
});

**Snippet 10 (Enterprise-Grade): React 19 Client Accumulation via useActionState**

*Applicability Rule: Use this React 19 Client Component to cleanly bind the streamed Next.js Server Action to the UI without requiring complex useEffect polling or suffering memory leaks.*

TypeScript

'use client';

import { useActionState } from 'react';  
import { streamingChatFlow } from '@/ai/flows/chat';

export default function ChatInterface() {  
  // useActionState orchestrates the form submission and stream accumulation  
  const \= useActionState(  
    async (previousState: string, formData: FormData) \=\> {  
      const query \= formData.get('query') as string;  
      let accumulated \= '';  
        
      // Consume the Server Action stream seamlessly  
      const stream \= await streamingChatFlow.stream(query);  
      for await (const chunk of stream) {  
        accumulated \+= chunk;  
        // The UI automatically reflects 'accumulated' as the state updates  
      }  
      return accumulated;  
    },  
    "" // Initial state  
  );

  return (  
    \<form action={formAction} className="flex flex-col gap-4"\>  
      \<input name="query" type="text" className="border p-2" required /\>  
      {/\* isPending allows native tracking of the RPC request lifecycle \*/}  
      \<button type="submit" disabled={isPending}\>  
        {isPending? 'Generating...' : 'Send'}  
      \</button\>  
      \<article className="prose bg-gray-100 p-4 min-h-32"\>  
        {streamedText}  
      \</article\>  
    \</form\>  
  );  
}

## **6\. Strict AI Implementation Directives (Execution Rules)**

To ensure operational security, deterministic generation, and absolute architectural compatibility within a Next.js 15 environment, the following immutable laws must be strictly obeyed across the codebase:

* **Never rely on implicit JSON casting:** Never accept raw string outputs for data processing; strictly enforce Zod schemas via the output: { schema } parameter to guarantee mathematically validated, deterministic object structures.  
* **Always encapsulate Genkit generation logic:** Never construct Genkit instances or attempt to initiate model generation from a Next.js Client Component; encapsulate all execution logic inside "use server" Server Actions to securely isolate API keys from browser inspection.  
* **Never deploy to the Edge Runtime:** Always specify export const runtime \= "nodejs"; in Next.js Server Action files managing Genkit flows to definitively prevent cryptographic module and gRPC failures in V8 isolate edge workers.  
* **Always implement context-aware authorization:** Never allow a Flow to execute external tools without rigorously validating the caller; pass verified user IDs via context.auth to enforce identity boundaries before tool execution begins, nullifying prompt-hijacking attempts.  
* **Never intertwine prompts with TypeScript logic:** Always extract raw prompt strings, system guidelines, and formatting instructions into isolated .prompt files within a unified directory to maintain strict separation of concerns and enable version control.  
* **Always enable OpenTelemetry in production:** Never deploy an orchestration graph to production without initializing @genkit-ai/google-cloud (or equivalent telemetry backend); deep visibility into trace spans and token usage is mathematically required for SLA maintenance and debugging.  
* **Never execute independent tools serially:** Always dynamically analyze LLM toolRequests arrays for concurrency; when multiple non-dependent tools are requested, enforce parallel resolution via Promise.all to minimize cumulative execution latency.  
* **Always use React 19 streaming primitives for high-latency models:** Never block the main UI thread waiting for a multi-second LLM response; always utilize ai.generateStream in conjunction with useActionState or Server-Sent Events to continuously push incremental chunks to the client interface.

#### **Referências citadas**

1. Get started with Genkit, acessado em março 27, 2026, [https://genkit.dev/docs/js/get-started/](https://genkit.dev/docs/js/get-started/)  
2. Genkit \- Open-source AI framework by Google in JavaScript, Go and Python, acessado em março 27, 2026, [https://genkit.dev/](https://genkit.dev/)  
3. Next.js 15 Server Actions: Complete Guide with Real Examples (2026) | by Saad Minhas, acessado em março 27, 2026, [https://medium.com/@saad.minhas.codes/next-js-15-server-actions-complete-guide-with-real-examples-2026-6320fbfa01c3](https://medium.com/@saad.minhas.codes/next-js-15-server-actions-complete-guide-with-real-examples-2026-6320fbfa01c3)  
4. Call Genkit flows and Next.js applications easily with React Server Actions \- YouTube, acessado em março 27, 2026, [https://www.youtube.com/shorts/jUejhLfUd64](https://www.youtube.com/shorts/jUejhLfUd64)  
5. React's New useActionState Hook. React 19 introduced several powerful… | by Rudra Subudhi | Medium, acessado em março 27, 2026, [https://medium.com/@rudra-subudhi/reacts-new-useactionstate-hook-6f312a11eb67](https://medium.com/@rudra-subudhi/reacts-new-useactionstate-hook-6f312a11eb67)  
6. Next.js Integration \- Genkit, acessado em março 27, 2026, [https://genkit.dev/docs/js/frameworks/nextjs/](https://genkit.dev/docs/js/frameworks/nextjs/)  
7. Observability \- Genkit \- Mintlify, acessado em março 27, 2026, [https://mintlify.com/firebase/genkit/concepts/observability](https://mintlify.com/firebase/genkit/concepts/observability)  
8. Monitoring and Observability with Genkit Go, acessado em março 27, 2026, [https://mastering-genkit.github.io/mastering-genkit-go/chapters/13-monitoring-and-observability.html](https://mastering-genkit.github.io/mastering-genkit-go/chapters/13-monitoring-and-observability.html)  
9. Google Cloud Plugin \- Genkit, acessado em março 27, 2026, [https://genkit.dev/docs/js/integrations/google-cloud/](https://genkit.dev/docs/js/integrations/google-cloud/)  
10. Defining AI workflows | Genkit, acessado em março 27, 2026, [https://genkit.dev/docs/js/flows/](https://genkit.dev/docs/js/flows/)  
11. Full-Stack AI Made Easy with Genkit | by Pavel J \- Medium, acessado em março 27, 2026, [https://medium.com/@pavel.jbanov/full-stack-ai-made-easy-with-genkit-c0c393118cde](https://medium.com/@pavel.jbanov/full-stack-ai-made-easy-with-genkit-c0c393118cde)  
12. Mastering React 19 Part 2: Server Components & Server Actions \[Tutorial\] \- Scalable Path, acessado em março 27, 2026, [https://www.scalablepath.com/react/react-19-server-components-server-actions](https://www.scalablepath.com/react/react-19-server-components-server-actions)  
13. Managing prompts with Dotprompt \- Genkit, acessado em março 27, 2026, [https://genkit.dev/docs/js/dotprompt/](https://genkit.dev/docs/js/dotprompt/)  
14. MVC for AI: How to Decouple Your Prompts from Your Application Logic using Dotprompts | by Amirkia Rafiei Oskooei | Medium, acessado em março 27, 2026, [https://medium.com/@amirkiarafiei/mvc-for-ai-how-to-decouple-your-prompts-from-your-application-logic-58eced1cc861](https://medium.com/@amirkiarafiei/mvc-for-ai-how-to-decouple-your-prompts-from-your-application-logic-58eced1cc861)  
15. Get started | Dotprompt \- Google, acessado em março 27, 2026, [https://google.github.io/dotprompt/getting-started/](https://google.github.io/dotprompt/getting-started/)  
16. google/dotprompt: Executable GenAI prompt templates \- GitHub, acessado em março 27, 2026, [https://github.com/google/dotprompt](https://github.com/google/dotprompt)  
17. Managing prompts with Dotprompt | Genkit, acessado em março 27, 2026, [https://genkit.dev/docs/python/dotprompt/](https://genkit.dev/docs/python/dotprompt/)  
18. Generating content with AI models | Genkit, acessado em março 27, 2026, [https://genkit.dev/docs/js/models/](https://genkit.dev/docs/js/models/)  
19. \[JS\] Headline examples of structured output do not work · Issue \#3719 · firebase/genkit, acessado em março 27, 2026, [https://github.com/firebase/genkit/issues/3719](https://github.com/firebase/genkit/issues/3719)  
20. Streaming AI responses in React: the mental shift from fetch-then-render to render-as-you-fetch : r/reactjs \- Reddit, acessado em março 27, 2026, [https://www.reddit.com/r/reactjs/comments/1q3nudo/streaming\_ai\_responses\_in\_react\_the\_mental\_shift/](https://www.reddit.com/r/reactjs/comments/1q3nudo/streaming_ai_responses_in_react_the_mental_shift/)  
21. Stream Text \- Next.js \- AI SDK, acessado em março 27, 2026, [https://ai-sdk.dev/cookbook/next/stream-text](https://ai-sdk.dev/cookbook/next/stream-text)  
22. Beyond the Spinner: Building Responsive AI Apps with Genkit Streaming \- Medium, acessado em março 27, 2026, [https://medium.com/firebase-developers/streaming-made-easy-with-genkit-a6f9da52a76a](https://medium.com/firebase-developers/streaming-made-easy-with-genkit-a6f9da52a76a)  
23. React 19: useActionState \- YouTube, acessado em março 27, 2026, [https://www.youtube.com/watch?v=p\_wnN5VR9Ok](https://www.youtube.com/watch?v=p_wnN5VR9Ok)  
24. React 19: New hook useActionState \- DEV Community, acessado em março 27, 2026, [https://dev.to/garciadiazjaime/react-19-new-hook-useactionstate-1ln3](https://dev.to/garciadiazjaime/react-19-new-hook-useactionstate-1ln3)  
25. Real-time AI in Next.js: How to stream responses with the Vercel AI SDK \- LogRocket Blog, acessado em março 27, 2026, [https://blog.logrocket.com/nextjs-vercel-ai-sdk-streaming/](https://blog.logrocket.com/nextjs-vercel-ai-sdk-streaming/)  
26. React 19 Server Actions & useActionState: The Complete Form Handling Guide \- Noqta, acessado em março 27, 2026, [https://noqta.tn/en/tutorials/react-19-server-actions-useactionstate-form-handling-2026](https://noqta.tn/en/tutorials/react-19-server-actions-useactionstate-form-handling-2026)  
27. Tips & Tricks: Parallel Tool Calling in ADK | by \#TheGenAIGirl — code, community, and GenAI. | Google Cloud \- Medium, acessado em março 27, 2026, [https://medium.com/google-cloud/tips-tricks-parallel-tool-calling-in-adk-edc9eebf6954](https://medium.com/google-cloud/tips-tricks-parallel-tool-calling-in-adk-edc9eebf6954)  
28. Parallel tool calling where there is an ordering dependency \- OpenAI Developer Community, acessado em março 27, 2026, [https://community.openai.com/t/parallel-tool-calling-where-there-is-an-ordering-dependency/1086995](https://community.openai.com/t/parallel-tool-calling-where-there-is-an-ordering-dependency/1086995)  
29. Function calling with the Gemini API | Google AI for Developers, acessado em março 27, 2026, [https://ai.google.dev/gemini-api/docs/function-calling](https://ai.google.dev/gemini-api/docs/function-calling)  
30. generative-ai/gemini/function-calling/parallel\_function\_calling.ipynb at main \- GitHub, acessado em março 27, 2026, [https://github.com/GoogleCloudPlatform/generative-ai/blob/main/gemini/function-calling/parallel\_function\_calling.ipynb](https://github.com/GoogleCloudPlatform/generative-ai/blob/main/gemini/function-calling/parallel_function_calling.ipynb)  
31. Tool calling | Genkit, acessado em março 27, 2026, [https://genkit.dev/docs/js/tool-calling/](https://genkit.dev/docs/js/tool-calling/)  
32. Edge Runtime \- API Reference \- Next.js, acessado em março 27, 2026, [https://nextjs.org/docs/app/api-reference/edge](https://nextjs.org/docs/app/api-reference/edge)  
33. Fixing Node.js 'crypto' Module Edge Runtime Problems in Next.js Auth Implementation, acessado em março 27, 2026, [https://medium.com/@python-javascript-php-html-css/fixing-node-js-crypto-module-edge-runtime-problems-in-next-js-auth-implementation-f8273a41958d](https://medium.com/@python-javascript-php-html-css/fixing-node-js-crypto-module-edge-runtime-problems-in-next-js-auth-implementation-f8273a41958d)  
34. Issues with Firebase Admin in Next.js and Edge Runtime \- How to Avoid Runtime Conflicts? : r/nextjs \- Reddit, acessado em março 27, 2026, [https://www.reddit.com/r/nextjs/comments/1htkjma/issues\_with\_firebase\_admin\_in\_nextjs\_and\_edge/](https://www.reddit.com/r/nextjs/comments/1htkjma/issues_with_firebase_admin_in_nextjs_and_edge/)  
35. How to Fix 'Edge Runtime' Limitations in Next.js \- OneUptime, acessado em março 27, 2026, [https://oneuptime.com/blog/post/2026-01-24-fix-nextjs-edge-runtime-limitations/view](https://oneuptime.com/blog/post/2026-01-24-fix-nextjs-edge-runtime-limitations/view)  
36. Genkit advice : r/nextjs \- Reddit, acessado em março 27, 2026, [https://www.reddit.com/r/nextjs/comments/1np1lpb/genkit\_advice/](https://www.reddit.com/r/nextjs/comments/1np1lpb/genkit_advice/)  
37. Indirect Prompt Injection: Generative AI's Greatest Security Flaw, acessado em março 27, 2026, [https://cetas.turing.ac.uk/publications/indirect-prompt-injection-generative-ais-greatest-security-flaw](https://cetas.turing.ac.uk/publications/indirect-prompt-injection-generative-ais-greatest-security-flaw)  
38. Why Prompt Injection Attacks Are GenAI's \#1 Vulnerability \- Galileo AI, acessado em março 27, 2026, [https://galileo.ai/blog/ai-prompt-injection-attacks-detection-and-prevention](https://galileo.ai/blog/ai-prompt-injection-attacks-detection-and-prevention)  
39. LLM01:2025 Prompt Injection \- OWASP Gen AI Security Project, acessado em março 27, 2026, [https://genai.owasp.org/llmrisk/llm01-prompt-injection/](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)  
40. \[2506.08837\] Design Patterns for Securing LLM Agents against Prompt Injections \- arXiv, acessado em março 27, 2026, [https://arxiv.org/abs/2506.08837](https://arxiv.org/abs/2506.08837)  
41. Foundational best practices for securing your cloud deployment | Google Cloud Blog, acessado em março 27, 2026, [https://cloud.google.com/blog/topics/developers-practitioners/foundational-best-practices-securing-your-cloud-deployment](https://cloud.google.com/blog/topics/developers-practitioners/foundational-best-practices-securing-your-cloud-deployment)  
42. Securing AI agents with genkit : r/Firebase \- Reddit, acessado em março 27, 2026, [https://www.reddit.com/r/Firebase/comments/1pdevey/securing\_ai\_agents\_with\_genkit/](https://www.reddit.com/r/Firebase/comments/1pdevey/securing_ai_agents_with_genkit/)  
43. How to Prevent Prompt Injection \- OffSec, acessado em março 27, 2026, [https://www.offsec.com/blog/how-to-prevent-prompt-injection/](https://www.offsec.com/blog/how-to-prevent-prompt-injection/)  
44. Best practices for using service accounts securely | Identity and Access Management (IAM), acessado em março 27, 2026, [https://docs.cloud.google.com/iam/docs/best-practices-service-accounts](https://docs.cloud.google.com/iam/docs/best-practices-service-accounts)  
45. Authorization and integrity \- Genkit, acessado em março 27, 2026, [https://genkit.dev/docs/js/deployment/authorization/](https://genkit.dev/docs/js/deployment/authorization/)  
46. Getting Started: Server and Client Components \- Next.js, acessado em março 27, 2026, [https://nextjs.org/docs/app/getting-started/server-and-client-components](https://nextjs.org/docs/app/getting-started/server-and-client-components)  
47. Developer Tools \- Genkit, acessado em março 27, 2026, [https://genkit.dev/docs/js/devtools/](https://genkit.dev/docs/js/devtools/)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALAAAAAXCAYAAACrrsUIAAAFBklEQVR4Xu2aWawlQxjHP0sw1kzshsT2QIh4GGJ3QiK2xJ6QyEwwDyLWWGJ37YTggViHCYIxxvogk8EDEkOIINaQScT+YEsQRPh+qerbdb5bt0939emrQ/2Sf+aer7rnVP/7O9VfVbVIJpOZZE3Vk6pZtiGTSWQ71d022BUPqA62wUymJReqzvbqjJNUT9tgJjMGVlO947W9aZvCql4nqB5S3a96XPWiuCRdpTx0Er7gG9UhJn6516+qF1TLVW+q/lat9J8R56LP3GmtmG8DDaAvX/p/0afi+oreDuJ/iHvatGVb1X422CNSvbQ+hl7GfKzj5Sled9mGkN1Vb3hdpFo7aNtY9brqwSBWcIDqK5ma3O977RrEThd3IWGpcaDXM0EslcdsoCbbqN5TbRDEFqv+9Fo3iF+pOi/4nMq+qjNtsEekeBnzEQovYz7W8XI9r99k+P8YIidwTuCQFC9jPkLnCUyS/aA6xivGseKSb08Tn1A9ZWL8GG7wCnlU3IWsH8T4bnR9EEsFo1LAxENN7GvVq14hJJ0tl1KgfOhzAqd4GfMRCi9DCh+beMmAOOV4MvpDcUtgVewhLoHtbJDzbjSxs8TVeCiEkXqZiTEaoyNMPIUlNlCTW2X4CbKzuGu9xCtkQrWZiaWwv/Q7gZn7NMX6CKGXIRPifGzi5bOqC2zwJnFfcJhtMBwu7rhzTPwt1bkmFmMXcedTnnRFagJbilJnH68uGEi/E7gLL9uyUHVLGODX8rnqF3EbEVUwytIR6tUQVg/mmViMM8Sdv5dtGCPjMp3R5yfV6l5dMJD/RwKHXraFHHwkDPCIJ6lY5qpiHdUXqo9Va5i2T1QnmlgMJmnU2VUXwjrf3jYYYUvVZRG9G4khW/ZUQf++l+knlWuJe4wxEnBz2C2qgpHH9gfdp3ouEj/KnTYjsGTKE9H2AU3n5WyvURQ//iovm3KtmFKX2SIJPKreYTeE446zDcoK1Wk2aGCt+EfVUtsg5YXeJq7Qb1NijGPU4AkRq/ULKJd28H8zgqbenIH8t0dgfBzlZVNuVy2ywQ/EbTBMB5MrNiOusQ2e52V00rHUxoWMqpWvk6nFfhPamg5XiOvrbrbBc6+4fgLe8GRKYSDpCWyXqYDRlKWmkNhxdWnrJT6O8rIpD4ub/A1BTfuX6mjboJwqrj4+2TYE3Cxux64KbjgXwkSuij4k8Cuqb8U9NWJsrtrC/321xNfG6zCQtASmfPlOyhGugBk6q0nFOulG4nbA2FFFTWnrJT5WeclyLfUsWiAuxygPqkoo9iiOtEGYK+5kSgnEew1c9FWqOcFxMQ4SVweH7CjDW4kYTgJTIvB5ujr330rg46XsK/38PfiMZpWHTsKi/UsyvOHThIGkJTB1KAv63DNUQD9XStmfDcVt0bMhkbIpkeKl9dF6GfpIot7jVZQYDJiXTh5Rwo8S/SzDewhjgfoV43ayDQmQwLELqEuK6SlsIu4HP8c2NGAgaQk8U8yEl5SvqHiisSFmN8pgvtdC2zAOcgKnMZCcwL1IYOBG3GmDCZDAvMGWCsuCXcN7IYuknCBdXDY1gqXJTW2wR3TtJTtwvDeBgKW5j1RbiZv0h7zs1dkeAqMwa5ptZpskwmviCv/zTVufuEPK+g49MdycqQnv1vD+S/EODAMC957t6HBewau9vEZZ+SrlOGBE4WWdUTt6mUxdthZXNrBEiDKZTCbTC/4Btp88YSYj4J8AAAAASUVORK5CYII=>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAYCAYAAABXysXfAAABa0lEQVR4Xu2WPShGYRTHTxElpcwmFiYzSjEbZcIgq0UhAzL4FsrK6GtiJwZik91gUJLFxyIT/9M5cd/TzX3u6Sb0/OrX2/2f+9b99zz3eV+iSCSSQg2chXPqnya4zKp6Ad/hDaxIzFvhrcrzR7iQmIfQb4NA6uA93ICvJIXYTHrhOckD95lZtXoGK80shG0bOHiC82omm7AJvsBTM2tTJ00eyo4NHOQqc6KfaySr05iYjakdiSwPuzZwEFSmXl3X6waSMiufd8jDsJ4txuzZwAGXyTwABtXuRLYPn2EVLNdr1ktRZTJXZkutTWSdJKszBNvhuJpFGcl9E8arlIwdla8FwWX4FP32JP1XZY5UyyW8hjOwRfVS1DZbVFNphsuqZYBkdR5I3hvWy4+UGYE9qoVPrjt4YAcOiiqzpJbQBQ/hG8lWYqdL7hCm4LANHXjL8N8qfs5j+tolLGd53rdC8Zb5lfCPciQSiRTLB8QcZqaU3dplAAAAAElFTkSuQmCC>

[image3]: <data:image/png;base64,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>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAYCAYAAADDLGwtAAAAm0lEQVR4XmNgGIZAGIjnQ/FRID4ExH5QjAIWALEEFINAHhD/hWJjqBiDChA/BmJHKAYBJiB+CcWLoGIMikD8DYhjoRgG7kDxdpgA0QqxAXkg/g/FbWhyKGAiED+HYhk0OTiwAOIHQKwBxRhAHIovAbEmmhwcgIJjCxQ7ocnNRuYQrbABiDdBcS0UN0NxD0yRPgMiKLDhDJjCkQcAasErnIgOOF8AAAAASUVORK5CYII=>