import Button from '../../componentLists/Button';
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom';



const LogoutModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const navigate = useNavigate()
    const logoutHandler = async () => {
        try {
            window.localStorage.removeItem('loginInfo')
            onClose();
            navigate('/')

        } catch (err) {
            toast.error(err.message)
        }
    }

    return (

        <div className='p-4 absolute w-full inset-0 bg-black/80 z-50 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-full sm:w-3/5 md:w-1/2 lg:w-1/3 rounded mx-auto bg-white'>
                <div className='flex w-full items-center justify-between font-medium text-xl bg-red-400 rounded-t px-2 py-1'>
                    <p className='font-medium text-white '>Logout Confirmation</p>
                    <p onClick={onClose} className='cursor-pointer button_cancel button'>X</p>
                </div>
                <div className='p-2'>
                    <div className='bg-red-100 px-4 py-2 rounded'>
                        <p className='text-red-600 text-[14px] sm:text-[18px]  font-semibold'>Are you sure ? You want to Logout.</p>
                    </div>
                </div>
                <div className='flex justify-end items-center gap-2 p-2'>
                    <Button onClick={logoutHandler} className={'button button_ac'} type="button" children={'Logout'} />
                    {/* <Button onClick={onClose} className={'button button_cancel'} type="button" children={'Cancel'} /> */}
                </div>
            </div>
        </div>

    )
}

export default LogoutModal