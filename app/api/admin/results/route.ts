import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { calculatePoints, MatchStage } from '@/lib/scoring'

async function requireAdmin() {
  const session = await getSession()
  if (!session?.is_admin) return null
  return session
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { match_id, home_score, away_score } = await req.json()

  if (!match_id || home_score === undefined || away_score === undefined) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
  }

  // Update match result
  const { data: match, error: matchError } = await supabaseAdmin
    .from('matches')
    .update({ home_score, away_score, status: 'finished' })
    .eq('id', match_id)
    .select('stage')
    .single()

  if (matchError) return NextResponse.json({ error: 'Error al actualizar partido' }, { status: 500 })

  // Calculate points for all predictions of this match
  const { data: preds } = await supabaseAdmin
    .from('predictions')
    .select('id, home_score, away_score')
    .eq('match_id', match_id)

  if (preds && preds.length > 0) {
    const updates = preds.map(p => {
      const { points } = calculatePoints(
        p.home_score, p.away_score,
        home_score, away_score,
        match.stage as MatchStage
      )
      return { id: p.id, points }
    })

    for (const u of updates) {
      await supabaseAdmin
        .from('predictions')
        .update({ points: u.points })
        .eq('id', u.id)
    }
  }

  return NextResponse.json({ ok: true, predictions_updated: preds?.length ?? 0 })
}
