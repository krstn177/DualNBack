# Dual N-Back Memory Game

A React-based implementation of the Dual N-Back cognitive training game, designed to improve working memory and fluid intelligence.

## About the Game

The Dual N-Back game is a challenging cognitive exercise where players must remember and match patterns that appeared N steps ago. In this version:

- Players monitor a 3x3 grid where blocks light up in sequence
- Players must identify when the current block matches the position from N steps back
- Difficulty levels range from 1-back to 5-back
- Scores track correct matches, points earned, and errors made
- Game ends after 24 rounds or 4 errors

## Features

- Adjustable difficulty levels (1-5 back)
- Real-time score tracking
- Local storage for game results
- Retro-styled UI with pixel art aesthetics
- Responsive design for various screen sizes

## Technical Stack

- React 18+
- Vite for build tooling
- CSS Modules for styling
- Local Storage API for result persistence

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Run the development server:
```bash
npm run dev
```

## Future Improvements

- Add audio feedback for block interactions
- Implement a round counter
- Enhance scoring system
- Add additional visual patterns or letters
