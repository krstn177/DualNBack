import { useState, useCallback, useRef, useEffect } from 'react';
import styles from './DualNBackComponent.module.css'

export const DualNBackComponent = () => {
    const [nBackLevel, setNBackLevel] = useState(2);
    const [gridBlocks] = useState(Array(9).fill(null));

    const [results, setResults] = useState([]);

    const isRunning = useRef(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const guessedABlockNow = useRef(false);
    const [activeBlock, setActiveBlock] = useState(null);
    const [canGuess, setCanGuess] = useState(false);
    
    //TODO: Add a sound to the blocks when they are lit up OR Letters.
    //TODO: Add a counter for the rounds.
    //TODO: Subtract points for errors. Make the calculation of points more adequate.
    

    
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
        let pointsInRound = 0;
        let playerPoints = 0;
        let errors = 0;

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
        }
        
        for (let index = nBackLevel; index < 24; index++) {
            if (!isRunning.current) return;
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
                pointsInRound++;
                if (guessedABlockNow.current) {
                    playerPoints++;
                } else {
                    errors++;
                }
            } else {
                console.log("No match!");
                if (guessedABlockNow.current) {
                    errors++;
                }
            }
            setCanGuess(false);
            guessedABlockNow.current = false;
            previousBlocks.push(currentActiveBlock);
            currentActiveBlock = null;
            setActiveBlock(null);
            if (errors >= 4) {
                console.log("Game Over! Too many errors.");
                break;
            }
            await delay(2000);
        }
        setIsPlaying(false);
        isRunning.current = false;
        setResults(prev => [...prev, {pointsInRound, playerPoints, errors}]);
    }, [gridBlocks.length, nBackLevel]);

    function startGame() {
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
                    className={styles.controlBtn}
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
                    <h3>Results:</h3>
                    <ul className={styles.resultsList}>
                    {results.length === 0 
                        ? 
                        <li>No results yet.</li> 
                        : 
                        results.map((result, index) => (
                            <li key={index}>
                                Game {index + 1}: {result.playerPoints}/{result.pointsInRound} OR {result.playerPoints/result.pointsInRound * 100}%, Errors: {result.errors}
                            </li>
                        ))
                    }
                    </ul>
                </div>
            </div>
        </div>
    )
}
