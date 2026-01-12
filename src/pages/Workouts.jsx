import { useMemo, useState } from "react"
import { todayISO, uid, workoutStats, cloneWorkout } from "../lib/gymStore.js"


const emptyWorkout = () => ({
  id: "",
  date: todayISO(),
  title: "",
  notes: "",
  exercises: []
})

const emptyExercise = () => ({
  id: uid(),
  name: "",
  sets: [ { id: uid(), reps: "", weight: "", restSec: "" } ]
})

export default function Workouts({ store, setStore }) {
  const workouts = store.workouts || []
  const [form, setForm] = useState(emptyWorkout())
  const [q, setQ] = useState("")

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return workouts
    return workouts.filter(w =>
      `${w.date} ${w.title} ${(w.exercises||[]).map(e=>e.name).join(" ")}`.toLowerCase().includes(query)
    )
  }, [workouts, q])

  function setField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function addExercise() {
    setForm(prev => ({ ...prev, exercises: [...prev.exercises, emptyExercise()] }))
  }

  function removeExercise(exId) {
    setForm(prev => ({ ...prev, exercises: prev.exercises.filter(e => e.id !== exId) }))
  }

  function setExerciseName(exId, value) {
    setForm(prev => ({
      ...prev,
      exercises: prev.exercises.map(e => e.id === exId ? { ...e, name: value } : e)
    }))
  }

  function addSet(exId) {
    setForm(prev => ({
      ...prev,
      exercises: prev.exercises.map(e => {
        if (e.id !== exId) return e
        return { ...e, sets: [...e.sets, { id: uid(), reps: "", weight: "", restSec: "" }] }
      })
    }))
  }

  function removeSet(exId, setId) {
    setForm(prev => ({
      ...prev,
      exercises: prev.exercises.map(e => {
        if (e.id !== exId) return e
        return { ...e, sets: e.sets.filter(s => s.id !== setId) }
      })
    }))
  }

  function updateSet(exId, setId, key, value) {
    setForm(prev => ({
      ...prev,
      exercises: prev.exercises.map(e => {
        if (e.id !== exId) return e
        return {
          ...e,
          sets: e.sets.map(s => s.id === setId ? { ...s, [key]: value } : s)
        }
      })
    }))
  }

  function submit(e) {
    e.preventDefault()
    if (!form.date) return
    const cleanExercises = (form.exercises || []).filter(e => e.name.trim().length > 0)

    const payload = {
      ...form,
      id: form.id || uid(),
      title: form.title.trim(),
      notes: form.notes.trim(),
      exercises: cleanExercises
    }

    const exists = workouts.some(w => w.id === payload.id)
    const next = exists ? workouts.map(w => w.id === payload.id ? payload : w) : [payload, ...workouts]

    setStore({ ...store, workouts: next })
    setForm(emptyWorkout())
  }

  function edit(w) {
    setForm({
      id: w.id,
      date: w.date || todayISO(),
      title: w.title || "",
      notes: w.notes || "",
      exercises: Array.isArray(w.exercises) ? w.exercises : []
    })
  }

  function remove(id) {
    setStore({ ...store, workouts: workouts.filter(w => w.id !== id) })
    if (form.id === id) setForm(emptyWorkout())
  }

  function duplicate(w) {
  const copy = cloneWorkout(w, { date: todayISO() })
  setStore({ ...store, workouts: [copy, ...workouts] })
  setForm(copy) // te lo abre ya para editarlo si quieres
}


  return (
    <div className="container main">
      <h1>Entrenos</h1>

      <div className="grid">
        <div className="card">
          <h2>{form.id ? "Editar entreno" : "Nuevo entreno"}</h2>

          <form onSubmit={submit}>
            <div className="row">
              <input type="date" value={form.date} onChange={(e) => setField("date", e.target.value)} />
              <input value={form.title} onChange={(e) => setField("title", e.target.value)} placeholder="Título (Pierna, Push, Pull...)" />
            </div>

            <div style={{ marginTop: 10 }}>
              <textarea rows="2" value={form.notes} onChange={(e) => setField("notes", e.target.value)} placeholder="Notas (opcional)" />
            </div>

            <div style={{ marginTop: 12 }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <h2 style={{ margin: 0 }}>Ejercicios</h2>
                <button className="btn ghost" type="button" onClick={addExercise}>+ Ejercicio</button>
              </div>

              {(form.exercises || []).map(ex => (
                <div key={ex.id} className="card" style={{ marginTop: 12 }}>
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <input
                      value={ex.name}
                      onChange={(e) => setExerciseName(ex.id, e.target.value)}
                      placeholder="Nombre (Sentadilla, Press banca...)"
                      style={{ flex: 1 }}
                    />
                    <button className="btn ghost" type="button" onClick={() => removeExercise(ex.id)}>Borrar</button>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    {(ex.sets || []).map((s, idx) => (
                      <div className="row" key={s.id} style={{ marginBottom: 8 }}>
                        <span className="pill">S{idx + 1}</span>
                        <input
                          type="number"
                          min="0"
                          value={s.reps}
                          onChange={(e) => updateSet(ex.id, s.id, "reps", e.target.value)}
                          placeholder="Reps"
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={s.weight}
                          onChange={(e) => updateSet(ex.id, s.id, "weight", e.target.value)}
                          placeholder="Kg"
                        />
                        <input
                          type="number"
                          min="0"
                          value={s.restSec}
                          onChange={(e) => updateSet(ex.id, s.id, "restSec", e.target.value)}
                          placeholder="Desc (s)"
                        />
                        <button className="btn ghost" type="button" onClick={() => removeSet(ex.id, s.id)}>–</button>
                      </div>
                    ))}
                    <button className="btn ghost" type="button" onClick={() => addSet(ex.id)}>+ Serie</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn" type="submit">{form.id ? "Guardar" : "Añadir"}</button>
              {form.id && <button className="btn ghost" type="button" onClick={() => setForm(emptyWorkout())}>Cancelar</button>}
            </div>
          </form>
        </div>

        <div className="card">
          <h2>Historial</h2>

          <div className="row">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..." />
            <span className="pill">Total: {filtered.length}</span>
          </div>

          <div style={{ marginTop: 12 }}>
            {filtered.map(w => {
              const s = workoutStats(w)
              return (
                <div className="item" key={w.id}>
                  <div>
                    <div className="title">{w.date} · {w.title || "Entreno"}</div>
                    <div className="meta">
                      Ejercicios: {(w.exercises||[]).length} · Series: {s.sets} · Volumen: {Math.round(s.volume)} kg
                    </div>
                  </div>
                  <div className="row">
                    <button className="btn ghost" type="button" onClick={() => duplicate(w)}>Duplicar</button>
                    <button className="btn ghost" type="button" onClick={() => edit(w)}>Editar</button>
                    <button className="btn ghost" type="button" onClick={() => remove(w.id)}>Borrar</button>
                </div>
                </div>
              )
            })}
            {filtered.length === 0 && <p className="muted">No hay entrenos aún.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
