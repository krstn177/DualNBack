import { useState, useCallback, useRef, useEffect } from 'react';
import styles from './DualNBackComponent.module.css'

export const DualNBackComponent = () => {
    const [nBackLevel, setNBackLevel] = useState(2);
    const [gridBlocks] = useState(Array(9).fill(null));
    const [numberOfRounds, setNumberOfRounds] = useState(0);

    const [results, setResults] = useState([]);

    const isRunning = useRef(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showRoundResult, setShowRoundResult] = useState(false);
    const [roundResultBlock, setRoundResultBlock] = useState(false);
    const [roundResultLetter, setRoundResultLetter] = useState(false);

    const guessedABlockNow = useRef(false);
    const guessedALetterNow = useRef(false);

    const [activeBlock, setActiveBlock] = useState(null);
    const [activeLetter, setActiveLetter] = useState(null);

    const [canGuessBlock, setCanGuessBlock] = useState(false);
    const [canGuessLetter, setCanGuessLetter] = useState(false);
    
    //TODO: Add a sound to the blocks when they are lit up OR Letters.
    
    useEffect(() => {
        const storedResults = localStorage.getItem('results');
        if (storedResults) {
            setResults(JSON.parse(storedResults));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('results', JSON.stringify(results));
    }, [results]);

    // Helper function to create a delay
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const gameLoop = useCallback(async () => {
        const letters = ['C', 'H', 'K', 'L', 'Q', 'R', 'S', 'T'];

        let previousBlocks = [];
        let currentActiveBlock = null;
        let previousLetters = [];
        let currentActiveLetter = null;

        let playerPointsBlocks = 0;
        let playerPointsLetters = 0;
        let errors = 0;
        let gameFailed = false;

        for (let index = 0; index < nBackLevel; index++) {
            if (!isRunning.current) return;
            const randomIndex = Math.floor(Math.random() * gridBlocks.length);
            const randomLetter = letters[Math.floor(Math.random() * letters.length)];

            currentActiveBlock = randomIndex;
            currentActiveLetter = randomLetter;

            console.log(`Lit block: ${currentActiveBlock}`);
            console.log(`Lit letter: ${currentActiveLetter}`);

            setActiveBlock(currentActiveBlock);
            setActiveLetter(currentActiveLetter);

            await delay(2000);

            if (!isRunning.current) return;
            previousBlocks.push(currentActiveBlock);
            previousLetters.push(currentActiveLetter);

            currentActiveBlock = null;
            currentActiveLetter = null;

            setActiveBlock(null);
            setActiveLetter(null);

            await delay(2000);
            setNumberOfRounds(prev => prev + 1);
        }
        
        for (let index = nBackLevel; index < 24; index++) {
            if (!isRunning.current) return;
            setRoundResultBlock(false);
            setRoundResultLetter(false);

            const chanceToMatchBlock = Math.random() < 0.2;
            const chanceToMatchLetter = Math.random() < 0.2;
            const randomIndexBlocks = Math.floor(Math.random() * gridBlocks.length);
            const randomLetter = letters[Math.floor(Math.random() * letters.length)];


            if (chanceToMatchBlock) {
                currentActiveBlock = previousBlocks[index - nBackLevel];
            } else {
                currentActiveBlock = randomIndexBlocks;
            }
            setActiveBlock(currentActiveBlock);

            if (chanceToMatchLetter) {
                currentActiveLetter = previousLetters[index - nBackLevel];
            } else {
                currentActiveLetter = randomLetter;
            }
            setActiveLetter(currentActiveLetter);

            setCanGuessBlock(true);
            setCanGuessLetter(true);

            console.log(`Lit block: ${currentActiveBlock}`);
            console.log(`Previous block: ${previousBlocks[index - nBackLevel]}`);

            console.log(`Lit letter: ${currentActiveLetter}`);
            console.log(`Previous letter: ${previousLetters[index - nBackLevel]}`);

            await delay(2000);
            
            if (!isRunning.current) return;
            if (previousBlocks[index - nBackLevel] === currentActiveBlock) {
                console.log("We got a match!");
                if (guessedABlockNow.current) {
                    playerPointsBlocks++;
                    setRoundResultBlock(true);
                } else {
                    errors++;
                }
            } else {
                console.log("No match!");
                if (guessedABlockNow.current) {
                    errors++;
                } else {
                    playerPointsBlocks++;
                    setRoundResultBlock(true);
                }
            }

            if (previousLetters[index - nBackLevel] === currentActiveLetter) {
                console.log("We got a match!");
                if (guessedALetterNow.current) {
                    playerPointsLetters++;
                    setRoundResultLetter(true);
                } else {
                    errors++;
                }
            } else {
                console.log("No match!");
                if (guessedALetterNow.current) {
                    errors++;
                } else {
                    playerPointsLetters++;
                    setRoundResultLetter(true);
                }
            }

            setCanGuessBlock(false);
            setCanGuessLetter(false);

            setShowRoundResult(true);

            guessedABlockNow.current = false;
            guessedALetterNow.current = false;

            previousBlocks.push(currentActiveBlock);
            previousLetters.push(currentActiveLetter);

            currentActiveBlock = null;
            currentActiveLetter = null;

            setActiveLetter(null);
            setActiveBlock(null);
            if (errors >= 8) {
                alert("Game Over! Too many errors.");
                gameFailed = true;
                break;
            }

            await delay(1000);
            setShowRoundResult(false);
            
            await delay(1000);
            setNumberOfRounds(prev => prev + 1);
        }
        setIsPlaying(false);
        isRunning.current = false;
        if (!gameFailed) {
            setResults(prev => [...prev, {playerPointsBlocks, playerPointsLetters, errors, nBackLevel}]);
        }
    }, [gridBlocks.length, nBackLevel]);

    function startGame() {
        setNumberOfRounds(0);
        setActiveBlock(null);
        setActiveLetter(null);
        setIsPlaying(true);
        isRunning.current = true;
        gameLoop();
    }

    function stopGame() {
        isRunning.current = false;
        setActiveBlock(null);
        setActiveLetter(null);
        setIsPlaying(false);
    }

    function handleGuessClickBlock(){
        if (isRunning.current && activeBlock !== null) {
            guessedABlockNow.current = true;
            setCanGuessBlock(false);
        }
    }

    function handleGuessClickLetter(){
        if (isRunning.current && activeLetter !== null) {
            guessedALetterNow.current = true;
            setCanGuessLetter(false);
        }
    }

    function clearResults() {
        setResults([]);
        localStorage.removeItem('results');
    }

    return (
        <div className={styles.container}>
            <div className={styles.gridContainer}>
                <div className={styles.grid}>
                    {gridBlocks.map((_, index) => (
                        <div key={index} data-lit={index === activeBlock}>
                            {index === activeBlock && activeLetter}
                        </div>
                    ))}
                </div>
                <div className={styles.guessBtnContainer}>
                    <button 
                        disabled={!canGuessBlock} 
                        className={`${styles.controlBtn} ${showRoundResult ? (roundResultBlock ? styles.rightGuess : styles.wrongGuess) : ''}`}
                        onClick={handleGuessClickBlock}
                    >
                    Position
                    </button>
                    <button 
                        disabled={!canGuessLetter} 
                        className={`${styles.controlBtn} ${showRoundResult ? (roundResultLetter ? styles.rightGuess : styles.wrongGuess) : ''}`}
                        onClick={handleGuessClickLetter}
                    >
                    Letter
                    </button>
                </div>
            </div>
            <div className={styles.panel}>
                <div className={styles.controls}>
                    <button 
                        className={styles.controlBtn} 
                        onClick={isPlaying ? stopGame : startGame}
                    >
                        {isPlaying ? "Stop" : "Play"}
                    </button>
                    <select className={styles.levelSelect} onChange={(e) => setNBackLevel(Number(e.target.value))} value={nBackLevel}>
                        <option value="1">1-back</option>
                        <option value="2">2-back</option>
                        <option value="3">3-back</option>
                        <option value="4">4-back</option>
                        <option value="5">5-back</option>
                    </select>
                </div>

                <div className={styles.scoreboard}>
                    <h2>Scoreboard</h2>
                    {isPlaying && <p className={styles.roundsCounter}>Rounds: {numberOfRounds}/24</p>}
                    <h3>Results:</h3>
                    <ul className={styles.resultsList}>
                    {results.length === 0 
                        ? 
                        <li>No results yet.</li> 
                        : 
                        [...results].reverse().map((result, index) => (
                            <li key={results.length - index - 1}>
                                Game {results.length - index}: Positions: {result.playerPointsBlocks}/{24-result.nBackLevel} OR {(result.playerPointsBlocks/(24-result.nBackLevel) * 100).toFixed(2)}%, Letters: {result.playerPointsLetters}/{24-result.nBackLevel} OR {(result.playerPointsLetters/(24-result.nBackLevel) * 100).toFixed(2)}%, Errors: {result.errors}
                            </li>
                        ))
                    }
                    </ul>
                </div>
                {results.length > 0 && <button className={styles.controlBtn} onClick={clearResults}>Clear Results</button>}
            </div>
        </div>
    )
}
