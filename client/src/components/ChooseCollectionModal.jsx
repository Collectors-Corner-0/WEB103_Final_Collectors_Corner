import { useState } from 'react'
import Modal from './Modal'
import useFetch from '../hooks/useFetch'

const ChooseCollectionModal = ({ apiUrl, userId, onClose, onSelect }) => {
  const { data: collections, loading, error } = useFetch(`${apiUrl}/collections/${userId}`)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)

  const handleSelectExisting = (collectionId) => {
    onSelect(collectionId)
    onClose()
  }

  const handleCreateNew = async (e) => {
    e.preventDefault()
    setCreating(true)
    setCreateError(null)

    try {
      const res = await fetch(`${apiUrl}/collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newName.trim() || undefined }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Request failed.')

      onSelect(body.id)
      onClose()
    } catch (err) {
      setCreateError(err.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <Modal title="Choose a collection" onClose={onClose}>
      {loading && <p>Loading…</p>}
      {error && <p className="error-message">{error}</p>}

      {collections && collections.length > 0 && (
        <ul className="tag-manager-list">
          {collections.map((collection) => (
            <li key={collection.id} className="tag-manager-row">
              <button type="button" className="btn btn-secondary" onClick={() => handleSelectExisting(collection.id)}>
                {collection.name} ({collection.item_count})
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleCreateNew} className="tag-manager-new-row">
        {createError && <p className="form-error-banner">{createError}</p>}
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New collection name (optional)"
          aria-label="New collection name"
        />
        <button type="submit" className="btn btn-primary" disabled={creating}>
          {creating ? 'Creating…' : 'Create new collection'}
        </button>
      </form>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
      </div>
    </Modal>
  )
}

export default ChooseCollectionModal
