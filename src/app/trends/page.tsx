"use client"

import { useState } from "react"
import { TrendingUp, ArrowUpRight, BarChart3, Search, RefreshCw, Loader2, Flame, Zap } from "lucide-react"

type Trend = {
  id: string
  title: string
  platform: string
  score: number
  growth: string
  type: string
  detectedAgo: string
}

const demoTrends: Trend[] = [
  { id: "1", title: "Lo-Fi Coding Beats", platform: "TikTok", score: 98, growth: "+124%", type: "Audio Trend", detectedAgo: "8 min ago" },
  { id: "2", title: "AI Avatar Explainer", platform: "Instagram", score: 92, growth: "+85%", type: "Visual Style", detectedAgo: "23 min ago" },
  { id: "3", title: "Split-Screen Reactions", platform: "YouTube", score: 88, growth: "+42%", type: "Format", detectedAgo: "1 hr ago" },
  { id: "4", title: "POV Hook Pattern", platform: "TikTok", score: 95, growth: "+156%", type: "Hook", detectedAgo: "5 min ago" },
  { id: "5", title: "Faceless Channel Strategy", platform: "YouTube", score: 83, growth: "+38%", type: "Strategy", detectedAgo: "2 hr ago" },
  { id: "6", title: "Carousel Storytelling", platform: "Instagram", score: 79, growth: "+29%", type: "Format", detectedAgo: "3 hr ago" },
]

const demoScanner = [
  { id: "s1", pattern: "POV text overlays with ambient music", detectedAgo: "3 min ago", potential: "High Retention" },
  { id: "s2", pattern: "3-second pattern-interrupt hooks", detectedAgo: "8 min ago", potential: "High CTR" },
  { id: "s3", pattern: "Before/After transformation clips", detectedAgo: "14 min ago", potential: "High Shares" },
  { id: "s4", pattern: "AI-generated B-roll with voiceover", detectedAgo: "22 min ago", potential: "High Watch Time" },
]

export default function TrendsPage() {
  const [trends] = useState(demoTrends)
  const [scanning, setScanning] = useState(false)
  const [filterPlatform, setFilterPlatform] = useState("all")

  const filtered = trends.filter(t => filterPlatform === "all" || t.platform.toLowerCase() === filterPlatform)

  const handleScan = async () => {
    setScanning(true)
    try { await fetch("/api/ai/scan") } catch {}
    await new Promise(r => setTimeout(r, 2000))
    setScanning(false)
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Autonomous Trends</h1>
          <p className="text-muted-foreground">Real-time analysis of viral patterns across platforms.</p>
        </div>
        <button onClick={handleScan} disabled={scanning} className="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50">
          {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {scanning ? "Scanning..." : "Run Scan"}
        </button>
      </div>

      {/* Platform Filter */}
      <div className="flex gap-2">
        {["all", "tiktok", "instagram", "youtube"].map(p => (
          <button key={p} onClick={() => setFilterPlatform(p)} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${filterPlatform === p ? "bg-primary text-white shadow-lg shadow-primary/30" : "glass-card hover:bg-white/10"}`}>
            {p === "all" ? "All Platforms" : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Top Trends Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.slice(0, 3).map(trend => (
          <div key={trend.id} className="glass-card p-6 rounded-3xl border border-white/5 hover:border-primary/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium uppercase tracking-wider">{trend.platform}</div>
              <div className="text-green-500 text-sm font-bold flex items-center gap-1"><ArrowUpRight className="w-4 h-4" />{trend.growth}</div>
            </div>
            <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{trend.title}</h3>
            <p className="text-xs text-muted-foreground mb-4">{trend.type} • {trend.detectedAgo}</p>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-700" style={{ width: `${trend.score}%` }} />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{trend.score}%</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Virality Score</span>
              <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-400" />{trend.score >= 90 ? "On Fire" : "Trending"}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Live Scanner */}
      <div className="glass-card p-6 rounded-3xl border border-white/5">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2"><Search className="w-5 h-5 text-primary" />Pattern Scanner</h2>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-medium border border-green-500/20">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />Live
          </div>
        </div>
        <div className="space-y-4">
          {demoScanner.map(item => (
            <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-sm group-hover:text-primary transition-colors">{item.pattern}</div>
                  <div className="text-xs text-muted-foreground">{item.detectedAgo} • {item.potential}</div>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-all" />
            </div>
          ))}
        </div>
      </div>

      {/* All Trends Table */}
      {filtered.length > 3 && (
        <div className="glass-card p-6 rounded-3xl">
          <h2 className="text-lg font-semibold mb-4">All Detected Trends</h2>
          <div className="space-y-3">
            {filtered.slice(3).map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{t.title}</span>
                  <span className="text-xs text-muted-foreground px-2 py-0.5 bg-white/5 rounded">{t.platform}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-green-400 font-medium">{t.growth}</span>
                  <span className="text-xs font-semibold text-primary">{t.score}/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
