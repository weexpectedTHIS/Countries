import { COUNTRIES } from '../data/countries'
import type { Mode, Difficulty, Question } from './engine'

// Bump this when question generation logic changes in a breaking way.
// Games saved with an older version will be shown as outdated and unresumable.
export const ENGINE_VERSION = 1

const STORAGE_KEY = 'cq:games'
const MAX_GAMES = 50

interface SavedQuestion {
  countryId: string
  prompt: string
  answer: string
  choices: string[]
}

export interface SavedGame {
  id: string
  engineVersion: number
  mode: Mode
  difficulty: Difficulty
  startedAt: number
  lastPlayedAt: number
  currentIndex: number
  score: number
  completed: boolean
  savedQuestions: SavedQuestion[]
  selectedAnswers: (string | null)[]
}

function storage(): Storage | null {
  try { return typeof localStorage !== 'undefined' ? localStorage : null }
  catch { return null }
}

export function loadGames(): SavedGame[] {
  try {
    const raw = storage()?.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SavedGame[]) : []
  } catch { return [] }
}

function persist(games: SavedGame[]): void {
  try {
    const trimmed = [...games]
      .sort((a, b) => b.lastPlayedAt - a.lastPlayedAt)
      .slice(0, MAX_GAMES)
    storage()?.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch {}
}

export function createGame(mode: Mode, difficulty: Difficulty, questions: Question[]): SavedGame {
  const game: SavedGame = {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`,
    engineVersion: ENGINE_VERSION,
    mode,
    difficulty,
    startedAt: Date.now(),
    lastPlayedAt: Date.now(),
    currentIndex: 0,
    score: 0,
    completed: false,
    savedQuestions: questions.map(q => ({
      countryId: q.country.id,
      prompt: q.prompt,
      answer: q.answer,
      choices: q.choices,
    })),
    selectedAnswers: new Array(questions.length).fill(null),
  }
  persist([...loadGames(), game])
  return game
}

export function updateGame(
  id: string,
  patch: Partial<Pick<SavedGame, 'currentIndex' | 'score' | 'completed' | 'selectedAnswers'>>,
): void {
  const games = loadGames()
  const i = games.findIndex(g => g.id === id)
  if (i === -1) return
  games[i] = { ...games[i], ...patch, lastPlayedAt: Date.now() }
  persist(games)
}

export function getGame(id: string): SavedGame | null {
  return loadGames().find(g => g.id === id) ?? null
}

export function deleteGame(id: string): void {
  persist(loadGames().filter(g => g.id !== id))
}

export function restoreQuestions(game: SavedGame): Question[] {
  return game.savedQuestions.map(sq => ({
    country: COUNTRIES.find(c => c.id === sq.countryId)!,
    prompt: sq.prompt,
    answer: sq.answer,
    choices: sq.choices,
  }))
}
