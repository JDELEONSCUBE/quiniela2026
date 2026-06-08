import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { STAGE_LABELS, FLAGS } from '@/lib/matches-data'
import PredictionForm from '@/components/PredictionForm'

export const dynamic = 'force-dynamic'

interface Match {
  id: string
  home_team: string
  away_team: string
  match_date: string
  venue: string
  stage: string
  group_name: string | null
  home_score: number | null
  away_score: number | null
  status: string
}

interface Prediction {
  match_id: string
  home_score: number
  away_score: number
  points: number | null
}

function isLocked(matchDate: string): boolean {
  const match = new Date(matchDate)
  const now = new Date()
  const diff = match.getTime() - now.getTime()
  return diff <= 60 * 60 * 1000 // locked 1h before
}

function groupByStageAndGroup(matches: Match[]) {
  const grouped: Record<string, Record<string, Match[]>> = {}
  for (const m of matches) {
    const stage = m.stage
    const grp = m.group_name ?? 'Eliminatoria'
    if (!grouped[stage]) grouped[stage] = {}
    if (!grouped[stage][grp]) grouped[stage][grp] = []
    grouped[stage][grp].push(m)
  }
  return grouped
}

export default async function PronosticosPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const { data: matches } = await supabaseAdmin
    .from('matches')
    .select('*')
    .order('match_date', { ascending: true })

  const { data: predictions } = await supabaseAdmin
    .from('predictions')
    .select('match_id, home_score, away_score, points')
    .eq('user_id', session.id)

  const predMap: Record<string, Prediction> = {}
  for (const p of predictions ?? []) {
    predMap[p.match_id] = p
  }

  const stageOrder = ['group', 'round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final']
  const grouped = groupByStageAndGroup(matches ?? [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-fifa-blue">⚽ Mis Pronósticos</h1>
        <p className="text-gray-500 text-sm mt-1">
          Hola, <strong>{session.username}</strong>. Ingresa tu marcador para cada partido antes de que empiece.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6 text-xs">
        <span className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
          Marcador exacto (Grupos: 3pts | Eliminat: 5pts)
        </span>
        <span className="flex items-center gap-1.5 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-400"></span>
          Resultado correcto (Grupos: 1pt | Eliminat: 2pts)
        </span>
        <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-gray-400"></span>
          Sin resultado aún
        </span>
      </div>

      {stageOrder.map(stage => {
        if (!grouped[stage]) return null
        return (
          <div key={stage} className="mb-8">
            <h2 className="text-lg font-bold text-white bg-fifa-blue px-4 py-2 rounded-t-lg">
              {STAGE_LABELS[stage] ?? stage}
            </h2>
            <div className="border border-gray-200 rounded-b-lg divide-y divide-gray-100">
              {Object.entries(grouped[stage]).map(([grp, grpMatches]) => (
                <div key={grp}>
                  {grp !== 'Eliminatoria' && (
                    <div className="bg-gray-50 px-4 py-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Grupo {grp}
                    </div>
                  )}
                  {grpMatches.map(match => {
                    const pred = predMap[match.id]
                    const locked = isLocked(match.match_date)
                    const finished = match.status === 'finished'

                    return (
                      <PredictionForm
                        key={match.id}
                        match={match}
                        prediction={pred ?? null}
                        locked={locked}
                        userId={session.id}
                        flags={FLAGS}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {(!matches || matches.length === 0) && (
        <div className="card text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">⚽</p>
          <p>No hay partidos cargados aún. El administrador los agregará pronto.</p>
        </div>
      )}
    </div>
  )
}
