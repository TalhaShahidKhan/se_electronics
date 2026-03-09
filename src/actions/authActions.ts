'use server'

import { db } from "@/db/drizzle"
import { admins, authTokens } from "@/db/schema"
import { createSession, deleteSession } from "@/lib"
import { FormState } from "@/types"
import { LoginCredentialsSchema } from "@/validationSchemas"
import bcrypt from 'bcrypt'
import { eq, lt, or } from "drizzle-orm"
import { redirect, RedirectType } from "next/navigation"
import { flattenError, ZodError } from "zod"

export const saveAuthToken = async ({ token, expiresAt, payload }: { token: string, expiresAt: Date, payload?: any }) => {
    await db.insert(authTokens).values({ token, expiresAt, payload })
}

export const verifyAuthToken = async (token: string): Promise<{ isValid: boolean, payload?: any }> => {
    try {
        const tokenData = await db.query.authTokens.findFirst({
            where: eq(authTokens.token, token)
        })
        if (!tokenData || tokenData.expiresAt < new Date()) {
            return { isValid: false }
        }
        return { isValid: true, payload: tokenData.payload }
    } catch (error) {
        console.error(error)
        return { isValid: false }
    }
};

export const deleteAuthToken = async (token: string) => {
    try {
        await db.delete(authTokens).where(
            or(
                eq(authTokens.token, token!),
                lt(authTokens.expiresAt, new Date())
            )
        )
    } catch (error) {
        console.error(error)
    }
}

export async function login(prevState: FormState, credentials: FormData) {
    try {
        const { username, password } = LoginCredentialsSchema.parse(Object.fromEntries(credentials))

        const admin = await db.query.admins.findFirst({
            where: eq(admins.username, username)
        })

        if (!admin) {
            return { success: false, message: 'Invalid username or password' }
        }

        const matched = await bcrypt.compare(password, admin.password)

        if (!matched) {
            return { success: false, message: 'Invalid username or password' }
        }

        await createSession({ username: admin.username, userId: admin.id })
    } catch (error) {
        if (error instanceof ZodError) {
            console.error(flattenError(error).fieldErrors);
            return { success: false, message: 'অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য গুলো পূরণ করুন।' }
        }
        console.error(error)
        return { success: false, message: 'Something went wrong' }
    }
    redirect("/", RedirectType.replace)
}

export async function logout() {
    await deleteSession()
    redirect('/login', RedirectType.replace)
}