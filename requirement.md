# AI Agent Application with Dynamic UI Generation (Next.js 14)

Build an AI-powered agent application where the LLM generates component JSON structures based on user queries. The application dynamically renders these JSON structures into interactive form UIs. Users interact with the forms, submit data to generate the next step's UI, and view final results through rendered UI components.

## Features

### ReAct-Based Agent Loop
- Complete AI agent loop implementing the ReAct (Reasoning + Acting) pattern
- Supports: Reasoning → Action → Observation → Loop with environment feedback
- Capable of planning and inference (e.g., when results don't meet expectations, the agent infers requirements from context and continues LLM interaction)

### VM2 Component System
- Define JSON Schema for VM2 components used for LLM response parsing and UI rendering
- Implement component parser/resolver for JSON-to-React transformation
- Reference Generative UI principles where applicable

### Backend Processing
- Next.js API routes handle business logic
- Tool definitions with third-party system API integrations
- Clear separation of concerns

### Three-Layer Architecture
- UI Structure: Declarative JSON component definitions
- Application State: Centralized state management
- Client Rendering: React component rendering layer

## VM2 Component Specification

### Security
- Component whitelist catalog - only generate components from the approved list
- Prevents XSS and other injection attacks
- No executable JavaScript in component definitions

### Structure
- Declarative UI rendered as React components
- JSON structure inspired by Google A2UI patterns
- Convention-based component IDs and form action IDs for matching
- Flat component list with ID references for incremental/streaming LLM output
- Declarative data only - no code execution; agent requests components from trusted client-side catalog

Example JSON of Google A2UI:
```
{
  "surfaceUpdate": {
    "surfaceId": "booking",
    "components": [
      {
        "id": "title",
        "component": {
          "Text": {
            "text": {"literalString": "Book Your Table"},
            "usageHint": "h1"
          }
        }
      },
      {
        "id": "datetime",
        "component": {
          "DateTimeInput": {
            "value": {"path": "/booking/date"},
            "enableDate": true
          }
        }
      },
      {
        "id": "submit-text",
        "component": {
          "Text": {"text": {"literalString": "Confirm"}}
        }
      },
      {
        "id": "submit-btn",
        "component": {
          "Button": {
            "child": "submit-text",
            "action": {"name": "confirm_booking"}
          }
        }
      }
    ]
  }
}

```
## Prompt System Architecture

The prompt system follows a modular, composable design that separates concerns into distinct layers. This enables maintainability, testability, and seamless expansion as new tools and business domains are added.

### Prompt Composition Model

```
┌─────────────────────────────────────────────────────────────┐
│                    SYSTEM PROMPT                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Base Layer: Agent Identity & Behavior Rules          │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  UI Layer: Component Schema & Rendering Constraints   │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Tool Layer: Available Tools & API Definitions        │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Business Layer: Domain Rules & Workflow Templates    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              +
┌─────────────────────────────────────────────────────────────┐
│                    USER PROMPT                              │
│  Context + User Query + Previous State (if any)            │
└─────────────────────────────────────────────────────────────┘
```

### Layer 1: Base System Prompt
`lib/prompts/base.js` - Defines agent identity, response format (JSON only), and behavioral rules (whitelist-only components, unique IDs, validation, accessibility).

### Layer 2: UI Component Schema
`lib/prompts/ui-schema.js` - Strict component whitelist with type definitions:
- Form: TextInput,Select,Checkbox
- Display: Text, Alert, Table
- Action: Button

### Layer 3: Tool Definitions
`lib/prompts/tools.js` - Dynamic tool prompt generator. Each tool defines:
- `name`, `description`, `action_id`
- `endpoint` (API route)
- `parameters` (with type, description, required flag)
- `returns` (response description)

### Layer 4: Business Workflow Templates
`lib/prompts/workflows.js` - Multi-step workflow definitions with:
- Step sequence (name, description, required_fields, ui_hint)
- Workflow rules for step tracking and validation
```javascript
// lib/prompts/workflows.js
export const WORKFLOW_TEMPLATES = {
  create_instance: {
    name: "Instance Creation Workflow",
    steps: [
      {
        step: 1,
        name: "Configuration",
        description: "Collect instance configuration from user",
        required_fields: ["instance_name", "instance_type"],
        ui_hint: "Form with text input for name, select for type, submit button"
      },
      {
        step: 2,
        name: "Confirmation",
        description: "Show configuration summary and confirm",
        ui_hint: "Card displaying selected options with confirm/cancel buttons"
      },
      {
        step: 3,
        name: "Result",
        description: "Display creation result or error",
        ui_hint: "Success alert with instance details or error alert with retry option"
      }
    ]
  }
};

### Prompt Composer
`lib/prompts/composer.js` - Assembles system prompt from all layers. Composes user prompt with context (previous UI, form data, API response, conversation history).

### Few-Shot Examples
`lib/prompts/examples.js` - Concrete input/output examples demonstrating:
- Initial form generation
- Success result display
- Error handling UI

## Tool System

### Tool Registry
`lib/tools/registry.js` - Centralized tool management:
- `register(tool)` - Add tool with validation
- `get(actionId)` - Retrieve tool by action_id
- `execute(actionId, params)` - Run tool handler
- `getPromptDefinitions()` - Export for prompt generation

### Action Routing
`lib/tools/router.js` - Matches form `action_id` to tools, validates required parameters, executes handler, returns structured result or error

## Architecture Principles

- Separation of concerns for maintainability and modularity
- Context storage for each feature flow (user queries, LLM responses, third-party API data)
- Business accuracy through predefined templates and strict schemas

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router, JavaScript/JSX) |
| UI Library | shadcn/ui |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| State Management | Zustand |
| LLM Provider | Mistral AI |
| Safe Execution | vm2 |

## UI Design

- Not a traditional chat interface - no continuous conversation thread
- Default view: Single input field + send button
- Dynamic view: Rendered UI replaces default view
- Sequential replacement: Each new UI replaces the previous until workflow completion

## Example Flow: Creating an Instance

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: User Input                                         │
│  User types "create an instance" and clicks Send            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 2: Backend Processing                                 │
│  • Send request to LLM                                      │
│  • LLM responds with UI JSON structure                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 3: Frontend Rendering                                 │
│  Render form UI components from JSON                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 4: User Interaction                                   │
│  User fills in form fields and clicks Submit                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 5: Action Processing                                  │
│  • Match action_id to corresponding tool                    │
│  • Call third-party API with form data                      │
│  • Send API response to LLM                                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 6: Next UI Generation                                 │
│  LLM responds with next step's UI JSON                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 7: UI Update                                          │
│  Frontend renders new UI, replacing previous view           │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
├── app/                        # Next.js App Router
│   ├── api/                    # API routes
│   │   ├── agent/              # Agent endpoint
│   │   └── tools/              # Tool execution endpoints
│   ├── globals.css             # Global styles
│   ├── layout.jsx              # Root layout
│   └── page.jsx                # Main page component
├── components/                 # React components
│   ├── ui/                     # shadcn/ui components
│   └── vm2/                    # VM2 component renderers
├── lib/                        # Core libraries
│   ├── agent/                  # ReAct agent logic
│   ├── llm/                    # LLM client (Mistral)
│   ├── prompts/                # Modular prompt system
│   │   ├── base.js             # Base system prompt
│   │   ├── ui-schema.js        # Component schema definitions
│   │   ├── tools.js            # Tool prompt generator
│   │   ├── workflows.js        # Workflow templates
│   │   ├── examples.js         # Few-shot examples
│   │   └── composer.js         # Prompt assembly
│   └── tools/                  # Tool system
│       ├── registry.js         # Tool registration
│       ├── router.js           # Action routing
│       └── definitions/        # Individual tool definitions
├── store/                      # Zustand stores
├── utils/                      # Utility functions
├── public/                     # Static assets
├── package.json
├── tailwind.config.js
├── next.config.js
├── .env                        # Environment variables
├── .eslintrc.json
├── .prettierrc
└── .gitignore
```

## Extending the System

### Adding a New Tool
1. Create definition in `lib/tools/definitions/` with: name, action_id, endpoint, parameters, returns, handler
2. Register via `toolRegistry.register(tool)`

### Adding a New Workflow
Add to `WORKFLOW_TEMPLATES` in `lib/prompts/workflows.js` with step sequence (name, description, required_fields, ui_hint)

### Adding New Components
1. Add to whitelist in `lib/prompts/ui-schema.js`
2. Create renderer in `components/vm2/`
3. Register in component catalog
