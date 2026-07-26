import { useRoutes } from 'react-router-dom'
import './App.css'

import Header from './components/Header'
import Browse from './pages/Browse'
import MediaDetail from './pages/MediaDetail'
import Collections from './pages/Collections'
import UserCollection from './pages/UserCollection'
import LibraryEntryEdit from './pages/LibraryEntryEdit'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import useCurrentUser from './hooks/useCurrentUser'

const SERVER_URL = 'http://localhost:3001'
const API_URL = `${SERVER_URL}/api`
const AUTH_URL = `${SERVER_URL}/auth`

function App() {
  const { user, loading: userLoading, refetch: refetchUser } = useCurrentUser(AUTH_URL)
  const currentUserId = user?.id ?? null

  const routeElement = useRoutes([
    { path: '/', element: <Browse apiUrl={API_URL} currentUserId={currentUserId} /> },
    { path: '/media/:id', element: <MediaDetail apiUrl={API_URL} /> },
    { path: '/collections', element: <Collections apiUrl={API_URL} /> },
    { path: '/collections/:userId', element: <UserCollection apiUrl={API_URL} currentUserId={currentUserId} /> },
    {
      path: '/library/:entryId/edit',
      element: <LibraryEntryEdit apiUrl={API_URL} currentUserId={currentUserId} currentUserLoading={userLoading} />,
    },
    { path: '/login', element: <Login authUrl={AUTH_URL} /> },
    { path: '*', element: <NotFound /> },
  ])

  return (
    <div className="page-container">
      <Header authUrl={AUTH_URL} user={userLoading ? null : user} onLogout={refetchUser} />
      {routeElement}
    </div>
  )
}

export default App
