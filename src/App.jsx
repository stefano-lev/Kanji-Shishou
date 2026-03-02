import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import FlashcardQuiz from './pages/FlashcardQuiz';
import MultchoiceQuiz from './pages/MultchoiceQuiz';
import KanjiDictionary from './pages/KanjiDictionary';
import SRSReview from './pages/SRSReview';
import StrokeOrder from './pages/StrokeOrder';
import AppLayout from './pages/layout/AppLayout';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/flashcard-quiz" element={<FlashcardQuiz />} />
          <Route path="/multchoice-quiz" element={<MultchoiceQuiz />} />
          <Route path="/kanji-dictionary" element={<KanjiDictionary />} />
          <Route path="/srs-review" element={<SRSReview />} />
          <Route path="/stroke-order" element={<StrokeOrder />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
