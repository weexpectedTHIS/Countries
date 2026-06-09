import { COUNTRIES, type Country } from '../data/countries'

export type Mode = 'country-to-capital' | 'capital-to-country'
export type Difficulty = 'multiple-choice' | 'autocomplete'

export interface Question {
  country: Country
  prompt: string
  answer: string
  choices: string[]
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

export function generateQuestions(mode: Mode, count: number): Question[] {
  return shuffle(COUNTRIES)
    .slice(0, count)
    .map(country => ({
      country,
      prompt: getPrompt(country, mode),
      answer: getAnswer(country, mode),
      choices: buildChoices(country, mode),
    }))
}

export function getAllAnswers(mode: Mode): string[] {
  const vals = COUNTRIES.map(c => getAnswer(c, mode))
  return [...new Set(vals)].sort((a, b) => a.localeCompare(b))
}
