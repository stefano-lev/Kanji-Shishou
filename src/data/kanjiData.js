import jlpt5 from './jlpt_level_5.json';
import jlpt4 from './jlpt_level_4.json';
import jlpt3 from './jlpt_level_3.json';
import jlpt2 from './jlpt_level_2.json';
import jlpt1 from './jlpt_level_1.json';

const addLevelPrefix = (level, data) =>
  data.map((k) => ({
    ...k,
    uid: `${level}-${k.id}`,
    level: level,
  }));

export const kanjiByLevel = {
  5: addLevelPrefix(5, jlpt5),
  4: addLevelPrefix(4, jlpt4),
  3: addLevelPrefix(3, jlpt3),
  2: addLevelPrefix(2, jlpt2),
  1: addLevelPrefix(1, jlpt1),
};

export const allKanji = [
  ...kanjiByLevel[5],
  ...kanjiByLevel[4],
  ...kanjiByLevel[3],
  ...kanjiByLevel[2],
  ...kanjiByLevel[1],
];
