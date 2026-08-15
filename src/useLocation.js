import { useEffect, useRef, useState } from 'react'
import { LOCATION_POLL_MS, SHARE_ROLES, SHARE_SECRET } from './config'

const SECRET_HEADERS = { 'X-Relocation-Secret': SHARE_SECRET, 'Content-Type': 'application/json' }

export function useMyLocation(role, enabled) {
  const [position, setPosition] = useState(null)
  const [error, setError] = useState(null)
  const [sending, setSending] = useState(false)
  const lastSentRef = useRef(0)

  useEffect(() => {
    if (!enabled) return undefined

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const next = {
          owner: role,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }
        setPosition(next)
        setError(null)

        const now = Date.now()
        if (now - lastSentRef.current >= LOCATION_POLL_MS) {
          lastSentRef.current = now
          setSending(true)
          fetch('/api/location', {
            method: 'POST',
            headers: SECRET_HEADERS,
            body: JSON.stringify(next),
          })
            .catch(() => {})
            .finally(() => setSending(false))
        }
      },
      (err) => setError(err.code === 1 ? 'permission-denied' : err.message),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 },
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [role, enabled])

  return { position, error, sending }
}

export function usePartnerLocation(role, enabled) {
  const [partner, setPartner] = useState(null)
  const [error, setError] = useState(null)
  const partnerId = role === SHARE_ROLES.me ? SHARE_ROLES.her : SHARE_ROLES.me

  useEffect(() => {
    if (!enabled) return undefined

    let alive = true
    const poll = () =>
      fetch(`/api/location/${partnerId}`, { headers: SECRET_HEADERS })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json()
        })
        .then((data) => {
          if (alive) {
            setPartner(data)
            setError(null)
          }
        })
        .catch(() => alive && setError('unavailable'))

    poll()
    const id = setInterval(poll, LOCATION_POLL_MS)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [partnerId, enabled])

  return { partner, error }
}