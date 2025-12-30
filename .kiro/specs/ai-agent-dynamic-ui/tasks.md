# Implementation Plan: AI Agent Dynamic UI

## Overview

This implementation plan breaks down the AI Agent Dynamic UI application into discrete coding tasks. The approach is bottom-up: starting with core utilities and schemas, then building up to the agent loop and UI components. Each task builds on previous work to ensure no orphaned code.

## Tasks

- [x] 1. Project Setup and Configuration
  - Create `package.json` with all dependencies (Next.js 14, React, Mistral AI SDK, Zustand, Tailwind CSS, Lucide React)
  - Create `next.config.js` configuration
  - Create `tailwind.config.js` with shadcn/ui preset
  - Create `postcss.config.js`
  - Create `jsconfig.json` for path aliases
  - Create `.env.example` with MISTRAL_API_KEY placeholder
  - Create `app/globals.css` with Tailwind directives and CSS variables
  - Create `app/layout.jsx` root layout
  - Create `lib/utils.js` with cn() utility function
  - _Requirements: 12.1, 12.2_

- [x] 2. Create shadcn/ui Base Components
  - Create `components/ui/button.jsx`
  - Create `components/ui/input.jsx`
  - Create `components/ui/select.jsx`
  - Create `components/ui/checkbox.jsx`
  - Create `components/ui/alert.jsx`
  - Create `components/ui/table.jsx`
  - Create `components/ui/card.jsx`
  - Create `components/ui/label.jsx`
  - _Requirements: 4.2_

- [x] 3. VM2 Component Schema and Parser
  - [x] 3.1 Create VM2 schema definitions
    - Define component type constants and whitelist in `lib/vm2/schema.js`
    - Define JSON schema structure for surfaceUpdate
    - Export schema validation utilities
    - _Requirements: 2.1, 3.1_

  - [x] 3.2 Implement VM2 Parser
    - Create `lib/vm2/parser.js` with parse() function
    - Implement JSON parsing with error handling
    - Implement schema validation against VM2 structure
    - Implement component whitelist validation
    - Implement security checks for script-like content
    - Implement print() function for JSON serialization
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 3.2, 3.3, 3.5_

  - [x] 3.3 Implement Component Reference Resolution
    - Add reference resolution for child components
    - Validate all references point to existing IDs
    - Return errors for invalid references
    - _Requirements: 2.6_

- [x] 4. Component Catalog and Renderers
  - [x] 4.1 Create Component Catalog
    - Create `lib/vm2/catalog.js` with whitelist and lookup functions
    - Implement isWhitelisted() and getComponent() functions
    - _Requirements: 3.1, 3.4_

  - [x] 4.2 Implement VM2 UI Components
    - Create `components/vm2/TextInput.jsx` with state binding
    - Create `components/vm2/Select.jsx` with options rendering
    - Create `components/vm2/Checkbox.jsx` with state binding
    - Create `components/vm2/Text.jsx` with usageHint support (h1, h2, p, etc.)
    - Create `components/vm2/Alert.jsx` with type variants (success, error, warning, info)
    - Create `components/vm2/Table.jsx` with columns and data rendering
    - Create `components/vm2/Button.jsx` with action handler and child reference
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

  - [x] 4.3 Implement VM2 Renderer
    - Create `components/vm2/Renderer.jsx`
    - Build component map from flat list
    - Resolve child references
    - Render components using catalog
    - Bind form values to Zustand store
    - Attach action handlers to buttons
    - _Requirements: 4.1, 4.5_

- [x] 5. Tool System
  - [x] 5.1 Implement Tool Registry
    - Create `lib/tools/registry.js` with ToolRegistry class
    - Implement register() with validation
    - Implement get() for retrieval by action_id
    - Implement execute() with parameter validation
    - Implement getPromptDefinitions() for prompt generation
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 5.2 Implement Action Router
    - Create `lib/tools/router.js` with ActionRouter class
    - Implement route() to match action_id to tools
    - Implement parameter validation
    - Return structured results and errors
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 5.3 Create Example Tool Definition
    - Create `lib/tools/definitions/createInstance.js` as example
    - Define name, action_id, parameters, handler
    - Register with tool registry
    - _Requirements: 5.1_

- [ ] 6. Prompt System
  - [ ] 6.1 Create Base System Prompt
    - Create `lib/prompts/base.js`
    - Define agent identity and behavioral rules
    - Define JSON-only response format
    - Define component generation rules
    - _Requirements: 7.3_

  - [ ] 6.2 Create UI Schema Prompt
    - Create `lib/prompts/ui-schema.js`
    - Define component whitelist with type definitions
    - Include component property schemas
    - _Requirements: 7.4_

  - [ ] 6.3 Create Tools Prompt Generator
    - Create `lib/prompts/tools.js`
    - Generate tool definitions from registry
    - Format for LLM consumption
    - _Requirements: 7.5_

  - [ ] 6.4 Create Workflow Templates
    - Create `lib/prompts/workflows.js`
    - Define example workflow templates
    - Include step sequences with ui_hints
    - _Requirements: 7.6, 8.1_

  - [ ] 6.5 Create Few-Shot Examples
    - Create `lib/prompts/examples.js`
    - Add examples for initial form generation
    - Add examples for success result display
    - Add examples for error handling UI
    - _Requirements: 7.1_

  - [ ] 6.6 Implement Prompt Composer
    - Create `lib/prompts/composer.js`
    - Implement composeSystemPrompt() assembling all layers
    - Implement composeUserPrompt() with context inclusion
    - _Requirements: 7.1, 7.2_

- [ ] 7. LLM Client
  - [ ] 7.1 Implement Mistral Client
    - Create `lib/llm/client.js`
    - Configure Mistral AI connection with stream: false (no SSE)
    - Implement chat() method with prompt handling
    - Implement JSON response extraction
    - Implement error handling with structured errors
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ] 8. State Management
  - [ ] 8.1 Implement Zustand Store
    - Create `store/agentStore.js`
    - Implement currentUI state and setUI action
    - Implement formValues state and setFormValue action
    - Implement history state and addToHistory action
    - Implement isLoading state and setLoading action
    - Implement resetToDefault action
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 9. ReAct Agent
  - [ ] 9.1 Implement ReAct Agent Core
    - Create `lib/agent/react.js`
    - Define AgentState and DecisionType constants
    - Implement constructor with dependencies
    - _Requirements: 1.1_

  - [ ] 9.2 Implement Process Methods
    - Implement process() for user query handling
    - Implement processAction() for form submission handling
    - Implement retry loop with max retries
    - _Requirements: 1.1, 1.4_

  - [ ] 9.3 Implement ReAct Loop Phases
    - Implement reason() phase for intent analysis
    - Implement act() phase for UI generation
    - Implement observe() phase for result evaluation
    - Implement decide() phase for next action determination
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 9.4 Implement UI Generation Methods
    - Implement generateResultUI() for success responses
    - Implement generateNextStepUI() for continuation
    - Implement generateErrorUI() for error responses
    - Implement inferAdjustments() for retry logic
    - _Requirements: 1.3, 1.4_

  - [ ] 9.5 Implement Context Management
    - Implement updateContext() for history tracking
    - Implement updateContextForRetry() for retry info
    - _Requirements: 1.5_

- [ ] 10. Checkpoint - Core Logic Complete
  - Ensure all core modules are implemented
  - Verify imports and exports are correct
  - Ask the user if questions arise

- [ ] 11. API Routes
  - [ ] 11.1 Implement Agent API Route
    - Create `app/api/agent/route.js`
    - Handle POST for user queries
    - Handle POST for form submissions with action_id
    - Return VM2 component structures
    - Handle errors with appropriate status codes
    - _Requirements: 12.1, 12.2, 12.4_

  - [ ] 11.2 Implement Tools API Route
    - Create `app/api/tools/route.js`
    - Handle tool execution requests
    - Return structured results
    - _Requirements: 12.3, 12.4_

- [ ] 12. Frontend Components
  - [ ] 12.1 Create Main Page Layout
    - Create `app/layout.jsx` with providers
    - Create `app/page.jsx` with main container
    - _Requirements: 10.1_

  - [ ] 12.2 Implement Default View
    - Create input field component
    - Create send button component
    - Handle query submission
    - _Requirements: 10.1_

  - [ ] 12.3 Implement Dynamic View
    - Integrate VM2 Renderer
    - Handle UI replacement on agent response
    - Handle form submission with action_id
    - _Requirements: 10.2, 10.3_

  - [ ] 12.4 Implement Loading State
    - Add loading indicator during requests
    - Disable interactions while loading
    - _Requirements: 10.5_

  - [ ] 12.5 Implement Reset Functionality
    - Add return to default view option
    - Clear state on reset
    - _Requirements: 10.4_

- [ ] 13. Integration and Wiring
  - [ ] 13.1 Wire Agent to API Routes
    - Initialize agent with all dependencies in API routes
    - Connect prompt composer, router, LLM client
    - _Requirements: 12.1, 12.2_

  - [ ] 13.2 Wire Frontend to API
    - Connect page components to API endpoints
    - Handle responses and update store
    - _Requirements: 10.2, 10.3_

  - [ ] 13.3 Register Tools
    - Register example tools with registry
    - Verify tool execution flow
    - _Requirements: 5.1_

- [ ] 14. Final Checkpoint
  - Ensure all components are integrated
  - Verify end-to-end flow works
  - Ask the user if questions arise

## Notes

- Tasks are ordered to build dependencies first (schema → parser → renderer → agent → API → UI)
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation of the implementation
