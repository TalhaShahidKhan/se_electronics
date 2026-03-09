'use server'

import { db } from "@/db/drizzle"
import { admins } from "@/db/schema"
import { verifySession } from "@/lib"
import { eq } from "drizzle-orm"

export const getAdmin = async () => {
    const session = await verifySession()

    try {
        const admin = await db.query.admins.findFirst({
            where: eq(admins.username, session?.username as string),
            columns: {
                password: false
            }
        })
        return { success: true, data: admin }
    } catch (error) {
        console.error(error)
        return { success: false, message: 'Something went wrong' }
    }
}