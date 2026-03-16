import { getComplaintById } from "@/actions/complaintActions";
import { verifyCustomerSession } from "@/actions/customerActions";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, CheckCircle, Clock } from "lucide-react";
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
  const isProcessing = complaint.status === 'processing' || complaint.status === 'hearing' || complaint.status === 'completed';
  const isHearing = complaint.status === 'hearing' || complaint.status === 'completed';
  const isCompleted = complaint.status === 'completed';
  
  const getProgressWidth = () => {
      if (isCompleted) return '100%';
      if (isHearing) return '66.66%';
      if (isProcessing) return '33.33%';
      return '0%';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-3 sm:px-4 flex justify-center">
      <div className="w-full max-w-5xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <Link
            href="/customer/complain"
            className="flex items-center gap-2 text-brand hover:text-brand/80 font-bold transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
          <div className="text-center">
            <h1 className="text-lg font-black text-gray-900 border-b-2 border-brand/20 inline-block pb-1">অভিযোগ পত্র (Complaint Document)</h1>
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

        {/* APPLICATION STATUS TRACKER */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 font-sans overflow-hidden">
            <h3 className="text-center font-bold text-gray-800 border-b border-gray-100 py-3 uppercase tracking-wider text-sm bg-gray-50">বর্তমান অবস্থা (Current Status)</h3>
            <div className="flex items-center justify-center p-8 relative overflow-x-auto">
                <div className="absolute left-[15%] right-[15%] top-[40%] -translate-y-1/2 h-1 bg-gray-200 -z-10 min-w-[500px]"></div>
                <div className="absolute left-[15%] right-[15%] top-[40%] -translate-y-1/2 h-1 bg-brand -z-10 transition-all duration-500 min-w-[500px]" style={{width: getProgressWidth()}}></div>

                <div className="w-full flex justify-between min-w-[600px] px-8">
                    {/* Step 1 */}
                    <div className="flex flex-col items-center gap-2 bg-white px-2">
                        <CheckCircle size={28} className="text-brand bg-white" />
                        <span className="text-xs font-bold text-brand mt-1">Under Trial</span>
                        <span className="text-[10px] text-gray-500">{formatDate(complaint.createdAt)}</span>
                    </div>
                    {/* Step 2 */}
                    <div className="flex flex-col items-center gap-2 bg-white px-2">
                        {isProcessing ? (
                            <CheckCircle size={28} className="text-brand bg-white" />
                        ) : (
                            <div className="w-7 h-7 rounded-full bg-gray-200 border-4 border-white shadow-sm" />
                        )}
                        <span className={`text-xs font-bold mt-1 ${isProcessing ? 'text-brand' : 'text-gray-400'}`}>Processing</span>
                    </div>
                    {/* Step 3 */}
                    <div className="flex flex-col items-center gap-2 bg-white px-2">
                        {isHearing ? (
                            <CheckCircle size={28} className="text-brand bg-white" />
                        ) : (
                            <div className="w-7 h-7 rounded-full bg-gray-200 border-4 border-white shadow-sm" />
                        )}
                        <span className={`text-xs font-bold mt-1 ${isHearing ? 'text-brand' : 'text-gray-400'}`}>Hearing</span>
                    </div>
                    {/* Step 4 */}
                    <div className="flex flex-col items-center gap-2 bg-white px-2">
                        {isCompleted ? (
                            <CheckCircle size={28} className="text-brand bg-white" />
                        ) : (
                            <div className="w-7 h-7 rounded-full bg-gray-200 border-4 border-white shadow-sm" />
                        )}
                        <span className={`text-xs font-bold mt-1 ${isCompleted ? 'text-brand' : 'text-gray-400'}`}>Completed</span>
                    </div>
                </div>
            </div>
            
            {(isHearing || isCompleted) && complaint.adminNote && (
                 <div className="p-4 bg-amber-50/50 border-t border-amber-100 flex flex-col items-center text-center">
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1.5">
                       {isCompleted ? "Final Resolution Details" : "Hearing Notice / Update"}
                    </p>
                    <p className="text-sm font-medium text-amber-900 leading-relaxed max-w-2xl italic">
                       "{complaint.adminNote}"
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
                <p><span className="font-bold">বিষয়ঃ- অভিযোগ দায়ের।</span></p>
            </div>

            <div className="mb-6 space-y-1">
                <p className="font-bold underline underline-offset-4 mb-2">অভিযোগকারীর কাস্টমার বিবরণঃ</p>
                <p><span className="font-semibold">নামঃ</span> {complaint.customer?.name}</p>
                <p><span className="font-semibold">পিতাঃ</span> প্রদত্ত নয় (Not Provided)</p>
                <p><span className="font-semibold">ঠিকানাঃ</span> {complaint.customer?.address}</p>
                <p><span className="font-semibold">মোবাইল নম্বরঃ</span> <span className="font-mono">{complaint.customer?.phone}</span></p>
            </div>

            <div className="mb-8 space-y-1">
                <p className="font-bold underline underline-offset-4 mb-2">টেকনিশিয়ান অভিযুক্তের বিবরণঃ</p>
                <p><span className="font-semibold">টেকনিশিয়ান নামঃ</span> {complaint.staff?.name}</p>
                <p><span className="font-semibold">ঠিকানাঃ</span> {complaint.staff?.currentStreetAddress}, {complaint.staff?.currentDistrict}</p>
                <p><span className="font-semibold">টেকনিশিয়ান আইডি নংঃ-</span> <span className="font-mono font-bold">{'{'}{complaint.staffId}{'}'}</span></p>
                <p><span className="font-semibold">ফোন নম্বরঃ</span> <span className="font-mono">{complaint.staff?.phone}</span></p>
            </div>

            <div className="mb-8">
                <p className="font-bold mb-2">ঘটনার বিস্তারিত বিবরণঃ</p>
                <p className="text-justify leading-loose tracking-wide whitespace-pre-wrap">
                    আমি নিম্ন স্বাক্ষর কারী {'{'} {complaint.customer?.name} {'}'} আপনার একজন কাস্টমার। {complaint.subject} - এই বিষয়ের ভিত্তিতে আমি এই অভিযোগ দায়ের করছি। 
                    <br/><br/>
                    {complaint.description}
                    <br/><br/>
                    এমতবস্থায় টেকনিশিয়ান নামঃ {complaint.staff?.name} এর জন্য আপনাদের স্বনামধন্য কোম্পানী এস ই ইলেকট্রনিক্স এর সম্মান ক্ষুন্ন হয়েছে। ও আমি তাহার এই আচরণের জন্য এস ই ইলেকট্রনিক্স এর মহাপরিচালক / চেয়ারম্যান, এর কাছে এই বিষয়ে সঠিক যাচাই বাছাই করে বিচারের জন্য জোর আবেদন করছি।
                </p>
            </div>

            <div className="mb-8">
                <p className="font-bold mb-2">অতএব</p>
                <p className="text-justify leading-relaxed">
                    আমার উপরোক্ত অভিযোগ গ্রহণ করিয়া তদন্ত পূর্বক যাচাই বাছাই করে এই টেকনিশিয়ান এর বিরুদ্ধে কঠোর ব্যবস্থা গ্রহণ করবেন।
                </p>
            </div>

            <div className="mb-8">
                <p className="font-bold mb-2">দাবিসমূহঃ-</p>
                <ul className="space-y-1">
                    <li># কাস্টমার অধিকার সংরক্ষণ অনুযায়ী অভিযুক্ত বিরুদ্ধে কঠোর ব্যবস্থা গ্রহণ।</li>
                    <li># আমার ক্ষমা প্রদান নিশ্চিত করা।</li>
                    <li># আমার মানহানির জন্য এই টেনকনিশিয়ানকে চাকুরীচ্যুত করা।</li>
                </ul>
            </div>

            <div className="mb-12">
                <p className="font-bold mb-2">সংযুক্তিসমূহ (প্রমাণক হিসেবে এগুলো সাথে দিন)</p>
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
                    <p>মোবাইল <span className="font-mono">{complaint.customer?.phone}</span></p>
                </div>
            </div>

            {/* Bottom Tracking Details Area matching image */}
            <div className="grid grid-cols-2 gap-4 text-sm mt-12">
                <div className="space-y-2">
                    <div className="w-16 h-16 rounded-full border border-brand/20 flex flex-col items-center justify-center -ml-2 mb-4">
                        <span className="text-[8px] font-bold text-brand uppercase tracking-widest text-center mt-1">SE<br/>ELEC</span>
                    </div>
                    <p><span className="font-semibold">তারিখঃ</span> <span className="font-mono">{new Date(complaint.createdAt).toLocaleDateString('bn-BD')}</span></p>
                    <p><span className="font-semibold">অভিযোগ ট্র্যাকিং নাম্বার</span> <span className="font-mono">{complaint.complaintId}</span></p>
                    <p><span className="font-semibold">অভিযোগ গ্রহন নাম্বার</span> <span className="font-mono">SE {complaint.complaintId.replace(/\D/g,'').slice(0,5) || '14285'}</span></p>
                </div>
                
                <div className="flex flex-col items-end justify-end translate-y-8">
                     <div className="flex gap-12 mt-4 text-xs">
                        <div className="text-center">
                            <div className="border-b border-black w-24 mx-auto mb-1 h-8 flex items-end justify-center"><span className="font-signature text-xl">স্বাক্ষর</span></div>
                            <p className="font-bold">মোঃ আতিকুর রহমান</p>
                            <p className="text-[10px]">দায়িত্বপ্রাপ্ত কর্মকর্তা প্রশাসনিক</p>
                            <p className="text-[10px]">এস ই ইলেকট্রনিক্স প্রধান শাখা</p>
                        </div>
                        <div className="text-center">
                            <div className="border-b border-black w-24 mx-auto mb-1 h-8 flex items-end justify-center"><span className="font-signature text-lg">স্বাক্ষর</span></div>
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
  );
}
