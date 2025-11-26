"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Sprout } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

type ActivityCategory = "transport" | "food" | "activity"

type ActivityLog = {
  category: ActivityCategory
  type: string
  value: number
  unit: "km" | "count"
  time: string
}

export function ActivityTab() {
  const [open, setOpen] = useState(false)
  const [logs, setLogs] = useState<ActivityLog[]>([
    {
      category: "transport",
      type: "Metro ride",
      value: 8,
      unit: "km",
      time: "09:30",
    },
    {
      category: "food",
      type: "Vegetarian lunch",
      value: 1,
      unit: "count",
      time: "12:15",
    },
    {
      category: "activity",
      type: "Tree planting",
      value: 2,
      unit: "count",
      time: "14:00",
    },
  ])
  const [category, setCategory] = useState<ActivityCategory>("transport")
  const [activityType, setActivityType] = useState("")
  const [value, setValue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const unit = category === "transport" ? "km" : "count"

  const totalCarbonFootprint = logs.reduce((sum, log) => sum + log.value, 0)

  const handleSave = async () => {
    const trimmedType = activityType.trim()
    const numericValue = Number(value)
    const baseUrl = process.env.NEXT_PUBLIC_CORE_API_URL

    if (!trimmedType) {
      toast.error("Add an activity type to log.")
      return
    }

    if (Number.isNaN(numericValue) || numericValue <= 0) {
      toast.error("Enter a positive value.")
      return
    }

    if (!baseUrl) {
      toast.error("Set NEXT_PUBLIC_CORE_API_URL to submit.")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`${baseUrl}/activities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category,
          type: trimmedType,
          value: numericValue,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        const message =
          (payload && (payload.message || payload.error)) ||
          "Unable to log this activity right now."
        throw new Error(message)
      }

      const entry: ActivityLog = {
        category,
        type: trimmedType,
        value: numericValue,
        unit,
        time: new Date().toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }

      setLogs((previous) => [entry, ...previous].slice(0, 12))
      toast.success("Activity logged with Core API.")
      setActivityType("")
      setValue("")
      setOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Submission failed."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-accent/10 border-2 border-accent/20 rounded-2xl p-4">
        <div className="text-sm text-muted-foreground mb-1">Today's Carbon Impact / ผลกระทบคาร์บอนวันนี้</div>
        <div className={`text-3xl font-bold ${totalCarbonFootprint < 0 ? "text-accent" : "text-primary"}`}>
          {totalCarbonFootprint > 0 ? "+" : ""}
          {totalCarbonFootprint.toFixed(2)} <span className="text-lg">kg CO₂</span>
        </div>
        {totalCarbonFootprint < 0 && (
          <div className="text-xs text-accent mt-1">Great! You're reducing carbon / ดีมาก! คุณกำลังลดคาร์บอน</div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full rounded-xl h-12 text-base font-medium">
            <Plus className="w-5 h-5 mr-2" />
            Add Activity
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[340px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center">
            Environmental Activity
            <div className="text-sm font-normal text-muted-foreground mt-1">กิจกรรมสิ่งแวดล้อม</div>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category / หมวดหมู่</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as ActivityCategory)}>
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transport">Transport / การเดินทาง</SelectItem>
                <SelectItem value="food">Food / อาหาร</SelectItem>
                <SelectItem value="activity">Activity / กิจกรรม</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="activity-type">Type / รายละเอียด</Label>
            <Input
              id="activity-type"
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              placeholder="e.g., Metro ride, Vegetarian lunch, Tree planting"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="value">Value / จำนวน</Label>
              <span className="text-xs text-muted-foreground">{unit === "km" ? "km traveled" : "count"}</span>
            </div>
            <Input
              id="value"
              type="number"
              min="0"
              step="0.1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={unit === "km" ? "Distance in km" : "How many times"}
              className="rounded-xl"
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={isSubmitting || !activityType.trim() || Number(value) <= 0}
            className="w-full rounded-xl h-11"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

      {/* Logs */}
      {logs.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">Recent Logs / บันทึกล่าสุด</h3>
          {logs.map((log, index) => (
            <div key={index} className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
              <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                <Sprout className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-medium">{log.type}</div>
                <div className="text-sm text-muted-foreground">
                  {log.category === "transport" ? "Transport" : log.category === "food" ? "Food" : "Activity"}
                </div>
                <div className="text-xs text-muted-foreground">{log.time}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-primary">
                  {log.value.toFixed(1)} {log.unit}
                </div>
                <div className="text-xs text-muted-foreground">CO₂</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
