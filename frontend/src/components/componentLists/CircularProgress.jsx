import React from 'react';

const CircularProgress = ({
    progress = 0,
    size = 100,
    strokeWidth = 50,
    circleColor = '#e5e7eb', // Tailwind's gray-200
    progressColor = '#16a34a', // Tailwind's green-600
    textColor = '#16a34a', // Tailwind's green-600
    textSize = '0.9rem',
    text
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <svg height={size} width={size}>
            <circle
                stroke={circleColor}
                fill="transparent"
                strokeWidth={strokeWidth}
                r={radius}
                cx={size / 2}
                cy={size / 2}
            />
            <circle
                stroke={progressColor}
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                r={radius}
                cx={size / 2}
                cy={size / 2}
            />
            <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dy=".3em"
                style={{ fill: textColor, fontSize: textSize, fontWeight: 'bold' }}
            >
                {progress}%
            </text>
        </svg>
    );
};

export default CircularProgress;
