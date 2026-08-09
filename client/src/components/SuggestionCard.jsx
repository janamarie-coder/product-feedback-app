export default function SuggestionCard({ suggestion }) {
  return (
    <li className="suggestion-card">
      <h3 className="suggestion-card__title">{suggestion.title}</h3>
      <p className="suggestion-card__description">{suggestion.description}</p>
      <span className="tag">{suggestion.category}</span>
    </li>
  )
}
