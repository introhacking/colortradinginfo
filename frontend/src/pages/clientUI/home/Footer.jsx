import React, { useState, useEffect } from 'react';
import * as FaIcons from 'react-icons/fa'
import { Link } from 'react-router-dom'
import Button from '../../../components/componentLists/Button';


const Footer = () => {
  const [currentYear, setCurrentYear] = useState(null)

  useEffect(() => {
    const year = new Date().getFullYear();
    setCurrentYear(year);
  }, []);

  return (
    <>
      <div className='text-white p-4 bg-gradient-to-l from-[#376683] to-[#3d6e8c]'>
        <div className="w-full sm:w-[85%] mx-auto flex flex-wrap sm:flex-nowrap gap-4 justify-center py-6">
          {/* Section 1 */}
          <div className="flex flex-col gap-2 w-full sm:w-1/4 items-center">
            <svg xmlns="#" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-10 h-10 text-white p-2 bg-indigo-500 rounded-full" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            {/* <p className="text-sm">Registration No IN006541264</p> */}
          </div>

          {/* Section 2 */}
          <div className="flex flex-col gap-2 w-full sm:w-1/4 items-center">
            <p className="uppercase font-semibold">Quick links</p>
            <ul className="text-sm">
              <li>About Us</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="flex flex-col gap-2 w-full sm:w-1/4 items-center">
            <p className="uppercase font-semibold">More</p>
            <ul className="flex flex-col gap-1 text-sm">
              <li>Terms Of Use</li>
              <li>Privacy Policy</li>
            </ul>
          </div>

          {/* Section 4: Social Icons */}
          <div className="flex flex-col gap-2 w-full sm:w-1/4 items-center">
            <p className="uppercase font-semibold">Contact</p>
            <ul className="text-xl flex gap-3">
              <li>
                <a href="https://www.youtube.com/@appliedtradingacademy" target="_blank" rel="noopener noreferrer">
                  <Button
                    type="button"
                    className="p-1 rounded bg-gradient-to-r from-red-700 via-red-600 to-red-500"
                    children={<FaIcons.FaYoutube className="text-2xl" />}
                  />
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/appliedtrading/" target="_blank" rel="noopener noreferrer">
                  <Button
                    type="button"
                    className="p-1 rounded bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500"
                    children={<FaIcons.FaInstagramSquare className="text-2xl" />}
                  />
                </a>
              </li>
              <li>
                <a href="https://www.facebook.com/appliedtrading" target="_blank" rel="noopener noreferrer">
                  <Button
                    type="button"
                    className="p-1 rounded bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500"
                    children={<FaIcons.FaFacebookSquare className="text-2xl" />}
                  />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* <div className='mt-2'>
          <p className='font-semibold text-center'>Fingin India has partnered with Tradingview for a Chartin solution</p>
        </div> */}
      </div>
      <div className='bg-[#3376a0] p-2 text-white text-sm text-center'>
        <p>Copyright © 2025 - {currentYear}  All Rights Reserved.</p>
      </div>
    </>
  );
};

export default Footer