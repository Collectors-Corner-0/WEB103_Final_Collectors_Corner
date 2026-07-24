import { useRoutes } from 'react-router-dom'
import './App.css'

import Header from './components/Header'
import Browse from './pages/Browse'
import MediaDetail from './pages/MediaDetail'
import Collections from './pages/Collections'
import UserCollection from './pages/UserCollection'
import LibraryEntryEdit from './pages/LibraryEntryEdit'
import NotFound from './pages/NotFound'

const API_URL = 'http://localhost:3001/api'
const currentUserId = 1 // TODO(Phase 7): replace with the authenticated session user

function App() {
  const routeElement = useRoutes([
    { path: '/', element: <Browse apiUrl={API_URL} /> },
    { path: '/media/:id', element: <MediaDetail apiUrl={API_URL} /> },
    { path: '/collections', element: <Collections apiUrl={API_URL} /> },
    { path: '/collections/:userId', element: <UserCollection apiUrl={API_URL} /> },
    { path: '/library/:entryId/edit', element: <LibraryEntryEdit apiUrl={API_URL} /> },
    { path: '*', element: <NotFound /> },
  ])

  return (
    <div className="page-container">
      <Header currentUserId={currentUserId} />
      {routeElement}
    </div>
  )
}

export default App
