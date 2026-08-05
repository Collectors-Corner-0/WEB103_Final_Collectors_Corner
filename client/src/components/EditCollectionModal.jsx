import { useState } from 'react'
import Modal from './Modal'

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png']
const MAX_FILE_BYTES = 2 * 1024 * 1024

const EditCollectionModal = ({ apiUrl, collection, onClose, onSaved, onDeleted }) => {
  const [form, setForm] = useState({
    name: collection.name,
    avatar_url: collection.avatar_url || '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const updateField = (name) => (e) => {
    setForm((f) => ({ ...f, [name]: e.target.value }))
    setFieldErrors((errors) => ({ ...errors, [name]: undefined }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setFieldErrors((errors) => ({ ...errors, avatar_url: 'Please choose a JPG or PNG image.' }))
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      setFieldErrors((errors) => ({ ...errors, avatar_url: 'Image must be smaller than 2MB.' }))
      return
    }

    setFieldErrors((errors) => ({ ...errors, avatar_url: undefined }))
    const reader = new FileReader()
    reader.onerror = () => setFieldErrors((errors) => ({ ...errors, avatar_url: 'Could not read that file.' }))
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      setForm((f) => ({ ...f, avatar_url: result }))
    }
    reader.readAsDataURL(file)
  }

  const validate = () => {
    const errors = {}
    if (!form.name.trim()) errors.name = 'Name is required.'
    return errors
  }

  const handleDelete = async () => {
    setDeleting(true)
    setDeleteError(null)

    try {
      const res = await fetch(`${apiUrl}/collections/${collection.id}`, { method: 'DELETE', credentials: 'include' })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Request failed.')

      onDeleted()
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleting(false)
    }
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
      const res = await fetch(`${apiUrl}/collections/${collection.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: form.name.trim(), avatar_url: form.avatar_url.trim() }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Request failed.')

      onSaved(body)
      onClose()
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Edit collection" onClose={onClose}>
      {isConfirmingDelete ? (
        <div className="delete-confirm">
          {deleteError && <p className="form-error-banner">{deleteError}</p>}
          <p>
            This permanently deletes “{collection.name}” and all {collection.item_count ?? 0} item
            {collection.item_count === 1 ? '' : 's'} in it. Removing every item from a collection does{' '}
            <strong>not</strong> delete the collection itself — this is the only way to. This can't be undone.
          </p>
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
              {deleting ? 'Deleting…' : 'Delete collection'}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          {submitError && <p className="form-error-banner">{submitError}</p>}

          {form.avatar_url && (
            <img src={form.avatar_url} alt="Collection avatar preview" className="collection-avatar-preview" />
          )}

          <div className={`field ${fieldErrors.name ? 'invalid' : ''}`}>
            <label htmlFor="collection-name">Name</label>
            <input id="collection-name" type="text" value={form.name} onChange={updateField('name')} />
            {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
          </div>

          <div className={`field ${fieldErrors.avatar_url ? 'invalid' : ''}`}>
            <label htmlFor="collection-avatar-url">Avatar image URL</label>
            <input
              id="collection-avatar-url"
              type="text"
              value={form.avatar_url}
              onChange={updateField('avatar_url')}
            />
          </div>

          <div className="field">
            <label htmlFor="collection-avatar-file">Or upload a JPG/PNG from your device</label>
            <input
              id="collection-avatar-file"
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
            />
            {fieldErrors.avatar_url && <p className="field-error">{fieldErrors.avatar_url}</p>}
          </div>

          <div className="form-actions-split">
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setIsConfirmingDelete(true)}
              disabled={submitting}
            >
              Delete collection
            </button>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  )
}

export default EditCollectionModal
