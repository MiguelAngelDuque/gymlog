import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { createProfile, deleteProfile, listProfiles, setActiveProfileId } from "../lib/profiles.js"

export default function Login() {
  const nav = useNavigate()
  const [name, setName] = useState("")
  const [refresh, setRefresh] = useState(0)

  const profiles = useMemo(() => {
    void refresh
    return listProfiles()
  }, [refresh])

  function enter(id) {
  setActiveProfileId(id)
  nav("/workouts", { replace: true })
}

  function onCreate(e) {
  e.preventDefault()
  try {
    createProfile(name)
    nav("/workouts", { replace: true })
  } catch {
    alert("Pon un nombre válido.")
  }
}


  function onDelete(id) {
    const ok = confirm("¿Borrar este perfil y sus datos locales?")
    if (!ok) return
    deleteProfile(id)
    setRefresh(x => x + 1)
  }

  return (
    <div className="container main">
      <div className="card">
        <h1>GymLog</h1>
        <p className="muted">Elige un perfil (datos separados por usuario en este PC).</p>

        <h2>Entrar</h2>
        {profiles.length ? (
          <div style={{ marginTop: 10 }}>
            {profiles.map(p => (
              <div className="item" key={p.id}>
                <div>
                  <div className="title">{p.name}</div>
                  <div className="meta">ID: {p.id}</div>
                </div>
                <div className="row">
                  <button className="btn ghost" type="button" onClick={() => enter(p.id)}>Entrar</button>
                  <button className="btn ghost" type="button" onClick={() => onDelete(p.id)}>Borrar</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">No hay perfiles todavía. Crea uno abajo.</p>
        )}

        <h2 style={{ marginTop: 18 }}>Crear perfil</h2>
        <form className="row" onSubmit={onCreate}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre (Miguel, Juan...)" />
          <button className="btn" type="submit">Crear</button>
        </form>
      </div>
    </div>
  )
}
