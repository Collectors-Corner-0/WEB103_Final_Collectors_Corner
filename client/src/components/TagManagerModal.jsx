import { useState } from 'react'
import Modal from './Modal'

const TagManagerModal = ({ apiUrl, tags, onClose, onChange }) => {
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#2f4858')
  const [editValues, setEditValues] = useState({})
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const getEdit = (tag) => editValues[tag.id] || { name: tag.name, color: tag.color || '#2f4858' }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) {
      setError('Name is required.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`${apiUrl}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newName, color: newColor }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Request failed.')
      setNewName('')
      onChange()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const handleSave = async (tag) => {
    const edit = getEdit(tag)
    if (!edit.name.trim()) {
      setError('Name is required.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`${apiUrl}/tags/${tag.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: edit.name, color: edit.color }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Request failed.')
      onChange()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (tag) => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`${apiUrl}/tags/${tag.id}`, { method: 'DELETE', credentials: 'include' })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Request failed.')
      onChange()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title="Manage tags" onClose={onClose}>
      {error && <p className="form-error-banner">{error}</p>}

      <form onSubmit={handleCreate} className="tag-manager-new-row">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New tag name"
          aria-label="New tag name"
        />
        <input
          type="color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          aria-label="New tag color"
        />
        <button type="submit" className="btn btn-primary" disabled={busy}>
          Add
        </button>
      </form>

      <ul className="tag-manager-list">
        {tags.map((tag) => {
          const edit = getEdit(tag)
          return (
            <li key={tag.id} className="tag-manager-row">
              <input
                type="text"
                value={edit.name}
                onChange={(e) =>
                  setEditValues((v) => ({ ...v, [tag.id]: { ...edit, name: e.target.value } }))
                }
                aria-label={`Name for ${tag.name}`}
              />
              <input
                type="color"
                value={edit.color}
                onChange={(e) =>
                  setEditValues((v) => ({ ...v, [tag.id]: { ...edit, color: e.target.value } }))
                }
                aria-label={`Color for ${tag.name}`}
              />
              <button type="button" className="btn btn-secondary" onClick={() => handleSave(tag)} disabled={busy}>
                Save
              </button>
              <button type="button" className="btn btn-danger" onClick={() => handleDelete(tag)} disabled={busy}>
                Delete
              </button>
            </li>
          )
        })}
      </ul>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Done
        </button>
      </div>
    </Modal>
  )
}

export default TagManagerModal
