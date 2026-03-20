import { getComplaintsByStaff } from "@/actions/complaintActions";
import { verifyStaffSession } from "@/actions";
import { getStaffProfileStats } from "@/actions/staffActions";
import { StaffLayout } from "@/components/layout/StaffLayout";
import { MobilePageHeader } from "@/components/layout";
import { formatDate } from "@/utils";
import { 
  ShieldAlert, 
  ArrowRight, 
  Calendar, 
  User,
  CheckCircle,
  AlertTriangle,
  History
} from "lucide-react";
import Link from "next/link";

export default async function StaffComplaintsPage() {
  const session = await verifyStaffSession();
  if (!session.isAuth) return null;

  const staffId = session.userId as string;
  const [complaintsRes, statsRes] = await Promise.all([
    getComplaintsByStaff(staffId, true), // fetch all complaints
    getStaffProfileStats(staffId),
  ]);

  const complaints = complaintsRes.success && complaintsRes.data ? complaintsRes.data : [];
  const stats = statsRes.success ? statsRes.data : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-red-600 bg-red-50 border-red-100";
      case "completed": return "text-emerald-600 bg-emerald-50 border-emerald-100";
      case "under_trial":
      case "processing":
      case "hearing": return "text-amber-600 bg-amber-50 border-amber-100";
      default: return "text-slate-600 bg-slate-50 border-slate-100";
    }
  };

  return (
    <StaffLayout balance={stats?.availableBalance || 0}>
      <MobilePageHeader title="Complaints" Icon={ShieldAlert} showBackButton={true} />
      
      <div className="p-4 sm:p-6 space-y-6 pb-24">
        {/* Summary Card */}
        <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <History size={80} />
          </div>
          <div className="relative z-10">
            <h2 className="text-xl font-black mb-1">Issue History</h2>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
              Total {complaints.length} Records Found
            </p>
          </div>
        </div>

        {/* Complaints List */}
        <div className="space-y-4">
          {complaints.length > 0 ? (
            complaints.map((complaint) => (
              <Link
                key={complaint.complaintId}
                href={`/staff/complaints/${complaint.complaintId}`}
                className="block group"
              >
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-brand/20 active:scale-[0.98]">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <User size={24} />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 leading-tight">
                          {complaint.customer?.name || "Customer"}
                        </h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          ID: {complaint.complaintId}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusColor(complaint.status)}`}>
                      {complaint.status.replace("_", " ")}
                    </div>
                  </div>

                  <div className="bg-slate-50/50 rounded-xl p-3 mb-4">
                    <p className="text-sm font-black text-slate-700 mb-1 line-clamp-1">
                      {complaint.subject}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {complaint.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar size={14} />
                      <span className="text-xs font-bold tracking-tight">
                        {formatDate(complaint.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-brand font-black text-xs uppercase tracking-widest">
                      Details
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="size-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-6">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">Clean Record</h3>
              <p className="text-sm text-slate-500 max-w-[240px]">
                You don't have any formal complaints filed against you currently.
              </p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex gap-4">
          <AlertTriangle className="text-amber-500 shrink-0" size={24} />
          <div>
            <h4 className="text-sm font-black text-amber-900 mb-1 uppercase tracking-tight">
              Action Required
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              If a complaint is in 'Hearing' state, please visit the main office on the scheduled date or call the administration.
            </p>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
