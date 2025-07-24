import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiService } from '../../../services/apiService';
import { toast } from 'sonner';

const screenOptions = ['dashboard', 'fundamentals', 'sentimental', 'daily-spurts', 'live-data', 'research', 'video',];

const UserPermissionAccessPanelModal = ({ isOpen, userInfo, onClose, refresh }) => {
    const [allowedScreens, setAllowedScreens] = useState([]);

    useEffect(() => {
        if (userInfo?.allowedScreens) {
            setAllowedScreens(userInfo.allowedScreens);
        } else {
            setAllowedScreens([]); // default fallback
        }
    }, [userInfo]);

    if (!isOpen) return null;

    const handleToggle = async (screen) => {
        const updatedScreens = allowedScreens.includes(screen)
            ? allowedScreens.filter(s => s !== screen)
            : [...allowedScreens, screen];

        setAllowedScreens(updatedScreens);

        try {

            const serverResponse = await apiService.updatingById('/user/screens', userInfo._id, { allowedScreens: updatedScreens })
            toast.success(serverResponse.message)
            if (refresh) refresh(); // refresh parent list if passed

        } catch (err) {
            console.error("Failed to update permissions", err);
            alert("Failed to update permissions");
        }
    };

    const { username } = userInfo;

    return (
        <div className='absolute inset-0 bg-black/80 z-20 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-3/4 rounded mx-auto bg-white p-4'>
                {/* Header */}
                <div className='flex w-full items-center justify-between font-medium text-xl bg-sky-400 rounded-t px-2 py-1'>
                    <p className='font-medium text-white'>
                        User Screen Allow Permission
                        <span className='bg-sky-200 text-blue-700 p-1 rounded font-semibold ml-2'>
                            {username?.toUpperCase()}
                        </span>
                    </p>
                    <p onClick={onClose} className='cursor-pointer button_cancel button text-white font-bold'>X</p>
                </div>

                {/* Toggles */}
                <div className='p-4'>
                    <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {screenOptions.map(screen => (
                            <label key={screen} className="relative flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={allowedScreens.includes(screen)}
                                    onChange={() => handleToggle(screen)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors duration-300"></div>
                                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transform peer-checked:translate-x-full transition-transform duration-300"></div>
                                <span className="capitalize text-gray-800">{screen}</span>
                            </label>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default UserPermissionAccessPanelModal;
