"use client"

import React from "react"

import { Bot, Cpu, Zap, Rocket, Target, Shield, Flame, Star, Bolt, Settings, CircuitBoard, Microscope as Microchip, Plane, Hand, Crosshair, Radio, Cog, Circle, Eye, Battery } from "lucide-react"
import { type TEAM_ICONS } from "@/lib/firebase"

const iconMap: Record<typeof TEAM_ICONS[number], React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  robot: Bot,
  cpu: Cpu,
  zap: Zap,
  rocket: Rocket,
  target: Target,
  shield: Shield,
  flame: Flame,
  star: Star,
  bolt: Bolt,
  gear: Settings,
  circuit: CircuitBoard,
  chip: Microchip,
  drone: Plane,
  claw: Hand,
  laser: Crosshair,
  antenna: Radio,
  motor: Cog,
  wheel: Circle,
  sensor: Eye,
  battery: Battery,
}

interface TeamIconProps {
  icon: typeof TEAM_ICONS[number]
  color?: string
  size?: number
  className?: string
}

export function TeamIcon({ icon, color = "#fff", size = 24, className }: TeamIconProps) {
  const IconComponent = iconMap[icon] || Bot
  
  return (
    <IconComponent 
      className={className}
      style={{ 
        width: size, 
        height: size, 
        color 
      }} 
    />
  )
}
