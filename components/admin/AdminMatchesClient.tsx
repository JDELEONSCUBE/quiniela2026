'use client'
import { useState } from 'react'

interface Match {
  id: string
  home_team: string
  away_team: string
  match_date: string
  venue: string
  stage: string
  group_name: string | null
  status: string
}

interface Props {
  initialMatches: Match[]
  stageLabels: Record<string, string>
  flags: Record<string, string>
}

const STAGES = ['group', 'round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final']
const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

export default function AdminMatchesClient({ initialMatches, stageLabels, flags }: Props) {
  const [matches, setMatches] = useState(initialMatches)
  const [form, setForm] = useState({
    home_team: '', away_team: '', match_date: '', venue: '',
    stage: 'group', group_name: 'A', match_day: '1',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    const body = {
      ...form,
      group_name: form.stage === 'group' ? form.group_name : null,
      match_day: form.stage === 'group' ? parseInt(form.match_day) : null,
    }
    const res = await fetch('/api/admin/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (res.ok) {
      setMatches(prev => [...prev, data].sort((a, b) => a.match_date.localeCompare(b.match_date)))
      setSuccess('Partido creado.')
    } else {
      setError(data.error)
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este partido? También se borrarán los pronósticos asociados.')) return
    await fetch('/api/admin/matches', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setMatches(prev => prev.filter(m => m.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="font-bold text-gray-800 mb-4">Agregar partido</h2>
        <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Equipo Local</label>
            <input className="input" value={form.home_team} onChange={e => setForm({ ...form, home_team: e.target.value })} placeholder="México" required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Equipo Visitante</label>
            <input className="input" value={form.away_team} onChange={e => setForm({ ...form, away_team: e.target.value })} placeholder="Ecuador" required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Fecha y Hora (local)</label>
            <input className="input" type="datetime-local" value={form.match_date} onChange={e => setForm({ ...form, match_date: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Sede</label>
            <input className="input" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} placeholder="Estadio Azteca, Ciudad de México" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Fase</label>
            <select className="input" value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })}>
              {STAGES.map(s => <option key={s} value={s}>{stageLabels[s] ?? s}</option>)}
            </select>
          </div>
          {form.stage === 'group' && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Grupo</label>
                <select className="input" value={form.group_name} onChange={e => setForm({ ...form, group_name: e.target.value })}>
                  {GROUPS.map(g => <option key={g} value={g}>Grupo {g}</option>)}
                </select>
              </div>
              <div className="w-24">
                <label className="block text-sm text-gray-600 mb-1">Jornada</label>
                <select className="input" value={form.match_day} onChange={e => setForm({ ...form, match_day: e.target.value })}>
                  <option value="1">1</option><option value="2">2</option><option value="3">3</option>
                </select>
              </div>
            </div>
          )}
          <div className="sm:col-span-2 flex justify-end gap-3 items-center">
            {error && <span className="text-red-600 text-sm">{error}</span>}
            {success && <span className="text-green-600 text-sm">{success}</span>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Agregar partido'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2 className="font-bold text-gray-800 mb-3">Partidos cargados ({matches.length})</h2>
        <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
          {matches.map(m => {
            const hf = flags[m.home_team] ?? ''
            const af = flags[m.away_team] ?? ''
            const date = new Date(m.match_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
            return (
              <div key={m.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-gray-400 text-xs w-24 shrink-0">{date}</span>
                  <span className="truncate">{hf} {m.home_team} vs {af} {m.away_team}</span>
                  <span className="text-xs text-gray-400 shrink-0 hidden sm:inline">
                    {stageLabels[m.stage] ?? m.stage}{m.group_name ? ` · G.${m.group_name}` : ''}
                  </span>
                </div>
                {m.status === 'scheduled' && (
                  <button onClick={() => handleDelete(m.id)} className="text-xs text-red-400 hover:text-red-600 shrink-0">
                    Eliminar
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
