# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Root Level Commands
- `pnpm dev` - Start all apps in development mode
- `pnpm dev:web` - Start only the web app (port 3000)
- `pnpm dev:quicklist` - Start only the QuickList app (port 3000)
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
- `pnpm --filter=quicklist dev` - Run development server for QuickList app only
- `pnpm --filter=quicklist build` - Build QuickList app only
- `pnpm --filter=quicklist type-check` - Type check QuickList only
- `pnpm --filter=@repo/ui generate:component` - Generate new UI component

## Monorepo Architecture

This is a **Turborepo monorepo** using **pnpm workspaces** for a ScheduleDesk platform - a scheduling and project management system.

### Project Structure
- **Root**: Contains monorepo configuration (turbo.json, pnpm-workspace.yaml)
- **apps/**: Next.js applications
  - `web/`: Main ScheduleDesk web application (port 3000)
  - `quicklist/`: QuickList task management application (port 3000)
- **packages/**: Shared packages and tooling
  - `@repo/ui`: Shared React component library
  - `@repo/components`: Shared business components with Luxon integration
  - `@repo/eslint-config`: ESLint configurations (base, next-js, react-internal)
  - `@repo/typescript-config`: TypeScript configurations (base, nextjs, react-library)
- **_temp-migration/**: Contains legacy SchedulePad React app being migrated

### Technology Stack
- **Build System**: Turborepo with pnpm workspaces
- **Apps**: Next.js 15+ with React 19
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + Passport OAuth2 (QuickList)
- **External APIs**: Jobber, OpenAI, Mapbox, WeatherAPI
- **Styling**: SASS/SCSS (not CSS modules)
- **TypeScript**: Version 5.8.2 with strict type checking
- **Linting**: ESLint 9+ with custom configurations
- **Formatting**: Prettier
- **Drag & Drop**: @dnd-kit
- **Animation**: Framer Motion, react-spring
- **Date/Time**: Luxon, react-datepicker, flatpickr

## Environment Variables

Required environment variables (from turbo.json):
- **Database**: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- **AI**: OPENAI_API_KEY
- **Jobber Integration**: JOBBER_APP_CLIENT_ID, REACT_APP_JOBBER_API_URL, REACT_APP_REDIRECT_URL
- **External APIs**: MAPBOX_TOKEN, WEATHERAPI_KEY
- **General**: REACT_APP_API_URL

Environment files are located in each app directory:
- `apps/web/.env.local`
- `apps/quicklist/.env.local`

## Business Context

ScheduleDesk is a Jobber-integrated scheduling platform focused on:
- **Team member availability tracking** and calendar management
- **Event type configuration** (Working, Vacation, Personal Appointments, Starts Late, Ends Early, etc.)
- **Jobber OAuth integration** for customer and job data synchronization
- **Calendar UI state management** via CalendarUIContext for complex scheduling workflows
- **AI-powered scheduling** with OpenAI integration for natural language processing

### Core Domain Concepts
- **TeamMember**: Individual team members with availability tracking
- **AvailabilityEvent**: Scheduled events (Working, Vacation, etc.) with recurrence support
- **JobVisit**: Jobber-synced job appointments with client and location data
- **EventTypes**: Configurable event categories with color coding and display rules
- **ScheduleDocument**: Multi-day schedule views with drag-drop functionality

## Database & External Integrations

- **Supabase**: Primary database (PostgreSQL) and authentication
- **Jobber API**: Customer/job data via OAuth2 integration
- **OpenAI**: AI-powered features for natural language input processing
- **Mapbox**: Location services and mapping functionality
- **WeatherAPI**: Weather data for scheduling context

### Shared Package System
- `@repo/ui`: Contains reusable React components (button, card, code)
  - Uses Turbo generators for component scaffolding
  - Exports components via `./src/*.tsx` pattern
- `@repo/components`: Shared business components with Luxon integration
- `@repo/eslint-config`: Provides base, Next.js, and React-specific ESLint configs
- `@repo/typescript-config`: Provides base, Next.js, and React library TypeScript configs

## Application Details

### Web App (apps/web)
Main ScheduleDesk application featuring:
- **Team calendar management** with availability tracking
- **Drag-and-drop scheduling** using @dnd-kit
- **Event type configuration** system
- **Jobber integration** for customer/job data
- **AI-powered input** processing with OpenAI
- **Sandbox page** at `/sandbox` for component testing

### QuickList App (apps/quicklist)
Separate task management application featuring:
- **Passport OAuth2 authentication** (independent of Supabase auth)
- **Flatpickr** for date/time selection
- **Marked** for markdown processing
- **Express sessions** for session management
- **Separate styling** system with SASS

## Development Workflow

### Port Management
- Both apps default to port 3000 - **run separately, not simultaneously**
- Use `pnpm dev:web` or `pnpm dev:quicklist` to specify which app to run

### Type Checking
- Global: `pnpm type-check`
- Web only: `pnpm --filter=web check-types`
- QuickList only: `pnpm --filter=quicklist check-types`

### Environment Setup
- Create `.env.local` files in each app directory
- Copy required environment variables from turbo.json
- Supabase, Jobber, and API keys required for full functionality

### Testing & Development
- **Sandbox page**: http://localhost:3000/sandbox (web app only)
- **SASS compilation**: Built into Next.js build process
- **Webpack source maps**: Custom configuration in web app's next.config.ts

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

