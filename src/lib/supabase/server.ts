import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  // Sanitize URL
  if (url) {
    url = url.replace(/\/$/, '')
    if (url.endsWith('/rest/v1')) {
      url = url.replace('/rest/v1', '')
    }
  }

  if (!url || !key) {
    console.error('[SUPABASE_SERVER] CRITICAL ERROR: Supabase credentials missing on server!')
  }

  return createServerClient(
    url || '',
    key || '',
    {
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
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  )
}
