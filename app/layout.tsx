import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { getSession } from '@/lib/auth'
import { ThemeProvider } from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Quiniela Mundial 2026 ⚽ | Scube',
  description: 'Haz tus pronósticos para el Mundial FIFA 2026',
  viewport: 'width=device-width, initial-scale=1',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} scanline bg-[var(--bg)] text-[var(--text)] min-h-screen flex flex-col`}>
        <ThemeProvider>
          <Navbar user={session} />
          <main className="flex-1">{children}</main>
          <footer className="border-t py-4 px-4 text-center text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <img src="/scube-logo.svg" alt="Scube" className="h-5 opacity-60" />
              <span className="dark:text-scube-muted">Quiniela Mundial 2026 — Powered by Scube Cybersecurity</span>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
