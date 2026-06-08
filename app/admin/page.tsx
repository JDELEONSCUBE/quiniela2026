import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const session = await getSession()
  if (!session?.is_admin) redirect('/')

  const [
    { count: userCount },
    { count: matchCount },
    { count: finishedCount },
    { count: pendingPreds },
  ] = await Promise.all([
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('is_admin', false),
    supabaseAdmin.from('matches').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'finished'),
    supabaseAdmin.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'scheduled'),
  ])

  const stats = [
    { label: 'Participantes', value: userCount ?? 0, icon: '👥', href: '/admin/usuarios' },
    { label: 'Partidos totales', value: matchCount ?? 0, icon: '⚽', href: '/admin/partidos' },
    { label: 'Partidos finalizados', value: finishedCount ?? 0, icon: '✅', href: '/admin/resultados' },
    { label: 'Partidos pendientes', value: pendingPreds ?? 0, icon: '⏳', href: '/admin/resultados' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-fifa-blue">👑 Panel de Administración</h1>
        <p className="text-gray-500 text-sm">Gestiona la Quiniela Mundial 2026</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <Link key={s.label} href={s.href} className="card hover:shadow-md transition-shadow text-center">
            <div className="text-3xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-fifa-blue">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/admin/usuarios" className="card hover:shadow-md transition-shadow group">
          <div className="text-2xl mb-2">👥</div>
          <h3 className="font-bold text-gray-800 group-hover:text-fifa-blue">Gestionar Usuarios</h3>
          <p className="text-sm text-gray-500 mt-1">Crear, editar o eliminar participantes y cambiar contraseñas.</p>
        </Link>

        <Link href="/admin/partidos" className="card hover:shadow-md transition-shadow group">
          <div className="text-2xl mb-2">📅</div>
          <h3 className="font-bold text-gray-800 group-hover:text-fifa-blue">Gestionar Partidos</h3>
          <p className="text-sm text-gray-500 mt-1">Agregar o eliminar partidos del torneo (grupos y eliminatorias).</p>
        </Link>

        <Link href="/admin/resultados" className="card hover:shadow-md transition-shadow group">
          <div className="text-2xl mb-2">🏁</div>
          <h3 className="font-bold text-gray-800 group-hover:text-fifa-blue">Ingresar Resultados</h3>
          <p className="text-sm text-gray-500 mt-1">Registra el marcador final para calcular puntos automáticamente.</p>
        </Link>
      </div>
    </div>
  )
}
