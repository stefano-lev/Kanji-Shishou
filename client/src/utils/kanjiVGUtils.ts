export const getKanjiCodepointHex = (char?: string | null): string | null => {
  if (!char) return null;
  return char.codePointAt(0)?.toString(16).padStart(5, '0') ?? null;
};

export const getKanjiVGFilename = (kanjiLiteral: string): string | null => {
  if (!kanjiLiteral) return null;

  const codePoint = kanjiLiteral.codePointAt(0);
  const hex = codePoint?.toString(16).padStart(5, '0') ?? '';

  return `/kanjivg/${hex}.svg`;
};
