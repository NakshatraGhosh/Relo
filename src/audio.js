import { OUR_SONG } from './config'

let audioEl = null
let ctx = null
let analyser = null
let source = null
let wired = false
let graphFailed = false
let autostartDone = false

export function getSongAudio() {
  if (!audioEl) {
    audioEl = new Audio(OUR_SONG.file)
    audioEl.loop = true
    audioEl.preload = 'auto'
  }
  return audioEl
}

function initGraph() {
  if (graphFailed || wired || typeof window === 'undefined') return
  try {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) {
      graphFailed = true
      return
    }
    ctx = new AC()
    analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.7
    source = ctx.createMediaElementSource(getSongAudio())
    source.connect(analyser)
    analyser.connect(ctx.destination)
    wired = true
  } catch {
    graphFailed = true
    ctx = null
    analyser = null
    source = null
  }
}

export function getAudioContext() {
  initGraph()
  return ctx
}

export function getAnalyser() {
  initGraph()
  return analyser
}

export function resumeAudio() {
  initGraph()
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
}

export function autostartOnFirstInteraction() {
  if (autostartDone) return
  autostartDone = true

  const kick = () => {
    const audio = getSongAudio()
    resumeAudio()
    try {
      audio.volume = 0.05
      audio.play()
        .then(() => {
          const ramp = setInterval(() => {
            audio.volume = Math.min(0.5, audio.volume + 0.03)
            if (audio.volume >= 0.5) clearInterval(ramp)
          }, 70)
        })
        .catch(() => {})
    } catch {
      // never let audio takeover break the site
    }
    document.removeEventListener('pointerdown', kick)
    document.removeEventListener('keydown', kick)
  }

  document.addEventListener('pointerdown', kick, { passive: true })
  document.addEventListener('keydown', kick)
}