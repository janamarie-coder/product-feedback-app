import { Link } from 'react-router-dom'

function formatCount(count) {
  return count === 1 ? '1 Suggestion' : `${count} Suggestions`
}

export default function TopBar({ count }) {
  return (
    <div className="top-bar">
      <span className="top-bar__count">{formatCount(count)}</span>
      <Link to="/add-feedback" className="btn btn--purple">
        <span className="btn__icon" aria-hidden="true">+</span> Add Feedback
      </Link>
    </div>
  )
}
