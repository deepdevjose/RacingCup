
import { getUserNotifications, createNotification, deleteNotification } from '../lib/firebase';

const TEST_USER_ID = "test-user-id";

async function runTest() {
    console.log("Starting notification test...");
    let notifId = "";

    try {
        console.log("Creating test notification...");
        notifId = await createNotification({
            title: "Test Notification",
            message: "This is a debug message",
            type: "info",
            target: "all"
        });
        console.log(`Created notification ID: ${notifId}`);

        console.log(`Fetching notifications for user: ${TEST_USER_ID}`);
        const notifications = await getUserNotifications(TEST_USER_ID);
        console.log("Successfully fetched notifications!");
        console.log(`Count: ${notifications.length}`);

        notifications.forEach(n => {
            console.log(`- [${n.type}] ${n.title} (${n.createdAt})`);
        });

    } catch (error) {
        console.error("FAILED:");
        console.error(error);
    } finally {
        if (notifId) {
            console.log("Cleaning up...");
            await deleteNotification(notifId);
        }
        process.exit(0);
    }
}

runTest();
