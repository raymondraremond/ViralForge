import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (typeof window !== 'undefined') {
    console.log('Supabase Client Init:', { 
      hasUrl: !!url,
      hasKey: !!key,
      urlPrefix: url ? url.substring(0, 15) : 'NONE'
    })
  }

  if (!url || !key) {
    if (typeof window !== 'undefined') {
      console.error('CRITICAL: Supabase credentials missing from browser environment!')
    }
  }

  return createBrowserClient(
    url || '', 
    key || ''
  )
}
