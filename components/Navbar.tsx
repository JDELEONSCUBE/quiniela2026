'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { SessionUser } from '@/lib/auth'
import { useTheme } from './ThemeProvider'
import { useState } from 'react'

interface Props { user: SessionUser | null }

export default function Navbar({ user }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) => pathname === href

  const linkClass = (href: string) =>
    `px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
      isActive(href)
        ? 'bg-scube-cyan/20 text-scube-cyan border border-scube-cyan/30'
        : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/5'
    }`

  const navLinks = [
    { href: '/', label: '📊 Tabla' },
    ...(user ? [{ href: '/pronosticos', label: '⚽ Pronósticos' }] : []),
    { href: '/instrucciones', label: '📋 Reglas' },
    ...(user?.is_admin ? [{ href: '/admin', label: '⚙️ Admin' }] : []),
  ]

  return (
    <nav className="sticky top-0 z-50 border-b backdrop-blur-md" style={{ borderColor: 'var(--border)', backgroundColor: 'color-mix(in srgb, var(--surface) 90%, transparent)' }}>
      {/* Top accent line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-scube-cyan to-transparent opacity-60" />

      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img src="/scube-logo.svg" alt="Scube" className="h-8 w-auto" />
          <div className="hidden sm:block">
            <div className="text-xs font-mono font-bold text-scube-cyan tracking-widest opacity-80">MUNDIAL 2026</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} className={linkClass(l.href)}>{l.label}</Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="p-2 rounded-lg transition-all hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text)]"
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
              </svg>
            )}
          </button>

          {/* User */}
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)] font-mono">
                {user.is_admin ? '👑' : '▸'} {user.username}
              </span>
              <button onClick={handleLogout} className="btn-danger text-xs py-1 px-3">Salir</button>
            </div>
          ) : (
            <Link href="/login" className="btn-primary py-1.5 px-4 hidden md:block">Entrar</Link>
          )}

          {/* Mobile burger */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 text-[var(--text-muted)]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t px-4 py-3 space-y-1" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} className={`block ${linkClass(l.href)}`} onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
          <div className="pt-2 border-t mt-2" style={{ borderColor: 'var(--border)' }}>
            {user ? (
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)] font-mono">{user.is_admin ? '👑' : '▸'} {user.username}</span>
                <button onClick={handleLogout} className="btn-danger text-xs py-1 px-3">Salir</button>
              </div>
            ) : (
              <Link href="/login" className="btn-primary w-full text-center block" onClick={() => setMenuOpen(false)}>Entrar</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
