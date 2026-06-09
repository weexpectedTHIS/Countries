import { useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  ScrollView,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native'

interface Props {
  allOptions: string[]
  correctAnswer: string
  selectedAnswer: string | null
  onAnswer: (answer: string) => void
}

const DROPDOWN_ITEM_HEIGHT = 49 // paddingVertical 14 * 2 + fontSize 16 + border 1
const MAX_VISIBLE = 6

function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export default function AutocompleteInput({ allOptions, correctAnswer, selectedAnswer, onAnswer }: Props) {
  const [query, setQuery] = useState('')
  const [highlighted, setHighlighted] = useState(0)
  const inputRef = useRef<TextInput>(null)
  const dropdownRef = useRef<ScrollView>(null)
  const answeredRef = useRef(false)

  const isCorrect = selectedAnswer === correctAnswer

  const tokens = normalize(query).split(' ').filter(Boolean)

  const filtered: string[] = (() => {
    if (tokens.length === 0) return []
    const matches = allOptions.filter(o => {
      const n = normalize(o)
      return tokens.every(t => n.includes(t))
    })
    // Prefix matches first
    const firstToken = tokens[0]
    return matches.sort((a, b) => {
      const aStarts = normalize(a).startsWith(firstToken)
      const bStarts = normalize(b).startsWith(firstToken)
      if (aStarts === bStarts) return 0
      return aStarts ? -1 : 1
    })
  })()

  function handleQueryChange(text: string) {
    setQuery(text)
    setHighlighted(0)
    dropdownRef.current?.scrollTo({ y: 0, animated: false })
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

  function scrollToHighlighted(index: number) {
    dropdownRef.current?.scrollTo({ y: index * DROPDOWN_ITEM_HEIGHT, animated: true })
  }

  function handleKeyPress(e: NativeSyntheticEvent<TextInputKeyPressEventData>) {
    if (selectedAnswer !== null || filtered.length === 0) return
    const key = e.nativeEvent.key

    if (key === 'ArrowDown') {
      e.preventDefault?.()
      const next = Math.min(highlighted + 1, filtered.length - 1)
      setHighlighted(next)
      scrollToHighlighted(next)
    } else if (key === 'ArrowUp') {
      e.preventDefault?.()
      const prev = Math.max(highlighted - 1, 0)
      setHighlighted(prev)
      scrollToHighlighted(prev)
    } else if (key === 'Enter') {
      e.preventDefault?.()
      handleSelect(filtered[Math.min(highlighted, filtered.length - 1)])
    }
  }

  const dropdownHeight = Math.min(filtered.length, MAX_VISIBLE) * DROPDOWN_ITEM_HEIGHT

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
        <ScrollView
          ref={dropdownRef}
          style={[styles.dropdown, { height: dropdownHeight }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={filtered.length > MAX_VISIBLE}
          scrollEnabled={filtered.length > MAX_VISIBLE}
          nestedScrollEnabled
        >
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
        </ScrollView>
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
    height: DROPDOWN_ITEM_HEIGHT,
    justifyContent: 'center',
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
