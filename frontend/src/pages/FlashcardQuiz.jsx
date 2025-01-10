import PropTypes from 'prop-types';

const FlashcardQuiz = ({ toolName = "Flashcard Quiz" }) => (
  <div>
    <h1>{toolName} is under construction!</h1>
    <a href="/">Go back to Home</a>
  </div>
);

FlashcardQuiz.propTypes = {
  toolName: PropTypes.string
};

export default FlashcardQuiz;
