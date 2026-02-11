"use client"

import React from 'react'
import { TEAM_ICONS } from '@/lib/firebase'

interface TeamIconProps {
    icon: typeof TEAM_ICONS[number] | string
    color?: string
    size?: number | string
    className?: string
}

const ICON_PATHS: Record<string, string> = {
    robot: "M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 12 2z",
    cpu: "M18 4h-2V2h-2v2h-4V2H8v2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM9 18H6v-3h3v3zm0-5H6v-3h3v3zm0-5H6V6h3v2zm5 10h-3v-3h3v3zm0-5h-3v-3h3v3zm0-5h-3V6h3v2zm4 10h-3v-3h3v3zm0-5h-3v-3h3v3zm0-5h-3V6h3v2z",
    bolt: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    rocket: "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z",
    target: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    flame: "M12 22c4-2 8-6 8-12 0-2-2-4-4-4s-4 2-4 4c0-4-4-8-8-8 0 8 4 14 8 20z",
    star: "M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z",
    zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z", // Reuse bolt if zap not distinct
    gear: "M12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z",
    circuit: "M2 12h5l2 8 4-16 2 8h5", // Pulse/Circuit simplified
    chip: "M18 4h-2V2h-2v2h-4V2H8v2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6z",
    drone: "M12 12m-3 0a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0 M2 12l4 0 M18 12l4 0 M12 2l0 4 M12 18l0 4",
    claw: "M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v0M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2",
    laser: "M3 12h18 M3 6h7 M14 6h7 M3 18h7 M14 18h7",
    antenna: "M12 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 8v14M5 12H2a10 10 0 0 0 20 0h-3",
    motor: "M12 12m-9 0a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0 M12 12m-3 0a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0",
    wheel: "M12 12m-9 0a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0 M12 3v18 M3 12h18 M5.6 5.6l12.8 12.8 M5.6 18.4l12.8-12.8",
    sensor: "M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0 M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49",
    battery: "M6 7h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z M21 11v2" // Simplified battery
}

// Fallback path
const FALLBACK_PATH = "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"

export function TeamIcon({ icon, color = 'currentColor', size = 24, className = "" }: TeamIconProps) {
    const path = ICON_PATHS[icon] || FALLBACK_PATH

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d={path} />
        </svg>
    )
}
