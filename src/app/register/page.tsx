import { RegistrationPage } from "@/components";
import { notFound } from "next/navigation";

export default async function Register({ searchParams }: { searchParams: Promise<{ token: string, success?: string }> }) {
    const params = await searchParams
    if (!params.token) {
        notFound()
    }
    return <RegistrationPage token={params.token} />
}