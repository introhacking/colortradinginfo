import { useEffect, useState } from "react"
import { Navigate, Outlet } from "react-router-dom"

const ProtectedRoutes = () => {
    const isLogin = window.localStorage.getItem('loginInfo')
    const parseIslogin = isLogin && JSON.parse(isLogin)?.isLoginStatus;
    return parseIslogin ? <Outlet /> : <Navigate to='/login' />
}
export default ProtectedRoutes
