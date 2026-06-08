'use client'
import { useState, useTransition } from 'react'

interface Match {
  id: string; home_team: string; away_team: string; match_date: string
  venue: string; stage: string; home_score: number | null; away_score: number | null; status: string
}
interface Prediction { match_id: string; home_score: number; away_score: number; points: number | null }
interface Props { match: Match; prediction: Prediction | null; locked: boolean; userId: string; flags: Record<string, string> }

export default function PredictionForm({ match, prediction, locked, flags }: Props) {
  const [home, setHome] = useState(prediction?.home_score?.toString() ?? '')
  const [away, setAway] = useState(prediction?.away_score?.toString() ?? '')
  const [saved, setSaved] = useState(!!prediction)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const finished = match.status === 'finished'
  const isLive = match.status === 'live'
  const hasResult = match.home_score !== null && match.away_score !== null

  function getPointBadge() {
    if (!finished || !prediction || prediction.points === null) return null
    const p = prediction.points
    if (p >= 3) return <span className="badge-exact">⭐ {p} pts</span>
    if (p >= 1) return <span className="badge-correct">✓ {p} pt</span>
    return <span className="badge-wrong">✗ 0</span>
  }

  async function handleSave() {
    if (home === '' || away === '') return
    setError('')
    startTransition(async () => {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ match_id: match.id, home_score: parseInt(home), away_score: parseInt(away) }),
      })
      if (res.ok) setSaved(true)
      else { const d = await res.json(); setError(d.error ?? 'Error al guardar') }
    })
  }

  const matchDate = new Date(match.match_date)
  const dateStr = matchDate.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })
  const timeStr = matchDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  const hf = flags[match.home_team] ?? '🏴'
  const af = flags[match.away_team] ?? '🏴'

  return (
    <div className={`px-3 sm:px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 border-b last:border-0 transition-colors ${
      isLive ? 'bg-red-500/5' : finished ? 'opacity-80' : 'hover:bg-white/2'
    }`} style={{ borderColor: 'var(--border)' }}>

      {/* Date */}
      <div className="text-xs font-mono text-[var(--text-muted)] sm:w-24 shrink-0 flex sm:flex-col gap-2 sm:gap-0">
        <span>{dateStr}</span>
        <span>{timeStr}</span>
        {isLive && <span className="badge-live">EN VIVO</span>}
      </div>

      {/* Teams */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-sm font-medium text-right flex-1 truncate">{hf} {match.home_team}</span>
        {hasResult ? (
          <span className={`font-bold font-mono px-2.5 py-1 rounded text-sm shrink-0 ${
            isLive ? 'text-red-400 border border-red-500/30 bg-red-500/10 animate-pulse' : 'text-[var(--text-muted)] border border-[var(--border)] bg-[var(--surface)]'
          }`}>
            {match.home_score} - {match.away_score}
          </span>
        ) : (
          <span className="text-[var(--text-muted)] text-xs shrink-0">vs</span>
        )}
        <span className="text-sm font-medium flex-1 truncate">{af} {match.away_team}</span>
      </div>

      {/* Input / result */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        {locked || finished || isLive ? (
          <div className="flex items-center gap-2">
            {prediction ? (
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs px-2 py-1 rounded border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>{prediction.home_score}</span>
                <span className="text-[var(--text-muted)] text-xs">-</span>
                <span className="font-mono text-xs px-2 py-1 rounded border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>{prediction.away_score}</span>
              </div>
            ) : (
              <span className="text-xs text-[var(--text-muted)] italic">Sin pronóstico</span>
            )}
            {getPointBadge()}
            {locked && !finished && !isLive && <span className="text-xs text-amber-500 font-mono">🔒</span>}
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <input type="number" min="0" max="20" value={home}
              onChange={e => { setHome(e.target.value); setSaved(false) }}
              className="w-12 text-center border rounded-md py-1 text-sm font-mono focus:outline-none transition-all"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <span className="text-[var(--text-muted)]">-</span>
            <input type="number" min="0" max="20" value={away}
              onChange={e => { setAway(e.target.value); setSaved(false) }}
              className="w-12 text-center border rounded-md py-1 text-sm font-mono focus:outline-none transition-all"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button onClick={handleSave} disabled={isPending || home === '' || away === ''}
              className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-all ${
                saved ? 'text-neon-green border border-green-500/30 bg-green-500/10' : 'btn-primary'
              } disabled:opacity-50`}>
              {isPending ? '···' : saved ? '✓' : 'OK'}
            </button>
          </div>
        )}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </div>
  )
}
