import { useEffect, useState, useCallback } from 'react';

import jlpt5 from '../data/jlpt_level_5.json';
import jlpt4 from '../data/jlpt_level_4.json';
import jlpt3 from '../data/jlpt_level_3.json';
import jlpt2 from '../data/jlpt_level_2.json';
import jlpt1 from '../data/jlpt_level_1.json';

const MultchoiceQuiz = () => {
  const [kanjiData, setKanjiData] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('5');
  const [currentKanji, setCurrentKanji] = useState(null);
  const [choices, setChoices] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [percentageCorrect, setPercentageCorrect] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);

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

  const startQuiz = useCallback((data) => {
    setCurrentRound(0);
    setQuizCompleted(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    setPercentageCorrect(0);
    setCurrentKanji(data[0]);
    generateChoices(data[0], data);
  }, []);

  useEffect(() => {
    const data = getKanjiByLevel(selectedLevel);
    setKanjiData(data);
    if (data.length > 0) startQuiz(data);
  }, [selectedLevel, startQuiz]);

  const generateChoices = (correctKanji, allKanji) => {
    const randomChoices = allKanji
      .filter((kanji) => kanji !== correctKanji)
      .sort(() => 0.5 - Math.random())
      .slice(0, 7); // Select 7 random incorrect choices
    randomChoices.push(correctKanji); // Add the correct answer
    randomChoices.sort(() => 0.5 - Math.random());
    setChoices(randomChoices);
  };

  const handleAnswer = (selectedKanji) => {
    if (isButtonDisabled) return; // Prevent multiple clicks
    setIsButtonDisabled(true);

    let correct = false;
    if (selectedKanji === currentKanji) {
      setIsCorrect(true);
      setCorrectCount((prev) => prev + 1);
      correct = true;
    } else {
      setIsCorrect(false);
      setIncorrectCount((prev) => prev + 1);
      reAddKanjiToPool(currentKanji);
    }

    const answeredRounds = currentRound + 1;
    const newPercentageCorrect =
      Math.round(((correctCount + (correct ? 1 : 0)) / answeredRounds) * 100) ||
      0;
    setPercentageCorrect(newPercentageCorrect); // Update percentage only after answering

    setTimeout(() => {
      nextRound();
      setIsButtonDisabled(false);
    }, 500);
  };

  const reAddKanjiToPool = (kanji) => {
    const randomIndex = Math.floor(Math.random() * kanjiData.length);
    const updatedKanjiData = [...kanjiData];
    updatedKanjiData.splice(randomIndex, 0, kanji);
    setKanjiData(updatedKanjiData);
  };

  const nextRound = () => {
    const nextRoundIndex = currentRound + 1;
    if (nextRoundIndex < kanjiData.length) {
      setCurrentRound(nextRoundIndex);
      setCurrentKanji(kanjiData[nextRoundIndex]);
      generateChoices(kanjiData[nextRoundIndex], kanjiData);
      setIsCorrect(null);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleLevelChange = (e) => {
    setSelectedLevel(e.target.value);
  };

  const totalRounds = kanjiData.length;

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Multiple Choice Quiz</h1>
      <div>
        <label>Select JLPT Level: </label>
        <select value={selectedLevel} onChange={handleLevelChange}>
          <option value="5">JLPT N5</option>
          <option value="4">JLPT N4</option>
          <option value="3">JLPT N3</option>
          <option value="2">JLPT N2</option>
          <option value="1">JLPT N1</option>
        </select>
      </div>
      <div style={styles.counter}>
        <p>
          Correct: {correctCount} | Incorrect: {incorrectCount} | Total Cards:{' '}
          {totalRounds}
        </p>
        <p>Percentage Correct: {percentageCorrect}%</p>
      </div>
      {quizCompleted ? (
        <div>
          <h2>Quiz Completed!</h2>
          <p>You answered all the kanji for JLPT Level {selectedLevel}.</p>
        </div>
      ) : (
        currentKanji && (
          <div>
            <h2 style={styles.round}>Round {currentRound + 1}</h2>
            <div style={styles.cardSection}>
              <p style={styles.text}>
                Kun-yomi:{' '}
                {currentKanji.reading_meaning.rmgroup.reading
                  .filter((r) => r['@r_type'] === 'ja_kun')
                  .map((r) => r['#text'])
                  .join(', ') || 'None'}
              </p>
            </div>
            <div style={styles.cardSection}>
              <p style={styles.text}>
                On-yomi:{' '}
                {currentKanji.reading_meaning.rmgroup.reading
                  .filter((r) => r['@r_type'] === 'ja_on')
                  .map((r) => r['#text'])
                  .join(', ') || 'None'}
              </p>
            </div>
            <div style={styles.cardSection}>
              <p style={styles.text}>
                Meanings:{' '}
                {currentKanji.reading_meaning.rmgroup.meaning?.join(', ') ||
                  'None'}
              </p>
            </div>
            <div style={styles.choices}>
              {choices.map((choice, index) => (
                <button
                  key={index}
                  style={
                    hoveredButton === index
                      ? { ...styles.button, ...styles.buttonHover }
                      : styles.button
                  }
                  onMouseEnter={() => setHoveredButton(index)}
                  onMouseLeave={() => setHoveredButton(null)}
                  onClick={() => handleAnswer(choice)}
                  disabled={isButtonDisabled}
                >
                  {choice.literal}
                </button>
              ))}
            </div>
            {isCorrect !== null && (
              <p
                style={{
                  ...styles.feedbackLabel,
                  ...(isCorrect
                    ? styles.feedbackCorrect
                    : styles.feedbackIncorrect),
                }}
              >
                {isCorrect ? 'Correct!' : 'Incorrect!'}
              </p>
            )}
          </div>
        )
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
    minHeight: '70vh',
    backgroundColor: '#2e2e2e',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    color: '#f4f4f4',
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
  heading: {
    fontSize: '2.5rem',
    color: '#e0e0e0',
    textAlign: 'center',
    marginTop: '-10px',
    marginBottom: '20px',
  },
  counter: {
    margin: '10px 0',
    fontSize: '1.2rem',
    textAlign: 'center',
    color: '#e0e0e0',
  },
  round: {
    fontSize: '1.5rem',
    textAlign: 'center',
    margin: '10px 0',
    color: '#e0e0e0',
  },
  text: {
    textAlign: 'center',
    wordWrap: 'break-word',
    color: '#e0e0e0',
  },
  choices: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: '20px',
  },
  button: {
    margin: '10px',
    padding: '12px 24px',
    fontSize: '1.2rem',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  buttonHover: {
    backgroundColor: '#0056b3',
  },
  feedbackLabel: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: '20px 0 10px',
    minHeight: '30px',
    visibility: 'hidden',
  },
  feedbackCorrect: {
    color: 'green',
    visibility: 'visible',
  },
  feedbackIncorrect: {
    color: 'red',
    visibility: 'visible',
  },
};

export default MultchoiceQuiz;
