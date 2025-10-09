import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code) {
    return NextResponse.json({ error: 'Authorization code not provided' }, { status: 400 })
  }

  // Decode state to get returnUrl
  let returnUrl = '/'
  if (state) {
    try {
      const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'))
      returnUrl = decodedState.returnUrl || '/'
    } catch (err) {
      console.warn('Failed to decode state parameter:', err)
    }
  }

  try {
    // Validate required environment variables
    const missingVars = []
    if (!process.env.JOBBER_CALLBACK_URL) missingVars.push('JOBBER_CALLBACK_URL')
    if (!process.env.JOBBER_CLIENT_ID) missingVars.push('JOBBER_CLIENT_ID')
    if (!process.env.JOBBER_CLIENT_SECRET) missingVars.push('JOBBER_CLIENT_SECRET')
    if (!process.env.JOBBER_TOKEN_URL) missingVars.push('JOBBER_TOKEN_URL')

    if (missingVars.length > 0) {
      console.error('Missing environment variables:', missingVars)
      return NextResponse.json({
        error: 'Server configuration error',
        details: `Missing environment variables: ${missingVars.join(', ')}`
      }, { status: 500 })
    }

    // Exchange code for access token
    const tokenData = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.JOBBER_CALLBACK_URL!,
      client_id: process.env.JOBBER_CLIENT_ID!,
      client_secret: process.env.JOBBER_CLIENT_SECRET!
    })

    console.log('Token request data:', {
      url: process.env.JOBBER_TOKEN_URL,
      redirect_uri: process.env.JOBBER_CALLBACK_URL,
      client_id: process.env.JOBBER_CLIENT_ID,
      code: code?.substring(0, 10) + '...' // Log partial code for debugging
    })

    const tokenResponse = await fetch(process.env.JOBBER_TOKEN_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: tokenData
    })

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenResponse.status, tokenResponse.statusText)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
    }

    const tokenData_response = await tokenResponse.json()
    const { access_token, refresh_token } = tokenData_response

    // Store tokens in httpOnly cookies
    const baseUrl = request.nextUrl.origin
    const redirectUrl = `${baseUrl}${returnUrl}`
    console.log('Redirecting to:', redirectUrl)
    const response = NextResponse.redirect(redirectUrl)
    response.cookies.set('jobber_access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600 // 1 hour
    })

    if (refresh_token) {
      response.cookies.set('jobber_refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400 * 30 // 30 days
      })
    }

    return response

  } catch (error: any) {
    console.error('OAuth callback error:', error)
    return NextResponse.json({
      error: 'Authentication failed',
      details: error.message || 'Unknown error'
    }, { status: 500 })
  }
}
