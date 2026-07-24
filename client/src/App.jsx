import React, { useState } from 'react'
import { useRoutes, Link } from 'react-router-dom'
import MyCollection from '../public/pages/Collection'
import Browse from '../public/pages/Browse'

import Header from './components/Header'
// import Profile from '../public/components/ProfileCard'
import './App.css'

const App = () => {

    const [users, setUsers] = useState([])
    const [profiles, setProfiles] = useState([])

    let element = useRoutes([
    {
        path: '/browse',
        element: <Browse data={profiles} />
    },
    {
        path: '/collection/:ID',
        element: <Collection data={profiles} />
    }/*,
    {
        path: '/profile/:ID/edit',
        element: <EditProfile data={profiles} />
    },
    {
        path: '/collection/:ID/edit',
        element: <EditCollection data={user} />
    }*/
    ])

    return (
        <div className='app'>
            <header className='main-header'>
                <Header />
            </header>
            {element}
        </div>
    )
}

export default App