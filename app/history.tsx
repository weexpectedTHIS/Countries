import { useCallback, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { loadGames, deleteGame, ENGINE_VERSION, type SavedGame } from '../src/game/storage'
import type { Difficulty, Mode } from '../src/game/engine'

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'I Want My Mommy',
  medium: 'Hurt Me Plenty',
  hard: 'I Am Death Incarnate!',
}

const DIFFICULTY_EMOJIS: Record<Difficulty, string> = {
  easy: '🌍',
  medium: '🗺️',
  hard: '💀',
}

const MODE_LABELS: Record<Mode, string> = {
  'country-to-capital': 'Country → Capital',
  'capital-to-country': 'Capital → Country',
}

function relativeDate(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'yesterday'
  return `${days}d ago`
}

export default function HistoryScreen() {
  const [games, setGames] = useState<SavedGame[]>([])

  useFocusEffect(useCallback(() => {
    setGames(loadGames().sort((a, b) => b.lastPlayedAt - a.lastPlayedAt))
  }, []))

  function handleDelete(id: string) {
    deleteGame(id)
    setGames(prev => prev.filter(g => g.id !== id))
  }

  function handleResume(game: SavedGame) {
    router.push({ pathname: '/quiz', params: { gameId: game.id } })
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.replace('/')} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>History</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {games.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyText}>No games yet</Text>
            <Text style={styles.emptySubtext}>Start a quiz to see your history here</Text>
          </View>
        ) : (
          games.map(game => {
            const outdated = game.engineVersion !== ENGINE_VERSION
            const answered = game.selectedAnswers.filter(a => a !== null).length
            const total = game.savedQuestions.length

            return (
              <View key={game.id} style={[styles.card, outdated && styles.cardOutdated]}>
                <View style={styles.cardTop}>
                  <Text style={[styles.diffEmoji, outdated && styles.dimmed]}>
                    {DIFFICULTY_EMOJIS[game.difficulty]}
                  </Text>
                  <View style={styles.cardInfo}>
                    <Text style={[styles.diffLabel, outdated && styles.dimmed]}>
                      {DIFFICULTY_LABELS[game.difficulty]}
                    </Text>
                    <Text style={[styles.modeLabel, outdated && styles.dimmed]}>
                      {MODE_LABELS[game.mode]}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(game.id)} style={styles.deleteBtn}>
                    <Text style={styles.deleteBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.cardBottom}>
                  <View style={styles.badgeRow}>
                    {outdated ? (
                      <View style={[styles.badge, styles.badgeOutdated]}>
                        <Text style={[styles.badgeText, styles.badgeOutdatedText]}>Outdated</Text>
                      </View>
                    ) : game.completed ? (
                      <View style={[styles.badge, styles.badgeDone]}>
                        <Text style={[styles.badgeText, styles.badgeDoneText]}>
                          {game.score} / {total} correct
                        </Text>
                      </View>
                    ) : (
                      <View style={[styles.badge, styles.badgeProgress]}>
                        <Text style={[styles.badgeText, styles.badgeProgressText]}>
                          {answered} / {total} answered
                        </Text>
                      </View>
                    )}
                    <Text style={styles.dateText}>{relativeDate(game.lastPlayedAt)}</Text>
                  </View>

                  {!outdated && !game.completed && (
                    <TouchableOpacity style={styles.resumeBtn} onPress={() => handleResume(game)}>
                      <Text style={styles.resumeBtnText}>Resume →</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )
          })
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const PRIMARY = '#4F46E5'

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    minWidth: 70,
  },
  backText: {
    fontSize: 16,
    color: PRIMARY,
    fontWeight: '600',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  topBarSpacer: {
    minWidth: 70,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 12,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  cardOutdated: {
    backgroundColor: '#F9FAFB',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  diffEmoji: {
    fontSize: 28,
  },
  dimmed: {
    opacity: 0.4,
  },
  cardInfo: {
    flex: 1,
  },
  diffLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  modeLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  deleteBtn: {
    padding: 8,
  },
  deleteBtnText: {
    fontSize: 14,
    color: '#D1D5DB',
    fontWeight: '600',
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeOutdated: {
    backgroundColor: '#F3F4F6',
  },
  badgeOutdatedText: {
    color: '#9CA3AF',
  },
  badgeDone: {
    backgroundColor: '#D1FAE5',
  },
  badgeDoneText: {
    color: '#065F46',
  },
  badgeProgress: {
    backgroundColor: '#EEF2FF',
  },
  badgeProgressText: {
    color: PRIMARY,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  resumeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: PRIMARY,
    borderRadius: 10,
  },
  resumeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
})
