import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Kanji Shishou</h1>
      <h2 style={styles.subtitle}>漢字師匠</h2>
      <p style={styles.subtitle}>Your hub for mastering kanji efficiently!</p>
      <div style={styles.linkContainer}>
        <Link to="/flashcard-quiz" style={styles.link}>Flashcard Quiz</Link>
        <Link to="/multchoice-quiz" style={styles.link}>Multchoice Quiz</Link>
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
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "1.5rem",
    marginBottom: "2rem",
    color: "#fff",
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
    color: "#fff",
    background: "#007BFF",
    padding: "0.5rem 1rem",
    border: "1px solidrgb(0, 25, 52)",
    borderRadius: "5px",
    transition: "all 0.3s ease",
  },
};

export default Home;
