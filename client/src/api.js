import { API_BASE_URL } from './constants.js'

async function parseJsonSafe(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function fetchAllSuggestions() {
  const response = await fetch(`${API_BASE_URL}/get-all-suggestions`)
  const data = await parseJsonSafe(response)
  if (!response.ok) {
    throw new Error((data && data.error) || 'Failed to load suggestions.')
  }
  return data.suggestions
}

export async function fetchSuggestionsByCategory(category) {
  const response = await fetch(
    `${API_BASE_URL}/get-suggestions-by-category/${encodeURIComponent(category)}`
  )
  const data = await parseJsonSafe(response)
  if (!response.ok) {
    throw new Error((data && data.error) || 'Failed to load suggestions.')
  }
  return data.suggestions
}

export async function createSuggestion({ title, description, category }) {
  const response = await fetch(`${API_BASE_URL}/add-one-suggestion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, category }),
  })
  const data = await parseJsonSafe(response)
  if (!response.ok) {
    // 400s come back as { errors: { field: message } } per the PRD —
    // surface that shape so the caller can map errors onto form fields.
    const error = new Error('Validation failed.')
    error.fieldErrors = (data && data.errors) || null
    error.serverMessage = (data && data.error) || null
    throw error
  }
  return data.suggestion
}
