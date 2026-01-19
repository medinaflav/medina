/**
 * Utility to handle Arabic letter forms visual representation
 * Uses Zero Width Joiner (ZWJ) to force shaping
 */

const ZWJ = '\u200D';

export const getVisualForm = (char, form) => {
    if (!char) return '';

    switch (form) {
        case 'initial':
            return char + ZWJ;
        case 'medial':
            return ZWJ + char + ZWJ;
        case 'final':
            return ZWJ + char;
        case 'isolated':
        default:
            return char;
    }
};

// Alias for getLetterForm if it was intended to be the same, 
// or simpler version. In previous usage traces it appears unused or interchangeable.
export const getLetterForm = getVisualForm;
