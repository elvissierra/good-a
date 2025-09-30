// Lightweight, sqlite-free local queue DB for the web
// Persists to localStorage; implements just the methods our repo uses

type Row = Record<string, any>

class LocalQueueDB {
  private store = {
    mood_checkins: [] as Row[],
    activities: [] as Row[],
    pending_ops: [] as Row[],
  }

  async open() {
    this.load()
  }

  private save() {
    localStorage.setItem('wf_mood_checkins', JSON.stringify(this.store.mood_checkins))
    localStorage.setItem('wf_activities', JSON.stringify(this.store.activities))
    localStorage.setItem('wf_pending_ops', JSON.stringify(this.store.pending_ops))
  }
  private load() {
    this.store.mood_checkins = JSON.parse(localStorage.getItem('wf_mood_checkins') || '[]')
    this.store.activities   = JSON.parse(localStorage.getItem('wf_activities') || '[]')
    this.store.pending_ops  = JSON.parse(localStorage.getItem('wf_pending_ops') || '[]')
  }

  async execute(_sql: string) {
    // schema is a no-op here, keep API compatibility
    this.load(); this.save();
    return { changes: { changes: 0 } }
  }

  async run(sql: string, params: any[] = []) {
    this.load()
    const now = new Date().toISOString()

    if (sql.includes('INSERT INTO mood_checkins')) {
      const [date, mood, energy, note] = params
      const idx = this.store.mood_checkins.findIndex(r => r.date === date)
      const row = { id: idx >= 0 ? this.store.mood_checkins[idx].id : (this.store.mood_checkins.at(-1)?.id || 0) + 1, date, mood, energy, note, last_modified: now }
      if (idx >= 0) this.store.mood_checkins[idx] = row; else this.store.mood_checkins.push(row)
      this.save();
      return { changes: { changes: 1 } }
    }

    if (sql.includes('INSERT INTO activities')) {
      const [type, minutes, intensity, note, occurred_at, last_modified] = params
      const id = (this.store.activities.at(-1)?.id || 0) + 1
      this.store.activities.push({ id, type, minutes, intensity, note, occurred_at, source: 'manual', source_id: null, last_modified })
      this.save();
      return { changes: { changes: 1 } }
    }

    if (sql.startsWith('DELETE FROM pending_ops WHERE op_id')) {
      const id = params[0]
      this.store.pending_ops = this.store.pending_ops.filter(r => r.op_id !== id)
      this.save();
      return { changes: { changes: 1 } }
    }

    if (sql.startsWith('INSERT INTO pending_ops')) {
      const [op_id, op_type, payload, created_at] = params
      this.store.pending_ops.push({ op_id, op_type, payload, created_at })
      this.save();
      return { changes: { changes: 1 } }
    }

    this.save();
    return { changes: { changes: 0 } }
  }

  async query(sql: string) {
    this.load()
    if (sql.startsWith('SELECT op_id, op_type, payload FROM pending_ops')) {
      const values = [...this.store.pending_ops].sort((a,b) => a.created_at.localeCompare(b.created_at))
      return { values }
    }
    return { values: [] }
  }
}

let db: LocalQueueDB | null = null

export async function initDb() {
  db = new LocalQueueDB()
  await db.open()
  // Execute schema strings to satisfy existing calls; they are no-ops here
  await db.execute('/* schema no-op */')
  console.log('[db] ready ✅ (local queue)')
}

export function getDb(): LocalQueueDB {
  if (!db) throw new Error('DB not initialized')
  return db
}