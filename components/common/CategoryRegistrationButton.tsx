'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function CategoryRegistrationButton({ className = '' }: { className?: string }) {
    const { user } = useAuth()
    const router = useRouter()

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault()
        if (user) {
            router.push('/dashboard/eventos')
        } else {
            router.push('/login')
        }
    }

    return (
        <button
            onClick={handleClick}
            className={`btn btn-primary ${className}`}
        >
            Inscríbete Ahora
        </button>
    )
}
