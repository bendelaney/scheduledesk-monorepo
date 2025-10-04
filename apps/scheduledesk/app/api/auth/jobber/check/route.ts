import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('jobber_access_token')

  if (!accessToken) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({ authenticated: true })
}
