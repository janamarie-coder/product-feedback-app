// Fixed category list from PRD Section 3 — must match the server's
// ALLOWED_CATEGORIES exactly (server/controllers/suggestionsController.js).
export const CATEGORIES = ['UI', 'UX', 'Enhancement', 'Bug', 'Feature']

// Home page filter pills = the 5 categories plus "All".
export const FILTERS = ['All', ...CATEGORIES]

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
