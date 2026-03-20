import { verifyCustomerSession } from "@/actions/customerActions";
import { getComplaintsByCustomer } from "@/actions/complaintActions";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileText,
  Clock,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "@/utils";
import { MobilePageHeader } from "@/components/layout";

export default async function ComplaintHistoryPage() {
  const session = await verifyCustomerSession();
  if (!session.isAuth || !session.customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 text-center">
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Please log in to view your complaints
          </h2>
          <Link
            href="/customer/login"
            className="bg-brand text-white font-bold py-3 px-6 rounded-md"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  const res = await getComplaintsByCustomer(session.customer.customerId);
  const complaints = res.success ? res.data || [] : [];

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-3">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/customer/profile"
              className="p-1 bg-white rounded-md shadow-sm border border-gray-100 hover:bg-gray-50 transition-all"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </Link>
            <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
              My Complaints
              <span className="text-sm font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full uppercase tracking-widest">
                {complaints.length}
              </span>
            </h1>
          </div>
          <Link
            href="/customer/complain"
            className="bg-brand text-white text-xs px-3 py-2 rounded-md font-bold  shadow-md shadow-brand/20 hover:scale-105 transition-all"
          >
            File New Complaint
          </Link>
        </div>

        <div className="space-y-4">
          {complaints.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-gray-300" size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                No complaints filed
              </h3>
              <p className="text-gray-500 text-sm">
                When you file a complaint about staff, it will appear here.
              </p>
            </div>
          ) : (
            complaints.map((c: any) => (
              <div
                key={c.id}
                className="bg-white rounded-md p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group hover:shadow-md hover:border-brand/20 transition-all"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 font-mono">
                      #{c.complaintId}
                    </span>
                    <div
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${c.status === "completed" ? "bg-emerald-100 text-emerald-700" : c.status === "hearing" ? "bg-amber-100 text-amber-700" : c.status === "processing" ? "bg-blue-100 text-blue-700" : "bg-rose-100 text-rose-700"}`}
                    >
                      {c.status.replace("_", " ")}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand transition-colors">
                    {c.subject}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatDate(c.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={14} className="text-rose-400" />
                      Against:{" "}
                      <span className="text-gray-900 font-bold">
                        {c.staff?.name}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex gap-2">
                  <Link
                    href={`/customer/complain/doc/${c.complaintId}`}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-gray-800 px-5 py-3 rounded-md font-bold text-sm border border-gray-200 hover:bg-gray-50 transition-all"
                  >
                    <ExternalLink size={18} />
                    View Doc
                  </Link>
                  <Link
                    href={`/pdf/download?type=complaint&id=${c.complaintId}`}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-md font-bold text-sm hover:bg-black transition-all shadow-lg shadow-gray-200"
                  >
                    <Download size={18} />
                    Download PDF
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
