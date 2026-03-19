import React from 'react';

type HearingNoticeTemplateProps = {
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
    issueDateBn: string;
    receiptNum: string;
    logo?: string;
  };
};

export default function HearingNoticeTemplate({ data }: HearingNoticeTemplateProps) {
  return (
    <div 
      className="relative w-[210mm] min-h-[297mm] mx-auto bg-white p-[25mm] text-[#111] overflow-hidden"
      style={{
        fontFamily: "'SolaimanLipi', serif",
        lineHeight: "1.8",
        fontSize: "15px",
      }}
    >
      {/* Watermark */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-[0.05] grayscale">
        <img src={data.logo} alt="" className="w-[350px] mb-4" />
        <h1 className="text-6xl font-black tracking-tighter text-blue-900">SE IPS BD</h1>
        <p className="text-xl font-bold text-blue-900 mt-2">আই পি এস প্রস্তুতকারক প্রতিষ্ঠান</p>
      </div>

      <div className="relative z-10">
        <div className="mb-10">
          <p className="font-bold text-lg">{data.customer.name}</p>
          <p>আইডিঃ {data.customer.customerId}</p>
          <p>{data.customer.address}</p>
          <p>মোবাইলঃ {data.customer.phone}</p>
        </div>

        <div className="mb-8 font-bold text-lg">
          <p>বিষয়ঃ- শুনানির নোটিশ (Hearing Notice)।</p>
        </div>

        <div className="mb-6">
          <p>জনাব / জনাবা,</p>
          <p className="text-justify mt-2">
            আপনার দায়েরকৃত অভিযোগ ট্র্যাকিং নম্বর <strong className="font-mono">{data.complaintId}</strong> সম্পর্কিত বিষয়ে অর্থাৎ <strong>"{data.subject}"</strong> — এই বিষয়ের উপর ভিত্তি করে এস ই ইলেকট্রনিক্স সার্ভিস কোয়ালিটি প্রটেকশন বিভাগ একটি আনুষ্ঠানিক শুনানি আহ্বান করেছে।
          </p>
        </div>

        <div className="mb-6">
          <p className="font-bold underline underline-offset-4 mb-2">অভিযুক্ত টেকনিশিয়ানের বিবরণঃ</p>
          <p>
            <strong>টেকনিশিয়ান নামঃ</strong> {data.staff.name} 
            <strong className="ml-4">টেকনিশিয়ান আইডিঃ</strong> {data.staff.staffId} 
            <strong className="ml-4">ভূমিকাঃ</strong> {data.staff.role.toUpperCase()} 
            <strong className="ml-4">ফোন নম্বরঃ</strong> {data.staff.phone}
          </p>
        </div>

        <div className="mb-8">
          <p className="font-bold mb-2">শুনানির বিস্তারিত নোটিশঃ</p>
          <div className="text-justify bg-amber-50/30 border-l-4 border-amber-600 p-5 leading-loose">
            {data.adminNote || "শুনানির তারিখ, সময় ও স্থান পরবর্তীতে জানানো হবে।"}
          </div>
        </div>

        <div className="mb-8">
          <p className="font-bold">অতএব</p>
          <p className="text-justify">
            আপনাকে অনুরোধ করা হচ্ছে যে উক্ত শুনানিতে নির্ধারিত সময়ে উপস্থিত থাকুন এবং আপনার দখলে থাকা সকল সাক্ষ্য-প্রমাণ (স্ক্রিনশট, ভিডিও, কল রেকর্ড ইত্যাদি) সাথে নিয়ে আসুন। উপস্থিত না হলে একপক্ষীয় সিদ্ধান্ত নেওয়া হতে পারে।
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

        {/* Footer */}
        <div className="flex justify-between items-end border-t border-gray-200 pt-8 mt-12">
          <div className="space-y-2">
            {/* Seal */}
            <div className="w-16 h-16 rounded-full border-2 border-blue-900/30 flex flex-col items-center justify-center p-1 text-center text-[7px] text-blue-900/60 font-bold mb-4">
              <p>এস ই ইলেকট্রনিক্স</p>
              <div className="h-[1px] w-full bg-blue-900/20 my-0.5"></div>
              <p>সিলেট সদর শাখা</p>
            </div>
            <p><strong>তারিখঃ</strong> {data.issueDateBn}</p>
            <p><strong>শুনানি নোটিশ ট্র্যাকিং নাম্বার:</strong> {data.complaintId}</p>
            <p><strong>অভিযোগ গ্রহন নাম্বার:</strong> SE {data.receiptNum}</p>
          </div>
          
          <div className="flex gap-12 text-center text-[10px]">
            <div className="w-32">
              <div className="border-b border-gray-400 h-8 flex items-end justify-center mb-1">
                <span className="italic opacity-40">Signature</span>
              </div>
              <p className="font-bold">মোঃ আতিকুর রহমান</p>
              <p className="text-[9px] text-gray-500">দায়িত্বপ্রাপ্ত কর্মকর্তা প্রশাসনিক</p>
              <p className="text-[9px] text-gray-500">এস ই ইলেকট্রনিক্স প্রধান শাখা</p>
            </div>
            <div className="w-32">
              <div className="border-b border-gray-400 h-8 flex items-end justify-center mb-1">
               <span className="italic opacity-40">Signature</span>
              </div>
              <p className="font-bold">মোহাম্মদ আজিম খাঁ</p>
              <p className="text-[9px] text-gray-500">সত্যতা যাচাইকারী কর্মকর্তা</p>
              <p className="text-[9px] text-gray-500">এস ই ইলেকট্রনিক্স প্রধান শাখা</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
