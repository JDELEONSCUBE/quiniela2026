'use client'
import { useState } from 'react'

interface User {
  id: string
  username: string
  display_name: string
  is_admin: boolean
  created_at: string
}

interface Props {
  initialUsers: User[]
  currentUserId: string
}

export default function AdminUsersClient({ initialUsers, currentUserId }: Props) {
  const [users, setUsers] = useState(initialUsers)
  const [form, setForm] = useState({ username: '', display_name: '', password: '', is_admin: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [changePwId, setChangePwId] = useState<string | null>(null)
  const [newPw, setNewPw] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      setUsers(prev => [...prev, data])
      setForm({ username: '', display_name: '', password: '', is_admin: false })
      setSuccess(`Usuario "${data.username}" creado exitosamente.`)
    } else {
      setError(data.error)
    }
    setLoading(false)
  }

  async function handleDelete(id: string, username: string) {
    if (!confirm(`¿Eliminar a "${username}"? Se borrarán también sus pronósticos.`)) return
    await fetch('/api/admin/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  async function handleChangePassword(id: string) {
    if (!newPw || newPw.length < 4) { setError('La contraseña debe tener al menos 4 caracteres'); return }
    await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, password: newPw }) })
    setChangePwId(null); setNewPw(''); setSuccess('Contraseña actualizada.')
  }

  return (
    <div className="space-y-6">
      {/* Create user form */}
      <div className="card">
        <h2 className="font-bold text-gray-800 mb-4">Crear nuevo participante</h2>
        <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Usuario (para login)</label>
            <input className="input" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="juanperez" required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nombre mostrado</label>
            <input className="input" value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} placeholder="Juan Pérez" required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Contraseña inicial</label>
            <input className="input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="mínimo 4 caracteres" required minLength={4} />
          </div>
          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={form.is_admin} onChange={e => setForm({ ...form, is_admin: e.target.checked })} className="rounded" />
              Es administrador
            </label>
            <button type="submit" className="btn-primary ml-auto" disabled={loading}>
              {loading ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </form>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
      </div>

      {/* User list */}
      <div className="card">
        <h2 className="font-bold text-gray-800 mb-4">Participantes ({users.filter(u => !u.is_admin).length})</h2>
        <div className="divide-y divide-gray-100">
          {users.map(u => (
            <div key={u.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <span className="font-medium">{u.display_name}</span>
                <span className="text-gray-400 text-sm ml-2">@{u.username}</span>
                {u.is_admin && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">admin</span>}
              </div>
              {u.id !== currentUserId && (
                <div className="flex items-center gap-2">
                  {changePwId === u.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        value={newPw}
                        onChange={e => setNewPw(e.target.value)}
                        placeholder="Nueva contraseña"
                        className="input w-36 text-sm py-1"
                      />
                      <button onClick={() => handleChangePassword(u.id)} className="text-xs bg-green-600 text-white px-2 py-1 rounded">Guardar</button>
                      <button onClick={() => setChangePwId(null)} className="text-xs text-gray-500">Cancelar</button>
                    </div>
                  ) : (
                    <button onClick={() => { setChangePwId(u.id); setNewPw('') }} className="text-xs text-blue-600 hover:underline">
                      Cambiar contraseña
                    </button>
                  )}
                  <button onClick={() => handleDelete(u.id, u.username)} className="text-xs text-red-500 hover:text-red-700">
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
