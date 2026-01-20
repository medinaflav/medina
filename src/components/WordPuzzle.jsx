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

export default function WordPuzzle({ word, onStateChange, showFeedback, showVowels, isLocked, initialState }) {
    const [placedLetters, setPlacedLetters] = useState({}); // { slotIndex: tileId }
    const [shuffledTiles, setShuffledTiles] = useState([]);
    const [activeId, setActiveId] = useState(null); // ID of currently dragged item

    // Initialize/Reset
    useEffect(() => {
        // If we have saved state for this word, restore it
        // Check for length > 0 to avoid restoring premature empty state
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

        // 2. Create distractors (3 unique random tiles)
        const distractorCount = 3;
        const distractorTiles = [];

        // Get all available letters that are NOT in the word
        const availableDistractors = ALPHABET.filter(l => !word.letters.includes(l.id));

        // Shuffle avilables
        const shuffledAvailable = [...availableDistractors].sort(() => Math.random() - 0.5);

        // Take the first 3 (or fewer if not enough)
        const selectedDistractors = shuffledAvailable.slice(0, distractorCount);

        selectedDistractors.forEach((letter, i) => {
            distractorTiles.push({
                id: `distractor-${letter.id}-${i}-${Math.random()}`,
                letterId: letter.id,
                type: 'distractor'
            });
        });

        // 3. Combine and shuffle
        const allTiles = [...correctTiles, ...distractorTiles].sort(() => Math.random() - 0.5);

        setShuffledTiles(allTiles);
        setPlacedLetters({});
    }, [word]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
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
            const slotIndex = over.id;
            const tileId = active.id;
            const draggedTile = shuffledTiles.find(t => t.id === tileId);

            // Analytics Logic
            if (draggedTile) {
                const expectedLetterId = word.letters[slotIndex];
                const isCorrect = draggedTile.letterId === expectedLetterId;
                recordAttempt(expectedLetterId, slotIndex, isCorrect);
            }

            setPlacedLetters(prev => {
                // Check if tile was already placed somewhere else, remove it from there
                const existingSlot = Object.keys(prev).find(key => prev[key] === tileId);

                const newPlacement = { ...prev };
                if (existingSlot) delete newPlacement[existingSlot];

                newPlacement[slotIndex] = tileId;
                return newPlacement;
            });
        } else {
            // Dropped outside -> return to dock
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

    // Check status and notify parent
    useEffect(() => {
        const isFilled = word.letters.every((_, index) => placedLetters[index] !== undefined);

        const results = word.letters.map((expectedId, index) => {
            const placedTileId = placedLetters[index];
            const tile = shuffledTiles.find(t => t.id === placedTileId);
            const isCorrect = tile && tile.letterId === expectedId;
            return {
                index,
                expectedId,
                placedTileId,
                isCorrect: !!isCorrect
            };
        });

        const isCorrect = isFilled && results.every(r => r.isCorrect);

        onStateChange({
            isFilled,
            isCorrect,
            results,
            // Expose internal state for persistence
            shuffledTiles,
            placedLetters
        });
    }, [placedLetters, word, shuffledTiles, onStateChange]);

    // Derived state for rendering
    const dockTiles = shuffledTiles.filter(tile => !Object.values(placedLetters).includes(tile.id));
    const activeTile = shuffledTiles.find(t => t.id === activeId);

    const handleTileClick = (tileId) => {
        if (isLocked) return; // Locking check

        // 1. Check if tile is already placed (click to remove)
        const placedSlotIndex = Object.keys(placedLetters).find(key => placedLetters[key] === tileId);
        if (placedSlotIndex) {
            setPlacedLetters(prev => {
                const copy = { ...prev };
                delete copy[placedSlotIndex];
                return copy;
            });
            return;
        }

        // 2. Tile is in dock -> Place in first available empty slot (Right to Left check for Arabic)
        const emptySlotIndex = word.letters.findIndex((_, index) => !placedLetters[index]);

        if (emptySlotIndex !== -1) {
            setPlacedLetters(prev => ({
                ...prev,
                [emptySlotIndex]: tileId
            }));

            // Analytics logic for click-placement
            const draggedTile = shuffledTiles.find(t => t.id === tileId);
            if (draggedTile) {
                const expectedLetterId = word.letters[emptySlotIndex];
                const isCorrect = draggedTile.letterId === expectedLetterId;
                // recordAttempt(expectedLetterId, emptySlotIndex, isCorrect);
            }
        }
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            {/* ... */}
            <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
                <h3 className="arabic-title-mobile" style={{
                    fontFamily: 'var(--font-arabic)',
                    fontSize: '5rem', // Default for desktop
                    marginBottom: '1rem',
                    color: 'var(--color-brown-text)',
                    lineHeight: 1.2
                }}>
                    {showVowels ? (word.vocalizedText || word.text) : word.text}
                </h3>

                <div style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                    Associez les phonétiques au mot arabe
                </div>

                {showFeedback && (
                    <div className="fade-in" style={{
                        marginBottom: '2rem',
                        padding: '1rem',
                        backgroundColor: '#FEE2E2',
                        borderRadius: '12px',
                        color: '#DC2626',
                        display: !Object.values(placedLetters).every((tileId, index) => {
                            const tile = shuffledTiles.find(t => t.id === tileId);
                            return tile && tile.letterId === word.letters[index];
                        }) ? 'block' : 'none',
                    }}>
                        <div style={{ fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Correction</div>

                        {/* Decomposed Correction */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row-reverse', // Arabic R to L
                            justifyContent: 'center',
                            gap: '1.5rem'
                        }}>
                            {word.letters.map((id, index) => {
                                const letter = getLetter(id);
                                return (
                                    <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                                        <span style={{ fontFamily: 'var(--font-arabic)', fontSize: '2.5rem', lineHeight: 1 }}>{letter.char}</span>
                                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '1.1rem', fontWeight: 'bold' }}>{letter.transliteration}</span>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Full Word Transliteration */}
                        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(220, 38, 38, 0.2)' }}>
                            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.25rem', opacity: 0.8 }}>MOT</span>
                            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '1.8rem', fontWeight: 'bold' }}>{word.transliteration}</span>
                        </div>
                    </div>
                )}

                {/* Droppable Slots (Right to Left for Arabic) */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '1rem',
                    marginBottom: '3rem',
                    flexDirection: 'row-reverse' // Arabic order
                }}>
                    {word.letters.map((expectedId, index) => {
                        const placedTileId = placedLetters[index];
                        const placedTile = placedTileId ? shuffledTiles.find(t => t.id === placedTileId) : null;
                        const letterInfo = placedTile ? getLetter(placedTile.letterId) : null;

                        // Check if this specific slot is correct
                        const isCorrectTile = placedTile && placedTile.letterId === expectedId;

                        // Derived Feedback Props
                        const isCorrect = showFeedback && isCorrectTile;
                        const isError = showFeedback && placedTile && !isCorrectTile;

                        return (
                            <DroppableSlot
                                key={index}
                                id={index}
                                isCorrect={isCorrect}
                                isError={isError}
                                onClick={() => (!isLocked && placedTile) ? handleTileClick(placedTile.id) : null} // Allow clicking slot to remove
                            >
                                {placedTile && letterInfo && (
                                    <div onClick={() => (!isLocked) ? handleTileClick(placedTile.id) : null} style={{ cursor: isLocked ? 'default' : 'pointer' }}>
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
                <div style={{
                    minHeight: '80px',
                    padding: '1rem',
                    backgroundColor: 'var(--color-sand-100)',
                    borderRadius: '16px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '1rem',
                    opacity: 1, // Keep full opacity even when locked
                    pointerEvents: isLocked ? 'none' : 'auto',
                    maxWidth: '600px',
                    margin: '0 auto'
                }}>
                    {dockTiles.map((tile) => {
                        const letter = getLetter(tile.letterId);
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
                    {dockTiles.length === 0 && (
                        // Should rarely happen with distractors unless user places everything
                        <div style={{ color: 'var(--text-secondary)', alignSelf: 'center' }}>
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
