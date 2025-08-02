import React, { useState } from 'react'
import Button from '../../components/componentLists/Button'
import { Link, useNavigate } from 'react-router-dom'
import * as AiIcons from "react-icons/ai";
import * as ImIcons from 'react-icons/im'
import loginImg from '../../assets/images/login-img.png'
import { apiService } from '../../services/apiService'
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
    const [contactAdminMsg, setContactAdminMsg] = useState(false)


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
            const serverResponse = await apiService.postFormInfoToServer('login', loginCredential);
            const { success, user } = serverResponse;
            if (serverResponse.success === true) {
                setRedirectStatus(true);
                setLoginCredential({
                    username: '', password: ''
                })
                window.localStorage.setItem('loginInfo', JSON.stringify({ ...serverResponse, isLoginStatus: true }))

                setContactAdminMsg(false)

                // if (user.role === 'admin') {
                //     setTimeout(() => {
                //         setRedirectStatus(false);
                //         navigate('/dashboard')
                //     }, 1300);
                // } else {
                //     setTimeout(() => {
                //         setRedirectStatus(false);
                //         navigate('/user-dashboard')
                //     }, 1300);
                // }

                if (user.role === 'admin') {
                    setRedirectStatus(false)
                    navigate('/dashboard');
                } else if (user.allowedScreens.includes('user-dashboard')) {
                    setTimeout(() => {
                        setRedirectStatus(false);
                        navigate('/user-dashboard')
                    }, 1300);
                } else if (user.allowedScreens.length > 0) {
                    setRedirectStatus(false)
                    navigate(`/${user.allowedScreens[0]}`);
                } else if (user.role === 'user' && user.allowedScreens.length === 0) {
                    setTimeout(() => {
                        setRedirectStatus(false);
                        navigate('/default-page')
                    }, 1300);
                } else {
                    setRedirectStatus(false)
                    navigate('/unauthorized');
                }

            } else {
                setErrorStatus(true);
                setCurrentError('Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.log(err)

            if (err.status === 401) {
                setErrorStatus(true);
                setCurrentError('Invalid username or password.');
            } else if (err.status === 403) {
                setErrorStatus(true);
                setCurrentError(err.message || 'User not verified by admin');
            } else {
                setErrorStatus(true);
                setCurrentError(err.message);
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
            const serverResponse = await apiService.postFormInfoToServer('create-auth', registrationCredential);
            const { success, message } = serverResponse;
            if (success === true) {
                toast.success(message);
                setRegistratinCredential({
                    username: '',
                    password: '',
                    role: 'user',
                    admin_pin: '',
                })

                setContactAdminMsg(true)
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

        <div className='bg-gradient-to-t from-[#376683]/50 to-[#3d6e8c]/90 min-h-screen h-screen'>
            <div className='flex justify-center items-center h-full p-4 sm:p-0'>
                <div className='flex bg-white shadow-sm rounded px-4 py-5 sm:px-8 sm:py-10 w-full sm:w-2/3 mx-auto'>
                    <div className='hidden md:block overflow-y-auto space-y-4 w-1/2 py-2 px-3'>
                        <h2 className="font-bold">Welcome to FINGIN</h2>
                        <div className="p-2">
                            <img src={loginImg} className="w-full h-full" />
                        </div>
                    </div>
                    <div className='flex flex-1 w-full sm:w-1/2 p-1 sm:px-3 py-2 overflow-y-auto border border-slate-50'>
                        <div className='flex flex-col justify-center items-center w-full'>
                            {signIn_UpStatus ?
                                <div className='w-full p-0 sm:p-4'>
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
                                                <p className="text-sm text-red-600 font-semibold tracking-widest">
                                                    {currentError}
                                                </p>
                                            )}
                                            {contactAdminMsg && (
                                                <p className="text-[13px] py-1 px-2 rounded bg-green-100 text-green-600 font-bold tracking-widest">
                                                    Thanks for registering, please contact admin for activation.
                                                </p>
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
                                </div> :
                                <div className='w-full p-0 sm:p-4'>
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
                                </div>
                            }
                            <div className='mt-4 text-center'>
                                <p className='font-normal'>Already have an account? <Link className='underline hover:no-underline underline-offset-2 text-blue-600'><span className='font-medium' onClick={switchingBiderectional}>{signIn_UpStatus ? 'Sign In' : 'Sign Up'}</span></Link></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminLogin