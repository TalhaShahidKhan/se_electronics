import { GetServiceForm } from "@/components";
import { verifyCustomerSession } from "@/actions/customerActions";
import { SearchParams } from "@/types";
import { MobilePageHeader } from "@/components/layout";
import { Settings } from "lucide-react";

export default async function GetServicePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
    const params: any = await searchParams;
    const session = await verifyCustomerSession();
    const preferredStaffId = params.staffId as string || '';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            <div className="flex-1">
                <GetServiceForm
                    preferredStaffId={preferredStaffId}
                    customerId={session.isAuth ? session.customer?.customerId : undefined}
                    customerData={session.isAuth ? session.customer : undefined}
                />
            </div>
        </div>
    );
}