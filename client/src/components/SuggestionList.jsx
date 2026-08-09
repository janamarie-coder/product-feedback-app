import SuggestionCard from './SuggestionCard.jsx'

export default function SuggestionList({ suggestions }) {
  return (
    <ul className="suggestion-list">
      {suggestions.map((suggestion) => (
        <SuggestionCard key={suggestion.id} suggestion={suggestion} />
      ))}
    </ul>
  )
}
