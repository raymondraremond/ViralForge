"use client"

import { Card } from "@/components/ui/card" // Assuming shadcn cards
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Share2, 
  ArrowUpRight,
  Zap
} from "lucide-react"
import { formatNumber } from "@/lib/utils"

const stats = [
  { name: "Total Followers", value: 124500, change: "+12%", icon: Users, color: "text-blue-400" },
  { name: "Total Views", value: 8900000, change: "+24%", icon: Eye, color: "text-purple-400" },
  { name: "Engagement Rate", value: "8.4%", change: "+2%", icon: TrendingUp, color: "text-green-400" },
  { name: "Monetization Progress", value: "72%", change: "Trending Up", icon: Zap, color: "text-yellow-400" },
]

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Growth Dashboard</h2>
          <p className="text-muted-foreground">Autonomous brain is currently analyzing TikTok trends.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 glass-card rounded-lg text-sm font-medium hover:bg-white/10 transition-all">
            Refresh Data
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:scale-105 transition-all">
            Force AI Run
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-stats gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="glass-card p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <stat.icon className="w-12 h-12" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <h3 className="text-2xl font-bold">
                {typeof stat.value === "number" ? formatNumber(stat.value) : stat.value}
              </h3>
              <span className="text-xs font-medium text-green-400 flex items-center gap-0.5">
                {stat.change}
                <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Placeholder */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl min-h-[400px]">
          <h3 className="text-lg font-semibold mb-4">Views Over Time</h3>
          <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground border border-dashed border-white/10 rounded-xl">
            [Interactive Recharts Graph Loading...]
          </div>
        </div>

        {/* Live Trend Feed */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-4">Active Trends</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg growth-gradient flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">#AITechRevolution</p>
                    <p className="text-xs text-muted-foreground">TikTok • High Virality</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-primary">8.4k/hr</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
