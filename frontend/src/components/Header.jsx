import React from 'react'
import { Link } from 'react-router-dom'
import Button from './componentLists/Button'

const Header = () => {
    return (
        <>
            <header className="text-gray-600 body-font bg-white shadow-md sticky top-0 z-20">
                <div className="w-[90%] mx-auto flex flex-wrap py-3 flex-col md:flex-row items-center">
                    <Link to='/' className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
                        <svg xmlns="#" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-10 h-10 text-white p-2 bg-indigo-500 rounded-full" viewBox="0 0 24 24">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                        </svg>
                        <span className="ml-3 text-xl">Fingin</span>
                    </Link>
                    <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center">
                        {/* <Link className="mr-5 hover:text-gray-900" to='/'>Home</Link> */}
                        <Link className="mr-5 hover:text-gray-900" to='/fundamentals'>Fundamentals</Link>
                        <Link className="mr-5 hover:text-gray-900" to='/sentimental'>Sentimental</Link>
                        {/* <a className="mr-5 hover:text-gray-900">Sentimental</a> */}
                        {/* <Link className="mr-5 hover:text-gray-900" to='/technical'>Technical</Link> */}
                        {/* <Link className="mr-5 hover:text-gray-900" to='/delivery'>Delivery</Link> */}
                        {/* <Link className="mr-5 hover:text-gray-900" to='/sectorial'>Sectorial</Link> */}
                        <Link className="mr-5 hover:text-gray-900" to='/daily-io'>Daily OI spurts</Link>
                        <Link className="mr-5 hover:text-gray-900" to='/video'>Video</Link>
                        <a className="mr-5 hover:text-gray-900">About Us</a>
                    </nav>
                    <Link to='/login'>
                        <Button children={"Login"} className={'inline-flex font-medium items-center bg-gray-100 border-0 py-1 px-3 focus:outline-none hover:bg-gray-200 rounded text-base mt-4 md:mt-0'} />
                    </Link>
                </div>
            </header>
        </>
    )
}

export default Header