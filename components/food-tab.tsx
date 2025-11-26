"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Edit3 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type FoodLog = {
  type: "photo" | "manual"
  name?: string
  portion?: string
  photo?: string
  time: string
  carbonFootprint: number // in kg CO2
}

export function FoodTab() {
  const [openCamera, setOpenCamera] = useState(false)
  const [openManual, setOpenManual] = useState(false)
  const [logs, setLogs] = useState<FoodLog[]>([
    {
      type: "manual",
      name: "Pad Thai",
      portion: "1 plate",
      time: "12:15",
      carbonFootprint: 1.2,
    },
  ])
  const [menuName, setMenuName] = useState("")
  const [portion, setPortion] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const totalCarbonFootprint = logs.reduce((sum, log) => sum + log.carbonFootprint, 0)

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogs([
          ...logs,
          {
            type: "photo",
            photo: reader.result as string,
            time: new Date().toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            carbonFootprint: 1.5, // Default value for photo-based entries
          },
        ])
        setOpenCamera(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleManualSave = () => {
    if (menuName && portion) {
      setLogs([
        ...logs,
        {
          type: "manual",
          name: menuName,
          portion,
          time: new Date().toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          carbonFootprint: 1.5, // Default value for manual entries
        },
      ])
      setMenuName("")
      setPortion("")
      setOpenManual(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-primary/10 border-2 border-primary/20 rounded-2xl p-4">
        <div className="text-sm text-muted-foreground mb-1">Today's Carbon Footprint / คาร์บอนฟุตพริ้นท์วันนี้</div>
        <div className="text-3xl font-bold text-primary">
          {totalCarbonFootprint.toFixed(2)} <span className="text-lg">kg CO₂</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Photo Button */}
        <Dialog open={openCamera} onOpenChange={setOpenCamera}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2 rounded-xl border-2 hover:border-primary hover:bg-primary/5 bg-transparent"
            >
              <Camera className="w-6 h-6" />
              <div className="text-xs text-center">
                <div className="font-semibold">Record by Photo</div>
                <div className="text-muted-foreground">ถ่ายรูป</div>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[340px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-center">
                Take Food Photo
                <div className="text-sm font-normal text-muted-foreground mt-1">ถ่ายรูปอาหาร</div>
              </DialogTitle>
            </DialogHeader>
            <div className="py-6">
              <div className="relative aspect-square bg-secondary rounded-2xl overflow-hidden border-4 border-dashed border-primary/30">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="w-16 h-16 text-muted-foreground" />
                </div>
                {/* Corner markers */}
                <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
              />
              <Button onClick={() => fileInputRef.current?.click()} className="w-full mt-4 rounded-xl h-11">
                Open Camera
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Manual Button */}
        <Dialog open={openManual} onOpenChange={setOpenManual}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2 rounded-xl border-2 hover:border-primary hover:bg-primary/5 bg-transparent"
            >
              <Edit3 className="w-6 h-6" />
              <div className="text-xs text-center">
                <div className="font-semibold">Record Manually</div>
                <div className="text-muted-foreground">บันทึกเอง</div>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[340px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-center">
                Manual Food Entry
                <div className="text-sm font-normal text-muted-foreground mt-1">บันทึกอาหารด้วยตนเอง</div>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="menu-name">Menu Name / ชื่อเมนู</Label>
                <Input
                  id="menu-name"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  placeholder="e.g., Pad Thai"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portion">Portion Size / ขนาดส่วน</Label>
                <Input
                  id="portion"
                  value={portion}
                  onChange={(e) => setPortion(e.target.value)}
                  placeholder="e.g., 1 plate, 250g"
                  className="rounded-xl"
                />
              </div>
              <Button onClick={handleManualSave} disabled={!menuName || !portion} className="w-full rounded-xl h-11">
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Logs */}
      {logs.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">Recent Logs / บันทึกล่าสุด</h3>
          {logs.map((log, index) => (
            <div key={index} className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
              {log.type === "photo" && log.photo ? (
                <img src={log.photo || "/placeholder.svg"} alt="Food" className="w-16 h-16 rounded-lg object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                  <Edit3 className="w-6 h-6" />
                </div>
              )}
              <div className="flex-1">
                {log.type === "manual" ? (
                  <>
                    <div className="font-medium">{log.name}</div>
                    <div className="text-sm text-muted-foreground">{log.portion}</div>
                  </>
                ) : (
                  <div className="font-medium">Food Photo</div>
                )}
                <div className="text-xs text-muted-foreground">{log.time}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-primary">{log.carbonFootprint.toFixed(1)} kg</div>
                <div className="text-xs text-muted-foreground">CO₂</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
