import { useState, useEffect, useCallback, useRef } from 'react'
import './MathGame.css'

interface Question {
  x: number
  y: number
  answer: number
}

type GameState = 'start' | 'playing' | 'win' | 'lose'

const GAME_DURATION = 30
const STARS_TO_WIN = 3

const CircleTimer = ({ timeLeft }: { timeLeft: number }) => {
  const radius = 45
  const progress = (GAME_DURATION - timeLeft) / GAME_DURATION
  const isLastQuarter = timeLeft <= GAME_DURATION * 0.25
  const color = isLastQuarter ? '#ef4444' : '#22c55e'

  const slicePath = () => {
    if (progress <= 0) return ''
    if (progress >= 1) return ''

    const angle = 360 * progress
    const endAngleRad = ((angle - 90) * Math.PI) / 180
    const endX = 50 + radius * Math.cos(endAngleRad)
    const endY = 50 + radius * Math.sin(endAngleRad)
    const largeArc = angle > 180 ? 1 : 0

    return `M 50 50 L 50 ${50 - radius} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY} Z`
  }

  return (
    <svg className={`circle-timer ${isLastQuarter ? 'circle-timer-urgent' : ''}`} viewBox="0 0 100 100">
      <circle className="circle-timer-bg" cx="50" cy="50" r={radius} />
      {progress >= 1 ? (
        <circle cx="50" cy="50" r={radius} fill={color} />
      ) : progress > 0 ? (
        <path d={slicePath()} fill={color} className="circle-timer-fill" />
      ) : null}
    </svg>
  )
}

const Stars = ({ earned }: { earned: number }) => (
  <div className="stars-container">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className={`star ${i < earned ? 'star-earned' : 'star-empty'}`}
      >
        ★
      </span>
    ))}
  </div>
)

export const MathGame = () => {
  const [gameState, setGameState] = useState<GameState>('start')
  const [question, setQuestion] = useState<Question>({ x: 0, y: 0, answer: 0 })
  const [userAnswer, setUserAnswer] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [stars, setStars] = useState(0)
  const [level, setLevel] = useState(1)
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

  const startLevel = useCallback(() => {
    setStars(0)
    setTimeLeft(GAME_DURATION)
    setGameState('playing')
    startTimeRef.current = Date.now()
    generateQuestion()
  }, [generateQuestion])

  const handleNextLevel = () => {
    setLevel((prev) => prev + 1)
    startLevel()
  }

  const handleRetry = () => {
    startLevel()
  }

  useEffect(() => {
    if (gameState !== 'playing') return

    const tick = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      const remaining = Math.max(0, GAME_DURATION - elapsed)
      setTimeLeft(remaining)

      if (remaining <= 0) {
        setGameState('lose')
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

    if (correct) {
      const newStars = stars + 1
      setStars(newStars)
      if (newStars >= STARS_TO_WIN) {
        setGameState('win')
      }
    }
  }

  const handleNext = () => {
    generateQuestion()
  }

  if (gameState === 'start') {
    return (
      <div className="math-game">
        <div className="start-screen">
          <button onClick={startLevel} className="start-button">
            Start
          </button>
        </div>
      </div>
    )
  }

  if (gameState === 'win') {
    return (
      <div className="math-game">
        <div className="summary-screen">
          <Stars earned={STARS_TO_WIN} />
          <div className="result-message win-message">Level {level} complete!</div>
          <button onClick={handleNextLevel} className="start-button">
            Next Level
          </button>
        </div>
      </div>
    )
  }

  if (gameState === 'lose') {
    return (
      <div className="math-game">
        <div className="summary-screen">
          <Stars earned={stars} />
          <div className="result-message lose-message">Time's up!</div>
          <button onClick={handleRetry} className="start-button retry-button">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="math-game">
      <div className="top-bar">
        <div className="level-label">Level {level}</div>
        <Stars earned={stars} />
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
            className={`next-button ${isCorrect && stars < STARS_TO_WIN ? 'visible' : 'hidden'}`}
          >
            ➜
          </button>
        </div>
      </div>
    </div>
  )
}
