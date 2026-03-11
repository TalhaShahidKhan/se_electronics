"use client";

import { submitComplaint } from "@/actions/complaintActions";
import { useActionState, useEffect } from "react";
import { toast } from "react-toastify";

export default function ComplainForm({ customerId, staffs }: { customerId: string, staffs: any[] }) {
    const [state, action, isPending] = useActionState(submitComplaint, undefined);
    
    useEffect(() => {
        if (state) {
            if (state.success) {
                toast.success(state.message);
                setTimeout(() => {
                    window.location.href = '/customer/profile';
                }, 2000);
            } else {
                toast.error(state.message);
            }
        }
    }, [state]);

    if (state?.success) {
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 p-12 flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Complaint Submitted</h2>
                <p className="text-gray-600 text-lg">We have received your complaint and will review it shortly. Redirecting you back to your profile...</p>
            </div>
        )
    }

    return (
        <form action={action} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-6 w-full">
            <input type="hidden" name="customerId" value={customerId} />
            
            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Select Staff Member <span className="text-red-500">*</span></label>
                <select name="staffId" required className="w-full p-4 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 transition-all bg-gray-50 hover:bg-white text-gray-900 appearance-none cursor-pointer">
                    <option value="">-- Choose a staff member --</option>
                    {staffs.map(staff => (
                        <option key={staff.staffId} value={staff.staffId}>
                            {staff.name} ({staff.role}) - {staff.phone}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Service ID (Optional)</label>
                <input type="text" name="serviceId" placeholder="e.g. SRV-2026-XXXX" className="w-full p-4 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 transition-all bg-gray-50 hover:bg-white text-gray-900" />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Subject <span className="text-red-500">*</span></label>
                <input type="text" name="subject" required placeholder="What is the complaint about?" className="w-full p-4 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 transition-all bg-gray-50 hover:bg-white text-gray-900" />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Description <span className="text-red-500">*</span></label>
                <textarea name="description" required placeholder="Please provide details about your complaint..." rows={5} className="w-full p-4 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 transition-all bg-gray-50 hover:bg-white text-gray-900 resize-none"></textarea>
            </div>

            <button type="submit" disabled={isPending} className="w-full mt-4 bg-rose-600 hover:bg-rose-700 text-white font-bold py-5 rounded-2xl shadow-lg shadow-rose-200 transition-all transform hover:-translate-y-1 hover:shadow-xl active:scale-95 disabled:bg-rose-300 disabled:cursor-not-allowed text-lg">
                {isPending ? "Submitting..." : "Submit Complaint"}
            </button>
        </form>
    );
}
