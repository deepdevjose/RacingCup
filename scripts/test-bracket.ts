
import { generateBracket } from '../lib/bracket-utils';
import { Team } from '../lib/firebase';

// Mock Team
function createMockTeam(id: string, seed: number): Team {
    return {
        id,
        eventId: "test-event",
        name: `Team ${id}`,
        leaderUserId: "user1",
        icon: "robot",
        color: "#000",
        inviteCode: "ABC",
        isConfirmed: true,
        seed,
        createdAt: new Date()
    } as Team;
}

// Create 8 teams
const teams: Team[] = [];
for (let i = 1; i <= 8; i++) {
    teams.push(createMockTeam(`t${i}`, i));
}

console.log("--- Generating Bracket for 8 Teams (Seeded) ---");
const result = generateBracket("test-event", "cat-1", teams, "seeded");

console.log(`Total Matches Generated: ${result.matches.length}`);
result.matches.forEach(m => {
    console.log(`[Round ${m.round}] Match #${m.matchNumber}: ${m.teamAId || 'TBD'} vs ${m.teamBId || 'TBD'}`);
});

// Check specific pairings for 8 teams
// Match 1: 1 vs 8 (t1 vs t8)
// Match 2: 4 vs 5 (t4 vs t5)
// Match 3: 2 vs 7 (t2 vs t7)
// Match 4: 3 vs 6 (t3 vs t6)

// Matches are pushed in order of rounds?
// The logic in utils pushes Round 1, then Round 2...
// Let's verify output.
