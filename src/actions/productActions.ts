'use server'

import { db } from "@/db/drizzle"
import { products } from "@/db/schema"
import { eq } from "drizzle-orm"

export const getProducts = async (invoiceId: string) => {
    try {
        const productsData = await db.query.products.findMany({
            where: eq(products.invoiceId, invoiceId)
        })
        return {
            success: true,
            data: productsData
        }
    } catch (error) {
        console.error(error)
        return { success: false, message: 'Could not fetch products' }
    }
}

