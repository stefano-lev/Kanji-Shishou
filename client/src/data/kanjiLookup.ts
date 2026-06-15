import { allKanji } from './kanjiData';

import type { Kanji } from '@/types';

export const kanjiByUid: Record<string, Kanji> = Object.fromEntries(
  allKanji.map((k) => [k.uid, k])
);
