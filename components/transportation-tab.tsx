"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Car, Bike, Train, Footprints } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type TransportMode = "walk" | "bicycle" | "car" | "bts-mrt"

type TransportLog = {
  mode: TransportMode
  time: string
  carbonFootprint: number // in kg CO2
}

export function TransportationTab() {
  const [open, setOpen] = useState(false)
  const [selectedMode, setSelectedMode] = useState<TransportMode | null>(null)
  const [logs, setLogs] = useState<TransportLog[]>([
    {
      mode: "bts-mrt",
      time: "09:30",
      carbonFootprint: 0.8,
    },
  ])

  const getCarbonFootprint = (mode: TransportMode): number => {
    switch (mode) {
      case "walk":
        return 0
      case "bicycle":
        return 0
      case "car":
        return 2.5
      case "bts-mrt":
        return 0.8
    }
  }

  const handleStartTracking = () => {
    if (selectedMode) {
      setLogs([
        ...logs,
        {
          mode: selectedMode,
          time: new Date().toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          carbonFootprint: getCarbonFootprint(selectedMode),
        },
      ])
      setOpen(false)
      setSelectedMode(null)
    }
  }

  const totalCarbonFootprint = logs.reduce((sum, log) => sum + log.carbonFootprint, 0)

  const getModeIcon = (mode: TransportMode) => {
    switch (mode) {
      case "walk":
        return <Footprints className="w-5 h-5" />
      case "bicycle":
        return <Bike className="w-5 h-5" />
      case "car":
        return <Car className="w-5 h-5" />
      case "bts-mrt":
        return <Train className="w-5 h-5" />
    }
  }

  const getModeLabel = (mode: TransportMode) => {
    switch (mode) {
      case "walk":
        return "Walk / เดิน"
      case "bicycle":
        return "Bicycle / จักรยาน"
      case "car":
        return "Car / รถยนต์"
      case "bts-mrt":
        return "BTS/MRT / รถไฟฟ้า"
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full rounded-xl h-12 text-base font-medium">
            <Plus className="w-5 h-5 mr-2" />
            Add Transportation
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[340px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center">
              Select Travel Mode
              <div className="text-sm font-normal text-muted-foreground mt-1">เลือกวิธีการเดินทาง</div>
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {(["walk", "bicycle", "car", "bts-mrt"] as TransportMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  selectedMode === mode ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    selectedMode === mode
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {getModeIcon(mode)}
                </div>
                <span className="text-xs text-center font-medium">{getModeLabel(mode)}</span>
              </button>
            ))}
          </div>
          <Button onClick={handleStartTracking} disabled={!selectedMode} className="w-full rounded-xl h-11">
            Start Tracking
          </Button>
        </DialogContent>
      </Dialog>

      {/* Logs */}
      {logs.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">Recent Logs / บันทึกล่าสุด</h3>
          {logs.map((log, index) => (
            <div key={index} className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                {getModeIcon(log.mode)}
              </div>
              <div className="flex-1">
                <div className="font-medium">{getModeLabel(log.mode)}</div>
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
