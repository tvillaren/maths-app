# Maths App

A simple, kid-friendly math learning application built with React + TypeScript. Kids practice basic addition with numbers that sum to less than 10.

## 🚀 Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Vitest** - Testing framework
- **React Testing Library** - Component testing
- **Yarn** - Package manager

## 📦 Getting Started

### Install Dependencies

```bash
yarn install
```

### Development

Run the development server:

```bash
yarn dev
```

### Build

Build for production:

```bash
yarn build
```

### Preview

Preview the production build:

```bash
yarn preview
```

## 🧪 Testing

Run tests in watch mode:

```bash
yarn test
```

Run tests once:

```bash
yarn test:run
```

Run tests with UI:

```bash
yarn test:ui
```

## 🎮 Features

- **Simple Addition Practice**: Random equations where x + y < 10
- **Interactive Number Buttons**: Large, kid-friendly buttons (0-9)
- **Visual Feedback**:
  - ✅ Green for correct answers
  - ❌ Red for incorrect answers
- **Progressive Learning**: Arrow button appears after correct answer to move to next question

## 📁 Project Structure

```
src/
├── components/       # React components
│   ├── MathGame.tsx      # Main math game component
│   ├── MathGame.css      # Game styling
│   ├── MathGame.test.tsx # Game tests
│   ├── Counter.tsx       # Example counter component
│   └── Counter.test.tsx  # Counter tests
├── test/            # Test setup and utilities
│   └── setup.ts
├── App.tsx          # Main app component
└── main.tsx         # Application entry point
```

## 🛠️ Configuration

- `vite.config.ts` - Vite and Vitest configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Project dependencies and scripts
