"use client"

import { type ReactNode, useState } from "react"
import { Bike, Bus, Camera, Car, FileUp, TrainFront, TramFront, Footprints } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NavBar } from "@/components/NavBar"

const transportIcons: Record<string, ReactNode> = {
  เดิน: <Footprints className="size-4" />,
  BTS: <TrainFront className="size-4" />,
  MRT: <TramFront className="size-4" />,
  รถเมล์: <Bus className="size-4" />,
  มอเตอร์ไซค์: <Bike className="size-4" />,
  รถยนต์: <Car className="size-4" />,
  จักรยาน: <Bike className="size-4" />,
}

export default function TrackerPage() {
  const [transportMethod, setTransportMethod] = useState("เดิน")
  const [distance, setDistance] = useState("")
  const [foodName, setFoodName] = useState("")
  const [activityName, setActivityName] = useState("")
  const [activityDuration, setActivityDuration] = useState("")

  const todayCarbon = 1.8
  const averageCarbon = 4
  const isBelowAverage = todayCarbon < averageCarbon
  const progressValue = Math.min(100, (todayCarbon / averageCarbon) * 100)

  return (
    <main className="min-h-screen bg-[#D9FEDD] text-foreground">
      <div className="mx-auto flex w-full max-w-screen-sm flex-col gap-5 px-4 pb-28 pt-10 sm:px-6">
        <header className="space-y-2 text-center">
          <Badge variant="success" className="mx-auto w-fit">
            Tracker
          </Badge>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Eco Tracker</h1>
          <p className="text-sm text-muted-foreground">บันทึกกิจกรรมลดคาร์บอนในแต่ละวัน (UI เท่านั้น)</p>
        </header>

        <Card className="mb-1 rounded-xl border border-[#00C300]/40 bg-white shadow-sm">
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="text-lg text-gray-900">สรุปคาร์บอนวันนี้</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground">วันนี้ปล่อยคาร์บอน</p>
                <p className="text-3xl font-bold text-[#00B900]">{todayCarbon.toFixed(1)} kg CO₂</p>
              </div>
              <div className="text-sm text-gray-700">
                ค่าเฉลี่ยต่อวันของคนทั่วไป: <span className="font-semibold">{averageCarbon.toFixed(1)} kg CO₂</span>
              </div>
            </div>
            <Progress value={progressValue} className="h-3 bg-[#EAFBEA]" />
            <div
              className={
                isBelowAverage
                  ? "rounded-lg bg-[#E8FFF0] px-3 py-2 text-sm text-[#0f9f2d]"
                  : "rounded-lg bg-yellow-50 px-3 py-2 text-sm text-amber-700"
              }
            >
              {isBelowAverage
                ? "เยี่ยมมาก! วันนี้คุณปล่อยคาร์บอนน้อยกว่าค่าเฉลี่ย 🎉"
                : "อัตราการปล่อยคาร์บอนยังสูงกว่าค่าเฉลี่ย ลองปรับกิจกรรมดูนะ 🌱"}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-[#00C300]/40 bg-white shadow-sm">
          <CardHeader className="space-y-2 pb-3">
            <CardTitle className="text-lg text-gray-900">ความคืบหน้าวันนี้</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg bg-[#D9FEDD] px-4 py-3 text-sm font-medium text-gray-900">
              วันนี้ต้องเก็บข้อมูลอีก <span className="text-[#00B900] font-semibold">3</span> อย่างเพื่อรับคะแนน
            </div>
            <div className="space-y-3">
              <ProgressRow label="การเดินทาง" current={1} total={2} />
              <ProgressRow label="อาหาร" current={0} total={2} />
              <ProgressRow label="กิจกรรมอื่นๆ" current={0} total={2} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-[#00C300]/40 bg-white shadow-sm">
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="text-lg text-gray-900">🚌 การเดินทาง</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700">วิธีเดินทาง</p>
              <Select value={transportMethod} onValueChange={setTransportMethod}>
                <SelectTrigger className="w-full rounded-xl border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["เดิน", "BTS", "MRT", "รถเมล์", "มอเตอร์ไซค์", "รถยนต์", "จักรยาน"].map((method) => (
                    <SelectItem key={method} value={method}>
                      <span className="flex items-center gap-2">
                        {transportIcons[method]}
                        {method}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700">ระยะทาง (กม.)</p>
              <Input
                type="number"
                inputMode="decimal"
                placeholder="เช่น 5"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="rounded-xl border-gray-200"
              />
            </div>
            <Button type="button" className="w-full rounded-xl bg-[#00B900] text-white hover:bg-[#00C300]">
              บันทึกการเดินทาง
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-[#00C300]/40 bg-white shadow-sm">
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="text-lg text-gray-900">🍱 มื้ออาหาร</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">เลือกวิธีใดวิธีหนึ่งในการบันทึก</p>
            <div className="space-y-3">
              <OptionCard
                title="ระบุชื่ออาหาร"
                description="คีย์ชื่อเมนูเพื่อคำนวณคาร์บอน"
                action={
                  <Input
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    placeholder="เช่น ข้าวกะเพราไข่ดาว"
                    className="rounded-xl border-gray-200"
                  />
                }
              />
              <OptionCard
                title="ถ่ายรูปอาหาร"
                description="อัปโหลดภาพเพื่อวิเคราะห์"
                action={
                  <Button type="button" variant="outline" className="w-full rounded-xl border-[#00B900] text-[#00B900]">
                    <Camera className="size-4" />
                    ถ่ายรูปอาหาร
                  </Button>
                }
              />
              <OptionCard
                title="อัปโหลดสลิปอาหาร"
                description="แนบไฟล์สลิปจากร้านอาหาร"
                action={
                  <Button type="button" variant="outline" className="w-full rounded-xl border-[#00B900] text-[#00B900]">
                    <FileUp className="size-4" />
                    อัปโหลดสลิปอาหาร
                  </Button>
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-[#00C300]/40 bg-white shadow-sm">
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="text-lg text-gray-900">🔥 กิจกรรมอื่นๆ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700">ชื่อกิจกรรม</p>
              <Input
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                placeholder="เช่น โยคะ เดินเล่น"
                className="rounded-xl border-gray-200"
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700">ระยะเวลา (นาที)</p>
              <Input
                type="number"
                inputMode="decimal"
                value={activityDuration}
                onChange={(e) => setActivityDuration(e.target.value)}
                placeholder="เช่น 30"
                className="rounded-xl border-gray-200"
              />
            </div>
            <Button type="button" className="w-full rounded-xl bg-[#00B900] text-white hover:bg-[#00C300]">
              บันทึกกิจกรรม
            </Button>
          </CardContent>
        </Card>
      </div>

      <NavBar />
    </main>
  )
}

function ProgressRow({ label, current, total }: { label: string; current: number; total: number }) {
  const percent = Math.min(100, (current / total) * 100)
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-gray-700">
        <span>{label}</span>
        <span className="font-semibold text-[#00B900]">
          {current}/{total}
        </span>
      </div>
      <Progress value={percent} className="h-2 bg-[#EAFBEA]" />
    </div>
  )
}

function OptionCard({ title, description, action }: { title: string; description: string; action: ReactNode }) {
  return (
    <div className="space-y-2 rounded-xl border border-gray-100 bg-[#F7FFF8] p-4">
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  )
}
