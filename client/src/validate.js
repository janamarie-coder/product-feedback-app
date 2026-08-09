import { CATEGORIES } from './constants.js'

// Mirrors server/controllers/suggestionsController.js's validateSuggestionInput
// exactly (same messages, same trimmed-value checks) per PRD Section 2.2.1.
// Duplicated rather than shared because client/ and server/ are separate
// deployable apps with no shared package in this project.
export default function validateFeedbackForm({ title, description, category }) {
  const errors = {}

  const trimmedTitle = typeof title === 'string' ? title.trim() : ''
  const trimmedDescription = typeof description === 'string' ? description.trim() : ''

  if (trimmedTitle.length === 0) {
    errors.title = 'Title is required.'
  } else if (trimmedTitle.length < 2) {
    errors.title = 'Title must be at least 2 characters.'
  } else if (trimmedTitle.length > 100) {
    errors.title = 'Title must be 100 characters or fewer.'
  }

  if (trimmedDescription.length === 0) {
    errors.description = 'Description is required.'
  } else if (trimmedDescription.length < 5) {
    errors.description = 'Description must be at least 5 characters.'
  } else if (trimmedDescription.length > 500) {
    errors.description = 'Description must be 500 characters or fewer.'
  }

  if (typeof category !== 'string' || category.length === 0) {
    errors.category = 'Please select a category.'
  } else if (!CATEGORIES.includes(category)) {
    errors.category = `Category must be one of: ${CATEGORIES.join(', ')}.`
  }

  return errors
}
