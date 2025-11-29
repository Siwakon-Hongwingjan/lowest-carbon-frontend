"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import liff from "@line/liff"
import { api, getProfile } from "../lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  const router = useRouter()
  const [status, setStatus] = useState("กำลังเข้าสู่ระบบด้วย LINE…")
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleGoTracker = () => router.replace("/tracker")

  const handleLoginClick = () => {
    if (typeof window === "undefined") return
    const token = localStorage.getItem("lc_token")
    if (!token) {
      liff.login()
    } else {
      handleGoTracker()
    }
  }

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        setError(null)
        setStatus("กำลังเข้าสู่ระบบด้วย LINE…")

        const liffId = process.env.NEXT_PUBLIC_LIFF_ID
        const coreUrl = process.env.NEXT_PUBLIC_CORE_API_URL
        if (!liffId) {
          throw new Error("ยังไม่ได้ตั้งค่า NEXT_PUBLIC_LIFF_ID")
        }
        if (!coreUrl) {
          throw new Error("ยังไม่ได้ตั้งค่า NEXT_PUBLIC_CORE_API_URL")
        }

        await liff.init({ liffId })
        await liff.ready

        if (!liff.isLoggedIn()) {
          setStatus("กำลังพาไปหน้า LINE Login…")
          liff.login()
          return
        }

        setStatus("รับข้อมูลโปรไฟล์จาก LINE…")
        const profile = await liff.getProfile()
        const userId = profile.userId

        setStatus("เชื่อมต่อเซิร์ฟเวอร์เพื่อรับโทเค็น…")
        const { data } = await api.post("/auth/line", { userId })
        if (!data?.token) throw new Error("ไม่พบ token จากเซิร์ฟเวอร์")

        localStorage.setItem("lc_token", data.token)
        const profileRes = await getProfile().catch(() => null)
        const userPayload = profileRes?.user
          ? {
              displayName: profile.displayName,
              pictureUrl: profile.pictureUrl ?? undefined,
              userId,
              backendUserId: profileRes.user.userId,
              balance: profileRes.balance,
            }
          : {
              displayName: profile.displayName,
              pictureUrl: profile.pictureUrl ?? undefined,
              userId,
            }
        localStorage.setItem("lc_user", JSON.stringify(userPayload))

        if (cancelled) return
        setIsAuthenticated(true)
        setStatus("เข้าสู่ระบบสำเร็จ! กดไปหน้า Tracker เพื่อเริ่มใช้งาน")
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : "ไม่สามารถเข้าสู่ระบบได้"
        setError(message)
        setIsAuthenticated(false)
        setStatus("เกิดข้อผิดพลาดในการเข้าสู่ระบบ")
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [router])

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <HeroSection
        status={status}
        error={error}
        isAuthenticated={isAuthenticated}
        onLogin={handleLoginClick}
        onTracker={handleGoTracker}
        onRetry={() => location.reload()}
      />
      <Footer />
    </main>
  )
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="fade-in flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
            ◆
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-foreground">Lowest Carbon</h1>
            <p className="text-xs text-muted-foreground">AI Carbon Tracker</p>
          </div>
        </div>

        <div className="hidden items-center gap-1 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 sm:flex">
          <span className="inline-block h-2 w-2 rounded-full bg-accent" />
          <span className="text-xs font-medium text-accent">Eco-Friendly</span>
        </div>
      </div>
    </header>
  )
}

function HeroSection({
  status,
  error,
  isAuthenticated,
  onLogin,
  onTracker,
  onRetry,
}: {
  status: string
  error: string | null
  isAuthenticated: boolean
  onLogin: () => void
  onTracker: () => void
  onRetry: () => void
}) {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="fade-in text-center">
          <div className="mb-8 flex justify-center gap-3">
            <span className="animate-bounce text-3xl" style={{ animationDelay: "0s" }}>
              🌱
            </span>
            <span className="animate-bounce text-3xl" style={{ animationDelay: "0.2s" }}>
              🌿
            </span>
            <span className="animate-bounce text-3xl" style={{ animationDelay: "0.4s" }}>
              🍃
            </span>
          </div>

          <h2 className="mb-6 text-balance text-4xl font-bold text-foreground sm:text-5xl md:text-6xl">
            ระบบติดตามการลดคาร์บอน
          </h2>

          <p className="mx-auto mb-4 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
            ช่วยบันทึกกิจกรรมในแต่ละวัน วิเคราะห์ CO₂ ด้วย AI และสะสม Green Points เพื่อแลกรางวัล
          </p>

          <p className="mx-auto mb-12 max-w-xl text-balance text-sm text-muted-foreground sm:text-base">
            ระบบอัจฉริยะที่ช่วยคุณเข้าใจและลดการปล่อยก๊าซคาร์บอนในชีวิตประจำวัน เพื่ออนาคตที่สีเขียวกว่า
          </p>

          <div className="mx-auto max-w-3xl space-y-3 rounded-3xl border border-primary/20 bg-white/70 p-6 shadow-sm backdrop-blur">
            <div className="text-sm text-muted-foreground">
              {error ? <span className="text-red-600">เกิดข้อผิดพลาด: {error}</span> : <span>{status}</span>}
            </div>
            {isAuthenticated ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                ✅ เชื่อมต่อสำเร็จพร้อมใช้งาน
              </div>
            ) : null}
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              {!isAuthenticated ? (
                <>
                  <Button className="flex-1 rounded-full bg-primary text-primary-foreground" onClick={onLogin}>
                    เข้าสู่ระบบด้วย LINE
                  </Button>
                  <Button variant="outline" className="flex-1 rounded-full border-primary text-primary" onClick={onRetry}>
                    ลองอีกครั้ง
                  </Button>
                </>
              ) : null}
              <Button
                variant="secondary"
                className={isAuthenticated ? "w-full rounded-full sm:w-auto" : "flex-1 rounded-full"}
                onClick={onTracker}
              >
                ไปหน้า Tracker
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-12 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            ◆
          </div>
          <span className="font-semibold text-foreground">Lowest Carbon</span>
        </div>

        <div className="text-center text-sm text-muted-foreground sm:text-right">
          <p>🌍 Powered by Eco Tracker · 📱 LINE Mini App · 🤖 AI-driven CO₂ analysis</p>
          <p className="mt-2 text-xs">© 2025 Lowest Carbon. สร้างเพื่ออนาคตที่ยั่งยืน</p>
        </div>
      </div>
    </footer>
  )
}
