'use server'

import { db } from "@/db/drizzle";
import { customers, services, subscriptions, applications } from "@/db/schema";
import { createSession, deleteSession, verifySession } from "@/lib";
import { eq, and, count, or } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function verifyCustomerSession() {
    const session = await verifySession(false, 'customer');
    if (!session || !session.isAuth) {
        return { isAuth: false };
    }

    const customer = await db.query.customers.findFirst({
        where: eq(customers.customerId, session.userId as string)
    });

    if (!customer) {
        return { isAuth: false };
    }

    return { 
        isAuth: true, 
        userId: session.userId, 
        username: session.username, 
        role: session.role,
        customer 
    };
}

export async function applyForVipCard() {
    const session = await verifySession(true, 'customer');
    
    if (!session) {
        return { success: false, message: "Unauthorized access" };
    }

    const customerId = session.userId as string;

    const customer = await db.query.customers.findFirst({
        where: eq(customers.customerId, customerId)
    });

    if (!customer) {
        throw new Error("Customer not found");
    }

    // Allow re-applying if rejected or expired
    if (customer.vipStatus === 'approved' || customer.vipStatus === 'pending' || customer.vipStatus === 'processing') {
        return { success: false, message: "Application already exists or member is already VIP" };
    }

    // Update customer status
    await db.update(customers)
        .set({ vipStatus: 'pending' })
        .where(eq(customers.customerId, customerId));

    // Check for existing application record to update or create new one
    const existingApp = await db.query.applications.findFirst({
        where: and(
            eq(applications.applicantId, customerId),
            eq(applications.type, 'vip_card_application')
        )
    });

    if (existingApp) {
        await db.update(applications)
            .set({ status: 'pending', updatedAt: new Date() })
            .where(eq(applications.id, existingApp.id));
    } else {
        const { createApplication } = await import("./applicationActions");
        await createApplication({
            applicantId: customerId,
            type: 'vip_card_application',
            status: 'pending'
        });
    }

    revalidatePath('/customer/vip-card');
    revalidatePath('/customer/profile');
    
    return { success: true, message: "Application submitted successfully" };
}

export async function getCustomerProfileStats(customerId: string) {
    try {
        const [customerData] = await db.select({ phone: customers.phone })
            .from(customers)
            .where(eq(customers.customerId, customerId))
            .limit(1);

        if (!customerData) return { success: false, message: "Customer not found" };

        const serviceCount = await db.select({ count: count() })
            .from(services)
            .where(eq(services.customerId, customerId));

        const subscriptionCount = await db.select({ count: count() })
            .from(subscriptions)
            .where(and(
                eq(subscriptions.phone, customerData.phone),
                eq(subscriptions.isActive, true)
            ));

        return {
            success: true,
            data: {
                totalServices: serviceCount[0].count,
                activeSubscriptions: subscriptionCount[0].count
            }
        };
    } catch (error) {
        console.error("Error fetching customer stats:", error);
        return { success: false, message: "Failed to fetch stats" };
    }
}

export async function customerLogout() {
    await deleteSession();
    redirect('/customer/login');
}

export async function customerLogin(prevState: any, formData: FormData) {
    try {
        const customerId = formData.get('customerId') as string;

        if (!customerId) {
            return { success: false, message: "Customer ID is required" };
        }

        const customer = await db.query.customers.findFirst({
            where: or(
                eq(customers.customerId, customerId),
                eq(customers.invoiceNumber, customerId)
            )
        });

        if (!customer) {
            return { success: false, message: "Invalid Customer ID or Invoice Number" };
        }

        await createSession({ 
            username: customer.name, 
            userId: customer.customerId, 
            role: 'customer' 
        });

    } catch (error) {
        console.error("Login Error:", error);
        return { success: false, message: "Authentication failed. Please try again." };
    }
    
    redirect("/customer/profile");
}
