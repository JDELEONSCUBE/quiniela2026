import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

async function requireAdmin() {
  const session = await getSession()
  if (!session?.is_admin) return null
  return session
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('matches')
    .select('*')
    .order('match_date', { ascending: true })

  return NextResponse.json(data ?? [])
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const { home_team, away_team, match_date, venue, stage, group_name, match_day } = body

  if (!home_team || !away_team || !match_date || !stage) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('matches')
    .insert({ home_team, away_team, match_date, venue, stage, group_name, match_day })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Error al crear partido' }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await req.json()
  await supabaseAdmin.from('matches').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}
