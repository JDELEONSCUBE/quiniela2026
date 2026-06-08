export type MatchStage = 'group' | 'round_of_32' | 'round_of_16' | 'quarterfinal' | 'semifinal' | 'third_place' | 'final'

export interface ScoreResult {
  points: number
  label: string
}

export function calculatePoints(
  predHome: number,
  predAway: number,
  realHome: number,
  realAway: number,
  stage: MatchStage
): ScoreResult {
  const isGroupStage = stage === 'group'

  // Exact score
  if (predHome === realHome && predAway === realAway) {
    return { points: isGroupStage ? 3 : 5, label: 'Marcador exacto' }
  }

  const predResult = Math.sign(predHome - predAway)
  const realResult = Math.sign(realHome - realAway)

  if (predResult === realResult) {
    return { points: isGroupStage ? 1 : 2, label: 'Resultado correcto' }
  }

  return { points: 0, label: 'Sin puntos' }
}

export function getResultLabel(home: number, away: number, homeTeam: string, awayTeam: string): string {
  if (home > away) return `Gana ${homeTeam}`
  if (away > home) return `Gana ${awayTeam}`
  return 'Empate'
}
