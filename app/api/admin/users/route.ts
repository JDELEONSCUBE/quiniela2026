import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

async function requireAdmin() {
  const session = await getSession()
  if (!session?.is_admin) return null
  return session
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('users')
    .select('id, username, display_name, is_admin, created_at')
    .order('created_at', { ascending: true })

  return NextResponse.json(data ?? [])
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { username, display_name, password, is_admin } = await req.json()

  if (!username || !display_name || !password) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
  }

  const password_hash = await bcrypt.hash(password, 10)

  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({ username: username.toLowerCase().trim(), display_name, password_hash, is_admin: !!is_admin })
    .select('id, username, display_name, is_admin')
    .single()

  if (error?.code === '23505') {
    return NextResponse.json({ error: 'El nombre de usuario ya existe' }, { status: 409 })
  }
  if (error) return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  await supabaseAdmin.from('users').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id, password } = await req.json()
  if (!id || !password) return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })

  const password_hash = await bcrypt.hash(password, 10)
  await supabaseAdmin.from('users').update({ password_hash }).eq('id', id)

  return NextResponse.json({ ok: true })
}
