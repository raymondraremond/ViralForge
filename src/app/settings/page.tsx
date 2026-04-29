"use client"

import { useState, useEffect } from "react"
import { Plus, CheckCircle2, Lock, Target, DollarSign, Save, Loader2, Shield, Unplug } from "lucide-react"
import { InstagramIcon, TwitterIcon, YoutubeIcon, LinkedinIcon, TikTokIcon } from "@/components/icons"
import { createClient } from "@/lib/supabase/client"
import { upsertProfile, getProfile, getConnectedAccounts, upsertSocialAccount, disconnectSocialAccount } from "@/lib/actions"

type Platform = {
  name: string;
  id: string;
  icon: any;
  connected: boolean;
  handle?: string;
  dbId?: string;
  webhookUrl?: string;
}

const platformsList: Platform[] = [
  { name: "TikTok", id: "tiktok", icon: TikTokIcon, connected: false },
  { name: "Instagram", id: "instagram", icon: InstagramIcon, connected: false },
  { name: "YouTube", id: "youtube", icon: YoutubeIcon, connected: false },
  { name: "X (Twitter)", id: "twitter", icon: TwitterIcon, connected: false },
  { name: "LinkedIn", id: "linkedin", icon: LinkedinIcon, connected: false },
]

export default function SettingsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>(platformsList)
  const [revenueGoal, setRevenueGoal] = useState("0")
  const [niche, setNiche] = useState("AI & Technology")
  const [antiFlagging, setAntiFlagging] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Prompt state
  const [promptPlatform, setPromptPlatform] = useState<Platform | null>(null)
  const [handleInput, setHandleInput] = useState("")
  const [webhookInput, setWebhookInput] = useState("")

  const supabase = createClient()

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        
        // Load profile
        const profile = await getProfile(session.user.id)
        if (profile) {
          setNiche(profile.niche || "AI & Technology")
          setRevenueGoal(profile.monetizationGoal?.toString() || "0")
        }

        // Load connected accounts from DB via server action
        await refreshConnectedAccounts(session.user.id)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const refreshConnectedAccounts = async (userId: string) => {
    try {
      const accounts = await getConnectedAccounts(userId)
      console.log("[SETTINGS] Loaded accounts:", accounts.length)
      
      setPlatforms(platformsList.map(p => {
        const account = accounts.find((a: any) => a.platform === p.id)
        if (account) {
          return { ...p, connected: true, handle: account.handle, dbId: account.id, webhookUrl: account.webhookUrl }
        }
        return { ...p, connected: false, handle: undefined, dbId: undefined, webhookUrl: undefined }
      }))
    } catch (e) {
      console.error("[SETTINGS] Failed to load accounts:", e)
    }
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    await upsertProfile(user.id, {
      niche,
      monetizationGoal: revenueGoal
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const [connectingId, setConnectingId] = useState<string | null>(null)

  const handleConnectInitiate = (platform: Platform) => {
    setPromptPlatform(platform)
    setHandleInput(platform.handle || `@${user.email?.split('@')[0] || 'user'}`)
    setWebhookInput(platform.webhookUrl || "")
  }

  const handleConnectConfirm = async () => {
    if (!user || !promptPlatform) return
    const pId = promptPlatform.id
    const finalHandle = handleInput.trim() || `@${user.email?.split('@')[0]}_${pId}`
    
    setPromptPlatform(null)
    setConnectingId(pId)
    
    console.log(`[SETTINGS] Connecting platform: ${pId} with handle: ${finalHandle}`)

    try {
      const result = await upsertSocialAccount({
        userId: user.id,
        platform: pId,
        platformUserId: `${pId}_${user.id.substring(0, 8)}`,
        handle: finalHandle,
        accessToken: `vf_token_${Date.now()}`,
        isActive: true,
        webhookUrl: webhookInput.trim() || null
      })

      if (result?.data) {
        console.log("[SETTINGS] Account connected successfully:", result.data)
        // Refresh from DB to ensure consistency
        await refreshConnectedAccounts(user.id)
      } else {
        console.error("[SETTINGS] Connect failed:", result?.error)
        alert(`Failed to connect account: ${result?.error || "Unknown error"}`)
      }
    } catch (err: any) {
      console.error("[SETTINGS] Unexpected error:", err)
      alert("An unexpected error occurred while connecting.")
    } finally {
      setConnectingId(null)
      setHandleInput("")
    }
  }

  const handleDisconnect = async (pId: string) => {
    if (!user) return
    setConnectingId(pId)
    const success = await disconnectSocialAccount(user.id, pId)
    if (success) {
      // Refresh from DB
      await refreshConnectedAccounts(user.id)
    } else {
      alert("Failed to disconnect. Please try again.")
    }
    setConnectingId(null)
  }

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-[80vh] gap-4 text-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">Synchronizing with ViralForge...</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 sm:space-y-10 animate-in fade-in slide-in-from-right-4 duration-700 max-w-5xl mx-auto">
      <header className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">System Configuration</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Manage your connections and autonomous growth strategy.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Social Connections */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />Social Connections
          </h3>
          <p className="text-xs text-muted-foreground -mt-2">Connect your social accounts to enable auto-posting from the AI Brain.</p>
          <div className="space-y-3">
            {platforms.map((platform) => (
              <div key={platform.id} className={`glass-card p-4 rounded-xl flex items-center justify-between gap-2 transition-all ${platform.connected ? 'border-green-500/20' : ''}`}>
                <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                  <div className={`p-2 rounded-lg shrink-0 ${platform.connected ? 'bg-green-500/10' : 'bg-white/5'}`}>
                    <platform.icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{platform.name}</p>
                    <p className={`text-xs truncate ${platform.connected ? 'text-green-400' : 'text-muted-foreground'}`}>
                      {platform.connected ? platform.handle : "Not connected"}
                    </p>
                  </div>
                </div>
                {platform.connected ? (
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <div className="hidden sm:flex items-center gap-1.5 text-green-400 text-xs font-medium">
                      <CheckCircle2 className="w-4 h-4" />Active
                    </div>
                    <button 
                      onClick={() => handleDisconnect(platform.id)} 
                      disabled={!!connectingId}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {connectingId === platform.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unplug className="w-3 h-3" />}
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleConnectInitiate(platform)} 
                    disabled={!!connectingId}
                    className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-xs font-bold hover:bg-primary/30 transition-all flex items-center gap-2 disabled:opacity-50 shrink-0"
                  >
                    {connectingId === platform.id && <Loader2 className="w-3 h-3 animate-spin" />}
                    Connect
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Connection Status Summary */}
          <div className="bg-white/5 p-4 rounded-xl mt-4">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-white">{platforms.filter(p => p.connected).length}</span> of {platforms.length} accounts connected.
              {platforms.filter(p => p.connected).length === 0 && (
                <span className="text-yellow-400 ml-1">Connect at least one account to enable auto-posting.</span>
              )}
            </p>
          </div>
        </div>

        {/* Growth Goals */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />Monetization Goals
          </h3>
          <div className="glass-card p-4 sm:p-6 rounded-2xl space-y-6">
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
                  <p className="text-muted-foreground hidden sm:block">Randomizes post times and metadata.</p>
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

      {/* Handle Input Prompt Overlay */}
      {promptPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl shadow-2xl border-primary/30 animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              Connect {promptPlatform.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">Enter your {promptPlatform.name} handle to link with ViralForge for auto-posting.</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Account Handle</label>
                <input
                  autoFocus
                  type="text"
                  value={handleInput}
                  onChange={e => setHandleInput(e.target.value)}
                  placeholder="@username"
                  onKeyDown={e => e.key === 'Enter' && handleConnectConfirm()}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-primary/50 outline-none transition-all font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex justify-between">
                  <span>Posting Webhook URL (Optional)</span>
                  <a href="https://zapier.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">Get from Zapier</a>
                </label>
                <input
                  type="text"
                  value={webhookInput}
                  onChange={e => setWebhookInput(e.target.value)}
                  placeholder="https://hooks.zapier.com/..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-primary/50 outline-none transition-all text-xs"
                />
                <p className="text-[10px] text-muted-foreground mt-1">Paste your Zapier/Make webhook here to enable real posting on the free tier.</p>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setPromptPlatform(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConnectConfirm}
                  className="flex-1 py-2.5 bg-primary rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                  Confirm Connection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
