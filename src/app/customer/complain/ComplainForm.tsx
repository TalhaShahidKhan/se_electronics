"use client";

import { submitComplaint } from "@/actions/complaintActions";
import { useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Download, CheckCircle2, AlertCircle, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function ComplainForm({ customerId, staffs }: { customerId: string, staffs: any[] }) {
    const [state, action, isPending] = useActionState(submitComplaint, undefined);
    const [complaintId, setComplaintId] = useState<string | null>(null);

    useEffect(() => {
        if (state) {
            if (state.success) {
                toast.success(state.message);
                if (state.data) {
                    setComplaintId(state.data as string);
                }
            } else {
                toast.error(state.message);
            }
        }
    }, [state]);

    if (state?.success && complaintId) {
        return (
            <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-8 sm:p-12 flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">Complaint Submitted!</h2>
                <p className="text-gray-500 mb-8 max-w-md">
                    Your complaint has been recorded with ID <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{complaintId}</span>. 
                    An administrator has been notified and will review it shortly.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-xl">
                    <Link 
                        href={`/customer/complain/doc/${complaintId}`} 
                        className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-800 font-bold py-4 px-6 rounded-2xl hover:bg-gray-50 transition-all"
                    >
                        <ExternalLink size={20} />
                        View Document
                    </Link>
                    <Link 
                        href={`/pdf/download?type=complaint&id=${complaintId}`} 
                        className="flex items-center justify-center gap-2 bg-black text-white font-bold py-4 px-6 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-black/20"
                    >
                        <Download size={20} />
                        Download PDF
                    </Link>
                    <Link 
                        href="/customer/profile" 
                        className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-bold py-4 px-6 rounded-2xl hover:bg-gray-200 transition-all"
                    >
                        Back to Profile
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <form action={action} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10 flex flex-col gap-6 w-full relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-full -mr-16 -mt-16 z-0" />
            
            <input type="hidden" name="customerId" value={customerId} />
            
            <div className="relative z-10 space-y-6">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-black text-gray-700 uppercase tracking-wider flex items-center gap-2">
                        Who are you reporting?
                        <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                        <select 
                            name="staffId" 
                            required 
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 transition-all hover:bg-white text-gray-900 appearance-none cursor-pointer"
                        >
                            <option value="">-- Select Staff Member --</option>
                            {staffs.map(staff => (
                                <option key={staff.staffId} value={staff.staffId}>
                                    {staff.name} ({staff.role})
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-black text-gray-700 uppercase tracking-wider">
                            Service ID (Optional)
                        </label>
                        <input 
                            type="text" 
                            name="serviceId" 
                            placeholder="e.g. SRV-XXXX" 
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 transition-all hover:bg-white text-gray-900" 
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-black text-gray-700 uppercase tracking-wider">
                            Complaint Subject <span className="text-rose-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            name="subject" 
                            required 
                            placeholder="Short summary..." 
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 transition-all hover:bg-white text-gray-900" 
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-black text-gray-700 uppercase tracking-wider">
                        Detailed Description <span className="text-rose-500">*</span>
                    </label>
                    <textarea 
                        name="description" 
                        required 
                        placeholder="Please describe what happened in detail..." 
                        rows={6} 
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 transition-all hover:bg-white text-gray-900 resize-none"
                    ></textarea>
                </div>

                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex gap-3 items-start">
                    <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
                    <p className="text-xs text-rose-700 leading-relaxed font-medium">
                        Your complaint will be reviewed by the administration. False reporting may lead to account suspension. Please provide honest details.
                    </p>
                </div>

                <button 
                    type="submit" 
                    disabled={isPending} 
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-rose-200 transition-all transform hover:-translate-y-1 hover:shadow-2xl active:scale-95 disabled:bg-rose-300 disabled:cursor-not-allowed text-lg"
                >
                    {isPending ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Submitting Report...
                        </span>
                    ) : (
                        "Submit Official Complaint"
                    )}
                </button>
            </div>
        </form>
    );
}