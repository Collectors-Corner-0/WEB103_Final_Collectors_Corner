import { useState } from 'react'
import Modal from './Modal'

const MEDIA_TYPES = ['book', 'movie', 'music', 'podcast', 'video', 'magazine', 'audiobook']

const AddMediaModal = ({ apiUrl, onClose, onCreated }) => {
  const [form, setForm] = useState({
    title: '',
    creator: '',
    media_type: '',
    description: '',
    cover_image_url: '',
    external_link: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const updateField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }))

  const validate = () => {
    const errors = {}
    if (!form.title.trim()) errors.title = 'Title is required.'
    if (!MEDIA_TYPES.includes(form.media_type)) errors.media_type = 'Media type is required.'
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    setSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch(`${apiUrl}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, is_user_created: true }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Request failed.')

      onCreated()
      onClose()
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Add media" onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        {submitError && <p className="form-error-banner">{submitError}</p>}

        <div className={`field ${fieldErrors.title ? 'invalid' : ''}`}>
          <label htmlFor="media-title">Title</label>
          <input id="media-title" type="text" value={form.title} onChange={updateField('title')} />
          {fieldErrors.title && <p className="field-error">{fieldErrors.title}</p>}
        </div>

        <div className="field">
          <label htmlFor="media-creator">Creator</label>
          <input id="media-creator" type="text" value={form.creator} onChange={updateField('creator')} />
        </div>

        <div className={`field ${fieldErrors.media_type ? 'invalid' : ''}`}>
          <label htmlFor="media-type">Media type</label>
          <select id="media-type" value={form.media_type} onChange={updateField('media_type')}>
            <option value="">Select a type…</option>
            {MEDIA_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {fieldErrors.media_type && <p className="field-error">{fieldErrors.media_type}</p>}
        </div>

        <div className="field">
          <label htmlFor="media-description">Description</label>
          <textarea id="media-description" value={form.description} onChange={updateField('description')} />
        </div>

        <div className="field">
          <label htmlFor="media-cover">Cover image URL</label>
          <input
            id="media-cover"
            type="text"
            value={form.cover_image_url}
            onChange={updateField('cover_image_url')}
          />
        </div>

        <div className="field">
          <label htmlFor="media-external-link">External link</label>
          <input
            id="media-external-link"
            type="text"
            value={form.external_link}
            onChange={updateField('external_link')}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Adding…' : 'Add media'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AddMediaModal
