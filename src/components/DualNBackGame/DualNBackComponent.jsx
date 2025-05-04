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
    const [roundResult, setRoundResult] = useState(false);

    const guessedABlockNow = useRef(false);
    const [activeBlock, setActiveBlock] = useState(null);
    const [canGuess, setCanGuess] = useState(false);
    
    //TODO: Add a sound to the blocks when they are lit up OR Letters.
    //TODO: Add a counter for the rounds.
    //TODO: Give signal when game has failed.
    //TODO: Give signals on error and success.
    
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
        let previousBlocks = [];
        let currentActiveBlock = null;
        let playerPoints = 0;
        let errors = 0;
        let gameFailed = false;

        for (let index = 0; index < nBackLevel; index++) {
            if (!isRunning.current) return;
            const randomIndex = Math.floor(Math.random() * gridBlocks.length);
            currentActiveBlock = randomIndex;
            console.log(`Lit block: ${currentActiveBlock}`);
            setActiveBlock(currentActiveBlock);
            await delay(2000);

            if (!isRunning.current) return;
            previousBlocks.push(currentActiveBlock);
            currentActiveBlock = null;
            setActiveBlock(null);
            await delay(2000);
            setNumberOfRounds(prev => prev + 1);
        }
        
        for (let index = nBackLevel; index < 24; index++) {
            if (!isRunning.current) return;
            setRoundResult(false);
            const chanceToMatch = Math.random() < 0.2;
            const randomIndex = Math.floor(Math.random() * gridBlocks.length);

            if (chanceToMatch) {
                currentActiveBlock = previousBlocks[index - nBackLevel];
            } else {
                currentActiveBlock = randomIndex;
            }
            setActiveBlock(currentActiveBlock);

            setCanGuess(true);
            console.log(`Lit block: ${currentActiveBlock}`);
            console.log(`Previous block: ${previousBlocks[index - nBackLevel]}`);

            await delay(2000);
            
            if (!isRunning.current) return;
            if (previousBlocks[index - nBackLevel] === currentActiveBlock) {
                console.log("We got a match!");
                if (guessedABlockNow.current) {
                    playerPoints++;
                    setRoundResult(true);
                } else {
                    errors++;
                }
            } else {
                console.log("No match!");
                if (guessedABlockNow.current) {
                    errors++;
                } else {
                    playerPoints++;
                    setRoundResult(true);
                }
            }
            setCanGuess(false);
            setShowRoundResult(true);
            guessedABlockNow.current = false;
            previousBlocks.push(currentActiveBlock);
            currentActiveBlock = null;
            setActiveBlock(null);
            if (errors >= 4) {
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
            setResults(prev => [...prev, {playerPoints, errors, nBackLevel}]);
        }
    }, [gridBlocks.length, nBackLevel]);

    function startGame() {
        setNumberOfRounds(0);
        setActiveBlock(null);
        setIsPlaying(true);
        isRunning.current = true;
        gameLoop();
    }

    function stopGame() {
        isRunning.current = false;
        setActiveBlock(null);
        setIsPlaying(false);
    }

    function handleGuessClick(){
        if (isRunning.current && activeBlock !== null) {
            guessedABlockNow.current = true;
            setCanGuess(false);
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
                        </div>
                    ))}
                </div>
                <button 
                    disabled={!canGuess} 
                    className={`${styles.controlBtn} ${showRoundResult ? (roundResult ? styles.rightGuess : styles.wrongGuess) : ''}`}
                    onClick={handleGuessClick}
                >
                   Same Block Appeared {nBackLevel} Steps Ago?
                </button>
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
                            <li key={index}>
                                Game {index + 1}: {result.playerPoints}/{24-result.nBackLevel} OR {result.playerPoints/(24-result.nBackLevel) * 100}%, Errors: {result.errors}
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
