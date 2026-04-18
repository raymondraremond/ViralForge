"use client"

import { BrainCircuit, Cpu, Sparkles, Terminal } from "lucide-react"

export default function BrainPage() {
  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/20 rounded-lg">
            <BrainCircuit className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">AI Growth Brain</h2>
        </div>
        <p className="text-muted-foreground">The multi-agent system is running in autonomous mode.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Agent Status */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            Active Agents
          </h3>
          <div className="space-y-6">
            <AgentStatus 
              name="Trend Analyst" 
              status="Analyzing TikTok #AITech" 
              progress={85} 
            />
            <AgentStatus 
              name="Creative Strategist" 
              status="Drafting Viral Scripts" 
              progress={40} 
            />
            <AgentStatus 
              name="Production Manager" 
              status="Waiting for Assets" 
              progress={0} 
              isWaiting
            />
          </div>
        </div>

        {/* Live Thought Log */}
        <div className="glass-card bg-black/40 p-6 rounded-2xl font-mono text-sm border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/80 flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Brain Thought Log
            </h3>
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <div className="space-y-2 text-muted-foreground overflow-y-auto max-h-[300px] scrollbar-hide">
            <p className="text-primary/80">[SYSTEM]: Agent "Trend Analyst" initialized...</p>
            <p>[INFO]: Scanning Instagram Reels for "SaaS Productivity" niche...</p>
            <p>[INFO]: Detected pattern: Split-screen videos + "POV" text hooks are performing 3x better.</p>
            <p className="text-purple-400">[STRATEGY]: Pivoting style to "POV" for next 3 posts.</p>
            <p>[INFO]: Sending visual prompts to Runway Gen-3...</p>
            <p className="text-yellow-400">[WARNING]: High competition detected on #AI. Adjusting keywords.</p>
            <p className="animate-pulse">_</p>
          </div>
        </div>
      </div>

      {/* Autonomous Settings */}
      <div className="glass-card p-8 rounded-2xl border-primary/20 bg-primary/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Autonomous Posting
            </h3>
            <p className="text-muted-foreground">When enabled, the brain will post directly after generation.</p>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-sm font-medium">Currently: <span className="text-primary">ACTIVE</span></span>
             <button className="px-6 py-2 bg-primary rounded-full text-sm font-bold shadow-lg shadow-primary/30 hover:scale-105 transition-all">
               Switch to Manual Approval
             </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AgentStatus({ name, status, progress, isWaiting = false }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-white/90">{name}</span>
        <span className={isWaiting ? "text-muted-foreground" : "text-primary"}>
          {isWaiting ? "Idle" : `${progress}%`}
        </span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-1000 ease-out" 
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground italic">{status}</p>
    </div>
  )
}
