import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from '@components/home/Home';
import AppLayout from '@components/layout/AppLayout';
import KanjiDictionary from '@components/dictionary/KanjiDictionary';
import FlashcardQuiz from '@components/quiz/FlashcardQuiz';
import MultchoiceQuiz from '@components/quiz/MultchoiceQuiz';
import SRSReview from '@components/quiz/SRSReview';
import StrokeOrder from '@components/quiz/StrokeOrder';

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
