import React from 'react'
// import Button from '../../componentLists/Button';

const Bank_Cell_Info = ({ isOpen, onClose, data }) => {
    if (!isOpen) return null;
    let convertToParse = JSON.parse(data)
    // if (convertToParse.bankName === 'management_name') return null;
    return (
        <div className='absolute inset-0 bg-black/80 z-20 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-3/5 mx-auto bg-white'>
                <div className='flex shadow-md w-full items-center justify-end font-medium text-xl mb-2 p-2'>
                    <p onClick={onClose} className='cursor-pointer button_cancel button'>X</p>
                </div>
                {/* <div className='text-center font-medium text-xl my-1 underline underline-offset-2'>
                    <p>manish</p>
                </div> */}
                <div className='h-[60vh] overflow-y-scroll no-scrollbar p-2'>
                    <form action="POST" className='space-y-2'>
                        <div className='gap-2'>
                            <div className='mt-2'>
                                <div dangerouslySetInnerHTML={{ __html: convertToParse }} />
                            </div>
                        </div>
                    </form>
                </div>
                {/* <button onClick={onClose} className='px-2 py-1 bg-red-600 rounded font-medium text-white mt-4' type="button">Cancel</button> */}
                {/* <Button onClick={onClose} className={'button button_cancel'} children={'Cancel'} type={'button'}/> */}
            </div>
        </div>
    )
}

export default Bank_Cell_Info