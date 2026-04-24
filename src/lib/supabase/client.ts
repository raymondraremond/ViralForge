import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (typeof window !== 'undefined') {
    console.log('[SUPABASE_CLIENT] Initializing with:', { 
      hasUrl: !!url,
      hasKey: !!key,
      url: url ? `${url.substring(0, 12)}...` : 'MISSING',
      env: process.env.NODE_ENV
    })
    
    if (!url || !key) {
      console.error('[SUPABASE_CLIENT] CRITICAL ERROR: Supabase credentials missing from browser environment! Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env or Vercel dashboard.')
    }
  }

  return createBrowserClient(
    url || '', 
    key || ''
  )
}
