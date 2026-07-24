import useFetch from '../hooks/useFetch'
import MediaCard from '../components/MediaCard'

const Browse = ({ apiUrl }) => {
  const { data: media, loading, error } = useFetch(`${apiUrl}/media`)

  if (loading) return <p>Loading…</p>
  if (error) return <p className="error-message">{error}</p>

  return (
    <div className="collector-container">
      <section className="media-row-container">
        <div className="media-row">
          {media.map((item) => (
            <MediaCard key={item.id} media={item} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default Browse
