'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Error al iniciar sesión'); setLoading(false); return }
    router.push('/'); router.refresh()
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-8">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-scube-cyan/5 rounded-full blur-3xl"/>
      </div>

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="card-cyber p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <img src="/scube-logo.svg" alt="Scube" className="h-12 mx-auto mb-4"/>
            <h1 className="text-xl font-bold text-[var(--text)]">Quiniela Mundial 2026</h1>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-mono tracking-wide">INGRESA TUS CREDENCIALES</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="input font-mono"
                placeholder="tu_usuario"
                required autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="border rounded-lg px-3 py-2 text-sm" style={{ borderColor: 'rgba(255,100,100,0.3)', background: 'rgba(255,100,100,0.08)', color: '#ff6b6b' }}>
                ⚠ {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-2.5 mt-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Verificando...
                </span>
              ) : '→ Entrar'}
            </button>
          </form>

          <p className="text-center text-xs text-[var(--text-muted)] mt-6">
            ¿No tienes cuenta? Pide al administrador que te cree una.
          </p>
        </div>

        {/* Bottom decoration */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-scube-cyan/40 to-transparent mt-0 rounded-b-xl"/>
      </div>
    </div>
  )
}
