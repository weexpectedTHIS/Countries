import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

interface Props {
  options: string[]
  correctAnswer: string
  selectedAnswer: string | null
  onAnswer: (answer: string) => void
}

export default function MultipleChoiceInput({ options, correctAnswer, selectedAnswer, onAnswer }: Props) {
  return (
    <View style={styles.container}>
      {options.map(option => {
        const isSelected = selectedAnswer === option
        const isCorrect = option === correctAnswer
        const revealed = selectedAnswer !== null

        return (
          <TouchableOpacity
            key={option}
            style={[
              styles.option,
              revealed && isCorrect && styles.optionCorrect,
              revealed && isSelected && !isCorrect && styles.optionWrong,
              revealed && !isSelected && !isCorrect && styles.optionDimmed,
            ]}
            onPress={() => onAnswer(option)}
            disabled={revealed}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.optionText,
                revealed && isCorrect && styles.optionTextCorrect,
                revealed && isSelected && !isCorrect && styles.optionTextWrong,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginTop: 8,
  },
  option: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  optionCorrect: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  optionWrong: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  optionDimmed: {
    opacity: 0.45,
  },
  optionText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    textAlign: 'center',
  },
  optionTextCorrect: {
    color: '#065F46',
  },
  optionTextWrong: {
    color: '#991B1B',
  },
})
