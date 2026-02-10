import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavBar from "./pages/NavBar"
import Home from "./pages/Home";
import FlashcardQuiz from "./pages/FlashcardQuiz";
import MultchoiceQuiz from "./pages/MultchoiceQuiz";
import KanjiDictionary from "./pages/KanjiDictionary";
import StrokeOrder from "./pages/StrokeOrder";

const App = () => {
  const styles = {
    content: {
      marginTop: "4rem",
    },
  };

  return (
    <Router>
      <NavBar />
      <div style={styles.content}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/flashcard-quiz" element={<FlashcardQuiz />} />
          <Route path="/multchoice-quiz" element={<MultchoiceQuiz />} />
          <Route path="/kanji-dictionary" element={<KanjiDictionary />} />
          <Route path="/stroke-order" element={<StrokeOrder />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

