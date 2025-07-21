import React, { useState } from 'react'
// import bgGroundImage from '../../../assets/images/homeBanner.png'
import bgGroundImage from '../../../assets/images/home.jpg'
import Footer from './Footer'
const Home = () => {

    return (
        <>
            <div style={{ backgroundImage: `url(${bgGroundImage})` }} className='bg-[70%_30%] relative bg-no-repeat w-full h-[90vh] bg-cover'>
                {/* <div className='absolute bg-black/20 inset-0'>
                    <div className='relative h-full p-4'>
                        <div className='flex justify-between items-center gap-4 h-full'>
                            <div className='w-1/3 p-3 bg-white/50 rounded backdrop-blur-md'>
                                <p className=''>
                                    Invest
                                </p>
                            </div>
                            <div className='w-1/3 p-3 bg-white/50 rounded backdrop-blur-md'>
                                <p className=''>
                                    with
                                </p>
                            </div>
                            <div className='w-1/3 p-3 bg-white/50 rounded backdrop-blur-md'>
                                <p className=''>
                                    Abhi
                                </p>
                            </div>
                        </div>

                    </div>

                </div> */}
            </div>
            {/* <Footer/> */}
        </>
    )
}

export default Home