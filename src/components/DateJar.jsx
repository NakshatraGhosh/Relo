import { useState } from 'react'
import { DATE_IDEAS } from '../config'

export default function DateJar() {
  const [idea, setIdea] = useState(null)
  const [shaking, setShaking] = useState(false)

  function draw() {
    if (shaking) return
    setShaking(true)
    setTimeout(() => {
      setIdea(DATE_IDEAS[Math.floor(Math.random() * DATE_IDEAS.length)])
      setShaking(false)
    }, 600)
  }

  const hearts = [
    { left: '22%', top: '18%', s: 14, d: '0s' },
    { left: '52%', top: '10%', s: 12, d: '.3s' },
    { left: '70%', top: '26%', s: 15, d: '.6s' },
    { left: '35%', top: '34%', s: 11, d: '.9s' },
    { left: '60%', top: '42%', s: 13, d: '1.2s' },
  ]

  return (
    <section className="section datejar" id="datejar">
      <p className="section-eyebrow">08 · for when we are bored</p>
      <h2 className="section-title">The date idea jar</h2>
      <p className="section-lead">
        Whenever we need an adventure, pull a slip and let the jar decide our next date.
      </p>

      <div className="datejar-stage">
        <div className={`jar ${shaking ? 'shake' : ''}`}>
          <div className="jar-lid" />
          <div className="jar-glass">
            {hearts.map((h, i) => (
              <svg
                key={i}
                viewBox="0 0 32 32"
                width={h.s}
                height={h.s}
                className="jar-heart"
                style={{ left: h.left, top: h.top, animationDelay: h.d }}
              >
                <path
                  d="M16 29 C 6 21 2 15 2 9.5 C 2 5 5.5 2.5 9 2.5 C 12 2.5 15 4.5 16 7 C 17 4.5 20 2.5 23 2.5 C 26.5 2.5 30 5 30 9.5 C 30 15 26 21 16 29 Z"
                  fill="currentColor"
                />
              </svg>
            ))}
            <div className="jar-slip" />
          </div>
        </div>

        <div className="datejar-side">
          <button type="button" className="btn btn-primary" onClick={draw} disabled={shaking}>
            {shaking ? 'shaking...' : 'pull a date idea'}
          </button>
          <div className={`dateidea ${idea ? 'show' : ''}`}>
            {idea ? (
              <>
                <span className="dateidea-label">today's pick</span>
                <p className="dateidea-text">{idea}</p>
                <button type="button" className="chip-btn" onClick={draw}>
                  pull another
                </button>
              </>
            ) : (
              <p className="dateidea-empty">tap the jar and let fate decide</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}