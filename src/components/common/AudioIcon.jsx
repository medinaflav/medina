import React from 'react';

export default function AudioIcon({ isPlaying, size = '24px', color = 'currentColor' }) {
    // Ensure size is a number for calculation only if needed, 
    // but the SVG viewBox is constant (24 24).
    // We can just pass the size prop to width/height.

    return isPlaying ? (
        /* Active/Playing Wave Icon */
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
            <rect x="2" y="7" width="4" height="10" rx="1" fill="currentColor">
                <animate attributeName="height" values="10;16;10" dur="1s" repeatCount="indefinite" />
                <animate attributeName="y" values="7;4;7" dur="1s" repeatCount="indefinite" />
            </rect>
            <rect x="8" y="5" width="4" height="14" rx="1" fill="currentColor">
                <animate attributeName="height" values="14;8;14" dur="1s" repeatCount="indefinite" />
                <animate attributeName="y" values="5;8;5" dur="1s" repeatCount="indefinite" />
            </rect>
            <rect x="14" y="9" width="4" height="6" rx="1" fill="currentColor">
                <animate attributeName="height" values="6;12;6" dur="1s" repeatCount="indefinite" />
                <animate attributeName="y" values="9;6;9" dur="1s" repeatCount="indefinite" />
            </rect>
            <rect x="20" y="3" width="2" height="18" rx="1" fill="currentColor" opacity="0.5">
                <animate attributeName="height" values="18;10;18" dur="1s" repeatCount="indefinite" />
                <animate attributeName="y" values="3;7;3" dur="1s" repeatCount="indefinite" />
            </rect>
        </svg>
    ) : (
        /* Static Speaker Icon */
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        </svg>
    );
}
