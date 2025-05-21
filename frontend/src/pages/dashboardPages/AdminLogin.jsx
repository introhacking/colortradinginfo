import React, { useState } from 'react'
import Button from '../../components/componentLists/Button'
import { Link, useNavigate } from 'react-router-dom'
import * as AiIcons from "react-icons/ai";
import * as ImIcons from 'react-icons/im'
import loginImg from '../../assets/images/login-img.png'
import { bankingService } from '../../services/bankingService'


const AdminLogin = () => {
    const [loginCredential, setLoginCredential] = useState({
        username: '',
        password: ''
    })
    const navigate = useNavigate();
    const [errorStatus, setErrorStatus] = useState(false);
    const [currentError, setCurrentError] = useState("");
    const [eye, setEye] = useState(false);
    const [redirectStatus, setRedirectStatus] = useState(false)


    const onChangeHandler = (e) => {
        const { name, value } = e.target
        setLoginCredential({ ...loginCredential, [name]: value })
        setErrorStatus(false);
    }
    const hideShowPassword = () => {
        setEye(!eye);
    };
    const loginHandler = async () => {
        const isValid = Object.values(loginCredential).every(value => value);

        if (!isValid) {
            setErrorStatus(true);
            setCurrentError('Invalid credentials');
            return;
        }

        try {
            const serverResponse = await bankingService.postFormInfoToServer('login', loginCredential);
            // console.log(serverResponse);

            if (serverResponse.success === true) {
                setRedirectStatus(true);
                setLoginCredential({ username: '', password: '' })
                window.localStorage.setItem('loginInfo', JSON.stringify({...serverResponse, isLoginStatus: true }))
                setTimeout(() => {
                    setRedirectStatus(false);
                    navigate('/dashboard')
                }, 1300);
            } else {
                setErrorStatus(true);
                setCurrentError('Login failed. Please check your credentials.');
            }
        } catch (err) {
            if (err.response?.status === 401) {
                setErrorStatus(true);
                setCurrentError('Invalid username or password.');
            } else {
                setErrorStatus(true);
                setCurrentError('An unexpected error occurred. Please try again later.');
            }
        }
    };

    return (

        <div className='bg-slate-50 min-h-screen h-screen'>
            <div className='flex justify-center items-center h-full'>
                <div className='flex bg-white shadow-sm rounded px-8 py-10 w-2/3 mx-auto'>
                    <div className='overflow-y-auto space-y-4 w-1/2 py-2 px-3'>
                        <h2 className="font-bold">Welcome to FINGIN</h2>
                        <div className="p-2">
                            <img src={loginImg} className="w-full h-full" />
                        </div>
                    </div>
                    <div className='flex flex-1 w-1/2 px-3 py-2 overflow-y-auto border border-slate-50'>
                        <div className='flex justify-center items-center w-full'>
                            <div className='w-full p-4'>
                                <p className="font-semibold mb-2">Security authentication Admin </p>
                                <p className="text-sm mb-2 text-red-600 text-left w-full font-semibold">
                                    Required *
                                </p>
                                <div className='w-full'>
                                    <form className='w-full space-y-5 mb-4'>
                                        <div className="">
                                            <input onChange={onChangeHandler} value={loginCredential.username} name='username' type="text" id="username" placeholder='Username*' required />
                                        </div>
                                        <div className="relative">
                                            <input onChange={onChangeHandler} value={loginCredential.password} type={eye ? "text" : "password"} name='password' id="password" placeholder='Password*' required />
                                            <span
                                                onClick={() => hideShowPassword()}
                                                className="absolute top-2 cursor-pointer right-3 text-2xl"
                                            >
                                                {eye ? (
                                                    <AiIcons.AiFillEye />
                                                ) : (
                                                    <AiIcons.AiFillEyeInvisible />
                                                )}
                                            </span>
                                            {errorStatus && (
                                                <span className="text-sm text-red-600 font-semibold">
                                                    {currentError}
                                                </span>
                                            )}
                                            <p className='text-sm flex justify-end items-end text-gray-400 hover:underline'><Link className='my-2'>Forgot password?</Link></p>
                                        </div>
                                    </form>
                                    <Button disabled={redirectStatus} onClick={loginHandler} type={'button'} className={`${redirectStatus ? 'button cursor-not-allowed opacity-50' : ''} button button_video w-full`} >
                                        {redirectStatus ? (
                                            <div className="flex justify-center items-center">
                                                <ImIcons.ImSpinner9 className="mx-2 text-xl animate-spin" />
                                                Redirecting...
                                            </div>
                                        ) : (
                                            'Login'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminLogin