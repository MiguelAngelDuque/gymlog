import { uid } from "./gymStore.js"

const PROFILES_KEY = "gymlog_profiles_v0"
const ACTIVE_KEY = "gymlog_active_profile_v0"

export function listProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function saveProfiles(profiles) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
}

export function getActiveProfileId() {
  return localStorage.getItem(ACTIVE_KEY) || ""
}

export function setActiveProfileId(id) {
  localStorage.setItem(ACTIVE_KEY, id)
}

export function clearActiveProfile() {
  localStorage.removeItem(ACTIVE_KEY)
}

export function getActiveProfile() {
  const id = getActiveProfileId()
  if (!id) return null
  return listProfiles().find(p => p.id === id) || null
}

export function createProfile(name) {
  const clean = (name || "").trim()
  if (!clean) throw new Error("Nombre vacío")

  const profiles = listProfiles()
  const profile = { id: uid(), name: clean, createdAt: new Date().toISOString() }
  const next = [profile, ...profiles]
  saveProfiles(next)
  setActiveProfileId(profile.id)
  return profile
}

export function deleteProfile(profileId) {
  const profiles = listProfiles().filter(p => p.id !== profileId)
  saveProfiles(profiles)
  if (getActiveProfileId() === profileId) clearActiveProfile()
}
