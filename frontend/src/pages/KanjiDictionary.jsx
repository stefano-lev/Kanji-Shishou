import PropTypes from 'prop-types';

const KanjiDictionary = ({ toolName = "Kanji Dictionary" }) => (
  <div>
    <h1>{toolName} is under construction!</h1>
    <a href="/">Go back to Home</a>
  </div>
);

KanjiDictionary.propTypes = {
  toolName: PropTypes.string
};

export default KanjiDictionary;
