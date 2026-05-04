import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'

export type MiniAudioPlayerHandle = {
  /** Jump playback to this time (seconds) and start playing. */
  seekTo: (seconds: number) => void
}

type Props = {
  /** Object URL for the current file, or null when no file */
  src: string | null
  /** Fired on time updates, after seeks/scrubs, and when duration is known */
  onPlaybackTick?: (currentTime: number, duration: number) => void
  /** Override default hint when there is no `src` (e.g. live microphone mode). */
  emptyHint?: string | null
}

function formatClock(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00'
  const s = Math.floor(sec)
  const m = Math.floor(s / 60)
  const r = s % 60
  if (m >= 60) {
    const h = Math.floor(m / 60)
    const mm = m % 60
    return `${h}:${String(mm).padStart(2, '0')}:${String(r).padStart(2, '0')}`
  }
  return `${m}:${String(r).padStart(2, '0')}`
}

export const MiniAudioPlayer = forwardRef<MiniAudioPlayerHandle, Props>(function MiniAudioPlayer(
  { src, onPlaybackTick, emptyHint },
  ref
) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const tickCbRef = useRef(onPlaybackTick)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    tickCbRef.current = onPlaybackTick
  }, [onPlaybackTick])

  const reportPlayback = useCallback(() => {
    const el = audioRef.current
    if (!el) return
    const d = Number.isFinite(el.duration) && el.duration > 0 ? el.duration : 0
    tickCbRef.current?.(el.currentTime, d)
  }, [])

  const applySeek = useCallback((el: HTMLAudioElement, sec: number) => {
    const d = el.duration
    if (Number.isFinite(d) && d > 0) {
      el.currentTime = Math.min(Math.max(0, sec), d)
    } else {
      el.currentTime = Math.max(0, sec)
    }
    setCurrent(el.currentTime)
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      seekTo(seconds: number) {
        const el = audioRef.current
        if (!el || !src) return
        const sec = Math.max(0, seconds)
        const run = () => {
          applySeek(el, sec)
          reportPlayback()
          void el.play().catch(() => {
            /* autoplay / gesture policies */
          })
        }
        if (el.readyState >= HTMLMediaElement.HAVE_METADATA) {
          run()
        } else {
          el.addEventListener('loadedmetadata', run, { once: true })
        }
      },
    }),
    [src, applySeek, reportPlayback]
  )

  const togglePlay = useCallback(() => {
    const el = audioRef.current
    if (!el || !src) return
    if (el.paused) void el.play().catch(() => {})
    else el.pause()
  }, [src])

  const onScrub = useCallback(
    (t: number) => {
      const el = audioRef.current
      if (!el) return
      el.currentTime = t
      setCurrent(t)
      reportPlayback()
    },
    [reportPlayback]
  )

  if (!src) {
    const hint = emptyHint?.trim() || 'Add an audio file to enable playback'
    return (
      <div className="mini-player mini-player--empty" aria-live="polite">
        <span className="mini-player__hint">{hint}</span>
      </div>
    )
  }

  return (
    <div className="mini-player">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={() => {
          const el = audioRef.current
          if (el) setCurrent(el.currentTime)
          reportPlayback()
        }}
        onLoadedMetadata={() => {
          const el = audioRef.current
          if (el && Number.isFinite(el.duration)) setDuration(el.duration)
          reportPlayback()
        }}
        onDurationChange={() => {
          const el = audioRef.current
          if (el && Number.isFinite(el.duration)) setDuration(el.duration)
          reportPlayback()
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />

      <button
        type="button"
        className="mini-player__play"
        onClick={togglePlay}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7L8 5z" />
          </svg>
        )}
      </button>

      <div className="mini-player__track-wrap">
        <input
          type="range"
          className="mini-player__range"
          min={0}
          max={duration > 0 ? duration : 1}
          step="any"
          disabled={duration <= 0}
          value={duration > 0 ? Math.min(current, duration) : 0}
          onChange={(e) => onScrub(Number(e.target.value))}
          aria-label="Seek in audio"
        />
        <div className="mini-player__times">
          <span className="mini-player__t">{formatClock(current)}</span>
          <span className="mini-player__t mini-player__t--muted">{formatClock(duration)}</span>
        </div>
      </div>
    </div>
  )
})
