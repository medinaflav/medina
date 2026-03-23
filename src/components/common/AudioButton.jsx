import React from 'react';
import useAudioPlayer from '../../hooks/useAudioPlayer';
import AudioIcon from './AudioIcon';

export default function AudioButton({
    textToSpeak,
    onClick,
    size = '40px',
    className = '',
    style = {},
    disabled = false
}) {
    const { isPlaying, play } = useAudioPlayer(textToSpeak);

    const handleClick = (e) => {
        e.stopPropagation();
        e.preventDefault();

        if (disabled) return;
        if (onClick) {
            onClick(e);
            return;
        }

        play();
    };

    return (
        <div
            onClick={handleClick}
            className={className}
            style={{
                width: size,
                height: size,
                backgroundColor: isPlaying ? 'var(--color-gold-main)' : 'var(--bg-card)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: disabled ? 'default' : 'pointer',
                color: isPlaying ? 'white' : 'var(--color-brown-text)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid ' + (isPlaying ? 'var(--color-gold-main)' : '#f3f4f6'),
                transform: isPlaying ? 'scale(1.1)' : 'scale(1)',
                opacity: disabled ? 0.6 : 1,
                ...style
            }}
            title="Écouter la prononciation"
        >
            <AudioIcon isPlaying={isPlaying} size={parseInt(size) * 0.5 + 'px'} />
        </div>
    );
}
