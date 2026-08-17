import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CATEGORIES } from '../constants.js'
import { createSuggestion } from '../api.js'
import validateFeedbackForm from '../validate.js'

const initialFormState = { title: '', category: '', description: '' }

export default function AddFeedbackPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialFormState)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  function handleChange(field) {
    return (event) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }))
    }
  }

  function handleCancel() {
    navigate('/')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationErrors = validateFeedbackForm(form)
    setErrors(validationErrors)
    setSubmitError(null)

    // Client-side validation failed — block submission, API is not called.
    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsSubmitting(true)
    try {
      await createSuggestion(form)
      // PRD 2.2.2: on success, go back to Home. The active filter on Home
      // is NOT reset — the new suggestion only shows if it matches
      // whatever filter is still active there.
      navigate('/')
    } catch (err) {
      if (err.fieldErrors) {
        setErrors(err.fieldErrors)
      } else {
        setSubmitError(err.serverMessage || 'Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-shell">
      <div className="add-feedback-page">
        <button type="button" className="back-link" onClick={handleCancel}>
          <span aria-hidden="true">&lsaquo;</span> Go Back
        </button>

        <div className="feedback-form-card">
          <span className="feedback-form-card__icon" aria-hidden="true">
            +
          </span>
          <h1 className="feedback-form-card__heading">Create New Feedback</h1>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="title">Feedback Title</label>
              <p id="title-helper" className="form-field__helper">
                Add a short, descriptive headline
              </p>
              <input
                id="title"
                type="text"
                value={form.title}
                onChange={handleChange('title')}
                className={errors.title ? 'input input--error' : 'input'}
                aria-invalid={Boolean(errors.title)}
                aria-describedby={
                  errors.title ? 'title-helper title-error' : 'title-helper'
                }
              />
              {errors.title && (
                <p id="title-error" className="form-field__error">
                  {errors.title}
                </p>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="category">Category</label>
              <p id="category-helper" className="form-field__helper">
                Choose a category for your feedback
              </p>
              <select
                id="category"
                value={form.category}
                onChange={handleChange('category')}
                className={errors.category ? 'input input--error' : 'input'}
                aria-invalid={Boolean(errors.category)}
                aria-describedby={
                  errors.category ? 'category-helper category-error' : 'category-helper'
                }
              >
                <option value="" disabled>
                  Select a category
                </option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p id="category-error" className="form-field__error">
                  {errors.category}
                </p>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="description">Feedback Detail</label>
              <p id="description-helper" className="form-field__helper">
                Include any specific comments on what should be improved, added, etc.
              </p>
              <textarea
                id="description"
                rows={5}
                value={form.description}
                onChange={handleChange('description')}
                className={errors.description ? 'input input--error' : 'input'}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={
                  errors.description
                    ? 'description-helper description-error'
                    : 'description-helper'
                }
              />
              {errors.description && (
                <p id="description-error" className="form-field__error">
                  {errors.description}
                </p>
              )}
            </div>

            {submitError && (
              <p className="form-field__error form-field__error--general">{submitError}</p>
            )}

            <div className="feedback-form-card__actions">
              <button type="button" className="btn btn--navy" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="btn btn--purple" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting…' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
