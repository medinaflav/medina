import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export default function DroppableSlot({ id, children, isCorrect, isError, onClick }) {
    const { isOver, setNodeRef } = useDroppable({
        id: id,
    });

    const borderColor = isCorrect
        ? 'var(--color-sand-200)' // No green border for correct state
        : isError
            ? 'var(--color-red-500)' // Error state
            : isOver
                ? 'var(--color-gold-400)'
                : 'var(--color-sand-300)';

    const bgColor = isCorrect
        ? 'var(--color-emerald-500)' // Filled state
        : isOver
            ? 'var(--color-sand-100)'
            : 'transparent';

    return (
        <div
            ref={setNodeRef}
            onClick={onClick} // Pass click handler
            style={{
                width: '80px',
                height: '80px',
                border: `2px dashed ${borderColor}`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: bgColor,
                transition: 'all 0.2s',
                color: isCorrect ? 'white' : 'inherit'
            }}
        >
            {children}
        </div>
    );
}
