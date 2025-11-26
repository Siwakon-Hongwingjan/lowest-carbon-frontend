"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { NavBar } from "@/components/NavBar"

const history = [
  { title: "เดินไปมหาลัย", points: "+10" },
  { title: "อาหาร plant-based", points: "+20" },
  { title: "ปิดไฟก่อนนอน", points: "+5" },
]

const missions = [
  { title: "📸 ถ่ายรูปอาหารวันนี้", reward: "+5 คะแนน" },
  { title: "🚶 เดินให้ครบ 2 km", reward: "+10 คะแนน" },
  { title: "♻️ แยกขยะก่อนทิ้ง", reward: "+8 คะแนน" },
]

export default function RewardsPage() {
  const currentPoints = 120
  const targetPoints = 200
  const progress = Math.min((currentPoints / targetPoints) * 100, 100)

  return (
    <main className="min-h-screen bg-[#D9FEDD] text-foreground">
      <div className="mx-auto max-w-4xl px-4 pb-28 pt-10 sm:px-6">
        <header className="mb-6 space-y-2 text-center">
          <Badge variant="success" className="mx-auto w-fit">Green Points</Badge>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Green Points</h1>
          <p className="text-sm text-muted-foreground">สะสมแต้มจากการลดคาร์บอน แล้วนำไปแลกของรางวัล</p>
        </header>

        <Card className="rounded-xl border border-[#00C300]/30 bg-white shadow-sm">
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-xl text-gray-900">คะแนนสะสม</CardTitle>
            <CardDescription>สรุปแต้มปัจจุบันพร้อมความคืบหน้ารางวัลถัดไป</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 rounded-xl bg-[#D9FEDD] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-[#00B900]">คะแนนปัจจุบัน</p>
                <p className="text-4xl font-bold text-gray-900">{currentPoints.toLocaleString()} คะแนน</p>
              </div>
              <Button className="rounded-xl bg-[#00B900] text-white hover:bg-[#00C300]" size="sm" type="button">
                ดูรายละเอียด
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>เป้าหมายถัดไป {targetPoints} แต้ม</span>
                <span className="font-semibold text-gray-900">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3 bg-white" />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card className="rounded-xl border border-[#00C300]/30 bg-white shadow-sm">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-lg text-gray-900">ประวัติกิจกรรม</CardTitle>
                <CardDescription>ล่าสุดที่คุณได้รับแต้ม</CardDescription>
              </div>
              <Badge variant="outline" className="border-[#00B900] text-[#00B900]">วันนี้</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-[#F7FFF8] px-4 py-3"
                >
                  <div className="text-sm text-gray-800">{item.title}</div>
                  <span className="text-sm font-semibold text-[#00B900]">{item.points}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-[#00C300]/30 bg-white shadow-sm">
            <CardHeader className="space-y-1 pb-3">
              <CardTitle className="text-lg text-gray-900">ภารกิจวันนี้</CardTitle>
              <CardDescription>ทำภารกิจเพื่อรับแต้มเพิ่ม</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {missions.map((mission) => (
                <div key={mission.title} className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-[#F7FFF8] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900">{mission.title}</p>
                    <Badge variant="outline" className="border-[#00B900] text-[#00B900]">{mission.reward}</Badge>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="w-full rounded-xl bg-[#00B900] text-white hover:bg-[#00C300]"
                  >
                    ทำภารกิจ
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      <NavBar />
    </main>
  )
}
