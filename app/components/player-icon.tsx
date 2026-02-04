"use client"

import React from "react"
import { 
  User, Smile, Gamepad2, Headphones, Glasses,
  Crown, Medal, Zap, Diamond, Heart,
  Flame, Sword, Compass, Music, Camera,
  Puzzle, Flag, Globe, Mountain, Waves
} from "lucide-react"
import { type PLAYER_ICONS } from "@/lib/firebase"

const iconMap: Record<typeof PLAYER_ICONS[number], React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  user: User,
  smile: Smile,
  gamepad: Gamepad2,
  headphones: Headphones,
  glasses: Glasses,
  crown: Crown,
  medal: Medal,
  lightning: Zap,
  diamond: Diamond,
  heart: Heart,
  fire: Flame,
  sword: Sword,
  compass: Compass,
  music: Music,
  camera: Camera,
  puzzle: Puzzle,
  flag: Flag,
  globe: Globe,
  mountain: Mountain,
  wave: Waves,
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
