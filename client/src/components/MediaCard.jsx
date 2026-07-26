import { Link } from 'react-router-dom'

const MediaCard = ({ media, editHref }) => {
  const hearts = () => {
    let hearts = ''
    for (let i = 0; i < media.rating; i++) {
      hearts += '⁠❤︎'
    }
    return hearts
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
      )
      )}
      {editHref && (
        <Link to={editHref} className="edit-link">
          Edit
        </Link>
      )}
    </div>
  )
}

export default MediaCard
