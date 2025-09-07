# ScheduleDesk Jobber OAuth Integration Plan

**Date Created**: 2025-09-01  
**Status**: Planning Phase - Awaiting Jobber API details  
**Context**: Supabase integration complete, now need robust Jobber OAuth for real-time data sync

## Project Overview

With ScheduleDesk's Supabase integration successfully implemented (Phases 1-4 complete), the next major milestone is establishing a bulletproof OAuth connection with Jobber's API. This will enable:

1. **Secure authentication** with Jobber accounts
2. **Real-time team member data** syncing from Jobber → Supabase
3. **Availability events management** primarily in Supabase
4. **Future job/visit editing** capabilities (Phase 2)

## Current State Summary

**✅ Completed:**
- Supabase database with hybrid data architecture
- Team pages (`/team`, `/team/[memberId]`, `/schedule`) using live data
- Fallback system for graceful degradation
- Migration scripts and data merging logic

**🎯 Next Goal:**
Replace static Jobber data cache with live OAuth-authenticated API calls

## Critical Questions Needing Jobber API Research

### **1. OAuth Setup & Credentials**
- Do we have a registered Jobber app with client ID/secret?
- What OAuth scopes are required for team members and availability data?
- Should we implement server-side OAuth flow (more secure) or client-side?

### **2. Authentication Architecture** 
- Should users authenticate directly with Jobber, or ScheduleDesk login → Jobber connection?
- Do we need to support multiple Jobber accounts/organizations?
- Session duration and refresh token handling requirements?

### **3. Data Sync Strategy**
- **Pull frequency**: Real-time webhooks, periodic sync, or manual refresh?
- **Data storage**: Cache all Jobber team data in Supabase vs. fetch on-demand?
- **Conflict resolution**: How to handle Jobber data changes during user editing?

### **4. API Architecture**
- Build Next.js API routes (`/api/jobber/*`) or separate API server?
- Use GraphQL client for Jobber API or create REST wrapper?
- Rate limiting and error handling strategies for Jobber API?

### **5. User Experience Flow**
- Login page design - separate page or embedded in main app?
- OAuth error/disconnection handling
- Jobber connection status visibility in UI?

### **6. Technical Environment**
- We have `JOBBER_APP_CLIENT_ID` - need client secret and redirect URLs
- Any existing Jobber integration patterns to follow?

## Proposed Implementation Phases

### **Phase 1: OAuth Foundation**
1. **Jobber App Configuration**
   - Register/configure Jobber OAuth app
   - Set up redirect URLs and scopes
   - Secure credential management

2. **Authentication Flow**
   - Login page with Jobber OAuth
   - Token storage and refresh handling
   - Session management middleware

3. **API Infrastructure** 
   - Next.js API routes for Jobber integration
   - GraphQL client setup
   - Error handling and rate limiting

### **Phase 2: Team Data Integration**
1. **Replace Static Cache**
   - Convert current static `jobberData` to live API calls
   - Update `getMergedTeamMembers` service
   - Maintain fallback for offline scenarios

2. **Real-time Sync**
   - Implement team member data fetching
   - Update Supabase cache with fresh Jobber data  
   - Handle data merging conflicts

3. **UI Integration**
   - Add OAuth connection status to UI
   - Handle authentication state in components
   - Loading states for API calls

### **Phase 3: Availability Events** 
1. **Availability Data Model**
   - Map Jobber availability to Supabase schema
   - Bi-directional sync strategy
   - Conflict resolution logic

2. **CRUD Operations**
   - Create/edit availability in Supabase
   - Sync relevant changes back to Jobber
   - Real-time updates across sessions

## Files That Will Need Updates

### **New Files:**
- `/app/login/page.tsx` - Jobber OAuth login page
- `/app/api/auth/jobber/route.ts` - OAuth callback handler
- `/app/api/jobber/team-members/route.ts` - Team member API endpoint
- `/lib/jobber/client.ts` - Jobber API client setup
- `/lib/jobber/oauth.ts` - OAuth flow management
- `/lib/auth/middleware.ts` - Authentication middleware

### **Updated Files:**
- `/lib/supabase/services/teamMembers.ts` - Replace static data with API calls
- `/app/team/page.tsx` - Add OAuth state handling
- `/app/schedule/page.tsx` - Add authentication checks
- `.env.local` - Add Jobber client secret and redirect URLs

## Context for Future Sessions

**To resume this project, reference:**
1. This planning document
2. `SUPABASE_SETUP_PLAN.md` (completed foundation)
3. Current working code in `/lib/supabase/services/teamMembers.ts`
4. Existing static data structure in `/data/teamMembersData.ts`

**Key implementation details:**
- Supabase integration is complete and working
- Team pages are live with database data
- Need to replace static Jobber cache with OAuth API calls
- Focus on TeamMembers and AvailabilityEvents (not job editing yet)

**Important environment context:**
- Monorepo structure with Next.js 15 + React 19
- TypeScript throughout
- Supabase client configured and working
- Development server: `pnpm --filter=web dev`

## Next Actions

1. **Research Jobber OAuth requirements** using questions above
2. **Get missing credentials** (client secret, redirect URLs, scopes)
3. **Review Jobber GraphQL API documentation** for team member endpoints
4. **Return to Claude with answers** and proceed with implementation

---

**Status**: Awaiting Jobber API research. Ready to implement once OAuth details are confirmed.