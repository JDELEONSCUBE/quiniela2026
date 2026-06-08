// Script de carga inicial: partidos y usuarios
// Ejecutar: node scripts/seed.js

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ============================================================
// GRUPOS - Mundial 2026 (Draw: 5 dic 2024)
// ============================================================
const grupos = {
  A: ['Estados Unidos', 'Panamá', 'Bolivia', 'Uruguay'],
  B: ['México', 'Jamaica', 'Venezuela', 'Ecuador'],
  C: ['Canadá', 'Honduras', 'Marruecos', 'Bélgica'],
  D: ['Brasil', 'Japón', 'Croacia', 'Mali'],
  E: ['Argentina', 'Chile', 'Albania', 'Ucrania'],
  F: ['España', 'Serbia', 'Países Bajos', 'Australia'],
  G: ['Francia', 'Portugal', 'Colombia', 'Arabia Saudita'],
  H: ['Alemania', 'Corea del Sur', 'Costa Rica', 'Camerún'],
  I: ['Inglaterra', 'Senegal', 'Paraguay', 'Eslovenia'],
  J: ['Polonia', 'Turquía', 'Egipto', 'Costa de Marfil'],
  K: ['Irán', 'Qatar', 'Ghana', 'Suiza'],
  L: ['Nueva Zelanda', 'Eslovaquia', 'Perú', 'Kenia'],
}

// Fechas aproximadas por grupo y jornada (hora México/CST = UTC-6)
// Jornada 1: 11-14 jun | Jornada 2: 15-19 jun | Jornada 3: 22-26 jun
const cronograma = {
  A: {
    1: [['2026-06-11T20:00:00-06:00', 'SoFi Stadium, Los Ángeles'], ['2026-06-12T14:00:00-06:00', 'Estadio Azteca, Ciudad de México']],
    2: [['2026-06-15T17:00:00-06:00', 'MetLife Stadium, Nueva York'], ['2026-06-15T20:00:00-06:00', 'AT&T Stadium, Dallas']],
    3: [['2026-06-22T15:00:00-06:00', 'Levi\'s Stadium, San Francisco'], ['2026-06-22T15:00:00-06:00', 'Arrowhead Stadium, Kansas City']],
  },
  B: {
    1: [['2026-06-11T17:00:00-06:00', 'Estadio Azteca, Ciudad de México'], ['2026-06-12T17:00:00-06:00', 'Estadio Akron, Guadalajara']],
    2: [['2026-06-16T14:00:00-06:00', 'NRG Stadium, Houston'], ['2026-06-16T17:00:00-06:00', 'Rose Bowl, Los Ángeles']],
    3: [['2026-06-23T15:00:00-06:00', 'Estadio Monterrey, Monterrey'], ['2026-06-23T15:00:00-06:00', 'MetLife Stadium, Nueva York']],
  },
  C: {
    1: [['2026-06-12T20:00:00-06:00', 'BC Place, Vancouver'], ['2026-06-13T14:00:00-06:00', 'Lincoln Financial Field, Filadelfia']],
    2: [['2026-06-17T14:00:00-06:00', 'Estadio Azteca, Ciudad de México'], ['2026-06-17T17:00:00-06:00', 'Commonwealth Stadium, Edmonton']],
    3: [['2026-06-24T15:00:00-06:00', 'Hard Rock Stadium, Miami'], ['2026-06-24T15:00:00-06:00', 'BMO Field, Toronto']],
  },
  D: {
    1: [['2026-06-12T11:00:00-06:00', 'SoFi Stadium, Los Ángeles'], ['2026-06-13T17:00:00-06:00', 'Lumen Field, Seattle']],
    2: [['2026-06-16T20:00:00-06:00', 'SoFi Stadium, Los Ángeles'], ['2026-06-17T20:00:00-06:00', 'Rose Bowl, Los Ángeles']],
    3: [['2026-06-24T12:00:00-06:00', 'AT&T Stadium, Dallas'], ['2026-06-24T12:00:00-06:00', 'NRG Stadium, Houston']],
  },
  E: {
    1: [['2026-06-13T11:00:00-06:00', 'MetLife Stadium, Nueva York'], ['2026-06-14T14:00:00-06:00', 'Hard Rock Stadium, Miami']],
    2: [['2026-06-17T11:00:00-06:00', 'Allegiant Stadium, Las Vegas'], ['2026-06-18T14:00:00-06:00', 'Lincoln Financial Field, Filadelfia']],
    3: [['2026-06-25T12:00:00-06:00', 'Gillette Stadium, Boston'], ['2026-06-25T12:00:00-06:00', 'Soldier Field, Chicago']],
  },
  F: {
    1: [['2026-06-13T14:00:00-06:00', 'AT&T Stadium, Dallas'], ['2026-06-14T17:00:00-06:00', 'Arrowhead Stadium, Kansas City']],
    2: [['2026-06-18T17:00:00-06:00', 'Hard Rock Stadium, Miami'], ['2026-06-18T20:00:00-06:00', 'SoFi Stadium, Los Ángeles']],
    3: [['2026-06-25T15:00:00-06:00', 'AT&T Stadium, Dallas'], ['2026-06-25T15:00:00-06:00', 'Lumen Field, Seattle']],
  },
  G: {
    1: [['2026-06-13T20:00:00-06:00', 'NRG Stadium, Houston'], ['2026-06-14T11:00:00-06:00', 'Levi\'s Stadium, San Francisco']],
    2: [['2026-06-18T11:00:00-06:00', 'MetLife Stadium, Nueva York'], ['2026-06-19T14:00:00-06:00', 'Allegiant Stadium, Las Vegas']],
    3: [['2026-06-26T12:00:00-06:00', 'SoFi Stadium, Los Ángeles'], ['2026-06-26T12:00:00-06:00', 'Rose Bowl, Los Ángeles']],
  },
  H: {
    1: [['2026-06-14T20:00:00-06:00', 'Gillette Stadium, Boston'], ['2026-06-15T11:00:00-06:00', 'Soldier Field, Chicago']],
    2: [['2026-06-19T17:00:00-06:00', 'Lumen Field, Seattle'], ['2026-06-19T20:00:00-06:00', 'AT&T Stadium, Dallas']],
    3: [['2026-06-26T15:00:00-06:00', 'MetLife Stadium, Nueva York'], ['2026-06-26T15:00:00-06:00', 'NRG Stadium, Houston']],
  },
  I: {
    1: [['2026-06-14T11:00:00-06:00', 'Allegiant Stadium, Las Vegas'], ['2026-06-15T14:00:00-06:00', 'Rose Bowl, Los Ángeles']],
    2: [['2026-06-19T11:00:00-06:00', 'Hard Rock Stadium, Miami'], ['2026-06-20T14:00:00-06:00', 'Lincoln Financial Field, Filadelfia']],
    3: [['2026-06-27T12:00:00-06:00', 'Levi\'s Stadium, San Francisco'], ['2026-06-27T12:00:00-06:00', 'Gillette Stadium, Boston']],
  },
  J: {
    1: [['2026-06-14T14:00:00-06:00', 'BC Place, Vancouver'], ['2026-06-15T20:00:00-06:00', 'Arrowhead Stadium, Kansas City']],
    2: [['2026-06-20T17:00:00-06:00', 'Soldier Field, Chicago'], ['2026-06-20T20:00:00-06:00', 'BMO Field, Toronto']],
    3: [['2026-06-27T15:00:00-06:00', 'Hard Rock Stadium, Miami'], ['2026-06-27T15:00:00-06:00', 'Allegiant Stadium, Las Vegas']],
  },
  K: {
    1: [['2026-06-15T17:00:00-06:00', 'Lumen Field, Seattle'], ['2026-06-15T11:00:00-06:00', 'Commonwealth Stadium, Edmonton']],
    2: [['2026-06-20T11:00:00-06:00', 'Arrowhead Stadium, Kansas City'], ['2026-06-21T14:00:00-06:00', 'SoFi Stadium, Los Ángeles']],
    3: [['2026-06-28T12:00:00-06:00', 'AT&T Stadium, Dallas'], ['2026-06-28T12:00:00-06:00', 'BC Place, Vancouver']],
  },
  L: {
    1: [['2026-06-15T14:00:00-06:00', 'Allegiant Stadium, Las Vegas'], ['2026-06-16T11:00:00-06:00', 'Gillette Stadium, Boston']],
    2: [['2026-06-21T17:00:00-06:00', 'Lincoln Financial Field, Filadelfia'], ['2026-06-21T20:00:00-06:00', 'Levi\'s Stadium, San Francisco']],
    3: [['2026-06-28T15:00:00-06:00', 'Commonwealth Stadium, Edmonton'], ['2026-06-28T15:00:00-06:00', 'Soldier Field, Chicago']],
  },
}

// ============================================================
// GENERAR PARTIDOS DE GRUPOS
// Para cada grupo: equipo 1 vs 2, 3 vs 4, 1 vs 3, 2 vs 4, 1 vs 4, 2 vs 3
// ============================================================
function generarPartidosGrupo(grupo, equipos, schedule) {
  const [e1, e2, e3, e4] = equipos
  const partidos = [
    // Jornada 1
    { home: e1, away: e2, jornada: 1, slot: 0 },
    { home: e3, away: e4, jornada: 1, slot: 1 },
    // Jornada 2
    { home: e1, away: e3, jornada: 2, slot: 0 },
    { home: e2, away: e4, jornada: 2, slot: 1 },
    // Jornada 3 (simultáneos para evitar trampa)
    { home: e1, away: e4, jornada: 3, slot: 0 },
    { home: e2, away: e3, jornada: 3, slot: 1 },
  ]

  return partidos.map(p => ({
    home_team: p.home,
    away_team: p.away,
    match_date: schedule[p.jornada][p.slot][0],
    venue: schedule[p.jornada][p.slot][1],
    stage: 'group',
    group_name: grupo,
    match_day: p.jornada,
    status: 'scheduled',
  }))
}

// ============================================================
// USUARIOS
// ============================================================
const usuarios = [
  { username: 'andre',  display_name: 'Andre',  password: 'andre123' },
  { username: 'marlen', display_name: 'Marlen', password: 'marlen123' },
  { username: 'lis',    display_name: 'Lis',    password: 'lis123' },
]

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('🚀 Iniciando carga de datos...\n')

  // --- Borrar partidos de grupos anteriores ---
  const { error: delError } = await supabase
    .from('matches')
    .delete()
    .eq('stage', 'group')
  if (delError) console.warn('⚠️  Error limpiando partidos:', delError.message)
  else console.log('🗑️  Partidos anteriores eliminados.')

  // --- Insertar todos los partidos de grupos ---
  const todosLosPartidos = []
  for (const [grupo, equipos] of Object.entries(grupos)) {
    const schedule = cronograma[grupo]
    const partidos = generarPartidosGrupo(grupo, equipos, schedule)
    todosLosPartidos.push(...partidos)
  }

  const { error: insertError, data: insertData } = await supabase
    .from('matches')
    .insert(todosLosPartidos)
    .select('id')

  if (insertError) {
    console.error('❌ Error insertando partidos:', insertError.message)
  } else {
    console.log(`✅ ${insertData.length} partidos de grupos cargados (12 grupos × 6 partidos = 72)`)
  }

  // --- Crear usuarios ---
  console.log('\n👥 Creando usuarios...')
  for (const u of usuarios) {
    // Verificar si ya existe
    const { data: existe } = await supabase
      .from('users')
      .select('id')
      .eq('username', u.username)
      .single()

    if (existe) {
      console.log(`  ⏭️  ${u.display_name} (@${u.username}) ya existe, omitiendo.`)
      continue
    }

    const password_hash = await bcrypt.hash(u.password, 10)
    const { error } = await supabase
      .from('users')
      .insert({ username: u.username, display_name: u.display_name, password_hash, is_admin: false })

    if (error) console.error(`  ❌ Error creando ${u.username}:`, error.message)
    else console.log(`  ✅ ${u.display_name} → usuario: ${u.username} | contraseña: ${u.password}`)
  }

  console.log('\n🏁 ¡Listo! Resumen:')
  console.log('   - 72 partidos de fase de grupos cargados')
  console.log('   - Usuarios: Andre (andre123), Marlen (marlen123), Lis (lis123)')
  console.log('   - Cambia las contraseñas desde Admin → Usuarios cuando quieras\n')
}

main().catch(console.error)
