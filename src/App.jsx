import { useEffect, useState } from 'react'
import './index.css'
import { autostartOnFirstInteraction } from './audio'
import Hero from './components/Hero'
import Countdown from './components/Countdown'
import Gallery from './components/Gallery'
import Notes from './components/Notes'
import Analytics from './components/Analytics'
import WhereWeAre from './components/WhereWeAre'
import ChatRoom from './components/ChatRoom'
import DateJar from './components/DateJar'
import MusicPlayer from './components/MusicPlayer'
import Constellation from './components/Constellation'
import Heartbeat from './components/Heartbeat'
import { fallbackMemories, fallbackNotes, fallbackStats } from './config'
import { computeSummary } from './utils'

const NAV_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#countdown', label: 'Countdown' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#notes', label: 'Notes' },
  { href: '#analytics', label: 'Analytics' },
  { href: '#location', label: 'Where we are' },
  { href: '#chat', label: 'Chat' },
  { href: '#datejar', label: 'Date jar' },
  { href: '#stars', label: 'Stars' },
  { href: '#heart', label: 'Heart' },
]

function useSiteData() {
  const [data, setData] = useState(() => ({
    memories: fallbackMemories,
    notes: fallbackNotes,
    stats: fallbackStats,
    summary: computeSummary(fallbackStats),
  }))

  useEffect(() => {
    let alive = true

    async function load(url) {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    }

    Promise.allSettled([
      load('/api/memories'),
      load('/api/notes'),
      load('/api/stats'),
      load('/api/relationship/summary'),
    ]).then(([memories, notes, stats, summary]) => {
      if (!alive) return
      setData((prev) => ({
        memories: memories.status === 'fulfilled' && memories.value.length ? memories.value : prev.memories,
        notes: notes.status === 'fulfilled' && notes.value.length ? notes.value : prev.notes,
        stats: stats.status === 'fulfilled' && stats.value.length ? stats.value : prev.stats,
        summary: summary.status === 'fulfilled' ? summary.value : prev.summary,
      }))
    })

    return () => {
      alive = false
    }
  }, [])

  return data
}

export default function App() {
  const { memories, notes, stats, summary } = useSiteData()

  useEffect(() => {
    autostartOnFirstInteraction()
  }, [])

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <a className="nav-logo" href="#home" aria-label="Home">
            <svg viewBox="0 0 32 32" width="22" height="22">
              <path
                d="M16 29 C 6 21 2 15 2 9.5 C 2 5 5.5 2.5 9 2.5 C 12 2.5 15 4.5 16 7 C 17 4.5 20 2.5 23 2.5 C 26.5 2.5 30 5 30 9.5 C 30 15 26 21 16 29 Z"
                fill="currentColor"
              />
            </svg>
          </a>
          <ul className="nav-links">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <main>
        <Hero />
        <Countdown summary={summary} />
        <Gallery memories={memories} />
        <Notes notes={notes} />
        <Analytics stats={stats} summary={summary} />
        <WhereWeAre />
        <ChatRoom />
        <DateJar />
        <Constellation memories={memories} />
        <Heartbeat />
      </main>

      <footer className="footer">
        <p>
          Made with all my love, from the day we met to forever.
        </p>
        <p className="footer-small">happy birthday, my love · i love you more than yesterday, less than tomorrow</p>
      </footer>

      <MusicPlayer />
    </>
  )
}