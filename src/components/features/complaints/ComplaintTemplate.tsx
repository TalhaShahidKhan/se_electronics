import { formatDate } from "@/utils";

type ComplaintTemplateProps = {
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
      currentStreetAddress?: string;
      currentDistrict?: string;
    };
    productType?: string;
    subject: string;
    description: string;
    status: string;
    adminNote?: string | null;
    createdAt: Date;
    logo?: string;
  };
};

export default function ComplaintTemplate({ data }: ComplaintTemplateProps) {
  const dateStr = new Date(data.createdAt).toLocaleDateString('bn-BD');
  const receiptNum = data.complaintId.replace(/\D/g, '').slice(0, 5) || '14285';
  
  return (
    <div
      className="relative w-[210mm] min-h-[297mm] mx-auto bg-white p-[25mm] text-[#111] overflow-hidden"
      style={{
        fontFamily: "'SolaimanLipi', serif",
        lineHeight: "1.8",
        fontSize: "16px",
      }}
    >
      {/* Top Header */}
      <div className="mb-10">
        <p className="text-lg">বরাবর,</p>
        <p className="text-xl font-bold">এস ই ইলেকট্রনিক্স</p>
        <p className="text-lg">মহাপরিচালক / চেয়ারম্যান,</p>
        <p className="text-lg">বাদাম বাগিচা সিলেট সদর ৩১০০।</p>
      </div>

      {/* Subject */}
      <div className="mb-8">
        <p className="text-lg font-bold">বিষয় :- <span className="underline underline-offset-4">{data.subject}</span> দায়ের।</p>
      </div>

      {/* Customer Information */}
      <div className="mb-8">
        <p className="text-lg font-bold underline underline-offset-8 mb-4">অভিযোগকারীর কাস্টমার বিবরণ :-</p>
        <div className="space-y-2 ml-6">
          <p><span className="font-bold">নামঃ</span> {data.customer.name}</p>
          <p><span className="font-bold">পিতাঃ</span> মৃত মোহাম্মদ মুকিমউল্লাহ (নমুনা)</p>
          <p><span className="font-bold">ঠিকানাঃ</span> {data.customer.address}</p>
          <p><span className="font-bold">মোবাইল নম্বরঃ</span> {data.customer.phone}</p>
        </div>
      </div>

      {/* Staff Information */}
      <div className="mb-8">
        <p className="text-lg font-bold underline underline-offset-8 mb-4">টেকনিশিয়ান অভিযুক্তের বিবরণ :-</p>
        <div className="space-y-2 ml-6">
          <p><span className="font-bold">টেকনিশিয়ান নামঃ</span> {data.staff.name}</p>
          <p><span className="font-bold">ঠিকানাঃ</span> {data.staff.currentStreetAddress || 'সুপার মার্কেট'}, {data.staff.currentDistrict || 'ঢাকা'}।</p>
          <p><span className="font-bold">টেকনিশিয়ান আইডি নংঃ-</span> &#123;{data.staff.staffId}&#125;</p>
          <p><span className="font-bold">ফোন নম্বরঃ</span> {data.staff.phone}</p>
        </div>
      </div>

      {/* Description */}
      <div className="mb-10 text-justify">
        <p className="text-lg font-bold mb-3">ঘটনার বিস্তারিত বিবরণ:</p>
        <p className="leading-relaxed">
          আমি নিম্ন স্বাক্ষর কারী <span className="font-bold">&#123; {data.customer.name} &#125;</span> আপনার একজন কাস্টমার গত <span className="font-bold">&#123; {dateStr} &#125;</span> ই তারিখে আপনাদের অনলাইনে পোর্টালে সার্ভিসিং এর জন্য আমি আমার <span className="font-bold">&#123; {data.productType || 'ইলেকট্রনিক্স'} &#125;</span> সার্ভিসের জন্য আবেদন করি আবেদনের প্রেক্ষিতে আপনাদের এসাইন করা টেকনিশিয়ান নামঃ <span className="font-bold">{data.staff.name}</span> আমাদের পদত্ত ঠিকানায় আসে আমাদের কল দেয় আমি উনাকে রিসিভ করে আনি আমার আবেদন কৃত সার্ভিস এর কাজ শেষ করে আমি উনাকে ভালো ভাবে চেক করেছে কিনা বলতে টেকনিশিয়ান নামঃ <span className="font-bold">{data.staff.name}</span> আমার সাথে খুবই খারাপ আচরণ করে যা আমি একজন কাস্টমার হয়ে সহ্য করতে পারি নাই বলে আমি আপনাদের কাছে এই অভিযোগ দায়ের করেছি। এমতবস্থায় টেকনিশিয়ান নামঃ <span className="font-bold">{data.staff.name}</span> এর জন্য আপনাদের সুনামধন্য কোম্পানী এস ই ইলেকট্রনিক্স এর সম্মান খুন্ন করেছে। ও আমি তাহার এই আচরণ এর জন্য এস ই ইলেকট্রনিক্স এর মহাপরিচালক / চেয়ারম্যান, এর কাছে এই বিষয়ে সঠিক যাচাই বাছাই করে বিচারের জন্য জোর আবেদন করছি।
        </p>
        {data.description && (
          <div className="mt-4 p-5 bg-gray-50 border-l-4 border-gray-400 italic rounded-r-lg">
            " {data.description} "
          </div>
        )}
      </div>

      {/* Conclusion */}
      <div className="mb-10">
        <p className="text-lg font-bold mb-1">অতএব</p>
        <p>আমার উপরক্ত অভিযোগ গ্রহণ করিয়া তদন্ত পূর্বক যাচাই বাছাই করে এই টেকনিশিয়ান এর বিরুদ্ধে কঠোর ব্যবস্থা গ্রহণ করবেন।</p>
      </div>

      {/* Claims */}
      <div className="mb-8">
        <p className="text-lg font-bold underline underline-offset-8 mb-4">দাবিসমূহ :-</p>
        <div className="space-y-2 ml-6 list-none">
          <p># কাস্টমার অধিকার সংরক্ষণ অনুযায়ী অভিযুক্ত বিরুদ্ধে কঠোর ব্যবস্থা গ্রহণ।</p>
          <p># আমার ক্ষমা প্রদান নিশ্চিত করা।</p>
          <p># আমার মানহানির জন্য এই টেকনিশিয়ানকে চাকুরীয়ুত করা</p>
        </div>
      </div>

      {/* Attachments */}
      <div className="mb-16">
        <p className="text-lg font-bold underline underline-offset-8 mb-4">সংযুক্তিসমূহ (প্রমাণক হিসেবে এগুলো সাথে দিন)</p>
        <div className="space-y-2 ml-6">
          <p>১. স্ক্রিনশট বা কথোপকথনের কপি।</p>
          <p>২. আমার সাথে খারাপ আচরণের সময় ভিডিও নমুনা।</p>
          <p>৩. আমার সাথে যোগাযোগের কল রেকর্ড বা চাট হিস্ট্রি।</p>
        </div>
      </div>

      {/* Footer Area */}
      <div className="relative mt-auto">
        {/* Sincerely Yours */}
        <div className="flex justify-end mb-24">
          <div className="text-center">
            <p className="font-bold mb-8">বিনীত নিবেদন</p>
            <div>
              <p className="font-bold">{data.customer.name}</p>
              <p>মোবাইল {data.customer.phone}</p>
            </div>
          </div>
        </div>

        {/* Bottom Details and Signatures */}
        <div className="flex justify-between items-end">
          <div className="space-y-2">
             {/* Seal */}
             <div className="mb-4 relative">
                {data.logo ? (
                  <div className="w-28 h-28 relative">
                    <img src={data.logo} alt="Seal" className="w-full h-full object-contain rounded-full border-2 border-blue-900/30 p-1" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <div className="w-full h-full rounded-full border border-blue-900/10 flex flex-col items-center justify-center bg-blue-50/5 text-[8px] text-blue-900/60 font-bold text-center leading-tight">
                        <p>সিলেট সদর শাখা</p>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full border-2 border-blue-800 flex flex-col items-center justify-center p-2 text-center text-[10px] text-blue-800 font-bold opacity-70">
                    <p>এস ই ইলেকট্রনিক্স</p>
                    <div className="h-px w-full bg-blue-800 my-1"></div>
                    <p>প্রশাসনিক শাখা</p>
                  </div>
                )}
             </div>
             
             <div className="space-y-1">
                <p><span className="font-bold">তারিখঃ</span> {dateStr}</p>
                <p><span className="font-bold">অভিযোগ ট্র্যাকিং নাম্বার</span> {data.complaintId}</p>
                <p><span className="font-bold">অভিযোগ গ্রহন নাম্বার</span> SE {receiptNum}</p>
             </div>
          </div>

          <div className="flex gap-16 text-center text-[14px]">
            <div className="w-44">
              <div className="border-t border-black mb-2 pt-1">
                 <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjMwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjUiIHk9IjIwIiBmb250LWZhbWlseT0iJ2NoZXJyeScsIGN1cnNpdmUiIGZvbnQtc2l6ZT0iMTUiIGZpbGw9ImJsYWNrIj5TaWduYXR1cmU8L3RleHQ+PC9zdmc+" alt="Signature" className="h-8 mx-auto opacity-40 mb-1" />
              </div>
              <p className="font-bold">মোঃ আতিকুর রহমান</p>
              <p className="text-[12px] text-gray-600">দায়িত্বপ্রাপ্ত কর্মকর্তা প্রশাসনিক</p>
              <p className="text-[12px] text-gray-600 leading-tight">এস ই ইলেকট্রনিক্স প্রধান শাখা</p>
            </div>
            <div className="w-44">
              <div className="border-t border-black mb-2 pt-1">
                 <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjMwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjUiIHk9IjIwIiBmb250LWZhbWlseT0iJ2NoZXJyeScsIGN1cnNpdmUiIGZvbnQtc2l6ZT0iMTUiIGZpbGw9ImJsYWNrIj5TaWduYXR1cmU8L3RleHQ+PC9zdmc+" alt="Signature" className="h-8 mx-auto opacity-40 mb-1" />
              </div>
              <p className="font-bold">মোহাম্মদ আজিম খাঁ</p>
              <p className="text-[12px] text-gray-600">সত্যতা যাচাইকারী কর্মকর্তা</p>
              <p className="text-[12px] text-gray-600 leading-tight">এস ই ইলেকট্রনিক্স প্রধান শাখা</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

