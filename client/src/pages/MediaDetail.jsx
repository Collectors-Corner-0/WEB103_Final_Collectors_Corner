import { useParams } from 'react-router-dom'
import useFetch from '../hooks/useFetch'

const MediaDetail = ({ apiUrl }) => {
  const { id } = useParams()
  const { data: media, loading, error } = useFetch(`${apiUrl}/media/${id}`)

  if (loading) return <p>Loading…</p>
  if (error) return <p className="error-message">{error}</p>

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
    </div>
  )
}

export default MediaDetail
