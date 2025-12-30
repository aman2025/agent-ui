# Tech Stack & Build System

## Core Technologies

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router, JavaScript/JSX) |
| UI Library | shadcn/ui |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| State Management | Zustand |
| LLM Provider | Mistral AI (`@mistralai/mistralai`) |

## Key Dependencies

- `class-variance-authority` + `clsx` + `tailwind-merge` - shadcn/ui styling utilities
- `zustand` - Lightweight state management

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Code Style

- Prettier: no semicolons, single quotes, 2-space tabs, 100 char width
- ESLint: Next.js core-web-vitals, warnings for unused vars and console
- No prop-types (JSX only, no TypeScript)

## Path Aliases

- `@/*` maps to project root (configured in jsconfig.json)

## Environment Variables

- `MISTRAL_API_KEY` - Required for LLM client
