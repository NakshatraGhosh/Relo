import { useEffect, useState } from 'react'
import { RELATIONSHIP_START } from '../config'
import { diffFull } from '../utils'

function useLiveCountdown() {
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const tick = () => setT(diffFull(RELATIONSHIP_START))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return t
}

const pad = (n) => String(n).padStart(2, '0')

export default function Countdown({ summary }) {
  const t = useLiveCountdown()
  const daysTogether = summary.daysTogether ?? t.days

  return (
    <section className="section countdown" id="countdown">
      <p className="section-eyebrow">02 · the numbers of us</p>
      <h2 className="section-title">Every second with you</h2>
      <p className="section-lead">
        Since {RELATIONSHIP_START.replace(/-/g, ' · ')} we have been counting every beautiful minute.
      </p>

      <div className="count-big">
        <span className="count-big-number">{daysTogether.toLocaleString()}</span>
        <span className="count-big-label">days together</span>
      </div>

      <div className="count-live">
        <div className="count-live-cell">
          <span className="count-live-value">{pad(t.hours)}</span>
          <span className="count-live-label">hrs</span>
        </div>
        <span className="count-live-sep">:</span>
        <div className="count-live-cell">
          <span className="count-live-value">{pad(t.minutes)}</span>
          <span className="count-live-label">min</span>
        </div>
        <span className="count-live-sep">:</span>
        <div className="count-live-cell">
          <span className="count-live-value">{pad(t.seconds)}</span>
          <span className="count-live-label">sec</span>
        </div>
        <span className="count-live-extra">and still counting our love</span>
      </div>

      {summary.nextMilestoneLabel && (
        <div className="milestone-card">
          <p className="milestone-text">
            {summary.daysUntilNextMilestone > 0
              ? `Only ${summary.daysUntilNextMilestone} more days until ...`
              : 'We hit a milestone today!'}
          </p>
          <p className="milestone-target">
            {summary.daysUntilNextMilestone > 0 ? `“${summary.nextMilestoneLabel}”` : `“${summary.nextMilestoneLabel}” — today!`}
          </p>
          <div className="milestone-bar">
            <div className="milestone-fill" style={{ width: `${(summary.progress ?? 0) * 100}%` }} />
          </div>
        </div>
      )}

      <div className="milestones">
        {[
          { days: 100, label: '100 days' },
          { days: 200, label: '200 days' },
          { days: 300, label: '300 days' },
          { days: 365, label: '1 year' },
          { days: 500, label: '500 days' },
          { days: 730, label: '2 years' },
          { days: 1000, label: '1000 days' },
        ].map((m) => {
          const done = daysTogether >= m.days
          return (
            <div key={m.days} className={`milestone-chip ${done ? 'done' : ''}`} title={m.label}>
              <span className="milestone-chip-icon">
                {done ? (
                  <svg viewBox="0 0 32 32" width="14" height="14">
                    <path
                      d="M16 29 C 6 21 2 15 2 9.5 C 2 5 5.5 2.5 9 2.5 C 12 2.5 15 4.5 16 7 C 17 4.5 20 2.5 23 2.5 C 26.5 2.5 30 5 30 9.5 C 30 15 26 21 16 29 Z"
                      fill="currentColor"
                    />
                  </svg>
                ) : (
                  <span className="milestone-chip-hollow" />
                )}
              </span>
              {m.label}
            </div>
          )
        })}
      </div>
    </section>
  )
}