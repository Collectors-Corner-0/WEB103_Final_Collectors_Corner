import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import useFetch from '../hooks/useFetch'
import MediaCard from '../components/MediaCard'
import TagManagerModal from '../components/TagManagerModal'
import EditCollectionModal from '../components/EditCollectionModal'
import Spinner from '../components/Spinner'

const MEDIA_TYPES = ['book', 'movie', 'music', 'podcast', 'video', 'magazine', 'audiobook']
const STATUSES = ['planned', 'in_progress', 'completed', 'archived']

const UserCollection = ({ apiUrl, currentUserId }) => {
  const { userId, collectionId } = useParams()
  const isOwnCollection = currentUserId != null && Number(userId) === currentUserId
  const { data: user, loading: userLoading, error: userError } = useFetch(`${apiUrl}/users/${userId}`)
  const {
    data: entries,
    loading: entriesLoading,
    error: entriesError,
    refetch: refetchEntries,
  } = useFetch(`${apiUrl}/library/collection/${collectionId}`)
  const { data: tags, loading: tagsLoading, error: tagsError, refetch: refetchTags } = useFetch(
    `${apiUrl}/tags/${userId}`
  )
  const {
    data: collections,
    loading: collectionsLoading,
    error: collectionsError,
    refetch: refetchCollections,
  } = useFetch(`${apiUrl}/collections/${userId}`)
  const collection = collections?.find((c) => c.id === Number(collectionId))

  const [tagFilter, setTagFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('title')
  const [isManagingTags, setIsManagingTags] = useState(false)
  const [isEditingCollection, setIsEditingCollection] = useState(false)

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

  if (userLoading || entriesLoading || tagsLoading || collectionsLoading) return <Spinner />
  if (userError) return <p className="error-message">{userError}</p>
  if (entriesError) return <p className="error-message">{entriesError}</p>
  if (tagsError) return <p className="error-message">{tagsError}</p>
  if (collectionsError) return <p className="error-message">{collectionsError}</p>

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

      <Link to={`/collections/${userId}`}>← All of {user.username}'s collections</Link>

      <div className="page-heading">
        <div className="collection-heading">
          {collection?.avatar_url && (
            <img src={collection.avatar_url} alt={collection.name} className="collection-heading-avatar" />
          )}
          <h2>{collection?.name || 'Collection'}</h2>
        </div>
        {isOwnCollection && (
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditingCollection(true)}>
              Edit collection
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setIsManagingTags(true)}>
              Manage tags
            </button>
          </div>
        )}
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
            <MediaCard
              key={entry.id}
              media={entry}
              editHref={isOwnCollection ? `/library/${entry.id}/edit` : undefined}
            />
          ))}
        </div>
      </section>

      {isOwnCollection && isManagingTags && (
        <TagManagerModal
          apiUrl={apiUrl}
          tags={tags}
          onClose={() => setIsManagingTags(false)}
          onChange={handleTagManagerChange}
        />
      )}

      {isOwnCollection && isEditingCollection && collection && (
        <EditCollectionModal
          apiUrl={apiUrl}
          collection={collection}
          onClose={() => setIsEditingCollection(false)}
          onSaved={refetchCollections}
        />
      )}
    </div>
  )
}

export default UserCollection
