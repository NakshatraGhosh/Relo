import { useState } from 'react'
import { formatDateNice } from '../utils'

function NoteCard({ note, index }) {
  const [open, setOpen] = useState(index === 0)

  return (
    <article className={`note ${open ? 'open' : ''}`} onClick={() => setOpen((o) => !o)}>
      <div className="note-head">
        <span className="note-heart">
          <svg viewBox="0 0 32 32" width="16" height="16">
            <path
              d="M16 29 C 6 21 2 15 2 9.5 C 2 5 5.5 2.5 9 2.5 C 12 2.5 15 4.5 16 7 C 17 4.5 20 2.5 23 2.5 C 26.5 2.5 30 5 30 9.5 C 30 15 26 21 16 29 Z"
              fill="currentColor"
            />
          </svg>
        </span>
        <div className="note-titles">
          <h3>{note.title}</h3>
          <span className="note-date">{formatDateNice(note.date)}</span>
        </div>
        <span className="note-toggle">{open ? '−' : '+'}</span>
      </div>
      <p className="note-body">{note.message}</p>
    </article>
  )
}

export default function Notes({ notes }) {
  return (
    <section className="section notes" id="notes">
      <p className="section-eyebrow">04 · why you</p>
      <h2 className="section-title">Little notes, big love</h2>
      <p className="section-lead">
        Things I want you to read over and over, so you never forget how special you are to me.
      </p>
      <div className="notes-grid">
        {notes.map((n, i) => (
          <NoteCard key={n.id} note={n} index={i} />
        ))}
      </div>
      <p className="gal-note">ps. this list will never be finished.</p>
    </section>
  )
}