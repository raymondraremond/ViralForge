"use client"

import { useState, useRef, useEffect } from "react"
import { BrainCircuit, Cpu, Sparkles, Terminal, Play, Loader2, Send } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getProfile, upsertProfile } from "@/lib/actions"

type LogEntry = { text: string; type: "system" | "info" | "strategy" | "warning" | "error" | "success" }

const initialLogs: LogEntry[] = [
  { text: "[SYSTEM]: ViralForge AI Brain initialized.", type: "system" },
  { text: "[INFO]: Multi-agent system standing by.", type: "info" },
  { text: "[INFO]: Ready to scan trends or generate content.", type: "info" },
]

export default function BrainPage() {
  const supabase = createClient()
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs)
  const [scanning, setScanning] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [niche, setNiche] = useState("AI & Technology")
  const [platform, setPlatform] = useState("tiktok")
  const [autoMode, setAutoMode] = useState(true)
  const [agentProgress, setAgentProgress] = useState({ analyst: 0, strategist: 0, producer: 0 })
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [logs])

  const addLog = (entry: LogEntry) => setLogs(prev => [...prev, entry])

  const simulateProgress = (agent: string, target: number) => {
    let current = 0
    const interval = setInterval(() => {
      current += Math.random() * 15
      if (current >= target) { current = target; clearInterval(interval) }
      setAgentProgress(prev => ({ ...prev, [agent]: Math.min(Math.round(current), 100) }))
    }, 300)
    return interval
  }

  const handleScan = async () => {
    setScanning(true)
    setAgentProgress({ analyst: 0, strategist: 0, producer: 0 })
    addLog({ text: `[SYSTEM]: Real-time trend scan initiated for "${niche}" on ${platform}...`, type: "system" })

    const i1 = simulateProgress("analyst", 100)

    try {
      const res = await fetch("/api/ai/scan")
      const data = await res.json()
      if (data.success) {
        addLog({ text: `[SUCCESS]: Scanned ${data.scanned?.length || 0} niche/platform combinations.`, type: "success" })
        addLog({ text: `[STRATEGY]: Detected viral patterns. Updating trend database.`, type: "strategy" })
      } else {
        addLog({ text: `[ERROR]: Scan failed. Verify Apify and AI keys.`, type: "error" })
      }
    } catch (error) {
      addLog({ text: `[ERROR]: Connection error during scan.`, type: "error" })
    }

    clearInterval(i1)
    setAgentProgress(prev => ({ ...prev, analyst: 100 }))
    setScanning(false)
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setAgentProgress({ analyst: 100, strategist: 0, producer: 0 })
    addLog({ text: `[SYSTEM]: Content generation pipeline started...`, type: "system" })

    const i2 = simulateProgress("strategist", 100)
    
    try {
      // Get user session for generation
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        addLog({ text: `[ERROR]: User session not found. Please log in again.`, type: "error" })
        setGenerating(false)
        return
      }

      const res = await fetch("/api/ai/generate", {
        method: "POST",
        body: JSON.stringify({
          userId: session.user.id,
          niche,
          platform
        })
      })
      const data = await res.json()

      if (data.success) {
        addLog({ text: `[STRATEGY]: Script generated: "${data.item[0]?.title}"`, type: "strategy" })
        clearInterval(i2)
        setAgentProgress(prev => ({ ...prev, strategist: 100 }))

        const i3 = simulateProgress("producer", 100)
        addLog({ text: `[PRODUCE]: Media assets generated and stored.`, type: "info" })
        addLog({ text: `[SUCCESS]: Content saved — Status: Awaiting Approval.`, type: "success" })
        clearInterval(i3)
        setAgentProgress(prev => ({ ...prev, producer: 100 }))
      } else {
        addLog({ text: `[ERROR]: Generation failed: ${data.error}`, type: "error" })
      }
    } catch (error) {
      addLog({ text: `[ERROR]: Pipeline failure. Check API logs.`, type: "error" })
    }

    setGenerating(false)
  }

  const logColor = (type: string) => {
    switch(type) {
      case "system": return "text-primary/80"
      case "strategy": return "text-purple-400"
      case "warning": return "text-yellow-400"
      case "error": return "text-red-400"
      case "success": return "text-green-400"
      default: return "text-muted-foreground"
    }
  }

  useEffect(() => {
    const loadAutoMode = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const profile = await getProfile(session.user.id)
        if (profile) setAutoMode(profile.isAutonomous || false)
      }
    }
    loadAutoMode()
  }, [])

  const toggleAutoMode = async () => {
    const newMode = !autoMode
    setAutoMode(newMode)
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await upsertProfile(session.user.id, { isAutonomous: newMode } as any)
      addLog({ text: `[SYSTEM]: Autonomous mode ${newMode ? 'ENABLED' : 'DISABLED'}.`, type: "system" })
    }
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/20 rounded-lg animate-glow-pulse"><BrainCircuit className="w-6 h-6 text-primary" /></div>
          <h2 className="text-3xl font-bold tracking-tight">AI Growth Brain</h2>
        </div>
        <p className="text-muted-foreground">Multi-agent system for autonomous content growth.</p>
      </header>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Niche</label>
          <select value={niche} onChange={e => setNiche(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm outline-none focus:border-primary/50">
            <option>AI &amp; Technology</option>
            <option>Fitness &amp; Wellness</option>
            <option>Personal Finance</option>
            <option>E-commerce</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Platform</label>
          <select value={platform} onChange={e => setPlatform(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm outline-none focus:border-primary/50">
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram</option>
            <option value="youtube">YouTube</option>
            <option value="twitter">X (Twitter)</option>
          </select>
        </div>
        <button onClick={handleScan} disabled={scanning || generating} className="px-5 py-2 glass-card rounded-xl text-sm font-medium hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-50">
          {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {scanning ? "Scanning..." : "Scan Trends"}
        </button>
        <button onClick={handleGenerate} disabled={scanning || generating} className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {generating ? "Generating..." : "Generate Content"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Agent Status */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2"><Cpu className="w-5 h-5 text-purple-400" />Active Agents</h3>
          <div className="space-y-6">
            <AgentStatus name="Trend Analyst" status={scanning ? `Scanning ${platform}...` : "Ready"} progress={agentProgress.analyst} />
            <AgentStatus name="Creative Strategist" status={generating ? "Drafting scripts..." : "Idle"} progress={agentProgress.strategist} />
            <AgentStatus name="Production Manager" status={agentProgress.producer > 0 ? "Producing assets..." : "Standby"} progress={agentProgress.producer} />
          </div>
        </div>

        {/* Live Thought Log */}
        <div className="glass-card bg-black/40 p-6 rounded-2xl font-mono text-sm border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/80 flex items-center gap-2"><Terminal className="w-4 h-4" />Brain Thought Log</h3>
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <div ref={logRef} className="space-y-1.5 overflow-y-auto max-h-[350px] scrollbar-hide">
            {logs.map((log, i) => (
              <p key={i} className={`${logColor(log.type)} text-xs leading-relaxed`}>{log.text}</p>
            ))}
            <p className="animate-pulse text-muted-foreground">_</p>
          </div>
        </div>
      </div>

      {/* Autonomous Mode Toggle */}
      <div className="glass-card p-8 rounded-2xl border-primary/20 bg-primary/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h3 className="text-xl font-bold mb-1 flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" />Autonomous Posting</h3>
            <p className="text-muted-foreground text-sm">When enabled, the brain will post directly after generation.</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Currently: <span className={autoMode ? "text-primary" : "text-muted-foreground"}>{autoMode ? "ACTIVE" : "MANUAL"}</span></span>
            <button onClick={toggleAutoMode} className="px-6 py-2 bg-primary rounded-full text-sm font-bold shadow-lg shadow-primary/30 hover:scale-105 transition-all">
              Switch to {autoMode ? "Manual Approval" : "Autonomous"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AgentStatus({ name, status, progress }: { name: string; status: string; progress: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-white/90">{name}</span>
        <span className={progress > 0 ? "text-primary" : "text-muted-foreground"}>{progress > 0 ? `${progress}%` : "Idle"}</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-xs text-muted-foreground italic">{status}</p>
    </div>
  )
}
