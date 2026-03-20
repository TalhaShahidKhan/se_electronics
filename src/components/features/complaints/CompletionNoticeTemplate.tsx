import React from 'react';

type CompletionNoticeTemplateProps = {
  data: {
    complaintId: string;
    customer: {
      name: string;
      customerId: string;
      phone: string;
      address: string;
    };
    staff: {
      name: string;
      phone: string;
      role: string;
      staffId: string;
    };
    subject: string;
    adminNote?: string | null;
    resolvedDateBn: string;
    receiptNo: string;
    logo?: string;
  };
};

export default function CompletionNoticeTemplate({ data }: CompletionNoticeTemplateProps) {
  return (
    <div 
      className="relative w-[210mm] min-h-[297mm] mx-auto bg-white p-[25mm] text-[#111] overflow-hidden"
      style={{
        fontFamily: "'SolaimanLipi', serif",
        lineHeight: "1.8",
        fontSize: "15px",
      }}
    >
       {/* Watermark Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-[0.05] grayscale">
        <img src={data.logo} alt="" className="w-[350px] mb-4" />
        <h1 className="text-6xl font-black tracking-tighter text-blue-900 leading-none">SE IPS BD</h1>
        <p className="text-xl font-bold text-blue-900 mt-2">আই পি এস প্রস্তুতকারক প্রতিষ্ঠান</p>
      </div>

      <div className="relative z-10">
        <div className="mb-10">
          <p>বরাবর,</p>
          <p className="font-bold text-lg">{data.customer.name}</p>
          <p>আইডিঃ {data.customer.customerId}</p>
          <p>{data.customer.address}</p>
          <p>মোবাইলঃ {data.customer.phone}</p>
        </div>

        <div className="mb-8 font-bold text-lg">
          <p className="underline underline-offset-4 decoration-emerald-500/30">বিষয়ঃ- অভিযোগ নিষ্পত্তি পত্র (Complaint Resolution Letter)।</p>
        </div>

        <div className="mb-6 text-justify">
          <p>জনাব / জনাবা,</p>
          <p className="mt-2 leading-relaxed">
            আপনার দায়েরকৃত অভিযোগ ট্র্যাকিং নম্বর <strong className="font-mono">{data.complaintId}</strong> সম্পর্কিত বিষয়ে অর্থাৎ <strong>"{data.subject}"</strong> — এই বিষয়ে এস ই ইলেকট্রনিক্স সার্ভিস কোয়ালিটি প্রটেকশন বিভাগ তদন্ত সম্পন্ন করে চূড়ান্ত সিদ্ধান্ত গ্রহণ করেছে।
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
                <p className="font-bold underline underline-offset-4 mb-2">অভিযোগকারীর কাস্টমার বিবরণঃ</p>
                <div className="space-y-1 text-sm bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <p><strong>নামঃ</strong> {data.customer.name}</p>
                    <p><strong>কাস্টমার আইডিঃ</strong> {data.customer.customerId}</p>
                    <p><strong>মোবাইল নম্বরঃ</strong> {data.customer.phone}</p>
                    <p><strong>ঠিকানাঃ</strong> {data.customer.address}</p>
                </div>
            </div>
            <div className="space-y-4">
                <p className="font-bold underline underline-offset-4 mb-2">অভিযুক্ত টেকনিশিয়ানের বিবরণঃ</p>
                <div className="space-y-1 text-sm bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <p><strong>টেকনিশিয়ান নামঃ</strong> {data.staff.name}</p>
                    <p><strong>টেকনিশিয়ান আইডিঃ</strong> {data.staff.staffId}</p>
                    <p><strong>ভূমিকাঃ</strong> {data.staff.role.toUpperCase()}</p>
                    <p><strong>ফোন নম্বরঃ</strong> {data.staff.phone}</p>
                </div>
            </div>
        </div>

        <div className="mb-8">
          <p className="font-bold mb-2">চূড়ান্ত সিদ্ধান্ত ও বিবরণঃ</p>
          <div className="text-justify bg-emerald-50/30 border-l-4 border-emerald-600 p-5 leading-relaxed rounded-r-2xl">
            {data.adminNote || "অভিযোগটি যথাযথভাবে পর্যালোচনা করে নিষ্পত্তি করা হয়েছে।"}
          </div>
        </div>

        <div className="mb-8">
          <p className="font-bold">অতএব</p>
          <p className="text-justify leading-relaxed">
            এই পত্রের মাধ্যমে নিশ্চিত করা হচ্ছে যে উপরোক্ত অভিযোগটি এস ই ইলেকট্রনিক্স সার্ভিস কোয়ালিটি প্রটেকশন বিভাগ কর্তৃক যথাযথভাবে পর্যালোচনা ও নিষ্পত্তি সম্পন্ন হয়েছে। মামলাটি এখন বন্ধ করা হলো। নতুন অভিযোগ দায়ের না হওয়া পর্যন্ত আর কোনো পদক্ষেপের প্রয়োজন নেই। আপনার ধৈর্য ও সহযোগিতার জন্য আন্তরিক ধন্যবাদ।
          </p>
        </div>

        <div className="flex justify-end mt-12 mb-16">
          <div className="text-center">
            <p className="font-bold mb-8">বিনীত নিবেদন</p>
            <div className="border-b border-gray-600 w-32 mx-auto mb-2"></div>
            <p className="font-bold">এস ই ইলেকট্রনিক্স</p>
            <p className="text-sm">সার্ভিস কোয়ালিটি বিভাগ</p>
          </div>
        </div>

        {/* Footer Area */}
        <div className="flex justify-between items-end border-t border-gray-200 pt-8 mt-12">
          <div className="space-y-2">
            {/* Seal with Logo Icon */}
            <div className="w-16 h-16 rounded-full border-2 border-blue-900/30 flex flex-col items-center justify-center p-1 text-center text-[7px] text-blue-900/60 font-bold mb-4">
                <p>এস ই ইলেকট্রনিক্স</p>
                <div className="h-[1px] w-full bg-blue-900/20 my-0.5"></div>
                <p>সিলেট সদর শাখা</p>
            </div>
            <p><strong>তারিখঃ</strong> {data.resolvedDateBn}</p>
            <p><strong>নিষ্পত্তি পত্র ট্র্যাকিং নাম্বার:</strong> {data.complaintId}</p>
            <p><strong>অভিযোগ গ্রহন নাম্বার:</strong> SE {data.receiptNo}</p>
          </div>
          
          <div className="flex gap-12 text-center text-[10px]">
            <div className="w-32">
              <div className="border-b border-gray-400 h-8 flex items-end justify-center mb-1">
                <span className="italic opacity-40">Signature</span>
              </div>
              <p className="font-bold">মোঃ আতিকুর রহমান</p>
              <p className="text-[9px] text-gray-500 font-medium">দায়িত্বপ্রাপ্ত কর্মকর্তা প্রশাসনিক</p>
              <p className="text-[9px] text-gray-500 font-medium leading-none mt-1">এস ই ইলেকট্রনিক্স প্রধান শাখা</p>
            </div>
            <div className="w-32">
              <div className="border-b border-gray-400 h-8 flex items-end justify-center mb-1">
                <span className="italic opacity-40">Signature</span>
              </div>
              <p className="font-bold">মোহাম্মদ আজিম খাঁ</p>
              <p className="text-[9px] text-gray-500 font-medium">সত্যতা যাচাইকারী কর্মকর্তা</p>
              <p className="text-[9px] text-gray-500 font-medium leading-none mt-1">এস ই ইলেকট্রনিক্স প্রধান শাখা</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
