"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import liff from "@line/liff"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  const router = useRouter()
  const [status, setStatus] = useState("กำลังเข้าสู่ระบบด้วย LINE…")
  const [error, setError] = useState<string | null>(null)

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
        const response = await fetch(`${coreUrl}/auth/line`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        })

        if (!response.ok) {
          const detail = await response.text().catch(() => "")
          throw new Error(detail || `Auth failed with status ${response.status}`)
        }

        const data = await response.json()
        if (!data?.token) {
          throw new Error("ไม่พบ token จากเซิร์ฟเวอร์")
        }

        localStorage.setItem("lc_token", data.token)
        localStorage.setItem(
          "lc_user",
          JSON.stringify({
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl ?? undefined,
            userId,
          }),
        )

        if (cancelled) return
        setStatus("เข้าสู่ระบบสำเร็จ! กำลังพาไปหน้า Tracker…")
        setTimeout(() => router.replace("/tracker"), 400)
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : "ไม่สามารถเข้าสู่ระบบได้"
        setError(message)
        setStatus("เกิดข้อผิดพลาดในการเข้าสู่ระบบ")
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [router])

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-4 py-12 text-foreground">
      <div className="w-full max-w-md">
        <Card className="rounded-2xl border border-[#00C300]/40 bg-white/95 shadow-lg">
          <CardHeader className="space-y-2 text-center">
            <Badge variant="success" className="mx-auto w-fit">
              Lowest Carbon
            </Badge>
            <CardTitle className="text-2xl font-bold text-gray-900">เข้าสู่ระบบด้วย LINE</CardTitle>
            <p className="text-sm text-muted-foreground">Frontend → LIFF → userId → Core Backend</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-[#E8FFF0] px-4 py-3 text-sm text-[#0f9f2d]">
              {status}
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button className="flex-1 rounded-xl bg-[#00B900] text-white hover:bg-[#00C300]" onClick={() => location.reload()}>
                ลองอีกครั้ง
              </Button>
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => router.replace("/tracker")}>
                ไปหน้า Tracker
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              เราจะเก็บ token ไว้ใน <code>lc_token</code> และโปรไฟล์ไว้ใน <code>lc_user</code> บนอุปกรณ์นี้
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
