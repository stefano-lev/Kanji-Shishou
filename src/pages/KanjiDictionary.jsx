import { useEffect, useState } from 'react';
import * as storageHandler from '../utils/localStorageHandler';

import jlpt5 from '../data/jlpt_level_5.json';
import jlpt4 from '../data/jlpt_level_4.json';
import jlpt3 from '../data/jlpt_level_3.json';
import jlpt2 from '../data/jlpt_level_2.json';
import jlpt1 from '../data/jlpt_level_1.json';

const KanjiDictionary = () => {
  const [kanjiData, setKanjiData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('0');
  const [sortFilter, setSortFilter] = useState('0');
  const [selectedKanji, setSelectedKanji] = useState(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [filterFavorites, setFilterFavorites] = useState(false);

  const getKanjiByLevel = (level) => {
    switch (level) {
      case '5':
        return jlpt5;
      case '4':
        return jlpt4;
      case '3':
        return jlpt3;
      case '2':
        return jlpt2;
      case '1':
        return jlpt1;
      case '0':
        return [...jlpt5, ...jlpt4, ...jlpt3, ...jlpt2, ...jlpt1];
      default:
        return [];
    }
  };

  useEffect(() => {
    setIsLoading(true);

    let data = getKanjiByLevel(selectedLevel);

    if (filterFavorites) {
      data = data.filter((k) => favorites.includes(k.id));
    }

    setKanjiData(data);
    setIsLoading(false);
  }, [selectedLevel, filterFavorites, favorites]);

  useEffect(() => {
    const savedFavorites = storageHandler.getFavorites() || [];

    setFavorites(savedFavorites);
    console.log('Loaded Favorites: ', savedFavorites);
  }, []);

  const handleKanjiClick = (kanji) => {
    setSelectedKanji(kanji);
    setIsOverlayVisible(true);
  };

  const closeOverlay = () => {
    setIsOverlayVisible(false);
    setSelectedKanji(null);
  };

  const toggleFavorite = (kanji) => {
    console.log('toggleFavorite', kanji.id);
    const updatedFavorites = favorites.includes(kanji.id)
      ? favorites.filter((id) => id !== kanji.id)
      : [...favorites, kanji.id];

    setFavorites(updatedFavorites);
    storageHandler.saveFavorites(updatedFavorites);
  };

  const handleHover = (index) => {
    setHoveredButton(index);
  };

  const handleHoverOut = () => {
    setHoveredButton(null);
  };

  const toggleFilterFavorites = () => {
    setFilterFavorites((prev) => !prev);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Kanji Dictionary</h1>
      <div>
        <label htmlFor="jlpt-level">Filter: </label>
        <select
          id="jlpt-level"
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          style={styles.select}
        >
          <option value="0">All</option>
          <option value="5">JLPT Level N5</option>
          <option value="4">JLPT Level N4</option>
          <option value="3">JLPT Level N3</option>
          <option value="2">JLPT Level N2</option>
          <option value="1">JLPT Level N1</option>
        </select>

        <label htmlFor="filter-sort">Sort by: </label>
        <select
          id="filter-sort"
          value={sortFilter}
          onChange={(e) => setSortFilter(e.target.value)}
          style={styles.select}
        >
          <option value="0">ID</option>
          <option value="1">Stroke Count</option>
          <option value="2">Frequency</option>
        </select>

        <label htmlFor="filter-sort">Favorites: </label>
        <button
          onClick={toggleFilterFavorites}
          style={{
            ...styles.favoritesButton,
            ...(filterFavorites ? styles.favoritesButtonEnabled : {}),
            ...(hoveredButton === 'filterfavorites'
              ? styles.favoritesButtonHover
              : {}),
          }}
          onMouseEnter={() => setHoveredButton('filterfavorites')}
          onMouseLeave={() => setHoveredButton(null)}
        >
          {'★'}
        </button>
      </div>

      <div style={styles.gridContainer}>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          kanjiData.map((kanji, index) => (
            <button
              key={index}
              style={
                hoveredButton === index
                  ? { ...styles.kanjiButton, ...styles.kanjiButtonHover }
                  : styles.kanjiButton
              }
              onClick={() => handleKanjiClick(kanji)}
              onMouseEnter={() => handleHover(index)}
              onMouseLeave={handleHoverOut}
            >
              {kanji.literal || 'No Kanji'}
              <div style={styles.kanjiId}>#{kanji.id}</div>
            </button>
          ))
        )}
      </div>

      {isOverlayVisible && selectedKanji && (
        <div
          style={styles.overlay}
          onClick={(e) => {
            // Close overlay if backdrop is clicked
            if (e.target === e.currentTarget) {
              closeOverlay();
            }
          }}
        >
          <div style={styles.overlayContent}>
            <h2>{selectedKanji.literal}</h2>
            <p>ID: {selectedKanji.id}</p>
            <p>Stroke Count: {selectedKanji.misc.stroke_count}</p>
            <p>Frequency: {selectedKanji.misc.freq}</p>
            <p>
              Meanings:{' '}
              {selectedKanji.reading_meaning.rmgroup.meaning?.join(', ') ||
                'None'}
            </p>
            <p>
              Kun-yomi:{' '}
              {selectedKanji.reading_meaning.rmgroup.reading
                .filter((r) => r['@r_type'] === 'ja_kun')
                .map((r) => r['#text'])
                .join(', ') || 'None'}
            </p>
            <p>
              On-yomi:{' '}
              {selectedKanji.reading_meaning.rmgroup.reading
                .filter((r) => r['@r_type'] === 'ja_on')
                .map((r) => r['#text'])
                .join(', ') || 'None'}
            </p>
            <button
              onClick={closeOverlay}
              style={
                hoveredButton === 'close'
                  ? { ...styles.closeButton, ...styles.closeButtonHover }
                  : styles.closeButton
              }
              onMouseEnter={() => setHoveredButton('close')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              Close
            </button>

            <button
              onClick={() => toggleFavorite(selectedKanji)}
              style={{
                ...styles.heartButton,
                ...(favorites.includes(selectedKanji.id)
                  ? styles.heartButtonFavorited
                  : {}),
                ...(hoveredButton === 'heart' ? styles.heartButtonHover : {}),
              }}
              onMouseEnter={() => setHoveredButton('heart')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              {favorites.includes(selectedKanji.id) ? '❤️' : '🖤'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto',
    minHeight: '100vh',
    boxSizing: 'border-box',
    backgroundColor: '#333',
    color: '#e0e0e0',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
  heading: {
    fontSize: '2rem',
    marginBottom: '20px',
    color: '#fff',
  },
  select: {
    margin: '0 10px',
    padding: '5px',
    fontSize: '1rem',
    backgroundColor: '#333',
    color: '#fff',
    border: '1px solid #555',
    borderRadius: '5px',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '10px',
    padding: '20px',
    width: '100%',
    maxWidth: '800px',
    backgroundColor: '#333',
  },
  cardSection: {
    width: 'auto',
    backgroundColor: '#444444',
    padding: '15px',
    borderRadius: '10px',
    border: '1px solid #555',
    marginBottom: '15px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
  },
  kanjiButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#444',
    borderRadius: '5px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    padding: '10px',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textAlign: 'center',
    height: '100px',
    width: '100px',
    border: 'none',
    cursor: 'pointer',
    color: '#e0e0e0',
    transition: 'all 0.3s ease',
  },
  kanjiButtonHover: {
    backgroundColor: '#0056b3',
    color: '#fff',
    transform: 'scale(1.05)',
  },
  kanjiId: {
    position: 'absolute',
    bottom: '5px',
    right: '12px',
    fontSize: '0.75rem',
    color: '#ccc',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayContent: {
    backgroundColor: '#333',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
    width: '300px',
    color: '#e0e0e0',
  },
  closeButton: {
    marginTop: '10px',
    padding: '5px 10px',
    backgroundColor: '#d9534f',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  closeButtonHover: {
    backgroundColor: '#c9302c',
  },
  heartButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, color 0.2s ease',
    color: '#e0e0e0',
  },
  heartButtonHover: {
    transform: 'scale(1.1)',
    color: '#ff6666',
  },
  heartButtonFavorited: {
    color: '#ff4d4d',
  },
  favoritesButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, color 0.2s ease',
    color: '#e0e0e0',
  },
  favoritesButtonHover: {
    transform: 'scale(1.4)',
    color: '#0056b3',
  },
  favoritesButtonEnabled: {
    color: '#0056b3',
  },
};

export default KanjiDictionary;
