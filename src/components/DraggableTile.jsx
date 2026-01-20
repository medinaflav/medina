import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import AudioButton from './common/AudioButton';

export default function DraggableTile({ id, char, name, arabicChar, arabicName, onClick, disabled }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
        disabled: disabled
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 1000,
    } : undefined;

    // Audio handled internally by AudioButton component

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
                border: '2px solid var(--color-gold-main)',
                borderRadius: '12px',
                fontFamily: 'var(--font-ui)',
                fontWeight: 'bold',
                fontSize: '1.5rem',
                color: 'var(--color-brown-text)',
                cursor: disabled ? 'default' : 'grab',
                boxShadow: isDragging
                    ? '0 10px 15px -3px rgba(0, 0, 0, 0.2)'
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                opacity: isDragging ? 0.8 : 1, // Full opacity even if disabled
                touchAction: 'none'
            }}
            {...listeners}
            {...attributes}
            onClick={onClick}
            title={name}
        >
            {/* Audio Button */}
            {!isDragging && (
                <AudioButton
                    textToSpeak={arabicName || arabicChar || char}
                    size="24px"
                    style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        zIndex: 10
                    }}
                />
            )}
            {char}
        </div>
    );
}
