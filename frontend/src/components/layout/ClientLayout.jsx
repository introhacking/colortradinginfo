import React from 'react'
import Header from '../Header'
import { Outlet } from 'react-router-dom'
import Footer from '../../pages/clientUI/home/Footer'

const ClientLayout = () => {
    return (
        <>
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </>
    )
}

export default ClientLayout