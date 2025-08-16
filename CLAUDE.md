# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Root Level Commands
- `pnpm dev` - Start all apps in development mode
- `pnpm dev:web` - Start only the web app (port 3000)
- `pnpm dev:docs` - Start only the docs app (port 3001)
- `pnpm build` - Build all apps and packages
- `pnpm build:web` - Build only the web app
- `pnpm lint` - Run ESLint on all packages
- `pnpm lint:fix` - Run ESLint with auto-fix
- `pnpm type-check` - Run TypeScript type checking across monorepo
- `pnpm test` - Run tests across all packages
- `pnpm clean` - Clean build artifacts
- `pnpm format` - Format code with Prettier

### Package-specific Commands
- `pnpm --filter=web dev` - Run development server for web app only
- `pnpm --filter=docs build` - Build docs app only
- `pnpm --filter=@repo/ui generate:component` - Generate new UI component

## Monorepo Architecture

This is a **Turborepo monorepo** using **pnpm workspaces** for a ScheduleDesk platform - a scheduling and project management system.

### Project Structure
- **Root**: Contains monorepo configuration (turbo.json, pnpm-workspace.yaml)
- **apps/**: Next.js applications
  - `web/`: Main web application (port 3000)
  - `docs/`: Documentation site (port 3001)
- **packages/**: Shared packages and tooling
  - `@repo/ui`: Shared React component library
  - `@repo/eslint-config`: ESLint configurations (base, next-js, react-internal)
  - `@repo/typescript-config`: TypeScript configurations (base, nextjs, react-library)
- **_temp-migration/**: Contains legacy SchedulePad React app being migrated

### Technology Stack
- **Build System**: Turborepo with pnpm workspaces
- **Apps**: Next.js 15+ with React 19
- **Styling**: CSS modules and global CSS
- **TypeScript**: Version 5.8.2 with strict type checking
- **Linting**: ESLint 9+ with custom configurations
- **Formatting**: Prettier

### Shared Package System
- `@repo/ui`: Contains reusable React components (button, card, code)
  - Uses Turbo generators for component scaffolding
  - Exports components via `./src/*.tsx` pattern
- `@repo/eslint-config`: Provides base, Next.js, and React-specific ESLint configs
- `@repo/typescript-config`: Provides base, Next.js, and React library TypeScript configs

### Styling Guidelines
- **Component Styles**: Co-locate SCSS files with components (`Component.tsx` + `Component.scss`)
- **Page Styles**: Use `page.tsx` + `page.scss` pattern in app directory
- **Global Styles**: Place in `/styles/globals.scss`
- **Avoid**: Centralized `/styles/components/` folder
- **NEVER** change my naming conventions or specific names of variables, components, or other objects. Deeply respect the author's wishes and DO NO IMPROVISE NEW NAMES FOR THINGS. 

### Migration Context
The `_temp-migration/` directory contains a legacy SchedulePad React application with comprehensive scheduling functionality including:
- Drag-and-drop job scheduling
- Team member management
- AI-powered natural language input
- Complex state management with Context API

### Development Notes
- Uses pnpm as package manager (version 8+)
- Node.js 18+ required
- Turborepo handles task orchestration and caching
- Apps are configured with Turbopack for faster development builds
- ESLint configured with max warnings of 0 (strict)
- All packages are private and use TypeScript
- SASS is installed for styling (uses `page.tsx` + `page.scss` pattern, not CSS modules)

### Component Testing
- **Sandbox Page**: Available at `/sandbox` when running the web app
  - Navigate to http://localhost:3000/sandbox during development
  - Simple testing area for isolating and testing migrated components from legacy SchedulePad

## Component Migration from SchedulePad

### 🟢 EASY MIGRATION (JS→TSX + Import Updates Only)
**Icons - 36 components**: Pure SVG functional components, no dependencies, no state
- All `Icons/*.js` → `.tsx` (simple find/replace conversion)

**Pure UI Components - 2 components**: Minimal external dependencies
- `EmptyStateCard/` - Already .tsx, uses CSS modules
- `Portal/` - Standard ReactDOM.createPortal pattern

### 🟡 MEDIUM MIGRATION (Client Directive + Dependency Updates)
**External Library Dependencies - 3 components**
- `RotatingIcon/` - react-spring animations (needs 'use client')
- `SlideSwitch/` - Complex interactive state (needs 'use client')
- `WeatherIcon/` - fetch API + environment variables (needs 'use client')

**Form Components - 2 components**
- `DateSelector/` - Uses react-datepicker library (needs 'use client')
- `DateRangeSelector/` - Likely similar datepicker dependency

**UI Interaction - 4 components**
- `Dialog/`, `Modal/`, `Popover/` - Portal-based overlays (need 'use client')
- `DragDrop/` - Basic DnD wrapper (needs 'use client')

**Business Display - 4 components**
- `JobDetailsView/`, `JobVisitConfirmationStatusSelector/` - Display + form logic
- `DataViewer/`, `SelectMenu/` - Interactive data components (need 'use client')

### 🔴 HARD MIGRATION (Major Refactoring Required)
**Route Conversion Required**
- `Routes/` - React Router → Next.js App Router (complete rewrite)
- `AppFrame/` - Layout component → Next.js layout.tsx pattern

**Complex State & DnD**
- `BlockManager/` - Custom keyboard selection system + complex state
- `ScheduleDocument/` - @dnd-kit integration + GSAP animations + complex state
- `ScheduleDocumentDay/` - Rendering logic tied to ScheduleDocument

**External API Integrations**
- `EventEditor/SmartEventInput/` - OpenAI API calls + Anthropic SDK
- `MapView/` - Mapbox GL integration + API keys
- `NewScheduleForm/` - Complex form with external integrations

**Context-Dependent Components**
- `JobBlock/` - Uses custom contexts + Luxon + Framer Motion
- `TeamMemberBlock/` - Uses custom contexts + complex interaction state
- `Settings/`, `Sidebar/`, `TopBar/` - App-level components with routing dependencies

### Migration Order
1. Icons (36 components) + Pure UI (2 components)
2. External Library Components (3 components)
3. Form Components (2 components)
4. UI Interaction (4 components)
5. Business Display (4 components)
6. Set up contexts and routing architecture
7. Context-Dependent Components
8. Complex State Components
9. External Integrations
10. Routing Conversion