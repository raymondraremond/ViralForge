"use client"

import { useState, useEffect } from "react"
import { Zap, DollarSign, Target, TrendingUp, ArrowUpRight, Wallet, BarChart3, Loader2 } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { createClient } from "@/lib/supabase/client"
import { getProfile } from "@/lib/actions"

const defaultRevenueData = [
  { month: "Jan", revenue: 2400, goal: 5000 },
  { month: "Feb", revenue: 3800, goal: 5000 },
  { month: "Mar", revenue: 5200, goal: 6000 },
  { month: "Apr", revenue: 7100, goal: 8000 },
  { month: "May", revenue: 9800, goal: 10000 },
  { month: "Jun", revenue: 12450, goal: 10000 },
]

const platformRevenue = [
  { platform: "TikTok", amount: 5200 },
  { platform: "Instagram", amount: 3800 },
  { platform: "YouTube", amount: 2600 },
  { platform: "Sponsorships", amount: 850 },
]

export default function MonetizationPage() {
  const [loading, setLoading] = useState(true)
  const [revenueData, setRevenueData] = useState(defaultRevenueData)
  const [profile, setProfile] = useState<any>(null)

  const supabase = createClient()

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const data = await getProfile(session.user.id)
        if (data) {
          setProfile(data)
          // Adjust goal line based on user's set goal
          const goal = parseFloat(data.monetizationGoal?.toString() || "5000")
          setRevenueData(prev => prev.map(d => ({ ...d, goal })))
        }
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  if (loading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Forge Monetization</h1>
        <p className="text-muted-foreground">Maximize your revenue with AI-driven optimization.</p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={DollarSign} label="Est. Monthly Revenue" value="$12,450" trend="+18.4%" />
        <StatCard icon={Target} label="Conversion Rate" value="4.2%" trend="+1.2%" />
        <StatCard icon={Wallet} label="Total Forged (All Time)" value="$48,200" trend="+22.1%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="glass-card p-8 rounded-3xl border border-white/5">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />Revenue Growth
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(263,70%,50%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(263,70%,50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} formatter={(v: any) => [`$${Number(v).toLocaleString()}`, '']} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(263,70%,50%)" strokeWidth={2} fill="url(#revGrad)" />
              <Area type="monotone" dataKey="goal" stroke="rgba(255,255,255,0.2)" strokeWidth={1} strokeDasharray="5 5" fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Platform */}
        <div className="glass-card p-8 rounded-3xl border border-white/5">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-400" />Revenue by Platform
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={platformRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="platform" stroke="rgba(255,255,255,0.3)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} formatter={(v: any) => [`$${Number(v).toLocaleString()}`, '']} />
              <Bar dataKey="amount" fill="hsl(263,70%,50%)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Accelerators */}
      <div className="glass-card p-8 rounded-3xl border border-white/5 space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2"><Zap className="w-6 h-6 text-yellow-500" />Revenue Accelerators</h2>
        <div className="space-y-4">
          <AcceleratorItem title="TikTok Series Optimization" description="Your latest series has a 12% higher conversion rate than average. Increase posting frequency." priority="High" />
          <AcceleratorItem title="Affiliate Link Placement" description="AI suggests moving links to the first 3 seconds of description for 15% better CTR." priority="Medium" />
          <AcceleratorItem title="Sponsorship Price Calculator" description="Based on your recent growth, your base rate should increase by $200 per post." priority="Update" />
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, trend }: { icon: any; label: string; value: string; trend: string }) {
  return (
    <div className="glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Icon className="w-16 h-16" /></div>
      <div className="text-sm font-medium text-muted-foreground mb-1">{label}</div>
      <div className="text-3xl font-bold mb-2">{value}</div>
      <div className="text-xs font-bold text-green-500 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" />{trend} vs last month</div>
    </div>
  )
}

function AcceleratorItem({ title, description, priority }: { title: string; description: string; priority: string }) {
  const colors: Record<string, string> = { High: "bg-red-500/10 text-red-400", Medium: "bg-yellow-500/10 text-yellow-400", Update: "bg-primary/20 text-primary" }
  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer">
      <div className="flex justify-between items-start mb-2">
        <div className="font-semibold">{title}</div>
        <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${colors[priority] || "bg-primary/20 text-primary"}`}>{priority}</div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
