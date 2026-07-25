import { useState } from 'react'
import useFetch from '../hooks/useFetch'
import MediaCard from '../components/MediaCard'
import AddMediaModal from '../components/AddMediaModal'

const Browse = ({ apiUrl, currentUserId }) => {
  const { data: media, loading, error, refetch } = useFetch(`${apiUrl}/media`)
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (loading) return <p>Loading…</p>
  if (error) return <p className="error-message">{error}</p>

  return (
    <div className="collector-container">
      <div className="page-heading">
        <h2>Browse</h2>
        {currentUserId != null && (
          <button type="button" className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            Add media
          </button>
        )}
      </div>

      <section className="media-row-container">
        <div className="media-row">
          {media.map((item) => (
            <MediaCard key={item.id} media={item} />
          ))}
        </div>
      </section>

      {currentUserId != null && isModalOpen && (
        <AddMediaModal
          apiUrl={apiUrl}
          onClose={() => setIsModalOpen(false)}
          onCreated={refetch}
        />
      )}
    </div>
  )
}

export default Browse
