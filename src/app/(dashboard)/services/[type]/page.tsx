import { getServicesMetadata } from "@/actions";
import { DelayedLoading, ServiceList, Spinner, Toolbar } from "@/components";
import { Suspense } from "react";

export default async function Services({ params, searchParams }: {
    params: Promise<{ type: 'repairs' | 'installations' }>
    searchParams?: Promise<{
        query?: string
        page?: string
        limit?: string
    }>
}) {

    const prms = await params
    const sp = await searchParams
    const type = prms.type === 'repairs' ? 'repair' : 'install'
    const title = prms.type === 'repairs' ? 'Repairs' : 'Installations'
    const pagination = await getServicesMetadata({ ...sp, type: type })

    return <div className="flex-1 overflow-hidden flex flex-col gap-4">
        <Toolbar title={title} pagination={pagination} />
        <div className="overflow-auto flex-1">
            <table className="w-full border">
                <thead>
                    <tr className="sticky top-0 z-10 bg-gray-100 border-b">
                        <th className="text-left py-4 px-2">Service ID</th>
                        <th className="text-left py-4 px-2">Customer Name</th>
                        <th className="text-left py-4 px-2">Phone Number</th>
                        <th className="text-left py-4 px-2">Address</th>
                        <th className="text-left py-4 px-2">Product</th>
                        <th className="text-left py-4 px-2">Date</th>
                        <th className="text-left py-4 px-2">Status</th>
                        <th className="text-left py-4 px-2">Staff Name</th>
                        <th className="text-left py-4 px-2">Staff Number</th>
                        <th className="text-left py-4 px-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <Suspense
                        key={sp?.query}
                        fallback={
                            <tr className="border-b">
                                <td colSpan={10} className="text-center py-4 text-gray-600">
                                    <DelayedLoading />
                                </td>
                            </tr>
                        }
                    >
                        <ServiceList {...{ ...sp, type: type }} />
                    </Suspense>
                </tbody>
            </table>
        </div>
    </div>
}