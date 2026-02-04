"use client"

import React from "react"
import {
    User, Smile, Gamepad2, Ghost, Sword, Crown, Skull,
    Heart, Star, Zap, Shield, Flag, Bell, MapPin,
    Camera, Headphones, Music, Video, Mic, Monitor
} from "lucide-react"
import { type PLAYER_ICONS } from "@/lib/firebase"

const iconMap: Record<typeof PLAYER_ICONS[number], React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
    user: User,
    smile: Smile,
    gamepad: Gamepad2,
    ghost: Ghost,
    sword: Sword,
    crown: Crown,
    skull: Skull,
    heart: Heart,
    star: Star,
    zap: Zap,
    shield: Shield,
    flag: Flag,
    bell: Bell,
    "map-pin": MapPin,
    camera: Camera,
    headphones: Headphones,
    music: Music,
    video: Video,
    mic: Mic,
    monitor: Monitor,
}

interface PlayerIconProps {
    icon: typeof PLAYER_ICONS[number]
    size?: number
    className?: string
}

export function PlayerIcon({ icon, size = 24, className }: PlayerIconProps) {
    const IconComponent = iconMap[icon] || User

    return (
        <IconComponent
            className={className}
            style={{
                width: size,
                height: size,
            }}
        />
    )
}
