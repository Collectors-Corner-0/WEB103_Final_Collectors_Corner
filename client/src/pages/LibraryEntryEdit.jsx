import { useParams } from 'react-router-dom'
import useFetch from '../hooks/useFetch'

// Read-only in Phase 4. The editable form and PATCH/DELETE wiring are Phase 5 scope.
const LibraryEntryEdit = ({ apiUrl }) => {
  const { entryId } = useParams()
  const { data: entry, loading, error } = useFetch(`${apiUrl}/library/entry/${entryId}`)

  if (loading) return <p>Loading…</p>
  if (error) return <p className="error-message">{error}</p>

  return (
    <div className="collector-container media-detail">
      {entry.cover_image_url && <img src={entry.cover_image_url} alt={entry.title} />}
      <h2>{entry.title}</h2>
      {entry.creator && <h4>by {entry.creator}</h4>}
      <p>Status: {entry.status}</p>
      <p>Rating: {entry.rating != null ? entry.rating : 'Not rated'}</p>
      {entry.personal_notes && <p>Notes: {entry.personal_notes}</p>}
      {entry.date_acquired && <p>Acquired: {entry.date_acquired}</p>}
    </div>
  )
}

export default LibraryEntryEdit
