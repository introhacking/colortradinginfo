import React, { useEffect, useState } from 'react'

const Client_Modal = ({ cellDataTransfer, setClientModalStatus }) => {
    const { row_column, imageUrl, paragraph, postTitle } = cellDataTransfer
    const [paragraphModified, setParagraphModified] = useState('')
    useEffect(() => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(paragraph, 'text/html');
        // const textContent = doc.body.textContent || "";
        // console.log(textContent)
        const styledText = doc.body.innerHTML;
        setParagraphModified(styledText);
        // setPlainText(textContent);

    }, [])

    // console.log(cellDataTransfer.paragraph)
    return (
        <div className='absolute inset-0 bg-black/60 z-20 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-3/5 mx-auto bg-white p-2'>
                <div className='flex w-full items-center justify-between font-medium text-xl mb-2'>
                    <p>Row & Column :  [{row_column}]</p>
                    <p onClick={() => setClientModalStatus(false)} className='cursor-pointer text-white bg-green-400 p-2'>X</p>
                </div>
                <div className='text-center font-medium text-xl my-1 underline underline-offset-2'>
                    <p>{postTitle}</p>
                </div>
                <div className='h-[50vh] overflow-y-auto'>
                    <form action="POST" className='space-y-2'>
                        <div className='gap-2'>
                            {/* <div className=''>
                                <div className='h-[240px] w-full p-2'>
                                    <img src={imageUrl} alt='img_url' className='h-full w-full bg-contain py-2' />
                                </div>
                            </div> */}
                            <div className='mt-2'>
                                {/* <h3 className='font-medium text-xl'>About Image</h3> */}
                                <p className='text-[16px] py-2 ' dangerouslySetInnerHTML={{ __html: paragraphModified }}/>
                                {/* <p className='text-[16px] py-2 ' dangerouslySetInnerHTML={{ __html: paragraphModified }}>{paragraphModified}</p> */}
                                {/* <textarea rows={3} cols={50} type="text" name='paragraph' value={paragraph} disabled /> */}
                                {/* <div dangerouslySetInnerHTML={{ __html: paragraphModified }} /> */}
                            </div>
                        </div>
                    </form>
                </div>
                <button onClick={() => setClientModalStatus(false)} className='px-2 py-1 bg-red-600 rounded font-medium text-white mt-4' type="button">Cancel</button>
            </div>
        </div>
    )
}

export default Client_Modal