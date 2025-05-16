import React from 'react'
import Button from '../../components/componentLists/Button'
import { Link } from 'react-router-dom'

const AdminLogin = () => {
    return (

        <div className='bg-red-200 min-h-screen h-screen'>
            <div className='flex justify-center items-center h-full'>
                <div className='flex  border border-blue-600 p-4 w-3/4 mx-auto'>
                    <div className='w-1/2 border'>
                        left div
                    </div>
                    <div className='flex flex-1 w-1/2 border'>
                        right div
                    </div>
                </div>
            </div>
        </div>

        // <div className='h-screen p-4 bg-pink-900'>
        //     <div className='flex h-full  relative w-[85%] mx-auto shadow-2xl'>
        //         <div className='w-[40%] bg-[#8ddef4]/80'>
        //         </div>
        //         <div className='flex-1 bg-white'>
        //         </div>
        //         <div className='absolute z-20 px-20 flex justify-center items-center h-full'>
        //             <div className=' flex w-full shadow-2xl relative'>
        //                 <div className='flex w-full border-red-600 border'>
        //                     <div className='w-[38%] bg-white/30 p-4'>
        //                         Lorem ipsum, dolor sit amet consectetur adipisicing elit. Repellat, maxime. Accusantium, ab facere cum ad veritatis nulla earum debitis maiores impedit commodi aut. Cum dignissimos iusto exercitationem, dolore similique magnam quia id nemo dolorem? Dolorem iste porro inventore sit in sapiente laborum nihil expedita dolore similique magnam reiciendis, illo ex nam illum totam iusto exercitationem, architecto quidem, quae impedit fugit accusamus. Sint dignissimos, assumenda accusantium sint magni labore officiis. Veritatis dolorum repellendus possimus nihil facere cupiditate, aperiam maxime similique consequuntur.
        //                     </div>
        //                     <div className='flex-1 bg-white/30 p-4'>
        //                         <div className='flex justify-end p-2'><p className='text-sm'>Need help?</p></div>
        //                         <div className='py-6 px-16'>
        //                             <p className='text-xl font-bold text-center'>Login</p>
        //                             {/* <div className=''> */}
        //                                 {/* className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-teal-500" */}
        //                                 <div className='p-8 my-2'>
        //                                     <form className='w-full space-y-6 mb-4'>
        //                                         <div className="">
        //                                             {/* <label htmlFor="email" className="block text-gray-700">Email</label> */}
        //                                             <input type="email" id="email" placeholder='Email' required />
        //                                         </div>
        //                                         <div className="">
        //                                             {/* <label htmlFor="email" className="block text-gray-700">Email</label> */}
        //                                             <input type="password" id="password" placeholder='Password' required />
        //                                             <p className='text-sm flex justify-end items-end text-gray-400 hover:underline'><Link className='my-2'>Forgot password?</Link></p>
        //                                         </div>
        //                                     </form>
        //                                     <Button type={'button'} children={'Login'} className={'button button_ac w-full'} />
        //                                 </div>
        //                             {/* </div> */}
        //                         </div>
        //                     </div>
        //                 </div>
        //             </div>
        //         </div>
        //     </div>
        // </div>
    )
}

export default AdminLogin