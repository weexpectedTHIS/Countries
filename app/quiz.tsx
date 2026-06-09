import { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import {
  generateQuestions,
  getAllAnswers,
  type Difficulty,
  type Mode,
  type Question,
} from '../src/game/engine'
import {
  ENGINE_VERSION,
  createGame,
  getGame,
  updateGame,
  restoreQuestions,
} from '../src/game/storage'
import MultipleChoiceInput from '../src/components/MultipleChoiceInput'
import AutocompleteInput from '../src/components/AutocompleteInput'

const QUESTION_COUNT = 20

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'I Want My Mommy',
  medium: 'Hurt Me Plenty',
  hard: 'I Am Death Incarnate!',
}

export default function QuizScreen() {
  const params = useLocalSearchParams()
  const gameIdParam = params.gameId as string | undefined
  const modeParam = params.mode as Mode | undefined
  const diffParam = params.difficulty as Difficulty | undefined

  const [gid, setGid] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>('country-to-capital')
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [questions, setQuestions] = useState<Question[]>([])
  const [allAnswers, setAllAnswers] = useState<string[]>([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<(string | null)[]>([])
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (gameIdParam) {
      const saved = getGame(gameIdParam)
      if (!saved || saved.engineVersion !== ENGINE_VERSION) {
        router.replace('/')
        return
      }
      const qs = restoreQuestions(saved)
      setMode(saved.mode)
      setDifficulty(saved.difficulty)
      setGid(saved.id)
      setQuestions(qs)
      setIndex(saved.currentIndex)
      setScore(saved.score)
      setSelectedAnswers(saved.selectedAnswers)
      setSelected(saved.selectedAnswers[saved.currentIndex] ?? null)
      setDone(saved.completed)
      if (saved.difficulty !== 'easy') setAllAnswers(getAllAnswers(saved.mode))
    } else if (modeParam && diffParam) {
      const qs = generateQuestions(modeParam, diffParam, QUESTION_COUNT)
      const saved = createGame(modeParam, diffParam, qs)
      setMode(modeParam)
      setDifficulty(diffParam)
      setGid(saved.id)
      setQuestions(qs)
      setSelectedAnswers(new Array(QUESTION_COUNT).fill(null))
      if (diffParam !== 'easy') setAllAnswers(getAllAnswers(modeParam))
      // Replace URL so refresh reloads via gameId
      router.replace({ pathname: '/quiz', params: { gameId: saved.id } })
    } else {
      router.replace('/')
    }
  }, [])

  function handleAnswer(answer: string) {
    if (selected !== null) return
    setSelected(answer)
    const correct = answer === questions[index].answer
    const newScore = score + (correct ? 1 : 0)
    setScore(newScore)
    const newAnswers = [...selectedAnswers]
    newAnswers[index] = answer
    setSelectedAnswers(newAnswers)
    if (gid) updateGame(gid, { selectedAnswers: newAnswers, score: newScore })
  }

  function handleNext() {
    if (index + 1 >= QUESTION_COUNT) {
      setDone(true)
      if (gid) updateGame(gid, { completed: true })
    } else {
      const newIndex = index + 1
      setIndex(newIndex)
      setSelected(null)
      if (gid) updateGame(gid, { currentIndex: newIndex })
    }
  }

  function handleRestart() {
    const qs = generateQuestions(mode, difficulty, QUESTION_COUNT)
    const saved = createGame(mode, difficulty, qs)
    setGid(saved.id)
    setQuestions(qs)
    setIndex(0)
    setScore(0)
    setSelected(null)
    setSelectedAnswers(new Array(QUESTION_COUNT).fill(null))
    setDone(false)
    if (difficulty !== 'easy') setAllAnswers(getAllAnswers(mode))
    router.replace({ pathname: '/quiz', params: { gameId: saved.id } })
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (done) {
    return (
      <ResultsScreen
        score={score}
        total={QUESTION_COUNT}
        mode={mode}
        difficulty={difficulty}
        onRestart={handleRestart}
        onHome={() => router.replace('/')}
      />
    )
  }

  const q = questions[index]
  const progressPct = `${Math.round(((index + (selected ? 1 : 0)) / QUESTION_COUNT) * 100)}%`
  const isCountryToCapital = mode === 'country-to-capital'

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.replace('/')} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.counter}>{index + 1} / {QUESTION_COUNT}</Text>
        <Text style={styles.scoreText}>{score} ✓</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: progressPct as `${number}%` }]} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.questionCard}>
          <Text style={styles.flag}>{q.country.flag}</Text>
          <Text style={styles.questionLabel}>
            {isCountryToCapital ? 'What is the capital of' : 'Which country has the capital'}
          </Text>
          <Text style={styles.questionPrompt}>{q.prompt}?</Text>
          {difficulty !== 'hard' && (
            <Text style={styles.continent}>{q.country.continent}</Text>
          )}
        </View>

        {difficulty === 'easy' ? (
          <MultipleChoiceInput
            key={index}
            options={q.choices}
            correctAnswer={q.answer}
            selectedAnswer={selected}
            onAnswer={handleAnswer}
          />
        ) : (
          <AutocompleteInput
            key={index}
            allOptions={allAnswers}
            correctAnswer={q.answer}
            selectedAnswer={selected}
            onAnswer={handleAnswer}
          />
        )}

        {selected !== null && (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.85}>
            <Text style={styles.nextButtonText}>
              {index + 1 >= QUESTION_COUNT ? 'See Results' : 'Next →'}
            </Text>
          </TouchableOpacity>
        )}

        {selected !== null && difficulty !== 'easy' && (
          <View style={[styles.feedback, selected === q.answer ? styles.feedbackCorrect : styles.feedbackWrong]}>
            <Text style={[styles.feedbackText, selected === q.answer ? styles.feedbackTextCorrect : styles.feedbackTextWrong]}>
              {selected === q.answer ? '✓ Correct!' : `✗  Correct answer: ${q.answer}`}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function ResultsScreen({
  score,
  total,
  mode,
  difficulty,
  onRestart,
  onHome,
}: {
  score: number
  total: number
  mode: Mode
  difficulty: Difficulty
  onRestart: () => void
  onHome: () => void
}) {
  const pct = Math.round((score / total) * 100)
  const emoji = pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : pct >= 50 ? '👍' : '📚'
  const message = pct >= 90 ? 'Outstanding!' : pct >= 70 ? 'Great work!' : pct >= 50 ? 'Good effort!' : 'Keep practising!'

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.results}>
        <Text style={styles.resultsEmoji}>{emoji}</Text>
        <Text style={styles.resultsMessage}>{message}</Text>
        <Text style={styles.resultsScore}>{score} / {total}</Text>
        <Text style={styles.resultsPct}>{pct}% correct</Text>

        <View style={styles.resultsMeta}>
          <Text style={styles.resultsMetaText}>
            {mode === 'country-to-capital' ? 'Country → Capital' : 'Capital → Country'}
          </Text>
          <Text style={styles.resultsDot}>·</Text>
          <Text style={styles.resultsMetaText}>
            {DIFFICULTY_LABELS[difficulty]}
          </Text>
        </View>

        <TouchableOpacity style={styles.startButton} onPress={onRestart} activeOpacity={0.85}>
          <Text style={styles.startButtonText}>Play Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeButton} onPress={onHome} activeOpacity={0.75}>
          <Text style={styles.homeButtonText}>Change Mode</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const PRIMARY = '#4F46E5'

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  backText: {
    fontSize: 16,
    color: PRIMARY,
    fontWeight: '600',
  },
  counter: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  scoreText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10B981',
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 0,
  },
  progressFill: {
    height: 4,
    backgroundColor: PRIMARY,
    borderRadius: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 12,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 4,
  },
  flag: {
    fontSize: 56,
    marginBottom: 12,
  },
  questionLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 6,
  },
  questionPrompt: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  continent: {
    fontSize: 12,
    color: '#D1D5DB',
    marginTop: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  feedback: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  feedbackCorrect: {
    backgroundColor: '#D1FAE5',
  },
  feedbackWrong: {
    backgroundColor: '#FEE2E2',
  },
  feedbackText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  feedbackTextCorrect: {
    color: '#065F46',
  },
  feedbackTextWrong: {
    color: '#991B1B',
  },
  nextButton: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  results: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  resultsEmoji: {
    fontSize: 72,
    marginBottom: 8,
  },
  resultsMessage: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  resultsScore: {
    fontSize: 48,
    fontWeight: '800',
    color: PRIMARY,
    letterSpacing: -1,
    marginTop: 4,
  },
  resultsPct: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '500',
  },
  resultsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
  },
  resultsMetaText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  resultsDot: {
    color: '#D1D5DB',
  },
  startButton: {
    backgroundColor: PRIMARY,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginTop: 8,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  homeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  homeButtonText: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '600',
  },
})
