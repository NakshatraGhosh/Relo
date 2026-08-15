import { HER_NAME, RELATIONSHIP_START } from '../config'
import { formatDateNice, diffDays } from '../utils'
import FloatingHearts from './FloatingHearts'

export default function Hero() {
  const days = diffDays(RELATIONSHIP_START)
  const since = `${formatDateNice(RELATIONSHIP_START)} - today`

  return (
    <header className="hero" id="home">
      <FloatingHearts />
      <div className="hero-inner">
        <p className="hero-kicker">happy birthday</p>
        <h1 className="hero-title">
          Happy Birthday<br />
          <span className="hero-name">{HER_NAME}</span>
        </h1>
        <p className="hero-sub">
          You walked into my life on <strong>{formatDateNice(RELATIONSHIP_START)}</strong> and quietly
          became my whole world. Today is about you - the reason these past {days} days have been the
          best of my life. I made this little corner of the internet just for you, because some things are
          too wonderful for words alone.
        </p>
        <div className="hero-cta">
          <a href="#countdown" className="btn btn-primary">Our story so far</a>
          <a href="#gallery" className="btn btn-ghost">See our memories</a>
        </div>
        <p className="hero-since">{since} · happy birthday, my love</p>
      </div>
      <div className="hero-scroll" aria-hidden="true">
        <span className="scrolldot" />
      </div>
    </header>
  )
}