import { useMemo } from 'react'

function useHeartPositions(count) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const r = Math.random()
        return {
          key: i,
          left: `${(r * 100).toFixed(2)}%`,
          delay: `${(-r * 24).toFixed(2)}s`,
          duration: `${(9 + Math.random() * 9).toFixed(2)}s`,
          size: `${(10 + Math.random() * 22).toFixed(1)}px`,
          opacity: (0.18 + Math.random() * 0.45).toFixed(2),
          sway: `${(30 + Math.random() * 80).toFixed(0)}px`,
        }
      }),
    [count],
  )
}

export default function FloatingHearts({ count = 18 }) {
  const hearts = useHeartPositions(count)

  return (
    <div className="hearts" aria-hidden="true">
      {hearts.map((h) => (
        <span
          key={h.key}
          className="heart"
          style={{
            left: h.left,
            width: h.size,
            height: h.size,
            opacity: h.opacity,
            animationDelay: h.delay,
            animationDuration: h.duration,
            '--sway': h.sway,
          }}
        >
          <svg viewBox="0 0 32 32" width="100%" height="100%">
            <path
              d="M16 29 C 6 21 2 15 2 9.5 C 2 5 5.5 2.5 9 2.5 C 12 2.5 15 4.5 16 7 C 17 4.5 20 2.5 23 2.5 C 26.5 2.5 30 5 30 9.5 C 30 15 26 21 16 29 Z"
              fill="currentColor"
            />
          </svg>
        </span>
      ))}
    </div>
  )
}