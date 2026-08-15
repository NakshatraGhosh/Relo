import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { HER_NAME, SHARE_ROLES, YOUR_NAME } from '../config'
import { useMyLocation, usePartnerLocation } from '../useLocation'
import { formatDistanceKm, haversineKm, timeAgo } from '../utils'

const DEMO_BASE = { lat: 51.5074, lng: -0.1278 }
const DEMO_OFFSET = { lat: 0.0042, lng: 0.0038 }

const ME_COLOR = '#f43f7d'
const HER_COLOR = '#8b5cf6'

const STALE_MS = 2 * 60 * 1000

function heartIcon(color) {
  return L.divIcon({
    className: 'loc-icon',
    html: `
      <span class="loc-pulse" style="border-color:${color}"></span>
      <span class="loc-heart" style="background:${color}">
        <svg viewBox="0 0 32 32" width="20" height="20">
          <path d="M16 29 C 6 21 2 15 2 9.5 C 2 5 5.5 2.5 9 2.5 C 12 2.5 15 4.5 16 7 C 17 4.5 20 2.5 23 2.5 C 26.5 2.5 30 5 30 9.5 C 30 15 26 21 16 29 Z" fill="#fff"/>
        </svg>
      </span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  })
}

export default function WhereWeAre() {
  const [role, setRole] = useState(() => localStorage.getItem('relo-role') || SHARE_ROLES.me)
  const [enabled, setEnabled] = useState(() => localStorage.getItem('relo-share') === 'on')
  const [demo, setDemo] = useState(true)

  const my = useMyLocation(role, enabled)
  const partnerHook = usePartnerLocation(role, enabled)

  const mapRef = useRef(null)
  const meMarkerRef = useRef(null)
  const herMarkerRef = useRef(null)
  const lineRef = useRef(null)

  const toggleRole = (next) => {
    setRole(next)
    localStorage.setItem('relo-role', next)
  }

  const toggleShare = (val) => {
    setEnabled(val)
    localStorage.setItem('relo-share', val ? 'on' : 'off')
  }

  const mePos = useMemo(() => {
    if (enabled && my.position) return { lat: my.position.lat, lng: my.position.lng }
    if (demo) return my.position ? { lat: my.position.lat, lng: my.position.lng } : DEMO_BASE
    return null
  }, [enabled, demo, my.position])

  const rawPartner = useMemo(
    () => (partnerHook.partner && partnerHook.partner.lat != null ? partnerHook.partner : null),
    [partnerHook.partner],
  )

  const partnerPos = useMemo(() => {
    if (demo) {
      const base = mePos || DEMO_BASE
      return rawPartner
        ? { lat: rawPartner.lat, lng: rawPartner.lng }
        : { lat: base.lat + DEMO_OFFSET.lat, lng: base.lng + DEMO_OFFSET.lng }
    }
    return rawPartner ? { lat: rawPartner.lat, lng: rawPartner.lng } : null
  }, [demo, mePos, rawPartner])

  const partnerFresh = rawPartner && Date.now() - new Date(rawPartner.updatedAt).getTime() < STALE_MS

  const meIcon = useMemo(() => heartIcon(ME_COLOR), [])
  const herIcon = useMemo(() => heartIcon(HER_COLOR), [])

  useEffect(() => {
    const mapEl = mapRef.current
    if (!mapEl) return undefined
    const map = L.map(mapEl, { zoomControl: true }).setView([51.5074, -0.1278], 12)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map)
    mapEl.instance = map
    return () => {
      map.remove()
      mapEl.instance = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current?.instance
    if (!map) return

    if (meMarkerRef.current) {
      meMarkerRef.current.remove()
      meMarkerRef.current = null
    }
    if (herMarkerRef.current) {
      herMarkerRef.current.remove()
      herMarkerRef.current = null
    }
    if (lineRef.current) {
      lineRef.current.remove()
      lineRef.current = null
    }

    const points = []
    if (mePos) {
      meMarkerRef.current = L.marker([mePos.lat, mePos.lng], { icon: meIcon })
        .addTo(map)
        .bindPopup(`<strong>${YOUR_NAME}</strong><br/>me, right now`)
      points.push([mePos.lat, mePos.lng])
    }
    if (partnerPos) {
      herMarkerRef.current = L.marker([partnerPos.lat, partnerPos.lng], { icon: herIcon })
        .addTo(map)
        .bindPopup(`<strong>${HER_NAME}</strong><br/>${demo && !rawPartner ? 'demo location' : 'last known location'}`)
      points.push([partnerPos.lat, partnerPos.lng])
    }

    if (points.length === 2) {
      lineRef.current = L.polyline(points, { color: '#f43f7d', weight: 2.5, dashArray: '6 8', opacity: 0.7 }).addTo(map)
      map.fitBounds(points, { padding: [60, 60], maxZoom: 14 })
    } else if (points.length === 1) {
      map.setView(points[0], 13)
    }
  }, [mePos, partnerPos, meIcon, herIcon, demo, rawPartner])

  const distanceKm = haversineKm(mePos, partnerPos)
  const etaMin = distanceKm != null ? Math.round((distanceKm / 5) * 60) : null

  const meName = role === SHARE_ROLES.me ? YOUR_NAME : HER_NAME
  const partnerName = role === SHARE_ROLES.me ? HER_NAME : YOUR_NAME

  return (
    <section className="section location" id="location">
      <p className="section-eyebrow">06 · where we are</p>
      <h2 className="section-title">On our little map</h2>
      <p className="section-lead">
        A Snapchat-style map just for us. Turn sharing on and we will always know how close we are.
      </p>

      <div className="loc-grid">
        <div className="loc-map" ref={mapRef} />

        <aside className="loc-panel">
          <div className="loc-role">
            <span className="loc-role-label">i am...</span>
            <div className="loc-role-btns">
              <button
                type="button"
                className={`loc-role-btn ${role === SHARE_ROLES.me ? 'active' : ''}`}
                onClick={() => toggleRole(SHARE_ROLES.me)}
              >
                {YOUR_NAME}
              </button>
              <button
                type="button"
                className={`loc-role-btn ${role === SHARE_ROLES.her ? 'active' : ''}`}
                onClick={() => toggleRole(SHARE_ROLES.her)}
              >
                {HER_NAME}
              </button>
            </div>
            <span className="loc-role-hint">(on her phone, she taps her name)</span>
          </div>

          <label className="switch-row">
            <span className="switch-text">
              <strong>Share my location</strong>
              <small>{enabled ? 'live updates every 15s' : 'tap to turn on'}</small>
            </span>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => toggleShare(e.target.checked)}
              className="switch"
            />
          </label>

          <label className="switch-row">
            <span className="switch-text">
              <strong>Birthday demo mode</strong>
              <small>show a sweet demo pin so the map is never empty</small>
            </span>
            <input type="checkbox" checked={demo} onChange={(e) => setDemo(e.target.checked)} className="switch" />
          </label>

          <div className="loc-status">
            <div className="loc-status-row">
              <span className={`loc-dot ${enabled ? 'live' : 'off'}`} />
              <span className="loc-status-name">{meName} (you)</span>
              <span className="loc-status-note">
                {my.error === 'permission-denied'
                  ? 'location blocked in browser'
                  : enabled
                    ? `live${my.sending ? '' : ''}`
                    : 'not sharing'}
              </span>
            </div>
            <div className="loc-status-row">
              <span className={`loc-dot ${partnerFresh ? 'live' : 'off'}`} />
              <span className="loc-status-name">{partnerName}</span>
              <span className="loc-status-note">
                {demo && !rawPartner
                  ? 'demo pin'
                  : rawPartner
                    ? partnerFresh
                      ? `live · ${timeAgo(rawPartner.updatedAt)}`
                      : `last seen ${timeAgo(rawPartner.updatedAt)}`
                    : 'no pin yet'}
              </span>
            </div>
          </div>

          <div className="loc-distance">
            <span className="loc-distance-label">distance between us</span>
            <span className="loc-distance-value">{formatDistanceKm(distanceKm)}</span>
            <span className="loc-distance-sub">
              {etaMin != null
                ? `about a ${etaMin} min walk at a happy pace`
                : 'waiting for both pins...'}
            </span>
          </div>
        </aside>
      </div>
    </section>
  )
}