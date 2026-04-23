import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * SUPABASE AUTH CALLBACK
 * Handles the OAuth redirect after login/signup (email confirmation, OAuth providers).
 */

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  console.log('[AUTH_CALLBACK] Status:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    origin,
    code: !!code
  })

  if (!supabaseUrl || !supabaseKey) {
    console.error('[AUTH_CALLBACK] Critical: Supabase credentials missing on server!')
    return NextResponse.redirect(`${origin}/login?error=missing_config`)
  }

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignored in Server Component context
          }
        },
      },
    })

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    
    console.error('[AUTH_CALLBACK] Exchange error:', error)
  }

  // Redirect to login with error if auth code exchange fails
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
