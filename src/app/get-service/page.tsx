import { GetServiceForm } from "@/components";
import { verifyCustomerSession } from "@/actions/customerActions";
import { SearchParams } from "@/types";

export default async function GetServicePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
    const params: any = await searchParams;
    const session = await verifyCustomerSession();
    const preferredStaffId = params.staffId as string || '';

    return (
        <GetServiceForm
            preferredStaffId={preferredStaffId}
            customerId={session.isAuth ? session.customer?.customerId : undefined}
            customerData={session.isAuth ? session.customer : undefined}
        />
    );
}