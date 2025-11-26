"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bot, Gift, Leaf } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/planner", label: "Planner", icon: Bot },
  { href: "/tracker", label: "Tracker", icon: Leaf },
  { href: "/rewards", label: "Rewards", icon: Gift },
]

export function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md px-4 pb-4">
      <div className="mx-auto flex items-center justify-between rounded-t-2xl border border-[#00B900] bg-white/95 px-3 py-2 shadow-[0_-6px_24px_rgba(0,185,0,0.12)] backdrop-blur">
        {navItems.map((item) => {
          const active = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-medium transition",
                active ? "bg-[#D9FEDD] text-[#00B900]" : "text-muted-foreground hover:text-[#00B900]",
              )}
            >
              <span
                className={cn(
                  "grid size-10 place-items-center rounded-xl border border-transparent transition",
                  active ? "bg-[#00B900] text-white shadow-sm" : "bg-[#D9FEDD] text-[#00B900]",
                )}
              >
                <Icon className="size-5" />
              </span>
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
