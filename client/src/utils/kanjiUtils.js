export const createFallbackKanji = () => ({
  uid: 'unknown',
  literal: '？',
  reading_meaning: {
    rmgroup: {
      reading: [],
      meaning: ['Unknown'],
    },
  },
});

export const getSafeKanji = (kanji) => {
  if (!kanji || !kanji.reading_meaning?.rmgroup) {
    return createFallbackKanji();
  }
  return kanji;
};
