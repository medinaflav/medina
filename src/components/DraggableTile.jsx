import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import AudioButton from './common/AudioButton';
import './DraggableTile.css';

export default function DraggableTile({ id, char, name, arabicChar, arabicName, onClick, disabled }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
        disabled: disabled
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`draggable-tile ${isDragging ? 'is-dragging' : ''} ${disabled ? 'disabled' : ''}`}
            {...listeners}
            {...attributes}
            onClick={onClick}
            title={name}
        >
            {/* Audio Button */}
            {!isDragging && (
                <div className="tile-audio-btn">
                    <AudioButton
                        textToSpeak={arabicName || arabicChar || char}
                        size="24px"
                    />
                </div>
            )}
            {char}
        </div>
    );
}
