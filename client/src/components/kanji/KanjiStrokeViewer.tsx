import { useEffect, useState } from 'react';
import { getKanjiVGFilename } from '@utils/kanjiVGUtils';

import type { Kanji } from '@/types';

const cache = new Map<string, string>();

interface KanjiStrokeViewerProps {
  kanji: Kanji | null;
}

const KanjiStrokeViewer = ({ kanji }: KanjiStrokeViewerProps) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [animationTrigger, setAnimationTrigger] = useState(0);
  const [error, setError] = useState(false);
  const [hideNumbers, setHideNumbers] = useState(() => {
    return localStorage.getItem('kanji-hide-numbers') === 'true';
  });
  const [speed, setSpeed] = useState(() => {
    return Number(localStorage.getItem('kanji-speed')) || 1;
  });
  const [autoPlay, setAutoPlay] = useState(() => {
    return localStorage.getItem('kanji-autoplay') === 'true';
  });

  const literal = kanji?.literal;

  useEffect(() => {
    localStorage.setItem('kanji-speed', String(speed));
  }, [speed]);

  useEffect(() => {
    localStorage.setItem('kanji-autoplay', String(autoPlay));
  }, [autoPlay]);

  useEffect(() => {
    if (autoPlay) {
      setAnimationTrigger((v) => v + 1);
    }
  }, [autoPlay, literal]);

  useEffect(() => {
    localStorage.setItem('kanji-hide-numbers', String(hideNumbers));
  }, [hideNumbers]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        setAnimationTrigger((v) => v + 1);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (!literal) return;

    async function loadSVG() {
      if (!literal) return;

      const url = getKanjiVGFilename(literal);
      if (!url) return;

      const cacheKey = `${url}-${hideNumbers}`;

      let baseSVG: string;

      const cachedSVG = cache.get(cacheKey);

      if (cachedSVG !== undefined) {
        baseSVG = cachedSVG;
      } else {
        const res = await fetch(url);
        const text = await res.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'image/svg+xml');

        // remove stroke numbers
        if (hideNumbers) {
          doc.querySelectorAll('text').forEach((t) => t.remove());
        }

        const serializer = new XMLSerializer();
        baseSVG = serializer.serializeToString(doc);

        cache.set(cacheKey, baseSVG);
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(baseSVG, 'image/svg+xml');

      if (animationTrigger > 0) {
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
            to { stroke-dashoffset: 0; }
          }
        `;

        doc.documentElement.appendChild(style);
      }

      const serializer = new XMLSerializer();
      const finalSVG = serializer.serializeToString(doc);

      setSvgContent(finalSVG);
      setError(false);
    }

    loadSVG().catch(() => {
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
      <div className="mb-3 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setHideNumbers((v) => !v)}
          className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-100"
        >
          {hideNumbers ? 'Show Stroke Numbers' : 'Hide Stroke Numbers'}
        </button>

        <button
          onClick={() => setAnimationTrigger((v) => v + 1)}
          className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-100"
        >
          ▶ Play
        </button>

        <button
          onClick={() => setAutoPlay((v) => !v)}
          className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-100"
        >
          {autoPlay ? 'Autoplay On' : 'Autoplay Off'}
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
      <div className="relative mx-auto flex h-64 w-64 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950">
        {!svgContent && (
          <div className="absolute text-6xl font-bold text-zinc-800">
            {literal}
          </div>
        )}

        <div
          key={animationTrigger}
          className="w-full h-full [&>svg]:w-full [&>svg]:h-full transition-opacity duration-200"
          style={{ opacity: svgContent ? 1 : 0 }}
          dangerouslySetInnerHTML={{ __html: svgContent ?? '' }}
        />
      </div>
    </>
  );
};

export default KanjiStrokeViewer;
