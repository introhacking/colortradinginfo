import React, { useState, useEffect } from 'react';

const Footer = () => {
  const [currentYear, setCurrentYear] = useState(null)

  useEffect(() => {
    const year = new Date().getFullYear();
    setCurrentYear(year);
  }, []);

  return (
    <>
      <div className='text-white p-4 bg-gradient-to-l from-[#376683] to-[#3d6e8c]'>
        <div className='mx-auto flex gap-2 justify-center w-[85%]'>
          <div className='flex flex-col gap-2 w-1/4'>
            <div className='flex flex-col gap-1'>
              <svg xmlns="#" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-10 h-10 text-white p-2 bg-indigo-500 rounded-full" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
              {/* <p className='text-sm'>Registration No IN006541264</p> */}
            </div>
            {/* <p className='font-medium text-sm'>By connecting students all over the world to the best instructors, we helping individuals reach their goals and pursue their dreams.</p> */}
          </div>
          <div className='flex flex-col gap-2 w-1/4 pt-2'>
            <div className='flex flex-col gap-1'>
              <p className='uppercase font-semibold'>Quick links</p>
              <ul className='text-sm'>
                <li>About Us</li>
              </ul>
            </div>
          </div>
          <div className='flex flex-col gap-2 w-1/4 pt-2'>
            <div className='flex flex-col gap-1'>
              <p className='uppercase font-semibold'>More</p>
              <ul className='flex flex-col gap-1 text-sm'>
                <li>Terms Of Use</li>
                <li>Privcy Policy</li>
              </ul>
            </div>
          </div>
          <div className='flex flex-col gap-2 w-1/4 pt-2'>
            <div className='flex flex-col gap-1'>
              <p className='uppercase font-semibold'>Contact</p>
              <ul className='text-sm'>
                <li>About Us</li>
              </ul>
            </div>
          </div>
        </div>
        <div className='mt-2'>
          <p className='font-semibold text-center'>Fingin India has partnered with Tradingview for a Chartin solution</p>
        </div>
      </div>
      <div className='bg-[#3376a0] p-2 text-white text-center'>
        <p>Copyright © 2025 - {currentYear}  All Rights Reserved.</p>
      </div>
    </>
  );
};

export default Footer