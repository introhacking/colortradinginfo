import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from './componentLists/Button'
import { bankingService } from '../services/bankingService';

const Header = () => {
    const navigate = useNavigate();
    const isLogin = window.localStorage.getItem('loginInfo')
    const parseIslogin = isLogin && JSON.parse(isLogin);
    const user = parseIslogin?.user;
    const username = user?.username;
    const role = user?.role;

    const handleLogout = () => {
        window.localStorage.removeItem('loginInfo');
        navigate('/login');
    };
    const [top20Stocks, setTop20Stocks] = useState([]);


    const live20Data = async () => {
        try {
            const serverResponse = await bankingService.getInfoFromServer('/google-finanace-live-data')
            if (Array.isArray(serverResponse)) {
                setTop20Stocks(serverResponse.slice(0, 20));
            }
        } catch (err) {
            console.error('Live fetch error:', err);
        }
    }

    const displayText = top20Stocks
        .map(stock => `${stock.stockName} ₹${stock.currentMarketPrice} (${stock.volumePercent}%)`)
        .join('  |  ');

    useEffect(() => {
        live20Data()
        // Optional: auto-refresh every 60s
        const interval = setInterval(live20Data, 60000);
        return () => clearInterval(interval);
    }, [])


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
                        {role === 'user' && (
                            <>
                                <Link className="mr-5 hover:text-gray-900" to='/user-dashboard'>Dashboard</Link>
                                <Link className="mr-5 hover:text-gray-900" to='/fundamentals'>Fundamentals</Link>
                                <Link className="mr-5 hover:text-gray-900" to='/sentimental'>Sentimental</Link>
                                {/* <a className="mr-5 hover:text-gray-900">Sentimental</a> */}
                                {/* <Link className="mr-5 hover:text-gray-900" to='/technical'>Technical</Link> */}
                                {/* <Link className="mr-5 hover:text-gray-900" to='/delivery'>Delivery</Link> */}
                                {/* <Link className="mr-5 hover:text-gray-900" to='/sectorial'>Sectorial</Link> */}
                                <Link className="mr-5 hover:text-gray-900" to='/daily-spurts'>Daily Spurts</Link>
                                <Link className="mr-5 hover:text-gray-900" to='/live-data'>Live Data</Link>
                                <Link className="mr-5 hover:text-gray-900" to='/video'>Video</Link>
                            </>
                        )
                        }
                        <a className="mr-5 hover:text-gray-900">About Us</a>
                        <a className="mr-5 hover:text-gray-900 capitalize font-medium">{role === 'user' && username}</a>
                    </nav>
                    {role === 'user' ? (
                        <Button
                            onClick={handleLogout}
                            children={"Logout"}
                            className="inline-flex font-medium items-center bg-red-300 border-0 py-1 px-3 focus:outline-none hover:bg-red-400 rounded text-white mt-4 md:mt-0"
                        />
                    ) : (
                        <Link to='/login'>
                            <Button
                                children={"Login"}
                                className="inline-flex font-medium items-center bg-gray-100 border-0 py-1 px-3 focus:outline-none hover:bg-gray-200 rounded text-base mt-4 md:mt-0"
                            />
                        </Link>
                    )}
                </div>
            </header>
            <div className='sticky top-16 z-20' style={{ background: '#000', color: '#0f0', padding: '4px' }}>
                <marquee scrollamount="5">{displayText}</marquee>
            </div>
        </>
    )
}

export default Header