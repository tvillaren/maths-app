import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MathGame } from './MathGame'

describe('MathGame', () => {
  it('renders an equation with two numbers and a plus sign', () => {
    render(<MathGame />)
    
    // Should have numbers displayed
    const operators = screen.getAllByText('+')
    expect(operators).toHaveLength(1)
    
    const equals = screen.getAllByText('=')
    expect(equals).toHaveLength(1)
  })

  it('renders 10 number buttons from 0 to 9', () => {
    render(<MathGame />)
    
    for (let i = 0; i < 10; i++) {
      const buttons = screen.getAllByRole('button', { name: i.toString() })
      expect(buttons.length).toBeGreaterThan(0)
    }
  })

  it('displays answer in green when correct', async () => {
    const user = userEvent.setup()
    const { container } = render(<MathGame />)
    
    // Get the equation by finding all text content
    const equationElement = screen.getByText('+').parentElement
    const numbers = equationElement?.textContent?.match(/\d+/g)
    
    if (numbers && numbers.length >= 2) {
      const x = parseInt(numbers[0])
      const y = parseInt(numbers[1])
      const correctAnswer = x + y
      
      // Click the correct answer button
      const correctButton = screen.getByRole('button', { name: correctAnswer.toString() })
      await user.click(correctButton)
      
      // Check that the answer is displayed in green (has correct class)
      const answerElement = container.querySelector('.answer.correct')
      expect(answerElement).toBeInTheDocument()
      expect(answerElement).toHaveTextContent(correctAnswer.toString())
    }
  })

  it('displays answer in red when incorrect', async () => {
    const user = userEvent.setup()
    const { container } = render(<MathGame />)
    
    // Get the equation
    const equationElement = screen.getByText('+').parentElement
    const numbers = equationElement?.textContent?.match(/\d+/g)
    
    if (numbers && numbers.length >= 2) {
      const x = parseInt(numbers[0])
      const y = parseInt(numbers[1])
      const correctAnswer = x + y
      
      // Find a wrong answer (any number that's not the correct answer)
      let wrongAnswer = (correctAnswer + 1) % 10
      
      // Click the wrong answer button
      const wrongButton = screen.getByRole('button', { name: wrongAnswer.toString() })
      await user.click(wrongButton)
      
      // Check that the answer is displayed in red (has incorrect class)
      const answerElement = container.querySelector('.answer.incorrect')
      expect(answerElement).toBeInTheDocument()
      expect(answerElement).toHaveTextContent(wrongAnswer.toString())
    }
  })

  it('shows next button only when answer is correct', async () => {
    const user = userEvent.setup()
    render(<MathGame />)
    
    // Next button should not be visible initially
    expect(screen.getByText('➜')).not.toBeVisible()
    
    // Get the equation and find correct answer
    const equationElement = screen.getByText('+').parentElement
    const numbers = equationElement?.textContent?.match(/\d+/g)
    
    if (numbers && numbers.length >= 2) {
      const x = parseInt(numbers[0])
      const y = parseInt(numbers[1])
      const correctAnswer = x + y
      
      // Click correct answer
      const correctButton = screen.getByRole('button', { name: correctAnswer.toString() })
      await user.click(correctButton)
      
      // Next button should now be visible
      expect(screen.getByText('➜')).toBeVisible()
    }
  })

  it('generates sum less than 10', () => {
    render(<MathGame />)
    
    // Get the equation
    const equationElement = screen.getByText('+').parentElement
    const numbers = equationElement?.textContent?.match(/\d+/g)
    
    if (numbers && numbers.length >= 2) {
      const x = parseInt(numbers[0])
      const y = parseInt(numbers[1])
      const sum = x + y
      
      expect(sum).toBeLessThan(10)
    }
  })
})

