import React, { useEffect, useState } from 'react'
import { apiService } from '../../../services/apiService.js'
import Button from '../../../components/componentLists/Button.jsx';
import { toast } from 'sonner'



// const UserDelete = ({ isOpen, onClose, isDeletingId }) => {
//     if (!isOpen) return null;
//     console.log(isDeletingId)
//     const { _id, username, deletingPath } = isDeletingId

//     const deleteTableRowsData = async () => {
//         try {
//             const serverResponse = await apiService.deletingById(`/${deletingPath}`, _id)
//             toast.success(serverResponse.data)
//             onClose();
//         } catch (err) {
//             toast.error('Something went wrong!')
//         }
//     }

//     return (

//         <div className='absolute inset-0 bg-black/80 z-20 backdrop-blur-sm flex justify-center items-center'>
//             <div className='w-2/5 rounded mx-auto bg-white'>
//                 <div className='flex w-full items-center justify-between font-medium text-xl bg-red-400 rounded-t px-2 py-1'>
//                     <p className='font-medium text-white '>Delete Confirmation Alert</p>
//                     <p onClick={onClose} className='cursor-pointer button_cancel button'>X</p>
//                 </div>
//                 <div className='p-2'>
//                     <div className='bg-red-100 px-4 py-2 rounded'>
//                         <p className='text-red-600'>Are you sure you want to delete this USER '<span className='font-medium'>{username}</span>'?</p>
//                     </div>
//                 </div>
//                 <div className='flex justify-end items-center gap-2 p-2'>
//                     <Button onClick={deleteTableRowsData} className={'button button_ac'} type="button" children={'Yes, Delete'} />
//                     <Button onClick={onClose} className={'button button_cancel'} type="button" children={'No, Keep it'} />
//                 </div>
//             </div>
//         </div>

//     )
// }


const UserDelete = ({ isOpen, onClose, isDeletingId, refresh }) => {

    if (!isOpen || !isDeletingId) return null;

    const [adminPin, setAdminPin] = useState('');
    const [isDeletingSelf, setIsDeletingSelf] = useState(false);
    const { _id, username, deletingPath } = isDeletingId || {};

    useEffect(() => {
        const loggedInUserId = JSON.parse(localStorage.getItem('loginInfo'))?.user?.id;
        if (_id && loggedInUserId) {
            setIsDeletingSelf(_id === loggedInUserId);
        }
    }, [_id]);

    const deleteTableRowsData = async () => {
        const loginInfo = JSON.parse(localStorage.getItem('loginInfo'));
        const loggedInUserId = loginInfo?.user?.id;

        const payload = { currentUserId: loggedInUserId };

        if (isDeletingSelf) {
            if (!adminPin.trim()) {
                toast.error("Admin PIN is required to delete your own account.");
                return;
            }
            payload.admin_pin = adminPin.trim();
        }

        try {
            const serverResponse = await apiService.deletingByIdByAdmin(`/${deletingPath}/${_id}`, payload);
            toast.success(serverResponse.message);

            // If user deleted self, logout and redirect to login
            if (isDeletingSelf) {
                localStorage.clear();
                window.location.href = '/login'; // or use react-router's `navigate('/login')`
            }

            onClose();
            refresh()
        } catch (err) {
            toast.error(err.message || 'Something went wrong!');
        }
    };

    return (
        <div className='absolute inset-0 bg-black/80 z-20 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-2/5 rounded mx-auto bg-white'>
                <div className='flex w-full items-center justify-between font-medium text-xl bg-red-400 rounded-t px-2 py-1'>
                    <p className='font-medium text-white'>Delete Confirmation Alert</p>
                    <p onClick={onClose} className='cursor-pointer button_cancel button'>X</p>
                </div>

                <div className='p-4 space-y-4'>
                    <div className='bg-red-100 px-4 py-2 rounded'>
                        <p className='text-red-600'>
                            Are you sure you want to delete this USER <span className='font-medium'>'{username}'</span>?
                        </p>
                    </div>

                    {isDeletingSelf && (
                        <div className='mt-2'>
                            <label htmlFor="adminPin" className='block mb-1 text-sm font-medium'>Enter Admin PIN</label>
                            <input
                                id="adminPin"
                                type="password"
                                value={adminPin}
                                onChange={(e) => setAdminPin(e.target.value)}
                                placeholder="Enter Admin PIN"
                                className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-400'
                            />
                        </div>
                    )}
                </div>

                <div className='flex justify-end items-center gap-2 p-4'>
                    <Button onClick={deleteTableRowsData} className='button button_ac' type="button">
                        Yes, Delete
                    </Button>
                    <Button onClick={onClose} className='button button_cancel' type="button">
                        No, Keep it
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UserDelete