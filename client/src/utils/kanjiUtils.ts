import type { Kanji } from '@/types';

export const createFallbackKanji = (): Kanji => ({
  uid: 'unknown',
  literal: '？',
  reading_meaning: {
    rmgroup: {
      reading: [],
      meaning: ['Unknown'],
    },
  },
  misc: {},
});

export const getSafeKanji = (kanji: Kanji | null | undefined): Kanji => {
  if (!kanji || !kanji.reading_meaning?.rmgroup) {
    return createFallbackKanji();
  }
  return kanji;
};
