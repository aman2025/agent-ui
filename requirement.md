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
## Tools and Prompts

### Tool Definition
- Business logic and workflow definitions (e.g., instance creation)
- Each tool maps to a third-party system API endpoint
- Parameter contracts and response data schemas
- Previous step's UI context informs next step's JSON generation

### Action Routing
- Match `action_id` from submitted forms to corresponding tools
- Call APIs with form values as parameters
- Return results to LLM for next UI generation

### Prompt Engineering
- UI component rendering conventions
- System role definitions
- Input/output examples for consistent LLM responses

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
├── app/                    # Next.js App Router
│   ├── api/                # API routes (agent, tools)
│   ├── globals.css         # Global styles
│   ├── layout.jsx          # Root layout
│   └── page.jsx            # Main page component
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   └── vm2/                # VM2 component renderers
├── lib/                    # Core libraries
│   ├── agent/              # ReAct agent logic
│   ├── llm/                # LLM client (Mistral)
│   └── tools/              # Tool definitions
├── store/                  # Zustand stores
├── utils/                  # Utility functions
├── public/                 # Static assets
├── package.json
├── tailwind.config.js
├── next.config.js
├── .env                    # Environment variables
├── .eslintrc.json
├── .prettierrc
└── .gitignore
```
