import { getPaymentByNumber } from "@/actions/paymentActions";
import { getStaffProfileStats, verifyStaffSession } from "@/actions/staffActions";
import { StaffLayout } from "@/components/layout/StaffLayout";
import { ChevronLeft, Download, Eye, FileText, Calendar, CreditCard, Hash, User, Briefcase, Building2, Smartphone } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { formatDate } from "@/utils";
import { InvoicePreviewButton } from "@/components/features/invoices";
import { BankInfo, PaymentDataType } from "@/types";

export default async function StaffInvoiceDetailsPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const session = await verifyStaffSession();
  if (!session.isAuth) return null;

  const { invoiceId } = await params;
  const [paymentRes, statsRes] = await Promise.all([
    getPaymentByNumber(invoiceId),
    getStaffProfileStats(session.userId as string),
  ]);

  if (!paymentRes.success || !paymentRes.data) {
    notFound();
  }

  const payment = paymentRes.data as PaymentDataType;
  const stats = statsRes.success ? statsRes.data : null;

  // Security check: Ensure staff can only view their own invoices
  if (payment.staffId !== session.userId) {
    notFound();
  }

  return (
    <StaffLayout balance={stats?.availableBalance || 0}>
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-8">
        {/* Header & Back Button */}
        <div className="flex items-center justify-between">
          <Link
            href="/staff/payment"
            className="flex items-center gap-2 text-gray-500 hover:text-brand font-black text-sm uppercase tracking-widest transition-colors group"
          >
            <div className="size-8 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-brand/10 transition-colors">
              <ChevronLeft size={18} />
            </div>
            Back to Payments
          </Link>
          <div className={clsx(
            "px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-sm border",
            payment.status === "completed"
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : payment.status === "processing"
                ? "bg-blue-50 text-blue-700 border-blue-100"
                : payment.status === "rejected"
                  ? "bg-rose-50 text-rose-700 border-rose-100"
                  : "bg-amber-50 text-amber-700 border-amber-100"
          )}>
            {payment.status}
          </div>
        </div>

        {/* Invoice Web View Card */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-brand p-8 sm:p-12 text-white relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center px-3 py-1 rounded-lg bg-white/10 text-white/90 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
                  Official Receipt
                </div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight">Invoice Details</h1>
                <p className="text-white/60 font-bold uppercase tracking-widest text-sm">
                  #{payment.invoiceNumber}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Amount Paid</p>
                <div className="flex items-baseline justify-end gap-2">
                  <span className="text-xl font-black text-white/60">৳</span>
                  <span className="text-4xl sm:text-6xl font-black">{payment.amount?.toLocaleString()}</span>
                </div>
              </div>
            </div>
            {/* Abstract bg icon */}
            <FileText className="absolute -right-8 -bottom-8 size-64 text-white/5" />
          </div>

          <div className="p-8 sm:p-12 space-y-10">
            {/* Payment Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={12} /> Payment Date
                </p>
                <p className="text-base font-black text-gray-900">
                  {formatDate(payment.date || payment.createdAt!)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <CreditCard size={12} /> Payment Method
                </p>
                <p className="text-base font-black text-brand uppercase">
                  {payment.paymentMethod}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Hash size={12} /> Transaction ID
                </p>
                <p className="text-base font-black text-gray-900 truncate">
                  {payment.transactionId || "N/A"}
                </p>
              </div>
            </div>

            <div className="h-px bg-gray-100 w-full"></div>

            {/* Account Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Receiver (Staff) Details */}
              <div className="space-y-6">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.25em] flex items-center gap-2">
                  <User size={14} className="text-brand" /> Recipient Account
                </h3>
                <div className="bg-gray-50 rounded-3xl p-6 space-y-4 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-white flex items-center justify-center text-brand shadow-sm">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Staff Name</p>
                      <p className="text-sm font-black text-gray-900">{String(session.username)}</p>
                    </div>
                  </div>
                  
                  {payment.paymentMethod === 'bank' ? (
                    <div className="space-y-3 pt-2">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Bank Name</p>
                        <p className="text-sm font-bold text-gray-700">{payment.receiverBankInfo?.bankName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Account Number</p>
                        <p className="text-sm font-bold text-gray-700">{payment.receiverBankInfo?.accountNumber}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Wallet Number</p>
                      <p className="text-sm font-bold text-gray-700">{payment.receiverWalletNumber || "N/A"}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sender (Company) Details */}
              <div className="space-y-6">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.25em] flex items-center gap-2 text-right justify-end">
                  Sender Details <Building2 size={14} className="text-brand" />
                </h3>
                <div className="bg-gray-50 rounded-3xl p-6 space-y-4 border border-gray-100">
                  <div className="flex items-center gap-4 justify-end text-right">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Company</p>
                      <p className="text-sm font-black text-gray-900">SE ELECTRONICS</p>
                    </div>
                    <div className="size-12 rounded-2xl bg-white flex items-center justify-center text-brand shadow-sm">
                      <Smartphone size={20} />
                    </div>
                  </div>

                  {payment.paymentMethod === 'bank' ? (
                    <div className="space-y-3 pt-2 text-right">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Bank Name</p>
                        <p className="text-sm font-bold text-gray-700">{payment.senderBankInfo?.bankName || "Corporate Bank"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Account Number</p>
                        <p className="text-sm font-bold text-gray-700">{payment.senderBankInfo?.accountNumber || "********4590"}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Sender Number</p>
                      <p className="text-sm font-bold text-gray-700">{payment.senderWalletNumber || "N/A"}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {payment.description && (
              <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.25em]">Description / Task</h3>
                <div className="bg-brand/5 rounded-3xl p-6 border border-brand/10">
                  <p className="text-sm text-gray-700 font-medium italic leading-relaxed">
                    &ldquo;{payment.description}&rdquo;
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="bg-gray-50 p-8 sm:p-12 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-4">
            <InvoicePreviewButton 
              paymentData={payment}
              className="w-full sm:flex-1 flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 py-5 rounded-[1.5rem] text-sm font-black transition-all shadow-sm border border-gray-200 active:scale-[0.98]"
            >
              <Eye size={20} />
              <span>Preview PDF Invoice</span>
            </InvoicePreviewButton>
            
            {payment.status === "completed" && (
              <a
                target="_blank"
                href={`/pdf/download?type=payment&id=${payment.invoiceNumber}`}
                className="w-full sm:flex-1 flex items-center justify-center gap-3 bg-brand hover:bg-brand-800 text-white py-5 rounded-[1.5rem] text-sm font-black transition-all shadow-xl shadow-brand/20 active:scale-[0.98]"
              >
                <Download size={20} />
                <span>Download PDF Invoice</span>
              </a>
            )}
          </div>
        </div>

        <p className="text-center text-[10px] text-gray-400 font-black uppercase tracking-widest">
          © SEIPSBD - Official Digital Receipt
        </p>
      </div>
    </StaffLayout>
  );
}
