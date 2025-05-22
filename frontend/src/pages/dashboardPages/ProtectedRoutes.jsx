import { useEffect, useState } from "react"
import { Navigate, Outlet } from "react-router-dom"

const ProtectedRoutes = () => {
    const isLogin = window.localStorage.getItem('loginInfo')
    const parseIslogin = isLogin && JSON.parse(isLogin);
    const ifAdmin = parseIslogin?.user?.role;
    return ifAdmin === 'admin' ? <Outlet /> : <Navigate to='/login' />
}
export default ProtectedRoutes
