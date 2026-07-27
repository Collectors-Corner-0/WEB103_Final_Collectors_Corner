import { useMemo, useState } from 'react'
import useFetch from '../hooks/useFetch'
import MediaCard from '../components/MediaCard'
import AddMediaModal from '../components/AddMediaModal'

const MEDIA_TYPES = ['book', 'movie', 'music', 'podcast', 'video', 'magazine', 'audiobook']

const Browse = ({ apiUrl, currentUserId }) => {
  const { data: media, loading, error, refetch } = useFetch(`${apiUrl}/media`)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState('')
  const [sortBy, setSortBy] = useState('title')

  const visibleMedia = useMemo(() => {
    if (!media) return []

    let result = media
    if (typeFilter) {
      result = result.filter((item) => item.media_type === typeFilter)
    }

    result = [...result].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      if (sortBy === 'date') return new Date(b.created_at) - new Date(a.created_at)
      return 0
    })

    return result
  }, [media, typeFilter, sortBy])

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

      <div className="filter-bar">
        <div className="field">
          <label htmlFor="filter-type">Media type</label>
          <select id="filter-type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All types</option>
            {MEDIA_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="sort-by">Sort by</label>
          <select id="sort-by" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="title">Title (A–Z)</option>
            <option value="date">Date added (newest first)</option>
          </select>
        </div>
      </div>

      <section className="media-row-container">
        <div className="media-row">
          {visibleMedia.map((item) => (
            <MediaCard key={item.id} media={item} apiUrl={apiUrl} canAddToLibrary={currentUserId != null} />
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
