const pool = require('../db/pool');

// Fixed category list from PRD Section 3 — single source of truth for
// both the GET-by-category error and the POST validation below.
const ALLOWED_CATEGORIES = ['UI', 'UX', 'Enhancement', 'Bug', 'Feature'];

function formatSuggestion(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    createdAt: row.created_at.toISOString(),
  };
}

async function getAllSuggestions(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT id, title, description, category, created_at FROM suggestions ORDER BY created_at DESC'
    );
    res.status(200).json({ suggestions: result.rows.map(formatSuggestion) });
  } catch (err) {
    next(err);
  }
}

async function getSuggestionsByCategory(req, res, next) {
  const { category } = req.params;

  if (!ALLOWED_CATEGORIES.includes(category)) {
    return res.status(400).json({
      error: `Invalid category. Must be one of: ${ALLOWED_CATEGORIES.join(', ')}.`,
    });
  }

  try {
    const result = await pool.query(
      'SELECT id, title, description, category, created_at FROM suggestions WHERE category = $1 ORDER BY created_at DESC',
      [category]
    );
    res.status(200).json({ suggestions: result.rows.map(formatSuggestion) });
  } catch (err) {
    next(err);
  }
}

// Validates against the TRIMMED values (per PRD 2.2.1) and returns both
// the field errors (if any) and the trimmed strings, so the caller never
// has to trim twice or risk validating something different from what
// actually gets stored.
function validateSuggestionInput({ title, description, category }) {
  const errors = {};

  const trimmedTitle = typeof title === 'string' ? title.trim() : '';
  const trimmedDescription = typeof description === 'string' ? description.trim() : '';

  if (trimmedTitle.length === 0) {
    errors.title = 'Title is required.';
  } else if (trimmedTitle.length < 2) {
    errors.title = 'Title must be at least 2 characters.';
  } else if (trimmedTitle.length > 100) {
    errors.title = 'Title must be 100 characters or fewer.';
  }

  if (trimmedDescription.length === 0) {
    errors.description = 'Description is required.';
  } else if (trimmedDescription.length < 5) {
    errors.description = 'Description must be at least 5 characters.';
  } else if (trimmedDescription.length > 500) {
    errors.description = 'Description must be 500 characters or fewer.';
  }

  if (typeof category !== 'string' || category.trim().length === 0) {
    errors.category = 'Please select a category.';
  } else if (!ALLOWED_CATEGORIES.includes(category)) {
    errors.category = `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}.`;
  }

  return { errors, trimmedTitle, trimmedDescription };
}

async function addOneSuggestion(req, res, next) {
  const { title, description, category } = req.body;

  const { errors, trimmedTitle, trimmedDescription } = validateSuggestionInput({
    title,
    description,
    category,
  });

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const result = await pool.query(
      `INSERT INTO suggestions (title, description, category)
       VALUES ($1, $2, $3)
       RETURNING id, title, description, category, created_at`,
      [trimmedTitle, trimmedDescription, category]
    );
    res.status(201).json({ suggestion: formatSuggestion(result.rows[0]) });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  ALLOWED_CATEGORIES,
  getAllSuggestions,
  getSuggestionsByCategory,
  addOneSuggestion,
};
