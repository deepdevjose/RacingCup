export interface Event {
    id: string
    name: string
    date: string
    status: 'registro_abierto' | 'registro_cerrado' | 'en_progreso' | 'finalizado'
    description: string
}

export interface Team {
    id: string
    name: string
    members?: string[]
    seed?: number
    rank?: number
    points?: number
    wins?: number
    losses?: number
}

export interface Tab {
    id: string
    label: string
    icon: string
}
