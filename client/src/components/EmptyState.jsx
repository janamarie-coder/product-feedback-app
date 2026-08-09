import { Link } from 'react-router-dom'
import DetectiveIllustration from './DetectiveIllustration.jsx'

export default function EmptyState() {
  return (
    <div className="empty-state">
      <DetectiveIllustration />
      <h2 className="empty-state__heading">There is no feedback yet.</h2>
      <p className="empty-state__subtext">Try a different category or add a suggestion.</p>
      <Link to="/add-feedback" className="btn btn--purple">
        <span className="btn__icon" aria-hidden="true">+</span> Add Feedback
      </Link>
    </div>
  )
}
