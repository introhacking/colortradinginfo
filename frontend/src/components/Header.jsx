import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from './componentLists/Button'
import { apiService } from '../services/apiService';
import BreadCrum from './componentLists/BreadCrum';

const Header = () => {
    const navigate = useNavigate();
    const isLogin = window.localStorage.getItem('loginInfo')
    const parseIslogin = isLogin && JSON.parse(isLogin);
    const user = parseIslogin?.user;
    const username = user?.username;
    const allowedScreens = user?.allowedScreens || [];
    const role = user?.role;

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


    const handleLogout = () => {
        window.localStorage.removeItem('loginInfo');
        navigate('/login');
    };
    const [top20Stocks, setTop20Stocks] = useState([]);


    // const live20Data = async () => {
    //     try {
    //         const serverResponse = await apiService.getInfoFromServer('/google-finanace-live-data?limit=20')
    //         setTop20Stocks(serverResponse)
    //         // if (Array.isArray(serverResponse)) {
    //         //     setTop20Stocks(serverResponse.slice(0, 20));
    //         // }
    //     } catch (err) {
    //         console.error('Live fetch error:', err);
    //     }
    // }


    const live20Data = async () => {
        try {
            const serverResponse = await apiService.getInfoFromServer('/google-finanace-live-data?limit=20');
            const stocks = serverResponse; // ✅ Extract the array

            if (Array.isArray(stocks)) {
                setTop20Stocks(stocks);
            } else {
                console.error("Expected array in serverResponse.data, got:", stocks);
                setTop20Stocks([]); // fallback
            }

        } catch (err) {
            console.error('Live fetch error:', err);
            setTop20Stocks([]); // fallback in error case
        }
    };


    // const displayText = top20Stocks
    //     .sort((a, b) => b.volumePercent - a.volumePercent) // 🔽 descending order
    //     .slice(0, 20).map(stock => {
    //         const isPositive = stock.regularMarketChange >= 0;
    //         const sign = isPositive ? '+' : '';
    //         const color = isPositive ? 'limegreen' : 'red';
    //         return (
    //             `<span>
    //   <strong>${stock.stockName}\u00A0</strong>\u00A0₹${stock.currentMarketPrice.toFixed(2)} 
    //   <span style="color:${color};">
    //      \u00A0${sign}${stock.regularMarketChange.toFixed(2)}\u00A0(${sign}${stock.regularMarketChangePercent}%)
    //   </span>
    // <span style="color:#ccc;">\u00A0|\u00A0 Vol: ${stock.volumePercent}%</span>

    // </span>`
    //         );
    //     }).join(' \u00A0\u00A0 | \u00A0\u00A0');


    const displayText = Array.isArray(top20Stocks)
        ? top20Stocks
            .sort((a, b) => b.volumePercent - a.volumePercent)
            .slice(0, 20)
            .map(stock => {
                const isPositive = stock.regularMarketChange >= 0;
                const sign = isPositive ? '+' : '';
                const color = isPositive ? 'limegreen' : 'red';
                return `
          <span>
            <strong>${stock.stockName}\u00A0</strong>\u00A0₹${stock.currentMarketPrice.toFixed(2)} 
            <span style="color:${color};">
              \u00A0${sign}${stock.regularMarketChange.toFixed(2)}\u00A0(${sign}${stock.regularMarketChangePercent}%)
            </span>
            <span style="color:#ccc;">\u00A0|\u00A0 Vol: ${stock.volumePercent}%</span>
          </span>
        `;
            })
            .join(' \u00A0\u00A0 | \u00A0\u00A0')
        : ''; // or fallback string


    const menuItems = [
        { label: 'Dashboard', path: '/user-dashboard', key: 'user-dashboard' },
        { label: 'Fundamentals', path: '/fundamentals', key: 'fundamentals' },
        { label: 'Sentimental', path: '/sentimental', key: 'sentimental' },
        { label: 'Technical', path: '/technical', key: 'technical' },
        { label: 'Delivery', path: '/delivery', key: 'delivery' },
        { label: 'Sectorial', path: '/sectorial', key: 'sectorial' },
        { label: 'Daily Spurts', path: '/daily-spurts', key: 'daily-spurts' },
        { label: 'Live Data', path: '/live-data', key: 'live-data' },
        { label: 'Research', path: '/research', key: 'research' },
        { label: 'Video', path: '/video', key: 'video' }
    ];


    useEffect(() => {
        live20Data()
        // Optional: auto-refresh every 60s
        const interval = setInterval(live20Data, 60000);
        return () => clearInterval(interval);
    }, [])


    return (
        <>


            <header className="text-gray-600 body-font bg-white shadow-md sticky top-0 z-20">
                <div className="w-[90%] mx-auto flex flex-wrap py-3 md:flex-col lg:flex-row items-center justify-between">
                    {/* Logo Section */}
                    <Link to='/' className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
                        <svg xmlns="#" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            className="w-10 h-10 text-white p-2 bg-indigo-500 rounded-full" viewBox="0 0 24 24">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                        </svg>
                        <span className="ml-3 text-xl">Fingin</span>
                    </Link>

                    <div className='flex justify-between'>
                        {/* Hamburger Button */}
                        <button
                            className="lg:hidden text-gray-700 focus:outline-none"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"
                                viewBox="0 0 24 24">
                                {mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>

                        {/* Desktop Menu */}
                        <nav className="hidden lg:flex flex-wrap items-center text-base">
                            {menuItems.map(item =>
                                allowedScreens.includes(item.key) && (
                                    <Link key={item.key} className="mr-5 hover:text-gray-900" to={item.path}>
                                        {item.label}
                                    </Link>
                                )
                            )}
                            <a className="mr-5 hover:text-gray-900">About Us</a>
                            <span className="mr-5 capitalize font-medium">{role === 'user' && username}</span>
                        </nav>
                        {/* Auth Buttons */}
                        <div className="hidden lg:block">
                            {role === 'user' ? (
                                <Button
                                    onClick={handleLogout}
                                    children="Logout"
                                    className="bg-red-300 border-0 py-1 px-3 hover:bg-red-400 rounded text-white"
                                />
                            ) : (
                                <Link to="/login">
                                    <Button
                                        children="Login"
                                        className="bg-gray-100 border-0 py-1 px-3 hover:bg-gray-200 rounded text-base"
                                    />
                                </Link>
                            )}
                        </div>
                    </div>

                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden px-6 text-center pb-4 flex flex-col gap-2">
                        {menuItems.map(item =>
                            allowedScreens.includes(item.key) && (
                                <Link key={item.key} className="text-gray-700 py-1" to={item.path} onClick={() => setMobileMenuOpen(false)}>
                                    {item.label}
                                </Link>
                            )
                        )}
                        <a className="text-gray-700 py-1">About Us</a>
                        <span className="capitalize font-medium text-gray-700">{role === 'user' && username}</span>
                        {role === 'user' ? (
                            <Button
                                onClick={() => {
                                    handleLogout();
                                    setMobileMenuOpen(false);
                                }}
                                children="Logout"
                                className="bg-red-300 border-0 py-1 px-3 hover:bg-red-400 rounded text-white mt-2"
                            />
                        ) : (
                            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                <Button
                                    children="Login"
                                    className="bg-gray-100 border-0 py-1 px-3 hover:bg-gray-200 rounded text-base mt-2"
                                />
                            </Link>
                        )}
                    </div>
                )}
            </header>

            {/* Breadcrumb */}
            {role && (
                <div className='py-1 px-6'>
                    <BreadCrum />
                </div>
            )}

            {/* Marquee Banner */}
            {displayText && (
                <div className='sticky top-16 z-20 bg-black text-green-500 px-4 py-1'>
                    <marquee scrollAmount="5" dangerouslySetInnerHTML={{ __html: displayText }} />
                </div>
            )}
        </>
    )
}

export default Header