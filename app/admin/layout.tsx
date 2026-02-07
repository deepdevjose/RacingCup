import React from 'react'
import './admin.css'

export const metadata = {
    title: 'Admin Portal | Racing Cup',
    description: 'Administrative control panel for Racing Cup TICs',
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="admin-layout">
            {children}
        </div>
    )
}
