import { useState, useEffect, useCallback, useRef } from 'react'
import './MathGame.css'

interface Question {
  x: number
  y: number
  answer: number
}

type GameState = 'start' | 'playing' | 'summary'

const GAME_DURATION = 30

const CircleTimer = ({ timeLeft }: { timeLeft: number }) => {
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const progress = (GAME_DURATION - timeLeft) / GAME_DURATION
  const dashoffset = circumference * (1 - progress)
  const isLastQuarter = timeLeft <= GAME_DURATION * 0.25

  return (
    <svg className="circle-timer" viewBox="0 0 100 100">
      <circle
        className="circle-timer-bg"
        cx="50"
        cy="50"
        r={radius}
      />
      <circle
        className="circle-timer-fill"
        cx="50"
        cy="50"
        r={radius}
        strokeDasharray={circumference}
        strokeDashoffset={dashoffset}
        stroke={isLastQuarter ? '#ef4444' : '#22c55e'}
      />
    </svg>
  )
}

export const MathGame = () => {
  const [gameState, setGameState] = useState<GameState>('start')
  const [question, setQuestion] = useState<Question>({ x: 0, y: 0, answer: 0 })
  const [userAnswer, setUserAnswer] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const startTimeRef = useRef<number>(0)
  const animFrameRef = useRef<number>(0)

  const generateQuestion = useCallback(() => {
    const x = Math.floor(Math.random() * 10)
    const maxY = Math.min(9, 9 - x)
    const y = Math.floor(Math.random() * (maxY + 1))

    setQuestion({ x, y, answer: x + y })
    setUserAnswer(null)
    setIsCorrect(null)
  }, [])

  const startGame = () => {
    setScore({ correct: 0, total: 0 })
    setTimeLeft(GAME_DURATION)
    setGameState('playing')
    startTimeRef.current = Date.now()
    generateQuestion()
  }

  useEffect(() => {
    if (gameState !== 'playing') return

    const tick = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      const remaining = Math.max(0, GAME_DURATION - elapsed)
      setTimeLeft(remaining)

      if (remaining <= 0) {
        setGameState('summary')
        return
      }
      animFrameRef.current = requestAnimationFrame(tick)
    }

    animFrameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [gameState])

  const handleNumberClick = (num: number) => {
    if (isCorrect) return

    setUserAnswer(num)
    const correct = num === question.answer
    setIsCorrect(correct)
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }))
  }

  const handleNext = () => {
    generateQuestion()
  }

  if (gameState === 'start') {
    return (
      <div className="math-game">
        <div className="start-screen">
          <button onClick={startGame} className="start-button">
            Start
          </button>
        </div>
      </div>
    )
  }

  if (gameState === 'summary') {
    return (
      <div className="math-game">
        <div className="summary-screen">
          <div className="summary-score">
            {score.correct} / {score.total}
          </div>
          <button onClick={startGame} className="start-button">
            Play again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="math-game">
      <div className="timer-container">
        <CircleTimer timeLeft={timeLeft} />
      </div>

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
