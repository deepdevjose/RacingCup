
import {
    getUserNotifications,
    createNotification,
    deleteNotification,
    createTeam,
    deleteTeam,
    addTeamMember,
    createEvent,
    deleteEvent
} from '../lib/firebase';

const TEST_USER_ID = "test-user-dlvy";
// Note: In a real integration test we'd need a real user doc/profile potentially, 
// but getUserNotifications mainly checks 'team_members' collection and 'notifications' collection.
// We need to ensure we simulate the DB state correctly.

async function runTest() {
    console.log("Starting notification DELIVERY test...");

    let eventId = "";
    let teamId = "";
    let notifId = "";

    try {
        // 1. Create a dummy event
        console.log("1. Creating dummy event...");
        eventId = await createEvent({
            name: "Test Event One",
            description: "Test Desc",
            date: new Date(),
            location: "Virtual",
            format: "virtual",
            status: "registro_abierto",
            maxTeamSize: 5,
            minTeamSize: 1,
            categories: ["TestCat"],
        });
        console.log(`Event created: ${eventId}`);

        // 2. Create a team in that event (bypass normal flow to self-assign leader)
        // Actually createTeam assigns leader. 
        // We'll use a mocked flow or just direct DB inserts if possible, but let's use the functions.
        // createTeam checks for existing team, so use unique IDs.

        // We need to ensure no conflict with previous runs if `test-user-dlvy` exists.
        // We'll rely on unique event ID to allow new team creation.

        console.log("2. Creating team...");
        teamId = await createTeam(
            eventId,
            `Test Team ${Date.now()}`,
            TEST_USER_ID,
            "robot",
            "#DC2626"
            // categories optional
        );
        console.log(`Team created: ${teamId}`);

        // 3. Create a notification for THAT team
        console.log("3. Creating TEAM notification...");
        notifId = await createNotification({
            title: "Team Alert",
            message: "This is for your team",
            type: "warning",
            target: "team",
            targetId: teamId
        });
        console.log(`Notification created: ${notifId}`);

        // 4. Fetch notifications for user
        console.log(`4. Fetching notifications for user: ${TEST_USER_ID}`);
        const notifications = await getUserNotifications(TEST_USER_ID);

        // 5. Verify
        const found = notifications.find(n => n.id === notifId);
        if (found) {
            console.log("✅ SUCCESS: Team notification found!");
            console.log(`- ${found.title}: ${found.message}`);
        } else {
            console.error("❌ FAILURE: Team notification NOT found.");
            console.log("Fetched:");
            notifications.forEach(n => console.log(`- [${n.target}] ${n.title}`));
        }

    } catch (error) {
        console.error("Test Crashed:");
        console.error(error);
    } finally {
        // Cleanup
        console.log("Cleaning up...");
        if (notifId) await deleteNotification(notifId);
        if (teamId) await deleteTeam(teamId);
        if (eventId) await deleteEvent(eventId);
        process.exit(0);
    }
}

runTest();
