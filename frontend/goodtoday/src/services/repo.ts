import api from '@/api/axios'
import { getDb } from './db'

let _syncStarted = false
let _syncIntervalId: number | undefined

export async function upsertCheckin(c:{date:string;mood:number;energy:number;note?:string}) {
  const now = new Date().toISOString()
  const db = getDb()
  await db.run(
    `INSERT INTO mood_checkins(date,mood,energy,note,last_modified) VALUES (?,?,?,?,?)
     ON CONFLICT(date) DO UPDATE SET mood=excluded.mood, energy=excluded.energy, note=excluded.note, last_modified=excluded.last_modified`,
    [c.date, c.mood, c.energy, c.note ?? null, now]
  )
}

export async function createActivity(a:{type:string;minutes:number;occurred_at:string;intensity?:number;note?:string}) {
  const now = new Date().toISOString()
  const db = getDb()
  await db.run(
    `INSERT INTO activities(type,minutes,intensity,note,occurred_at,source,source_id,last_modified)
     VALUES (?,?,?,?,?,'manual',NULL,?)`,
    [a.type, a.minutes, a.intensity ?? null, a.note ?? null, a.occurred_at, now]
  )
}

export async function enqueueOp(op_type:string, payload:unknown) {
  const db = getDb()
  const op_id = (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)) as string
  await db.run(
    `INSERT INTO pending_ops(op_id,op_type,payload,created_at) VALUES (?,?,?,?)`,
    [op_id, op_type, JSON.stringify(payload), new Date().toISOString()]
  )
}

export async function flushPendingOps(limit = 50) {
  const db = getDb()
  const res = await db.query(`SELECT op_id, op_type, payload FROM pending_ops ORDER BY created_at LIMIT ${limit}`)
  const rows = res.values || []

  for (const r of rows) {
    const opId = r.op_id as string
    const type = r.op_type as string
    const payload = JSON.parse(r.payload as string)

    try {
      if (type === 'upsert_checkin') {
        await api.post('/checkins', payload)
      } else if (type === 'create_activity') {
        await api.post('/activities', payload)
      } else {
        // Unknown op type — drop it so it doesn't block the queue
        await db.run('DELETE FROM pending_ops WHERE op_id = ?', [opId])
        continue
      }
      // Success → remove from queue
      await db.run('DELETE FROM pending_ops WHERE op_id = ?', [opId])
    } catch (e: any) {
      // Network/server issues: stop early and retry later
      const status = e?.response?.status
      if (!navigator.onLine || !status || status >= 500) {
        break
      }
      // 4xx client error (e.g., validation) → drop this op and continue
      await db.run('DELETE FROM pending_ops WHERE op_id = ?', [opId])
    }
  }
}

export async function syncNow() {
  if (navigator.onLine) {
    try { await flushPendingOps() } catch { /* ignore */ }
  }
}

export function startSyncLoop(intervalMs = 15000) {
  if (_syncStarted) return
  _syncStarted = true

  const tick = async () => {
    if (navigator.onLine) {
      try { await flushPendingOps() } catch { /* ignore */ }
    }
  }
  window.addEventListener('online', tick)
  // Run periodically; store id to avoid duplicates across HMR
  _syncIntervalId = window.setInterval(tick, intervalMs)
  // Kick off immediately
  tick()
}