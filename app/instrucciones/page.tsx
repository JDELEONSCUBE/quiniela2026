export default function InstruccionesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neon">📋 Instrucciones y Reglas</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">Todo lo que necesitas saber para ganar la Quiniela Mundial 2026</p>
      </div>

      {/* Cómo participar */}
      <div className="card-cyber">
        <div className="section-header rounded-t-xl -mx-4 -mt-4 mb-4">🚀 ¿Cómo participar?</div>
        <ol className="space-y-3 text-sm text-[var(--text)]">
          {[
            'El administrador te crea un usuario y contraseña.',
            'Inicia sesión con tus datos en el botón "Entrar".',
            'Ve a "Pronósticos" y registra tu marcador para cada partido.',
            'Puedes modificar tus pronósticos hasta 1 hora antes de que el partido empiece.',
            'Una vez que el partido inicia, tus pronósticos quedan bloqueados automáticamente.',
            'Los resultados se actualizan solos — ¡no necesitas hacer nada más!',
          ].map((step, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="shrink-0 w-6 h-6 rounded-full border text-xs font-bold flex items-center justify-center font-mono"
                style={{ borderColor: 'var(--primary)', color: 'var(--primary)', background: 'var(--primary-glow)' }}>
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Puntuación */}
      <div className="card-cyber">
        <div className="section-header rounded-t-xl -mx-4 -mt-4 mb-4">🏅 Sistema de Puntuación</div>

        <h3 className="font-semibold text-sm mb-3 text-[var(--text-muted)] uppercase tracking-wide">Fase de Grupos</h3>
        <div className="space-y-2 mb-6">
          {[
            { pts: 3, label: 'Marcador Exacto', desc: 'Predices el marcador correcto exacto (ej. 2-1 y termina 2-1)', color: 'rgba(255,215,0,0.1)', border: 'rgba(255,215,0,0.3)', text: '#FFD700' },
            { pts: 1, label: 'Resultado Correcto', desc: 'Predices quién gana o que hay empate (pero no el marcador exacto)', color: 'rgba(0,255,136,0.08)', border: 'rgba(0,255,136,0.25)', text: '#00C878' },
            { pts: 0, label: 'Resultado Incorrecto', desc: 'Predices mal el resultado del partido', color: 'rgba(255,102,0,0.08)', border: 'rgba(255,102,0,0.25)', text: '#FF6600' },
          ].map(r => (
            <div key={r.pts} className="flex items-center justify-between rounded-lg px-4 py-3 border" style={{ background: r.color, borderColor: r.border }}>
              <div>
                <div className="font-semibold text-sm" style={{ color: r.text }}>{r.label}</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">{r.desc}</div>
              </div>
              <span className="text-2xl font-black font-mono ml-4 shrink-0" style={{ color: r.text }}>{r.pts}</span>
            </div>
          ))}
        </div>

        <h3 className="font-semibold text-sm mb-3 text-[var(--text-muted)] uppercase tracking-wide">Fase Eliminatoria</h3>
        <p className="text-xs text-[var(--text-muted)] mb-3">Se pronostica el resultado al final del tiempo reglamentario (90 min). No se pronostican penaltis.</p>
        <div className="space-y-2">
          {[
            { pts: 5, label: 'Marcador Exacto (90 min)', desc: 'Aciertas el marcador exacto al terminar el tiempo reglamentario', color: 'rgba(255,215,0,0.1)', border: 'rgba(255,215,0,0.3)', text: '#FFD700' },
            { pts: 2, label: 'Ganador Correcto', desc: 'Predices qué equipo avanza aunque no el marcador exacto', color: 'rgba(0,255,136,0.08)', border: 'rgba(0,255,136,0.25)', text: '#00C878' },
          ].map(r => (
            <div key={r.pts} className="flex items-center justify-between rounded-lg px-4 py-3 border" style={{ background: r.color, borderColor: r.border }}>
              <div>
                <div className="font-semibold text-sm" style={{ color: r.text }}>{r.label}</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">{r.desc}</div>
              </div>
              <span className="text-2xl font-black font-mono ml-4 shrink-0" style={{ color: r.text }}>{r.pts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ejemplo */}
      <div className="card-cyber">
        <div className="section-header rounded-t-xl -mx-4 -mt-4 mb-4">💡 Ejemplo</div>
        <div className="rounded-lg p-4 text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="font-semibold mb-3">Partido: 🇲🇽 México vs Ecuador 🇪🇨 — Resultado real: <span className="text-neon font-mono">2 - 1</span></p>
          <div className="space-y-2">
            <div className="flex items-center justify-between"><span className="text-[var(--text-muted)]">Pronósticas <span className="font-mono text-[var(--text)]">2 - 1</span></span><span className="badge-exact">⭐ 3 pts — exacto</span></div>
            <div className="flex items-center justify-between"><span className="text-[var(--text-muted)]">Pronósticas <span className="font-mono text-[var(--text)]">3 - 0</span></span><span className="badge-correct">✓ 1 pto — gana México ✓</span></div>
            <div className="flex items-center justify-between"><span className="text-[var(--text-muted)]">Pronósticas <span className="font-mono text-[var(--text)]">1 - 1</span></span><span className="badge-wrong">✗ 0 pts — empate ≠ victoria</span></div>
          </div>
        </div>
      </div>

      {/* Desempate */}
      <div className="card-cyber">
        <div className="section-header rounded-t-xl -mx-4 -mt-4 mb-4">⚖️ Desempate</div>
        <ol className="space-y-2 text-sm list-decimal list-inside text-[var(--text)]">
          <li>Mayor número de marcadores exactos</li>
          <li>Mayor número de resultados correctos</li>
          <li>Si persiste el empate: comparten el puesto</li>
        </ol>
      </div>

      {/* Fechas */}
      <div className="card-cyber">
        <div className="section-header rounded-t-xl -mx-4 -mt-4 mb-4">⏰ Fechas Límite</div>
        <ul className="space-y-3 text-sm">
          {[
            { icon: '✅', text: 'Puedes registrar pronósticos hasta 1 hora antes de cada partido.' },
            { icon: '🔒', text: 'Los pronósticos se bloquean automáticamente cuando el partido está por comenzar.' },
            { icon: '⚡', text: 'Los resultados se actualizan solos — los puntos aparecen minutos después de que termina cada partido.' },
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-lg shrink-0">{item.icon}</span>
              <span className="text-[var(--text)]">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
