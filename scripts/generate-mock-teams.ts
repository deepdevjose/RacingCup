import { db } from "../lib/firebase";
import {
    collection,
    addDoc,
    serverTimestamp
} from "firebase/firestore";

const TEAMS_TO_CREATE = 32;
const EVENT_ID = "dNa2TptMBEaGHRRsGx5V";
const LEADER_ID = "I8m7rWktmiY8eP3QAEI9zEYGzWI2";

export async function generateMockTeams(eventId: string, count: number = 32) {
    const teamsRef = collection(db, "teams");

    for (let i = 1; i <= count; i++) {
        const teamData = {
            name: `MockTeam_${Math.floor(Math.random() * 1000)}`,
            eventId: eventId,
            leaderUserId: LEADER_ID,
            inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
            icon: "motor",
            color: "#CA8A04",
            createdAt: serverTimestamp(),
            isConfirmed: true,
            categories: [
                {
                    category: "Robo Fut",
                    prototypeName: `Bot ${i}`
                }
            ]
        };

        await addDoc(teamsRef, teamData);
        console.log(`Team created: ${teamData.name}`);
    }

    console.log("Mock teams generated correctamente.");
}
