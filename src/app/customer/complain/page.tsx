import { verifyCustomerSession } from "@/actions/customerActions";
import { getAllTeamMembers } from "@/actions/staffActions";
import ComplainForm from "./ComplainForm";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default async function ComplainPage() {
    const session = await verifyCustomerSession();
    if (!session.isAuth || !session.customer) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Please log in to submit a complaint</h2>
                    <Link href="/customer/login" className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    const staffRes = await getAllTeamMembers();
    const staffs = staffRes.success ? (staffRes.data || []) : [];

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/customer/profile" className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 hover:shadow-md transition-all active:scale-95">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </Link>
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-rose-100 rounded-xl">
                            <FileText className="text-rose-600" size={28} />
                        </div>
                        File a Complaint
                    </h1>
                </div>
                
                <p className="text-gray-600 mb-8 sm:ml-[4.5rem] text-lg max-w-xl">
                    We're sorry you had a negative experience. Please provide the details below so we can address the issue promptly.
                </p>

                <div className="sm:ml-[4.5rem]">
                    <ComplainForm customerId={session.customer.customerId} staffs={staffs} />
                </div>
            </div>
        </div>
    );
}
