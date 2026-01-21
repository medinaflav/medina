import React, { useState, useEffect } from 'react';
import { recordAttempt } from '../utils/statsManager';
import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from '@dnd-kit/core';
import DraggableTile from './DraggableTile';
import DroppableSlot from './DroppableSlot';
import { getLetter, ALPHABET } from '../data/alphabet';
import './WordPuzzle.css';

export default function WordPuzzle({ word, onStateChange, showFeedback, showVowels, isLocked, initialState }) {
    const [placedLetters, setPlacedLetters] = useState({}); // { slotIndex: tileId }
    const [shuffledTiles, setShuffledTiles] = useState([]);
    const [activeId, setActiveId] = useState(null); // ID of currently dragged item

    // Initialize/Reset
    useEffect(() => {
        // Restore state if provided
        if (initialState && initialState.shuffledTiles && initialState.shuffledTiles.length > 0 && initialState.wordText === word.text) {
            setShuffledTiles(initialState.shuffledTiles);
            setPlacedLetters(initialState.placedLetters || {});
            return;
        }

        // 1. Create correct tiles
        const correctTiles = word.letters.map((id, index) => ({
            id: `correct-${id}-${index}-${Math.random()}`,
            letterId: id,
            type: 'correct'
        }));

        // 2. Create distractors
        // We want total tiles to be an even number
        const correctCount = word.letters.length;
        let distractorCount = 3; // Start with minimum 3

        let totalNeeded = correctCount + distractorCount;
        if (totalNeeded % 2 !== 0) {
            distractorCount += 1; // Add 1 to make it even
        }

        const availableDistractors = ALPHABET.filter(l => !word.letters.includes(l.id));
        const shuffledAvailable = [...availableDistractors].sort(() => Math.random() - 0.5);
        const selectedDistractors = shuffledAvailable.slice(0, distractorCount);

        const distractorTiles = selectedDistractors.map((letter, i) => ({
            id: `distractor-${letter.id}-${i}-${Math.random()}`,
            letterId: letter.id,
            type: 'distractor'
        }));

        // 3. Combine and shuffle
        setShuffledTiles([...correctTiles, ...distractorTiles].sort(() => Math.random() - 0.5));
        setPlacedLetters({});
    }, [word, initialState]); // Added initialState to deps

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const handleDragStart = (event) => {
        if (isLocked) return;
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        if (isLocked) return;
        const { active, over } = event;
        setActiveId(null);

        if (over) {
            const slotIndex = parseInt(over.id); // Ensure index is int
            const tileId = active.id;

            // Analytics
            const draggedTile = shuffledTiles.find(t => t.id === tileId);
            if (draggedTile) {
                const expectedLetterId = word.letters[slotIndex];
                const isCorrect = draggedTile.letterId === expectedLetterId;
                recordAttempt(expectedLetterId, slotIndex, isCorrect);
            }

            setPlacedLetters(prev => {
                const existingSlot = Object.keys(prev).find(key => prev[key] === tileId);
                const newPlacement = { ...prev };
                if (existingSlot) delete newPlacement[existingSlot];
                newPlacement[slotIndex] = tileId;
                return newPlacement;
            });
        } else {
            // Return to dock
            const tileId = active.id;
            setPlacedLetters(prev => {
                const existingSlot = Object.keys(prev).find(key => prev[key] === tileId);
                if (existingSlot) {
                    const newPlacement = { ...prev };
                    delete newPlacement[existingSlot];
                    return newPlacement;
                }
                return prev;
            });
        }
    };

    // Check status
    useEffect(() => {
        const isFilled = word.letters.every((_, index) => placedLetters[index] !== undefined);

        const results = word.letters.map((expectedId, index) => {
            const placedTileId = placedLetters[index];
            const tile = shuffledTiles.find(t => t.id === placedTileId);
            const isCorrect = tile && tile.letterId === expectedId;
            return { index, expectedId, placedTileId, isCorrect: !!isCorrect };
        });

        const isCorrect = isFilled && results.every(r => r.isCorrect);

        onStateChange({
            isFilled,
            isCorrect,
            results,
            shuffledTiles,
            placedLetters
        });
    }, [placedLetters, word, shuffledTiles, onStateChange]);

    const dockTiles = shuffledTiles.filter(tile => !Object.values(placedLetters).includes(tile.id));
    const activeTile = shuffledTiles.find(t => t.id === activeId);

    const handleTileClick = (tileId) => {
        if (isLocked) return;

        const placedSlotIndex = Object.keys(placedLetters).find(key => placedLetters[key] === tileId);
        if (placedSlotIndex) {
            // Remove from slot
            setPlacedLetters(prev => {
                const copy = { ...prev };
                delete copy[placedSlotIndex];
                return copy;
            });
            return;
        }

        // Place in first empty slot (RTL check handled by findIndex logic naturally? 
        // findIndex scans 0..N. Word is displayed RTL visually but array is 0..N.
        // 0 is the start of the word (Rightmost in Arabic). 
        // So checking 0 first is correct for "First available letter from start of word".
        const emptySlotIndex = word.letters.findIndex((_, index) => !placedLetters[index]);

        if (emptySlotIndex !== -1) {
            setPlacedLetters(prev => ({ ...prev, [emptySlotIndex]: tileId }));
        }
    };

    // Derived Logic for Success/Feedback display
    const isAllFilled = word.letters.every((_, index) => placedLetters[index]);
    const isAllCorrect = isAllFilled && word.letters.every((expectedId, index) => {
        const tileId = placedLetters[index];
        const tile = shuffledTiles.find(t => t.id === tileId);
        return tile && tile.letterId === expectedId;
    });
    const isErrorFeedback = showFeedback && !isAllCorrect;
    const isSuccessFeedback = (isLocked || (showFeedback && isAllCorrect)) && !isErrorFeedback;

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="puzzle-container" style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
                {/* Word Display */}
                <div className="puzzle-word-display">
                    <h3 className="puzzle-main-word">
                        {showVowels ? (word.vocalizedText || word.text) : word.text}
                    </h3>
                    <div className="puzzle-instruction">Associez les phonétiques au mot arabe</div>
                </div>

                {/* Feedback: ERROR */}
                {isErrorFeedback && (
                    <div className="feedback-box feedback-error fade-in">
                        <div className="feedback-label">Correction</div>
                        <div className="correction-grid">
                            {word.letters.map((id, index) => {
                                const letter = getLetter(id);
                                return (
                                    <div key={index} className="correction-item">
                                        <span className="correction-char">{letter.char}</span>
                                        <span className="correction-translit">{letter.transliteration}</span>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="translation-section">
                            <span className="translation-label">TRADUCTION</span>
                            <span className="translation-text">{word.transliteration}</span>
                        </div>
                        <div style={{ marginTop: '0.5rem' }}>
                            <span className="translation-meaning">"{word.translation}"</span>
                        </div>
                    </div>
                )}

                {/* Feedback: SUCCESS / LOCKED */}
                {isSuccessFeedback && (
                    <div className="feedback-box feedback-success fade-in">
                        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '1.2rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                            <span className="translation-label">TRADUCTION</span>
                            "{word.translation}"
                            {/* <span className="block mt-2 font-bold text-xl">{word.transliteration}</span> if needed */}
                        </div>
                    </div>
                )}

                {/* Droppable Slots */}
                <div className="slots-container">
                    {word.letters.map((expectedId, index) => {
                        const placedTileId = placedLetters[index];
                        const placedTile = placedTileId ? shuffledTiles.find(t => t.id === placedTileId) : null;
                        const letterInfo = placedTile ? getLetter(placedTile.letterId) : null;
                        const isCorrectTile = placedTile && placedTile.letterId === expectedId;

                        const isCorrect = showFeedback && isCorrectTile;
                        const isError = showFeedback && placedTile && !isCorrectTile;

                        return (
                            <DroppableSlot
                                key={index}
                                id={index}
                                isCorrect={isCorrect}
                                isError={isError}
                                onClick={() => (!isLocked && placedTile) ? handleTileClick(placedTile.id) : null}
                            >
                                {placedTile && letterInfo && (
                                    <div
                                        onClick={(e) => {
                                            if (!isLocked) {
                                                e.stopPropagation(); // Prevent slot click? Actually slot click handles it too.
                                                handleTileClick(placedTile.id);
                                            }
                                        }}
                                        style={{ cursor: isLocked ? 'default' : 'pointer' }}
                                    >
                                        <DraggableTile
                                            id={placedTile.id}
                                            char={letterInfo.transliteration}
                                            name={letterInfo.name}
                                            arabicChar={letterInfo.char}
                                            arabicName={letterInfo.arabicName}
                                            disabled={isLocked}
                                        />
                                    </div>
                                )}
                            </DroppableSlot>
                        );
                    })}
                </div>

                {/* Source Dock */}
                <div
                    className={`tile-dock ${isLocked ? 'locked' : ''}`}
                    data-count={shuffledTiles.length}
                >
                    {shuffledTiles.map((tile) => {
                        const isPlaced = Object.values(placedLetters).includes(tile.id);
                        const letter = getLetter(tile.letterId);

                        if (isPlaced) {
                            return (
                                <div
                                    key={tile.id}
                                    className="draggable-tile placeholder"
                                    style={{ visibility: 'hidden', cursor: 'default' }}
                                />
                            );
                        }

                        return (
                            <DraggableTile
                                key={tile.id}
                                id={tile.id}
                                char={letter.transliteration}
                                name={letter.name}
                                arabicChar={letter.char}
                                arabicName={letter.arabicName}
                                onClick={() => handleTileClick(tile.id)}
                                disabled={isLocked}
                            />
                        );
                    })}
                    {shuffledTiles.every(t => Object.values(placedLetters).includes(t.id)) && (
                        <div className="dock-empty-msg" style={{ position: 'absolute' }}>
                            Toutes les tuiles placées
                        </div>
                    )}
                </div>
            </div>

            <DragOverlay>
                {activeId && activeTile ? (
                    <DraggableTile
                        id={activeTile.id}
                        char={getLetter(activeTile.letterId).transliteration}
                        name={getLetter(activeTile.letterId).name}
                    />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
