import jlpt5 from './jlpt_level_5.json';
import jlpt4 from './jlpt_level_4.json';
import jlpt3 from './jlpt_level_3.json';
import jlpt2 from './jlpt_level_2.json';
import jlpt1 from './jlpt_level_1.json';

import type { JLPTLevel, Kanji, KanjiByLevel } from '@/types';

const normalizeKanji = (k: Partial<Kanji>): Kanji => ({
  literal: '？',
  reading_meaning: {
    rmgroup: {
      reading: [],
      meaning: [],
    },
  },
  misc: {},
  uid: String(k.id ?? k.literal ?? 'unknown'),
  ...k,
});

const addLevelPrefix = (level: JLPTLevel, data: Partial<Kanji>[]): Kanji[] =>
  data.map((k) =>
    normalizeKanji({
      ...k,
      uid: `${level}-${k.id}`,
      level: Number(level),
    })
  );

export const kanjiByLevel: KanjiByLevel = {
  5: addLevelPrefix('5', jlpt5 as Partial<Kanji>[]),
  4: addLevelPrefix('4', jlpt4 as Partial<Kanji>[]),
  3: addLevelPrefix('3', jlpt3 as Partial<Kanji>[]),
  2: addLevelPrefix('2', jlpt2 as Partial<Kanji>[]),
  1: addLevelPrefix('1', jlpt1 as Partial<Kanji>[]),
};

export const allKanji: Kanji[] = [
  ...kanjiByLevel[5],
  ...kanjiByLevel[4],
  ...kanjiByLevel[3],
  ...kanjiByLevel[2],
  ...kanjiByLevel[1],
];
