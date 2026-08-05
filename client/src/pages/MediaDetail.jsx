import { useParams } from 'react-router-dom'
import useFetch from '../hooks/useFetch'
import useAddToLibrary from '../hooks/useAddToLibrary'
import Spinner from '../components/Spinner'
import ChooseCollectionModal from '../components/ChooseCollectionModal'

const MediaDetail = ({ apiUrl, currentUserId }) => {
  const { id } = useParams()
  const { data: media, loading, error } = useFetch(`${apiUrl}/media/${id}`)
  // Hooks must run unconditionally, before the loading/error guards below --
  // media?.id is undefined until it loads, which is fine since attemptAdd()
  // can't actually fire until the button below has rendered.
  const { adding, added, addError, needsCollectionChoice, attemptAdd, closeCollectionChoice } = useAddToLibrary(
    apiUrl,
    media?.id
  )

  if (loading) return <Spinner />
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
      {currentUserId != null && (
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => attemptAdd()} disabled={adding || added}>
            {added ? 'Added to your collection' : adding ? 'Adding…' : 'Add to my collection'}
          </button>
        </div>
      )}
      {currentUserId != null && addError && <p className="form-error-banner">{addError}</p>}

      {currentUserId != null && needsCollectionChoice && (
        <ChooseCollectionModal
          apiUrl={apiUrl}
          userId={currentUserId}
          onClose={closeCollectionChoice}
          onSelect={(collectionId) => attemptAdd(collectionId)}
        />
      )}
    </div>
  )
}

export default MediaDetail
