import { COUNTRIES, type Country } from '../data/countries'

export type Mode = 'country-to-capital' | 'capital-to-country'
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Question {
  country: Country
  prompt: string
  answer: string
  choices: string[]
}

// Tier weights [tier1, tier2, tier3] per difficulty
const TIER_WEIGHTS: Record<Difficulty, [number, number, number]> = {
  easy:   [5, 2, 1],
  medium: [1, 1, 1],
  hard:   [1, 2, 5],
}

// Hard mode deck: cycles all countries before repeating, persists across sessions within page load
const hardDecks: Record<Mode, { deck: Country[]; offset: number }> = {
  'country-to-capital': { deck: [], offset: 0 },
  'capital-to-country': { deck: [], offset: 0 },
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getAnswer(c: Country, mode: Mode): string {
  return mode === 'country-to-capital' ? c.capital : c.name
}

function getPrompt(c: Country, mode: Mode): string {
  return mode === 'country-to-capital' ? c.name : c.capital
}

function buildChoices(country: Country, mode: Mode): string[] {
  const correct = getAnswer(country, mode)

  const sameContinent = shuffle(
    COUNTRIES.filter(c => c.id !== country.id && c.continent === country.continent)
  )
  const otherContinent = shuffle(
    COUNTRIES.filter(c => c.id !== country.id && c.continent !== country.continent)
  )

  const pool = [...sameContinent, ...otherContinent]
  const distractors: string[] = []
  const seen = new Set([correct])

  for (const c of pool) {
    if (distractors.length >= 3) break
    const val = getAnswer(c, mode)
    if (!seen.has(val)) {
      seen.add(val)
      distractors.push(val)
    }
  }

  return shuffle([correct, ...distractors])
}

function buildWeightedPool(difficulty: Difficulty): Country[] {
  const [w1, w2, w3] = TIER_WEIGHTS[difficulty]
  const pool: Country[] = []
  for (const c of COUNTRIES) {
    const weight = c.tier === 1 ? w1 : c.tier === 2 ? w2 : w3
    for (let i = 0; i < weight; i++) pool.push(c)
  }
  return pool
}

function weightedSample(difficulty: Difficulty, count: number): Country[] {
  const pool = shuffle(buildWeightedPool(difficulty))
  const result: Country[] = []
  const seen = new Set<string>()
  for (const c of pool) {
    if (result.length >= count) break
    if (!seen.has(c.id)) {
      seen.add(c.id)
      result.push(c)
    }
  }
  return result
}

function dealHardBatch(mode: Mode, count: number): Country[] {
  const state = hardDecks[mode]
  const result: Country[] = []

  while (result.length < count) {
    if (state.offset >= state.deck.length) {
      state.deck = shuffle([...COUNTRIES])
      state.offset = 0
    }
    result.push(state.deck[state.offset])
    state.offset++
  }

  return result
}

export function generateQuestions(mode: Mode, difficulty: Difficulty, count: number): Question[] {
  let countries: Country[]

  if (difficulty === 'hard') {
    countries = dealHardBatch(mode, count)
  } else {
    countries = weightedSample(difficulty, count)
  }

  return countries.map(country => ({
    country,
    prompt: getPrompt(country, mode),
    answer: getAnswer(country, mode),
    choices: difficulty === 'easy' ? buildChoices(country, mode) : [],
  }))
}

export function getAllAnswers(mode: Mode): string[] {
  const vals = COUNTRIES.map(c => getAnswer(c, mode))
  return [...new Set(vals)].sort((a, b) => a.localeCompare(b))
}
