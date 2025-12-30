# Design Document: AI Agent Dynamic UI

## Overview

This design describes an AI-powered agent application built with Next.js 14 that implements the ReAct (Reasoning + Acting) pattern. The system enables an LLM to generate declarative JSON component structures (VM2 Components) that are dynamically rendered as interactive React UIs. The architecture follows a three-layer model: UI Structure (JSON definitions), Application State (Zustand store), and Client Rendering (React components).

The core innovation is the VM2 Component system—a secure, whitelist-based approach to generative UI where the LLM produces structured data rather than executable code. This enables dynamic, context-aware interfaces while maintaining security through strict schema validation and component whitelisting.

## Architecture

### Project Setup

The project files are generated manually (not using `npx create-next-app`). All initial project configuration files, Next.js structure, and shadcn/ui components are created directly by the implementation process.

**Manual File Generation Includes:**
- `package.json` with all dependencies
- `next.config.js` configuration
- `tailwind.config.js` with shadcn/ui preset
- `jsconfig.json` for path aliases
- `app/` directory structure (layout.jsx, page.jsx, globals.css)
- `components/ui/` shadcn components (button, input, select, checkbox, alert, table, card)
- `.env.example` for environment variables

**Key Dependencies:**
```json
{
  "dependencies": {
    "next": "14.x",
    "react": "^18",
    "react-dom": "^18",
    "@mistralai/mistralai": "^1.x",
    "zustand": "^4.x",
    "lucide-react": "^0.x",
    "class-variance-authority": "^0.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x"
  },
  "devDependencies": {
    "tailwindcss": "^3.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x"
  }
}
```

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │   Main Page     │  │  VM2 Renderer   │  │    Zustand Store        │  │
│  │   (Input/UI)    │◄─┤  (JSON→React)   │◄─┤  (State Management)     │  │
│  └────────┬────────┘  └─────────────────┘  └───────────┬─────────────┘  │
│           │                                             │                │
└───────────┼─────────────────────────────────────────────┼────────────────┘
            │ HTTP                                        │
            ▼                                             │
┌───────────────────────────────────────────────────────────────────────────┐
│                           SERVER (Next.js API)                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐   │
│  │   /api/agent    │──┤  ReAct Agent    │──┤   Prompt Composer       │   │
│  │   (Entry Point) │  │  (Loop Logic)   │  │   (4-Layer Assembly)    │   │
│  └────────┬────────┘  └────────┬────────┘  └─────────────────────────┘   │
│           │                    │                                          │
│           │           ┌────────▼────────┐  ┌─────────────────────────┐   │
│           │           │   LLM Client    │──┤   Mistral AI API        │   │
│           │           │   (Mistral)     │  │   (External)            │   │
│           │           └─────────────────┘  └─────────────────────────┘   │
│           │                                                               │
│  ┌────────▼────────┐  ┌─────────────────┐  ┌─────────────────────────┐   │
│  │   /api/tools    │──┤  Action Router  │──┤   Tool Registry         │   │
│  │   (Execution)   │  │  (Matching)     │  │   (Definitions)         │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────────┘
```

### Request Flow

1. User submits query via input field → `/api/agent`
2. Agent composes prompt using 4-layer system
3. LLM generates VM2 Component JSON
4. Parser validates and transforms response
5. Client renders components via VM2 Renderer
6. User interacts with form → submits with action_id
7. Router matches action_id → executes tool
8. Tool result sent back to LLM for next step
9. Cycle repeats until workflow completion

## Components and Interfaces

### VM2 Component Schema

```javascript
// lib/vm2/schema.js

/**
 * VM2 Component JSON Schema
 * Inspired by Google A2UI patterns with flat component list
 */
const VM2Schema = {
  surfaceUpdate: {
    surfaceId: "string",      // Unique identifier for the UI surface
    components: [
      {
        id: "string",         // Unique component ID for references
        component: {
          // One of the whitelisted component types
          [ComponentType]: {
            // Component-specific properties
          }
        }
      }
    ]
  }
};

/**
 * Component Type Definitions (Whitelist)
 */
const ComponentTypes = {
  // Form Components
  TextInput: {
    value: { path: "string" },    // State binding path
    placeholder: "string",
    label: "string",
    required: "boolean"
  },
  Select: {
    value: { path: "string" },
    options: [{ value: "string", label: "string" }],
    label: "string",
    required: "boolean"
  },
  Checkbox: {
    value: { path: "string" },
    label: "string"
  },
  
  // Display Components
  Text: {
    text: { literalString: "string" },
    usageHint: "string"           // h1, h2, h3, p, span
  },
  Alert: {
    type: "string",               // success, error, warning, info
    title: "string",
    message: "string"
  },
  Table: {
    columns: [{ key: "string", label: "string" }],
    data: { path: "string" }
  },
  
  // Action Components
  Button: {
    child: "string",              // Reference to child component ID
    action: { name: "string" },   // action_id for routing
    variant: "string"             // primary, secondary, destructive
  }
};
```

### VM2 Parser Interface

```javascript
// lib/vm2/parser.js

/**
 * Parses LLM JSON response into validated VM2 structure
 * @param {string} jsonString - Raw JSON from LLM
 * @returns {Result<VM2Structure, ParseError>}
 */
function parse(jsonString) {
  // 1. Parse JSON
  // 2. Validate against schema
  // 3. Validate component types against whitelist
  // 4. Resolve component references
  // 5. Return validated structure or error
}

/**
 * Formats VM2 structure back to JSON string
 * @param {VM2Structure} structure - Validated VM2 structure
 * @returns {string}
 */
function print(structure) {
  // Format with consistent ordering for round-trip consistency
}

/**
 * Validates a single component against whitelist
 * @param {Component} component
 * @returns {Result<Component, ValidationError>}
 */
function validateComponent(component) {
  // Check component type is in whitelist
  // Validate required properties
  // Check for script-like content
}
```

### Component Catalog

```javascript
// lib/vm2/catalog.js

/**
 * Whitelist of approved component types
 */
const COMPONENT_WHITELIST = [
  'TextInput',
  'Select', 
  'Checkbox',
  'Text',
  'Alert',
  'Table',
  'Button'
];

/**
 * Component catalog with React implementations
 */
const ComponentCatalog = {
  TextInput: TextInputComponent,
  Select: SelectComponent,
  Checkbox: CheckboxComponent,
  Text: TextComponent,
  Alert: AlertComponent,
  Table: TableComponent,
  Button: ButtonComponent
};

/**
 * Checks if component type is allowed
 * @param {string} type
 * @returns {boolean}
 */
function isWhitelisted(type) {
  return COMPONENT_WHITELIST.includes(type);
}

/**
 * Gets React component for type
 * @param {string} type
 * @returns {ReactComponent | null}
 */
function getComponent(type) {
  return ComponentCatalog[type] || null;
}
```

### VM2 Renderer

```javascript
// components/vm2/Renderer.jsx

/**
 * Renders VM2 component structure as React components
 * @param {VM2Structure} structure - Validated VM2 structure
 * @param {Object} handlers - Action handlers map
 */
function VM2Renderer({ structure, handlers }) {
  // 1. Build component map from flat list
  // 2. Resolve child references
  // 3. Render each component using catalog
  // 4. Bind form values to state
  // 5. Attach action handlers
}

/**
 * Renders individual component
 * @param {ComponentDef} def - Component definition
 * @param {Map} componentMap - All components by ID
 */
function renderComponent(def, componentMap) {
  // Get React component from catalog
  // Map VM2 props to React props
  // Handle child references
  // Return rendered element
}
```

### Tool Registry

```javascript
// lib/tools/registry.js

/**
 * Tool definition structure
 */
const ToolDefinition = {
  name: "string",
  description: "string",
  action_id: "string",
  endpoint: "string",
  parameters: [{
    name: "string",
    type: "string",
    description: "string",
    required: "boolean"
  }],
  returns: "string",
  handler: "function"
};

/**
 * Centralized tool registry
 */
class ToolRegistry {
  constructor() {
    this.tools = new Map();
  }

  /**
   * Register a tool with validation
   * @param {ToolDefinition} tool
   */
  register(tool) {
    // Validate required fields
    // Check for duplicate action_id
    // Store in registry
  }

  /**
   * Get tool by action_id
   * @param {string} actionId
   * @returns {ToolDefinition | null}
   */
  get(actionId) {
    return this.tools.get(actionId);
  }

  /**
   * Execute tool with parameters
   * @param {string} actionId
   * @param {Object} params
   * @returns {Promise<Result>}
   */
  async execute(actionId, params) {
    // Get tool
    // Validate required parameters
    // Execute handler
    // Return result or error
  }

  /**
   * Export definitions for prompt generation
   * @returns {Array<ToolPromptDef>}
   */
  getPromptDefinitions() {
    // Return tool definitions without handlers
  }
}
```

### Action Router

```javascript
// lib/tools/router.js

/**
 * Routes form actions to tools
 */
class ActionRouter {
  constructor(registry) {
    this.registry = registry;
  }

  /**
   * Route and execute action
   * @param {string} actionId
   * @param {Object} formData
   * @returns {Promise<ActionResult>}
   */
  async route(actionId, formData) {
    // 1. Find tool by action_id
    // 2. Validate parameters
    // 3. Execute tool
    // 4. Return structured result
  }
}

/**
 * Action result structure
 */
const ActionResult = {
  success: "boolean",
  data: "object | null",
  error: {
    code: "string",
    message: "string",
    details: "object"
  }
};
```

### Prompt Composer

```javascript
// lib/prompts/composer.js

/**
 * Assembles prompts from modular layers
 */
class PromptComposer {
  constructor(basePrompt, uiSchema, toolRegistry, workflows) {
    this.base = basePrompt;
    this.uiSchema = uiSchema;
    this.toolRegistry = toolRegistry;
    this.workflows = workflows;
  }

  /**
   * Compose full system prompt
   * @returns {string}
   */
  composeSystemPrompt() {
    return [
      this.base.getPrompt(),
      this.uiSchema.getPrompt(),
      this.toolRegistry.getPromptDefinitions(),
      this.workflows.getPrompt()
    ].join('\n\n');
  }

  /**
   * Compose user prompt with context
   * @param {Object} context
   * @returns {string}
   */
  composeUserPrompt(context) {
    // Include: query, previous UI, form data, API response, history
  }
}
```

### ReAct Agent

The ReAct (Reasoning + Acting) agent implements a cognitive loop that enables the LLM to reason about user intent, take actions through tools, observe results, and iteratively refine its approach until the task is complete.

#### ReAct Loop Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      ReAct Agent Loop                           │
│                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌─────────────┐               │
│  │  REASON  │───▶│   ACT    │───▶│  OBSERVE    │               │
│  │          │    │          │    │             │               │
│  │ Analyze  │    │ Generate │    │ Evaluate    │               │
│  │ context  │    │ UI/Call  │    │ result      │               │
│  │ & intent │    │ tool     │    │             │               │
│  └──────────┘    └──────────┘    └──────┬──────┘               │
│       ▲                                  │                      │
│       │         ┌──────────────┐         │                      │
│       │         │   DECIDE     │◀────────┘                      │
│       │         │              │                                │
│       │         │ Continue or  │                                │
│       │         │ complete?    │                                │
│       │         └──────┬───────┘                                │
│       │                │                                        │
│       └────────────────┴─── (if continue)                       │
│                        │                                        │
│                        ▼ (if complete)                          │
│                   Return Result                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Agent State Machine

```
┌─────────────┐
│    IDLE     │◀──────────────────────────────────────┐
└──────┬──────┘                                        │
       │ user query                                    │
       ▼                                               │
┌─────────────┐                                        │
│  REASONING  │ ─── analyze intent                     │
└──────┬──────┘                                        │
       │                                               │
       ▼                                               │
┌─────────────┐                                        │
│  ACTING     │ ─── generate UI or execute tool        │
└──────┬──────┘                                        │
       │                                               │
       ▼                                               │
┌─────────────┐     success                            │
│  OBSERVING  │────────────────────────────────────────┘
└──────┬──────┘
       │ needs retry
       ▼
┌─────────────┐
│  DECIDING   │
└──────┬──────┘
       │
       ├─── retry (error) ───▶ REASONING
       │
       └─── continue ───▶ ACTING
```

```javascript
// lib/agent/react.js

/**
 * Agent states for the ReAct loop
 */
const AgentState = {
  IDLE: 'idle',
  REASONING: 'reasoning',
  ACTING: 'acting',
  OBSERVING: 'observing',
  DECIDING: 'deciding'
};

/**
 * Decision types after observation
 */
const DecisionType = {
  COMPLETE: 'complete',      // Task finished successfully
  CONTINUE: 'continue',      // Proceed to next step
  RETRY: 'retry',            // Retry with adjusted approach
  ERROR: 'error'             // Unrecoverable error
};

/**
 * ReAct agent implementing Reasoning → Action → Observation loop
 */
class ReActAgent {
  constructor(llmClient, promptComposer, router, config = {}) {
    this.llm = llmClient;
    this.composer = promptComposer;
    this.router = router;
    this.maxRetries = config.maxRetries || 3;
    this.state = AgentState.IDLE;
  }

  /**
   * Process user query - entry point for new interactions
   * @param {string} query - User's natural language query
   * @param {Object} context - Current session context
   * @returns {Promise<AgentResponse>}
   */
  async process(query, context) {
    this.state = AgentState.REASONING;
    
    // Step 1: REASON - Analyze query and determine intent
    const reasoning = await this.reason(query, context);
    
    // Step 2: ACT - Generate appropriate UI response
    this.state = AgentState.ACTING;
    const action = await this.act(reasoning, context);
    
    // Step 3: Return UI for user interaction
    this.state = AgentState.IDLE;
    return {
      type: 'ui',
      ui: action.ui,
      context: this.updateContext(context, { query, reasoning, action })
    };
  }

  /**
   * Process form submission - handles user form interactions
   * @param {string} actionId - The action_id from the submitted form
   * @param {Object} formData - Form field values
   * @param {Object} context - Current session context
   * @returns {Promise<AgentResponse>}
   */
  async processAction(actionId, formData, context) {
    let retryCount = 0;
    let currentContext = { ...context, formData };
    
    while (retryCount < this.maxRetries) {
      // Step 1: ACT - Execute the tool
      this.state = AgentState.ACTING;
      const toolResult = await this.executeTool(actionId, formData);
      
      // Step 2: OBSERVE - Evaluate the result
      this.state = AgentState.OBSERVING;
      const observation = this.observe(toolResult, currentContext);
      
      // Step 3: DECIDE - Determine next action
      this.state = AgentState.DECIDING;
      const decision = await this.decide(observation, currentContext);
      
      switch (decision.type) {
        case DecisionType.COMPLETE:
          // Generate success UI and return
          this.state = AgentState.IDLE;
          return await this.generateResultUI(toolResult, currentContext);
          
        case DecisionType.CONTINUE:
          // Generate next step UI
          this.state = AgentState.IDLE;
          return await this.generateNextStepUI(toolResult, currentContext);
          
        case DecisionType.RETRY:
          // Update context with failure info and retry
          retryCount++;
          currentContext = this.updateContextForRetry(
            currentContext, 
            observation, 
            decision.adjustments
          );
          // Loop continues with updated context
          break;
          
        case DecisionType.ERROR:
          // Generate error UI
          this.state = AgentState.IDLE;
          return await this.generateErrorUI(observation.error, currentContext);
      }
    }
    
    // Max retries exceeded
    this.state = AgentState.IDLE;
    return await this.generateErrorUI(
      { code: 'MAX_RETRIES', message: 'Maximum retry attempts exceeded' },
      currentContext
    );
  }

  /**
   * REASON phase - Analyze context and determine intent
   * @param {string} query - User query
   * @param {Object} context - Session context
   * @returns {Promise<ReasoningResult>}
   */
  async reason(query, context) {
    const systemPrompt = this.composer.composeSystemPrompt();
    const userPrompt = this.composer.composeUserPrompt({
      ...context,
      query,
      phase: 'reasoning'
    });
    
    const response = await this.llm.chat({
      systemPrompt,
      userPrompt,
      responseFormat: 'json'
    });
    
    return {
      intent: response.intent,
      requiredInfo: response.requiredInfo,
      confidence: response.confidence
    };
  }

  /**
   * ACT phase - Generate UI or prepare tool execution
   * @param {ReasoningResult} reasoning - Result from reason phase
   * @param {Object} context - Session context
   * @returns {Promise<ActionResult>}
   */
  async act(reasoning, context) {
    const systemPrompt = this.composer.composeSystemPrompt();
    const userPrompt = this.composer.composeUserPrompt({
      ...context,
      reasoning,
      phase: 'acting'
    });
    
    const response = await this.llm.chat({
      systemPrompt,
      userPrompt,
      responseFormat: 'json'
    });
    
    // Parse and validate the VM2 component structure
    const parseResult = this.parser.parse(response.content);
    if (!parseResult.success) {
      throw new Error(`Invalid UI structure: ${parseResult.error.message}`);
    }
    
    return {
      ui: parseResult.data
    };
  }

  /**
   * Execute tool via router
   * @param {string} actionId - Tool action ID
   * @param {Object} params - Tool parameters
   * @returns {Promise<ToolResult>}
   */
  async executeTool(actionId, params) {
    return await this.router.route(actionId, params);
  }

  /**
   * OBSERVE phase - Evaluate tool execution result
   * @param {ToolResult} result - Tool execution result
   * @param {Object} context - Session context
   * @returns {Observation}
   */
  observe(result, context) {
    return {
      success: result.success,
      data: result.data,
      error: result.error,
      reason: result.success ? null : (result.error?.message || 'Tool execution failed')
    };
  }

  /**
   * DECIDE phase - Determine next action based on observation
   * @param {Observation} observation - Result of observe phase
   * @param {Object} context - Session context
   * @returns {Promise<Decision>}
   */
  async decide(observation, context) {
    // If successful
    if (observation.success) {
      return {
        type: DecisionType.COMPLETE,
        adjustments: null
      };
    }
    
    // If failed but retryable
    if (this.isRetryable(observation)) {
      // Ask LLM for adjustments
      const adjustments = await this.inferAdjustments(observation, context);
      return {
        type: DecisionType.RETRY,
        adjustments
      };
    }
    
    // Unrecoverable error
    return {
      type: DecisionType.ERROR,
      error: observation.error || { code: 'UNKNOWN', message: observation.reason }
    };
  }

  /**
   * Check if error is retryable
   * @param {Observation} observation - Observation result
   * @returns {boolean}
   */
  isRetryable(observation) {
    const nonRetryableCodes = ['UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND'];
    if (observation.error && nonRetryableCodes.includes(observation.error.code)) {
      return false;
    }
    return true;
  }

  /**
   * Ask LLM to infer adjustments for retry
   * @param {Observation} observation - Failed observation
   * @param {Object} context - Session context
   * @returns {Promise<Object>}
   */
  async inferAdjustments(observation, context) {
    const systemPrompt = this.composer.composeSystemPrompt();
    const userPrompt = this.composer.composeUserPrompt({
      ...context,
      observation,
      phase: 'inferring_adjustments',
      instruction: 'Analyze the failure and suggest parameter adjustments for retry'
    });
    
    const response = await this.llm.chat({
      systemPrompt,
      userPrompt,
      responseFormat: 'json'
    });
    
    return response.adjustments || {};
  }

  /**
   * Generate result UI for completed action
   */
  async generateResultUI(result, context) {
    const systemPrompt = this.composer.composeSystemPrompt();
    const userPrompt = this.composer.composeUserPrompt({
      ...context,
      result,
      phase: 'generating_result_ui'
    });
    
    const response = await this.llm.chat({
      systemPrompt,
      userPrompt,
      responseFormat: 'json'
    });
    
    const parseResult = this.parser.parse(response.content);
    return {
      type: 'result',
      ui: parseResult.data,
      context: this.updateContext(context, { completed: true, result })
    };
  }

  /**
   * Generate UI for next interaction
   */
  async generateNextStepUI(result, context) {
    const systemPrompt = this.composer.composeSystemPrompt();
    const userPrompt = this.composer.composeUserPrompt({
      ...context,
      previousResult: result,
      phase: 'generating_next_step_ui'
    });
    
    const response = await this.llm.chat({
      systemPrompt,
      userPrompt,
      responseFormat: 'json'
    });
    
    const parseResult = this.parser.parse(response.content);
    return {
      type: 'ui',
      ui: parseResult.data,
      context: this.updateContext(context, { previousResult: result })
    };
  }

  /**
   * Generate error UI
   */
  async generateErrorUI(error, context) {
    const systemPrompt = this.composer.composeSystemPrompt();
    const userPrompt = this.composer.composeUserPrompt({
      ...context,
      error,
      phase: 'generating_error_ui'
    });
    
    const response = await this.llm.chat({
      systemPrompt,
      userPrompt,
      responseFormat: 'json'
    });
    
    const parseResult = this.parser.parse(response.content);
    return {
      type: 'error',
      ui: parseResult.data,
      context: this.updateContext(context, { error })
    };
  }

  /**
   * Update context with new information
   */
  updateContext(context, updates) {
    return {
      ...context,
      conversationHistory: [
        ...(context.conversationHistory || []),
        { timestamp: Date.now(), ...updates }
      ]
    };
  }

  /**
   * Update context for retry attempt
   */
  updateContextForRetry(context, observation, adjustments) {
    return {
      ...context,
      retryInfo: {
        previousObservation: observation,
        adjustments,
        attemptNumber: (context.retryInfo?.attemptNumber || 0) + 1
      }
    };
  }
}
```

### LLM Client

```javascript
// lib/llm/client.js

import Mistral from '@mistralai/mistralai';

/**
 * Mistral AI client configuration
 * Note: stream is set to false - no SSE streaming
 */
class MistralClient {
  constructor(apiKey) {
    this.client = new Mistral({ apiKey });
    this.model = 'mistral-large-latest';
  }

  /**
   * Send chat request to Mistral AI
   * @param {Object} options - Chat options
   * @param {string} options.systemPrompt - System prompt
   * @param {string} options.userPrompt - User prompt
   * @param {string} options.responseFormat - Expected response format
   * @returns {Promise<Object>}
   */
  async chat({ systemPrompt, userPrompt, responseFormat = 'json' }) {
    try {
      const response = await this.client.chat.complete({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        responseFormat: responseFormat === 'json' 
          ? { type: 'json_object' } 
          : undefined,
        stream: false  // No SSE streaming - wait for complete response
      });

      const content = response.choices[0]?.message?.content;
      
      if (responseFormat === 'json') {
        return JSON.parse(content);
      }
      
      return { content };
    } catch (error) {
      if (error.status === 429) {
        throw {
          code: 'RATE_LIMITED',
          message: 'Rate limit exceeded',
          details: { retryAfter: error.headers?.['retry-after'] }
        };
      }
      throw {
        code: 'LLM_CONNECTION',
        message: error.message || 'Failed to connect to LLM',
        details: { error }
      };
    }
  }
}

export default MistralClient;
```

### State Store

```javascript
// store/agentStore.js

/**
 * Zustand store for application state
 */
const useAgentStore = create((set, get) => ({
  // Current UI structure
  currentUI: null,
  
  // Form values bound to paths
  formValues: {},
  
  // Conversation history
  history: [],
  
  // Loading state
  isLoading: false,
  
  // Actions
  setUI: (ui) => set({ currentUI: ui, formValues: {} }),
  setFormValue: (path, value) => set((state) => ({
    formValues: { ...state.formValues, [path]: value }
  })),
  setLoading: (loading) => set({ isLoading: loading }),
  addToHistory: (entry) => set((state) => ({
    history: [...state.history, entry]
  })),
  resetToDefault: () => set({ currentUI: null, formValues: {}, history: [] })
}));
```

## Data Models

### VM2 Structure

```javascript
/**
 * Complete VM2 response structure
 */
const VM2Structure = {
  surfaceUpdate: {
    surfaceId: String,
    components: Array<{
      id: String,
      component: {
        [type: String]: ComponentProps
      }
    }>
  }
};
```

### Agent Context

```javascript
/**
 * Context passed through agent interactions
 */
const AgentContext = {
  sessionId: String,
  query: String,
  previousUI: VM2Structure | null,
  formData: Object,
  apiResponse: ActionResult | null,
  conversationHistory: Array<{
    role: 'user' | 'assistant',
    content: String
  }>
};
```

### Tool Execution Result

```javascript
/**
 * Standardized tool execution result
 */
const ToolResult = {
  success: Boolean,
  data: Object | null,
  error: {
    code: String,
    message: String,
    details: Object
  } | null,
  metadata: {
    executionTime: Number,
    toolName: String
  }
};
```


## Error Handling

### Parser Errors

| Error Type | Condition | Response |
|------------|-----------|----------|
| JSONSyntaxError | Invalid JSON string | `{ code: 'JSON_SYNTAX', message: 'Invalid JSON at position X', details: { position, expected } }` |
| SchemaValidationError | Valid JSON, invalid schema | `{ code: 'SCHEMA_INVALID', message: 'Missing required field: X', details: { field, path } }` |
| UnknownComponentError | Component type not in whitelist | `{ code: 'UNKNOWN_COMPONENT', message: 'Component type X not allowed', details: { type, allowed } }` |
| ReferenceError | Child reference to non-existent ID | `{ code: 'INVALID_REFERENCE', message: 'Component X references non-existent ID Y', details: { componentId, referencedId } }` |
| SecurityError | Script-like content detected | `{ code: 'SECURITY_VIOLATION', message: 'Potentially dangerous content detected', details: { content, reason } }` |

### Tool Errors

| Error Type | Condition | Response |
|------------|-----------|----------|
| ToolNotFoundError | action_id not registered | `{ code: 'TOOL_NOT_FOUND', message: 'No tool registered for action: X', details: { actionId } }` |
| ValidationError | Missing required parameter | `{ code: 'VALIDATION_ERROR', message: 'Missing required parameter: X', details: { parameter, required } }` |
| ExecutionError | Tool handler throws | `{ code: 'EXECUTION_ERROR', message: 'Tool execution failed', details: { toolName, error } }` |

### LLM Errors

| Error Type | Condition | Response |
|------------|-----------|----------|
| ConnectionError | Cannot reach Mistral API | `{ code: 'LLM_CONNECTION', message: 'Failed to connect to LLM', details: { endpoint } }` |
| RateLimitError | Rate limit exceeded | `{ code: 'RATE_LIMITED', message: 'Rate limit exceeded, retry after X seconds', details: { retryAfter } }` |
| ResponseError | Invalid LLM response | `{ code: 'LLM_RESPONSE', message: 'LLM returned invalid response', details: { response } }` |

### API Errors

| HTTP Status | Condition | Response Body |
|-------------|-----------|---------------|
| 400 | Invalid request body | `{ error: { code: 'BAD_REQUEST', message: '...' } }` |
| 401 | Missing/invalid auth | `{ error: { code: 'UNAUTHORIZED', message: '...' } }` |
| 404 | Unknown endpoint | `{ error: { code: 'NOT_FOUND', message: '...' } }` |
| 500 | Internal error | `{ error: { code: 'INTERNAL_ERROR', message: '...' } }` |
| 503 | LLM unavailable | `{ error: { code: 'SERVICE_UNAVAILABLE', message: '...' } }` |


