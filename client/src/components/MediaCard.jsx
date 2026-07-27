import { useState } from 'react'
import { Link } from 'react-router-dom'

const MediaCard = ({ media, editHref, apiUrl, canAddToLibrary, onAdded }) => {
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [addError, setAddError] = useState(null)

  const hearts = () => {
    let hearts = ''
    for (let i = 0; i < media.rating; i++) {
      hearts += '⁠❤︎'
    }
    return hearts
  }

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
      onAdded?.()
    } catch (err) {
      setAddError(err.message)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="media-card">
      <Link to={`/media/${media.media_id ?? media.id}`} className="media-link">
        <div className="media-img">
          {media.cover_image_url ? (
            <img src={media.cover_image_url} alt={media.title} />
          ) : (
            <div className="media-img-placeholder">{media.title}</div>
          )}
        </div>
        <div className="media-text">
          <p>
            <i>{media.title}</i>
            {media.creator ? ` by ${media.creator}` : ''}
          </p>
        </div>
      </Link>

      {media.media_type && <span className="media-type-badge">{media.media_type}</span>}
      {media.rating != null && <p className="hearts">{hearts()}</p>}
      {media.status && <span className="status-badge">{media.status.replace('_', ' ')}</span>}
      {media.tags?.length > 0 && (
        <div className="tag-chip-row">
          {media.tags.map((tag) => (
            <span key={tag.id} className="tag-chip">
              <span className="tag-swatch" style={{ background: tag.color || 'transparent' }} />
              {tag.name}
            </span>
          ))}
        </div>
      )}
      {media.external_link && (
        <a href={media.external_link} target="_blank" rel="noopener noreferrer" className="external-link">
          View source ↗
        </a>
      )}
      {editHref && (
        <Link to={editHref} className="edit-link">
          Edit
        </Link>
      )}
      {canAddToLibrary && (
        <>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleAddToLibrary}
            disabled={adding || added}
          >
            {added ? 'Added to your collection' : adding ? 'Adding…' : 'Add to my collection'}
          </button>
          {addError && <p className="form-error-banner">{addError}</p>}
        </>
      )}
    </div>
  )
}

export default MediaCard
