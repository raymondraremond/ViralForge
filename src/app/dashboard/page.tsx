"use client"

import { useState } from "react"
import { TrendingUp, Users, Eye, ArrowUpRight, Zap, RefreshCw, BrainCircuit, Loader2 } from "lucide-react"
import { formatNumber } from "@/lib/utils"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const demoChartData = [
  { date: "Mon", views: 1200, followers: 45 },
  { date: "Tue", views: 2100, followers: 62 },
  { date: "Wed", views: 1800, followers: 53 },
  { date: "Thu", views: 3400, followers: 87 },
  { date: "Fri", views: 4200, followers: 110 },
  { date: "Sat", views: 5800, followers: 156 },
  { date: "Sun", views: 7200, followers: 203 },
]

const demoStats = [
  { name: "Total Followers", value: 24800, change: "+12.5%", icon: Users, color: "text-blue-400" },
  { name: "Total Views", value: 1420000, change: "+34.2%", icon: Eye, color: "text-purple-400" },
  { name: "Engagement Rate", value: "4.8%", change: "+0.8%", icon: TrendingUp, color: "text-green-400" },
  { name: "Revenue Generated", value: "$12,450", change: "+18.4%", icon: Zap, color: "text-yellow-400" },
]

const demoTrends = [
  { id: "1", platform: "TikTok", trendType: "Hook", trendData: { hashtag: "AIHacks" }, viralityScore: 96 },
  { id: "2", platform: "Instagram", trendType: "Style", trendData: { hashtag: "FacelessContent" }, viralityScore: 91 },
  { id: "3", platform: "YouTube", trendType: "Format", trendData: { hashtag: "POVReactions" }, viralityScore: 87 },
  { id: "4", platform: "TikTok", trendType: "Audio", trendData: { hashtag: "LoFiBeats" }, viralityScore: 84 },
]

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false)
  const [aiRunning, setAiRunning] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await new Promise(r => setTimeout(r, 1000))
    setRefreshing(false)
  }

  const handleForceAIRun = async () => {
    setAiRunning(true)
    try {
      await fetch("/api/ai/scan")
    } catch { /* keys not set yet */ }
    setAiRunning(false)
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Growth Dashboard</h2>
          <p className="text-muted-foreground">Autonomous brain monitoring viral trends in real-time.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleRefresh} disabled={refreshing} className="px-4 py-2 glass-card rounded-lg text-sm font-medium hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button onClick={handleForceAIRun} disabled={aiRunning} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50">
            {aiRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
            {aiRunning ? "Scanning..." : "Force AI Run"}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {demoStats.map((stat) => (
          <div key={stat.name} className="glass-card p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <stat.icon className="w-12 h-12" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <h3 className="text-2xl font-bold">{typeof stat.value === "number" ? formatNumber(stat.value) : stat.value}</h3>
              <span className="text-xs font-medium text-green-400 flex items-center gap-0.5">{stat.change}<ArrowUpRight className="w-3 h-3" /></span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-6">Views Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={demoChartData}>
              <defs>
                <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(263,70%,50%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(263,70%,50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
              <Area type="monotone" dataKey="views" stroke="hsl(263,70%,50%)" strokeWidth={2} fill="url(#vg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Active Trends</h3>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] font-medium">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />LIVE
            </div>
          </div>
          <div className="space-y-3">
            {demoTrends.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg growth-gradient flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">#{(t.trendData as any).hashtag}</p>
                    <p className="text-xs text-muted-foreground">{t.platform}</p>
                  </div>
                </div>
                <p className="text-xs font-semibold text-primary">{t.viralityScore}/100</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
