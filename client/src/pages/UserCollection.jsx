import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import useFetch from '../hooks/useFetch'
import MediaCard from '../components/MediaCard'
import TagManagerModal from '../components/TagManagerModal'

const MEDIA_TYPES = ['book', 'movie', 'music', 'podcast', 'video', 'magazine', 'audiobook']
const STATUSES = ['planned', 'in_progress', 'completed', 'archived']

const UserCollection = ({ apiUrl }) => {
  const { userId } = useParams()
  const { data: user, loading: userLoading, error: userError } = useFetch(`${apiUrl}/users/${userId}`)
  const {
    data: entries,
    loading: entriesLoading,
    error: entriesError,
    refetch: refetchEntries,
  } = useFetch(`${apiUrl}/library/${userId}`)
  const { data: tags, loading: tagsLoading, error: tagsError, refetch: refetchTags } = useFetch(
    `${apiUrl}/tags/${userId}`
  )

  const [tagFilter, setTagFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('title')
  const [isManagingTags, setIsManagingTags] = useState(false)

  const visibleEntries = useMemo(() => {
    if (!entries) return []

    let result = entries
    if (tagFilter) {
      result = result.filter((entry) => entry.tags.some((tag) => tag.id === Number(tagFilter)))
    }
    if (typeFilter) {
      result = result.filter((entry) => entry.media_type === typeFilter)
    }
    if (statusFilter) {
      result = result.filter((entry) => entry.status === statusFilter)
    }

    result = [...result].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      if (sortBy === 'date') return new Date(b.created_at) - new Date(a.created_at)
      if (sortBy === 'rating') return (b.rating ?? -1) - (a.rating ?? -1)
      return 0
    })

    return result
  }, [entries, tagFilter, typeFilter, statusFilter, sortBy])

  if (userLoading || entriesLoading || tagsLoading) return <p>Loading…</p>
  if (userError) return <p className="error-message">{userError}</p>
  if (entriesError) return <p className="error-message">{entriesError}</p>
  if (tagsError) return <p className="error-message">{tagsError}</p>

  const handleTagManagerChange = () => {
    refetchTags()
    refetchEntries()
  }

  return (
    <div className="collector-container">
      <section className="user-profile">
        <div className="profile-picture">
          {user.avatarurl && <img src={user.avatarurl} alt={user.username} />}
        </div>
        <div className="profile-text">
          <h3>{user.display_name || user.username}</h3>
          {user.favorite_genres && <h5>Enjoys: {user.favorite_genres}</h5>}
          {user.bio && <p>{user.bio}</p>}
          <p>{user.library_entry_count} items in library</p>
        </div>
      </section>

      <div className="page-heading">
        <h2>Collection</h2>
        <button type="button" className="btn btn-secondary" onClick={() => setIsManagingTags(true)}>
          Manage tags
        </button>
      </div>

      <div className="filter-bar">
        <div className="field">
          <label htmlFor="filter-tag">Tag</label>
          <select id="filter-tag" value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
            <option value="">All tags</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>

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
          <label htmlFor="filter-status">Status</label>
          <select id="filter-status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="sort-by">Sort by</label>
          <select id="sort-by" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="title">Title (A–Z)</option>
            <option value="date">Date added (newest first)</option>
            <option value="rating">Rating (highest first)</option>
          </select>
        </div>
      </div>

      <section className="media-row-container">
        <div className="media-row">
          {visibleEntries.map((entry) => (
            <MediaCard key={entry.id} media={entry} editHref={`/library/${entry.id}/edit`} />
          ))}
        </div>
      </section>

      {isManagingTags && (
        <TagManagerModal
          apiUrl={apiUrl}
          userId={userId}
          tags={tags}
          onClose={() => setIsManagingTags(false)}
          onChange={handleTagManagerChange}
        />
      )}
    </div>
  )
}

export default UserCollection
