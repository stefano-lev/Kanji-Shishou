import { useEffect, useState } from 'react';

import jlpt5 from '../data/jlpt_level_5.json';
import jlpt4 from '../data/jlpt_level_4.json';
import jlpt3 from '../data/jlpt_level_3.json';
import jlpt2 from '../data/jlpt_level_2.json';
import jlpt1 from '../data/jlpt_level_1.json';

const FlashcardQuiz = () => {
  const [currentKanjiIndex, setCurrentKanjiIndex] = useState(0);
  const [kanjiData, setKanjiData] = useState([]);
  const [currentKanji, setCurrentKanji] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('5');
  //const [isLoading, setIsLoading] = useState(false);

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
      default:
        return [];
    }
  };

  useEffect(() => {
    const data = getKanjiByLevel(selectedLevel);
    setKanjiData(data);
    setCurrentKanjiIndex(0);
    setCurrentKanji(data[0] || null);
  }, [selectedLevel]);

  const handleQuizProgress = () => {
    const nextIndex = (currentKanjiIndex + 1) % kanjiData.length;
    setCurrentKanjiIndex(nextIndex);
    setCurrentKanji(kanjiData[nextIndex]);
  };

  //if (isLoading) {
  //return <div>Loading kanji data...</div>;
  //}

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Kanji Flashcard Quiz</h1>
      <div>
        <label htmlFor="jlpt-level">Select JLPT Level: </label>
        <select
          id="jlpt-level"
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          style={styles.select}
        >
          <option value="5">JLPT Level N5</option>
          <option value="4">JLPT Level N4</option>
          <option value="3">JLPT Level N3</option>
          <option value="2">JLPT Level N2</option>
          <option value="1">JLPT Level N1</option>
        </select>
        <button style={styles.button} onClick={handleQuizProgress}>
          Next Card
        </button>
      </div>
      <p style={styles.progress}>
        Current Progress: {currentKanjiIndex + 1} of {kanjiData.length}
      </p>
      {currentKanji ? (
        <div style={styles.kanjiCard}>
          <div style={styles.cardSection}>
            <div style={styles.kanjiLiteral}>
              <h2>{currentKanji.literal || 'No Kanji'}</h2>
            </div>
          </div>

          <div style={styles.cardSection}>
            <p>
              Kun Readings:{' '}
              {currentKanji.reading_meaning.rmgroup.reading
                .filter((r) => r['@r_type'] === 'ja_kun')
                .map((r) => r['#text'])
                .join(', ') || 'None'}
            </p>
          </div>

          <div style={styles.cardSection}>
            <p>
              On Readings:{' '}
              {currentKanji.reading_meaning.rmgroup.reading
                .filter((r) => r['@r_type'] === 'ja_on')
                .map((r) => r['#text'])
                .join(', ') || 'None'}
            </p>
          </div>

          <div style={styles.cardSection}>
            <p>
              Meanings:{' '}
              {currentKanji.reading_meaning.rmgroup.meaning?.join(', ') ||
                'None'}
            </p>
          </div>
        </div>
      ) : (
        <p>No Kanji available.</p>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto',
    minHeight: '100vh',
    boxSizing: 'border-box',
    backgroundColor: '#2e2e2e', // Dark background
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    color: '#f4f4f4', // Light text for contrast
  },
  heading: {
    fontSize: '2.5rem',
    color: '#e0e0e0', // Lighter text color for heading
    textAlign: 'center',
    marginTop: '-10px',
    marginBottom: '20px',
  },
  label: {
    fontSize: '1rem',
    fontWeight: 'bold',
    marginBottom: '5px',
    display: 'block',
    color: '#f4f4f4',
  },
  cardSection: {
    width: '90%',
    backgroundColor: '#444444',
    padding: '15px',
    borderRadius: '10px',
    border: '1px solid #555',
    marginBottom: '15px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
  },
  select: {
    padding: '0.8rem',
    fontSize: '1rem',
    borderRadius: '5px',
    border: '1px solid #555',
    backgroundColor: '#333333',
    color: '#f4f4f4',
    marginBottom: '20px',
  },
  kanjiCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2e2e2e',
    padding: '20px',
    width: '500px',
    height: '700px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    marginBottom: '20px',
    textAlign: 'center',
    overflowY: 'auto',
  },
  kanjiLiteral: {
    fontSize: '8rem',
    fontWeight: 'bold',
    marginTop: '-250px',
    marginBottom: '-250px',
    color: '#f4f4f4',
  },
  meaningText: {
    fontSize: '1.2rem',
    color: '#e0e0e0',
  },
  button: {
    padding: '12px 24px',
    fontSize: '1.1rem',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    margin: '20px',
  },
  buttonHover: {
    backgroundColor: '#0056b3',
  },
  progress: {
    marginTop: '5px',
    fontSize: '1.2rem',
    color: '#e0e0e0',
  },
};

export default FlashcardQuiz;
