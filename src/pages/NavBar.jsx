import { NavLink } from "react-router-dom";

const NavBar = () => {
  const styles = {
    navbar: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#333",
      padding: "1rem",
      gap: "1.5rem",
      position: "fixed",
      top: 0,
      width: "100%",
      zIndex: 1000,
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    },
    link: {
      textDecoration: "none",
      fontSize: "1rem",
      color: "#fff",
      padding: "0.5rem 1rem",
      borderRadius: "5px",
      transition: "background-color 0.3s ease",
    },
    activeLink: {
      backgroundColor: "#555",
    },
  };

  return (
    <nav style={styles.navbar}>
      <NavLink
        to="/"
        style={({ isActive }) =>
          isActive ? { ...styles.link, ...styles.activeLink } : styles.link
        }
      >
        Home
      </NavLink>
      <NavLink
        to="/flashcard-quiz"
        style={({ isActive }) =>
          isActive ? { ...styles.link, ...styles.activeLink } : styles.link
        }
      >
        Flashcard Quiz
      </NavLink>
      <NavLink
        to="/multchoice-quiz"
        style={({ isActive }) =>
          isActive ? { ...styles.link, ...styles.activeLink } : styles.link
        }
      >
        Multiple Choice Quiz
      </NavLink>
      <NavLink
        to="/kanji-dictionary"
        style={({ isActive }) =>
          isActive ? { ...styles.link, ...styles.activeLink } : styles.link
        }
      >
        Kanji Dictionary
      </NavLink>
      <NavLink
        to="/stroke-order"
        style={({ isActive }) =>
          isActive ? { ...styles.link, ...styles.activeLink } : styles.link
        }
      >
        Stroke Order Quiz
      </NavLink>
    </nav>
  );
};

export default NavBar;
