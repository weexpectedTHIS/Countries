import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Modal, ScrollView } from 'react-native'
import { router } from 'expo-router'
import type { Difficulty, Mode } from '../src/game/engine'

const DIFFICULTIES: { value: Difficulty; emoji: string; label: string; desc: string }[] = [
  {
    value: 'easy',
    emoji: '🌍',
    label: 'I Want My Mommy',
    desc: 'Multiple choice · familiar countries',
  },
  {
    value: 'medium',
    emoji: '🗺️',
    label: 'Hurt Me Plenty',
    desc: 'Type to search · all countries equally',
  },
  {
    value: 'hard',
    emoji: '💀',
    label: 'I Am Death Incarnate!',
    desc: 'Type to search · obscure countries first',
  },
]

export default function HomeScreen() {
  const [mode, setMode] = useState<Mode>('country-to-capital')
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [infoVisible, setInfoVisible] = useState(false)

  function startQuiz() {
    router.push({ pathname: '/quiz', params: { mode, difficulty } })
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Countries</Text>
          <Text style={styles.subtitle}>& Capitals</Text>
          <Text style={styles.tagline}>20 questions · all nations</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DIRECTION</Text>
          <TouchableOpacity
            style={[styles.card, mode === 'country-to-capital' && styles.cardActive]}
            onPress={() => setMode('country-to-capital')}
            activeOpacity={0.75}
          >
            <Text style={[styles.cardTitle, mode === 'country-to-capital' && styles.cardTitleActive]}>
              Country → Capital
            </Text>
            <Text style={[styles.cardDesc, mode === 'country-to-capital' && styles.cardDescActive]}>
              See a country name, name its capital
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, mode === 'capital-to-country' && styles.cardActive]}
            onPress={() => setMode('capital-to-country')}
            activeOpacity={0.75}
          >
            <Text style={[styles.cardTitle, mode === 'capital-to-country' && styles.cardTitleActive]}>
              Capital → Country
            </Text>
            <Text style={[styles.cardDesc, mode === 'capital-to-country' && styles.cardDescActive]}>
              See a capital city, name its country
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>DIFFICULTY</Text>
            <TouchableOpacity onPress={() => setInfoVisible(true)} style={styles.infoButton}>
              <Text style={styles.infoButtonText}>?</Text>
            </TouchableOpacity>
          </View>

          {DIFFICULTIES.map(d => (
            <TouchableOpacity
              key={d.value}
              style={[styles.card, difficulty === d.value && styles.cardActive]}
              onPress={() => setDifficulty(d.value)}
              activeOpacity={0.75}
            >
              <View style={styles.diffRow}>
                <Text style={styles.diffEmoji}>{d.emoji}</Text>
                <View style={styles.diffText}>
                  <Text style={[styles.cardTitle, difficulty === d.value && styles.cardTitleActive]}>
                    {d.label}
                  </Text>
                  <Text style={[styles.cardDesc, difficulty === d.value && styles.cardDescActive]}>
                    {d.desc}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.startButton} onPress={startQuiz} activeOpacity={0.85}>
          <Text style={styles.startButtonText}>Start Quiz</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={infoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setInfoVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalBox}>
            <Text style={styles.modalTitle}>Difficulty Levels</Text>
            <ScrollView>
              <View style={styles.modalItem}>
                <Text style={styles.modalEmoji}>🌍</Text>
                <View style={styles.modalItemText}>
                  <Text style={styles.modalItemTitle}>I Want My Mommy</Text>
                  <Text style={styles.modalItemDesc}>
                    Multiple choice with 4 options. Questions lean toward well-known countries and capitals — great for beginners or a relaxed warm-up.
                  </Text>
                </View>
              </View>
              <View style={styles.modalDivider} />
              <View style={styles.modalItem}>
                <Text style={styles.modalEmoji}>🗺️</Text>
                <View style={styles.modalItemText}>
                  <Text style={styles.modalItemTitle}>Hurt Me Plenty</Text>
                  <Text style={styles.modalItemDesc}>
                    Type to search — no options given. Every country is equally likely to appear. Tests your real knowledge without hints.
                  </Text>
                </View>
              </View>
              <View style={styles.modalDivider} />
              <View style={styles.modalItem}>
                <Text style={styles.modalEmoji}>💀</Text>
                <View style={styles.modalItemText}>
                  <Text style={styles.modalItemTitle}>I Am Death Incarnate!</Text>
                  <Text style={styles.modalItemDesc}>
                    Type to search with a vengeance. Obscure countries come up far more often, and no country repeats until all 196 have been seen — your progress carries across rounds.
                  </Text>
                </View>
              </View>
            </ScrollView>
            <TouchableOpacity style={styles.modalClose} onPress={() => setInfoVisible(false)}>
              <Text style={styles.modalCloseText}>Got it</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  )
}

const PRIMARY = '#4F46E5'
const PRIMARY_LIGHT = '#EEF2FF'

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: '700',
    color: PRIMARY,
    marginTop: -4,
  },
  tagline: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1.2,
  },
  infoButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    lineHeight: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  cardActive: {
    backgroundColor: PRIMARY_LIGHT,
    borderColor: PRIMARY,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#374151',
  },
  cardTitleActive: {
    color: PRIMARY,
  },
  cardDesc: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 3,
  },
  cardDescActive: {
    color: '#6366F1',
  },
  diffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  diffEmoji: {
    fontSize: 28,
  },
  diffText: {
    flex: 1,
  },
  startButton: {
    backgroundColor: PRIMARY,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 4,
  },
  modalEmoji: {
    fontSize: 28,
    marginTop: 2,
  },
  modalItemText: {
    flex: 1,
  },
  modalItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  modalItemDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 19,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 14,
  },
  modalClose: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  modalCloseText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
})
