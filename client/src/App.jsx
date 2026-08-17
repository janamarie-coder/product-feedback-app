import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import AddFeedbackPage from './pages/AddFeedbackPage.jsx'

export default function App() {
  // Lifted above HomePage (rather than local useState inside it) so it
  // survives navigating to /add-feedback and back — HomePage unmounts on
  // route change, App does not. Fixes: filter resetting to "All" after
  // AddFeedback, which violated PRD 2.2.2 ("Do NOT reset the filter to All").
  const [activeFilter, setActiveFilter] = useState('All')

  return (
    <Routes>
      <Route
        path="/"
        element={<HomePage activeFilter={activeFilter} setActiveFilter={setActiveFilter} />}
      />
      <Route path="/add-feedback" element={<AddFeedbackPage />} />
    </Routes>
  )
}
