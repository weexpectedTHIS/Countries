import { useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native'

interface Props {
  allOptions: string[]
  correctAnswer: string
  selectedAnswer: string | null
  onAnswer: (answer: string) => void
}

export default function AutocompleteInput({ allOptions, correctAnswer, selectedAnswer, onAnswer }: Props) {
  const [query, setQuery] = useState('')
  const [highlighted, setHighlighted] = useState(0)
  const inputRef = useRef<TextInput>(null)
  const answeredRef = useRef(false)

  const normalize = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/['’]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()

  const tokens = normalize(query).split(' ').filter(Boolean)

  const filtered =
    tokens.length > 0
      ? allOptions
          .filter(o => {
            const n = normalize(o)
            return tokens.every(t => n.includes(t))
          })
          .slice(0, 8)
      : []

  const isCorrect = selectedAnswer === correctAnswer

  function handleQueryChange(text: string) {
    setQuery(text)
    setHighlighted(0)
  }

  function handleSelect(option: string) {
    if (answeredRef.current) return
    answeredRef.current = true
    setQuery(option)
    Keyboard.dismiss()
    onAnswer(option)
  }

  function handleDontKnow() {
    if (answeredRef.current) return
    answeredRef.current = true
    setQuery('')
    Keyboard.dismiss()
    onAnswer('')
  }

  function handleKeyPress(e: NativeSyntheticEvent<TextInputKeyPressEventData>) {
    if (selectedAnswer !== null || filtered.length === 0) return
    const key = e.nativeEvent.key

    if (key === 'ArrowDown') {
      e.preventDefault?.()
      setHighlighted(h => Math.min(h + 1, filtered.length - 1))
    } else if (key === 'ArrowUp') {
      e.preventDefault?.()
      setHighlighted(h => Math.max(h - 1, 0))
    } else if (key === 'Enter') {
      e.preventDefault?.()
      handleSelect(filtered[Math.min(highlighted, filtered.length - 1)])
    }
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
          onChangeText={selectedAnswer === null ? handleQueryChange : undefined}
          onKeyPress={handleKeyPress}
          onSubmitEditing={() => {
            if (selectedAnswer === null && filtered.length > 0) {
              handleSelect(filtered[Math.min(highlighted, filtered.length - 1)])
            }
          }}
          blurOnSubmit={false}
          placeholder="Start typing..."
          placeholderTextColor="#9CA3AF"
          editable={selectedAnswer === null}
          autoCorrect={false}
          autoCapitalize="words"
          autoFocus
        />
        {selectedAnswer === null && (
          <TouchableOpacity style={styles.dontKnowBtn} onPress={handleDontKnow} activeOpacity={0.7}>
            <Text style={styles.dontKnowText}>I don't know</Text>
          </TouchableOpacity>
        )}
      </View>

      {selectedAnswer === null && filtered.length > 0 && (
        <View style={styles.dropdown}>
          {filtered.map((option, index) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.dropdownItem,
                index < filtered.length - 1 && styles.dropdownItemBorder,
                index === highlighted && styles.dropdownItemHighlighted,
              ]}
              onPress={() => handleSelect(option)}
              activeOpacity={0.6}
            >
              <Text style={[styles.dropdownText, index === highlighted && styles.dropdownTextHighlighted]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {selectedAnswer === null && tokens.length > 0 && filtered.length === 0 && (
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
  inputCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#D1FAE5',
  },
  inputWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
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
  dropdownItemHighlighted: {
    backgroundColor: '#EEF2FF',
  },
  dropdownText: {
    fontSize: 16,
    color: '#111827',
  },
  dropdownTextHighlighted: {
    color: '#4F46E5',
    fontWeight: '600',
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
