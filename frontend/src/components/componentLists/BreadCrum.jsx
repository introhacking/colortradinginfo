import React, { useState } from 'react'
import { useLocation } from 'react-router-dom';

const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

const BreadCrum = () => {
    const location = useLocation();
    let pathnames = location.pathname.split('/').filter(x => x)
    let breadcrumbPath = '';
    if (pathnames.length === 1) {
        breadcrumbPath = capitalize(pathnames[0]);
    } else if (pathnames.length > 1) {
        breadcrumbPath = pathnames.map((segment, index) => {
            return index === 0 ? capitalize(segment) : ` / ${capitalize(segment)}`;
        }).join('');
    }

    return (
        <div className='inline-block px-1 font-medium'>
            {breadcrumbPath}
        </div>
    )
}

export default BreadCrum