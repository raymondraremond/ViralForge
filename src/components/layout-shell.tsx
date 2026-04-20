"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"

/**
 * LAYOUT SHELL
 * Conditionally renders the sidebar based on the current route.
 * Hidden on public pages (landing, login, signup).
 */

const NO_SIDEBAR_ROUTES = ["/", "/login", "/signup"]

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showSidebar = !NO_SIDEBAR_ROUTES.includes(pathname)

  if (!showSidebar) {
    return <main className="flex-1 min-h-screen overflow-y-auto">{children}</main>
  }

  return (
    <>
      <Sidebar />
      <main className="flex-1 min-h-screen overflow-y-auto">{children}</main>
    </>
  )
}
