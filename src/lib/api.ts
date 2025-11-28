import axios from "axios"

const coreUrl = process.env.NEXT_PUBLIC_CORE_API_URL

export const api = axios.create({
  baseURL: coreUrl,
})

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("lc_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

export type ActivityPayload = {
  category: "TRANSPORT" | "FOOD" | "OTHER"
  type?: string
  value: number
  date: string
  imageUrl?: string | null
  slipUrl?: string | null
}

export type Activity = {
  id: string
  category: string
  type: string
  value: number
  imageUrl?: string | null
  date: string
  co2?: number | null
  createdAt?: string
  description?: string | null
}

export async function createActivity(payload: ActivityPayload) {
  const { data } = await api.post("/activities", payload)
  return data
}

export async function getActivities(date: string) {
  const { data } = await api.get("/activities", { params: { date } })
  return data
}

export async function identifyFoodImage(imageUrl: string) {
  const { data } = await api.post("/ai/identify_food_image", { imageUrl })
  return data
}

export type CarbonSummary = {
  success: boolean
  date: string
  totalCo2: number
  averageCo2: number
  isBelowAverage: boolean
  categories: {
    TRANSPORT: number
    FOOD: number
    OTHER: number
  }
  activitiesCompleted: boolean
}

export type CalcAiResponse = {
  success: boolean
  result?: {
    activities?: { id: string; co2: number; description?: string | null }[]
    totalCo2?: number
  }
  updatedCount?: number
  message?: string
}

export async function getCarbonSummary(date: string) {
  const { data } = await api.get<CarbonSummary>("/carbon/summary", { params: { date } })
  return data
}

export async function calcActivitiesCo2(activities: Activity[]) {
  const payload = activities.map((activity) => ({
    id: activity.id,
    category: activity.category,
    type: activity.type,
    value: activity.value,
    date: activity.date,
  }))
  const { data } = await api.post<CalcAiResponse>("/ai/calc_co2", { activities: payload })
  return data
}

export async function uploadFile(file: File) {
  const formData = new FormData()
  formData.append("file", file)

  const { data } = await api.post<{ success: boolean; fileUrl: string }>("/storage/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data
}

export async function updateActivityType(id: string, type: string) {
  const { data } = await api.patch(`/activities/${id}/type`, { type })
  return data
}

// AI Daily Planner
export type DailyPlannerPayload = {
  activities?: string[]
  travel?: { origin: string; destination: string }[]
}

export type DailyPlannerResult = {
  analysis: {
    original: string
    current_co2: number
    alternative: string
    alternative_co2: number
    reduced: number
  }[]
  travel_analysis: {
    origin: string
    destination: string
    distance_km: number
    current_mode: string
    current_co2: number
    recommended_mode: string
    recommended_co2: number
    reduced: number
  }[]
  summary_reduction: number
}

export type DailyPlannerResponse = {
  success: boolean
  result?: DailyPlannerResult
  message?: string
  status?: number
}

export async function createDailyPlanner(payload: DailyPlannerPayload) {
  const { data } = await api.post<DailyPlannerResponse>("/ai/daily_planner", payload)
  return data
}

// Profile
export async function getProfile() {
  const { data } = await api.get("/profile")
  return data
}

// Rewards
export type Reward = {
  id: string
  name: string
  description: string
  cost: number
}

export type RewardHistoryItem = {
  id: string
  rewardName: string
  rewardPoints: number
  date: string
}

export type PointsTransaction = {
  id: string
  points: number
  reason: string
  date: string
  createdAt?: string
}

export async function listRewards() {
  const { data } = await api.get<{ success: boolean; rewards: Reward[] }>("/rewards/list")
  return data
}

export async function getRewardHistory() {
  const { data } = await api.get<{ success: boolean; history: RewardHistoryItem[] }>("/rewards/history")
  return data
}

export async function redeemReward(rewardId: string) {
  const { data } = await api.post("/rewards/redeem", { rewardId })
  return data
}

export async function evaluatePoints() {
  const { data } = await api.post("/points/evaluate")
  return data
}

export async function getPointsBalance() {
  const { data } = await api.get<{ success: boolean; balance: number }>("/points/balance")
  return data
}

export async function getPointsHistory() {
  const { data } = await api.get<{ success: boolean; history: PointsTransaction[] }>("/points/history")
  return data
}
