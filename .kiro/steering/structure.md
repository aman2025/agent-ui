# Project Structure

```
├── app/                        # Next.js App Router
│   ├── api/
│   │   ├── agent/route.js      # Main agent endpoint (queries + form submissions)
│   │   └── tools/route.js      # Direct tool execution endpoint
│   ├── globals.css
│   ├── layout.jsx
│   └── page.jsx                # Main UI with VM2Renderer
│
├── components/
│   ├── ui/                     # shadcn/ui base components
│   └── vm2/                    # VM2 component renderers
│       ├── Renderer.jsx        # Main renderer - JSON to React
│       └── [Component].jsx     # Individual component implementations
│
├── lib/
│   ├── agent/
│   │   └── react.js            # ReAct agent loop implementation
│   ├── llm/
│   │   └── client.js           # Mistral AI client with retry logic
│   ├── prompts/                # Modular prompt system
│   │   ├── base.js             # Agent identity & rules
│   │   ├── ui-schema.js        # Component whitelist & schemas
│   │   ├── tools.js            # Dynamic tool prompt generator
│   │   ├── workflows.js        # Multi-step workflow templates
│   │   ├── examples.js         # Few-shot examples
│   │   └── composer.js         # Assembles all prompt layers
│   ├── tools/
│   │   ├── registry.js         # Tool registration & execution
│   │   ├── router.js           # Action routing from forms
│   │   └── definitions/        # Individual tool definitions
│   └── vm2/
│       ├── schema.js           # Component whitelist & validation schemas
│       ├── parser.js           # JSON parsing with security checks
│       └── catalog.js          # Component lookup functions
│
└── store/
    └── agentStore.js           # Zustand store (UI state, form values)
```

## Architecture Layers

1. **UI Layer** (`components/vm2/`) - React renderers for VM2 components
2. **State Layer** (`store/`) - Zustand for form values and current UI
3. **Agent Layer** (`lib/agent/`) - ReAct loop: Reason → Act → Observe → Decide
4. **Prompt Layer** (`lib/prompts/`) - Composable system prompt assembly
5. **Tool Layer** (`lib/tools/`) - Registry, routing, and tool definitions

## Extension Points

- **New Tool**: Add to `lib/tools/definitions/`, register in `index.js`
- **New Component**: Add to `lib/vm2/schema.js` whitelist, create renderer in `components/vm2/`
- **New Workflow**: Add to `lib/prompts/workflows.js`
