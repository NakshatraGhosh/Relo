import { useCallback, useEffect, useRef, useState } from 'react'
import { HER_NAME, SHARE_ROLES, SHARE_SECRET, YOUR_NAME } from '../config'

const SECRET_HEADERS = { 'X-Relocation-Secret': SHARE_SECRET, 'Content-Type': 'application/json' }
const POLL_MS = 4000

function myNameFromRole() {
  const role = localStorage.getItem('relo-role') || SHARE_ROLES.me
  return role === SHARE_ROLES.me ? YOUR_NAME : HER_NAME
}

function whatsappLink(code) {
  const text = encodeURIComponent(
    `Join our secret chatroom, my love!\nOpen the birthday website and tap "Chat", then join with this code:\n${code}`,
  )
  return `https://wa.me/?text=${text}`
}

export default function ChatRoom() {
  const [code, setCode] = useState(() => localStorage.getItem('relo-chat-room') || '')
  const [input, setInput] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [messages, setMessages] = useState([])
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const scrollRef = useRef(null)
  const lastIdRef = useRef(0)
  const myName = myNameFromRole()

  const joined = Boolean(code)

  const scrollTop = () => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }

  const loadAll = useCallback(async () => {
    const res = await fetch(`/api/chat/messages/${code}`,
      { headers: { 'X-Relocation-Secret': SHARE_SECRET } })
    if (!res.ok) throw new Error('room-gone')
    const data = await res.json()
    lastIdRef.current = data.length ? data[data.length - 1].id : 0
    setMessages(data)
    scrollTop()
  }, [code])

  const poll = useCallback(async () => {
    const res = await fetch(`/api/chat/messages/${code}?after=${lastIdRef.current}`,
      { headers: { 'X-Relocation-Secret': SHARE_SECRET } })
    if (!res.ok) throw new Error('room-gone')
    const data = await res.json()
    if (data.length) {
      setMessages((prev) => {
        const seen = new Set(prev.map((m) => m.id))
        return [...prev, ...data.filter((m) => !seen.has(m.id))]
      })
      lastIdRef.current = Math.max(lastIdRef.current, data[data.length - 1].id)
      scrollTop()
    }
  }, [code])

  useEffect(() => {
    if (!joined) return undefined
    let alive = true
    loadAll()
      .catch(() => alive && setMessages([]))
    const id = setInterval(() => {
      poll().catch(() => {})
    }, POLL_MS)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [joined, code, loadAll, poll])

  useEffect(() => {
    scrollTop()
  }, [messages])

  async function createRoom() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/chat/rooms', { method: 'POST', headers: SECRET_HEADERS })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const room = await res.json()
      localStorage.setItem('relo-chat-room', room.code)
      setCode(room.code)
      setMessages([])
    } catch {
      setError("couldn't create a room - is the backend running?")
    } finally {
      setBusy(false)
    }
  }

  async function joinRoom() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/chat/rooms/${encodeURIComponent(joinCode.trim())}`,
        { headers: { 'X-Relocation-Secret': SHARE_SECRET } })
      if (!res.ok) throw new Error('not-found')
      const room = await res.json()
      localStorage.setItem('relo-chat-room', room.code)
      setCode(room.code)
    } catch {
      setError('no room found with that code. double-check and try again.')
    } finally {
      setBusy(false)
    }
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text) return
    setInput('')
    const res = await fetch('/api/chat/messages', {
      method: 'POST',
      headers: SECRET_HEADERS,
      body: JSON.stringify({ room: code, sender: myName, text }),
    })
    if (res.ok) {
      const msg = await res.json()
      setMessages((prev) => [...prev, msg])
      lastIdRef.current = Math.max(lastIdRef.current, msg.id)
      scrollTop()
    } else if (res.status === 404) {
      setError('room no longer exists - create a new one')
      leaveRoom()
    }
  }

  function leaveRoom() {
    localStorage.removeItem('relo-chat-room')
    setCode('')
    setMessages([])
    lastIdRef.current = 0
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.prompt('copy your room code:', code)
    }
  }

  const time = (iso) => (iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')

  return (
    <section className="section chat" id="chat">
      <p className="section-eyebrow">07 · only us</p>
      <h2 className="section-title">Our little chatroom</h2>
      <p className="section-lead">
        A secret room for two. Create a room, share the code over WhatsApp (or copy it), and we can
        talk like nobody else is listening.
      </p>

      {!joined ? (
        <div className="chat-entry">
          <button type="button" className="btn btn-primary" onClick={createRoom} disabled={busy}>
            {busy ? 'creating...' : 'create our room'}
          </button>

          <div className="chat-or"><span>or</span></div>

          <div className="chat-join">
            <input
              className="chat-code-input"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
              placeholder="type her secret code..." 
            />
            <button type="button" className="btn btn-ghost" onClick={joinRoom} disabled={busy}>
              join
            </button>
          </div>

          {error && <p className="chat-error">{error}</p>}
          <p className="chat-hint">
            how it works: tap "create our room" → a cute secret code appears → copy it or send it to her
            on WhatsApp → she types the code here and you are connected.
          </p>
        </div>
      ) : (
        <div className="chat-room">
          <div className="chat-room-head">
            <div className="chat-room-code">
              <strong>secret code</strong>
              <span>{code}</span>
            </div>
            <div className="chat-room-actions">
              <button type="button" className="chip-btn" onClick={copyCode}>
                {copied ? 'copied!' : 'copy code'}
              </button>
              <a className="chip-btn" href={whatsappLink(code)} target="_blank" rel="noopener noreferrer">
                send on whatsapp
              </a>
              <button type="button" className="chip-btn" onClick={leaveRoom}>
                leave room
              </button>
            </div>
          </div>

          <div className="chat-thread" ref={scrollRef}>
            {messages.length === 0 ? (
              <p className="chat-empty">
                no messages yet. say something sweet to break the silence...
              </p>
            ) : (
              messages.map((m) => {
                const mine = m.sender.trim().toLowerCase() === myName.trim().toLowerCase()
                return (
                  <div key={m.id} className={`bubble-row ${mine ? 'mine' : ''}`}>
                    <div className="bubble">
                      <span className="bubble-sender">{mine ? 'you' : m.sender}</span>
                      <p>{m.text}</p>
                      <span className="bubble-time">{time(m.at)}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {error && <p className="chat-error">{error}</p>}

          <div className="chat-composer">
            <input
              className="chat-code-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="type something for her eyes only..."
            />
            <button type="button" className="btn btn-primary" onClick={sendMessage} disabled={!input.trim()}>
              send
            </button>
          </div>
        </div>
      )}
    </section>
  )
}