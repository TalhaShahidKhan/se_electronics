import { verifyCustomerSession } from "@/actions/customerActions";
import { getAllTeamMembers } from "@/actions/staffActions";
import FormalComplainForm from "./FormalComplainForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCustomerById } from "@/actions";

export default async function NewComplaintPage() {
    const session = await verifyCustomerSession();
    if (!session.isAuth || !session.customer) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 text-center">
                <div>
                    <h2 className="text-2xl font-bold mb-4">Please log in to submit a complaint</h2>
                    <Link href="/customer/login" className="bg-brand text-white font-bold py-3 px-6 rounded-lg hover:bg-brand/90 transition-colors">
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    const { data: customerData } = await getCustomerById(session.customer.customerId);
    const staffRes = await getAllTeamMembers();
    const staffs = staffRes.success ? (staffRes.data || []) : [];

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 flex justify-center">
            <div className="max-w-4xl w-full">
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/customer/complain" className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 hover:shadow-md transition-all active:scale-95">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </Link>
                    <h1 className="text-2xl font-black text-gray-900 border-b-2 border-brand/20 pb-1">
                        File New Complaint
                    </h1>
                </div>

                <FormalComplainForm customer={customerData} customerId={session.customer.customerId} staffs={staffs} />
            </div>
        </div>
    );
}
