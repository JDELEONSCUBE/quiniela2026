// Script de carga: 72 partidos oficiales + usuarios
// Fuente: Wikipedia / FIFA oficial (verificado jun 2026)
// Ejecutar: node scripts/seed.js

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ============================================================
// PARTIDOS OFICIALES — FASE DE GRUPOS MUNDIAL 2026
// Fechas en ISO con offset UTC
// ============================================================
const partidos = [

  // ── GRUPO A: México, Sudáfrica, Corea del Sur, Rep. Checa ──
  { home: 'México',          away: 'Sudáfrica',       date: '2026-06-11T13:00:00-06:00', venue: 'Estadio Azteca, Ciudad de México',       group: 'A', day: 1 },
  { home: 'Corea del Sur',   away: 'Rep. Checa',      date: '2026-06-11T20:00:00-06:00', venue: 'Estadio Akron, Zapopan',                 group: 'A', day: 1 },
  { home: 'Rep. Checa',      away: 'Sudáfrica',       date: '2026-06-18T12:00:00-04:00', venue: 'Mercedes-Benz Stadium, Atlanta',         group: 'A', day: 2 },
  { home: 'México',          away: 'Corea del Sur',   date: '2026-06-18T19:00:00-06:00', venue: 'Estadio Akron, Zapopan',                 group: 'A', day: 2 },
  { home: 'Rep. Checa',      away: 'México',          date: '2026-06-24T19:00:00-06:00', venue: 'Estadio Azteca, Ciudad de México',       group: 'A', day: 3 },
  { home: 'Sudáfrica',       away: 'Corea del Sur',   date: '2026-06-24T19:00:00-06:00', venue: 'Estadio BBVA, Guadalupe',                group: 'A', day: 3 },

  // ── GRUPO B: Canadá, Bosnia y Herz., Qatar, Suiza ──
  { home: 'Canadá',          away: 'Bosnia y Herz.',  date: '2026-06-12T15:00:00-04:00', venue: 'BMO Field, Toronto',                    group: 'B', day: 1 },
  { home: 'Qatar',           away: 'Suiza',           date: '2026-06-13T12:00:00-07:00', venue: 'Levi\'s Stadium, Santa Clara',           group: 'B', day: 1 },
  { home: 'Suiza',           away: 'Bosnia y Herz.',  date: '2026-06-18T12:00:00-07:00', venue: 'SoFi Stadium, Inglewood',               group: 'B', day: 2 },
  { home: 'Canadá',          away: 'Qatar',           date: '2026-06-18T15:00:00-07:00', venue: 'BC Place, Vancouver',                   group: 'B', day: 2 },
  { home: 'Suiza',           away: 'Canadá',          date: '2026-06-24T12:00:00-07:00', venue: 'BC Place, Vancouver',                   group: 'B', day: 3 },
  { home: 'Bosnia y Herz.',  away: 'Qatar',           date: '2026-06-24T12:00:00-07:00', venue: 'Lumen Field, Seattle',                  group: 'B', day: 3 },

  // ── GRUPO C: Brasil, Marruecos, Haití, Escocia ──
  { home: 'Brasil',          away: 'Marruecos',       date: '2026-06-13T18:00:00-04:00', venue: 'MetLife Stadium, East Rutherford',       group: 'C', day: 1 },
  { home: 'Haití',           away: 'Escocia',         date: '2026-06-13T21:00:00-04:00', venue: 'Gillette Stadium, Foxborough',           group: 'C', day: 1 },
  { home: 'Escocia',         away: 'Marruecos',       date: '2026-06-19T18:00:00-04:00', venue: 'Gillette Stadium, Foxborough',           group: 'C', day: 2 },
  { home: 'Brasil',          away: 'Haití',           date: '2026-06-19T20:30:00-04:00', venue: 'Lincoln Financial Field, Filadelfia',    group: 'C', day: 2 },
  { home: 'Escocia',         away: 'Brasil',          date: '2026-06-24T18:00:00-04:00', venue: 'Hard Rock Stadium, Miami Gardens',       group: 'C', day: 3 },
  { home: 'Marruecos',       away: 'Haití',           date: '2026-06-24T18:00:00-04:00', venue: 'Mercedes-Benz Stadium, Atlanta',         group: 'C', day: 3 },

  // ── GRUPO D: Estados Unidos, Paraguay, Australia, Turquía ──
  { home: 'Estados Unidos',  away: 'Paraguay',        date: '2026-06-12T18:00:00-07:00', venue: 'SoFi Stadium, Inglewood',               group: 'D', day: 1 },
  { home: 'Australia',       away: 'Turquía',         date: '2026-06-13T21:00:00-07:00', venue: 'BC Place, Vancouver',                   group: 'D', day: 1 },
  { home: 'Estados Unidos',  away: 'Australia',       date: '2026-06-19T12:00:00-07:00', venue: 'Lumen Field, Seattle',                  group: 'D', day: 2 },
  { home: 'Turquía',         away: 'Paraguay',        date: '2026-06-19T20:00:00-07:00', venue: 'Levi\'s Stadium, Santa Clara',           group: 'D', day: 2 },
  { home: 'Turquía',         away: 'Estados Unidos',  date: '2026-06-25T19:00:00-07:00', venue: 'SoFi Stadium, Inglewood',               group: 'D', day: 3 },
  { home: 'Paraguay',        away: 'Australia',       date: '2026-06-25T19:00:00-07:00', venue: 'Levi\'s Stadium, Santa Clara',           group: 'D', day: 3 },

  // ── GRUPO E: Alemania, Curazao, Costa de Marfil, Ecuador ──
  { home: 'Alemania',        away: 'Curazao',         date: '2026-06-14T12:00:00-05:00', venue: 'NRG Stadium, Houston',                  group: 'E', day: 1 },
  { home: 'Costa de Marfil', away: 'Ecuador',         date: '2026-06-14T19:00:00-04:00', venue: 'Lincoln Financial Field, Filadelfia',   group: 'E', day: 1 },
  { home: 'Alemania',        away: 'Costa de Marfil', date: '2026-06-20T16:00:00-04:00', venue: 'BMO Field, Toronto',                    group: 'E', day: 2 },
  { home: 'Ecuador',         away: 'Curazao',         date: '2026-06-20T19:00:00-05:00', venue: 'Arrowhead Stadium, Kansas City',        group: 'E', day: 2 },
  { home: 'Curazao',         away: 'Costa de Marfil', date: '2026-06-25T16:00:00-04:00', venue: 'Lincoln Financial Field, Filadelfia',   group: 'E', day: 3 },
  { home: 'Ecuador',         away: 'Alemania',        date: '2026-06-25T16:00:00-04:00', venue: 'MetLife Stadium, East Rutherford',      group: 'E', day: 3 },

  // ── GRUPO F: Países Bajos, Japón, Suecia, Túnez ──
  { home: 'Países Bajos',    away: 'Japón',           date: '2026-06-14T15:00:00-05:00', venue: 'AT&T Stadium, Arlington',               group: 'F', day: 1 },
  { home: 'Suecia',          away: 'Túnez',           date: '2026-06-14T20:00:00-06:00', venue: 'Estadio BBVA, Guadalupe',               group: 'F', day: 1 },
  { home: 'Países Bajos',    away: 'Suecia',          date: '2026-06-20T12:00:00-05:00', venue: 'NRG Stadium, Houston',                  group: 'F', day: 2 },
  { home: 'Túnez',           away: 'Japón',           date: '2026-06-20T22:00:00-06:00', venue: 'Estadio BBVA, Guadalupe',               group: 'F', day: 2 },
  { home: 'Japón',           away: 'Suecia',          date: '2026-06-25T18:00:00-05:00', venue: 'AT&T Stadium, Arlington',               group: 'F', day: 3 },
  { home: 'Túnez',           away: 'Países Bajos',    date: '2026-06-25T18:00:00-05:00', venue: 'Arrowhead Stadium, Kansas City',        group: 'F', day: 3 },

  // ── GRUPO G: Bélgica, Egipto, Irán, Nueva Zelanda ──
  { home: 'Bélgica',         away: 'Egipto',          date: '2026-06-15T15:00:00-07:00', venue: 'SoFi Stadium, Inglewood',               group: 'G', day: 1 },
  { home: 'Irán',            away: 'Nueva Zelanda',   date: '2026-06-15T19:00:00-07:00', venue: 'Lumen Field, Seattle',                  group: 'G', day: 1 },
  { home: 'Bélgica',         away: 'Irán',            date: '2026-06-21T12:00:00-07:00', venue: 'BC Place, Vancouver',                   group: 'G', day: 2 },
  { home: 'Nueva Zelanda',   away: 'Egipto',          date: '2026-06-21T16:00:00-07:00', venue: 'Lumen Field, Seattle',                  group: 'G', day: 2 },
  { home: 'Egipto',          away: 'Irán',            date: '2026-06-26T15:00:00-07:00', venue: 'SoFi Stadium, Inglewood',               group: 'G', day: 3 },
  { home: 'Nueva Zelanda',   away: 'Bélgica',         date: '2026-06-26T15:00:00-07:00', venue: 'BC Place, Vancouver',                   group: 'G', day: 3 },

  // ── GRUPO H: España, Cabo Verde, Arabia Saudita, Uruguay ──
  { home: 'España',          away: 'Cabo Verde',      date: '2026-06-15T15:00:00-04:00', venue: 'Mercedes-Benz Stadium, Atlanta',        group: 'H', day: 1 },
  { home: 'Arabia Saudita',  away: 'Uruguay',         date: '2026-06-15T19:00:00-04:00', venue: 'Hard Rock Stadium, Miami Gardens',      group: 'H', day: 1 },
  { home: 'España',          away: 'Arabia Saudita',  date: '2026-06-21T15:00:00-04:00', venue: 'Mercedes-Benz Stadium, Atlanta',        group: 'H', day: 2 },
  { home: 'Uruguay',         away: 'Cabo Verde',      date: '2026-06-21T19:00:00-04:00', venue: 'Hard Rock Stadium, Miami Gardens',      group: 'H', day: 2 },
  { home: 'Cabo Verde',      away: 'Arabia Saudita',  date: '2026-06-26T18:00:00-05:00', venue: 'NRG Stadium, Houston',                  group: 'H', day: 3 },
  { home: 'Uruguay',         away: 'España',          date: '2026-06-26T19:00:00-06:00', venue: 'Estadio Akron, Zapopan',                group: 'H', day: 3 },

  // ── GRUPO I: Francia, Senegal, Irak, Noruega ──
  { home: 'Francia',         away: 'Senegal',         date: '2026-06-16T15:00:00-04:00', venue: 'MetLife Stadium, East Rutherford',      group: 'I', day: 1 },
  { home: 'Irak',            away: 'Noruega',         date: '2026-06-16T18:00:00-04:00', venue: 'Gillette Stadium, Foxborough',          group: 'I', day: 1 },
  { home: 'Francia',         away: 'Irak',            date: '2026-06-22T17:00:00-04:00', venue: 'Lincoln Financial Field, Filadelfia',   group: 'I', day: 2 },
  { home: 'Noruega',         away: 'Senegal',         date: '2026-06-22T20:00:00-04:00', venue: 'MetLife Stadium, East Rutherford',      group: 'I', day: 2 },
  { home: 'Noruega',         away: 'Francia',         date: '2026-06-26T15:00:00-04:00', venue: 'Gillette Stadium, Foxborough',          group: 'I', day: 3 },
  { home: 'Senegal',         away: 'Irak',            date: '2026-06-26T15:00:00-04:00', venue: 'BMO Field, Toronto',                    group: 'I', day: 3 },

  // ── GRUPO J: Argentina, Argelia, Austria, Jordania ──
  { home: 'Argentina',       away: 'Argelia',         date: '2026-06-16T20:00:00-05:00', venue: 'Arrowhead Stadium, Kansas City',        group: 'J', day: 1 },
  { home: 'Austria',         away: 'Jordania',        date: '2026-06-16T21:00:00-07:00', venue: 'Levi\'s Stadium, Santa Clara',           group: 'J', day: 1 },
  { home: 'Argentina',       away: 'Austria',         date: '2026-06-22T12:00:00-05:00', venue: 'AT&T Stadium, Arlington',               group: 'J', day: 2 },
  { home: 'Jordania',        away: 'Argelia',         date: '2026-06-22T16:00:00-05:00', venue: 'NRG Stadium, Houston',                  group: 'J', day: 2 },
  { home: 'Argelia',         away: 'Austria',         date: '2026-06-27T16:00:00-05:00', venue: 'AT&T Stadium, Arlington',               group: 'J', day: 3 },
  { home: 'Jordania',        away: 'Argentina',       date: '2026-06-27T16:00:00-05:00', venue: 'Arrowhead Stadium, Kansas City',        group: 'J', day: 3 },

  // ── GRUPO K: Portugal, R.D. Congo, Uzbekistán, Colombia ──
  { home: 'Portugal',        away: 'R.D. Congo',      date: '2026-06-17T18:00:00-05:00', venue: 'NRG Stadium, Houston',                  group: 'K', day: 1 },
  { home: 'Uzbekistán',      away: 'Colombia',        date: '2026-06-17T19:00:00-06:00', venue: 'Estadio Azteca, Ciudad de México',      group: 'K', day: 1 },
  { home: 'Portugal',        away: 'Uzbekistán',      date: '2026-06-23T18:00:00-05:00', venue: 'NRG Stadium, Houston',                  group: 'K', day: 2 },
  { home: 'Colombia',        away: 'R.D. Congo',      date: '2026-06-23T19:00:00-06:00', venue: 'Estadio Akron, Zapopan',               group: 'K', day: 2 },
  { home: 'Colombia',        away: 'Portugal',        date: '2026-06-27T17:00:00-04:00', venue: 'Hard Rock Stadium, Miami Gardens',      group: 'K', day: 3 },
  { home: 'R.D. Congo',      away: 'Uzbekistán',      date: '2026-06-27T17:00:00-04:00', venue: 'Mercedes-Benz Stadium, Atlanta',        group: 'K', day: 3 },

  // ── GRUPO L: Inglaterra, Croacia, Ghana, Panamá ──
  { home: 'Inglaterra',      away: 'Croacia',         date: '2026-06-17T15:00:00-05:00', venue: 'AT&T Stadium, Arlington',               group: 'L', day: 1 },
  { home: 'Ghana',           away: 'Panamá',          date: '2026-06-17T19:00:00-04:00', venue: 'BMO Field, Toronto',                    group: 'L', day: 1 },
  { home: 'Inglaterra',      away: 'Ghana',           date: '2026-06-23T16:00:00-04:00', venue: 'Gillette Stadium, Foxborough',          group: 'L', day: 2 },
  { home: 'Panamá',          away: 'Croacia',         date: '2026-06-23T19:00:00-04:00', venue: 'BMO Field, Toronto',                    group: 'L', day: 2 },
  { home: 'Panamá',          away: 'Inglaterra',      date: '2026-06-27T17:00:00-04:00', venue: 'MetLife Stadium, East Rutherford',      group: 'L', day: 3 },
  { home: 'Croacia',         away: 'Ghana',           date: '2026-06-27T17:00:00-04:00', venue: 'Lincoln Financial Field, Filadelfia',   group: 'L', day: 3 },
]

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
  console.log('🚀 Cargando datos oficiales del Mundial 2026...\n')

  // Borrar partidos existentes de grupos
  const { error: delError } = await supabase
    .from('matches')
    .delete()
    .eq('stage', 'group')
  if (delError) console.warn('⚠️  Error limpiando:', delError.message)
  else console.log('🗑️  Partidos anteriores eliminados.')

  // Insertar partidos
  const rows = partidos.map(p => ({
    home_team:  p.home,
    away_team:  p.away,
    match_date: p.date,
    venue:      p.venue,
    stage:      'group',
    group_name: p.group,
    match_day:  p.day,
    status:     'scheduled',
  }))

  const { data, error } = await supabase.from('matches').insert(rows).select('id')
  if (error) { console.error('❌ Error insertando:', error.message); process.exit(1) }
  console.log(`✅ ${data.length} partidos cargados (12 grupos × 6 partidos = 72)\n`)

  // Resumen por grupo
  const grupos = [...new Set(partidos.map(p => p.group))].sort()
  for (const g of grupos) {
    const equipos = [...new Set(partidos.filter(p => p.group === g).flatMap(p => [p.home, p.away]))]
    console.log(`  Grupo ${g}: ${equipos.join(' · ')}`)
  }

  // Usuarios
  console.log('\n👥 Creando usuarios...')
  for (const u of usuarios) {
    const { data: existe } = await supabase.from('users').select('id').eq('username', u.username).single()
    if (existe) { console.log(`  ⏭️  @${u.username} ya existe.`); continue }
    const password_hash = await bcrypt.hash(u.password, 10)
    const { error } = await supabase.from('users').insert({ username: u.username, display_name: u.display_name, password_hash, is_admin: false })
    if (error) console.error(`  ❌ Error: ${error.message}`)
    else console.log(`  ✅ ${u.display_name} → @${u.username} | contraseña: ${u.password}`)
  }

  console.log('\n✅ ¡Todo listo! La quiniela está configurada con los partidos oficiales del Mundial 2026.')
}

main().catch(console.error)
