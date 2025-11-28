"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { NavBar } from "@/components/NavBar"
import {
  getPointsBalance,
  getPointsHistory,
  getRewardHistory,
  listRewards,
  redeemReward,
  evaluatePoints,
  type PointsTransaction,
  type Reward,
  type RewardHistoryItem,
} from "../../lib/api"

export default function RewardsPage() {
  const router = useRouter()
  const [balance, setBalance] = useState(0)
  const [rewards, setRewards] = useState<Reward[]>([])
  const [rewardHistory, setRewardHistory] = useState<RewardHistoryItem[]>([])
  const [pointsHistory, setPointsHistory] = useState<PointsTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [redeemingId, setRedeemingId] = useState<string | null>(null)
  const [evaluating, setEvaluating] = useState(false)

  const sortedRewards = useMemo(() => [...rewards].sort((a, b) => a.cost - b.cost), [rewards])
  const nextReward = sortedRewards.find((reward) => reward.cost > balance) ?? sortedRewards.at(-1) ?? null
  const targetPoints = nextReward?.cost ?? 0
  const progress = targetPoints > 0 ? Math.min(100, (balance / targetPoints) * 100) : 0
  const pointsToGo = targetPoints > balance ? targetPoints - balance : 0

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [rewardsRes, balanceRes, rewardHistoryRes, pointsHistoryRes] = await Promise.all([
        listRewards(),
        getPointsBalance(),
        getRewardHistory(),
        getPointsHistory(),
      ])

      if (!rewardsRes?.success) throw new Error("โหลดรายการของรางวัลไม่สำเร็จ")
      if (!balanceRes?.success) throw new Error("โหลดคะแนนสะสมไม่สำเร็จ")

      setRewards(rewardsRes.rewards ?? [])
      setBalance(balanceRes.balance ?? 0)
      setRewardHistory(rewardHistoryRes?.history ?? [])
      setPointsHistory(pointsHistoryRes?.history ?? [])
    } catch (err) {
      toast.error("โหลดข้อมูลรางวัลไม่สำเร็จ")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleRedeem = useCallback(
    async (rewardId: string) => {
      setRedeemingId(rewardId)
      try {
        const result = await redeemReward(rewardId)
        if (!result?.success) {
          toast.error(result?.message ?? "แลกของรางวัลไม่สำเร็จ")
          return
        }
        toast.success(result?.message ?? "แลกของรางวัลสำเร็จ")
        await loadData()
      } catch (err) {
        toast.error("แลกของรางวัลไม่สำเร็จ")
        console.error(err)
      } finally {
        setRedeemingId(null)
      }
    },
    [loadData],
  )

  const handleEvaluatePoints = useCallback(async () => {
    setEvaluating(true)
    try {
      const result = await evaluatePoints()
      if (!result?.success) {
        toast.error(result?.message ?? "รับคะแนนวันนี้ไม่สำเร็จ")
        return
      }
      const points = result?.points ?? 0
      const message = result?.message ?? (points > 0 ? `ได้รับ ${points} คะแนน` : "รับคะแนนวันนี้สำเร็จ")
      toast.success(message)
      await loadData()
    } catch (err) {
      toast.error("รับคะแนนวันนี้ไม่สำเร็จ")
      console.error(err)
    } finally {
      setEvaluating(false)
    }
  }, [loadData])

  useEffect(() => {
    if (typeof window === "undefined") return
    const token = localStorage.getItem("lc_token")
    if (!token) {
      toast.warning("กรุณาเข้าสู่ระบบด้วย LINE ก่อน")
      router.replace("/")
      return
    }
    void loadData()
  }, [loadData, router])

  return (
    <main className="min-h-screen bg-[#D9FEDD] text-foreground">
      <div className="mx-auto max-w-4xl px-4 pb-28 pt-10 sm:px-6">
        <header className="mb-6 space-y-2 text-center">
          <Badge variant="success" className="mx-auto w-fit">
            Green Points
          </Badge>
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
                <p className="text-4xl font-bold text-gray-900">
                  {loading ? "…" : balance.toLocaleString()} คะแนน
                </p>
              </div>
              <Button
                className="rounded-xl bg-[#00B900] text-white hover:bg-[#00C300]"
                size="sm"
                type="button"
                onClick={() => void loadData()}
                disabled={loading || !!redeemingId || evaluating}
              >
                โหลดข้อมูล
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {nextReward
                    ? `เป้าหมายถัดไป ${nextReward.cost} แต้ม`
                    : "ยังไม่มีของรางวัลให้แลก"}
                </span>
                <span className="font-semibold text-gray-900">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3 bg-white" />
            </div>
            {nextReward ? (
              <p className="text-xs text-muted-foreground">
                {pointsToGo > 0
                  ? `ต้องการอีก ${pointsToGo} แต้มเพื่อแลก ${nextReward.name}`
                  : `มีแต้มเพียงพอสำหรับ ${nextReward.name} แล้ว`}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">กำลังรอรายการของรางวัลจากเซิร์ฟเวอร์</p>
            )}
            <div className="flex flex-wrap gap-3 pt-1">
              <Button
                className="flex-1 rounded-xl bg-[#00B900] text-white hover:bg-[#00C300]"
                size="sm"
                type="button"
                onClick={() => void handleEvaluatePoints()}
                disabled={loading || evaluating || !!redeemingId}
              >
                {evaluating ? "กำลังตรวจสอบ..." : "เช็ค/รับคะแนนวันนี้"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card className="rounded-xl border border-[#00C300]/30 bg-white shadow-sm">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-lg text-gray-900">ประวัติคะแนน</CardTitle>
                <CardDescription>ล่าสุดที่คุณได้รับหรือใช้แต้ม</CardDescription>
              </div>
              <Badge variant="outline" className="border-[#00B900] text-[#00B900]">
                อัปเดตอัตโนมัติ
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
              ) : pointsHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">ยังไม่มีประวัติคะแนน</p>
              ) : (
                pointsHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-[#F7FFF8] px-4 py-3"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.reason}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(item.date)}</div>
                    </div>
                    <span
                      className={
                        item.points >= 0 ? "text-sm font-semibold text-[#00B900]" : "text-sm font-semibold text-rose-600"
                      }
                    >
                      {formatPoints(item.points)}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-[#00C300]/30 bg-white shadow-sm">
            <CardHeader className="space-y-1 pb-3">
              <CardTitle className="text-lg text-gray-900">ของรางวัล</CardTitle>
              <CardDescription>แลกแต้มเป็นสิทธิประโยชน์</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
              ) : rewards.length === 0 ? (
                <p className="text-sm text-muted-foreground">ยังไม่มีของรางวัลให้แลก</p>
              ) : (
                rewards.map((reward) => {
                  const canRedeem = balance >= reward.cost
                  const isRedeeming = redeemingId === reward.id
                  return (
                    <div
                      key={reward.id}
                      className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-[#F7FFF8] p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{reward.name}</p>
                          <p className="text-xs text-muted-foreground">ต้องใช้ {reward.cost} คะแนน</p>
                        </div>
                        <Badge variant="outline" className="border-[#00B900] text-[#00B900]">
                          {reward.cost} คะแนน
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        className="w-full rounded-xl bg-[#00B900] text-white hover:bg-[#00C300]"
                        disabled={!canRedeem || isRedeeming || loading}
                        onClick={() => void handleRedeem(reward.id)}
                      >
                        {isRedeeming ? "กำลังแลก..." : canRedeem ? "แลกทันที" : "แต้มไม่พอ"}
                      </Button>
                    </div>
                  )
                })
              )}

              <div className="pt-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">ประวัติการแลก</p>
                  <Badge variant="outline" className="border-[#00B900] text-[#00B900]">
                    ล่าสุด
                  </Badge>
                </div>
                {loading ? (
                  <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
                ) : rewardHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">ยังไม่เคยแลกของรางวัล</p>
                ) : (
                  <div className="space-y-2">
                    {rewardHistory.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-3 py-2"
                      >
                        <div className="text-sm text-gray-800">{item.rewardName}</div>
                        <div className="text-right text-xs text-muted-foreground">
                          <div className="font-semibold text-[#00B900]">-{item.rewardPoints} คะแนน</div>
                          <div>{formatDate(item.date)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <NavBar />
    </main>
  )
}

function formatDate(dateString: string) {
  const parsed = new Date(dateString)
  if (Number.isNaN(parsed.getTime())) return dateString
  return parsed.toLocaleString()
}

function formatPoints(points: number) {
  return `${points > 0 ? "+" : ""}${points} คะแนน`
}
