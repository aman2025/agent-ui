# AI Agent Dynamic UI

An AI-powered application that generates interactive user interfaces through structured JSON responses. Instead of traditional chat, the LLM produces VM2 component structures that render as dynamic forms and displays.

## Features

- **ReAct Agent Pattern** - Reasoning → Action → Observation loop for multi-step workflows
- **Dynamic UI Generation** - LLM generates JSON component structures rendered as React
- **VM2 Component System** - Secure whitelist-based component catalog
- **Tool Integration** - Extensible tool system for API integrations
- **Sequential UI Flow** - Each interaction replaces the previous view

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Add your MISTRAL_API_KEY to .env

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the application.

## How It Works

1. User enters a natural language request
2. LLM analyzes and generates a form UI as JSON
3. User fills the form and submits
4. Tool executes with form data
5. LLM generates result UI, replacing the form

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **State**: Zustand
- **LLM**: Mistral AI
- **Icons**: Lucide React

## Project Structure

```
app/                  # Next.js routes and pages
├── api/agent/        # Agent endpoint
├── api/tools/        # Tool execution endpoint
components/
├── ui/               # shadcn/ui components
├── vm2/              # VM2 component renderers
lib/
├── agent/            # ReAct agent implementation
├── llm/              # Mistral client
├── prompts/          # Modular prompt system
├── tools/            # Tool registry and definitions
├── vm2/              # Schema, parser, catalog
store/                # Zustand state management
```

## Available Commands

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

## Extending

**Add a Tool**: Create definition in `lib/tools/definitions/`, register in `index.js`

**Add a Component**: Add to whitelist in `lib/vm2/schema.js`, create renderer in `components/vm2/`

**Add a Workflow**: Add template to `lib/prompts/workflows.js`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MISTRAL_API_KEY` | Mistral AI API key (required) |

## License

Private
