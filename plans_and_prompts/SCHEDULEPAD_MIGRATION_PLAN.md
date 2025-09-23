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