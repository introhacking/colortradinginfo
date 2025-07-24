// import { Navigate, Outlet } from "react-router-dom"

// const ProtectedRoutes = () => {
//     const isLogin = window.localStorage.getItem('loginInfo')
//     const parseIslogin = isLogin && JSON.parse(isLogin);
//     const ifAdmin = parseIslogin?.user?.role;
//     return ifAdmin === 'admin' ? <Outlet /> : <Navigate to='/login' />
// }
// export default ProtectedRoutes



import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoutes = ({ requiredScreen }) => {
    const isLogin = window.localStorage.getItem('loginInfo');
    const user = isLogin && JSON.parse(isLogin)?.user;
    const allowedScreens = user?.allowedScreens || [];
    
    if (!user) return <Navigate to="/login" />;

    if (user.role === 'admin' || allowedScreens.includes(requiredScreen)) {
        return <Outlet />;
    }

    return <Navigate to="/unauthorized" />;
};

export default ProtectedRoutes
