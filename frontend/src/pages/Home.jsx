import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Kanji Study Utility</h1>
      <p style={styles.subtitle}>Your hub for mastering kanji efficiently!</p>
      <div style={styles.linkContainer}>
        <Link to="/flashcard-quiz" style={styles.link}>Flashcard Quiz</Link>
        <Link to="/kanji-dictionary" style={styles.link}>Kanji Dictionary</Link>
        <Link to="/stroke-order" style={styles.link}>Stroke Order Quiz (Coming Soon!)</Link>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
  },
  title: {
    fontSize: "3rem",
    marginBottom: "1rem",
  },
  subtitle: {
    fontSize: "1.5rem",
    marginBottom: "2rem",
    color: "#555",
  },
  linkContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
    maxWidth: "300px",
  },
  link: {
    textDecoration: "none",
    fontSize: "1.25rem",
    color: "#007BFF",
    padding: "0.5rem 1rem",
    border: "1px solid #007BFF",
    borderRadius: "5px",
    transition: "all 0.3s ease",
  },
};

export default Home;
