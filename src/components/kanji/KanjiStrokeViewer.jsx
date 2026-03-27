/* eslint-disable react/prop-types */

import { useEffect, useState } from 'react';
import { getKanjiVGFilename } from '@utils/kanjiVGUtils';

const cache = new Map();

const KanjiStrokeViewer = ({ kanji }) => {
  const [svgContent, setSvgContent] = useState(null);
  const [error, setError] = useState(false);
  const [hideNumbers, setHideNumbers] = useState(() => {
    return localStorage.getItem('kanji-hide-numbers') === 'true';
  });

  const literal = kanji?.literal;

  useEffect(() => {
    localStorage.setItem('kanji-hide-numbers', hideNumbers);
  }, [hideNumbers]);

  useEffect(() => {
    if (!literal) return;

    const url = getKanjiVGFilename(literal);

    const cacheKey = `${url}-${hideNumbers}`;

    if (cache.has(cacheKey)) {
      setSvgContent(cache.get(cacheKey));
      return;
    }

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('SVG not found');
        return res.text();
      })
      .then((data) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'image/svg+xml');

        // remove trailing junk from rendering
        Array.from(doc.childNodes).forEach((node) => {
          if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
            node.remove();
          }
          if (node.nodeType === Node.COMMENT_NODE) {
            node.remove();
          }
        });

        // remove stroke numbers if enabled
        if (hideNumbers) {
          const texts = doc.querySelectorAll('text');
          texts.forEach((t) => t.remove());
        }

        const serializer = new XMLSerializer();
        const cleaned = serializer.serializeToString(doc);

        cache.set(cacheKey, cleaned);
        setSvgContent(cleaned);
        setError(false);
      })
      .catch(() => {
        setError(true);
        setSvgContent(null);
      });
  }, [literal, hideNumbers]);

  if (!literal) return null;

  if (error) {
    return <div className="text-zinc-500">No stroke data</div>;
  }

  <div className="w-48 h-48 mx-auto flex items-center justify-center">
    {!svgContent ? (
      <span className="text-zinc-500">Loading...</span>
    ) : (
      <div
        className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    )}
  </div>;

  return (
    <>
      <div className="flex justify-center mb-2">
        <button
          onClick={() => setHideNumbers((v) => !v)}
          className="text-xs px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700"
        >
          {hideNumbers ? 'Show Stroke Numbers' : 'Hide Stroke Numbers'}
        </button>
      </div>
      <div className="w-48 h-48 mx-auto flex items-center justify-center">
        <div
          className="w-full h-full [&>svg]:w-full [&>svg]:h-full transition-opacity duration-200"
          style={{ opacity: svgContent ? 1 : 0 }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </div>
    </>
  );
};

export default KanjiStrokeViewer;
