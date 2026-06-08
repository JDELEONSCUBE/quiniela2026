import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 60

interface LeaderboardRow {
  id: string; username: string; display_name: string
  total_points: number; matches_scored: number; exact_scores: number; correct_results: number
}

export default async function HomePage() {
  const { data: rows } = await supabaseAdmin.from('leaderboard').select('*')
  const leaderboard: LeaderboardRow[] = rows ?? []

  const { data: matchStats } = await supabaseAdmin.from('matches').select('status')
  const total = matchStats?.length ?? 0
  const finished = matchStats?.filter(m => m.status === 'finished').length ?? 0
  const live = matchStats?.filter(m => m.status === 'live').length ?? 0

  const { data: nextMatch } = await supabaseAdmin
    .from('matches')
    .select('home_team, away_team, match_date, stage')
    .eq('status', 'scheduled')
    .order('match_date', { ascending: true })
    .limit(1)
    .single()

  const nextMatchDate = nextMatch ? new Date(nextMatch.match_date) : null

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          <span className="text-neon">⚽ Mundial</span>
          <span className="text-[var(--text)]"> 2026</span>
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-2 font-mono">
          FIFA WORLD CUP — USA · CANADA · MEXICO
        </p>
        {/* Live indicator */}
        {live > 0 && (
          <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/10">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
            <span className="text-red-400 text-xs font-bold">{live} PARTIDO{live > 1 ? 'S' : ''} EN VIVO</span>
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Jugados', value: finished, color: 'text-neon-green' },
          { label: 'Totales', value: total, color: 'text-neon' },
          { label: 'Participantes', value: leaderboard.length, color: 'text-[var(--text)]' },
        ].map(s => (
          <div key={s.label} className="card-cyber text-center py-3">
            <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5 uppercase tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Next match */}
      {nextMatch && nextMatchDate && (
        <div className="card-cyber flex items-center justify-between gap-4 py-3">
          <div>
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-0.5 font-mono">Próximo partido</div>
            <div className="font-semibold text-sm">{nextMatch.home_team} vs {nextMatch.away_team}</div>
          </div>
          <div className="text-right text-xs font-mono text-scube-cyan">
            <div>{nextMatchDate.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
            <div>{nextMatchDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} hrs</div>
          </div>
        </div>
      )}

      {/* CTA Pronósticos */}
      <div className="card-cyber flex flex-col sm:flex-row items-center justify-between gap-3 py-4">
        <div>
          <div className="font-semibold text-sm">¿Ya ingresaste tus pronósticos?</div>
          <div className="text-xs text-[var(--text-muted)] mt-0.5">Los partidos comienzan el 11 de junio — ¡tienes hasta 1h antes!</div>
        </div>
        <Link href="/pronosticos" className="btn-primary shrink-0 whitespace-nowrap">
          ⚽ Mis Pronósticos →
        </Link>
      </div>

      {/* Leaderboard */}
      <div className="card-cyber overflow-hidden">
        <div className="section-header flex items-center justify-between">
          <span>🏆 Tabla de Posiciones</span>
          <span className="text-xs opacity-60 font-normal normal-case tracking-normal">
            actualiza cada 60s
          </span>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-muted)]">
            <div className="text-4xl mb-3 opacity-30">🏆</div>
            <p>Aún no hay participantes con pronósticos.</p>
            <Link href="/login" className="btn-primary inline-block mt-4">Entrar a pronosticar</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wide text-[var(--text-muted)]" style={{ borderColor: 'var(--border)' }}>
                  <th className="text-left py-2.5 px-4">#</th>
                  <th className="text-left py-2.5 px-2">Participante</th>
                  <th className="text-center py-2.5 px-2">Pts</th>
                  <th className="text-center py-2.5 px-2 hidden sm:table-cell">Exactos</th>
                  <th className="text-center py-2.5 px-2 hidden sm:table-cell">Correctos</th>
                  <th className="text-center py-2.5 px-2 hidden md:table-cell">Jugados</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {leaderboard.map((row, i) => (
                  <tr key={row.id} className={`transition-colors hover:bg-white/5 ${i === 0 ? 'bg-neon-yellow/5' : ''}`}>
                    <td className="py-3 px-4 font-mono font-bold">
                      {i === 0 ? <span className="rank-1">01</span>
                      : i === 1 ? <span className="rank-2">02</span>
                      : i === 2 ? <span className="rank-3">03</span>
                      : <span className="text-[var(--text-muted)]">{String(i + 1).padStart(2, '0')}</span>}
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-semibold">{row.display_name}</div>
                      <div className="text-xs text-[var(--text-muted)] font-mono">@{row.username}</div>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`text-lg font-bold font-mono ${i === 0 ? 'text-neon-yellow' : i === 1 ? 'text-[#C0C0C0]' : i === 2 ? 'text-[#CD7F32]' : 'text-scube-cyan'}`}>
                        {row.total_points}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center hidden sm:table-cell">
                      <span className="badge-exact">{row.exact_scores}</span>
                    </td>
                    <td className="py-3 px-2 text-center hidden sm:table-cell">
                      <span className="badge-correct">{row.correct_results}</span>
                    </td>
                    <td className="py-3 px-2 text-center hidden md:table-cell text-[var(--text-muted)] font-mono text-xs">
                      {row.matches_scored}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center text-xs text-[var(--text-muted)]">
        <span className="flex items-center gap-1.5"><span className="badge-exact">3</span> Marcador exacto (grupos)</span>
        <span className="flex items-center gap-1.5"><span className="badge-exact">5</span> Marcador exacto (eliminat.)</span>
        <span className="flex items-center gap-1.5"><span className="badge-correct">1</span> Resultado correcto (grupos)</span>
        <span className="flex items-center gap-1.5"><span className="badge-correct">2</span> Ganador correcto (eliminat.)</span>
      </div>
    </div>
  )
}
