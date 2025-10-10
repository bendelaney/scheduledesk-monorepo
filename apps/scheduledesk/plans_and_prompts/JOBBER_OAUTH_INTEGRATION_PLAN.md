# ScheduleDesk Jobber OAuth Integration Plan

**Date Created**: 2025-09-01
**Date Updated**: 2025-10-04
**Status**: ✅ Phase 1 & 2 Complete - OAuth and Live API Integration Working
**Context**: Supabase integration complete, Jobber OAuth implemented, live data syncing active

## Project Overview

With ScheduleDesk's Supabase integration successfully implemented (Phases 1-4 complete), we have now established a fully functional OAuth connection with Jobber's API. This enables:

1. ✅ **Secure authentication** with Jobber accounts
2. ✅ **Real-time team member data** syncing from Jobber → Supabase
3. ⏳ **Availability events management** primarily in Supabase (future)
4. ⏳ **Job/visit display and editing** capabilities (in progress)

## Current State Summary

**✅ Completed:**
- Supabase database with hybrid data architecture
- Team pages (`/team`, `/team/[memberId]`, `/schedule`) using live data
- Fallback system for graceful degradation
- Migration scripts and data merging logic
- **Jobber OAuth authentication flow (server-side)**
- **Live Jobber GraphQL API integration**
- **Real-time team member data syncing from Jobber**
- **Data caching in Supabase with fallback support**
- **Login page with OAuth connection**

**🎯 Next Goals:**
- Implement token refresh logic for long-lived sessions
- Add Jobber connection status indicator in UI
- Fetch and display job visits from Jobber API
- Implement availability events sync (if needed)

## Implementation Decisions Made

### **1. OAuth Setup & Credentials** ✅
- ✅ Registered Jobber app with client ID/secret configured
- ✅ OAuth scopes: `read:users read:visits`
- ✅ Server-side OAuth flow implemented (more secure)

### **2. Authentication Architecture** ✅
- ✅ Users authenticate directly with Jobber via `/login` page
- ✅ Single Jobber account per session (stored in httpOnly cookies)
- ✅ Access tokens stored in httpOnly cookies (1 hour expiry)
- ✅ Refresh tokens stored separately (30 day expiry)
- ⏳ Token refresh logic not yet implemented

### **3. Data Sync Strategy** ✅
- ✅ On-demand fetching when team pages load
- ✅ Data cached in Supabase `jobber_users` table
- ✅ Fallback to cached data if Jobber API unavailable
- ✅ Update cache with fresh Jobber data on each successful fetch

### **4. API Architecture** ✅
- ✅ Next.js API routes: `/api/jobber/*`
- ✅ GraphQL client for Jobber API (direct fetch with typed queries)
- ✅ Error handling with fallback to cache
- ⏳ Rate limiting not yet implemented

### **5. User Experience Flow** ✅
- ✅ Separate `/login` page with Jobber OAuth button
- ✅ Auto-redirect if already authenticated
- ✅ OAuth callback handles token storage
- ⏳ Connection status indicator not yet in UI
- ⏳ Disconnection/re-auth flow needs improvement

### **6. Technical Environment** ✅
- ✅ Environment variables configured in `.env.local`
- ✅ Reused QuickList OAuth patterns as reference
- ✅ Jobber API version: 2025-01-20

## Implementation Phases

### **Phase 1: OAuth Foundation** ✅ COMPLETE
1. **Jobber App Configuration** ✅
   - ✅ Configured Jobber OAuth app credentials
   - ✅ Set up redirect URLs and scopes (`read:users read:visits`)
   - ✅ Secure credential management in `.env.local`

2. **Authentication Flow** ✅
   - ✅ Login page at `/login` with Jobber OAuth
   - ✅ Token storage in httpOnly cookies
   - ⏳ Token refresh handling (TODO)
   - ⏳ Session management middleware (TODO)

3. **API Infrastructure** ✅
   - ✅ Next.js API routes: `/api/auth/jobber/*`, `/api/jobber/users`
   - ✅ GraphQL client setup in `/lib/jobber/client.ts`
   - ✅ Error handling with cache fallback
   - ⏳ Rate limiting (TODO)

### **Phase 2: Team Data Integration** ✅ COMPLETE
1. **Replace Static Cache** ✅
   - ✅ Converted to live API calls via `/api/jobber/users`
   - ✅ Updated `getMergedTeamMembers` service
   - ✅ Maintains fallback to cached Supabase data

2. **Real-time Sync** ✅
   - ✅ Team member data fetched from Jobber GraphQL API
   - ✅ Supabase cache updated with fresh Jobber data
   - ✅ Data merging handles both API and cache formats
   - ✅ Normalized ID and email field handling

3. **UI Integration** ✅
   - ✅ Login page with authentication check
   - ✅ Loading states in team pages
   - ⏳ OAuth connection status indicator (TODO)
   - ⏳ Re-authentication flow (TODO)

### **Phase 3: Job Visits Integration** ⏳ TODO
1. **Visits API Route**
   - Create `/api/jobber/visits` endpoint
   - Fetch visits from Jobber GraphQL API
   - Cache visits in `jobber_visits` table

2. **Visits Display**
   - Show visits on team calendar
   - Display visit details and client info
   - Handle visit status and scheduling

### **Phase 4: Availability Events** ⏳ FUTURE
1. **Availability Data Model**
   - Map Jobber availability to Supabase schema
   - Bi-directional sync strategy
   - Conflict resolution logic

2. **CRUD Operations**
   - Create/edit availability in Supabase
   - Sync relevant changes back to Jobber
   - Real-time updates across sessions

## Files Created/Modified

### **New Files Created:** ✅
- ✅ `/app/login/page.tsx` - Jobber OAuth login page
- ✅ `/app/login/page.scss` - Login page styles
- ✅ `/app/api/auth/jobber/route.ts` - OAuth initiation handler
- ✅ `/app/api/auth/jobber/callback/route.ts` - OAuth callback handler
- ✅ `/app/api/auth/jobber/check/route.ts` - Authentication status check
- ✅ `/app/api/jobber/users/route.ts` - Team member API endpoint
- ✅ `/lib/jobber/client.ts` - Jobber GraphQL API client

### **Updated Files:** ✅
- ✅ `/lib/supabase/services/teamMembers.ts` - Live API integration with cache fallback
- ✅ `/app/team/page.tsx` - Added key normalization for team member rendering
- ✅ `.env.local` - Added Jobber OAuth credentials and API configuration

### **Files for Future Updates:** ⏳
- ⏳ `/lib/auth/middleware.ts` - Authentication middleware (TODO)
- ⏳ `/app/api/jobber/visits/route.ts` - Job visits API endpoint (TODO)
- ⏳ `/app/schedule/page.tsx` - Add authentication checks (TODO)
- ⏳ `/components/JobberStatus.tsx` - Connection status indicator (TODO)

## Context for Future Sessions

**To resume this project, reference:**
1. This planning document (current status tracker)
2. `SUPABASE_SETUP_PLAN.md` (completed foundation)
3. Working OAuth implementation in `/app/api/auth/jobber/`
4. Jobber API client in `/lib/jobber/client.ts`
5. Team member service in `/lib/supabase/services/teamMembers.ts`

**Key implementation details:**
- ✅ Supabase integration complete and working
- ✅ Jobber OAuth authentication fully functional
- ✅ Team pages fetching live Jobber data via GraphQL API
- ✅ Data caching and fallback system working
- ✅ Users synced from Jobber → Supabase on each fetch
- ✅ Merged data structure combines Jobber + internal team member data

**Important environment context:**
- Monorepo structure with Next.js 15 + React 19
- TypeScript throughout
- Supabase client configured and working
- Jobber GraphQL API version: 2025-01-20
- Development server: `pnpm --filter=scheduledesk dev`

**Authentication Flow:**
1. User visits `/login` → checks if already authenticated
2. Clicks "Connect with Jobber" → redirects to Jobber OAuth
3. Jobber callback → stores tokens in httpOnly cookies
4. Team pages call `/api/jobber/users` → fetches live data
5. Data cached in Supabase, merged with internal team members

## Known Issues & Improvements Needed

1. **Token Refresh** ⚠️
   - Access tokens expire after 1 hour
   - Need to implement automatic refresh token logic
   - Should refresh before expiry to prevent interruptions

2. **Database Sync Warnings** ⚠️
   - Duplicate key errors during cache sync (non-critical)
   - Using Promise.allSettled to handle gracefully
   - Consider debouncing or single upsert transaction

3. **UI Improvements** ⏳
   - Add Jobber connection status indicator
   - Show "Reconnect to Jobber" button if auth expires
   - Better error messaging for API failures

4. **Rate Limiting** ⏳
   - No rate limiting on Jobber API calls yet
   - Should implement request throttling/caching

## Next Actions

### **Immediate Priority:**
1. ✅ ~~Implement Jobber OAuth flow~~ COMPLETE
2. ✅ ~~Fetch live team member data from Jobber API~~ COMPLETE
3. ⏳ Implement token refresh logic
4. ⏳ Add connection status UI indicator

### **Medium Priority:**
1. ⏳ Fetch job visits from Jobber API
2. ⏳ Display visits on team calendar
3. ⏳ Add authentication middleware for protected routes
4. ⏳ Implement rate limiting and request caching

### **Future Enhancements:**
1. ⏳ Availability events sync (if needed)
2. ⏳ Webhook integration for real-time updates
3. ⏳ Multi-account support (if needed)
4. ⏳ Offline mode improvements

---

**Status**: ✅ Phase 1 & 2 Complete - OAuth and live data integration working successfully!
