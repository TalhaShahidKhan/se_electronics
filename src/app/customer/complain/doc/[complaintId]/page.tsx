import { getComplaintById } from "@/actions/complaintActions";
import { verifyCustomerSession } from "@/actions/customerActions";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { formatDate } from "@/utils";

export default async function ComplaintDocPage({
  params,
}: {
  params: Promise<{ complaintId: string }>;
}) {
  const session = await verifyCustomerSession();
  if (!session.isAuth || !session.customer) return null;

  const { complaintId } = await params;
  const res = await getComplaintById(complaintId);
  if (!res.success || !res.data) notFound();

  const complaint = res.data;
  if (complaint.customerId !== session.customer.customerId) notFound();

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/customer/complain/history"
              className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-gray-900 flex items-center gap-2">
                <FileText className="text-rose-600" />
                Complaint Document
              </h1>
              <p className="text-xs text-gray-500 font-mono">#{complaint.complaintId}</p>
            </div>
          </div>

          <Link
            href={`/pdf/download?type=complaint&id=${complaint.complaintId}`}
            className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-black transition-all shadow-lg shadow-gray-200"
          >
            <Download size={16} />
            Download PDF
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-brand text-white px-5 sm:px-7 py-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">
              SE ELECTRONICS
            </p>
            <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
              Staff Complaint Report
            </h2>
          </div>

          <div className="p-5 sm:p-7 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Customer
                </p>
                <p className="font-bold text-gray-900">{complaint.customer?.name}</p>
                <p className="text-sm text-gray-700">
                  ID: <span className="font-mono">{complaint.customerId}</span>
                </p>
                <p className="text-sm text-gray-700">Phone: {complaint.customer?.phone}</p>
                <p className="text-sm text-gray-700">Address: {complaint.customer?.address}</p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Report info
                </p>
                <p className="text-sm text-gray-700">
                  Date: <span className="font-semibold">{formatDate(complaint.createdAt)}</span>
                </p>
                <p className="text-sm text-gray-700">
                  Status:{" "}
                  <span className="font-bold uppercase">
                    {complaint.status}
                  </span>
                </p>
                {complaint.serviceId && (
                  <p className="text-sm text-gray-700">
                    Service: <span className="font-mono">{complaint.serviceId}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 p-4 sm:p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                Reported staff
              </p>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-rose-700 italic">@{complaint.staff?.name}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">
                    {complaint.staff?.role}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  {complaint.staff?.phone}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 sm:p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 mb-2">
                Subject
              </p>
              <p className="text-lg font-extrabold text-gray-900">{complaint.subject}</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                Complaint details
              </p>
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {complaint.description}
              </p>
            </div>

            {complaint.adminNote && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">
                  Admin note
                </p>
                <p className="text-sm text-blue-900 leading-relaxed whitespace-pre-wrap font-medium">
                  {complaint.adminNote}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

