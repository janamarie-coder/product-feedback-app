const express = require('express');
const {
  getAllSuggestions,
  getSuggestionsByCategory,
  addOneSuggestion,
} = require('../controllers/suggestionsController');

const router = express.Router();

router.get('/get-all-suggestions', getAllSuggestions);
router.get('/get-suggestions-by-category/:category', getSuggestionsByCategory);
router.post('/add-one-suggestion', addOneSuggestion);

module.exports = router;
