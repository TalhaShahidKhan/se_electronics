import { getServiceById } from "@/actions"
import FeedbackForm from "@/components/features/services/FeedbackForm"
import { AppError } from "@/utils"
import { notFound } from "next/navigation"

export default async function FeedbackPage({ searchParams }: { searchParams: Promise<{ serviceId: string }> }) {
    const params = await searchParams
    if (!params.serviceId) {
        notFound()
    }
    const service = await getServiceById(params.serviceId)

    if (!service.success) {
        throw new AppError("সার্ভিস আইডিটি সঠিক নয়।")
    }
    return <FeedbackForm serviceId={service.data?.serviceId ?? ''} customerId={service.data?.customerId ?? ''} />
}