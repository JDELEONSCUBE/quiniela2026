// POST /api/sync-results
// Llamado por cron-job.org cada 3 minutos durante el torneo
// Sincroniza resultados automáticamente desde api-football.com

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { fetchLiveFixtures, fetchTodayFixtures, normalizeTeamName } from '@/lib/football-api'
import { calculatePoints, MatchStage } from '@/lib/scoring'

const CRON_SECRET = process.env.CRON_SECRET ?? ''

export async function POST(req: Request) {
  // Verificar secret para evitar llamadas no autorizadas
  const authHeader = req.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const results = { live: 0, finished: 0, errors: 0 }

  // 1. Partidos en vivo
  const liveFixtures = await fetchLiveFixtures()
  for (const f of liveFixtures) {
    await processFixture(f, 'live', results)
  }

  // 2. Partidos de hoy (por si alguno terminó y salió del live feed)
  const todayFixtures = await fetchTodayFixtures()
  for (const f of todayFixtures) {
    const status = f.fixture.status.short
    if (['FT', 'AET', 'PEN'].includes(status)) {
      await processFixture(f, 'finished', results)
    }
  }

  return NextResponse.json({
    ok: true,
    synced_live: results.live,
    synced_finished: results.finished,
    errors: results.errors,
    timestamp: new Date().toISOString(),
  })
}

async function processFixture(
  f: Awaited<ReturnType<typeof fetchLiveFixtures>>[0],
  newStatus: 'live' | 'finished',
  results: { live: number; finished: number; errors: number }
) {
  const homeTeam = normalizeTeamName(f.teams.home.name)
  const awayTeam = normalizeTeamName(f.teams.away.name)
  const homeScore = f.goals.home
  const awayScore = f.goals.away

  // Buscar el partido en nuestra DB
  const { data: match } = await supabaseAdmin
    .from('matches')
    .select('id, status, stage')
    .or(`and(home_team.eq.${homeTeam},away_team.eq.${awayTeam}),and(home_team.eq.${awayTeam},away_team.eq.${homeTeam})`)
    .single()

  if (!match) return

  // No re-procesar si ya está finished
  if (match.status === 'finished') return

  try {
    if (newStatus === 'live') {
      await supabaseAdmin
        .from('matches')
        .update({ status: 'live', home_score: homeScore, away_score: awayScore })
        .eq('id', match.id)
      results.live++
    } else if (newStatus === 'finished' && homeScore !== null && awayScore !== null) {
      // Actualizar partido
      await supabaseAdmin
        .from('matches')
        .update({ status: 'finished', home_score: homeScore, away_score: awayScore })
        .eq('id', match.id)

      // Calcular puntos para todos los pronósticos
      const { data: preds } = await supabaseAdmin
        .from('predictions')
        .select('id, home_score, away_score')
        .eq('match_id', match.id)

      if (preds) {
        for (const p of preds) {
          const { points } = calculatePoints(p.home_score, p.away_score, homeScore, awayScore, match.stage as MatchStage)
          await supabaseAdmin.from('predictions').update({ points }).eq('id', p.id)
        }
      }
      results.finished++
    }
  } catch {
    results.errors++
  }
}

// GET: igual que POST — para cron-job.org que usa GET
export async function GET(req: Request) {
  return POST(req)
}
