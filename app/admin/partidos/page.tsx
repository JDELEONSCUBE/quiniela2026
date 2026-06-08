import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { STAGE_LABELS, FLAGS } from '@/lib/matches-data'
import AdminMatchesClient from '@/components/admin/AdminMatchesClient'

export const dynamic = 'force-dynamic'

export default async function AdminMatchesPage() {
  const session = await getSession()
  if (!session?.is_admin) redirect('/')

  const { data: matches } = await supabaseAdmin
    .from('matches')
    .select('*')
    .order('match_date', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <a href="/admin" className="text-gray-400 hover:text-gray-600">← Admin</a>
        <h1 className="text-2xl font-bold text-fifa-blue">📅 Gestionar Partidos</h1>
      </div>
      <AdminMatchesClient initialMatches={matches ?? []} stageLabels={STAGE_LABELS} flags={FLAGS} />
    </div>
  )
}
