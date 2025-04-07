import React from 'react'

const VideoUpload_videoPlayer = ({ isOpen, onClose, isParamsData }) => {

    if (!isOpen) return null;
    return (
        <div className='absolute inset-0 bg-black/80 z-20 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-3/5 mx-auto bg-white'>
                <div className='flex w-full items-center justify-between font-medium text-xl mb-2 p-2'>
                    <p className='text-xl uppercase'>{isParamsData.name}</p>
                    <p onClick={onClose} className='cursor-pointer button_cancel button'>X</p>
                </div>
                <div className='p-2'>
                    {isParamsData?.videos?.length > 0 ? (
                        <video
                            className="w-full rounded"
                            src={`http://localhost:4500${isParamsData.videos[0]}`}
                            controls
                            autoPlay={true}
                        />
                    ) : (
                        <p className="text-center">No video available</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default VideoUpload_videoPlayer