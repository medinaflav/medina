import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import './DroppableSlot.css';

export default function DroppableSlot({ id, children, isCorrect, isError, onClick }) {
    const { isOver, setNodeRef } = useDroppable({
        id: id,
    });

    let className = 'droppable-slot';
    if (isCorrect) {
        className += ' is-correct';
    } else if (isError) {
        className += ' is-error';
    } else if (isOver) {
        className += ' is-over';
    }

    return (
        <div
            ref={setNodeRef}
            onClick={onClick}
            className={className}
        >
            {children}
        </div>
    );
}
