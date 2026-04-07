/* eslint-disable react/prop-types */

import { useEffect, useState } from 'react';
import { getKanjiVGFilename } from '@utils/kanjiVGUtils';

const cache = new Map();

const KanjiStrokeViewer = ({ kanji }) => {
  const [svgContent, setSvgContent] = useState(null);
  const [animationTrigger, setAnimationTrigger] = useState(0);
  const [error, setError] = useState(false);
  const [hideNumbers, setHideNumbers] = useState(() => {
    return localStorage.getItem('kanji-hide-numbers') === 'true';
  });
  const [speed, setSpeed] = useState(() => {
    return Number(localStorage.getItem('kanji-speed')) || 1;
  });

  useEffect(() => {
    localStorage.setItem('kanji-speed', speed);
  }, [speed]);

  const literal = kanji?.literal;

  useEffect(() => {
    localStorage.setItem('kanji-hide-numbers', hideNumbers);
  }, [hideNumbers]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === ' ') {
        setAnimationTrigger((v) => v + 1);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (!literal) return;

    const url = getKanjiVGFilename(literal);

    const cacheKey = `${url}-${hideNumbers}-${animationTrigger}-${speed}`;

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

        const shouldAnimate = animationTrigger > 0;

        if (shouldAnimate) {
          const strokes = doc.querySelectorAll('path');
          const baseStrokeDuration = 0.35 / speed;

          strokes.forEach((stroke, i) => {
            stroke.style.strokeDasharray = '1000';
            stroke.style.strokeDashoffset = '1000';

            stroke.style.animation = `draw ${baseStrokeDuration}s ease forwards ${i * baseStrokeDuration}s`;
          });

          const style = doc.createElementNS(
            'http://www.w3.org/2000/svg',
            'style'
          );
          style.textContent = `
          @keyframes draw {
            to {
              stroke-dashoffset: 0;
            }
          }
        `;

          doc.documentElement.appendChild(style);
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
  }, [literal, hideNumbers, animationTrigger, speed]);

  if (!literal) return null;

  if (error) {
    return <div className="text-zinc-500">No stroke data</div>;
  }

  return (
    <>
      <div className="flex justify-center gap-2 mb-2">
        <button
          onClick={() => setHideNumbers((v) => !v)}
          className="text-xs px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700"
        >
          {hideNumbers ? 'Show Stroke Numbers' : 'Hide Stroke Numbers'}
        </button>

        <button
          onClick={() => setAnimationTrigger((v) => v + 1)}
          className="text-xs px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50"
        >
          ▶ Play
        </button>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span>Speed</span>
          <input
            type="range"
            min="0.4"
            max="2"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
        </div>
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
