import { db } from "@/db/drizzle";
import { notices, noticeRecipients, staffs } from "@/db/schema";
import { createNotice, getNotices, getStaffNotices, markNoticeAsRead } from "@/actions/noticeActions";
import { eq } from "drizzle-orm";

async function testNoticeSystem() {
    console.log("Starting Notice System Integration Test...");

    try {
        // 1. Setup - Ensure at least one active staff
        const testStaff = await db.query.staffs.findFirst({
            where: eq(staffs.isActiveStaff, true)
        });
        if (!testStaff) throw new Error("No active staff found for testing");

        console.log(`Test Staff Found: ${testStaff.name} (${testStaff.staffId})`);

        // 2. Test Create Notice
        const noticeData = {
            title: "Integration Test Notice",
            content: "This is a test notice for integration verification.",
            priority: "urgent" as any,
            targetType: "single" as any,
            isDraft: false,
            recipientIds: [testStaff.staffId]
        };

        console.log("Creating urgent notice for single recipient...");
        const createRes = await createNotice(noticeData);
        if (!createRes.success || !createRes.data) throw new Error("Failed to create notice");
        const noticeId = createRes.data.id;

        // 3. Verify Delivery
        console.log("Verifying delivery to staff...");
        const deliveryCheck = await db.query.noticeRecipients.findFirst({
            where: eq(noticeRecipients.noticeId, noticeId)
        });

        if (!deliveryCheck || deliveryCheck.staffId !== testStaff.staffId) {
            throw new Error("Delivery verification failed");
        }
        console.log("Delivery Verified.");

        // 4. Test Read Status
        console.log("Marking notice as read...");
        const readRes = await markNoticeAsRead(deliveryCheck.id);
        if (!readRes.success) throw new Error("Failed to mark as read");

        const readCheck = await db.query.noticeRecipients.findFirst({
            where: eq(noticeRecipients.id, deliveryCheck.id)
        });

        if (!readCheck?.isRead) throw new Error("Read status update failed");
        console.log("Read Status Verified.");

        console.log("Notice System Integration Test Completed Successfully!");
    } catch (error) {
        console.error("Test Failed:", error);
        process.exit(1);
    }
}

// testNoticeSystem();
