"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Shield, Database, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react"

export default function DebugPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const testDatabase = async () => {
    setLoading(true)
    try {
      // 1. Test Supabase Auth
      const { data: { session }, error: authError } = await supabase.auth.getSession()
      
      // 2. Test API Route (which tests Drizzle)
      // Use the actual session user ID if available, otherwise a valid zero-UUID
      const testId = session?.user?.id || "00000000-0000-0000-0000-000000000000"
      const res = await fetch(`/api/metrics?userId=${testId}`)
      const dbData = await res.json()

      // 3. Test direct DB connection if possible or just check env
      const envCheck = await fetch('/api/debug/env')
      const envData = await envCheck.json()

      setStatus({
        auth: authError ? `Error: ${authError.message}` : "Connected",
        db: dbData.error ? `Error: ${dbData.error}` : "Connected",
        session: !!session,
        env: envData,
        rawDb: dbData
      })
    } catch (err: any) {
      setStatus({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">System Diagnostic</h1>
      </div>

      <div className="glass-card p-6 rounded-2xl space-y-6">
        <p className="text-muted-foreground">This tool tests your connection to Supabase and the Postgres database.</p>
        
        <button 
          onClick={testDatabase}
          disabled={loading}
          className="w-full py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
          {loading ? "Testing..." : "Run System Check"}
        </button>

        {status && (
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Supabase Auth:</span>
              <span className={`text-sm ${status.auth === "Connected" ? "text-green-400" : "text-red-400"}`}>
                {status.auth === "Connected" ? <CheckCircle2 className="w-4 h-4 inline mr-1" /> : <AlertTriangle className="w-4 h-4 inline mr-1" />}
                {status.auth}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Postgres DB:</span>
              <span className={`text-sm ${!status.db?.includes('Error') ? "text-green-400" : "text-red-400"}`}>
                {!status.db?.includes('Error') ? <CheckCircle2 className="w-4 h-4 inline mr-1" /> : <AlertTriangle className="w-4 h-4 inline mr-1" />}
                {status.db}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Session Active:</span>
              <span className="text-sm">{status.session ? "Yes" : "No"}</span>
            </div>

            {status.env && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs space-y-1">
                <p><strong>DB Configured:</strong> {status.env.databaseConfigured ? "✅" : "❌"}</p>
                <p><strong>DB URL Preview:</strong> {status.env.databaseUrlPreview}</p>
                <p><strong>Vercel Env:</strong> {status.env.vercelEnv}</p>
              </div>
            )}
            
            {status.rawDb?.error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-mono overflow-auto">
                <strong>Raw DB Error:</strong> {JSON.stringify(status.rawDb.error)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
