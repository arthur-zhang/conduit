/**
 * GitHub OAuth 2.0 Authorization Endpoint
 * Redirects user to GitHub for authentication
 */
import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ redirect, cookies, url }) => {
  const clientId = import.meta.env.GITHUB_CLIENT_ID

  if (!clientId) {
    console.error('GITHUB_CLIENT_ID not configured')
    return redirect('/?error=github_not_configured')
  }

  // Get invite token from query params and store in cookie
  const inviteToken = url.searchParams.get('invite')
  if (inviteToken) {
    cookies.set('invite_token', inviteToken, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    })
  }

  // Build callback URL based on current request origin
  const origin = url.origin
  const callbackUrl = `${origin}/api/auth/callback/github`

  // Generate PKCE code verifier and challenge
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = await generateCodeChallenge(codeVerifier)

  // Generate state for CSRF protection
  const state = generateState()

  // Store in cookies for callback verification
  cookies.set('github_code_verifier', codeVerifier, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
  })

  cookies.set('github_oauth_state', state, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
  })

  // Build authorization URL
  const authUrl = new URL('https://github.com/login/oauth/authorize')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', callbackUrl)
  authUrl.searchParams.set('scope', 'read:user')
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('code_challenge', codeChallenge)
  authUrl.searchParams.set('code_challenge_method', 'S256')

  return redirect(authUrl.toString())
}

function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return base64URLEncode(array)
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return base64URLEncode(new Uint8Array(hash))
}

function generateState(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return base64URLEncode(array)
}

function base64URLEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}
