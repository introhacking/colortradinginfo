import React, { useEffect, useState } from 'react'
import { BACKEND_URI, apiService } from '../../../services/apiService';

// const backendURL = import.meta.env.VITE_BACKEND_URI;


const VideoDelivery = () => {
    const [rowData, setRowData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [noDataFoundMsg, setNoDataFoundMsg] = useState('');

    const fetchData = async () => {
        setIsLoading(true);
        setError('');
        setNoDataFoundMsg('');
        try {
            const response = await apiService.getInfoFromServer(`/media/all`);
            if (response.length > 0) {
                setRowData(response)
            } else {
                setNoDataFoundMsg('Oops ! No data found');
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchData()
    }, [])
    return (
        <>
            <div className="w-[98%] mx-auto mt-6">
                <div className='flex items-start px-4 py-2'>
                    {isLoading ? (
                        <p className="text-gray-500 text-lg">Loading...</p>
                    ) : error ? (
                        <p className="text-red-500 text-lg">Error: {error}</p>
                    ) : noDataFoundMsg ? (
                        <p className='bg-gray-100 px-4 py-1 rounded text-center inline-block my-4'><span className='font-medium text-gray-400'>Message: {noDataFoundMsg}</span></p>
                    ) : (
                        <div className='flex flex-wrap gap-4 w-full'>
                            {rowData?.map((mediaItem, index) => (
                                <div key={index} className='w-full bg-white p-4 shadow rounded'>
                                    <h2 className='text-lg font-bold text-blue-700 uppercase mb-2'>
                                        {mediaItem.name}
                                    </h2>

                                    {mediaItem.modules?.map((module, mIdx) => (
                                        <div key={mIdx} className='mb-4'>
                                            <h3 className='text-md font-semibold text-purple-700'>
                                                Topic: {module.moduleName}
                                            </h3>

                                            {module.chapters?.map((chapter, cIdx) => (
                                                <div key={cIdx} className='pl-4 mb-2'>
                                                    <h4 className='text-sm font-semibold text-gray-700'>
                                                        Index: {chapter.chapterName}
                                                    </h4>

                                                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2'>
                                                        {chapter.videos?.map((video, vIdx) => (
                                                            <div key={vIdx} className='bg-gray-100 p-2 rounded'>
                                                                <video
                                                                    className='w-full max-h-[250px] rounded'
                                                                    src={`${BACKEND_URI}${video.url}`}
                                                                    controls
                                                                />
                                                                <p className='mt-1 text-sm text-center text-gray-800 font-medium'>
                                                                    {video.title}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {/* <div className="w-[98%] mx-auto mt-6">
                <div className='flex items-start px-4 py-2'>
                    {!isLoading && !error && !noDataFoundMsg && (
                        <div className='flex flex-wrap bg-gray-300 justify-between items-center gap-4 w-full'>
                            {rowData?.map((video) => {
                                return (
                                    <div className='p-2 w-[32%] h-1/3 bg-white' >
                                        <video
                                            className='w-full rounded'
                                            src={`${backendURL}${video.modules?.[0]?.chapters?.[0]?.videos?.[0]?.url}`}
                                            controls
                                            />
                                        <div className='uppercase bg-blue-100 text-blue-600 px-2 py-1 font-semibold'>
                                            {video.name}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div> */}
        </>
    )
}

{/* <video className='w-full rounded' src={`${backendURL}${video.videos[0]}`} controls /> */ }
export default VideoDelivery