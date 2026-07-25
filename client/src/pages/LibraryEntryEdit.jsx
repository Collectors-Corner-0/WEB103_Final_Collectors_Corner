import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useFetch from '../hooks/useFetch'
import Modal from '../components/Modal'

const STATUSES = ['planned', 'in_progress', 'completed', 'archived']
const RATINGS = [1, 2, 3, 4, 5]

const LibraryEntryEdit = ({ apiUrl }) => {
  const { entryId } = useParams()
  const navigate = useNavigate()
  const { data: entry, loading, error, refetch: refetchEntry } = useFetch(`${apiUrl}/library/entry/${entryId}`)
  const { data: allTags } = useFetch(entry ? `${apiUrl}/tags/${entry.user_id}` : null)

  const [form, setForm] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [tagError, setTagError] = useState(null)
  const [togglingTagId, setTogglingTagId] = useState(null)

  useEffect(() => {
    if (entry) {
      setForm({
        status: entry.status,
        rating: entry.rating != null ? String(entry.rating) : '',
        personal_notes: entry.personal_notes || '',
        date_acquired: entry.date_acquired ? entry.date_acquired.slice(0, 10) : '',
      })
    }
  }, [entry])

  if (loading || !form) return <p>Loading…</p>
  if (error) return <p className="error-message">{error}</p>

  const updateField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch(`${apiUrl}/library/${entryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: form.status,
          rating: form.rating === '' ? null : Number(form.rating),
          personal_notes: form.personal_notes,
          date_acquired: form.date_acquired || null,
        }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Request failed.')

      navigate(`/collections/${entry.user_id}`)
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleTag = async (tag, isAssigned) => {
    setTogglingTagId(tag.id)
    setTagError(null)

    try {
      const res = await fetch(`${apiUrl}/library/${entryId}/tags/${tag.id}`, {
        method: isAssigned ? 'DELETE' : 'POST',
        credentials: 'include',
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Request failed.')

      refetchEntry()
    } catch (err) {
      setTagError(err.message)
    } finally {
      setTogglingTagId(null)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setDeleteError(null)

    try {
      const res = await fetch(`${apiUrl}/library/${entryId}`, { method: 'DELETE', credentials: 'include' })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Request failed.')

      navigate(`/collections/${entry.user_id}`)
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="collector-container media-detail">
      {entry.cover_image_url && <img src={entry.cover_image_url} alt={entry.title} />}
      <h2>{entry.title}</h2>
      {entry.creator && <h4>by {entry.creator}</h4>}

      <form onSubmit={handleSubmit} noValidate>
        {submitError && <p className="form-error-banner">{submitError}</p>}

        <div className="field">
          <label htmlFor="entry-status">Status</label>
          <select id="entry-status" value={form.status} onChange={updateField('status')}>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="entry-rating">Rating</label>
          <select id="entry-rating" value={form.rating} onChange={updateField('rating')}>
            <option value="">Not rated</option>
            {RATINGS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="entry-notes">Personal notes</label>
          <textarea id="entry-notes" value={form.personal_notes} onChange={updateField('personal_notes')} />
        </div>

        <div className="field">
          <label htmlFor="entry-date-acquired">Date acquired</label>
          <input
            id="entry-date-acquired"
            type="date"
            value={form.date_acquired}
            onChange={updateField('date_acquired')}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-danger" onClick={() => setIsConfirmingDelete(true)}>
            Delete entry
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>

      <div className="field">
        <label>Tags</label>
        {tagError && <p className="form-error-banner">{tagError}</p>}
        <div className="tag-toggle-row">
          {(allTags || []).map((tag) => {
            const isAssigned = entry.tags.some((t) => t.id === tag.id)
            return (
              <button
                key={tag.id}
                type="button"
                className={`tag-toggle ${isAssigned ? 'assigned' : ''}`}
                onClick={() => handleToggleTag(tag, isAssigned)}
                disabled={togglingTagId === tag.id}
              >
                <span className="tag-swatch" style={{ background: tag.color || 'transparent' }} />
                {tag.name}
              </button>
            )
          })}
          {allTags && allTags.length === 0 && (
            <p className="hint-text">No tags yet — create one from the collection view.</p>
          )}
        </div>
      </div>

      {isConfirmingDelete && (
        <Modal title="Delete this entry?" onClose={() => setIsConfirmingDelete(false)}>
          {deleteError && <p className="form-error-banner">{deleteError}</p>}
          <p>This removes “{entry.title}” from this collection. This can't be undone.</p>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsConfirmingDelete(false)}
              disabled={deleting}
            >
              Cancel
            </button>
            <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete entry'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default LibraryEntryEdit
