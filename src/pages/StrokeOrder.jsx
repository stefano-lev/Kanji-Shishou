import PropTypes from 'prop-types';

const StrokeOrder = ({ toolName = "Stroke Order" }) => (
  <div>
    <h1>{toolName} is under construction!</h1>
    <a href="/">Go back to Home</a>
  </div>
);

StrokeOrder.propTypes = {
  toolName: PropTypes.string
};

export default StrokeOrder;
