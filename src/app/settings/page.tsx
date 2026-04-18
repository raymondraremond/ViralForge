"use client"

import { 
  Instagram, 
  Twitter, 
  Youtube, 
  Linkedin, 
  Plus,
  CheckCircle2,
  Lock,
  Target,
  DollarSign
} from "lucide-react"

const platforms = [
  { name: "TikTok", icon: "tiktok", connected: true, handle: "@viralforge_ai" },
  { name: "Instagram", icon: Instagram, connected: true, handle: "@viralforge.prod" },
  { name: "YouTube", icon: Youtube, connected: false },
  { name: "X (Twitter)", icon: Twitter, connected: false },
  { name: "LinkedIn", icon: Linkedin, connected: false },
]

export default function SettingsPage() {
  return (
    <div className="p-8 space-y-10 animate-in fade-in slide-in-from-right-4 duration-700 max-w-5xl">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">System Configuration</h2>
        <p className="text-muted-foreground">Manage your connections and autonomous growth strategy.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Social Connections */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            Social Connections
          </h3>
          <div className="space-y-3">
            {platforms.map((platform) => (
              <div key={platform.name} className="glass-card p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white/5 rounded-lg">
                    {typeof platform.icon === 'string' ? (
                       <span className="font-bold text-lg">T</span>
                    ) : (
                      <platform.icon className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{platform.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {platform.connected ? platform.handle : "Not connected"}
                    </p>
                  </div>
                </div>
                {platform.connected ? (
                  <div className="flex items-center gap-2 text-green-400 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Active
                  </div>
                ) : (
                  <button className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-xs font-bold hover:bg-primary/30 transition-all">
                    Connect
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Growth Goals */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />
            Monetization Goals
          </h3>
          <div className="glass-card p-6 rounded-2xl space-y-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Monthly Revenue Goal</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  defaultValue="10,000" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:border-primary/50 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Primary Niche</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white focus:border-primary/50 outline-none transition-all appearance-none">
                <option>AI & Technology</option>
                <option>Fitness & Wellness</option>
                <option>Personal Finance</option>
                <option>E-commerce</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-4 block">Anti-Flagging System</label>
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-xl border border-primary/20">
                <div className="text-xs">
                  <p className="font-bold text-primary">Human-like Variations</p>
                  <p className="text-muted-foreground">Randomizes post times and metadata.</p>
                </div>
                <div className="w-10 h-5 bg-primary rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
            </div>

            <button className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
              Save Strategy
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
