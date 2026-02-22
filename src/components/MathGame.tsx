import { useState, useEffect } from 'react'
import './MathGame.css'

interface Question {
  x: number
  y: number
  answer: number
}

export const MathGame = () => {
  const [question, setQuestion] = useState<Question>({ x: 0, y: 0, answer: 0 })
  const [userAnswer, setUserAnswer] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  const generateQuestion = () => {
    // Generate random numbers where x + y < 10
    const x = Math.floor(Math.random() * 10)
    const maxY = Math.min(9, 9 - x) // Ensure x + y < 10
    const y = Math.floor(Math.random() * (maxY + 1))
    
    setQuestion({ x, y, answer: x + y })
    setUserAnswer(null)
    setIsCorrect(null)
  }

  useEffect(() => {
    generateQuestion()
  }, [])

  const handleNumberClick = (num: number) => {
    // If already correct, don't allow new input
    if (isCorrect) return

    setUserAnswer(num)
    setIsCorrect(num === question.answer)
  }

  const handleNext = () => {
    generateQuestion()
  }

  return (
    <div className="math-game">
      <div className="equation-container">
        <div className="equation">
          <span className="number">{question.x}</span>
          <span className="operator">+</span>
          <span className="number">{question.y}</span>
          <span className="operator">=</span>
          {userAnswer !== null && (
            <span className={`answer ${isCorrect ? 'correct' : 'incorrect'}`}>
              {userAnswer}
            </span>
          )}
        </div>
      </div>

      <div className="controls-container">
        <div className="buttons-layout">
          <div className="number-buttons-wrapper">
            <div className="number-buttons-row">
              {[0, 1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num)}
                  className="number-button"
                  disabled={isCorrect === true}
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="number-buttons-row">
              {[5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num)}
                  className="number-button"
                  disabled={isCorrect === true}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleNext}
            className={`next-button ${isCorrect ? 'visible' : 'hidden'}`}
          >
            ➜
          </button>
        </div>
      </div>
    </div>
  )
}

