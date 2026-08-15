import { useMemo, useState } from 'react'
import { formatDateNice } from '../utils'

function mulberry32(seed) {
  let a = seed
  return function next() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export default function Constellation({ memories }) {
  const [selected, setSelected] = useState(null)
  const [hover, setHover] = useState(null)

  const stars = useMemo(() => {
    const rand = mulberry32(20250923)
    const path = memories.map((m, i) => {
      const t = i / Math.max(1, memories.length - 1)
      const x = 90 + t * 820 + (rand() - 0.5) * 90
      const y = 130 + Math.sin(t * Math.PI * 2.1) * 95 + (rand() - 0.5) * 46
      return { ...m, x, y, r: 3.2 + rand() * 3, tw: rand() * 4 }
    })

    const met = { x: 55, y: 160, r: 7, label: 'the day we met', date: '2025-09-23' }
    const today = {
      x: 945,
      y: 250,
      r: 6,
      label: 'where we are now',
      date: new Date().toISOString().slice(0, 10),
    }

    const dust = Array.from({ length: 90 }, () => ({
      x: rand() * 1000,
      y: rand() * 500,
      r: rand() * 1.4 + 0.3,
      tw: rand() * 6,
      o: 0.35 + rand() * 0.55,
    }))

    const pathPoints = [met, ...path, today]
    return {
      path: pathPoints,
      memStars: path,
      met,
      today,
      dust,
      polyline: pathPoints.map((s) => `${s.x.toFixed(1)},${s.y.toFixed(1)}`).join(' '),
    }
  }, [memories])

  if (!memories.length) {
    return (
      <section className="section constellation" id="stars">
        <p className="section-eyebrow">09 · written in the stars</p>
        <h2 className="section-title">The constellation of us</h2>
        <p className="section-lead">stars are loading...</p>
      </section>
    )
  }

  const setHoverInfo = (s) => setHover(s ? { label: s.label || s.caption, date: s.date } : null)

  return (
    <section className="section constellation" id="stars">
      <p className="section-eyebrow">09 · written in the stars</p>
      <h2 className="section-title">The constellation of us</h2>
      <p className="section-lead">
        Every star below is a day we spent together, strung into one sky. Tap a star to relive that memory.
      </p>

      <div className="sky">
        <svg viewBox="0 0 1000 500" className="sky-svg" role="img" aria-label="constellation of us">
          {stars.dust.map((d, i) => (
            <circle
              key={`d${i}`}
              cx={d.x}
              cy={d.y}
              r={d.r}
              fill="#fff"
              opacity={d.o}
              className="dust-star"
              style={{ animationDelay: `${d.tw}s` }}
            />
          ))}

          <polyline points={stars.polyline} fill="none" className="story-line" />

          <circle cx={stars.met.x} cy={stars.met.y} r={stars.met.r} className="met-star" onClick={() => setSelected({ caption: 'the day we met', date: stars.met.date })}>
            <title>the day we met · 23 Sep 2025</title>
          </circle>

          {stars.memStars.map((s) => (
            <circle
              key={s.id}
              cx={s.x}
              cy={s.y}
              r={s.r}
              className="mem-star"
              style={{ animationDelay: `${s.tw}s` }}
              onClick={() => setSelected(s)}
              onMouseEnter={() => setHoverInfo(s)}
              onMouseLeave={() => setHover(null)}
            >
              <title>{`${s.caption} · ${formatDateNice(s.date)}`}</title>
            </circle>
          ))}

          <circle cx={stars.today.x} cy={stars.today.y} r={stars.today.r} className="today-star">
            <title>where we are now · {formatDateNice(stars.today.date)}</title>
          </circle>

          <text x={stars.met.x - 20} y={stars.met.y + 26} className="star-label">
            the day we met
          </text>
          <text x={stars.today.x - 42} y={stars.today.y + 26} className="star-label">
            now
          </text>
        </svg>

        <div className={`sky-tip ${hover ? 'show' : ''}`}>
          {hover ? (
            <>
              <span>{hover.label}</span>
              <small>{formatDateNice(hover.date)}</small>
            </>
          ) : (
            <span>hover a star to see its memory</span>
          )}
        </div>

        <div className="sky-legend">
          <span><i className="lg met" /> the day we met</span>
          <span><i className="lg mem" /> a memory</span>
          <span><i className="lg today" /> today</span>
        </div>
        <p className="gal-note">
          {memories.length} memories · 1 constellation · literally written in the sky for you
        </p>
      </div>

      {selected && (
        <div className="lightbox" onClick={() => setSelected(null)}>
          <figure className="lightbox-card" onClick={(e) => e.stopPropagation()}>
            {selected.imageUrl ? (
              <img src={selected.imageUrl} alt={selected.caption} />
            ) : (
              <div className="met-poster">
                <span>the beginning</span>
                <h3>23 · 09 · 2025</h3>
                <p>the exact moment the stars decided to stick us together</p>
              </div>
            )}
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