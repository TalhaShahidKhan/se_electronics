import 'server-only'
import { JWTPayload, jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from 'react';

const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

export async function encrypt(payload: JWTPayload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(`${process.env.SESSION_EXPIRY_DAY!}d`)
        .sign(encodedKey);

}

export async function decrypt(session: string | undefined = '') {
    try {
        if (!session) return null
        const { payload } = await jwtVerify(session, encodedKey, {
            algorithms: ['HS256']
        })
        return payload
    } catch (error) {
        return null
    }
}

export async function createSession({ username, userId, role = 'admin' }: { username: string, userId: string, role?: 'admin' | 'staff' | 'customer' }) {
    const expiresAt = new Date(Date.now() + parseInt(process.env.SESSION_EXPIRY_DAY!) * 24 * 60 * 60 * 1000)
    const session = await encrypt({ userId, username, role, expiresAt })
    const cookieStore = await cookies()

    cookieStore.set('session', session, {
        httpOnly: true,
        secure: true,
        expires: expiresAt,
        sameSite: 'lax',
        path: '/'
    })
}

export const verifySession = cache(async (shouldRedirect = true, expectedRole?: 'admin' | 'staff' | 'customer') => {
    const cookie = (await cookies()).get('session')?.value
    const session = await decrypt(cookie)

    if (!session?.userId) {
        if (shouldRedirect) {
            redirect('/login')
        }
        return null
    }

    if (expectedRole && session.role !== expectedRole) {
        if (shouldRedirect) {
            if (session.role === 'staff') redirect('/staff/profile')
            else if (session.role === 'customer') redirect('/customer/profile')
            else redirect('/')
        }
        return null
    }

    return { isAuth: true, userId: session.userId, username: session.username, role: session.role }
})

export async function deleteSession() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
}