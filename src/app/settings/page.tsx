"use client"

import { useState } from "react"
import { Plus, CheckCircle2, Lock, Target, DollarSign, Save, Loader2, Shield } from "lucide-react"
import { InstagramIcon, TwitterIcon, YoutubeIcon, LinkedinIcon, TikTokIcon } from "@/components/icons"

const platformsList = [
  { name: "TikTok", icon: TikTokIcon, connected: true, handle: "@viralforge_ai" },
  { name: "Instagram", icon: InstagramIcon, connected: true, handle: "@viralforge.prod" },
  { name: "YouTube", icon: YoutubeIcon, connected: false },
  { name: "X (Twitter)", icon: TwitterIcon, connected: false },
  { name: "LinkedIn", icon: LinkedinIcon, connected: false },
]

export default function SettingsPage() {
  const [platforms, setPlatforms] = useState(platformsList)
  const [revenueGoal, setRevenueGoal] = useState("10,000")
  const [niche, setNiche] = useState("AI & Technology")
  const [antiFlagging, setAntiFlagging] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    // In production, this calls upsertProfile server action
    await new Promise(r => setTimeout(r, 1000))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleConnect = (name: string) => {
    // In production, this initiates OAuth flow
    setPlatforms(prev => prev.map(p =>
      p.name === name ? { ...p, connected: true, handle: `@viralforge_${name.toLowerCase()}` } : p
    ))
  }

  const handleDisconnect = (name: string) => {
    setPlatforms(prev => prev.map(p =>
      p.name === name ? { ...p, connected: false, handle: undefined } : p
    ))
  }

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
            <Lock className="w-4 h-4 text-primary" />Social Connections
          </h3>
          <div className="space-y-3">
            {platforms.map((platform) => (
              <div key={platform.name} className="glass-card p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white/5 rounded-lg"><platform.icon className="w-5 h-5" /></div>
                  <div>
                    <p className="text-sm font-medium">{platform.name}</p>
                    <p className="text-xs text-muted-foreground">{platform.connected ? platform.handle : "Not connected"}</p>
                  </div>
                </div>
                {platform.connected ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
                      <CheckCircle2 className="w-4 h-4" />Active
                    </div>
                    <button onClick={() => handleDisconnect(platform.name)} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button onClick={() => handleConnect(platform.name)} className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-xs font-bold hover:bg-primary/30 transition-all">
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
            <Target className="w-4 h-4 text-purple-400" />Monetization Goals
          </h3>
          <div className="glass-card p-6 rounded-2xl space-y-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Monthly Revenue Goal</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={revenueGoal}
                  onChange={e => setRevenueGoal(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:border-primary/50 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Primary Niche</label>
              <select
                value={niche}
                onChange={e => setNiche(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white focus:border-primary/50 outline-none transition-all appearance-none"
              >
                <option>AI &amp; Technology</option>
                <option>Fitness &amp; Wellness</option>
                <option>Personal Finance</option>
                <option>E-commerce</option>
                <option>Gaming</option>
                <option>Education</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-4 block">Anti-Flagging System</label>
              <button
                onClick={() => setAntiFlagging(!antiFlagging)}
                className={`flex items-center justify-between w-full p-3 rounded-xl border transition-all ${antiFlagging ? 'bg-primary/10 border-primary/20' : 'bg-white/5 border-white/10'}`}
              >
                <div className="text-xs text-left">
                  <p className={`font-bold ${antiFlagging ? 'text-primary' : 'text-muted-foreground'}`}>
                    <Shield className="w-3 h-3 inline mr-1" />Human-like Variations
                  </p>
                  <p className="text-muted-foreground">Randomizes post times and metadata.</p>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${antiFlagging ? 'bg-primary' : 'bg-white/20'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${antiFlagging ? 'right-1' : 'left-1'}`} />
                </div>
              </button>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
              {saving ? "Saving..." : saved ? "Saved!" : "Save Strategy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
