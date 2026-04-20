"use client"

import { useState } from "react"
import { Play, MoreVertical, CheckCircle2, Clock, AlertCircle, Plus, Trash2, X, Loader2, Send } from "lucide-react"

type ContentItem = {
  id: string
  title: string
  status: "draft" | "scheduled" | "posted" | "brain_review"
  platform: string
  thumbnail: string
  time: string
  hook?: string
}

const demoContent: ContentItem[] = [
  { id: "1", title: "AI Productivity Hacks POV", status: "scheduled", platform: "TikTok", thumbnail: "https://images.unsplash.com/photo-1675271591211-126ad94e495d?auto=format&fit=crop&q=80&w=400", time: "Today, 6:00 PM", hook: "POV: Your AI just saved you 4 hours" },
  { id: "2", title: "The Future of Coding 2026", status: "posted", platform: "Instagram", thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=400", time: "2 hours ago", hook: "Stop scrolling if you want to code faster" },
  { id: "3", title: "Why faceless channels win", status: "brain_review", platform: "YouTube", thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=400", time: "Awaiting Approval", hook: "Nobody shows their face anymore. Here's why." },
  { id: "4", title: "5 SaaS Ideas That Print Money", status: "draft", platform: "TikTok", thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400", time: "Draft", hook: "Each one makes $10K/mo minimum" },
]

const tabs = ["All Content", "Scheduled", "Awaiting Approval", "Posted", "Drafts"]

export default function ContentPage() {
  const [items, setItems] = useState<ContentItem[]>(demoContent)
  const [activeTab, setActiveTab] = useState("All Content")
  const [showGenModal, setShowGenModal] = useState(false)
  const [genLoading, setGenLoading] = useState(false)

  const filtered = items.filter(item => {
    if (activeTab === "All Content") return true
    if (activeTab === "Scheduled") return item.status === "scheduled"
    if (activeTab === "Awaiting Approval") return item.status === "brain_review"
    if (activeTab === "Posted") return item.status === "posted"
    if (activeTab === "Drafts") return item.status === "draft"
    return true
  })

  const handleApprove = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: "scheduled" as const, time: "Scheduled for next slot" } : i))
  }

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const handleGenerate = async () => {
    setGenLoading(true)
    await new Promise(r => setTimeout(r, 2000))
    const newItem: ContentItem = {
      id: Date.now().toString(),
      title: "AI-Generated: Viral Hook Pattern",
      status: "brain_review",
      platform: "TikTok",
      thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=400",
      time: "Just now",
      hook: "This one trick 10x'd my growth overnight"
    }
    setItems(prev => [newItem, ...prev])
    setGenLoading(false)
    setShowGenModal(false)
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Content Vault</h2>
          <p className="text-muted-foreground">Manage generated content and upcoming posts.</p>
        </div>
        <button onClick={() => setShowGenModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl font-semibold hover:bg-white/90 transition-all shadow-xl shadow-white/10">
          <Plus className="w-5 h-5" />New Generation
        </button>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/5 pb-1">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === tab ? 'text-white' : 'text-muted-foreground hover:text-white'}`}>
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(139,92,246,0.5)]" />}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((item) => (
          <div key={item.id} className="glass-card rounded-2xl overflow-hidden flex flex-col group cursor-pointer">
            <div className="relative aspect-video bg-black/50 overflow-hidden">
              <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                  <Play className="w-6 h-6 fill-white text-white" />
                </div>
              </div>
              <div className="absolute top-3 left-3 px-2 py-1 glass text-[10px] font-bold rounded uppercase tracking-wider">{item.platform}</div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-sm line-clamp-1">{item.title}</h4>
                  <button onClick={() => handleDelete(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {item.hook && <p className="text-xs text-muted-foreground italic mb-2 line-clamp-1">&quot;{item.hook}&quot;</p>}
                <div className="flex items-center gap-2">
                  <StatusIcon status={item.status} />
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              </div>

              {item.status === "brain_review" && (
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleApprove(item.id)} className="flex-1 py-1.5 bg-primary/20 text-primary border border-primary/20 rounded-lg text-xs font-bold hover:bg-primary/30 transition-all">Approve</button>
                  <button onClick={() => handleDelete(item.id)} className="px-3 py-1.5 glass-card rounded-lg text-xs font-bold hover:bg-destructive/10 hover:text-destructive transition-all">Reject</button>
                </div>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">No content in this category yet.</p>
            <p className="text-sm">Click &quot;New Generation&quot; to create AI-powered content.</p>
          </div>
        )}
      </div>

      {/* Generation Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => !genLoading && setShowGenModal(false)}>
          <div className="glass-card p-8 rounded-3xl w-full max-w-md space-y-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Generate Content</h3>
              <button onClick={() => !genLoading && setShowGenModal(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <p className="text-sm text-muted-foreground">The AI Brain will analyze trends and create a viral-optimized post.</p>
            <button onClick={handleGenerate} disabled={genLoading} className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {genLoading ? <><Loader2 className="w-5 h-5 animate-spin" />Generating...</> : <><Send className="w-5 h-5" />Launch AI Pipeline</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "posted": return <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
    case "scheduled": return <Clock className="w-3.5 h-3.5 text-blue-400" />
    case "brain_review": return <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
    default: return <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground" />
  }
}
