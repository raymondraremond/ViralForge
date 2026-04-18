"use client"

import { 
  Play, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Plus
} from "lucide-react"

const contentItems = [
  { 
    id: 1, 
    title: "AI Productivity Hacks POV", 
    status: "scheduled", 
    platform: "TikTok", 
    thumbnail: "https://images.unsplash.com/photo-1675271591211-126ad94e495d?auto=format&fit=crop&q=80&w=200",
    time: "Today, 6:00 PM"
  },
  { 
    id: 2, 
    title: "The Future of Coding 2026", 
    status: "posted", 
    platform: "Instagram", 
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=200",
    time: "2 hours ago"
  },
  { 
    id: 3, 
    title: "Why faceless channels win", 
    status: "brain_review", 
    platform: "YouTube", 
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=200",
    time: "Awaiting Approval"
  },
]

export default function ContentPage() {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Content Vault</h2>
          <p className="text-muted-foreground">Manage generated content and upcoming posts.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl font-semibold hover:bg-white/90 transition-all shadow-xl shadow-white/10">
          <Plus className="w-5 h-5" />
          New Generation
        </button>
      </header>

      {/* Filter Tabs */}
      <div className="flex gap-4 border-b border-white/5 pb-1">
        <Tab name="All Content" active />
        <Tab name="Scheduled" />
        <Tab name="Awaiting Approval" />
        <Tab name="Archived" />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {contentItems.map((item) => (
          <div key={item.id} className="glass-card rounded-2xl overflow-hidden flex flex-col group cursor-pointer">
            {/* Thumbnail Area */}
            <div className="relative aspect-video bg-black/50 overflow-hidden">
              <img 
                src={item.thumbnail} 
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                  <Play className="w-6 h-6 fill-white text-white" />
                </div>
              </div>
              <div className="absolute top-3 left-3 px-2 py-1 glass text-[10px] font-bold rounded uppercase tracking-wider">
                {item.platform}
              </div>
            </div>

            {/* Info Area */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-sm line-clamp-1">{item.title}</h4>
                  <button className="text-muted-foreground hover:text-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon status={item.status} />
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              </div>

              {item.status === "brain_review" && (
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 py-1.5 bg-primary/20 text-primary border border-primary/20 rounded-lg text-xs font-bold hover:bg-primary/30 transition-all">
                    Approve
                  </button>
                  <button className="px-3 py-1.5 glass-card rounded-lg text-xs font-bold hover:bg-destructive/10 hover:text-destructive transition-all">
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Tab({ name, active = false }: { name: string, active?: boolean }) {
  return (
    <button className={`px-4 py-2 text-sm font-medium transition-colors relative ${active ? 'text-white' : 'text-muted-foreground hover:text-white'}`}>
      {name}
      {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(139,92,246,0.5)]" />}
    </button>
  )
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'posted':
      return <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
    case 'scheduled':
      return <Clock className="w-3.5 h-3.5 text-blue-400" />
    case 'brain_review':
      return <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
    default:
      return null
  }
}
