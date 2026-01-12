const KEY_PREFIX = 'gymlog_store_v0:'

export function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function defaultStore() {
  return { workouts: [] }
}

function keyFor(profileId) {
  if (!profileId) return `${KEY_PREFIX}__no_profile__`
  return `${KEY_PREFIX}${profileId}`
}

export function loadStore(profileId) {
  try {
    const raw = localStorage.getItem(keyFor(profileId))
    const data = raw ? JSON.parse(raw) : null
    return data ? { ...defaultStore(), ...data } : defaultStore()
  } catch {
    return defaultStore()
  }
}

export function saveStore(profileId, store) {
  localStorage.setItem(keyFor(profileId), JSON.stringify(store))
}

// ---------- Stats ----------
export function workoutStats(w) {
  let sets = 0
  let reps = 0
  let volume = 0

  for (const ex of (w.exercises || [])) {
    for (const s of (ex.sets || [])) {
      sets += 1
      const r = Number(s.reps)
      const kg = Number(s.weight)

      if (Number.isFinite(r) && r > 0) reps += r
      if (Number.isFinite(r) && r > 0 && Number.isFinite(kg) && kg > 0) volume += kg * r
    }
  }
  return { sets, reps, volume }
}

export function aggregateStats(workouts) {
  return (workouts || []).reduce((acc, w) => {
    const s = workoutStats(w)
    acc.workouts += 1
    acc.sets += s.sets
    acc.reps += s.reps
    acc.volume += s.volume
    return acc
  }, { workouts: 0, sets: 0, reps: 0, volume: 0 })
}

// ---------- Grouping ----------
function parseISO(d) { return new Date(`${d}T00:00:00`) }

export function weekKey(dateStr) {
  const d = parseISO(dateStr)
  const day = (d.getDay() + 6) % 7
  const start = new Date(d)
  start.setDate(d.getDate() - day)
  return start.toISOString().slice(0, 10)
}

export function monthKey(dateStr) {
  return dateStr.slice(0, 7)
}

function groupBy(workouts, keyFn) {
  const map = new Map()
  for (const w of (workouts || [])) {
    if (!w?.date) continue
    const k = keyFn(w.date)
    const arr = map.get(k) || []
    arr.push(w)
    map.set(k, arr)
  }
  return map
}

export function weeklySummary(workouts) {
  const map = groupBy(workouts, weekKey)
  const rows = []
  for (const [key, items] of map.entries()) {
    const a = aggregateStats(items)
    rows.push({ key, ...a })
  }
  rows.sort((a, b) => b.key.localeCompare(a.key))
  return rows
}

export function monthlySummary(workouts) {
  const map = groupBy(workouts, monthKey)
  const rows = []
  for (const [key, items] of map.entries()) {
    const a = aggregateStats(items)
    rows.push({ key, ...a })
  }
  rows.sort((a, b) => b.key.localeCompare(a.key))
  return rows
}

export function exercisePRs(workouts) {
  const best = new Map()
  for (const w of (workouts || [])) {
    for (const ex of (w.exercises || [])) {
      const name = (ex.name || "").trim()
      if (!name) continue

      for (const s of (ex.sets || [])) {
        const weight = Number(s.weight)
        const reps = Number(s.reps)
        if (!Number.isFinite(weight) || weight <= 0) continue
        if (!Number.isFinite(reps) || reps <= 0) continue

        const curr = best.get(name)
        const candidate = { name, weight, reps, date: w.date || "" }

        if (!curr || candidate.weight > curr.weight || (candidate.weight === curr.weight && candidate.reps > curr.reps)) {
          best.set(name, candidate)
        }
      }
    }
  }

  const arr = [...best.values()]
  arr.sort((a, b) => b.weight - a.weight)
  return arr
}

export function cloneWorkout(workout, { date = todayISO(), titleSuffix = " (copia)" } = {}) {
  const w = workout || {}
  return {
    id: uid(),
    date,
    title: `${(w.title || "Entreno").trim()}${titleSuffix}`,
    notes: (w.notes || "").trim(),
    exercises: (w.exercises || []).map(ex => ({
      id: uid(),
      name: (ex.name || "").trim(),
      sets: (ex.sets || []).map(s => ({
        id: uid(),
        reps: s.reps ?? "",
        weight: s.weight ?? "",
        restSec: s.restSec ?? ""
      }))
    }))
  }
}
