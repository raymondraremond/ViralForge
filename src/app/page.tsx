import { BrainCircuit, Rocket, Shield, TrendingUp, Zap, ChevronRight, Play } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-8 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-xs font-medium text-primary animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
            Next-Gen AI Social Co-Pilot
          </div>

          <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 pb-2">
            Forge Your Viral <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Destiny with AI</span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-muted-foreground animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            Autonomous trend analysis, content generation, and multi-platform scheduling. 
            Stop guessing, start growing with ViralForge.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
            <Link 
              href="/dashboard" 
              className="px-8 py-4 bg-primary text-white rounded-2xl font-semibold text-lg shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_50px_rgba(139,92,246,0.6)] hover:scale-105 transition-all flex items-center gap-2 group"
            >
              Get Started Free
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="px-8 py-4 glass text-white rounded-2xl font-semibold text-lg hover:bg-white/5 transition-all flex items-center gap-2">
              <Play className="w-5 h-5 fill-current" />
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-8 bg-black/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold">Powered by the Forge Brain</h2>
            <p className="text-muted-foreground">The ultimate suite for modern content creators.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={BrainCircuit}
              title="Autonomous Trends"
              description="Real-time analysis of TikTok, Reels, and Shorts to find high-virality patterns before they go mainstream."
            />
            <FeatureCard 
              icon={Zap}
              title="Instant Content"
              description="Generate script-to-video drafts in seconds. Optimized for retention and platform-specific algorithms."
            />
            <FeatureCard 
              icon={Rocket}
              title="Smart Scheduling"
              description="Auto-post at the exact moment your audience is most active. Multi-platform sync with zero effort."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="glass-card p-8 rounded-3xl group hover:-translate-y-2 transition-all duration-300">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
