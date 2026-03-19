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
        lineHeight: "1.7",
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
        {/* Top Header */}
        <div className="mb-10">
          <p className="text-lg">বরাবর,</p>
          <p className="text-xl font-bold">এস ই ইলেকট্রনিক্স</p>
          <p className="text-lg">মহাপরিচালক / চেয়ারম্যান,</p>
          <p className="text-lg">বাদাম বাগিচা সিলেট সদর ৩১০০।</p>
        </div>

        {/* Subject */}
        <div className="mb-8">
          <p className="text-lg font-bold underline underline-offset-4 decoration-gray-300">বিষয় :- {data.subject} দায়ের।</p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
                <p className="font-bold underline underline-offset-4">অভিযোগকারীর কাস্টমার বিবরণ :-</p>
                <div className="space-y-1 text-sm bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <p><strong>নামঃ</strong> {data.customer.name}</p>
                    <p><strong>আইডিঃ</strong> {data.customer.customerId}</p>
                    <p><strong>ঠিকানাঃ</strong> {data.customer.address}</p>
                    <p><strong>মোবাইল নম্বরঃ</strong> {data.customer.phone}</p>
                </div>
            </div>
            <div className="space-y-4">
                <p className="font-bold underline underline-offset-4">টেকনিশিয়ান অভিযুক্তের বিবরণ :-</p>
                <div className="space-y-1 text-sm bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <p><strong>নামঃ</strong> {data.staff.name}</p>
                    <p><strong>আইডি নম্বরঃ</strong> &#123;{data.staff.staffId}&#125;</p>
                    <p><strong>ঠিকানাঃ</strong> {data.staff.currentStreetAddress || 'সিলেট সদর'}, {data.staff.currentDistrict || 'সিলেট'}।</p>
                    <p><strong>ফোন নম্বরঃ</strong> {data.staff.phone}</p>
                </div>
            </div>
        </div>

        {/* Description */}
        <div className="mb-10 text-justify">
          <p className="font-bold mb-3">ঘটনার বিস্তারিত বিবরণ:</p>
          <p className="leading-relaxed">
            আমি নিম্ন স্বাক্ষর কারী <strong className="bg-gray-100/50 px-1 rounded">&#123; {data.customer.name} &#125;</strong> আপনাদের একজন কাস্টমার গত <strong className="bg-gray-100/50 px-1 rounded">&#123; {dateStr} &#125;</strong> ই তারিখে আপনাদের অনলাইনে পোর্টালে সার্ভিসিং এর জন্য আমি আমার <strong className="bg-gray-100/50 px-1 rounded">&#123; {data.productType || 'ইলেকট্রনিক্স'} &#125;</strong> সার্ভিসের জন্য আবেদন করি আবেদনের প্রেক্ষিতে আপনাদের এসাইন করা টেকনিশিয়ান নামঃ <strong>{data.staff.name}</strong> আমাদের পদত্ত ঠিকানায় আসে আমাদের কল দেয় আমি উনাকে রিসিভ করে আনি আমার আবেদন কৃত সার্ভিস এর কাজ শেষ করে আমি উনাকে ভালো ভাবে চেক করেছে কিনা বলতে টেকনিশিয়ান নামঃ <strong>{data.staff.name}</strong> আমার সাথে খুবই খারাপ আচরণ করে যা আমি একজন কাস্টমার হয়ে সহ্য করতে পারি নাই বলে আমি আপনাদের কাছে এই অভিযোগ দায়ের করেছি। এমতবস্থায় টেকনিশিয়ান নামঃ <strong>{data.staff.name}</strong> এর জন্য আপনাদের সুনামধন্য কোম্পানী এস ই ইলেকট্রনিক্স এর সম্মান খুন্ন করেছে। ও আমি তাহার এই আচরণ এর জন্য এস ই ইলেকট্রনিক্স এর মহাপরিচালক / চেয়ারম্যান, এর কাছে এই বিষয়ে সঠিক যাচাই বাছাই করে বিচারের জন্য জোর আবেদন করছি।
          </p>
          {data.description && (
            <div className="mt-4 p-5 bg-gray-100/30 border-l-4 border-gray-400 italic rounded-r-2xl text-[14px]">
              " {data.description} "
            </div>
          )}
        </div>

        {/* Conclusion */}
        <div className="mb-10">
          <p className="font-bold mb-1">অতএব</p>
          <p className="leading-relaxed">আমার উপরক্ত অভিযোগ গ্রহণ করিয়া তদন্ত পূর্বক যাচাই বাছাই করে এই টেকনিশিয়ান এর বিরুদ্ধে কঠোর ব্যবস্থা গ্রহণ করবেন।</p>
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
            <p><strong>তারিখঃ</strong> {dateStr}</p>
            <p><strong>অভিযোগ ট্র্যাকিং নাম্বার:</strong> {data.complaintId}</p>
            <p><strong>অভিযোগ গ্রহন নাম্বার:</strong> SE {receiptNum}</p>
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

