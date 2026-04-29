"use client"

import { useState, useRef, useEffect } from "react"
import { BrainCircuit, Cpu, Sparkles, Terminal, Play, Loader2, Send, CheckCircle2, Zap, Eye, Copy, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getProfile, upsertProfile } from "@/lib/actions"

type LogEntry = { text: string; type: "system" | "info" | "strategy" | "warning" | "error" | "success" }

const initialLogs: LogEntry[] = [
  { text: "[SYSTEM]: ViralForge AI Brain initialized.", type: "system" },
  { text: "[INFO]: Multi-agent system standing by.", type: "info" },
  { text: "[INFO]: Ready to scan trends or generate content.", type: "info" },
]

type GeneratedContent = {
  title: string
  hook: string
  voiceover: string
  caption: string
  hashtags: string[]
  style: string
  visual_prompt: string
  posting_tips: string
}

export default function BrainPage() {
  const supabase = createClient()
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs)
  const [scanning, setScanning] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [niche, setNiche] = useState("AI & Technology")
  const [platform, setPlatform] = useState("tiktok")
  const [autoMode, setAutoMode] = useState(false)
  const [agentProgress, setAgentProgress] = useState({ analyst: 0, strategist: 0, producer: 0 })
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [trends, setTrends] = useState<any[]>([])
  const [copied, setCopied] = useState("")
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([])
  const [postingTo, setPostingTo] = useState<string | null>(null)
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [logs])

  const addLog = (entry: LogEntry) => setLogs(prev => [...prev, entry])

  const animateProgress = (agent: string, from: number, to: number, durationMs: number) => {
    return new Promise<void>(resolve => {
      let current = from
      const step = (to - from) / (durationMs / 50)
      const interval = setInterval(() => {
        current += step
        if (current >= to) {
          current = to
          clearInterval(interval)
          resolve()
        }
        setAgentProgress(prev => ({ ...prev, [agent]: Math.round(current) }))
      }, 50)
    })
  }

  // Load profile + connected accounts on mount
  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const profile = await getProfile(session.user.id)
        if (profile) {
          setAutoMode(profile.isAutonomous || false)
          if (profile.niche) setNiche(profile.niche)
        }

        // Load connected social accounts
        try {
          const res = await fetch(`/api/social/accounts?userId=${session.user.id}`)
          if (res.ok) {
            const data = await res.json()
            setConnectedAccounts(data.accounts || [])
          }
        } catch { /* ignore */ }
      }
    }
    loadData()
  }, [])

  const handleScan = async () => {
    setScanning(true)
    setAgentProgress({ analyst: 0, strategist: 0, producer: 0 })
    setTrends([])
    addLog({ text: `[SYSTEM]: Real-time trend scan initiated for "${niche}" on ${platform}...`, type: "system" })

    // Start progress animation
    const progressPromise = animateProgress("analyst", 0, 90, 3000)

    try {
      const res = await fetch(`/api/ai/scan?niche=${encodeURIComponent(niche)}&platform=${platform}&live=true`)
      const data = await res.json()
      
      await progressPromise
      await animateProgress("analyst", 90, 100, 300)

      if (data.success) {
        const trendCount = data.trends?.length || 0
        setTrends(data.trends || [])
        addLog({ text: `[SUCCESS]: Discovered ${trendCount} viral trends for "${niche}" on ${platform}.`, type: "success" })
        
        if (data.trends && data.trends.length > 0) {
          for (const t of data.trends.slice(0, 3)) {
            addLog({ 
              text: `[TREND]: ${t.trendData?.description || t.trendType} — Score: ${t.viralityScore}/100`, 
              type: "strategy" 
            })
          }
        }
        addLog({ text: `[INFO]: Trends saved to database. Ready for content generation.`, type: "info" })
      } else {
        addLog({ text: `[ERROR]: Scan failed: ${data.error || "Unknown error"}`, type: "error" })
      }
    } catch (error) {
      await progressPromise
      addLog({ text: `[ERROR]: Connection error during scan. Check network.`, type: "error" })
    }

    setAgentProgress(prev => ({ ...prev, analyst: 100 }))
    setScanning(false)
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setGeneratedContent(null)
    setAgentProgress({ analyst: 100, strategist: 0, producer: 0 })
    addLog({ text: `[SYSTEM]: Content generation pipeline started...`, type: "system" })
    addLog({ text: `[INFO]: Analyzing trends for "${niche}" on ${platform}...`, type: "info" })

    // Strategist progress
    const strategyProgress = animateProgress("strategist", 0, 80, 4000)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        addLog({ text: `[ERROR]: User session not found. Please log in again.`, type: "error" })
        setGenerating(false)
        return
      }

      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          niche,
          platform,
          isAutonomous: autoMode
        })
      })
      const data = await res.json()

      await strategyProgress
      await animateProgress("strategist", 80, 100, 300)

      if (data.success) {
        const strategy = data.strategy
        const title = strategy?.title || data.item?.title || "Untitled"
        
        addLog({ text: `[STRATEGY]: Script generated: "${title}"`, type: "strategy" })
        addLog({ text: `[STRATEGY]: Hook: "${strategy?.hook || ""}"`, type: "strategy" })
        
        // Producer phase
        await animateProgress("producer", 0, 100, 1500)
        
        addLog({ text: `[PRODUCE]: Content assembled and formatted.`, type: "info" })
        addLog({ text: `[SUCCESS]: Content saved — Status: ${autoMode ? "Scheduled for posting" : "Awaiting Approval"}`, type: "success" })
        
        if (strategy?.posting_tips) {
          addLog({ text: `[TIP]: ${strategy.posting_tips}`, type: "info" })
        }

        // Set the generated content for preview
        setGeneratedContent({
          title: strategy?.title || title,
          hook: strategy?.hook || "",
          voiceover: strategy?.voiceover || "",
          caption: strategy?.caption || "",
          hashtags: strategy?.hashtags || [],
          style: strategy?.style || "",
          visual_prompt: strategy?.visual_prompt || "",
          posting_tips: strategy?.posting_tips || ""
        })

        // Update trends if returned
        if (data.trends) {
          setTrends(data.trends)
        }
      } else {
        addLog({ text: `[ERROR]: Generation failed: ${data.error}`, type: "error" })
      }
    } catch (error: any) {
      addLog({ text: `[ERROR]: Pipeline failure: ${error.message || "Check API logs."}`, type: "error" })
    }

    setGenerating(false)
  }

  const handlePostNow = async (platform: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    
    setPostingTo(platform)
    addLog({ text: `[SYSTEM]: Posting content to ${platform}...`, type: "system" })
    
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          niche,
          platform,
          isAutonomous: true,
          postToSocial: true
        })
      })
      const data = await res.json()
      
      if (data.success && data.postResult?.posted) {
        addLog({ text: `[SUCCESS]: Content posted to ${data.postResult.handle} on ${platform}! 🎉`, type: "success" })
      } else {
        addLog({ text: `[INFO]: Content generated and scheduled. ${data.postResult?.message || "Connect accounts in Settings to enable auto-posting."}`, type: "info" })
      }
    } catch {
      addLog({ text: `[ERROR]: Failed to post. Check your connections.`, type: "error" })
    }
    
    setPostingTo(null)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(""), 2000)
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

  const toggleAutoMode = async () => {
    const newMode = !autoMode
    setAutoMode(newMode)
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await upsertProfile(session.user.id, { isAutonomous: newMode } as any)
      addLog({ text: `[SYSTEM]: Autonomous mode ${newMode ? 'ENABLED — content will auto-post' : 'DISABLED — manual approval required'}.`, type: "system" })
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/20 rounded-lg animate-glow-pulse"><BrainCircuit className="w-6 h-6 text-primary" /></div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">AI Growth Brain</h2>
        </div>
        <p className="text-muted-foreground text-sm sm:text-base">Multi-agent system for autonomous content growth.</p>
      </header>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 sm:gap-4 items-end">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Niche</label>
          <select value={niche} onChange={e => setNiche(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm outline-none focus:border-primary/50">
            <option>AI &amp; Technology</option>
            <option>Fitness &amp; Wellness</option>
            <option>Personal Finance</option>
            <option>E-commerce</option>
            <option>Gaming</option>
            <option>Education</option>
            <option>Lifestyle</option>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Agent Status */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2"><Cpu className="w-5 h-5 text-purple-400" />Active Agents</h3>
          <div className="space-y-6">
            <AgentStatus name="Trend Analyst" status={scanning ? `Scanning ${platform}...` : agentProgress.analyst === 100 ? "Complete" : "Ready"} progress={agentProgress.analyst} />
            <AgentStatus name="Creative Strategist" status={generating ? "Generating scripts..." : agentProgress.strategist === 100 ? "Complete" : "Idle"} progress={agentProgress.strategist} />
            <AgentStatus name="Production Manager" status={agentProgress.producer > 0 ? (agentProgress.producer === 100 ? "Content Ready" : "Producing...") : "Standby"} progress={agentProgress.producer} />
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

      {/* Discovered Trends */}
      {trends.length > 0 && (
        <div className="glass-card p-6 rounded-2xl border-primary/20 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />Discovered Trends
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trends.map((trend: any, i: number) => (
              <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{trend.trendType}</span>
                  <span className="text-xs font-bold text-green-400">{trend.viralityScore}/100</span>
                </div>
                <p className="text-sm font-medium mb-1">{trend.trendData?.description || "Viral Pattern"}</p>
                <p className="text-xs text-muted-foreground">{trend.trendData?.growth || ""} {trend.trendData?.why_viral ? `• ${trend.trendData.why_viral}` : ""}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated Content Preview */}
      {generatedContent && (
        <div className="glass-card p-6 sm:p-8 rounded-2xl border-green-500/20 bg-green-500/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />Generated Content Preview
            </h3>
            <span className="text-xs font-medium bg-green-500/20 text-green-400 px-3 py-1 rounded-full">LIVE AI GENERATED</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Script Content */}
            <div className="space-y-4">
              <ContentBlock 
                label="Title" 
                content={generatedContent.title} 
                onCopy={() => copyToClipboard(generatedContent.title, "title")}
                copied={copied === "title"}
              />
              <ContentBlock 
                label="Hook (Pattern Interrupt)" 
                content={generatedContent.hook}
                onCopy={() => copyToClipboard(generatedContent.hook, "hook")}
                copied={copied === "hook"}
                highlight
              />
              <ContentBlock 
                label="Voiceover Script" 
                content={generatedContent.voiceover}
                onCopy={() => copyToClipboard(generatedContent.voiceover, "voiceover")}
                copied={copied === "voiceover"}
                multiline
              />
            </div>

            {/* Right: Posting Details */}
            <div className="space-y-4">
              <ContentBlock 
                label="Caption (Ready to Post)" 
                content={generatedContent.caption}
                onCopy={() => copyToClipboard(generatedContent.caption, "caption")}
                copied={copied === "caption"}
                multiline
                highlight
              />
              <div className="bg-white/5 p-4 rounded-xl">
                <p className="text-xs font-medium text-muted-foreground mb-2">Hashtags</p>
                <div className="flex flex-wrap gap-2">
                  {generatedContent.hashtags.map((tag, i) => (
                    <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium cursor-pointer hover:bg-primary/20 transition-colors"
                      onClick={() => copyToClipboard(`#${tag}`, `tag-${i}`)}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <ContentBlock 
                label="Visual Direction" 
                content={generatedContent.visual_prompt}
                onCopy={() => copyToClipboard(generatedContent.visual_prompt, "visual")}
                copied={copied === "visual"}
                multiline
              />
              <div className="bg-white/5 p-4 rounded-xl">
                <p className="text-xs font-medium text-muted-foreground mb-1">Style</p>
                <p className="text-sm">{generatedContent.style}</p>
              </div>
              {generatedContent.posting_tips && (
                <div className="bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-xl">
                  <p className="text-xs font-medium text-yellow-400 mb-1">📌 Posting Strategy</p>
                  <p className="text-sm text-muted-foreground">{generatedContent.posting_tips}</p>
                </div>
              )}
            </div>
          </div>

          {/* Post Now Buttons */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-sm font-medium mb-3">Quick Post to Connected Accounts:</p>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => handlePostNow(platform)}
                disabled={!!postingTo}
                className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/30 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {postingTo ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {postingTo ? "Posting..." : `Post to ${platform}`}
              </button>
              <button 
                onClick={() => copyToClipboard(
                  `${generatedContent.caption}\n\n${generatedContent.hashtags.map(t => `#${t}`).join(' ')}`,
                  "full"
                )}
                className="px-5 py-2.5 glass-card rounded-xl text-sm font-medium hover:bg-white/10 transition-all flex items-center gap-2"
              >
                {copied === "full" ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied === "full" ? "Copied!" : "Copy All"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Autonomous Mode Toggle */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border-primary/20 bg-primary/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h3 className="text-xl font-bold mb-1 flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" />Autonomous Posting</h3>
            <p className="text-muted-foreground text-sm">When enabled, generated content will be automatically posted to your connected social accounts.</p>
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
        <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-xs text-muted-foreground italic">{status}</p>
    </div>
  )
}

function ContentBlock({ label, content, onCopy, copied, multiline, highlight }: {
  label: string
  content: string
  onCopy: () => void
  copied: boolean
  multiline?: boolean
  highlight?: boolean
}) {
  return (
    <div className={`p-4 rounded-xl ${highlight ? 'bg-primary/5 border border-primary/20' : 'bg-white/5'}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <button onClick={onCopy} className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
          {copied ? <><CheckCircle2 className="w-3 h-3 text-green-400" />Copied</> : <><Copy className="w-3 h-3" />Copy</>}
        </button>
      </div>
      <p className={`text-sm ${multiline ? 'whitespace-pre-wrap leading-relaxed' : 'font-medium'}`}>{content}</p>
    </div>
  )
}
