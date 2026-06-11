export const getKanjiCodepointHex = (char) => {
  if (!char) return null;
  return char.codePointAt(0).toString(16).padStart(5, '0');
};

export const getKanjiVGFilename = (kanjiLiteral) => {
  if (!kanjiLiteral) return null;

  const codePoint = kanjiLiteral.codePointAt(0);
  const hex = codePoint.toString(16).padStart(5, '0');

  return `/kanjivg/${hex}.svg`;
};
