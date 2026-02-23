# Plan: Replace Number Keyboard with TensorFlow.js Drawing Recognition

## Overview
Replace the 0-9 button grid in `MathGame.tsx` with a canvas-based drawing area where the user draws a digit, which is then recognized using a TensorFlow.js pre-trained MNIST CNN model.

## Architecture

The current flow:
```
User clicks button → handleNumberClick(num) → validates against question.answer
```

The new flow:
```
User draws on canvas → clicks Submit → preprocess canvas → TF.js model predicts digit → handleNumberClick(predicted) → validates against question.answer
```

Key insight: `handleNumberClick(num: number)` stays unchanged. We only replace the **input method** — the rest of the game logic (validation, stars, timer, next question) is untouched.

---

## Step 1: Install TensorFlow.js dependency

**File:** `package.json`

```bash
npm install @tensorflow/tfjs
```

We use `@tensorflow/tfjs` which includes both the core library and the browser backend (WebGL). No separate model package needed — we'll load a pre-trained model from a static JSON file.

---

## Step 2: Train & export an MNIST model (offline script)

**New file:** `scripts/train-mnist-model.ts`

Create a Node.js script that:
1. Loads the MNIST dataset via `tfjs` data utilities
2. Builds a small CNN (2 conv layers + dense, ~100KB when saved)
3. Trains it to ~98%+ accuracy
4. Saves the model to `public/mnist-model/model.json` + weight shard files

This runs once at dev time. The exported model files are committed to the repo so they're served as static assets by Vite from `public/`.

**Output:** `public/mnist-model/model.json` + `public/mnist-model/group1-shard1of1.bin`

Alternative: we can use a well-known pre-hosted MNIST model, but bundling it locally ensures offline support and no external dependency.

---

## Step 3: Create `DrawingCanvas` component

**New file:** `src/components/DrawingCanvas.tsx`

A self-contained React component that provides a drawable canvas with digit recognition.

### Props
```tsx
interface DrawingCanvasProps {
  onDigitRecognized: (digit: number) => void
  disabled: boolean
}
```

### Responsibilities
1. **Canvas drawing** — Handle mouse and touch events (mousedown/move/up, touchstart/move/end) to let the user draw with a thick white stroke on a black background (matching MNIST format).
2. **Clear button** — Reset the canvas.
3. **Submit button** — Trigger recognition pipeline.
4. **Model loading** — Load the TF.js model from `/mnist-model/model.json` once (on mount or lazily). Cache it in a module-level variable so it survives re-renders and re-mounts.
5. **Preprocessing** — On submit:
   - Get canvas image data
   - Find the bounding box of the drawn content
   - Crop and center the digit into a 20x20 area within a 28x28 image (matching MNIST centering)
   - Convert to grayscale, normalize pixel values to [0, 1]
   - Reshape to tensor [1, 28, 28, 1]
6. **Inference** — Run `model.predict(tensor)`, get argmax → predicted digit.
7. **Call `onDigitRecognized(digit)`** with the result.

### UX Details
- Canvas size: responsive, similar footprint to current button grid (~280px square on mobile, larger on desktop)
- Stroke: thick line (~12-16px) in white on black background for contrast
- After recognition, briefly show the predicted digit on the canvas before clearing
- Disable drawing + buttons when `disabled` prop is true (same as current number buttons being disabled after answer)

---

## Step 4: Create `DrawingCanvas.css`

**New file:** `src/components/DrawingCanvas.css`

Style the canvas and its controls:
- `.drawing-canvas-container` — wrapper, flex column, centered
- `.drawing-canvas` — the `<canvas>` element, border, rounded corners, touch-action: none (prevents scrolling while drawing)
- `.drawing-controls` — row of Clear/Submit buttons below canvas
- `.clear-button` / `.submit-button` — styled consistently with existing app buttons
- Responsive breakpoints matching existing ones in `MathGame.css`

---

## Step 5: Integrate into `MathGame.tsx`

**File:** `src/components/MathGame.tsx`

### Changes:
1. **Import** `DrawingCanvas` component
2. **Replace the controls-container div** (lines 198-234) — swap out the number buttons and next button with:
   ```tsx
   <div className="controls-container">
     <DrawingCanvas
       onDigitRecognized={handleNumberClick}
       disabled={isCorrect === true}
     />
     <button
       onClick={handleNext}
       className={`next-button ${isCorrect && stars < STARS_TO_WIN ? 'visible' : 'hidden'}`}
     >
       ➜
     </button>
   </div>
   ```
3. The `handleNumberClick` function remains exactly the same — it receives a number and validates it.

### What stays the same:
- All game state logic (stars, timer, levels, win/lose)
- Equation display
- CircleTimer and Stars components
- Start/Win/Lose screens
- `handleNumberClick`, `handleNext`, `generateQuestion`, etc.

---

## Step 6: Update CSS for new layout

**File:** `src/components/MathGame.css`

- Remove or keep `.number-button*` and `.number-buttons-*` styles (keep for now if we want a toggle, or remove for clean-up)
- Adjust `.controls-container` if needed for the canvas layout
- Update `.next-button` positioning to work alongside canvas instead of button grid
- Add responsive rules for the canvas at existing breakpoints

---

## Step 7: Clear canvas on new question

**File:** `src/components/DrawingCanvas.tsx` + `MathGame.tsx`

When the user clicks "Next" (➜) to go to the next question, the canvas must be cleared. Options:
- Pass a `key` prop tied to question identity so React remounts the canvas
- Or expose a `ref` with a `clear()` method
- Simplest: use a `clearTrigger` counter prop — increment it in `handleNext`, and the canvas clears via `useEffect` watching that prop

---

## Step 8: Update tests

**File:** `src/components/MathGame.test.tsx`

The existing tests interact with number buttons (`getByRole('button', { name: '5' })`). These need updating:

1. **Mock TensorFlow.js** — The model loading and inference should be mocked in tests so tests don't need the actual model files or TF.js runtime.
2. **Update `answerCorrectly` helper** — Instead of clicking a button, simulate the `onDigitRecognized` callback. Since `DrawingCanvas` is a child component, we can either:
   - Mock the `DrawingCanvas` component entirely in tests
   - Or test at a higher level using the callback
3. **Remove button-specific tests** — "renders 10 number buttons" test becomes irrelevant
4. **Add DrawingCanvas unit tests** — Separate test file for canvas behavior (drawing, clearing, submit)

---

## Step 9: Add model loading state / UX

**File:** `src/components/DrawingCanvas.tsx`

Handle the async model loading gracefully:
- Show a loading indicator while the model loads on first use
- Cache the loaded model so subsequent renders are instant
- Handle load failure with a friendly error message

---

## File Change Summary

| File | Action |
|------|--------|
| `package.json` | Add `@tensorflow/tfjs` dependency |
| `scripts/train-mnist-model.ts` | New — offline script to train and export model |
| `public/mnist-model/model.json` | New — exported model topology |
| `public/mnist-model/group1-shard1of1.bin` | New — exported model weights |
| `src/components/DrawingCanvas.tsx` | New — canvas + recognition component |
| `src/components/DrawingCanvas.css` | New — canvas styling |
| `src/components/MathGame.tsx` | Edit — swap buttons for DrawingCanvas |
| `src/components/MathGame.css` | Edit — adjust layout, clean up button styles |
| `src/components/MathGame.test.tsx` | Edit — mock TF.js, update interaction tests |

## Risks & Mitigations

1. **Child handwriting accuracy** — Kids write messily. Mitigation: thick stroke, good preprocessing (centering, scaling), and possibly showing the recognized digit so they can retry.
2. **Model load time** — ~1-3MB on first load. Mitigation: lazy load during start screen, cache in memory.
3. **Mobile touch conflicts** — Drawing on canvas may conflict with page scroll. Mitigation: `touch-action: none` CSS on canvas, `preventDefault()` on touch events.
4. **UX speed** — Current button tap is instant; drawing is slower. Mitigation: keep the interaction simple (draw + tap submit), consider auto-submit after a pause in drawing.
