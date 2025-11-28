"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { NavBar } from "@/components/NavBar"
import { createDailyPlanner, type DailyPlannerResult } from "../../lib/api"

export default function PlannerPage() {
  const [description, setDescription] = useState("")
  const [result, setResult] = useState<DailyPlannerResult | null>(null)
  const [loading, setLoading] = useState(false)

  const activities = useMemo(
    () =>
      description
        .split(/\n|;/)
        .map((line) => line.trim())
        .filter(Boolean),
    [description],
  )

  const handleGenerate = async () => {
    if (activities.length === 0) {
      toast.error("กรุณาเล่าแผนของวันนี้ก่อน")
      return
    }
    setLoading(true)
    try {
      const data = await createDailyPlanner({ activities })
      if (!data?.success || !data.result) {
        toast.error(data?.message ?? "AI ตอบกลับไม่ถูกต้อง")
        return
      }
      setResult(data.result)
      toast.success("สร้างแผนลดคาร์บอนสำเร็จ")
    } catch (err) {
      toast.error("เรียก AI ไม่สำเร็จ")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") return
    const token = localStorage.getItem("lc_token")
    if (!token) {
      toast.warning("กรุณาเข้าสู่ระบบด้วย LINE ก่อน")
      window.location.replace("/")
    }
  }, [])

  return (
    <main className="min-h-screen bg-[#D9FEDD] text-foreground">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pb-28 pt-10 sm:px-6">
        <header className="space-y-2 text-center">
          <Badge variant="success" className="mx-auto w-fit">LINE Green</Badge>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">AI Daily Planner</h1>
          <p className="text-sm text-muted-foreground">สร้างแผนลดคาร์บอนของวันนี้เพื่อแชร์ลง LINE</p>
        </header>

        <Card className="rounded-xl border border-[#00C300]/30 bg-white shadow-sm">
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-xl text-gray-900">เล่าวันของคุณ</CardTitle>
            <CardDescription>อธิบายแผนการเดินทาง อาหาร หรือกิจกรรมที่คุณจะทำวันนี้</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="เล่าว่าวันนี้คุณทำอะไรบ้าง เช่น เดินทาง, อาหาร, กิจกรรม…"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-[160px] rounded-xl border-gray-200 bg-white"
            />
            <Button
              type="button"
              className="w-full rounded-xl bg-[#00B900] text-white hover:bg-[#00C300]"
              disabled={loading}
              onClick={() => void handleGenerate()}
            >
              {loading ? "กำลังสร้างด้วย AI..." : "สร้างแผนลดคาร์บอน"}
            </Button>
            <p className="text-xs text-muted-foreground">
              คั่นกิจกรรมแต่ละอย่างด้วยบรรทัดใหม่ เช่น {"\n"}เดินไปขึ้น BTS 1 กม.{"\n"}กินข้าวกะเพรา{"\n"}เปิดแอร์ 3 ชม.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-[#00C300]/40 bg-white shadow-sm">
          <CardHeader className="space-y-2 pb-3">
            <CardTitle className="text-lg text-gray-900">ผลลัพธ์จาก AI</CardTitle>
            <CardDescription>แสดงในรูปแบบข้อความแชท LINE</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 space-y-2 overflow-y-auto rounded-xl bg-[#D9FEDD] px-4 py-3 text-sm leading-relaxed text-gray-900">
              {!result && !loading ? (
                <>
                  <p className="font-semibold">🌿 แผนลดคาร์บอนตัวอย่าง</p>
                  <p>🚶 เดินไปสถานีรถไฟฟ้า 1 กม.</p>
                  <p>🥗 เลือกอาหาร plant-based มื้อกลางวัน</p>
                  <p>💡 ปิดไฟก่อนออกจากห้อง</p>
                  <p className="text-xs text-muted-foreground">กด “สร้างแผนลดคาร์บอน” เพื่อดูผลลัพธ์จริง</p>
                </>
              ) : loading ? (
                <p className="font-semibold">กำลังขอคำแนะนำจาก AI…</p>
              ) : result ? (
                <>
                  <p className="font-semibold">🌿 แผนลดคาร์บอนประจำวัน</p>
                  {result.analysis.map((item, index) => (
                    <div key={`${item.original}-${index}`} className="space-y-1 rounded-lg bg-white/70 px-3 py-2">
                      <p className="font-semibold text-gray-900">{item.original}</p>
                      <p className="text-gray-800">แผนแนะนำ: {item.alternative}</p>
                      <p className="text-xs text-muted-foreground">
                        ปัจจุบัน {formatNumber(item.current_co2)} kg CO₂ → แนะนำ {formatNumber(item.alternative_co2)} kg
                        CO₂ (ลด {formatNumber(item.reduced)} kg)
                      </p>
                    </div>
                  ))}
                  {result.travel_analysis.length > 0 ? (
                    <div className="space-y-1 rounded-lg bg-white/70 px-3 py-2">
                      <p className="font-semibold text-gray-900">✈️ การเดินทาง</p>
                      {result.travel_analysis.map((travel, index) => (
                        <p key={`${travel.origin}-${travel.destination}-${index}`} className="text-sm text-gray-800">
                          {travel.origin} → {travel.destination} ({formatNumber(travel.distance_km)} กม.) ปกติ:{" "}
                          {travel.current_mode} {formatNumber(travel.current_co2)} kg CO₂ · แนะนำ: {travel.recommended_mode}{" "}
                          {formatNumber(travel.recommended_co2)} kg CO₂ (ลด {formatNumber(travel.reduced)} kg)
                        </p>
                      ))}
                    </div>
                  ) : null}
                  <p className="text-sm font-semibold text-[#00B900]">
                    รวมลดได้ประมาณ {formatNumber(result.summary_reduction)} kg CO₂
                  </p>
                </>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          หรือกลับไปติดตามกิจกรรมที่{" "}
          <Link href="/tracker" className="font-semibold text-[#00B900] hover:text-[#00C300]">
            Eco Tracker
          </Link>
        </div>
      </div>
      <NavBar />
    </main>
  )
}

function formatNumber(num: number) {
  if (!Number.isFinite(num)) return "-"
  return num.toFixed(2)
}
