import { useState } from 'react'
import { useParams } from 'react-router-dom'
import useFetch from '../hooks/useFetch'

const MediaDetail = ({ apiUrl, currentUserId }) => {
  const { id } = useParams()
  const { data: media, loading, error } = useFetch(`${apiUrl}/media/${id}`)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [addError, setAddError] = useState(null)

  if (loading) return <p>Loading…</p>
  if (error) return <p className="error-message">{error}</p>

  const handleAddToLibrary = async () => {
    setAdding(true)
    setAddError(null)

    try {
      const res = await fetch(`${apiUrl}/library`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ media_id: media.id }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Request failed.')

      setAdded(true)
    } catch (err) {
      setAddError(err.message)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="collector-container media-detail">
      {media.cover_image_url && <img src={media.cover_image_url} alt={media.title} />}
      <h2>{media.title}</h2>
      {media.creator && <h4>by {media.creator}</h4>}
      <p className="media-type-badge">{media.media_type}</p>
      {media.description && <p>{media.description}</p>}
      {media.external_link && (
        <a href={media.external_link} target="_blank" rel="noopener noreferrer">
          View source ↗
        </a>
      )}
      {currentUserId != null && (
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleAddToLibrary}
            disabled={adding || added}
          >
            {added ? 'Added to your collection' : adding ? 'Adding…' : 'Add to my collection'}
          </button>
        </div>
      )}
      {addError && <p className="form-error-banner">{addError}</p>}
    </div>
  )
}

export default MediaDetail
