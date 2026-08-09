import { FILTERS } from '../constants.js'

export default function CategoryFilterCard({ activeFilter, onSelect }) {
  return (
    <div className="filter-card">
      <div className="filter-card__pills">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            className={`pill${filter === activeFilter ? ' pill--active' : ''}`}
            aria-pressed={filter === activeFilter}
            onClick={() => onSelect(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  )
}
