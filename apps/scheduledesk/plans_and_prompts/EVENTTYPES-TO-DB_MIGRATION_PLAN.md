Database-Backed User-Configurable EventTypes Migration Plan

  Overview

  Transform the hardcoded EventTypes configuration into a database-backed, user-configurable
   system while maintaining all existing functionality and display logic.

  Current State Analysis

  - EventTypes currently hardcoded in /apps/web/config/EventTypes.ts
  - 7 predefined event types: Starts Late, Ends Early, Personal Appointment, Not Working,
  Vacation, Working, Custom
  - Each type has: name, displayName, shortDisplayName, color
  - Complex time-formatting logic in getEventTypeCalendarDisplayText() for time-based events
  - Used across CalendarGrid, EventTypeSelectMenu components
  - Supabase database exists with app_settings table for configuration storage
  - EventTypeName union type in /apps/web/types/index.ts defines valid event type names

  Phase 1: Database Schema Updates

  1.1 Create event_types Table

  CREATE TABLE event_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    short_display_name TEXT NOT NULL,
    color TEXT NOT NULL,
    is_system_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_deletable BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  1.2 Add Indexes and Constraints

  CREATE INDEX idx_event_types_active ON event_types(is_active);
  CREATE INDEX idx_event_types_sort_order ON event_types(sort_order);
  CREATE TRIGGER update_event_types_updated_at BEFORE UPDATE ON event_types FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

  1.3 Seed Default Data

  Insert all current EventTypes as system defaults with is_system_default = true, 
  is_deletable = false:
  - Starts Late (#feb816)
  - Ends Early (#FF7F00)
  - Personal Appointment (#9D4DF2)
  - Not Working (#A87360)
  - Vacation (#2BAA2E)
  - Working (#4babff)
  - Custom (#8c8e90)

  1.4 Update Foreign Key Relationships

  Add constraint to availability_events.event_type to reference event_types.name (using name
   as FK for backward compatibility)

  Phase 2: Service Layer Creation

  2.1 EventTypes Service (/lib/supabase/services/eventTypes.ts)

  // Core CRUD operations
  export const getEventTypes = async (activeOnly = true) => Promise<EventTypeConfig[]>
  export const getEventTypeByName = async (name: string) => Promise<EventTypeConfig | null>
  export const createEventType = async (eventType: CreateEventTypeInput) =>
  Promise<EventTypeConfig>
  export const updateEventType = async (id: string, updates: UpdateEventTypeInput) =>
  Promise<EventTypeConfig>
  export const deleteEventType = async (id: string) => Promise<void>
  export const reorderEventTypes = async (reorderedTypes: {id: string, sort_order:
  number}[]) => Promise<void>
  export const resetToDefaults = async () => Promise<void>

  2.2 React Hook (/lib/supabase/hooks/useEventTypes.ts)

  export const useEventTypes = () => {
    // State management for event types
    // Loading states
    // Error handling
    // Real-time subscriptions
    // Cache management
    // CRUD operations with optimistic updates
    return {
      eventTypes,
      loading,
      error,
      createEventType,
      updateEventType,
      deleteEventType,
      reorderEventTypes,
      refreshEventTypes
    }
  }

  2.3 Type Definitions Update

  Update /apps/web/types/index.ts:
  - Keep EventTypeName as union type but make it dynamic
  - Add database entity types: EventTypeEntity, CreateEventTypeInput, UpdateEventTypeInput
  - Add loading state types for UI components

  Phase 3: Application Layer Updates

  3.1 EventTypeProvider Context

  Create /lib/contexts/EventTypeContext.tsx:
  // Global state management for event types
  // Wraps useEventTypes hook
  // Provides event types to entire app
  // Handles loading/error states
  // Manages cache invalidation

  3.2 Update EventTypes.ts Config File

  Transform /apps/web/config/EventTypes.ts:
  - Remove hardcoded EventTypes array
  - Keep all utility functions: getEventTypeColor, getEventTypeCalendarDisplayText, etc.
  - Add fallback data for when database is unavailable
  - Add loading state helpers
  - Maintain backward compatibility

  3.3 Update Components

  - EventTypeSelectMenu: Use dynamic event types from EventTypeProvider context instead of
  hardcoded array
  - CalendarGrid: Handle loading states gracefully, show skeleton/fallback when event types
  are loading
  - EventEditor: Support adding/editing custom event types [SKIPPED per user request]

  3.4 App Provider Updates

  Wrap main app with EventTypeProvider in appropriate layout file

  Phase 4: User Interface for Management

  [TO DISCUSS BEFORE IMPLEMENTATION]

  Create EventTypeManager component with:
  - List view of all event types (system + custom)
  - Add new custom event type form
  - Edit existing custom types (system defaults read-only)
  - Delete custom types (with confirmation)
  - Color picker integration
  - Drag-and-drop reordering
  - Reset to defaults button
  - Import/export functionality

  Integration location and UX flow needs discussion before proceeding.

  Phase 5: Migration & Data Integrity

  5.1 Data Migration Script

  Create migration to:
  - Ensure all existing availability_events.event_type values have corresponding entries in
  event_types table
  - Handle any orphaned event types gracefully
  - Validate data consistency

  5.2 Fallback & Error Handling

  - Graceful degradation when database unavailable
  - Fallback to hardcoded defaults if needed
  - Error boundaries around event type operations
  - User-friendly error messages

  5.3 Type Safety Considerations

  - Dynamic EventTypeName type generation
  - Runtime validation of event type names
  - TypeScript strict mode compatibility
  - Proper loading state typing

  Implementation Order

  1. Database schema (Phase 1) - Foundation
  2. Service layer (Phase 2) - Data access
  3. Context provider (Phase 3.1) - State management
  4. Config file updates (Phase 3.2) - Utility functions
  5. Component updates (Phase 3.3) - UI integration
  6. Migration script (Phase 5.1) - Data integrity
  7. Testing & validation - Ensure no regressions
  8. Phase 4 discussion - UI management features

  Key Considerations

  - Maintain existing display logic: All time-formatting in getEventTypeCalendarDisplayText
  must work unchanged
  - Performance: Cache event types, minimize database calls
  - Type safety: Ensure TypeScript compatibility with dynamic types
  - Backward compatibility: Existing events and components should work without changes
  - User experience: Loading states should be seamless and non-disruptive
  - Data validation: Prevent invalid colors, duplicate names, etc.
  - System integrity: Protect system default event types from deletion

  Success Criteria

  - All existing functionality preserved
  - Users can create custom event types
  - Performance matches or exceeds current implementation
  - Type safety maintained throughout
  - Database-first architecture with proper fallbacks
  - No breaking changes to existing components
  - Comprehensive error handling and loading states
