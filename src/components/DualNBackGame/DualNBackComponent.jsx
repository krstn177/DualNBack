import { useEffect, useState, useCallback } from 'react';
import styles from './DualNBackComponent.module.css'

export const DualNBackComponent = () => {
    const [nBackLevel, setNBackLevel] = useState(2);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeBlock, setActiveBlock] = useState(null);
    const [gridBlocks] = useState(Array(9).fill(null));
    const [pointsInRound, setPointsInRound] = useState(0);
    const [playerPoints, setPlayerPoints] = useState(0);

    // Helper function to create a delay
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const gameLoop = useCallback(async () => {
        let previousBlocks = []; // Initialize with invalid indices

        for (let index = 0; index < nBackLevel; index++) {
            const randomIndex = Math.floor(Math.random() * gridBlocks.length);
            setActiveBlock(randomIndex);
            await delay(2000);

            previousBlocks.push(randomIndex);
            setActiveBlock(null);
            await delay(2000);
        }
        
        for (let index = nBackLevel; index < 24; index++) {
            const randomIndex = Math.floor(Math.random() * gridBlocks.length);
            
            // Light up the block
            setActiveBlock(randomIndex);
            console.log(`Lit block: ${randomIndex}`);
            console.log(`Previous block: ${previousBlocks[index - nBackLevel]}`);
            if (previousBlocks[index - nBackLevel] === randomIndex) {
                console.log("We got a match!");
                setPointsInRound(prev => prev + 1);
            }
            await delay(2000);
            
            // Turn off the block
            previousBlocks.push(randomIndex);
            setActiveBlock(null);
            await delay(2000);
        }
    }, [gridBlocks.length, nBackLevel]); // Added nBackLevel to dependencies

    useEffect(() => {
        gameLoop();
    }, [gameLoop]);

    return (
        <>
            <div className={styles.container}>
                <div className={styles.grid}>
                    {gridBlocks.map((_, index) => (
                        <div key={index} data-lit={index === activeBlock}>
                            {index === activeBlock ? "lit" : "no"}
                        </div>
                    ))}
                </div>
                <div className={styles.scoreboard}>
                    <h2>Scoreboard</h2>
                    <p>Points in Round: {pointsInRound}</p>
                    <p>Total Points: {playerPoints}</p>
                </div>
            </div>
        </>
    )
}
