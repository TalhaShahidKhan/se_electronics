'use server'

import { ApplicationMessages } from "@/constants/messages"
import { db } from "@/db/drizzle"
import { agreements, applications, services, staffs, subscriptions } from "@/db/schema"
import { sendSMS, verifySession } from "@/lib"
import { getObjectUrl } from "@/lib/s3"
import { ApplicationTypes, SearchParams } from "@/types"
import { generateRandomId, generateUrl, renderText } from "@/utils"
import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { deleteSubscriber } from "./subscriptionActions"
import { deleteStaff } from "./staffActions"
import { deleteService } from "./serviceActions"

export const getApplications = async ({ query, type, page = '1', limit = '20' }: SearchParams & { type?: ApplicationTypes }) => {
    await verifySession()

    try {
        const q = `%${query}%`
        const filters = and(
            type ? eq(applications.type, type + '_application' as ApplicationTypes) : undefined,
            query ? or(
                ilike(applications.applicationId, q),
                ilike(staffs.name, q),
                ilike(staffs.phone, q),
                ilike(staffs.currentDistrict, q),
                ilike(services.customerName, q),
                ilike(services.customerPhone, q),
                ilike(services.customerAddressDistrict, q),
                ilike(subscriptions.name, q),
                ilike(subscriptions.phone, q),
                ilike(subscriptions.district, q)
            ) : undefined
        )

        const offset = (page && limit) ? (Number(page) - 1) * Number(limit) : 0

        const applicationColumns = getTableColumns(applications)
        const applicationsData = await db
            .select({
                ...applicationColumns,
                applicantName: sql<string>`coalesce(${staffs.name}, ${services.customerName}, ${subscriptions.name})`.as('applicantName'),
                applicantPhone: sql<string>`coalesce(${staffs.phone}, ${services.customerPhone}, ${subscriptions.phone})`.as('applicantPhone'),
                applicantDistrict: sql<string>`coalesce(
                    ${staffs.currentDistrict}, 
                    ${services.customerAddressDistrict}, 
                    ${subscriptions.district}
                    )`.as('applicantDistrict'),
            })
            .from(applications)
            .leftJoin(staffs, eq(staffs.staffId, applications.applicantId))
            .leftJoin(services, eq(services.serviceId, applications.applicantId))
            .leftJoin(subscriptions, eq(subscriptions.subscriptionId, applications.applicantId))
            .where(filters)
            .limit(Number(limit))
            .offset(offset)
            .orderBy(desc(applications.createdAt))
        return { success: true, data: applicationsData }
    } catch (error) {
        console.error(error)
        return { success: false, message: 'Could not fetch applications' }
    }
}

export const getApplicationsMetadata = async ({ query, type, page = '1', limit = '20' }: SearchParams & { type?: ApplicationTypes }) => {
    await verifySession()

    const q = `%${query}%`
    const filters = and(
        type ? eq(applications.type, type + '_application' as ApplicationTypes) : undefined,
        query ? or(
            ilike(applications.applicationId, q),
            ilike(staffs.name, q),
            ilike(staffs.phone, q),
            ilike(staffs.currentDistrict, q),
            ilike(services.customerName, q),
            ilike(services.customerPhone, q),
            ilike(services.customerAddressDistrict, q),
            ilike(subscriptions.name, q),
            ilike(subscriptions.phone, q),
            ilike(subscriptions.district, q)
        ) : undefined
    )
    const totalRecords = (await db
        .select({ count: sql<number>`count(*)` })
        .from(applications)
        .leftJoin(staffs, eq(staffs.staffId, applications.applicantId))
        .leftJoin(services, eq(services.serviceId, applications.applicantId))
        .leftJoin(subscriptions, eq(subscriptions.subscriptionId, applications.applicantId))
        .where(filters))[0].count

    const totalPages = limit ? Math.ceil(totalRecords / Number(limit)) : 1;

    return {
        currentPage: Number(page),
        totalRecords: totalRecords,
        totalPages: totalPages,
        currentLimit: Number(limit)
    }
}

export const getTOSContent = async (type: 'application_declaration') => {
    const tosContent = await db.query.agreements.findFirst({
        where: eq(agreements.type, type),
        columns: {
            content: true
        }
    })

    return tosContent?.content
}

// fetches public data
export const getApplicationById = async (applicationId: string) => {
    try {
        const applicationData = await db.query.applications.findFirst({
            where: eq(applications.applicationId, applicationId),
            with: {
                staff: {
                    columns: {
                        name: true,
                        phone: true,
                        photoKey: true
                    }
                },
                service: {
                    columns: {
                        customerName: true,
                        customerPhone: true,
                    }
                },
                subscriber: {
                    columns: {
                        name: true,
                        phone: true,
                    }
                }
            }
        })
        if (!applicationData) return { success: false, message: 'Application not found' }

        if (applicationData.type === 'staff_application') {
            const photoUrl = await getObjectUrl(applicationData.staff.photoKey)
            return { success: true, data: { ...applicationData, staff: { ...applicationData.staff, photoUrl } } }
        }

        return { success: true, data: applicationData }
    } catch (error) {
        console.error(error)
        return { success: false, message: 'Something went wrong' }
    }
}

export const createApplication = async (data: Omit<typeof applications.$inferInsert, 'applicationId'>, tx?: any) => {
    try {
        const applicationId = generateRandomId()
        const database = tx || db
        await database.insert(applications).values({ ...data, applicationId })
        revalidatePath('/applications')
        return { success: true, data: applicationId }
    } catch (error) {
        console.error(error)
        return { success: false, message: 'Something went wrong' }
    }
}

export const updateApplicationStatus = async (applicationId: string, updates: { status?: typeof applications.$inferInsert.status, rejectReason?: string }) => {
    try {
        const applicationData = await db.update(applications)
            .set({ ...updates })
            .where(eq(applications.applicationId, applicationId))
            .returning({
                applicantId: applications.applicantId,
                type: applications.type
            })

        const { status } = updates
        let messageContent = ''
        let serviceId = ''

        if (status && (status === 'approved' || status === 'rejected')) {
            switch (applicationData[0].type) {
                case 'staff_application': {
                    await db.update(staffs)
                        .set({ isVerified: status === 'approved' })
                        .where(eq(staffs.staffId, applicationData[0].applicantId))

                    if (status === 'approved') {
                        messageContent = ApplicationMessages.staff.APPROVAL
                    } else {
                        messageContent = ApplicationMessages.staff.REJECTION
                    }
                    break
                }
                case 'service_application': {
                    serviceId = (await db.update(services)
                        .set({ isActive: status === 'approved' })
                        .where(eq(services.serviceId, applicationData[0].applicantId))
                        .returning({ serviceId: services.serviceId }))[0].serviceId

                    if (status === 'approved') {
                        messageContent = ApplicationMessages.service.APPROVAL
                    } else {
                        messageContent = ApplicationMessages.service.REJECTION
                    }
                    break
                }
                case 'subscription_application': {
                    await db.update(subscriptions)
                        .set({ isActive: status === 'approved' })
                        .where(eq(subscriptions.subscriptionId, applicationData[0].applicantId))

                    if (status === 'approved') {
                        messageContent = ApplicationMessages.subscription.APPROVAL
                    } else {
                        messageContent = ApplicationMessages.subscription.REJECTION
                    }
                    break
                }
            }

            const applicantData = await db
                .select({
                    name: sql<string>`coalesce(${staffs.name}, ${services.customerName}, ${subscriptions.name})`.as('name'),
                    phone: sql<string>`coalesce(${staffs.phone}, ${services.customerPhone}, ${subscriptions.phone})`.as('phone'),
                })
                .from(applications)
                .leftJoin(staffs, eq(staffs.staffId, applications.applicantId))
                .leftJoin(services, eq(services.serviceId, applications.applicantId))
                .leftJoin(subscriptions, eq(subscriptions.subscriptionId, applications.applicantId))
                .where(eq(applications.applicationId, applicationId))

            await sendSMS(
                applicantData[0].phone,
                renderText(
                    messageContent,
                    {
                        applicant_name: applicantData[0].name,
                        service_id: serviceId,
                        tracking_link: generateUrl('service-tracking', { trackingId: serviceId }),
                    }
                )
            )
        }

        revalidatePath('/applications')
        return { success: true, message: 'Application status updated' }
    } catch (error) {
        console.error(error)
        return { success: false, message: 'Something went wrong' }
    }
}

export const deleteApplication = async (applicationId: string) => {
    try {
        const applicationData = await db.delete(applications)
            .where(eq(applications.applicationId, applicationId))
            .returning({ applicantId: applications.applicantId, type: applications.type })

        switch (applicationData[0].type) {
            case 'service_application':
                await deleteService(applicationData[0].applicantId)
                revalidatePath('/services')
                break;
            case 'staff_application':
                await deleteStaff(applicationData[0].applicantId)
                revalidatePath('/staffs')
                break;
            case 'subscription_application':
                await deleteSubscriber(applicationData[0].applicantId)
                revalidatePath('/subscriptions')
                break;
        }

        revalidatePath('/applications')
        return { success: true, message: 'Application deleted' }
    } catch (error) {
        console.error(error)
        return { success: false, message: 'Something went wrong' }
    }
}