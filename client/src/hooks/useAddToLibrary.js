import { useState } from 'react'

// Shared by MediaCard and MediaDetail so "add to my collection" behaves
// identically everywhere: try without a collection_id first (the backend
// auto-creates a first collection if the user has none yet), and only ask
// the user to choose a collection when the backend says it's ambiguous.
function useAddToLibrary(apiUrl, mediaId) {
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [addError, setAddError] = useState(null)
  const [needsCollectionChoice, setNeedsCollectionChoice] = useState(false)

  const attemptAdd = async (collectionId = null) => {
    setAdding(true)
    setAddError(null)

    try {
      const res = await fetch(`${apiUrl}/library`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(collectionId ? { media_id: mediaId, collection_id: collectionId } : { media_id: mediaId }),
      })
      const body = await res.json()

      if (!res.ok) {
        if (body.code === 'COLLECTION_REQUIRED') {
          setNeedsCollectionChoice(true)
          return
        }
        throw new Error(body.error || 'Request failed.')
      }

      setAdded(true)
      setNeedsCollectionChoice(false)
    } catch (err) {
      setAddError(err.message)
    } finally {
      setAdding(false)
    }
  }

  return {
    adding,
    added,
    addError,
    needsCollectionChoice,
    attemptAdd,
    closeCollectionChoice: () => setNeedsCollectionChoice(false),
  }
}

export default useAddToLibrary
