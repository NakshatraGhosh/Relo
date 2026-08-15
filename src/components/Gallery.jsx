import { useEffect, useMemo, useState } from 'react'
import { formatDateNice, MONTH_NAMES } from '../utils'

const AUTO_MS = 2200

export default function Gallery({ memories }) {
  const sorted = useMemo(
    () => [...memories].sort((a, b) => (a.date || '').localeCompare(b.date || '')),
    [memories],
  )

  const days = useMemo(() => {
    const byDate = new Map()
    for (const m of sorted) {
      if (!m.date) continue
      if (!byDate.has(m.date)) byDate.set(m.date, [])
      byDate.get(m.date).push(m)
    }
    return [...byDate.entries()].map(([date, items]) => ({
      date,
      label: formatDateNice(date),
      items,
    }))
  }, [sorted])

  const [idx, setIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [selected, setSelected] = useState(null)

  const day = days[Math.min(idx, days.length - 1)]

  useEffect(() => {
    const onKey = (e) => {
      if (selected) {
        if (e.key === 'Escape') setSelected(null)
        return
      }
      if (e.key === 'ArrowRight') { setPlaying(false); setIdx((i) => (i + 1) % days.length) }
      if (e.key === 'ArrowLeft') { setPlaying(false); setIdx((i) => (i - 1 + days.length) % days.length) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, days.length])

  useEffect(() => {
    if (!playing || days.length < 2) return
    const t = setInterval(() => setIdx((i) => (i + 1) % days.length), AUTO_MS)
    return () => clearInterval(t)
  }, [playing, days.length])

  const go = (i) => {
    setPlaying(false)
    setIdx(((i % days.length) + days.length) % days.length)
  }

  const monthsAxis = useMemo(() => {
    const parts = []
    let last = ''
    for (let i = 0; i < days.length; i++) {
      const key = days[i].date.slice(0, 7)
      if (key !== last) {
        parts.push({ month: key, i })
        last = key
      }
    }
    return parts
  }, [days])

  return (
    <section className="section gallery" id="gallery">
      <p className="section-eyebrow">03 · the memories</p>
      <h2 className="section-title">Our time capsule</h2>
      <p className="section-lead">
        Every date is sealed inside this little box of time. Slide the timeline or press play to
        travel through our story, one lovely day at a time.
      </p>

      <div className="timeline">
        <div className="timeline-dots">
          {days.map((d, i) => (
            <button
              type="button"
              key={d.date}
              className={`tl-dot${i === idx ? ' active' : ''}${i < idx ? ' passed' : ''}`}
              style={{ left: days.length === 1 ? '50%' : `${(i / (days.length - 1)) * 100}%` }}
              onClick={() => go(i)}
              aria-label={`Go to ${d.label}`}
            >
              <span />
            </button>
          ))}
        </div>
        <div className="timeline-slider-wrap">
          <input
            className="timeline-slider"
            type="range"
            min={0}
            max={Math.max(0, days.length - 1)}
            step={1}
            value={idx}
            aria-label="Slide through our timeline of memories"
            onChange={(e) => {
              setPlaying(false)
              setIdx(Number(e.target.value))
            }}
          />
        </div>
        <div className="timeline-months">
          {monthsAxis.map((m) => (
            <span
              key={m.month}
              style={{ left: `${(m.i / Math.max(1, days.length - 1)) * 100}%` }}
            >
              {MONTH_NAMES[Number(m.month.slice(5)) - 1]} ’{m.month.slice(2, 4)}
            </span>
          ))}
        </div>
        <div className="timeline-ends">
          <span>{days.length ? formatDateNice(days[0].date) : ''}</span>
          <span>{days.length ? formatDateNice(days[days.length - 1].date) : ''}</span>
        </div>
      </div>

      <div className="timeline-actions">
        <button type="button" className="tl-btn" onClick={() => go(idx - 1)} aria-label="Previous day">
          ‹
        </button>
        <button
          type="button"
          className={`tl-btn ${playing ? 'playing' : ''}`}
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? 'pause' : 'play our story'}
        </button>
        <button type="button" className="tl-btn" onClick={() => go(idx + 1)} aria-label="Next day">
          ›
        </button>
      </div>

      {day ? (
        <div className="capsule" key={day.date}>
          <header className="capsule-date">
            <span className="capsule-echo">
              memory {idx + 1} of {days.length}
            </span>
            <strong>{day.label}</strong>
            <span className="capsule-count">
              {day.items.length === 1 ? 'one little moment' : `${day.items.length} little moments`}
            </span>
          </header>

          <div className={day.items.length === 1 ? 'capsule-photos single' : 'capsule-photos'}>
            {day.items.map((m) => (
              <figure className="polaroid" key={m.id} onClick={() => setSelected(m)}>
                <div className="polaroid-img">
                  <img src={m.imageUrl} alt={m.caption} loading="lazy" />
                </div>
                <figcaption>
                  <strong>{m.caption}</strong>
                  <span>{day.label}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      ) : (
        <p className="gal-note">No memories yet - but we are already writing the first ones.</p>
      )}

      <p className="gal-note">
        and this is far from the end of the capsule - we are only getting started.
      </p>

      {selected && (
        <div className="lightbox" onClick={() => setSelected(null)}>
          <figure className="lightbox-card" onClick={(e) => e.stopPropagation()}>
            <img src={selected.imageUrl} alt={selected.caption} />
            <figcaption>
              <strong>{selected.caption}</strong>
              <span>{formatDateNice(selected.date)}</span>
            </figcaption>
            <button type="button" className="lightbox-close" onClick={() => setSelected(null)} aria-label="Close">
              &times;
            </button>
          </figure>
        </div>
      )}
    </section>
  )
}