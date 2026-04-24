import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Sanitize URL: Remove trailing slash and accidental '/rest/v1' suffix
  if (url) {
    url = url.replace(/\/$/, '')
    if (url.endsWith('/rest/v1')) {
      url = url.replace('/rest/v1', '')
    }
  }

  if (typeof window !== 'undefined') {
    console.log('[SUPABASE_CLIENT] Initializing with:', { 
      hasUrl: !!url,
      hasKey: !!key,
      url: url ? `${url.substring(0, 20)}...` : 'MISSING',
      env: process.env.NODE_ENV
    })
    
    if (!url || !key) {
      console.error('[SUPABASE_CLIENT] CRITICAL ERROR: Supabase credentials missing!')
    }
  }

  return createBrowserClient(
    url || '', 
    key || ''
  )
}
