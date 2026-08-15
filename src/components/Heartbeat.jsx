import { useEffect, useRef, useState } from 'react'
import { getAnalyser, getAudioContext, getSongAudio, resumeAudio } from '../audio'
import { OUR_SONG } from '../config'

function thump(ctx, freq, delaySec) {
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  g.gain.setValueAtTime(0.55, ctx.currentTime + delaySec)
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delaySec + 0.16)
  osc.connect(g)
  g.connect(ctx.destination)
  osc.start(ctx.currentTime + delaySec)
  osc.stop(ctx.currentTime + delaySec + 0.2)
}

export default function Heartbeat() {
  const heartRef = useRef(null)
  const [bpm, setBpm] = useState(72)
  const [sound, setSound] = useState(false)
  const [songPlaying, setSongPlaying] = useState(false)
  const soundRef = useRef(false)
  const bpmStateRef = useRef(72)

  useEffect(() => {
    const heartEl = heartRef.current
    if (!heartEl) return undefined

    const analyser = getAnalyser()
    const audio = getSongAudio()
    const audioCtx = getAudioContext()
    const buf = analyser ? new Uint8Array(analyser.fftSize) : null

    const onPlay = () => setSongPlaying(true)
    const onPause = () => setSongPlaying(false)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)

    let raf = 0
    let alive = true
    let baseline = 0.04
    let beatStrength = 0
    let idleHeartT = 0
    let lastBpmChange = 0
    const beatTimes = []

    const loop = () => {
      if (!alive) return

      let energy = 0
      let playing = false
      try {
        playing = !audio.paused && !audio.ended
      } catch {
        playing = false
      }

      if (analyser && audioCtx && audioCtx.state === 'running') {
        analyser.getByteTimeDomainData(buf)
        let sum = 0
        for (let i = 0; i < buf.length; i += 1) {
          const v = buf[i] - 128
          sum += v * v
        }
        energy = Math.min(1, Math.sqrt(sum / buf.length) / 70)
      }

      baseline += (energy - baseline) * 0.07

      if (playing) {
        if (energy > baseline * 1.45 && energy > 0.045) {
          beatStrength = 1
          const now = performance.now()
          beatTimes.push(now)
          while (beatTimes.length && now - beatTimes[0] > 4000) beatTimes.shift()
          if (beatTimes.length > 1) {
            const b = Math.round(((beatTimes.length - 1) * 60000) / (now - beatTimes[0]))
            if (b >= 40 && b <= 220) bpmStateRef.current = b
          }
          if (soundRef.current && audioCtx && audioCtx.state === 'running') {
            thump(audioCtx, 62, 0)
            thump(audioCtx, 46, 0.14)
          }
        }
      } else {
        idleHeartT += 16
        bpmStateRef.current = 72
        const phase = (idleHeartT % 833) / 833
        beatStrength = phase < 0.14 ? 1 - phase / 0.14 : 0
      }

      beatStrength *= 0.9

      if (heartEl) {
        const s = playing
          ? 1 + 0.05 * energy + 0.3 * beatStrength
          : 1 + 0.12 * beatStrength
        heartEl.style.transform = `scale(${s.toFixed(3)})`
      }

      const now = performance.now()
      if (now - lastBpmChange > 250 && bpmStateRef.current !== bpmStateRef.lastSet) {
        lastBpmChange = now
        bpmStateRef.lastSet = bpmStateRef.current
        setBpm(bpmStateRef.current)
      }

      raf = requestAnimationFrame(loop)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          alive = true
          raf = requestAnimationFrame(loop)
        } else {
          alive = false
          cancelAnimationFrame(raf)
        }
      },
      { threshold: 0.05 },
    )
    io.observe(heartEl)

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      io.disconnect()
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
    }
  }, [])

  const toggleSound = () => {
    resumeAudio()
    setSound((s) => {
      soundRef.current = !s
      return !s
    })
  }

  return (
    <section className="section heartbeat" id="heart">
      <p className="section-eyebrow">10 · listen</p>
      <h2 className="section-title">My heart, beating for you</h2>
      <p className="section-lead">
        This is my heart right now. Play “{OUR_SONG.title}” with the pink music button and watch it
        dance to our song.
      </p>

      <div className="heart-stage">
        <div className="heart-glow" />
        <div ref={heartRef} className="heart-big">
          <svg viewBox="0 0 32 32" width="100%" height="100%">
            <path
              d="M16 29 C 6 21 2 15 2 9.5 C 2 5 5.5 2.5 9 2.5 C 12 2.5 15 4.5 16 7 C 17 4.5 20 2.5 23 2.5 C 26.5 2.5 30 5 30 9.5 C 30 15 26 21 16 29 Z"
              fill="url(#heartg)"
            />
            <defs>
              <linearGradient id="heartg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="100%" stopColor="#e11d63" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="heart-readout">
          <span className="bpm-num">{bpm}</span>
          <span className="bpm-word">beats per minute</span>
        </div>
        <div className="heart-caption">
          {songPlaying ? 'beating along to our song' : 'resting heartbeat · play our song to wake it up'}
        </div>
        <button type="button" className={`chip-btn ${sound ? 'on' : ''}`} onClick={toggleSound}>
          {sound ? 'heartbeat sound: on' : 'heartbeat sound: off'}
        </button>
      </div>
    </section>
  )
}