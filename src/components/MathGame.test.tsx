import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MathGame } from './MathGame'

const startGame = async (user: ReturnType<typeof userEvent.setup>) => {
  const startButton = screen.getByRole('button', { name: 'Start' })
  await user.click(startButton)
}

const getCorrectAnswer = () => {
  const equationElement = screen.getByText('+').parentElement
  const numbers = equationElement?.textContent?.match(/\d+/g)
  if (!numbers || numbers.length < 2) throw new Error('Could not parse equation')
  return parseInt(numbers[0]) + parseInt(numbers[1])
}

const answerCorrectly = async (user: ReturnType<typeof userEvent.setup>) => {
  const correctAnswer = getCorrectAnswer()
  const correctButton = screen.getByRole('button', { name: correctAnswer.toString() })
  await user.click(correctButton)
}

describe('MathGame', () => {
  it('renders a start button initially', () => {
    render(<MathGame />)
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
  })

  it('renders an equation with two numbers and a plus sign', async () => {
    const user = userEvent.setup()
    render(<MathGame />)
    await startGame(user)

    const operators = screen.getAllByText('+')
    expect(operators).toHaveLength(1)

    const equals = screen.getAllByText('=')
    expect(equals).toHaveLength(1)
  })

  it('renders 10 number buttons from 0 to 9', async () => {
    const user = userEvent.setup()
    render(<MathGame />)
    await startGame(user)

    for (let i = 0; i < 10; i++) {
      const buttons = screen.getAllByRole('button', { name: i.toString() })
      expect(buttons.length).toBeGreaterThan(0)
    }
  })

  it('displays answer in green when correct', async () => {
    const user = userEvent.setup()
    const { container } = render(<MathGame />)
    await startGame(user)

    await answerCorrectly(user)

    const answerElement = container.querySelector('.answer.correct')
    expect(answerElement).toBeInTheDocument()
  })

  it('displays answer in red when incorrect', async () => {
    const user = userEvent.setup()
    const { container } = render(<MathGame />)
    await startGame(user)

    const correctAnswer = getCorrectAnswer()
    const wrongAnswer = (correctAnswer + 1) % 10
    const wrongButton = screen.getByRole('button', { name: wrongAnswer.toString() })
    await user.click(wrongButton)

    const answerElement = container.querySelector('.answer.incorrect')
    expect(answerElement).toBeInTheDocument()
    expect(answerElement).toHaveTextContent(wrongAnswer.toString())
  })

  it('shows next button only when answer is correct', async () => {
    const user = userEvent.setup()
    render(<MathGame />)
    await startGame(user)

    expect(screen.getByText('➜')).not.toBeVisible()

    await answerCorrectly(user)

    expect(screen.getByText('➜')).toBeVisible()
  })

  it('generates sum less than 10', async () => {
    const user = userEvent.setup()
    render(<MathGame />)
    await startGame(user)

    const equationElement = screen.getByText('+').parentElement
    const numbers = equationElement?.textContent?.match(/\d+/g)

    if (numbers && numbers.length >= 2) {
      const x = parseInt(numbers[0])
      const y = parseInt(numbers[1])
      const sum = x + y

      expect(sum).toBeLessThan(10)
    }
  })

  it('shows 3 empty stars during gameplay', async () => {
    const user = userEvent.setup()
    const { container } = render(<MathGame />)
    await startGame(user)

    const stars = container.querySelectorAll('.star')
    expect(stars).toHaveLength(3)

    const emptyStars = container.querySelectorAll('.star-empty')
    expect(emptyStars).toHaveLength(3)
  })

  it('earns a star on correct answer', async () => {
    const user = userEvent.setup()
    const { container } = render(<MathGame />)
    await startGame(user)

    await answerCorrectly(user)

    const earnedStars = container.querySelectorAll('.star-earned')
    expect(earnedStars).toHaveLength(1)
  })

  it('shows win screen after 3 correct answers', async () => {
    const user = userEvent.setup()
    render(<MathGame />)
    await startGame(user)

    for (let i = 0; i < 3; i++) {
      await answerCorrectly(user)
      if (i < 2) {
        await user.click(screen.getByText('➜'))
      }
    }

    expect(screen.getByText(/Level 1 complete!/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next Level' })).toBeInTheDocument()
  })

  it('advances to next level on Next Level click', async () => {
    const user = userEvent.setup()
    render(<MathGame />)
    await startGame(user)

    for (let i = 0; i < 3; i++) {
      await answerCorrectly(user)
      if (i < 2) {
        await user.click(screen.getByText('➜'))
      }
    }

    await user.click(screen.getByRole('button', { name: 'Next Level' }))

    expect(screen.getByText('Level 2')).toBeInTheDocument()
  })

  it('displays level label during gameplay', async () => {
    const user = userEvent.setup()
    render(<MathGame />)
    await startGame(user)

    expect(screen.getByText('Level 1')).toBeInTheDocument()
  })
})
