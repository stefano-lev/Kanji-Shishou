import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import FlashcardQuiz from "./pages/FlashcardQuiz";
import KanjiDictionary from "./pages/KanjiDictionary";
import StrokeOrder from "./pages/StrokeOrder";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/flashcard-quiz" element={<FlashcardQuiz />} />
          <Route path="/kanji-dictionary" element={<KanjiDictionary />} />
          <Route path="/stroke-order" element={<StrokeOrder />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
