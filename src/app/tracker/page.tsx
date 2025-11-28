"use client"

import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import { Bike, Bus, Camera, Car, Footprints, RefreshCcw, Sparkles, TrainFront, TramFront, Upload } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NavBar } from "@/components/NavBar"
import {
  calcActivitiesCo2,
  createActivity,
  getActivities,
  getCarbonSummary,
  identifyFoodImage,
  uploadFile,
  updateActivityType,
  type Activity,
  type CarbonSummary,
} from "../../lib/api"
import { toast } from "sonner"

const transportIcons: Record<string, ReactNode> = {
  เดิน: <Footprints className="size-4" />,
  BTS: <TrainFront className="size-4" />,
  MRT: <TramFront className="size-4" />,
  รถเมล์: <Bus className="size-4" />,
  มอเตอร์ไซค์: <Bike className="size-4" />,
  รถยนต์: <Car className="size-4" />,
  จักรยาน: <Bike className="size-4" />,
}

const categoryTargets = {
  TRANSPORT: 2,
  FOOD: 2,
  OTHER: 2,
}

export default function TrackerPage() {
  const router = useRouter()
  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), [])
  const [transportMethod, setTransportMethod] = useState("เดิน")
  const [distance, setDistance] = useState("")
  const [foodName, setFoodName] = useState("")
  const [activityName, setActivityName] = useState("")
  const [activityDuration, setActivityDuration] = useState("")
  const [foodImage, setFoodImage] = useState<File | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [summary, setSummary] = useState<CarbonSummary | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [loadingActivities, setLoadingActivities] = useState(false)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles[0]) {
      setFoodImage(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
    noClick: true,
  })

  const loadActivities = useCallback(async () => {
    setLoadingActivities(true)
    try {
      const data = await getActivities(today)
      setActivities(data.activities ?? [])
    } catch (err) {
      toast.error("โหลดกิจกรรมไม่สำเร็จ")
      console.error(err)
    } finally {
      setLoadingActivities(false)
    }
  }, [today])

  const loadSummary = useCallback(async () => {
    setLoadingSummary(true)
    try {
      const data = await getCarbonSummary(today)
      setSummary(data)
    } catch (err) {
      toast.error("โหลดสรุปคาร์บอนไม่สำเร็จ")
      console.error(err)
    } finally {
      setLoadingSummary(false)
    }
  }, [today])

  const refreshAll = useCallback(async () => {
    await Promise.all([loadActivities(), loadSummary()])
  }, [loadActivities, loadSummary])

  useEffect(() => {
    if (typeof window === "undefined") return
    const token = localStorage.getItem("lc_token")
    if (!token) {
      toast.warning("กรุณาเข้าสู่ระบบด้วย LINE ก่อน")
      router.replace("/")
      return
    }
    void refreshAll()
  }, [refreshAll, router])

  const handleSaveTransport = async () => {
    if (!distance) {
      toast.error("กรุณากรอกระยะทาง")
      return
    }
    const value = Number(distance)
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("กรุณากรอกระยะทางที่ถูกต้อง")
      return
    }
    setSaving(true)
    try {
      await createActivity({
        category: "TRANSPORT",
        type: transportMethod,
        value,
        date: today,
      })
      toast.success("บันทึกการเดินทางแล้ว")
      setDistance("")
      await refreshAll()
    } catch (err) {
      toast.error("บันทึกไม่สำเร็จ")
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveFoodName = async () => {
    if (!foodName.trim()) {
      toast.error("กรุณาระบุชื่ออาหาร")
      return
    }
    setSaving(true)
    try {
      await createActivity({
        category: "FOOD",
        type: foodName.trim(),
        value: 1,
        date: today,
      })
      toast.success("บันทึกอาหารแล้ว")
      setFoodName("")
      await refreshAll()
    } catch (err) {
      toast.error("บันทึกไม่สำเร็จ")
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleIdentifyFoodImage = async () => {
    if (!foodImage) {
      toast.error("กรุณาเลือกรูปภาพ")
      return
    }
    setSaving(true)
    try {
      setUploading(true)
      const upload = await uploadFile(foodImage)
      if (!upload?.success || !upload.fileUrl) {
        throw new Error("อัปโหลดรูปไม่สำเร็จ")
      }

      const result = await identifyFoodImage(upload.fileUrl)
      const name = result?.result?.item?.name || result?.item?.name || "อาหาร"
      // ถ้ามีกิจกรรมที่อัปโหลดรูปไว้แล้ว (type = PENDING_IMAGE) ให้ update แทนสร้างใหม่
      const pendingExisting =
        activities.find((a) => a.category === "FOOD" && a.imageUrl === upload.fileUrl) ??
        activities.find((a) => a.category === "FOOD" && a.type === "PENDING_IMAGE")
      console.log(pendingExisting)
      if (pendingExisting) {
        await updateActivityType(pendingExisting.id, name)
        toast.success(`วิเคราะห์สำเร็จ: ${name} (อัปเดตกิจกรรมเดิม)`)
      } else {
        await createActivity({
          category: "FOOD",
          type: name,
          value: 1,
          date: today,
          imageUrl: upload.fileUrl,
        })
        toast.success(`วิเคราะห์สำเร็จ: ${name}`)
      }
      setFoodImage(null)
      await refreshAll()
    } catch (err) {
      toast.error("วิเคราะห์รูปไม่สำเร็จ")
      console.error(err)
    } finally {
      setUploading(false)
      setSaving(false)
    }
  }

  const handleSaveOtherActivity = async () => {
    if (!activityName.trim()) {
      toast.error("กรุณาใส่ชื่อกิจกรรม")
      return
    }
    const durationMinutes = Number(activityDuration)
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      toast.error("กรุณาระบุระยะเวลาเป็นตัวเลขมากกว่า 0")
      return
    }
    // AI backend expects OTHER.value = ชั่วโมง
    const hours = durationMinutes / 60
    setSaving(true)
    try {
      await createActivity({
        category: "OTHER",
        type: activityName.trim(),
        value: hours,
        date: today,
      })
      toast.success("บันทึกกิจกรรมแล้ว")
      setActivityName("")
      setActivityDuration("")
      await refreshAll()
    } catch (err) {
      toast.error("บันทึกกิจกรรมไม่สำเร็จ")
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleCalcCo2 = async () => {
    const pending = activities.filter((act) => act.co2 == null)
    if (pending.length === 0) {
      toast.error("กิจกรรมทั้งหมดคำนวณแล้ว")
      return
    }
    setAiLoading(true)
    try {
      const result = await calcActivitiesCo2(pending)
      if (!result?.success) {
        throw new Error(result?.message || "AI คำนวณไม่สำเร็จ")
      }
      const updated = result.updatedCount ?? 0
      toast.success(updated > 0 ? `AI อัปเดตคาร์บอน ${updated} รายการ` : "AI ตรวจสอบแล้ว ยังไม่มีการอัปเดต")
      await refreshAll()
    } catch (err) {
      toast.error("เรียก AI ไม่สำเร็จ")
      console.error(err)
    } finally {
      setAiLoading(false)
    }
  }

  const categoryCounts = summary?.categories ?? { TRANSPORT: 0, FOOD: 0, OTHER: 0 }
  const todayCarbon = summary?.totalCo2 ?? 0
  const averageCarbon = summary?.averageCo2 ?? 0
  const isBelowAverage = summary?.isBelowAverage ?? (averageCarbon ? todayCarbon < averageCarbon : true)
  const progressValue = averageCarbon > 0 ? Math.min(100, (todayCarbon / averageCarbon) * 100) : 0
  const remainingTasks =
    Math.max(0, categoryTargets.TRANSPORT - categoryCounts.TRANSPORT) +
    Math.max(0, categoryTargets.FOOD - categoryCounts.FOOD) +
    Math.max(0, categoryTargets.OTHER - categoryCounts.OTHER)

  return (
    <main className="min-h-screen bg-[#D9FEDD] text-foreground">
      <div className="mx-auto flex w-full max-w-screen-sm flex-col gap-5 px-4 pb-28 pt-10 sm:px-6">
        <header className="space-y-2 text-center">
          <Badge variant="success" className="mx-auto w-fit">
            Tracker
          </Badge>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Eco Tracker</h1>
          <p className="text-sm text-muted-foreground">บันทึกกิจกรรมลดคาร์บอนในแต่ละวัน แล้วให้ AI ช่วยคำนวณอัตโนมัติ</p>
        </header>

        <Card className="mb-1 rounded-xl border border-[#00C300]/40 bg-white shadow-sm">
          <CardHeader className="space-y-2 pb-3">
            <CardTitle className="text-lg text-gray-900">สรุปคาร์บอนวันนี้</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg border-[#00B900]/60 text-[#00B900]"
                onClick={handleCalcCo2}
                disabled={aiLoading || loadingSummary || loadingActivities}
              >
                <Sparkles className="mr-1.5 size-4" />
                คำนวณด้วย AI
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-auto text-xs text-muted-foreground hover:bg-[#D9FEDD]"
                onClick={() => void refreshAll()}
                disabled={loadingSummary || loadingActivities}
              >
                <RefreshCcw className="mr-1 size-4" />
                โหลดใหม่
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground">วันนี้ปล่อยคาร์บอน</p>
                <p className="text-3xl font-bold text-[#00B900]">
                  {loadingSummary ? "…" : todayCarbon.toFixed(2)} kg CO₂
                </p>
              </div>
              <div className="text-sm text-gray-700">
                ค่าเฉลี่ยต่อวันของคนทั่วไป:{" "}
                <span className="font-semibold">
                  {loadingSummary ? "…" : averageCarbon.toFixed(1)} kg CO₂
                </span>
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
              {loadingSummary
                ? "กำลังโหลดสรุป..."
                : isBelowAverage
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
              วันนี้ต้องเก็บข้อมูลอีก{" "}
              <span className="text-[#00B900] font-semibold">{remainingTasks}</span> อย่างเพื่อรับคะแนน
            </div>
            <div className="space-y-3">
              <ProgressRow label="การเดินทาง" current={categoryCounts.TRANSPORT} total={categoryTargets.TRANSPORT} />
              <ProgressRow label="อาหาร" current={categoryCounts.FOOD} total={categoryTargets.FOOD} />
              <ProgressRow label="กิจกรรมอื่นๆ" current={categoryCounts.OTHER} total={categoryTargets.OTHER} />
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
            <Button
              type="button"
              className="w-full rounded-xl bg-[#00B900] text-white hover:bg-[#00C300]"
              onClick={handleSaveTransport}
              disabled={saving}
            >
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
                footer={
                  <Button
                    type="button"
                    className="w-full rounded-xl bg-[#00B900] text-white hover:bg-[#00C300]"
                    onClick={handleSaveFoodName}
                    disabled={saving}
                  >
                    บันทึกอาหาร
                  </Button>
                }
              />
              <OptionCard
                title="ถ่ายรูปอาหาร"
                description="อัปโหลดภาพเพื่อวิเคราะห์"
                action={
                  <div className="space-y-2">
                    <div
                      {...getRootProps({
                        className:
                          "rounded-xl border border-dashed border-[#00B900]/60 bg-white p-3 text-center text-sm text-gray-700",
                      })}
                    >
                      <input {...getInputProps({ capture: "environment" })} />
                      <p className="mb-2 font-medium text-gray-900">ลากไฟล์มาวาง หรือเลือกถ่าย/อัปโหลด</p>
                      <p className="text-xs text-muted-foreground">รองรับไฟล์ภาพ .jpg .png</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-xl border-[#00B900] text-[#00B900]"
                        onClick={open}
                      >
                        <Upload className="size-4" />
                        เลือกรูปจากเครื่อง
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-xl border-[#00B900] text-[#00B900]"
                        onClick={open}
                      >
                        <Camera className="size-4" />
                        เปิดกล้อง
                      </Button>
                    </div>
                    {foodImage ? (
                      <div className="rounded-lg bg-[#F7FFF8] px-3 py-2 text-xs text-gray-800">
                        เลือกไฟล์: <span className="font-semibold">{foodImage.name}</span>
                      </div>
                    ) : null}
                    <Button
                      type="button"
                      className="w-full rounded-xl bg-[#00B900] text-white hover:bg-[#00C300]"
                      onClick={handleIdentifyFoodImage}
                      disabled={saving || uploading}
                    >
                      {uploading ? "กำลังอัปโหลด..." : "วิเคราะห์และบันทึก"}
                    </Button>
                  </div>
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
            <Button
              type="button"
              className="w-full rounded-xl bg-[#00B900] text-white hover:bg-[#00C300]"
              onClick={handleSaveOtherActivity}
              disabled={saving}
            >
              บันทึกกิจกรรม
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-[#00C300]/40 bg-white shadow-sm">
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="text-lg text-gray-900">กิจกรรมที่บันทึกวันนี้</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingActivities ? (
              <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
            ) : activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">ยังไม่มีกิจกรรม</p>
            ) : (
              <div className="space-y-2">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-[#F7FFF8] px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{act.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {act.category} • {formatActivityDate(act.date)} • {formatActivityValue(act)}
                      </p>
                    </div>
                    <div className="text-right text-xs text-gray-700">
                      {act.co2 ? `${act.co2.toFixed(2)} kg CO₂` : "รอ AI คำนวณ"}
                    </div>
                  </div>
                ))}
              </div>
            )}
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

function OptionCard({
  title,
  description,
  action,
  footer,
}: {
  title: string
  description: string
  action: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="space-y-2 rounded-xl border border-gray-100 bg-[#F7FFF8] p-4">
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {action}
      {footer}
    </div>
  )
}

function formatActivityDate(dateString: string) {
  const parsed = new Date(dateString)
  if (Number.isNaN(parsed.getTime())) return dateString
  return parsed.toLocaleDateString()
}

function formatActivityValue(act: Activity) {
  if (act.category === "TRANSPORT") {
    return `${act.value ?? 0} กม.`
  }
  if (act.category === "FOOD") {
    return `${act.value ?? 1} มื้อ`
  }
  if (act.category === "OTHER") {
    const minutes = Math.round((act.value ?? 0) * 60)
    return `${minutes} นาที`
  }
  return ""
}
