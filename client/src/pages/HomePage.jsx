import { useCallback, useEffect, useState } from 'react'
import HeaderCard from '../components/HeaderCard.jsx'
import CategoryFilterCard from '../components/CategoryFilterCard.jsx'
import TopBar from '../components/TopBar.jsx'
import SuggestionList from '../components/SuggestionList.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { fetchAllSuggestions, fetchSuggestionsByCategory } from '../api.js'

// activeFilter/setActiveFilter are lifted to App.jsx (not local state here)
// so the filter survives navigating away to /add-feedback and back — see
// App.jsx for why.
export default function HomePage({ activeFilter, setActiveFilter }) {
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const loadSuggestions = useCallback(async (filter) => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const data =
        filter === 'All'
          ? await fetchAllSuggestions()
          : await fetchSuggestionsByCategory(filter)
      setSuggestions(data)
    } catch (err) {
      setLoadError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSuggestions(activeFilter)
  }, [activeFilter, loadSuggestions])

  function handleSelectFilter(filter) {
    if (filter === activeFilter) return
    setActiveFilter(filter)
  }

  return (
    <div className="page-shell">
      <div className="page-grid">
        {/* display:contents on these two wrappers (see index.css) means they
            add landmark semantics without changing the grid layout below —
            .page-grid__header/pills/topbar/content stay the actual grid
            items, exactly as before. */}
        <aside className="page-grid__sidebar" aria-label="Company and category filters">
          <div className="page-grid__header">
            <HeaderCard />
          </div>
          <div className="page-grid__pills">
            <CategoryFilterCard activeFilter={activeFilter} onSelect={handleSelectFilter} />
          </div>
        </aside>
        <main className="page-grid__main" aria-label="Suggestions">
          <div className="page-grid__topbar">
            <TopBar count={suggestions.length} />
          </div>
          <div className="page-grid__content">
            {/* Visually hidden — gives the page a proper h1 -> h2 -> h3
                sequence (SuggestionCard titles are h3) without adding a
                second visible heading next to the top bar's count. */}
            <h2 className="visually-hidden">Suggestions</h2>
            <div className="content-card">
              {isLoading ? (
                <p className="content-card__status">Loading suggestions…</p>
              ) : loadError ? (
                <p className="content-card__status content-card__status--error">{loadError}</p>
              ) : suggestions.length === 0 ? (
                <EmptyState />
              ) : (
                <SuggestionList suggestions={suggestions} />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
