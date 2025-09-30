import api from './axios'

export type Activity = { type: string; minutes: number; occurred_at: string; intensity?: number; note?: string }

export async function createActivityRemote(a: Activity) {
  const { data } = await api.post('/activities', a)
  return data as Activity
}