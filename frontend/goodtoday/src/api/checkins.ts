

import api from './axios'

export type Checkin = { id?: number; date: string; mood: number; energy: number; note?: string }

export async function fetchCheckins() {
  const { data } = await api.get('/checkins')
  return data as Checkin[]
}

export async function upsertCheckinRemote(c: Checkin) {
  const { data } = await api.post('/checkins', c)
  return data as Checkin
}