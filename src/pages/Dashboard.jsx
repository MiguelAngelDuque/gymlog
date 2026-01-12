import { aggregateStats, exercisePRs, monthKey, monthlySummary, todayISO, weekKey, weeklySummary } from "../lib/gymStore.js"
import { Link } from "react-router-dom"

<div className="row" style={{ margin: "10px 0" }}>
  <Link className="btn" to="/workouts">+ Nuevo entreno</Link>
</div>



export default function Dashboard({ store }) {
  const workouts = (store.workouts || []).slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""))

  const today = todayISO()
  const wk = weekKey(today)
  const mk = monthKey(today)

  const todayW = workouts.filter(w => w.date === today)
  const weekW = workouts.filter(w => weekKey(w.date || "") === wk)
  const monthW = workouts.filter(w => monthKey(w.date || "") === mk)

  const t = aggregateStats(todayW)
  const w = aggregateStats(weekW)
  const m = aggregateStats(monthW)

  const weekly = weeklySummary(workouts).slice(0, 8)
  const monthly = monthlySummary(workouts).slice(0, 8)

  const prs = exercisePRs(workouts).slice(0, 10)

  return (
    <div className="container main">
      <h1>GymLog</h1>
      <p className="muted">Resumen por día / semana / mes + PRs y tablas.</p>

      <div className="grid">
        <div className="card">
          <h2>Hoy</h2>
          <div className="row">
            <span className="pill">Entrenos: {t.workouts}</span>
            <span className="pill">Series: {t.sets}</span>
            <span className="pill">Reps: {t.reps}</span>
            <span className="pill">Volumen: {Math.round(t.volume)} kg</span>
          </div>
        </div>

        <div className="card">
          <h2>Esta semana</h2>
          <div className="row">
            <span className="pill">Entrenos: {w.workouts}</span>
            <span className="pill">Series: {w.sets}</span>
            <span className="pill">Reps: {w.reps}</span>
            <span className="pill">Volumen: {Math.round(w.volume)} kg</span>
          </div>
        </div>

        <div className="card">
          <h2>Este mes</h2>
          <div className="row">
            <span className="pill">Entrenos: {m.workouts}</span>
            <span className="pill">Series: {m.sets}</span>
            <span className="pill">Reps: {m.reps}</span>
            <span className="pill">Volumen: {Math.round(m.volume)} kg</span>
          </div>
        </div>

        <div className="card">
          <h2>PRs (mejor set)</h2>
          {prs.length ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Ejercicio</th>
                  <th>Mejor</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {prs.map(p => (
                  <tr key={p.name}>
                    <td><b>{p.name}</b></td>
                    <td>{p.weight} kg × {p.reps}</td>
                    <td className="muted">{p.date || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="muted">Aún no hay PRs (añade pesos y reps).</p>
          )}
        </div>

        <div className="card">
          <h2>Semanas recientes</h2>
          {weekly.length ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Semana (lunes)</th>
                  <th>Entrenos</th>
                  <th>Series</th>
                  <th>Volumen</th>
                </tr>
              </thead>
              <tbody>
                {weekly.map(r => (
                  <tr key={r.key}>
                    <td><b>{r.key}</b></td>
                    <td>{r.workouts}</td>
                    <td>{r.sets}</td>
                    <td>{Math.round(r.volume)} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="muted">Sin datos aún.</p>
          )}
        </div>

        <div className="card">
          <h2>Meses recientes</h2>
          {monthly.length ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Mes</th>
                  <th>Entrenos</th>
                  <th>Series</th>
                  <th>Volumen</th>
                </tr>
              </thead>
              <tbody>
                {monthly.map(r => (
                  <tr key={r.key}>
                    <td><b>{r.key}</b></td>
                    <td>{r.workouts}</td>
                    <td>{r.sets}</td>
                    <td>{Math.round(r.volume)} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="muted">Sin datos aún.</p>
          )}
        </div>
      </div>
    </div>
  )
}
