const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Paths for the JLPT-level JSON files
const jlptDataDirectory = path.join(__dirname, '../data/jlpt_levels');

// Route to get kanji data for a specific JLPT level
router.get('/:level', (req, res) => {
  let level = req.params.level;

  if (level === 'all') {
    level = '0';
  }

  if (level === '0') {
    // Handle "ALL" filter logic
    let allKanjiData = [];
    const files = ['5', '4', '3', '2', '1'].map((lvl) =>
      path.join(jlptDataDirectory, `jlpt_level_${lvl}.json`)
    );

    let currentIdOffset = 0;

    files.forEach((filePath, index) => {
      if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath, 'utf8');
        try {
          const parsedData = JSON.parse(fileData);
          // Adjust IDs to ensure they are unique across all levels
          parsedData.forEach((entry) => {
            entry.id += currentIdOffset; // Offset IDs
          });
          allKanjiData.push(...parsedData);
          currentIdOffset += parsedData.length; // Update offset
        } catch (err) {
          console.error(`Error parsing data from file: ${filePath}`, err);
        }
      } else {
        console.warn(`File not found: ${filePath}`);
      }
    });

    return res.json(allKanjiData);
  }

  if (!['5', '4', '3', '2', '1'].includes(level)) {
    console.warn(`Invalid JLPT level: ${level}`);
    return res.status(400).json({ error: 'Invalid JLPT level' });
  }

  const filePath = path.join(jlptDataDirectory, `jlpt_level_${level}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return res.status(404).json({ error: 'Kanji data not found for this level' });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file for JLPT level ${level}:`, err);
      return res.status(500).json({ error: 'Failed to load kanji data' });
    }

    try {
      const kanjiData = JSON.parse(data);
      res.json(kanjiData);
    } catch (parseError) {
      console.error('Error parsing kanji data:', parseError);
      res.status(500).json({ error: 'Failed to parse kanji data' });
    }
  });
});

module.exports = router;
