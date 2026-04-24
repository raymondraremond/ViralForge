import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * MIDDLEWARE: Auth Protection
 * Protects app routes, redirects unauthenticated users to /login.
 */

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/api/auth/callback']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip public routes and static files
  if (
    PUBLIC_ROUTES.some(route => pathname === route) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/ai') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  // Sanitize URL
  if (supabaseUrl) {
    supabaseUrl = supabaseUrl.replace(/\/$/, '')
    if (supabaseUrl.endsWith('/rest/v1')) {
      supabaseUrl = supabaseUrl.replace('/rest/v1', '')
    }
  }

  if (!supabaseUrl || !supabaseKey) {
    console.error('[MIDDLEWARE] CRITICAL ERROR: Supabase credentials missing!')
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
