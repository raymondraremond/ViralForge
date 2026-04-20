import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('Supabase Config:', { 
    url: url ? `${url.substring(0, 20)}...` : 'MISSING',
    key: key ? `${key.substring(0, 10)}...` : 'MISSING'
  })

  if (!url || !key) {
    console.error('Supabase credentials missing! Check your .env.local file.')
  }

  return createBrowserClient(url || '', key || '')
}
