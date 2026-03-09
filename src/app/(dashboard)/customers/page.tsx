import { getCustomersMetadata } from "@/actions";
import { AddCustomerButton, CustomerList, DelayedLoading, Toolbar } from "@/components";
import { SearchParams } from "@/types";
import { Suspense } from "react";

export default async function Customers({ searchParams }: { searchParams?: Promise<SearchParams> }) {
    const params = await searchParams
    const pagination = await getCustomersMetadata({ ...params })

    return <div className="flex-1 overflow-hidden flex flex-col gap-4">
        <Toolbar title="Customers" actions={<AddCustomerButton />} pagination={pagination} />
        <div className="overflow-auto flex-1">
            <table id="services" className="w-full border">
                <thead>
                    <tr className="sticky top-0 z-10 bg-gray-100 border-b">
                        <th className="text-left py-4 px-2">Customer ID</th>
                        <th className="text-left py-4 px-2">Invoice Number</th>
                        <th className="text-left py-4 px-2">Name</th>
                        <th className="text-left py-4 px-2">Phone Number</th>
                        <th className="text-left py-4 px-2">Address</th>
                        <th className="text-left py-4 px-2">Total Amount</th>
                        <th className="text-left py-4 px-2">Date</th>
                        <th className="text-left py-4 px-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <Suspense
                        key={params?.query}
                        fallback={
                            <tr className="border-b">
                                <td colSpan={8} className="text-center py-4 text-gray-600">
                                    <DelayedLoading />
                                </td>
                            </tr>
                        }
                    >
                        <CustomerList {...params} />
                    </Suspense>
                </tbody>
            </table>
        </div>
    </div>
}