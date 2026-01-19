import React from 'react';
import { useDraggable } from '@dnd-kit/core';

export default function DraggableTile({ id, char, name, arabicChar, arabicName, onClick, disabled }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
        disabled: disabled
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 1000,
    } : undefined;

    const handlePlaySound = (e) => {
        e.stopPropagation(); // Prevent drag/click
        if ('speechSynthesis' in window) {
            // Prefer full arabic name for clarity (e.g. "Haa") over just the char ("Ḥa")
            const textToSpeak = arabicName || arabicChar || char;
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.lang = 'ar-SA'; // Arabic
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={{
                ...style,
                width: '60px',
                height: '60px',
                position: 'relative', // For absolute positioning of speaker
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--color-sand-50)',
                border: '2px solid var(--color-gold-500)',
                borderRadius: '12px',
                fontFamily: 'var(--font-ui)',
                fontWeight: 'bold',
                fontSize: '1.5rem',
                color: 'var(--color-brown-text)',
                cursor: disabled ? 'default' : 'grab',
                boxShadow: isDragging
                    ? '0 10px 15px -3px rgba(0, 0, 0, 0.2)'
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                opacity: isDragging ? 0.8 : (disabled ? 0.8 : 1),
                touchAction: 'none'
            }}
            {...listeners}
            {...attributes}
            onClick={onClick}
            title={name}
        >
            {/* Audio Button */}
            {!isDragging && (
                <div
                    onClick={handlePlaySound}
                    onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
                    style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        width: '24px',
                        height: '24px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        border: '1px solid var(--color-gold-300)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '12px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                >
                    🔊
                </div>
            )}
            {char}
        </div>
    );
}
