'use client'
import { useState } from 'react'

interface Match {
  id: string
  home_team: string
  away_team: string
  match_date: string
  stage: string
  group_name: string | null
  home_score: number | null
  away_score: number | null
  status: string
}

interface Props {
  matches: Match[]
  stageLabels: Record<string, string>
  flags: Record<string, string>
}

export default function AdminResultsClient({ matches, stageLabels, flags }: Props) {
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [error, setError] = useState<Record<string, string>>({})

  const pending = matches.filter(m => m.status !== 'finished')
  const finished = matches.filter(m => m.status === 'finished')

  async function handleSave(match: Match) {
    const s = scores[match.id]
    if (!s || s.home === '' || s.away === '') return
    setSaving(match.id); setError(prev => ({ ...prev, [match.id]: '' }))

    const res = await fetch('/api/admin/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ match_id: match.id, home_score: parseInt(s.home), away_score: parseInt(s.away) }),
    })

    const data = await res.json()
    if (res.ok) {
      setSaved(prev => { const next = new Set(Array.from(prev)); next.add(match.id); return next })
    } else {
      setError(prev => ({ ...prev, [match.id]: data.error }))
    }
    setSaving(null)
  }

  function MatchRow({ m }: { m: Match }) {
    const hf = flags[m.home_team] ?? '🏴'
    const af = flags[m.away_team] ?? '🏴'
    const date = new Date(m.match_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    const isSaved = saved.has(m.id)

    return (
      <div className="py-3 px-4 flex flex-col sm:flex-row sm:items-center gap-3 border-b border-gray-100 last:border-0">
        <div className="text-xs text-gray-400 w-28 shrink-0">
          {date} · {stageLabels[m.stage] ?? m.stage}
          {m.group_name && ` · Grupo ${m.group_name}`}
        </div>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-sm font-medium">{hf} {m.home_team}</span>
          <span className="text-gray-300">vs</span>
          <span className="text-sm font-medium">{af} {m.away_team}</span>
        </div>
        {m.status === 'finished' || isSaved ? (
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-bold text-green-700">
              {isSaved ? `${scores[m.id]?.home ?? m.home_score} - ${scores[m.id]?.away ?? m.away_score}` : `${m.home_score} - ${m.away_score}`}
            </span>
            <span className="text-xs text-green-600">✅ Guardado</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <input
              type="number" min="0" max="20"
              value={scores[m.id]?.home ?? ''}
              onChange={e => setScores(p => ({ ...p, [m.id]: { home: e.target.value, away: p[m.id]?.away ?? '' } }))}
              className="w-12 text-center border border-gray-300 rounded-md py-1 text-sm focus:outline-none focus:ring-2 focus:ring-fifa-blue"
              placeholder="0"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number" min="0" max="20"
              value={scores[m.id]?.away ?? ''}
              onChange={e => setScores(p => ({ ...p, [m.id]: { home: p[m.id]?.home ?? '', away: e.target.value } }))}
              className="w-12 text-center border border-gray-300 rounded-md py-1 text-sm focus:outline-none focus:ring-2 focus:ring-fifa-blue"
              placeholder="0"
            />
            <button
              onClick={() => handleSave(m)}
              disabled={saving === m.id}
              className="btn-primary text-xs py-1.5 px-3"
            >
              {saving === m.id ? '...' : 'Guardar'}
            </button>
            {error[m.id] && <span className="text-xs text-red-500">{error[m.id]}</span>}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="font-bold text-gray-800 mb-1">Partidos pendientes de resultado ({pending.length})</h2>
        <p className="text-sm text-gray-500 mb-4">Al guardar el resultado, los puntos se calculan automáticamente.</p>
        {pending.length === 0 ? (
          <p className="text-gray-400 text-center py-6">Todos los partidos tienen resultado. 🎉</p>
        ) : (
          <div>{pending.map(m => <MatchRow key={m.id} m={m} />)}</div>
        )}
      </div>

      {finished.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-3">Partidos finalizados ({finished.length})</h2>
          <div>{finished.map(m => <MatchRow key={m.id} m={m} />)}</div>
        </div>
      )}
    </div>
  )
}
