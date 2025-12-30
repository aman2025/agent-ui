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

Defines the agent's core identity, response format, and behavioral constraints.

```javascript
// lib/prompts/base.js
export const BASE_SYSTEM_PROMPT = `
You are a UI Generation Agent. Your role is to:
1. Understand user intent from natural language queries
2. Generate valid UI component JSON that renders interactive forms
3. Process form submissions and generate subsequent UI steps
4. Complete workflows by rendering final result UIs

## Response Format
You MUST respond with valid JSON matching the UIResponse schema.
Do NOT include any text outside the JSON structure.
Do NOT include code blocks or markdown formatting.

## Behavioral Rules
- Generate ONLY components from the approved whitelist
- Use unique, descriptive IDs for all components
- Include appropriate validation rules for form inputs
- Provide clear labels and helper text for accessibility
- Handle error states with user-friendly messages
`;
```

### Layer 2: UI Component Schema

Strict schema definitions that constrain LLM output to valid, renderable components.

```javascript
// lib/prompts/ui-schema.js
export const UI_SCHEMA_PROMPT = `
## Component Whitelist
You may ONLY use these component types:

### Layout Components
- Container: { type: "Container", children: [...ids] }
- Card: { type: "Card", title?: string, children: [...ids] }
- Row: { type: "Row", gap?: number, children: [...ids] }
- Column: { type: "Column", gap?: number, children: [...ids] }

### Form Components
- TextInput: { type: "TextInput", label: string, placeholder?: string, required?: boolean, validation?: ValidationRule }
- NumberInput: { type: "NumberInput", label: string, min?: number, max?: number, required?: boolean }
- Select: { type: "Select", label: string, options: [{value: string, label: string}], required?: boolean }
- DatePicker: { type: "DatePicker", label: string, minDate?: string, maxDate?: string }
- Checkbox: { type: "Checkbox", label: string, defaultChecked?: boolean }
- RadioGroup: { type: "RadioGroup", label: string, options: [{value: string, label: string}], required?: boolean }

### Display Components
- Text: { type: "Text", content: string, variant?: "h1"|"h2"|"h3"|"body"|"caption" }
- Alert: { type: "Alert", message: string, severity: "info"|"success"|"warning"|"error" }
- Table: { type: "Table", columns: [{key: string, label: string}], data: [...rows] }
- List: { type: "List", items: [...strings], ordered?: boolean }

### Action Components
- Button: { type: "Button", label: string, action_id: string, variant?: "primary"|"secondary"|"danger" }
- SubmitButton: { type: "SubmitButton", label: string, action_id: string }

## Response Schema
{
  "ui": {
    "surface_id": "string (unique identifier for this UI surface)",
    "title": "string (displayed as page/section title)",
    "components": [
      {
        "id": "string (unique component ID)",
        "component": { /* component definition from whitelist */ }
      }
    ]
  },
  "metadata": {
    "workflow_step": "number (current step in workflow)",
    "workflow_total": "number (total steps, if known)",
    "next_action": "string (expected action_id for progression)"
  }
}

## Validation Rules
ValidationRule = {
  pattern?: "email" | "url" | "phone" | regex_string,
  minLength?: number,
  maxLength?: number,
  message: "string (error message to display)"
}

## ID Conventions
- Use kebab-case for all IDs
- Prefix form inputs with "input-": input-instance-name, input-email
- Prefix buttons with "btn-": btn-submit, btn-cancel
- Prefix display elements with "display-": display-result, display-error
`;
```

### Layer 3: Tool Definitions

Modular tool registry that can be extended without modifying core prompts.

```javascript
// lib/prompts/tools.js
export const createToolPrompt = (tools) => `
## Available Tools
The following tools are available for processing user actions:

${tools.map(tool => `
### ${tool.name}
- Description: ${tool.description}
- Trigger: action_id = "${tool.action_id}"
- Required Parameters:
${tool.parameters.map(p => `  - ${p.name} (${p.type}): ${p.description}${p.required ? ' [REQUIRED]' : ''}`).join('\n')}
- Returns: ${tool.returns}
- API Endpoint: ${tool.endpoint}
`).join('\n')}

## Tool Selection Rules
1. Match the action_id from form submission to the corresponding tool
2. Extract required parameters from form data
3. Validate all required parameters are present before calling
4. Handle API errors gracefully with appropriate error UI
`;

// Example tool definition
export const TOOLS = [
  {
    name: "Create Instance",
    description: "Creates a new compute instance in the cloud platform",
    action_id: "create_instance",
    endpoint: "POST /api/instances",
    parameters: [
      { name: "instance_name", type: "string", description: "Name for the new instance", required: true },
      { name: "instance_type", type: "string", description: "Instance size/type", required: true },
      { name: "region", type: "string", description: "Deployment region", required: true },
      { name: "image_id", type: "string", description: "OS image identifier", required: false }
    ],
    returns: "Instance object with id, status, ip_address, created_at"
  },
  {
    name: "List Instances",
    description: "Retrieves all instances for the current user",
    action_id: "list_instances",
    endpoint: "GET /api/instances",
    parameters: [
      { name: "status", type: "string", description: "Filter by status", required: false },
      { name: "region", type: "string", description: "Filter by region", required: false }
    ],
    returns: "Array of instance objects"
  }
];
```

### Layer 4: Business Workflow Templates

Domain-specific workflow definitions that guide multi-step interactions.

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
        required_fields: ["instance_name", "instance_type", "region"],
        ui_hint: "Form with text input for name, select for type and region"
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

export const createWorkflowPrompt = (workflows) => `
## Workflow Templates
Follow these predefined workflows for common operations:

${Object.entries(workflows).map(([key, workflow]) => `
### ${workflow.name}
Workflow ID: ${key}
Steps:
${workflow.steps.map(step => `
  Step ${step.step}: ${step.name}
  - Purpose: ${step.description}
  - Required Fields: ${step.required_fields?.join(', ') || 'None'}
  - UI Guidance: ${step.ui_hint}
`).join('')}
`).join('\n')}

## Workflow Rules
1. Always identify which workflow applies to the user's request
2. Track current step in metadata.workflow_step
3. Validate required fields before advancing to next step
4. Allow users to go back to previous steps when appropriate
5. Handle workflow completion with clear success/failure UI
`;
```

### Prompt Composer

Assembles the final prompt from modular layers.

```javascript
// lib/prompts/composer.js
import { BASE_SYSTEM_PROMPT } from './base';
import { UI_SCHEMA_PROMPT } from './ui-schema';
import { createToolPrompt, TOOLS } from './tools';
import { createWorkflowPrompt, WORKFLOW_TEMPLATES } from './workflows';

export const composeSystemPrompt = (options = {}) => {
  const {
    tools = TOOLS,
    workflows = WORKFLOW_TEMPLATES,
    customRules = ''
  } = options;

  return [
    BASE_SYSTEM_PROMPT,
    UI_SCHEMA_PROMPT,
    createToolPrompt(tools),
    createWorkflowPrompt(workflows),
    customRules
  ].filter(Boolean).join('\n\n---\n\n');
};

export const composeUserPrompt = (context) => {
  const {
    userQuery,
    previousUI = null,
    formData = null,
    apiResponse = null,
    conversationHistory = []
  } = context;

  let prompt = '';

  if (conversationHistory.length > 0) {
    prompt += `## Conversation Context\n${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}\n\n`;
  }

  if (previousUI) {
    prompt += `## Previous UI State\n${JSON.stringify(previousUI, null, 2)}\n\n`;
  }

  if (formData) {
    prompt += `## Submitted Form Data\n${JSON.stringify(formData, null, 2)}\n\n`;
  }

  if (apiResponse) {
    prompt += `## API Response\n${JSON.stringify(apiResponse, null, 2)}\n\n`;
  }

  prompt += `## User Request\n${userQuery}`;

  return prompt;
};
```

### Few-Shot Examples

Concrete examples that demonstrate expected input/output patterns.

```javascript
// lib/prompts/examples.js
export const FEW_SHOT_EXAMPLES = `
## Examples

### Example 1: Initial Instance Creation Request
User: "I want to create a new server instance"

Response:
{
  "ui": {
    "surface_id": "create-instance-form",
    "title": "Create New Instance",
    "components": [
      {
        "id": "display-header",
        "component": { "type": "Text", "content": "Configure your new instance", "variant": "h2" }
      },
      {
        "id": "input-instance-name",
        "component": {
          "type": "TextInput",
          "label": "Instance Name",
          "placeholder": "my-server-01",
          "required": true,
          "validation": { "minLength": 3, "maxLength": 63, "message": "Name must be 3-63 characters" }
        }
      },
      {
        "id": "input-instance-type",
        "component": {
          "type": "Select",
          "label": "Instance Type",
          "required": true,
          "options": [
            { "value": "small", "label": "Small (1 vCPU, 2GB RAM)" },
            { "value": "medium", "label": "Medium (2 vCPU, 4GB RAM)" },
            { "value": "large", "label": "Large (4 vCPU, 8GB RAM)" }
          ]
        }
      },
      {
        "id": "input-region",
        "component": {
          "type": "Select",
          "label": "Region",
          "required": true,
          "options": [
            { "value": "us-east-1", "label": "US East (N. Virginia)" },
            { "value": "us-west-2", "label": "US West (Oregon)" },
            { "value": "eu-west-1", "label": "EU (Ireland)" }
          ]
        }
      },
      {
        "id": "btn-submit",
        "component": {
          "type": "SubmitButton",
          "label": "Create Instance",
          "action_id": "create_instance"
        }
      }
    ]
  },
  "metadata": {
    "workflow_step": 1,
    "workflow_total": 3,
    "next_action": "create_instance"
  }
}

### Example 2: Successful API Response
Form Data: { "instance_name": "web-server-01", "instance_type": "medium", "region": "us-east-1" }
API Response: { "id": "i-abc123", "status": "running", "ip_address": "54.123.45.67", "created_at": "2024-01-15T10:30:00Z" }

Response:
{
  "ui": {
    "surface_id": "create-instance-result",
    "title": "Instance Created Successfully",
    "components": [
      {
        "id": "display-success",
        "component": {
          "type": "Alert",
          "message": "Your instance has been created and is now running.",
          "severity": "success"
        }
      },
      {
        "id": "display-details",
        "component": {
          "type": "Card",
          "title": "Instance Details",
          "children": ["display-table"]
        }
      },
      {
        "id": "display-table",
        "component": {
          "type": "Table",
          "columns": [
            { "key": "property", "label": "Property" },
            { "key": "value", "label": "Value" }
          ],
          "data": [
            { "property": "Instance ID", "value": "i-abc123" },
            { "property": "Name", "value": "web-server-01" },
            { "property": "Status", "value": "Running" },
            { "property": "IP Address", "value": "54.123.45.67" },
            { "property": "Type", "value": "Medium (2 vCPU, 4GB RAM)" },
            { "property": "Region", "value": "US East (N. Virginia)" }
          ]
        }
      },
      {
        "id": "btn-create-another",
        "component": {
          "type": "Button",
          "label": "Create Another Instance",
          "action_id": "reset_workflow",
          "variant": "secondary"
        }
      }
    ]
  },
  "metadata": {
    "workflow_step": 3,
    "workflow_total": 3,
    "next_action": null
  }
}

### Example 3: Error Handling
API Response: { "error": true, "code": "QUOTA_EXCEEDED", "message": "Instance quota exceeded for this region" }

Response:
{
  "ui": {
    "surface_id": "create-instance-error",
    "title": "Unable to Create Instance",
    "components": [
      {
        "id": "display-error",
        "component": {
          "type": "Alert",
          "message": "Instance quota exceeded for this region. Please choose a different region or request a quota increase.",
          "severity": "error"
        }
      },
      {
        "id": "btn-retry",
        "component": {
          "type": "Button",
          "label": "Try Different Region",
          "action_id": "retry_create_instance",
          "variant": "primary"
        }
      },
      {
        "id": "btn-cancel",
        "component": {
          "type": "Button",
          "label": "Cancel",
          "action_id": "reset_workflow",
          "variant": "secondary"
        }
      }
    ]
  },
  "metadata": {
    "workflow_step": 2,
    "workflow_total": 3,
    "next_action": "retry_create_instance"
  }
}
`;
```

## Tool System

### Tool Registry

Centralized tool management with validation and execution.

```javascript
// lib/tools/registry.js
export class ToolRegistry {
  constructor() {
    this.tools = new Map();
  }

  register(tool) {
    this.validateToolDefinition(tool);
    this.tools.set(tool.action_id, tool);
  }

  validateToolDefinition(tool) {
    const required = ['name', 'action_id', 'endpoint', 'handler'];
    for (const field of required) {
      if (!tool[field]) {
        throw new Error(`Tool missing required field: ${field}`);
      }
    }
  }

  get(actionId) {
    return this.tools.get(actionId);
  }

  getPromptDefinitions() {
    return Array.from(this.tools.values()).map(tool => ({
      name: tool.name,
      description: tool.description,
      action_id: tool.action_id,
      endpoint: tool.endpoint,
      parameters: tool.parameters,
      returns: tool.returns
    }));
  }

  async execute(actionId, params) {
    const tool = this.get(actionId);
    if (!tool) {
      throw new Error(`Unknown tool: ${actionId}`);
    }
    return await tool.handler(params);
  }
}
```

### Action Routing

Match form submissions to tools and execute.

```javascript
// lib/tools/router.js
export const routeAction = async (actionId, formData, toolRegistry) => {
  const tool = toolRegistry.get(actionId);
  
  if (!tool) {
    return {
      success: false,
      error: { code: 'UNKNOWN_ACTION', message: `No tool found for action: ${actionId}` }
    };
  }

  // Validate required parameters
  const missingParams = tool.parameters
    .filter(p => p.required && !formData[p.name])
    .map(p => p.name);

  if (missingParams.length > 0) {
    return {
      success: false,
      error: { code: 'MISSING_PARAMS', message: `Missing required parameters: ${missingParams.join(', ')}` }
    };
  }

  try {
    const result = await toolRegistry.execute(actionId, formData);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: { code: 'EXECUTION_ERROR', message: error.message }
    };
  }
};
```

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

1. Create tool definition in `lib/tools/definitions/`:

```javascript
// lib/tools/definitions/delete-instance.js
export const deleteInstanceTool = {
  name: "Delete Instance",
  description: "Permanently deletes a compute instance",
  action_id: "delete_instance",
  endpoint: "DELETE /api/instances/:id",
  parameters: [
    { name: "instance_id", type: "string", description: "ID of instance to delete", required: true },
    { name: "force", type: "boolean", description: "Force delete without confirmation", required: false }
  ],
  returns: "Deletion confirmation with instance_id and deleted_at timestamp",
  handler: async (params) => {
    // Implementation
  }
};
```

2. Register in tool registry:

```javascript
// lib/tools/index.js
import { deleteInstanceTool } from './definitions/delete-instance';
toolRegistry.register(deleteInstanceTool);
```

### Adding a New Workflow

Add to `lib/prompts/workflows.js`:

```javascript
export const WORKFLOW_TEMPLATES = {
  // ... existing workflows
  delete_instance: {
    name: "Instance Deletion Workflow",
    steps: [
      { step: 1, name: "Selection", description: "Select instance to delete", required_fields: ["instance_id"] },
      { step: 2, name: "Confirmation", description: "Confirm deletion", ui_hint: "Warning alert with confirm button" },
      { step: 3, name: "Result", description: "Show deletion result" }
    ]
  }
};
```

### Adding New Components

1. Add to whitelist in `lib/prompts/ui-schema.js`
2. Create renderer in `components/vm2/`
3. Register in component catalog
