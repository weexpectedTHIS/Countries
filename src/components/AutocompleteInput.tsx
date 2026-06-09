import { useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Platform,
} from 'react-native'

interface Props {
  allOptions: string[]
  correctAnswer: string
  selectedAnswer: string | null
  onAnswer: (answer: string) => void
}

export default function AutocompleteInput({ allOptions, correctAnswer, selectedAnswer, onAnswer }: Props) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<TextInput>(null)

  const normalize = (s: string) =>
    s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

  const filtered =
    query.length > 0
      ? allOptions.filter(o => normalize(o).includes(normalize(query))).slice(0, 8)
      : []

  const isCorrect = selectedAnswer === correctAnswer

  function handleSelect(option: string) {
    setQuery(option)
    Keyboard.dismiss()
    onAnswer(option)
  }

  function handleDontKnow() {
    setQuery('')
    Keyboard.dismiss()
    onAnswer('')
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            selectedAnswer !== null && (isCorrect ? styles.inputCorrect : styles.inputWrong),
          ]}
          value={query}
          onChangeText={selectedAnswer === null ? setQuery : undefined}
          placeholder="Start typing..."
          placeholderTextColor="#9CA3AF"
          editable={selectedAnswer === null}
          autoCorrect={false}
          autoCapitalize="words"
          autoFocus={Platform.OS !== 'web'}
        />
        {selectedAnswer === null && (
          <TouchableOpacity style={styles.dontKnowBtn} onPress={handleDontKnow} activeOpacity={0.7}>
            <Text style={styles.dontKnowText}>I don't know</Text>
          </TouchableOpacity>
        )}
      </View>

      {selectedAnswer !== null && (
        <View style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
          <Text style={[styles.feedbackText, isCorrect ? styles.feedbackTextCorrect : styles.feedbackTextWrong]}>
            {isCorrect ? '✓ Correct!' : `✗  Correct answer: ${correctAnswer}`}
          </Text>
        </View>
      )}

      {selectedAnswer === null && filtered.length > 0 && (
        <View style={styles.dropdown}>
          {filtered.map((option, index) => (
            <TouchableOpacity
              key={option}
              style={[styles.dropdownItem, index < filtered.length - 1 && styles.dropdownItemBorder]}
              onPress={() => handleSelect(option)}
              activeOpacity={0.6}
            >
              <Text style={styles.dropdownText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {selectedAnswer === null && query.length > 0 && filtered.length === 0 && (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>No matches</Text>
        </View>
      )}
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
  },
  dontKnowBtn: {
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dontKnowText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  inputCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#D1FAE5',
  },
  inputWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  feedback: {
    marginTop: 10,
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
  dropdown: {
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dropdownItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownText: {
    fontSize: 16,
    color: '#111827',
  },
  noResults: {
    marginTop: 4,
    paddingVertical: 14,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
})
