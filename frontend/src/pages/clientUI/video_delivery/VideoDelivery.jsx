import React, { useEffect, useState } from 'react'
import { bankingService } from '../../../services/bankingService';

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
            const response = await bankingService.getInfoFromServer(`/media/all`);
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
                    {!isLoading && !error && !noDataFoundMsg && (
                        <div className='flex flex-wrap bg-gray-300 justify-between items-center gap-4 w-full'>
                            {rowData?.map((video) => {
                                return (
                                    <div className='p-2 w-[32%] h-1/3 bg-white' >
                                        <video className='w-full rounded' src={`http://localhost:4500${video.videos[0]}`} controls />
                                        <div className='uppercase bg-blue-100 text-blue-600 px-2 py-1 font-semibold'>
                                            {video.name}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default VideoDelivery