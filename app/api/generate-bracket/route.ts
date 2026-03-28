import { NextRequest, NextResponse } from 'next/server'
import { createMatch, getAllTeams } from '@/lib/firebase'

export async function POST(request: NextRequest) {
    try {
        const { eventId, categoryId = "RC Car", bracketLevel = "Superior" } = await request.json()

        if (!eventId) {
            return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
        }

        console.log(`🔍 Generando bracket para evento ${eventId}, categoría ${categoryId}, nivel ${bracketLevel}`)

        // Get all teams and filter by event, category, and education level
        const allTeams = await getAllTeams()
        const teams = allTeams.filter(team =>
            team.eventId === eventId &&
            team.categories?.some((cat: any) => cat.category === categoryId) &&
            team.educationLevel === bracketLevel &&
            team.isConfirmed === true
        )

        if (teams.length < 2) {
            return NextResponse.json({
                error: `No hay suficientes equipos confirmados (${teams.length}) para generar bracket`
            }, { status: 400 })
        }

        console.log(`📋 Encontrados ${teams.length} equipos confirmados`)

        // Calculate bracket structure
        const numRounds = Math.ceil(Math.log2(teams.length))
        const totalMatches = teams.length - 1

        console.log(`🏆 Bracket de ${numRounds} rondas, ${totalMatches} partidos totales`)

        let matchNumber = 1
        const createdMatches = []

        // Generate first round matches (quarterfinals for 8 teams)
        const firstRoundMatches = Math.floor(teams.length / 2)

        for (let i = 0; i < firstRoundMatches; i++) {
            const match = await createMatch({
                eventId,
                categoryId,
                round: numRounds,
                matchNumber: matchNumber++,
                teamAId: teams[i * 2]?.id || '',
                teamBId: teams[i * 2 + 1]?.id || '',
                stage: 'bracket',
                status: 'pending',
                educationLevel: bracketLevel
            })
            createdMatches.push(match)
        }

        // Generate subsequent rounds (empty matches that will be filled by winners)
        for (let round = numRounds - 1; round >= 1; round--) {
            const matchesInRound = Math.pow(2, numRounds - round - 1)

            for (let i = 0; i < matchesInRound; i++) {
                const match = await createMatch({
                    eventId,
                    categoryId,
                    round,
                    matchNumber: matchNumber++,
                    teamAId: '',
                    teamBId: '',
                    stage: 'bracket',
                    status: 'pending',
                    educationLevel: bracketLevel
                })
                createdMatches.push(match)
            }
        }

        console.log(`✅ Bracket generado exitosamente con ${createdMatches.length} partidos`)

        return NextResponse.json({
            success: true,
            message: `Bracket generado para ${teams.length} equipos`,
            matches: createdMatches.length,
            rounds: numRounds,
            teams: teams.map(t => ({ id: t.id, name: t.name }))
        })

    } catch (error) {
        console.error('❌ Error generando bracket:', error)
        return NextResponse.json({
            error: 'Error interno del servidor',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}