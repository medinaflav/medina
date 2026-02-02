export const ARABIC_FORM_MAP = {
    'ا': { isolated: 'ا', initial: 'ا', medial: 'ـا', final: 'ـا' }, // Alif (No initial/medial connection, but standard forms)
    'أ': { isolated: 'أ', initial: 'أ', medial: 'ـأ', final: 'ـأ' },
    'إ': { isolated: 'إ', initial: 'إ', medial: 'ـإ', final: 'ـإ' },
    'آ': { isolated: 'آ', initial: 'آ', medial: 'ـآ', final: 'ـآ' },
    'ب': { isolated: 'ب', initial: 'بـ', medial: 'ـبـ', final: 'ـب' },
    'ت': { isolated: 'ت', initial: 'تـ', medial: 'ـتـ', final: 'ـت' },
    'ث': { isolated: 'ث', initial: 'ثـ', medial: 'ـثـ', final: 'ـث' },
    'ج': { isolated: 'ج', initial: 'جـ', medial: 'ـجـ', final: 'ـج' },
    'ح': { isolated: 'ح', initial: 'حـ', medial: 'ـحـ', final: 'ـح' },
    'خ': { isolated: 'خ', initial: 'خـ', medial: 'ـخـ', final: 'ـخ' },
    'د': { isolated: 'د', initial: 'د', medial: 'ـد', final: 'ـد' }, // Dal (Non-connector)
    'ذ': { isolated: 'ذ', initial: 'ذ', medial: 'ـذ', final: 'ـذ' }, // Dhal
    'ر': { isolated: 'ر', initial: 'ر', medial: 'ـر', final: 'ـر' }, // Ra
    'ز': { isolated: 'ز', initial: 'ز', medial: 'ـز', final: 'ـز' }, // Zay
    'س': { isolated: 'س', initial: 'سـ', medial: 'ـسـ', final: 'ـس' },
    'ش': { isolated: 'ش', initial: 'شـ', medial: 'ـشـ', final: 'ـش' },
    'ص': { isolated: 'ص', initial: 'صـ', medial: 'ـصـ', final: 'ـص' },
    'ض': { isolated: 'ض', initial: 'ضـ', medial: 'ـضـ', final: 'ـض' },
    'ط': { isolated: 'ط', initial: 'طـ', medial: 'ـطـ', final: 'ـط' },
    'ظ': { isolated: 'ظ', initial: 'ظـ', medial: 'ـظـ', final: 'ـظ' },
    'ع': { isolated: 'ع', initial: 'عـ', medial: 'ـعـ', final: 'ـع' },
    'غ': { isolated: 'غ', initial: 'غـ', medial: 'ـغـ', final: 'ـغ' },
    'ف': { isolated: 'ف', initial: 'فـ', medial: 'ـفـ', final: 'ـف' },
    'ق': { isolated: 'ق', initial: 'قـ', medial: 'ـقـ', final: 'ـق' },
    'ك': { isolated: 'ك', initial: 'كـ', medial: 'ـكـ', final: 'ـك' },
    'ل': { isolated: 'ل', initial: 'لـ', medial: 'ـلـ', final: 'ـل' },
    'م': { isolated: 'م', initial: 'مـ', medial: 'ـمـ', final: 'ـم' },
    'ن': { isolated: 'ن', initial: 'نـ', medial: 'ـنـ', final: 'ـن' },
    'ه': { isolated: 'ه', initial: 'هـ', medial: 'ـهـ', final: 'ـه' },
    'و': { isolated: 'و', initial: 'و', medial: 'ـو', final: 'ـو' }, // Waw
    'ي': { isolated: 'ي', initial: 'يـ', medial: 'ـيـ', final: 'ـي' },
    'ى': { isolated: 'ى', initial: 'ى', medial: 'ـى', final: 'ـى' },
    'ة': { isolated: 'ة', initial: 'ة', medial: 'ـة', final: 'ـة' }, // Ta Marbuta (usually final)
};

// Using Tatweel (Kashida) 'ـ' to confirm visual representation if ZWJ fails
// Unicode Presentation Forms B also exist, but explicit Tatweel is often better for simple font rendering without shaped font support
// Presentation Forms B Example: 'ب' -> Isolated FE8F, Initial FE91, Medial FE92, Final FE90
