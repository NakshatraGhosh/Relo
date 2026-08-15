import { useEffect, useRef, useState } from 'react'
import { OUR_SONG } from '../config'
import { getSongAudio, resumeAudio } from '../audio'

export default function MusicPlayer() {
  const [open, setOpen] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [missing, setMissing] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = getSongAudio()
    audioRef.current = audio
    const onErr = () => setMissing(true)
    const onReady = () => setMissing(false)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    audio.addEventListener('error', onErr)
    audio.addEventListener('canplay', onReady)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    return () => {
      audio.removeEventListener('error', onErr)
      audio.removeEventListener('canplay', onReady)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
    }
  }, [])

  function toggle() {
    const audio = audioRef.current
    if (!audio || missing) {
      setOpen(true)
      return
    }
    resumeAudio()
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {})
      setOpen(true)
    }
  }

  return (
    <div className="music">
      {open && (
        <div className="music-card">
          <p className="music-title">{OUR_SONG.title}</p>
          {missing ? (
            <p className="music-hint">{OUR_SONG.hint}</p>
          ) : (
            <button type="button" className={`music-play ${playing ? 'pause' : ''}`} onClick={toggle} aria-label="play or pause song">
              <svg viewBox="0 0 24 24" width="18" height="18">
                {playing ? (
                  <path d="M7 5 h3 v14 H7 z M14 5 h3 v14 h-3 z" fill="currentColor" />
                ) : (
                  <path d="M8 5 L19 12 L8 19 Z" fill="currentColor" />
                )}
              </svg>
            </button>
          )}
          <p className="music-state">{playing ? 'playing' : missing ? 'song not found' : 'tap heart to play'}</p>
        </div>
      )}
      <button type="button" className="music-fab" onClick={toggle} aria-label="our music">
        <svg viewBox="0 0 32 32" width="24" height="24" className="music-fab-icon">
          <path
            d="M16 29 C 6 21 2 15 2 9.5 C 2 5 5.5 2.5 9 2.5 C 12 2.5 15 4.5 16 7 C 17 4.5 20 2.5 23 2.5 C 26.5 2.5 30 5 30 9.5 C 30 15 26 21 16 29 Z"
            fill="currentColor"
          />
        </svg>
        <svg viewBox="0 0 24 24" width="12" height="12" className="music-fab-note">
          <path d="M9 18 V6 L21 4 v11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="7" cy="18" r="2.2" fill="currentColor" />
          <circle cx="19" cy="15" r="2.2" fill="currentColor" />
        </svg>
      </button>
    </div>
  )
}