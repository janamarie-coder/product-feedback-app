import { useCallback, useEffect, useState } from 'react'
import HeaderCard from '../components/HeaderCard.jsx'
import CategoryFilterCard from '../components/CategoryFilterCard.jsx'
import TopBar from '../components/TopBar.jsx'
import SuggestionList from '../components/SuggestionList.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { fetchAllSuggestions, fetchSuggestionsByCategory } from '../api.js'

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState('All')
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
        <div className="page-grid__header">
          <HeaderCard />
        </div>
        <div className="page-grid__pills">
          <CategoryFilterCard activeFilter={activeFilter} onSelect={handleSelectFilter} />
        </div>
        <div className="page-grid__topbar">
          <TopBar count={suggestions.length} />
        </div>
        <div className="page-grid__content">
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
      </div>
    </div>
  )
}
