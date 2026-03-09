import { getServiceById } from "@/actions"
import ServiceReport from "@/components/ServiceReport"
import { AppError } from "@/utils"
import clsx from "clsx"
import { notFound } from "next/navigation"

export default async function ServiceReportPage({ searchParams }: { searchParams: Promise<{ serviceId: string }> }) {
    const params = await searchParams

    if (!params.serviceId) {
        notFound()
    }
    const response = await getServiceById(params.serviceId)

    if (!response.success) {
        throw new AppError("সার্ভিস আইডিটি সঠিক নয়।")
    }
    const serviceData = response.data
    const statusHistory = serviceData.statusHistory[serviceData.statusHistory.length - 1]
    const statusArray = serviceData.statusHistory.map(status => status.status)
    if (statusHistory.status === 'completed' || statusHistory.status === 'canceled') {
        return <div className="absolute inset-0 flex flex-col gap-4 items-center text-center px-4 justify-start pt-32">
            <div className={clsx(statusHistory.status === 'completed' ? 'text-green-600' : statusHistory.status === 'canceled' && 'text-red-500')}>
                {statusHistory.status === 'completed' &&
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor" className="size-28">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                }
                {statusHistory.status === 'canceled' &&
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={.5} stroke="currentColor" className="size-28">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                }
            </div>
            <p className="text-3xl">{statusHistory.status === 'completed' ? 'সার্ভিসিং তথ্য প্রেরণ করা হয়েছে' : statusHistory.status === 'canceled' && 'সার্ভিসটি বাতিল করা হয়েছে'}</p>
        </div>
    } else {
        return <ServiceReport
            serviceData={{
                serviceId: serviceData.serviceId,
                serviceType: serviceData.type,
                serviceStatus: statusHistory.status,
                statusArray: statusArray,
                customerName: serviceData.customerName,
                customerPhone: serviceData.customerPhone
            }}
        />
    }
}