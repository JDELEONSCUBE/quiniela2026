// Auto-sync de resultados usando api-football.com (RapidAPI)
// Free tier: 100 llamadas/día
// Registro gratis: https://rapidapi.com/api-sports/api/api-football

const API_KEY = process.env.FOOTBALL_API_KEY ?? ''
const BASE_URL = 'https://api-football-v1.p.rapidapi.com/v3'

// IDs del Mundial 2026 en api-football
const WC_2026_LEAGUE_ID = 1   // World Cup
const WC_2026_SEASON    = 2026

interface FixtureResponse {
  fixture: { id: number; status: { short: string; elapsed: number | null } }
  teams: {
    home: { name: string }
    away: { name: string }
  }
  goals: { home: number | null; away: number | null }
  league: { round: string }
}

// Mapeo de nombres en inglés → español (para hacer match con nuestra DB)
const NAME_MAP: Record<string, string> = {
  'United States':    'Estados Unidos',
  'USA':              'Estados Unidos',
  'Panama':           'Panamá',
  'Bolivia':          'Bolivia',
  'Uruguay':          'Uruguay',
  'Mexico':           'México',
  'Jamaica':          'Jamaica',
  'Venezuela':        'Venezuela',
  'Ecuador':          'Ecuador',
  'Canada':           'Canadá',
  'Honduras':         'Honduras',
  'Morocco':          'Marruecos',
  'Belgium':          'Bélgica',
  'Brazil':           'Brasil',
  'Japan':            'Japón',
  'Croatia':          'Croacia',
  'Mali':             'Mali',
  'Argentina':        'Argentina',
  'Chile':            'Chile',
  'Albania':          'Albania',
  'Ukraine':          'Ucrania',
  'Spain':            'España',
  'Serbia':           'Serbia',
  'Netherlands':      'Países Bajos',
  'Australia':        'Australia',
  'France':           'Francia',
  'Portugal':         'Portugal',
  'Colombia':         'Colombia',
  'Saudi Arabia':     'Arabia Saudita',
  'Germany':          'Alemania',
  'South Korea':      'Corea del Sur',
  'Korea Republic':   'Corea del Sur',
  'Costa Rica':       'Costa Rica',
  'Cameroon':         'Camerún',
  'England':          'Inglaterra',
  'Senegal':          'Senegal',
  'Paraguay':         'Paraguay',
  'Slovenia':         'Eslovenia',
  'Poland':           'Polonia',
  'Turkey':           'Turquía',
  'Egypt':            'Egipto',
  "Ivory Coast":      'Costa de Marfil',
  "Cote d'Ivoire":    'Costa de Marfil',
  'Iran':             'Irán',
  'Qatar':            'Qatar',
  'Ghana':            'Ghana',
  'Switzerland':      'Suiza',
  'New Zealand':      'Nueva Zelanda',
  'Slovakia':         'Eslovaquia',
  'Peru':             'Perú',
  'Kenya':            'Kenia',
}

export function normalizeTeamName(name: string): string {
  return NAME_MAP[name] ?? name
}

export async function fetchTodayFixtures(): Promise<FixtureResponse[]> {
  if (!API_KEY) return []

  const today = new Date().toISOString().split('T')[0]
  const url = `${BASE_URL}/fixtures?league=${WC_2026_LEAGUE_ID}&season=${WC_2026_SEASON}&date=${today}`

  try {
    const res = await fetch(url, {
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
      },
      next: { revalidate: 0 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.response ?? []
  } catch {
    return []
  }
}

export async function fetchLiveFixtures(): Promise<FixtureResponse[]> {
  if (!API_KEY) return []

  const url = `${BASE_URL}/fixtures?league=${WC_2026_LEAGUE_ID}&season=${WC_2026_SEASON}&live=all`

  try {
    const res = await fetch(url, {
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
      },
      next: { revalidate: 0 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.response ?? []
  } catch {
    return []
  }
}
