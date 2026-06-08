import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import AdminUsersClient from '@/components/admin/AdminUsersClient'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const session = await getSession()
  if (!session?.is_admin) redirect('/')

  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, username, display_name, is_admin, created_at')
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <a href="/admin" className="text-gray-400 hover:text-gray-600">← Admin</a>
        <h1 className="text-2xl font-bold text-fifa-blue">👥 Gestionar Usuarios</h1>
      </div>
      <AdminUsersClient initialUsers={users ?? []} currentUserId={session.id} />
    </div>
  )
}
