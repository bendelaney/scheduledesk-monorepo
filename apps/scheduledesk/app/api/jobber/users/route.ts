import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { fetchJobberUsers } from '@/lib/jobber/client'
import { syncJobberUser } from '@/lib/supabase/services/teamMembers'

/**
 * GET /api/jobber/users
 * Fetches users from Jobber API and caches them in Supabase
 */
export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('jobber_access_token')

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    // Fetch users from Jobber API
    const jobberUsers = await fetchJobberUsers(accessToken.value)

    // Cache users in Supabase (ignore individual sync errors)
    const syncResults = await Promise.allSettled(
      jobberUsers.map(user =>
        syncJobberUser({
          jobber_id: user.id,
          name: user.name,
          email: user.email?.raw
        }).catch(err => {
          console.warn(`Failed to sync user ${user.id}:`, err.message)
          return null
        })
      )
    )

    const syncedCount = syncResults.filter(r => r.status === 'fulfilled').length

    return NextResponse.json({
      users: jobberUsers,
      count: jobberUsers.length,
      synced: syncedCount
    })

  } catch (error: any) {
    console.error('Error fetching Jobber users:', error)
    return NextResponse.json({
      error: 'Failed to fetch Jobber users',
      details: error.message
    }, { status: 500 })
  }
}
