"use client"

import { useState, useEffect } from "react"
import { Play, CheckCircle2, Clock, AlertCircle, Plus, Trash2, X, Loader2, Send, ArrowRight, Copy, Eye } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getContentItems, updateContentStatus, deleteContentItem, postContentToSocial } from "@/lib/actions"

type ContentItem = {
  id: string
  title: string
  status: "draft" | "scheduled" | "posted" | "brain_review"
  hook?: string
  scriptContent?: string
  caption?: string
  hashtags?: string[]
  platform: string
  time: string
  aiMetadata?: any
}

const tabs = ["All Content", "Scheduled", "Awaiting Approval", "Posted", "Drafts"]

export default function ContentPage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("All Content")
  const [showGenModal, setShowGenModal] = useState(false)
  const [genLoading, setGenLoading] = useState(false)
  const [genNiche, setGenNiche] = useState("AI & Technology")
  const [genPlatform, setGenPlatform] = useState("tiktok")
  const [user, setUser] = useState<any>(null)
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [postingId, setPostingId] = useState<string | null>(null)
  const [copied, setCopied] = useState("")

  const supabase = createClient()

  const fetchContent = async (userId: string) => {
    try {
      const data = await getContentItems(userId)
      const mapped: ContentItem[] = data.map((i: any) => ({
        id: i.id,
        title: i.title || "Untitled Post",
        status: i.status as any,
        hook: i.hook,
        scriptContent: i.scriptContent,
        caption: i.aiMetadata?.caption || "",
        hashtags: i.aiMetadata?.hashtags || [],
        platform: i.aiMetadata?.platform || "tiktok",
        time: i.postedAt 
          ? `Posted ${new Date(i.postedAt).toLocaleDateString()}`
          : i.scheduledAt 
            ? `Scheduled ${new Date(i.scheduledAt).toLocaleDateString()}`
            : `Created ${new Date(i.createdAt).toLocaleDateString()}`,
        aiMetadata: i.aiMetadata
      }))
      setItems(mapped)
    } catch (error) {
      console.error("Failed to fetch content", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        fetchContent(session.user.id)
      } else {
        setLoading(false)
      }
    }
    getUser()
  }, [])

  const filtered = items.filter(item => {
    if (activeTab === "All Content") return true
    if (activeTab === "Scheduled") return item.status === "scheduled"
    if (activeTab === "Awaiting Approval") return item.status === "brain_review"
    if (activeTab === "Posted") return item.status === "posted"
    if (activeTab === "Drafts") return item.status === "draft"
    return true
  })

  const handleApprove = async (id: string) => {
    const res = await updateContentStatus(id, "scheduled")
    if (res) {
      setItems(prev => prev.map(i => i.id === id ? { ...i, status: "scheduled" as const, time: "Scheduled" } : i))
    }
  }

  const handleDelete = async (id: string) => {
    const success = await deleteContentItem(id)
    if (success) {
      setItems(prev => prev.filter(i => i.id !== id))
      if (selectedItem?.id === id) setSelectedItem(null)
    }
  }

  const handlePostNow = async (id: string) => {
    if (!user) return
    setPostingId(id)
    const result = await postContentToSocial(id, user.id)
    if (result.success) {
      setItems(prev => prev.map(i => i.id === id ? { ...i, status: "posted" as const, time: `Posted ${new Date().toLocaleDateString()}` } : i))
      if (selectedItem?.id === id) {
        setSelectedItem(prev => prev ? { ...prev, status: "posted" as const } : null)
      }
    } else {
      alert(result.error || "Failed to post")
    }
    setPostingId(null)
  }

  const handleGenerate = async () => {
    if (!user) return
    setGenLoading(true)
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          niche: genNiche,
          platform: genPlatform
        })
      })
      const data = await res.json()
      if (data.success) {
        await fetchContent(user.id)
      } else {
        alert(`Generation failed: ${data.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Generation failed", error)
    } finally {
      setGenLoading(false)
      setShowGenModal(false)
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(""), 2000)
  }

  const statusConfig = {
    posted: { color: "text-green-400", bg: "bg-green-500/10", label: "Posted" },
    scheduled: { color: "text-blue-400", bg: "bg-blue-500/10", label: "Scheduled" },
    brain_review: { color: "text-yellow-400", bg: "bg-yellow-500/10", label: "Review" },
    draft: { color: "text-muted-foreground", bg: "bg-white/5", label: "Draft" }
  }

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-[80vh] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">Loading your content vault...</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Content Vault</h2>
          <p className="text-muted-foreground text-sm">Manage generated content and upcoming posts.</p>
        </div>
        <button onClick={() => setShowGenModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl font-semibold hover:bg-white/90 transition-all shadow-xl shadow-white/10">
          <Plus className="w-5 h-5" />New Generation
        </button>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-1 border-b border-white/5 scrollbar-hide">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === tab ? 'text-white' : 'text-muted-foreground hover:text-white'}`}>
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(139,92,246,0.5)]" />}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content List */}
        <div className={`${selectedItem ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((item) => {
              const sc = statusConfig[item.status] || statusConfig.draft
              return (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedItem(item)}
                  className={`glass-card rounded-2xl p-5 cursor-pointer group transition-all ${selectedItem?.id === item.id ? 'border-primary/50 bg-primary/5' : ''}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${sc.bg} ${sc.color}`}>{sc.label}</span>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase">{item.platform}</span>
                  </div>
                  <h4 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">{item.title}</h4>
                  {item.hook && <p className="text-xs text-muted-foreground italic mb-3 line-clamp-2">&quot;{item.hook}&quot;</p>}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                    <div className="flex gap-2">
                      {item.status === "brain_review" && (
                        <button onClick={(e) => { e.stopPropagation(); handleApprove(item.id) }} className="text-xs text-primary hover:text-primary/80 font-medium">Approve</button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            {filtered.length === 0 && (
              <div className="col-span-full text-center py-20 text-muted-foreground">
                <p className="text-lg font-medium">No content in this category yet.</p>
                <p className="text-sm mb-6">Click &quot;New Generation&quot; to create AI-powered content.</p>
                <button onClick={() => setShowGenModal(true)} className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:scale-105 transition-all">
                  Generate Content
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Detail Panel */}
        {selectedItem && (
          <div className="glass-card p-6 rounded-2xl animate-in slide-in-from-right-4 duration-300 sticky top-8 self-start">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Content Detail</h3>
              <button onClick={() => setSelectedItem(null)} className="text-muted-foreground hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">Title</p>
                <p className="text-sm font-semibold">{selectedItem.title}</p>
              </div>

              {selectedItem.hook && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Hook</p>
                  <p className="text-sm italic text-primary">&quot;{selectedItem.hook}&quot;</p>
                </div>
              )}

              {selectedItem.scriptContent && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-muted-foreground font-medium">Script</p>
                    <button onClick={() => copyToClipboard(selectedItem.scriptContent || "", "script")} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                      {copied === "script" ? <><CheckCircle2 className="w-3 h-3 text-green-400" />Copied</> : <><Copy className="w-3 h-3" />Copy</>}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed bg-white/5 p-3 rounded-lg whitespace-pre-wrap">{selectedItem.scriptContent}</p>
                </div>
              )}

              {selectedItem.caption && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-muted-foreground font-medium">Caption</p>
                    <button onClick={() => copyToClipboard(selectedItem.caption || "", "caption")} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                      {copied === "caption" ? <><CheckCircle2 className="w-3 h-3 text-green-400" />Copied</> : <><Copy className="w-3 h-3" />Copy</>}
                    </button>
                  </div>
                  <p className="text-xs bg-primary/5 border border-primary/20 p-3 rounded-lg">{selectedItem.caption}</p>
                </div>
              )}

              {selectedItem.hashtags && selectedItem.hashtags.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-2">Hashtags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedItem.hashtags.map((tag, i) => (
                      <span key={i} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-white/10 space-y-2">
                {selectedItem.status === "brain_review" && (
                  <button onClick={() => handleApprove(selectedItem.id)} className="w-full py-2.5 bg-primary/20 text-primary border border-primary/20 rounded-xl text-sm font-bold hover:bg-primary/30 transition-all">
                    Approve for Posting
                  </button>
                )}
                {(selectedItem.status === "brain_review" || selectedItem.status === "scheduled" || selectedItem.status === "draft") && (
                  <button 
                    onClick={() => handlePostNow(selectedItem.id)} 
                    disabled={!!postingId}
                    className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {postingId === selectedItem.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    {postingId === selectedItem.id ? "Posting..." : "Post Now"}
                  </button>
                )}
                <button onClick={() => handleDelete(selectedItem.id)} className="w-full py-2 text-xs text-muted-foreground hover:text-destructive transition-colors">
                  Delete Content
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generation Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => !genLoading && setShowGenModal(false)}>
          <div className="glass-card p-8 rounded-3xl w-full max-w-md space-y-6 animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Generate Content</h3>
              <button onClick={() => !genLoading && setShowGenModal(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <p className="text-sm text-muted-foreground">The AI Brain will analyze trends and create a viral-optimized post.</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Niche</label>
                <select value={genNiche} onChange={e => setGenNiche(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-primary/50">
                  <option>AI &amp; Technology</option>
                  <option>Fitness &amp; Wellness</option>
                  <option>Personal Finance</option>
                  <option>E-commerce</option>
                  <option>Gaming</option>
                  <option>Education</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Platform</label>
                <select value={genPlatform} onChange={e => setGenPlatform(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-primary/50">
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="twitter">X (Twitter)</option>
                </select>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={genLoading} className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {genLoading ? <><Loader2 className="w-5 h-5 animate-spin" />Generating with AI...</> : <><Send className="w-5 h-5" />Launch AI Pipeline</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
