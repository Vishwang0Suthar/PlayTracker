const express = require('express');
const router = express.Router();

let score = 0; // Initial score

router.get('/score', (req, res) => {
  res.json({ score });
});

router.post('/score', (req, res) => {
  const { score: newScore } = req.body;
  score = newScore;
  res.json({ message: 'Score updated successfully' });
});

module.exports = router;
