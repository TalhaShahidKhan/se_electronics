import { getComplaintById } from "@/actions/complaintActions";
import { verifyCustomerSession } from "@/actions/customerActions";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, CheckCircle, Clock, ShieldAlert } from "lucide-react";
import { MobilePageHeader } from "@/components/layout";
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

  // Progress Tracker Logic
  const isProcessing =
    complaint.status === "processing" ||
    complaint.status === "hearing" ||
    complaint.status === "completed";
  const isHearing =
    complaint.status === "hearing" || complaint.status === "completed";
  const isCompleted = complaint.status === "completed";

  const getProgressWidth = () => {
    if (isCompleted) return "100%";
    if (isHearing) return "66.66%";
    if (isProcessing) return "33.33%";
    return "0%";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MobilePageHeader 
        title="Document View" 
        backHref="/customer/complain" 
        Icon={ShieldAlert}
      />

      <div className="py-6 px-3 sm:px-4 flex justify-center flex-1">
        <div className="w-full max-w-5xl">
          <div className="hidden md:flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <Link
            href="/customer/complain"
            className="flex items-center gap-2 text-brand hover:text-brand/80 font-bold transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
          <div className="text-center">
            <h1 className="text-lg font-black text-gray-900 border-b-2 border-brand/20 inline-block pb-1">
              অভিযোগ পত্র (Complaint Document)
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              href={`/pdf/download?type=complaint&id=${complaint.complaintId}`}
              className="inline-flex items-center justify-center gap-2 bg-brand text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md transition-all hover:bg-brand/90"
            >
              <Download size={16} />
              Complaint Doc
            </Link>
            {isHearing && (
              <Link
                href={`/pdf/download?type=hearing-notice&id=${complaint.complaintId}`}
                className="inline-flex items-center justify-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md transition-all hover:bg-amber-700"
              >
                <Download size={16} />
                Hearing Notice
              </Link>
            )}
            {isCompleted && (
              <Link
                href={`/pdf/download?type=completion-notice&id=${complaint.complaintId}`}
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md transition-all hover:bg-emerald-700"
              >
                <Download size={16} />
                Resolution Letter
              </Link>
            )}
          </div>
        </div>

        {/* APPLICATION STATUS TRACKER - VERTICAL ENGLISH UI */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 mb-10 p-8 sm:p-12">
          <h3 className="text-center font-black text-gray-900 uppercase tracking-[0.2em] text-lg mb-12">
            Status of Application
          </h3>

          <div className="max-w-md mx-auto relative px-4">
            {/* Vertical Line Connecting Dots */}
            <div className="absolute left-[39px] top-4 bottom-4 w-0.5 bg-emerald-100 hidden sm:block"></div>

            <div className="space-y-12">
              {/* Step 1: Pending */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 relative group">
                <div
                  className={`z-10 size-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-all bg-white ${isProcessing || complaint.status === "under_trial" ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "border-gray-200"}`}
                >
                  <CheckCircle
                    size={20}
                    className={
                      isProcessing || complaint.status === "under_trial"
                        ? "text-emerald-500"
                        : "text-gray-200"
                    }
                  />
                </div>

                <div className="flex-1 flex items-center gap-4 w-full">
                  <div className="h-0.5 w-12 bg-emerald-100 hidden sm:block"></div>
                  <div className="flex-1 bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 group-hover:bg-emerald-50 transition-colors">
                    <h4 className="font-bold text-emerald-800 text-sm uppercase tracking-widest mb-1">
                      Pending
                    </h4>
                    <p className="text-[10px] font-bold text-emerald-600/60 uppercase mb-1">
                      Application Date
                    </p>
                    <p className="text-sm font-black text-emerald-700">
                      {formatDate(complaint.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2: Processing */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 relative group">
                <div
                  className={`z-10 size-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-all bg-white ${isProcessing ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "border-gray-200"}`}
                >
                  <CheckCircle
                    size={20}
                    className={
                      isProcessing ? "text-emerald-500" : "text-gray-200"
                    }
                  />
                </div>

                <div className="flex-1 flex items-center gap-4 w-full">
                  <div
                    className={`h-0.5 w-12 hidden sm:block ${isProcessing ? "bg-emerald-100" : "bg-gray-100"}`}
                  ></div>
                  <div
                    className={`flex-1 border rounded-2xl p-5 transition-all ${isProcessing ? "bg-emerald-50/50 border-emerald-100 group-hover:bg-emerald-50" : "bg-gray-50 border-gray-100 opacity-60"}`}
                  >
                    <h4
                      className={`font-bold text-sm uppercase tracking-widest mb-1 ${isProcessing ? "text-emerald-800" : "text-gray-400"}`}
                    >
                      Processing
                    </h4>
                    <p
                      className={`text-[10px] font-bold uppercase mb-1 ${isProcessing ? "text-emerald-600/60" : "text-gray-400"}`}
                    >
                      Receiving Date
                    </p>
                    <p
                      className={`text-sm font-black ${isProcessing ? "text-emerald-700" : "text-gray-300"}`}
                    >
                      {isProcessing
                        ? formatDate(complaint.updatedAt)
                        : "Awaiting..."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3: Hearing */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 relative group">
                <div
                  className={`z-10 size-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-all bg-white ${isHearing ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "border-gray-200"}`}
                >
                  <CheckCircle
                    size={20}
                    className={isHearing ? "text-emerald-500" : "text-gray-200"}
                  />
                </div>

                <div className="flex-1 flex items-center gap-4 w-full">
                  <div
                    className={`h-0.5 w-12 hidden sm:block ${isHearing ? "bg-emerald-100" : "bg-gray-100"}`}
                  ></div>
                  <div
                    className={`flex-1 border rounded-2xl p-5 transition-all ${isHearing ? "bg-emerald-50/50 border-emerald-100 group-hover:bg-emerald-50" : "bg-gray-50 border-gray-100 opacity-60"}`}
                  >
                    <h4
                      className={`font-bold text-sm uppercase tracking-widest mb-1 ${isHearing ? "text-emerald-800" : "text-gray-400"}`}
                    >
                      Hearing
                    </h4>
                    <p
                      className={`text-[10px] font-bold uppercase mb-1 ${isHearing ? "text-emerald-600/60" : "text-gray-400"}`}
                    >
                      Hearing Date
                    </p>
                    <p
                      className={`text-sm font-black ${isHearing ? "text-emerald-700" : "text-gray-300"}`}
                    >
                      {isHearing ? formatDate(complaint.updatedAt) : "Planned"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4: Completed */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 relative group">
                <div
                  className={`z-10 size-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-all bg-white ${isCompleted ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "border-gray-200"}`}
                >
                  <CheckCircle
                    size={20}
                    className={
                      isCompleted ? "text-emerald-500" : "text-gray-200"
                    }
                  />
                </div>

                <div className="flex-1 flex flex-col items-center w-full">
                  <div
                    className={`h-0.5 w-12 mb-4 self-start hidden sm:block ${isCompleted ? "bg-emerald-100" : "bg-gray-100"}`}
                  ></div>
                  <div
                    className={`w-full border rounded-2xl p-6 transition-all text-center ${isCompleted ? "bg-emerald-600 text-white shadow-xl shadow-emerald-200" : "bg-gray-50 border-gray-100 opacity-60"}`}
                  >
                    <h4
                      className={`font-black uppercase tracking-[0.2em] mb-1 ${isCompleted ? "text-white" : "text-gray-400"}`}
                    >
                      Settled
                    </h4>
                    <p
                      className={`text-[10px] font-bold uppercase mb-2 ${isCompleted ? "text-white/70" : "text-gray-400"}`}
                    >
                      Final Review Date
                    </p>
                    <p
                      className={`text-sm font-black ${isCompleted ? "text-white" : "text-gray-300"}`}
                    >
                      {isCompleted
                        ? formatDate(complaint.updatedAt)
                        : "Processing..."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {(isHearing || isCompleted) && complaint.adminNote && (
            <div className="mt-12 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex flex-col items-center text-center">
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-3">
                {isCompleted
                  ? "Executive Resolution Summary"
                  : "Officer's Hearing Notice"}
              </p>
              <p className="text-sm font-bold text-amber-900 leading-relaxed max-w-2xl italic">
                &ldquo;{complaint.adminNote}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* OFFICIAL BENGALI DOCUMENT SECTION */}
        <div className="bg-white rounded-sm pt-12 pb-20 px-10 sm:px-16 md:px-24 mb-10 text-black font-serif shadow-sm border border-gray-300 print:shadow-none print:border-none min-h-[1056px] relative mx-auto w-full max-w-[800px] text-sm md:text-base leading-relaxed">
          <div className="mb-8">
            <p>বরাবর,</p>
            <p className="font-bold">এস ই ইলেকট্রনিক্স</p>
            <p>মহাপরিচালক / চেয়ারম্যান,</p>
            <p>বাদাম বাগিচা সিলেট সদর ৩১০০।</p>
          </div>

          <div className="mb-8">
            <p>
              <span className="font-bold">বিষয়ঃ- অভিযোগ দায়ের।</span>
            </p>
          </div>

          <div className="mb-6 space-y-1">
            <p className="font-bold underline underline-offset-4 mb-2">
              অভিযোগকারীর কাস্টমার বিবরণঃ
            </p>
            <p>
              <span className="font-semibold">নামঃ</span>{" "}
              {complaint.customer?.name}
            </p>
            <p>
              <span className="font-semibold">পিতাঃ</span> প্রদত্ত নয় (Not
              Provided)
            </p>
            <p>
              <span className="font-semibold">ঠিকানাঃ</span>{" "}
              {complaint.customer?.address}
            </p>
            <p>
              <span className="font-semibold">মোবাইল নম্বরঃ</span>{" "}
              <span className="font-mono">{complaint.customer?.phone}</span>
            </p>
          </div>

          <div className="mb-8 space-y-1">
            <p className="font-bold underline underline-offset-4 mb-2">
              টেকনিশিয়ান অভিযুক্তের বিবরণঃ
            </p>
            <p>
              <span className="font-semibold">টেকনিশিয়ান নামঃ</span>{" "}
              {complaint.staff?.name}
            </p>
            <p>
              <span className="font-semibold">ঠিকানাঃ</span>{" "}
              {complaint.staff?.currentStreetAddress},{" "}
              {complaint.staff?.currentDistrict}
            </p>
            <p>
              <span className="font-semibold">টেকনিশিয়ান আইডি নংঃ-</span>{" "}
              <span className="font-mono font-bold">
                {"{"}
                {complaint.staffId}
                {"}"}
              </span>
            </p>
            <p>
              <span className="font-semibold">ফোন নম্বরঃ</span>{" "}
              <span className="font-mono">{complaint.staff?.phone}</span>
            </p>
          </div>

          <div className="mb-8">
            <p className="font-bold mb-2">ঘটনার বিস্তারিত বিবরণঃ</p>
            <p className="text-justify leading-loose tracking-wide whitespace-pre-wrap">
              আমি নিম্ন স্বাক্ষর কারী {"{"} {complaint.customer?.name} {"}"}{" "}
              আপনার একজন কাস্টমার। {complaint.subject} - এই বিষয়ের ভিত্তিতে আমি
              এই অভিযোগ দায়ের করছি।
              <br />
              <br />
              {complaint.description}
              <br />
              <br />
              এমতবস্থায় টেকনিশিয়ান নামঃ {complaint.staff?.name} এর জন্য আপনাদের
              স্বনামধন্য কোম্পানী এস ই ইলেকট্রনিক্স এর সম্মান ক্ষুন্ন হয়েছে। ও
              আমি তাহার এই আচরণের জন্য এস ই ইলেকট্রনিক্স এর মহাপরিচালক /
              চেয়ারম্যান, এর কাছে এই বিষয়ে সঠিক যাচাই বাছাই করে বিচারের জন্য জোর
              আবেদন করছি।
            </p>
          </div>

          <div className="mb-8">
            <p className="font-bold mb-2">অতএব</p>
            <p className="text-justify leading-relaxed">
              আমার উপরোক্ত অভিযোগ গ্রহণ করিয়া তদন্ত পূর্বক যাচাই বাছাই করে এই
              টেকনিশিয়ান এর বিরুদ্ধে কঠোর ব্যবস্থা গ্রহণ করবেন।
            </p>
          </div>

          <div className="mb-8">
            <p className="font-bold mb-2">দাবিসমূহঃ-</p>
            <ul className="space-y-1">
              <li>
                # কাস্টমার অধিকার সংরক্ষণ অনুযায়ী অভিযুক্ত বিরুদ্ধে কঠোর
                ব্যবস্থা গ্রহণ।
              </li>
              <li># আমার ক্ষমা প্রদান নিশ্চিত করা।</li>
              <li># আমার মানহানির জন্য এই টেনকনিশিয়ানকে চাকুরীচ্যুত করা।</li>
            </ul>
          </div>

          <div className="mb-12">
            <p className="font-bold mb-2">
              সংযুক্তিসমূহ (প্রমাণক হিসেবে এগুলো সাথে দিন)
            </p>
            <ul className="space-y-1">
              <li>১. স্ক্রিনশট বা কথোপকথনের কপি।</li>
              <li>২. আমার সাথে খারাপ আচরণের সময় ভিডিও নমুনা।</li>
              <li>৩. আমার সাথে যোগাযোগের কল রেকর্ড বা চ্যাট হিস্ট্রি।</li>
            </ul>
          </div>

          {/* Signature Area */}
          <div className="flex justify-end mb-16 mt-8">
            <div className="text-center">
              <p className="font-bold mb-6">বিনীত নিবেদন</p>
              <div className="border-b border-gray-400 w-32 mx-auto mb-2 opacity-50"></div>
              <p>{complaint.customer?.name}</p>
              <p>
                মোবাইল{" "}
                <span className="font-mono">{complaint.customer?.phone}</span>
              </p>
            </div>
          </div>

          {/* Bottom Tracking Details Area matching image */}
          <div className="grid grid-cols-2 gap-4 text-sm mt-12">
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-full border border-brand/20 flex flex-col items-center justify-center -ml-2 mb-4">
                <span className="text-[8px] font-bold text-brand uppercase tracking-widest text-center mt-1">
                  SE
                  <br />
                  ELEC
                </span>
              </div>
              <p>
                <span className="font-semibold">তারিখঃ</span>{" "}
                <span className="font-mono">
                  {new Date(complaint.createdAt).toLocaleDateString("bn-BD")}
                </span>
              </p>
              <p>
                <span className="font-semibold">অভিযোগ ট্র্যাকিং নাম্বার</span>{" "}
                <span className="font-mono">{complaint.complaintId}</span>
              </p>
              <p>
                <span className="font-semibold">অভিযোগ গ্রহন নাম্বার</span>{" "}
                <span className="font-mono">
                  SE{" "}
                  {complaint.complaintId.replace(/\D/g, "").slice(0, 5) ||
                    "14285"}
                </span>
              </p>
            </div>

            <div className="flex flex-col items-end justify-end translate-y-8">
              <div className="flex gap-12 mt-4 text-sm">
                <div className="text-center">
                  <div className="border-b border-black w-24 mx-auto mb-1 h-8 flex items-end justify-center">
                    <span className="font-signature text-xl">স্বাক্ষর</span>
                  </div>
                  <p className="font-bold">মোঃ আতিকুর রহমান</p>
                  <p className="text-[10px]">
                    দায়িত্বপ্রাপ্ত কর্মকর্তা প্রশাসনিক
                  </p>
                  <p className="text-[10px]">এস ই ইলেকট্রনিক্স প্রধান শাখা</p>
                </div>
                <div className="text-center">
                  <div className="border-b border-black w-24 mx-auto mb-1 h-8 flex items-end justify-center">
                    <span className="font-signature text-lg">স্বাক্ষর</span>
                  </div>
                  <p className="font-bold">মোহাম্মদ আজিম খাঁ</p>
                  <p className="text-[10px]">সত্যতা যাচাইকারী কর্মকর্তা</p>
                  <p className="text-[10px]">এস ই ইলেকট্রনিক্স প্রধান শাখা</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
