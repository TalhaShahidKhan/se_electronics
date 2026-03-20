import { getPaymentByNumber } from "@/actions/paymentActions";
import {
  getStaffProfileStats,
  verifyStaffSession,
} from "@/actions/staffActions";
import { InvoicePreviewButton } from "@/components/features/invoices";
import { StaffLayout } from "@/components/layout/StaffLayout";
import { PaymentDataType } from "@/types";
import { formatDate } from "@/utils";
import clsx from "clsx";
import {
  Briefcase,
  Building2,
  Calendar,
  ChevronLeft,
  CreditCard,
  Download,
  Eye,
  FileText,
  Hash,
  Smartphone,
  User,
  Activity,
  PhoneCall,
} from "lucide-react";
import Link from "next/link";
import { MobilePageHeader } from "@/components/layout";
import { notFound } from "next/navigation";

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
      <MobilePageHeader
        title="Invoice Details"
        backHref="/staff/payment"
        Icon={FileText}
      />

      {/* ─────────────── DESKTOP VIEW ─────────────── */}
      <div className="hidden lg:block">
        <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-8">
          {/* Header & Back Button */}
          <div className="flex items-center justify-between">
            <Link
              href="/staff/payment"
              className="flex items-center gap-2 text-gray-500 hover:text-brand font-black text-sm uppercase tracking-widest transition-colors group"
            >
              <div className="size-8 rounded-md bg-gray-100 flex items-center justify-center group-hover:bg-brand/10 transition-colors">
                <ChevronLeft size={18} />
              </div>
              Back to Payments
            </Link>
            <div
              className={clsx(
                "px-4 py-2 rounded-md text-sm font-black uppercase tracking-[0.2em] shadow-sm border",
                payment.status === "completed"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : payment.status === "processing"
                    ? "bg-blue-50 text-blue-700 border-blue-100"
                    : payment.status === "rejected"
                      ? "bg-rose-50 text-rose-700 border-rose-100"
                      : "bg-amber-50 text-amber-700 border-amber-100",
              )}
            >
              {payment.status}
            </div>
          </div>

          {/* Invoice Web View Card */}
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-brand p-8 sm:p-12 text-white relative overflow-hidden">
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center px-3 py-1 rounded-md bg-white/10 text-white/90 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
                    Official Receipt
                  </div>
                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
                    Invoice Details
                  </h1>
                  <p className="text-white/60 font-bold uppercase tracking-widest text-sm">
                    #{payment.invoiceNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                    Amount Paid
                  </p>
                  <div className="flex items-baseline justify-end gap-2">
                    <span className="text-xl font-black text-white/60">৳</span>
                    <span className="text-4xl sm:text-6xl font-black">
                      {payment.amount?.toLocaleString()}
                    </span>
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
                    <Calendar size={12} />
                    Payment Date
                  </p>
                  <p className="text-base font-black text-gray-900">
                    {formatDate(payment.date || payment.createdAt!)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <CreditCard size={12} />
                    Payment Method
                  </p>
                  <p className="text-base font-black text-brand uppercase">
                    {payment.paymentMethod}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Hash size={12} />
                    Transaction ID
                  </p>
                  <p className="text-base font-black text-gray-900 truncate">
                    {payment.transactionId || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Briefcase size={12} />
                    Service ID
                  </p>
                  {payment.serviceId ? (
                    <Link
                      href={`/service-track?trackingId=${payment.serviceId}`}
                      className="text-base font-black text-brand hover:underline"
                    >
                      #{payment.serviceId}
                    </Link>
                  ) : (
                    <p className="text-base font-black text-gray-900">N/A</p>
                  )}
                </div>
              </div>

              <div className="h-px bg-gray-100 w-full"></div>

              {/* Account Details Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Receiver (Staff) Details */}
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.25em] flex items-center gap-2">
                    <User size={14} className="text-brand" />
                    Recipient Account
                  </h3>
                  <div className="bg-gray-50 rounded-3xl p-6 space-y-4 border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-md bg-white flex items-center justify-center text-brand shadow-sm">
                        <Briefcase size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                          Staff Name
                        </p>
                        <p className="text-sm font-black text-gray-900">
                          {String(session.username)}
                        </p>
                      </div>
                    </div>
                    {payment.paymentMethod === "bank" ? (
                      <div className="space-y-3 pt-2">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                            Bank Name
                          </p>
                          <p className="text-sm font-bold text-gray-700">
                            {payment.receiverBankInfo?.bankName}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                            Account Number
                          </p>
                          <p className="text-sm font-bold text-gray-700">
                            {payment.receiverBankInfo?.accountNumber}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                          Wallet Number
                        </p>
                        <p className="text-sm font-bold text-gray-700">
                          {payment.receiverWalletNumber || "N/A"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sender (Company) Details */}
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.25em] flex items-center gap-2 text-right justify-end">
                    Sender Details
                    <Building2 size={14} className="text-brand" />
                  </h3>
                  <div className="bg-gray-50 rounded-3xl p-6 space-y-4 border border-gray-100">
                    <div className="flex items-center gap-4 justify-end text-right">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                          Company
                        </p>
                        <p className="text-sm font-black text-gray-900">
                          SE ELECTRONICS
                        </p>
                      </div>
                      <div className="size-12 rounded-md bg-white flex items-center justify-center text-brand shadow-sm">
                        <Smartphone size={20} />
                      </div>
                    </div>
                    {payment.paymentMethod === "bank" ? (
                      <div className="space-y-3 pt-2 text-right">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                            Bank Name
                          </p>
                          <p className="text-sm font-bold text-gray-700">
                            {payment.senderBankInfo?.bankName ||
                              "Corporate Bank"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                            Account Number
                          </p>
                          <p className="text-sm font-bold text-gray-700">
                            {payment.senderBankInfo?.accountNumber ||
                              "********4590"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                          Sender Number
                        </p>
                        <p className="text-sm font-bold text-gray-700">
                          {payment.senderWalletNumber || "N/A"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Information (New) */}
                {payment.service && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.25em] flex items-center gap-2">
                      <User size={14} className="text-brand" />
                      Customer Information
                    </h3>
                    <div className="bg-brand/5 rounded-3xl p-6 space-y-4 border border-brand/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                            Name
                          </p>
                          <p className="text-sm font-black text-gray-900">
                            {payment.service.customerName}
                          </p>
                        </div>
                        <Link
                          href={`/staff/customers/${payment.service.customerId}`}
                          className="px-4 py-2 bg-white rounded-md text-[10px] font-black text-brand uppercase tracking-tighter border border-brand/20 shadow-sm hover:bg-brand hover:text-white transition-all"
                        >
                          View Profile
                        </Link>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                          Phone
                        </p>
                        <p className="text-sm font-bold text-gray-700">
                          {payment.service.customerPhone}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                          Address
                        </p>
                        <p className="text-sm font-bold text-gray-700 leading-tight">
                          {payment.service.customerAddress}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Service Information (New) */}
                {payment.service && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.25em] flex items-center gap-2 text-right justify-end">
                      Service details
                      <Activity size={14} className="text-brand" />
                    </h3>
                    <div className="bg-gray-50 rounded-3xl p-6 space-y-4 border border-gray-100 text-right">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                          Type
                        </p>
                        <p className="text-sm font-black text-brand uppercase">
                          {payment.service.type}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                          Product
                        </p>
                        <p className="text-sm font-bold text-gray-700">
                          {payment.service.productType} •{" "}
                          {payment.service.productModel}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                          Status
                        </p>
                        <p className="text-sm font-black text-gray-900 uppercase">
                          {payment.service.isActive ? "Active" : "Closed"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {payment.description && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.25em]">
                    Description / Task
                  </h3>
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
      </div>

      {/* ─────────────── MOBILE VIEW (Steadfast-style) ─────────────── */}
      <div className="lg:hidden bg-gray-100 min-h-screen pb-24 space-y-3 p-3">
        {/* ── Invoice Header Block ── */}
        <div className="bg-white rounded-md p-4 shadow-sm">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
            INVOICE
          </p>
          <div className="flex items-center justify-between mb-2">
            <p className="font-black text-gray-900 text-base">
              {payment.invoiceNumber}
            </p>
            <span
              className={clsx(
                "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm border",
                payment.status === "completed"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : payment.status === "processing"
                    ? "bg-blue-50 text-blue-700 border-blue-100"
                    : payment.status === "rejected"
                      ? "bg-rose-50 text-rose-700 border-rose-100"
                      : "bg-amber-50 text-amber-700 border-amber-100",
              )}
            >
              {payment.status}
            </span>
          </div>
          <p className="text-sm text-gray-400 font-bold">
            {formatDate(payment.date || payment.createdAt!)}
          </p>
        </div>

        {/* ── Payment Information Block ── */}
        <div className="bg-white rounded-md p-5 shadow-sm">
          <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard size={16} className="text-brand" />
            Payment Information
          </h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 font-bold">Amount Delivered</span>
              <span className="font-black text-gray-900">
                ৳{(payment.amount + 190 + 34).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 font-bold">Due Bills</span>
              <span className="font-black text-rose-500">-৳190</span>
            </div>

            <div className="flex items-center justify-between text-sm border-t border-gray-50 pt-2">
              <span className="text-gray-500 font-bold">Sub-Total</span>
              <span className="font-black text-gray-900">
                ৳{(payment.amount + 34).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 font-bold">COD Charge & Fees</span>
              <span className="font-black text-rose-500">-৳34</span>
            </div>
            <div className="border-t border-dashed border-gray-400 my-4"></div>
            {/* Final Total */}
            <div className="border-t border-dashed border-gray-200  " />
            <div className="flex items-center justify-between">
              {String(session.username)}
              <span className="text-sm font-black text-gray-900">
                Total Settlement
              </span>
              <span className="text-xl font-black text-brand">
                ৳{payment.amount?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* ── Recipient Information (Customer) ── */}
        {payment.service && (
          <div className="bg-white rounded-md p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-brand/5 rounded-full -mr-8 -mt-8 grayscale" />
            <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
              <User size={16} className="text-brand" />
              Customer Information
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-base font-black text-gray-900 mb-1">
                  {payment.service.customerName}
                </p>
                <p className="text-sm text-gray-500 font-bold leading-relaxed">
                  {payment.service.customerAddress},{" "}
                  {payment.service.customerAddressDistrict}
                </p>
                <p className="text-sm text-brand font-black mt-1">
                  {payment.service.customerPhone}
                </p>
              </div>

              <div className="pt-2 border-t border-gray-50 flex gap-3">
                <Link
                  href={`/staff/customers/${payment.service.customerId}`}
                  className="flex-1 text-center py-2.5 rounded-md bg-gray-50 text-gray-600 font-black text-[10px] uppercase tracking-widest border border-gray-100 hover:bg-brand/5 hover:text-brand hover:border-brand/20 transition-all active:scale-95"
                >
                  View Profile
                </Link>
                <Link
                  href={`tel:${payment.service.customerPhone}`}
                  className="p-2.5 rounded-md bg-brand text-white shadow-lg shadow-brand/20 active:scale-95"
                >
                  <PhoneCall size={16} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Recipient (Staff) Info ── */}
        <div className="bg-white rounded-md p-5 shadow-sm border border-gray-400 md:border-none">
          <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
            {/* <Briefcase size={16} className="text-brand" /> */}
            Recipient Information
          </h3>
          <p className="font-black text-gray-900 text-base">
            {String(session.username)}
          </p>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-tighter mt-1">
            Staff Member • {payment.paymentMethod}
          </p>

          {payment.paymentMethod === "bank" ? (
            <div className="mt-3  bg-gray-50 rounded-md border border-gray-100">
              <p className="text-sm font-black text-gray-400 uppercase mb-1">
                Bank Account
              </p>
              <p className="text-sm font-bold text-gray-700">
                {payment.receiverBankInfo?.bankName}
              </p>
              <p className="text-sm font-black text-gray-900">
                {payment.receiverBankInfo?.accountNumber}
              </p>
            </div>
          ) : (
            <div>
              <div className=" flex justify-start gap-2 items-center  bg-gray-50 rounded-md border border-gray-100">
                <p className="text-sm font-black text-gray-400 uppercase mb-1">
                  Wallet Number
                </p>
                <p className="text-sm font-black text-gray-900">
                  {payment.receiverWalletNumber || "N/A"}
                </p>
              </div>
              <div className="flex justify-start gap-2 items-center  bg-gray-50 rounded-md border border-gray-100">
                <p className="text-sm font-black text-gray-400 uppercase ">
                  Amount
                </p>
                <p className="text-sm font-black text-gray-500">
                  {payment.amount || "N/A"}
                </p>
              </div>
              <div className="flex justify-start gap-2 items-center  bg-gray-50 rounded-md border border-gray-100">
                <p className="text-sm font-black text-gray-400 uppercase ">
                  Trx Id :
                </p>
                <p className="text-sm font-black text-gray-500">
                  {payment.transactionId || "N/A"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Service Information Block ── */}
        {payment.service && (
          <div className="bg-white rounded-md p-5 shadow-sm border-l-4 border-brand ">
            <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
              <Activity size={16} className="text-brand" />
              Service details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 font-bold uppercase tracking-widest">
                  Service Type
                </span>
                <span className=" font-black uppercase text-brand">
                  {payment.service.type}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 font-bold uppercase tracking-widest">
                  Product
                </span>
                <span className="text-gray-900 font-black text-right">
                  {payment.service.productType} • {payment.service.productModel}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 font-bold uppercase tracking-widest">
                  Tracking ID
                </span>
                <Link
                  href={`/service-track?trackingId=${payment.service.serviceId}`}
                  className="text-brand font-black underline"
                >
                  #{payment.service.serviceId.substring(0, 12)}...
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Sender Information Block ── */}
        <div className="bg-white rounded-md md:border-none border border-gray-500 p-5 shadow-sm opacity-75">
          <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
            {/* <Building2 size={16} /> */}
            Sender Information
          </h3>
          <div className="flex justify-start gap-3 items-center">
            <p className="font-black text-gray-800 text-sm">SE ELECTRONICS</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-0.5">
              Corporate Office
            </p>
          </div>

          {payment.paymentMethod === "bank" ? (
            <div className="mt-3 text-sm space-y-0.5 font-bold text-gray-500">
              <p>{payment.senderBankInfo?.bankName || "Corporate Bank"}</p>
              <p>{payment.senderBankInfo?.accountNumber || "********4590"}</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-bold text-gray-500 mt-2">
                Merchant: {payment.senderWalletNumber || "N/A"}
              </p>
              <p className="text-sm font-bold text-gray-500 mt-2">
                Payment Method: {payment.paymentMethod || "N/A"}
              </p>
              <p className="text-sm font-bold text-gray-500 mt-2">
                Trx ID: {payment.transactionId || "N/A"}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-md md:border-none border border-gray-500 p-5 shadow-sm opacity-75">
          <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
            {/* <Building2 size={16} /> */}
            Service Information
          </h3>

          {payment.paymentMethod === "bank" ? (
            <div className="mt-3 text-sm space-y-0.5 font-bold text-gray-500">
              <p>{payment.senderBankInfo?.bankName || "Corporate Bank"}</p>
              <p>{payment.senderBankInfo?.accountNumber || "********4590"}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Service ID + Status */}
              <div className="flex justify-between items-center">
                <p className="text-sm font-bold text-gray-500">
                  Service Id: {payment.serviceId || "N/A"}
                </p>

                <div
                  className={clsx(
                    "px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border",
                    payment.status === "completed"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : payment.status === "processing"
                        ? "bg-blue-50 text-blue-700 border-blue-100"
                        : payment.status === "rejected"
                          ? "bg-rose-50 text-rose-700 border-rose-100"
                          : "bg-amber-50 text-amber-700 border-amber-100",
                  )}
                >
                  {payment.status}
                </div>
              </div>

              {/* Customer + COD */}
              <div className="flex justify-between">
                <p className="text-sm font-bold text-gray-500">
                  Customer: {String(session.username)}
                </p>

                <span className="text-sm font-bold text-gray-500">
                  COD: {payment.amount?.toLocaleString()}
                </span>
              </div>

              {/* Date */}
              <p className="text-sm font-bold text-gray-500">
                Date:{" "}
                <span>{formatDate(payment.date || payment.createdAt!)}</span>
              </p>
            </div>
          )}
        </div>

        {/* createdAt: Date;
    updatedAt: Date;
    id: string;
    date: Date;
    paymentId: string;
    invoiceNumber: string;
    paymentMethod: PaymentTypes;
    senderWalletNumber: string | null;
    receiverWalletNumber: string | null;
    transactionId: string | null;
    amount: number;
    serviceId?: string | null;
    description: string | null;
    staffId: string;
    status: Statuses;
    statusHistory?: {
        customNote: string | null;
        customLabel: string | null;
        cancelReason: string | null;
        id: string;
        status: Statuses;
        statusType: "system" | "custom";
    }[];
    staff?: StaffsType;
    service?: ServicesType | null;
    senderBankInfo: BankInfo | null;
    receiverBankInfo: BankInfo | null;
} */}
        {/* ====================================================== */}

        {/* ── Action Buttons ── */}
        <div className="pt-4 grid grid-cols-2 gap-3">
          <InvoicePreviewButton
            paymentData={payment}
            className="flex items-center justify-center gap-2 bg-white text-gray-900 py-4 rounded-md text-sm font-black border border-gray-200 shadow-sm active:scale-95"
          >
            <Eye size={16} />
            Preview
          </InvoicePreviewButton>
          {payment.status === "completed" && (
            <a
              target="_blank"
              href={`/pdf/download?type=payment&id=${payment.invoiceNumber}`}
              className="flex items-center justify-center gap-2 bg-brand text-white py-4 rounded-md text-sm font-black shadow-lg shadow-brand/20 active:scale-95"
            >
              <Download size={16} />
              Download
            </a>
          )}
        </div>
      </div>
    </StaffLayout>
  );
}
