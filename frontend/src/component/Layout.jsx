import React from 'react'
import { useState } from 'react'
import { styles } from '../assets/dummyStyles.js'
import Navbar from './Navbar'
import Sidebar from './Sidebar'


const Layout = ({ onLogout, user }) => {
    const [isCollapsed, setIsCollapsed] = useState(false)
    return (
        <div className={styles.layout.root}>
            <Navbar user={user} onLogout={onLogout} />
            <Sidebar user={user} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        </div>
    )
}

export default Layout