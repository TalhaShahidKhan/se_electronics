import { verifyCustomerSession } from "@/actions/customerActions";
import { getComplaintsByCustomer } from "@/actions/complaintActions";
import Link from "next/link";
import { PlusCircle, FileText, UserCircle, ExternalLink, ArrowRight } from "lucide-react";
import { formatDate } from "@/utils";

export default async function ComplainDashboardPage() {
    const session = await verifyCustomerSession();
    if (!session.isAuth || !session.customer) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Please log in to submit a complaint</h2>
                    <Link href="/customer/login" className="bg-brand text-white font-bold py-3 px-6 rounded-lg hover:bg-brand/90 transition-colors">
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    const res = await getComplaintsByCustomer(session.customer.customerId);
    const complaints = res.success ? (res.data || []) : [];
    const lastComplaint = complaints.length > 0 ? complaints[0] : null;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Header Title */}
                <h1 className="text-2xl sm:text-3xl font-black text-brand border-b-2 border-brand/20 pb-4 mb-6">
                    Complaint Dashboard
                </h1>

                {/* Top Action Buttons (Dashboard Style) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link href="/customer/complain/new" className="flex items-center justify-center gap-2 bg-emerald-100/50 hover:bg-emerald-100 text-emerald-700 font-bold py-5 px-6 rounded-xl border border-emerald-200 transition-all shadow-sm">
                        <PlusCircle size={24} className="text-emerald-600" />
                        <span className="text-lg">New Complaint</span>
                    </Link>
                    <Link href="/customer/complain/history" className="flex items-center justify-center gap-2 bg-blue-100/50 hover:bg-blue-100 text-blue-700 font-bold py-5 px-6 rounded-xl border border-blue-200 transition-all shadow-sm">
                        <FileText size={24} className="text-blue-600" />
                        <span className="text-lg">Complaint List</span>
                    </Link>
                    <Link href="/customer/profile" className="flex items-center justify-center gap-2 bg-rose-100/50 hover:bg-rose-100 text-rose-700 font-bold py-5 px-6 rounded-xl border border-rose-200 transition-all shadow-sm">
                        <UserCircle size={24} className="text-rose-600" />
                        <span className="text-lg">Profile</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
                    {/* Last Complaint Box */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
                        <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">
                            Last Complaint
                        </h2>
                        
                        {lastComplaint ? (
                            <div className="flex-1 flex flex-col space-y-6">
                                {/* Progress Tracker */}
                                <div className="flex items-center justify-between relative px-2 sm:px-4">
                                    <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-gray-200 -z-10"></div>
                                    <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-emerald-600 -z-10" style={{ width: lastComplaint.status === 'completed' ? '100%' : lastComplaint.status === 'hearing' ? '66.6%' : lastComplaint.status === 'processing' ? '33.3%' : '0%' }}></div>
                                    
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md">1</div>
                                        <span className="text-[10px] sm:text-xs font-semibold text-gray-600">Under Trial</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full ${lastComplaint.status === 'processing' || lastComplaint.status === 'hearing' || lastComplaint.status === 'completed' ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-500'} flex items-center justify-center font-bold text-sm shadow-md`}>2</div>
                                        <span className="text-[10px] sm:text-xs font-semibold text-gray-600">Processing</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full ${lastComplaint.status === 'hearing' || lastComplaint.status === 'completed' ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-500'} flex items-center justify-center font-bold text-sm shadow-md`}>3</div>
                                        <span className="text-[10px] sm:text-xs font-semibold text-gray-600">Hearing</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full ${lastComplaint.status === 'completed' ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-500'} flex items-center justify-center font-bold text-sm shadow-md`}>4</div>
                                        <span className="text-[10px] sm:text-xs font-semibold text-gray-600">Completed</span>
                                    </div>
                                </div>

                                <div className="space-y-3 flex-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="text-sm">
                                        <span className="font-bold text-gray-800">Tracking Number: </span>
                                        <span className="text-gray-600 font-mono">{lastComplaint.complaintId}</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-bold text-gray-800">Accused Staff: </span>
                                        <span className="text-gray-600">{lastComplaint.staff?.name || "N/A"}</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-bold text-gray-800">Subject: </span>
                                        <span className="text-gray-600">{lastComplaint.subject}</span>
                                    </div>
                                    {lastComplaint.serviceId && (
                                        <div className="text-sm">
                                            <span className="font-bold text-gray-800">Service ID: </span>
                                            <span className="text-gray-600 font-mono">{lastComplaint.serviceId}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-white bg-amber-500 px-3 py-1.5 rounded-md shadow-sm">
                                            Application Status
                                        </span>
                                        <ArrowRight size={16} className="text-gray-400" />
                                        <span className={`text-sm font-bold px-3 py-1.5 rounded-md border bg-white shadow-sm capitalize ${lastComplaint.status === 'completed' ? 'text-emerald-600 border-emerald-200' : 'text-amber-600 border-amber-200'}`}>
                                            {lastComplaint.status.replace("_", " ")}
                                        </span>
                                    </div>
                                    <Link href={`/customer/complain/doc/${lastComplaint.complaintId}`} className="bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold py-1.5 px-4 rounded-md transition-all text-sm shadow-sm hover:shadow-md">
                                        Details
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-400 font-medium pb-8">
                                No recent complaints found.
                            </div>
                        )}
                    </div>

                    {/* Hearing Notice / Recent Summary Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
                        <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">
                            Recent Complaint Notices
                        </h2>
                        
                        {complaints.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-y border-gray-200">
                                            <th className="py-3 px-4 text-xs font-black text-gray-600 uppercase tracking-wide">Accused Staff</th>
                                            <th className="py-3 px-4 text-xs font-black text-gray-600 uppercase tracking-wide">Date</th>
                                            <th className="py-3 px-4 text-xs font-black text-gray-600 uppercase tracking-wide">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {complaints.slice(0, 4).map((c: any) => (
                                            <tr key={c.complaintId} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-4 text-sm font-bold text-gray-800">{c.staff?.name}</td>
                                                <td className="py-3 px-4 text-sm text-gray-600">{formatDate(c.createdAt)}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-sm uppercase ${c.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : c.status === 'hearing' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {c.status.replace("_", " ")}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-400 font-medium">
                                No notices available.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
