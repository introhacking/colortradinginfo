import React from 'react'

const Button = ({ onClick, children, className , type , disabled }) => {
    return (
        <button onClick={onClick} className={className} disabled={disabled} type={type}>{children}</button>
    )
}

export default Button