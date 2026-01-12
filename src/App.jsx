import { useEffect, useMemo, useRef, useState } from "react"
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom"
import Dashboard from "./pages/Dashboard.jsx"
import Workouts from "./pages/Workouts.jsx"
import Login from "./pages/Login.jsx"
import { defaultStore, loadStore, saveStore } from "./lib/gymStore.js"
import { clearActiveProfile, getActiveProfile } from "./lib/profiles.js"

function RequireProfile({ children }) {
  const loc = useLocation()
  const profile = getActiveProfile()
  if (!profile) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  return children
}

export default function App() {
  const profile = getActiveProfile()
  const profileId = profile?.id || ""

  const [store, setStore] = useState(() => loadStore(profileId))
  const fileRef = useRef(null)

  // cuando cambie el perfil, recarga su store
  useEffect(() => {
    setStore(loadStore(profileId))
  }, [profileId])

  // guarda SIEMPRE contra el perfil activo
  useEffect(() => {
    if (!profileId) return
    saveStore(profileId, store)
  }, [profileId, store])

  const profileName = useMemo(() => profile?.name || "", [profile])

  function logout() {
    clearActiveProfile()
    window.location.hash = "#/login"
    window.location.reload()
  }

  function seed() {
    const ok = confirm("¿Cargar ejemplo? Reemplaza tus datos de ESTE perfil.")
    if (!ok) return
    setStore(defaultStore())
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `gymlog-${profileName || "perfil"}-data.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function importData(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const next = { ...defaultStore(), ...data }
      next.workouts = Array.isArray(next.workouts) ? next.workouts : []
      setStore(next)
    } catch {
      alert("No se pudo importar el JSON.")
    } finally {
      e.target.value = ""
    }
  }

  return (
    <>
      <header className="header">
        <div className="container nav">
          <div className="logo">GymLog{profileName ? ` · ${profileName}` : ""}</div>

          <nav className="links">
            {profileId ? (
              <>
                <Link className="pill" to="/">Dashboard</Link>
                <Link className="pill" to="/workouts">Entrenos</Link>

                <button className="pill" onClick={seed}>Ejemplo</button>
                <button className="pill" onClick={exportData}>Exportar</button>
                <button className="pill" onClick={() => fileRef.current?.click()}>Importar</button>
                <input ref={fileRef} type="file" accept="application/json" hidden onChange={importData} />

                <button className="pill" onClick={logout}>Cambiar perfil</button>
              </>
            ) : (
              <Link className="pill" to="/login">Login</Link>
            )}
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<RequireProfile><Dashboard store={store} /></RequireProfile>} />
        <Route path="/workouts" element={<RequireProfile><Workouts store={store} setStore={setStore} /></RequireProfile>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
