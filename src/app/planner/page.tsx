"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { NavBar } from "@/components/NavBar"

export default function PlannerPage() {
  const [description, setDescription] = useState("")

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
            >
              สร้างแผนลดคาร์บอน
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-[#00C300]/40 bg-white shadow-sm">
          <CardHeader className="space-y-2 pb-3">
            <CardTitle className="text-lg text-gray-900">ผลลัพธ์ตัวอย่าง</CardTitle>
            <CardDescription>แสดงในรูปแบบข้อความแชท LINE</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl bg-[#D9FEDD] px-4 py-3 text-sm leading-relaxed text-gray-900">
              <p className="font-semibold">🌿 แผนลดคาร์บอนประจำวัน</p>
              <p>🚶 เดินไปสถานีรถไฟฟ้า 1 กม.</p>
              <p>🥗 เลือกอาหาร plant-based มื้อกลางวัน</p>
              <p>💡 ปิดไฟก่อนออกจากห้อง</p>
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
