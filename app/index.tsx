import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native'
import { router } from 'expo-router'
import type { Difficulty, Mode } from '../src/game/engine'

export default function HomeScreen() {
  const [mode, setMode] = useState<Mode>('country-to-capital')
  const [difficulty, setDifficulty] = useState<Difficulty>('multiple-choice')

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
          <Text style={styles.sectionLabel}>FORMAT</Text>
          <View style={styles.toggle}>
            <TouchableOpacity
              style={[styles.toggleOption, difficulty === 'multiple-choice' && styles.toggleOptionActive]}
              onPress={() => setDifficulty('multiple-choice')}
              activeOpacity={0.75}
            >
              <Text style={[styles.toggleText, difficulty === 'multiple-choice' && styles.toggleTextActive]}>
                Multiple Choice
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleOption, difficulty === 'autocomplete' && styles.toggleOptionActive]}
              onPress={() => setDifficulty('autocomplete')}
              activeOpacity={0.75}
            >
              <Text style={[styles.toggleText, difficulty === 'autocomplete' && styles.toggleTextActive]}>
                Type to Search
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.startButton} onPress={startQuiz} activeOpacity={0.85}>
          <Text style={styles.startButtonText}>Start Quiz</Text>
        </TouchableOpacity>
      </View>
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
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1.2,
    marginBottom: 2,
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
  toggle: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 4,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  toggleOptionActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#111827',
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
})
