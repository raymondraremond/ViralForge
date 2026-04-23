"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { 
  LayoutDashboard, 
  Zap, 
  Video, 
  TrendingUp, 
  Settings, 
  BrainCircuit,
  LogOut
} from "lucide-react"

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "AI Brain", icon: BrainCircuit, href: "/brain" },
  { name: "Content", icon: Video, href: "/content" },
  { name: "Trends", icon: TrendingUp, href: "/trends" },
  { name: "Monetization", icon: Zap, href: "/monetization" },
  { name: "Settings", icon: Settings, href: "/settings" },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const [accounts, setAccounts] = useState<any[]>([])

  useEffect(() => {
    const fetchAccounts = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data } = await supabase.from('social_accounts').select('platform').eq('user_id', session.user.id)
        if (data) setAccounts(data)
      }
    }
    fetchAccounts()
  }, [])

  return (
    <div className="flex flex-col h-screen w-64 glass border-r border-white/5 sticky top-0">
      <div className="p-6">
        <Link href="/dashboard">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            ViralForge
          </h1>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-primary/20 text-primary shadow-[0_0_20px_rgba(139,92,246,0.3)] border border-primary/20" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {accounts.length > 0 && (
        <div className="px-6 py-4">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Active Handles</p>
          <div className="flex gap-2">
            {accounts.map(a => (
              <div key={a.platform} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group relative cursor-help">
                <span className="text-[10px] font-bold text-primary">{a.platform[0].toUpperCase()}</span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
                  {a.platform.charAt(0).toUpperCase() + a.platform.slice(1)} Connected
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t border-white/5">
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
