import { useEffect, useState } from "react";

const KanjiDictionary = () => {
  const [kanjiData, setKanjiData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("0");
  const [sortFilter, setSortFilter] = useState("0");

  const fetchKanjiData = async (level) => {
    console.log(`[INFO] Fetching kanji data for JLPT Level ${level}...`);
    setIsLoading(true);

    try {
      const url =
        level === "0"
          ? `http://localhost:5000/api/kanji/all`
          : `http://localhost:5000/api/kanji/${level}`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setKanjiData(data);
      } else {
        alert("Failed to load kanji data.");
      }
    } catch (error) {
      console.error("Error fetching kanji data:", error);
      alert("An error occurred while fetching kanji data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKanjiData(selectedLevel);
  }, [selectedLevel]);

  useEffect(() => {
    const sortedData = [...kanjiData].sort((a, b) => {
      if (sortFilter === "1") {
        return a.stroke_count - b.stroke_count; // Sort by stroke count
      } else if (sortFilter === "2") {
        return a.frequency - b.frequency; // Sort by frequency
      }
      return a.id - b.id; // Default sort by ID
    });
    setKanjiData(sortedData);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortFilter]);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Kanji Dictionary</h1>
      <div>
        <label htmlFor="jlpt-level">Filter: </label>
        <select
          id="jlpt-level"
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          style={styles.select}
        >
          <option value="0">All</option>
          <option value="5">JLPT Level N5</option>
          <option value="4">JLPT Level N4</option>
          <option value="3">JLPT Level N3</option>
          <option value="2">JLPT Level N2</option>
          <option value="1">JLPT Level N1</option>
        </select>

        <label htmlFor="filter-sort">Sort by: </label>
        <select
          id="filter-sort"
          value={sortFilter}
          onChange={(e) => setSortFilter(e.target.value)}
          style={styles.select}
        >
          <option value="0">ID</option>
          <option value="1">Stroke Count</option>
          <option value="2">Frequency</option>
        </select>
      </div>

      <div style={styles.gridContainer}>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          kanjiData.map((kanji, index) => (
            <div key={index} style={styles.kanjiBlock}>
              {kanji.literal || "No Kanji"}
              <div style={styles.kanjiId}>#{kanji.id}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "Arial, sans-serif",
  },
  heading: {
    fontSize: "2rem",
    marginBottom: "20px",
  },
  select: {
    margin: "0 10px",
    padding: "5px",
    fontSize: "1rem",
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
    gap: "10px",
    padding: "20px",
    width: "100%",
    maxWidth: "800px",
  },
  kanjiBlock: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
    padding: "10px",
    fontSize: "1.5rem",
    fontWeight: "bold",
    textAlign: "center",
    height: "100px",
    width: "100px",
  },
  kanjiId: {
    position: "absolute",
    bottom: "5px",
    right: "12px",
    fontSize: "0.75rem",
    color: "#666",
  },
};

export default KanjiDictionary;
