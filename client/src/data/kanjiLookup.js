import { allKanji } from './kanjiData';

export const kanjiByUid = Object.fromEntries(allKanji.map((k) => [k.uid, k]));
