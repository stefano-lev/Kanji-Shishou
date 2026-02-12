import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './pages/NavBar';
import Home from './pages/Home';
import FlashcardQuiz from './pages/FlashcardQuiz';
import MultchoiceQuiz from './pages/MultchoiceQuiz';
import KanjiDictionary from './pages/KanjiDictionary';
import StrokeOrder from './pages/StrokeOrder';

const App = () => {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/flashcard-quiz" element={<FlashcardQuiz />} />
        <Route path="/multchoice-quiz" element={<MultchoiceQuiz />} />
        <Route path="/kanji-dictionary" element={<KanjiDictionary />} />
        <Route path="/stroke-order" element={<StrokeOrder />} />
      </Routes>
    </Router>
  );
};

export default App;
