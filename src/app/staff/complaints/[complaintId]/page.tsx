import { getComplaintById } from "@/actions/complaintActions";
import { verifyStaffSession } from "@/actions";
import { getStaffProfileStats } from "@/actions/staffActions";
import { StaffLayout } from "@/components/layout/StaffLayout";
import { formatDate } from "@/utils";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  ShieldAlert,
  User,
  Calendar,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export default async function StaffComplaintDetailsPage({
  params,
}: {
  params: Promise<{ complaintId: string }>;
}) {
  const session = await verifyStaffSession();
  if (!session.isAuth) return null;

  const { complaintId } = await params;
  const [res, statsRes] = await Promise.all([
    getComplaintById(complaintId),
    getStaffProfileStats(session.userId as string),
  ]);

  if (!res.success || !res.data) notFound();

  const complaint = res.data;
  const stats = statsRes.success ? statsRes.data : null;

  // Security check: only the accused staff can see their complaint
  if (complaint.staffId !== session.userId) {
    notFound();
  }

  const isProcessing =
    complaint.status === "processing" ||
    complaint.status === "hearing" ||
    complaint.status === "completed";
  const isHearing =
    complaint.status === "hearing" || complaint.status === "completed";
  const isCompleted = complaint.status === "completed";

  return (
    <StaffLayout balance={stats?.availableBalance || 0}>
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/staff/profile"
            className="p-3 bg-white rounded-md shadow-sm border border-gray-100 text-gray-400 hover:text-brand transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <ShieldAlert className="text-red-500" size={24} />
              Complaint Details
            </h1>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Tracking ID: {complaint.complaintId}
            </p>
          </div>
        </div>

        {/* Complaint Warning Card */}
        <div className="bg-red-50 border-2 border-red-100 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertTriangle size={80} className="text-red-600" />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-start">
            <div className="bg-white p-4 rounded-md shadow-sm">
              <User className="text-red-500" size={32} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-red-700 mb-1">
                Issue Reported by Customer
              </h3>
              <p className="text-sm font-bold text-red-600/80 mb-4">
                {complaint.customer?.name} filed this report.
              </p>
              <div className="bg-white/60 p-4 rounded-md border border-red-200">
                <p className="text-sm font-black text-red-800 uppercase tracking-widest mb-2">
                  Subject: {complaint.subject}
                </p>
                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                  "{complaint.description}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Tracker - Vertical English UI */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-center font-black text-gray-900 uppercase tracking-[0.2em] text-sm mb-10">
            Report Lifecycle
          </h3>

          <div className="max-w-md mx-auto relative px-4">
            {/* Vertical Line Connecting Dots */}
            <div className="absolute left-[39px] top-4 bottom-4 w-0.5 bg-emerald-100 hidden sm:block"></div>

            <div className="space-y-10">
              {/* Step 1: Pending */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 relative group">
                <div
                  className={`z-10 size-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-all bg-white ${isProcessing || complaint.status === "under_trial" ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-gray-200"}`}
                >
                  <CheckCircle size={20} />
                </div>

                <div className="flex-1 flex items-center gap-4 w-full">
                  <div className="h-0.5 w-8 bg-emerald-100 hidden sm:block"></div>
                  <div className="flex-1 bg-emerald-50/30 border border-emerald-100 rounded-md p-4 transition-colors">
                    <h4 className="font-bold text-emerald-800 text-[13px] uppercase tracking-widest leading-none">
                      Pending
                    </h4>
                    <div className="mt-2 flex items-center gap-2">
                      <Calendar size={12} className="text-emerald-400" />
                      <span className="text-sm font-black text-emerald-700">
                        {formatDate(complaint.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Processing */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 relative group">
                <div
                  className={`z-10 size-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-all bg-white ${isProcessing ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-gray-200 text-gray-300"}`}
                >
                  <CheckCircle size={20} />
                </div>

                <div className="flex-1 flex items-center gap-4 w-full">
                  <div
                    className={`h-0.5 w-8 hidden sm:block ${isProcessing ? "bg-emerald-100" : "bg-gray-100"}`}
                  ></div>
                  <div
                    className={`flex-1 border rounded-md p-4 transition-all ${isProcessing ? "bg-emerald-50/30 border-emerald-100" : "bg-gray-50 border-gray-100 opacity-60"}`}
                  >
                    <h4
                      className={`font-bold text-[13px] uppercase tracking-widest leading-none ${isProcessing ? "text-emerald-800" : "text-gray-400"}`}
                    >
                      Processing
                    </h4>
                    <div className="mt-2 flex items-center gap-2">
                      <Calendar
                        size={12}
                        className={
                          isProcessing ? "text-emerald-400" : "text-gray-200"
                        }
                      />
                      <span
                        className={`text-sm font-black ${isProcessing ? "text-emerald-700" : "text-gray-300"}`}
                      >
                        {isProcessing ? "Under Investigation" : "Scheduled"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Hearing */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 relative group">
                <div
                  className={`z-10 size-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-all bg-white ${isHearing ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-gray-200 text-gray-300"}`}
                >
                  <CheckCircle size={20} />
                </div>

                <div className="flex-1 flex items-center gap-4 w-full">
                  <div
                    className={`h-0.5 w-8 hidden sm:block ${isHearing ? "bg-emerald-100" : "bg-gray-100"}`}
                  ></div>
                  <div
                    className={`flex-1 border rounded-md p-4 transition-all ${isHearing ? "bg-emerald-50/30 border-emerald-100" : "bg-gray-50 border-gray-100 opacity-60"}`}
                  >
                    <h4
                      className={`font-bold text-[13px] uppercase tracking-widest leading-none ${isHearing ? "text-emerald-800" : "text-gray-400"}`}
                    >
                      Hearing
                    </h4>
                    <div className="mt-2 flex items-center gap-2">
                      <Calendar
                        size={12}
                        className={
                          isHearing ? "text-emerald-400" : "text-gray-200"
                        }
                      />
                      <span
                        className={`text-sm font-black ${isHearing ? "text-emerald-700" : "text-gray-300"}`}
                      >
                        {isHearing ? "Summons Issued" : "Pending Action"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4: Completed */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 relative group">
                <div
                  className={`z-10 size-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-all bg-white ${isCompleted ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-gray-200 text-gray-300"}`}
                >
                  <CheckCircle size={20} />
                </div>

                <div className="flex-1 flex items-center gap-4 w-full">
                  <div
                    className={`h-0.5 w-8 hidden sm:block ${isCompleted ? "bg-emerald-100" : "bg-gray-100"}`}
                  ></div>
                  <div
                    className={`flex-1 border rounded-md p-4 transition-all ${isCompleted ? "bg-emerald-600 text-white shadow-xl shadow-emerald-100" : "bg-gray-50 border-gray-100 opacity-60 font-black"}`}
                  >
                    <h4
                      className={`font-bold text-[13px] uppercase tracking-widest leading-none ${isCompleted ? "text-white" : "text-gray-400"}`}
                    >
                      Settled
                    </h4>
                    <div className="mt-2 flex items-center gap-2">
                      <Calendar
                        size={12}
                        className={
                          isCompleted ? "text-emerald-100" : "text-gray-200"
                        }
                      />
                      <span
                        className={`text-sm font-black ${isCompleted ? "text-white" : "text-gray-300"}`}
                      >
                        {isCompleted ? "Resolved" : "Finalization"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Resolution / Notes */}
        {complaint.adminNote && (
          <div className="bg-amber-50 border-2 border-amber-100 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={18} className="text-amber-600" />
              <h4 className="text-sm font-black text-amber-800 uppercase tracking-widest">
                Admin Resolution Details
              </h4>
            </div>
            <div className="bg-white p-4 rounded-md border border-amber-100">
              <p className="text-sm text-gray-700 leading-relaxed font-bold italic">
                "{complaint.adminNote}"
              </p>
            </div>
            <p className="mt-4 text-[10px] font-bold text-amber-600/60 uppercase text-center tracking-widest">
              Updated on {formatDate(complaint.updatedAt)}
            </p>
          </div>
        )}

        <div className="bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldAlert size={60} />
          </div>
          <h4 className="font-black text-lg mb-2">Internal Policy</h4>
          <p className="text-sm text-gray-400 font-medium leading-relaxed">
            As per our staff guidelines, any complaint must be reviewed within
            48 hours. Please coordinate with the management if a hearing date is
            scheduled.
          </p>
        </div>
      </div>
    </StaffLayout>
  );
}
