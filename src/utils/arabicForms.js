import { ARABIC_FORM_MAP } from './arabicFormMap';

const ZWJ = '\u200D';

export const getVisualForm = (char, form) => {
    if (!char) return '';

    // 1. Try explicit map
    if (ARABIC_FORM_MAP[char] && ARABIC_FORM_MAP[char][form]) {
        return ARABIC_FORM_MAP[char][form];
    }

    // 2. Fallback to ZWJ method
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

export const getLetterForm = getVisualForm;
