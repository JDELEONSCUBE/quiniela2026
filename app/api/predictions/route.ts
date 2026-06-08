import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { match_id, home_score, away_score } = await req.json()

  if (match_id === undefined || home_score === undefined || away_score === undefined) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
  }

  if (home_score < 0 || away_score < 0 || home_score > 20 || away_score > 20) {
    return NextResponse.json({ error: 'Marcador inválido' }, { status: 400 })
  }

  // Check match exists and is not locked
  const { data: match } = await supabaseAdmin
    .from('matches')
    .select('id, match_date, status')
    .eq('id', match_id)
    .single()

  if (!match) return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 })
  if (match.status !== 'scheduled') {
    return NextResponse.json({ error: 'El partido ya comenzó o finalizó' }, { status: 400 })
  }

  const matchTime = new Date(match.match_date).getTime()
  const now = Date.now()
  if (matchTime - now <= 60 * 60 * 1000) {
    return NextResponse.json({ error: 'El pronóstico está bloqueado (menos de 1 hora para el partido)' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('predictions')
    .upsert({
      user_id: session.id,
      match_id,
      home_score,
      away_score,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,match_id' })

  if (error) return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
