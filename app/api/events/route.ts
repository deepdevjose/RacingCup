import { NextRequest, NextResponse } from 'next/server'
import { getAllEvents } from '@/lib/firebase'

export async function GET() {
    try {
        const events = await getAllEvents()
        return NextResponse.json(events)
    } catch (error) {
        console.error('Error fetching events:', error)
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
    }
}