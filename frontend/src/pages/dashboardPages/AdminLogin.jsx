import React, { useState } from 'react'
import Button from '../../components/componentLists/Button'
import { Link, useNavigate } from 'react-router-dom'
import * as AiIcons from "react-icons/ai";
import * as ImIcons from 'react-icons/im'
import loginImg from '../../assets/images/login-img.png'
import { bankingService } from '../../services/bankingService'
import { toast } from 'sonner';


const AdminLogin = () => {
    const [loginCredential, setLoginCredential] = useState({
        username: '',
        password: '',
    })
    const [registrationCredential, setRegistratinCredential] = useState({
        username: '',
        password: '',
        role: 'user',
        admin_pin: '',
    })
    const navigate = useNavigate();
    const [errorStatus, setErrorStatus] = useState(false);
    const [currentError, setCurrentError] = useState("");
    const [eye, setEye] = useState(false);
    const [redirectStatus, setRedirectStatus] = useState(false)
    const [signIn_UpStatus, setSignIn_UpStatus] = useState(false)


    const onChangeHandler = (e) => {
        const { name, value } = e.target
        setLoginCredential({ ...loginCredential, [name]: value })
        setErrorStatus(false);
    }
    const onChangeRegistrationHandler = (e) => {
        const { name, value } = e.target
        setRegistratinCredential({ ...registrationCredential, [name]: value })
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
            const { success, user } = serverResponse;
            if (serverResponse.success === true) {
                setRedirectStatus(true);
                setLoginCredential({
                    username: '', password: ''
                })
                window.localStorage.setItem('loginInfo', JSON.stringify({ ...serverResponse, isLoginStatus: true }))

                if (user.role === 'admin') {
                    setTimeout(() => {
                        setRedirectStatus(false);
                        navigate('/dashboard')
                    }, 1300);
                } else {
                    setTimeout(() => {
                        setRedirectStatus(false);
                        navigate('/user-dashboard')
                    }, 1300);
                }
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

    const registrationHandler = async () => {
        // const isValid = Object.values(loginCredential).every(value => value);

        const isValid = Object.values({
            username: registrationCredential.username,
            password: registrationCredential.password,
            role: registrationCredential.role,
            ...(registrationCredential.role === 'admin' && { admin_pin: registrationCredential.admin_pin })
        }).every(value => value);

        if (!isValid) {
            setErrorStatus(true);
            setCurrentError('Please fill in all fields.');
            return;
        }
        try {
            const serverResponse = await bankingService.postFormInfoToServer('create-auth', registrationCredential);
            const { success, message } = serverResponse;
            if (success === true) {
                toast.success(message);
                setRegistratinCredential({
                    username: '',
                    password: '',
                    role: 'user',
                    admin_pin: '',
                })
            } else {
                toast.error(message || 'Registration failed');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Something went wrong. Please try again.';
            toast.error(errorMsg);
        }
    }

    const switchingBiderectional = () => {
        setSignIn_UpStatus((signIn_UpStatus) => !signIn_UpStatus)
        setErrorStatus(false);
    }

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
                        <div className='flex flex-col justify-center items-center w-full'>
                            {signIn_UpStatus ?
                                <div className='w-full p-4'>
                                    <p className="font-semibold mb-2">Security authentication Admin </p>
                                    <p className="text-sm mb-2 text-red-600 text-left w-full font-semibold">
                                        Required *
                                    </p>
                                    <div className='w-full'>
                                        <form className='w-full space-y-3 mb-4'>
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
                                </div> :
                                <div className='w-full p-4'>
                                    <p className="font-semibold mb-2">Registration</p>
                                    <p className="text-sm mb-2 text-red-600 text-left w-full font-semibold">
                                        Required *
                                    </p>

                                    <div className='w-full'>
                                        <form className='w-full space-y-3 mb-4'>
                                            {/* Username Field */}
                                            <div>
                                                <input
                                                    onChange={onChangeRegistrationHandler}
                                                    value={registrationCredential.username}
                                                    name='username'
                                                    type="text"
                                                    id="username"
                                                    placeholder='Username*'
                                                    required
                                                />
                                            </div>

                                            {/* Password Field with Toggle */}
                                            <div className="relative">
                                                <input
                                                    onChange={onChangeRegistrationHandler}
                                                    value={registrationCredential.password}
                                                    type={eye ? "text" : "password"}
                                                    name='password'
                                                    id="password"
                                                    placeholder='Password*'
                                                    required
                                                />
                                                <span
                                                    onClick={hideShowPassword}
                                                    className="absolute top-2 cursor-pointer right-3 text-2xl"
                                                >
                                                    {eye ? <AiIcons.AiFillEye /> : <AiIcons.AiFillEyeInvisible />}
                                                </span>
                                            </div>

                                            {/* Role Selection */}
                                            <div>
                                                <select
                                                    name="role"
                                                    value={registrationCredential.role || 'user'}
                                                    onChange={onChangeRegistrationHandler}
                                                    className="w-full border px-3 py-2 rounded"
                                                >
                                                    <option value="user">Register as User</option>
                                                    <option value="admin">Register as Admin</option>
                                                </select>
                                            </div>
                                            {/* Admin PIN Field (Conditional) */}
                                            {registrationCredential.role === 'admin' && (
                                                <div>
                                                    <input
                                                        onChange={onChangeRegistrationHandler}
                                                        value={registrationCredential.admin_pin}
                                                        name='admin_pin'
                                                        type="password"
                                                        id="admin_pin"
                                                        placeholder='Enter Admin PIN*'
                                                        required
                                                    />
                                                </div>
                                            )}

                                            {errorStatus && (
                                                <span className="text-sm text-red-600 font-semibold">
                                                    {currentError}
                                                </span>
                                            )}

                                            <p className='text-sm flex justify-end items-end text-gray-400 hover:underline'>
                                                <Link className='my-2'>Forgot password?</Link>
                                            </p>
                                        </form>

                                        {/* Submit Button */}
                                        <Button
                                            onClick={registrationHandler}
                                            type='button'
                                            className={`button button_video w-full`}
                                        >
                                            Registration
                                        </Button>
                                    </div>
                                </div>

                            }
                            <div className='mt-4 text-center'>
                                <p className='font-normal'>Already have an account? <Link className='underline hover:no-underline underline-offset-2 text-blue-600'><span className='font-medium' onClick={switchingBiderectional}>{signIn_UpStatus ? 'Sign Up' : 'Sign In'}</span></Link></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminLogin