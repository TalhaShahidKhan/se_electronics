"use client";

import { verifyAuthToken } from "@/actions";
import { DelayedLoading, RegistrationForm } from "@/components";
import { contactDetails } from "@/constants";
import { useThemeColor } from "@/hooks";
import { AppError } from "@/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function RegistrationPage({ token }: { token: string }) {
  useThemeColor("#9ca3af");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [showRequirements, setShowRequirements] = useState(true);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [name, setName] = useState("");
  const requirementsList = [
    { id: 1, text: "ভালো অভিজ্ঞতার জন্য গুগল ক্রোম ব্রাউজার (প্রস্তাবিত)" },
    {
      id: 2,
      text: "নিজ নামের এন আই ডি দিয়ে নিবন্ধিত মোবাইল সিম নাম্বার (আবশ্যক)",
    },
    { id: 3, text: "জাতীয় পরিচয়পত্র (আবশ্যক)" },
    {
      id: 4,
      text: "সব সময় চালু আছে এমন সচল মোবাইল নাম্বার নিজ নামে নিবন্ধিত (আবশ্যক)",
    },
    { id: 5, text: "নিজের চেহারার ছবি পাসপোর্ট সাইজ স্পষ্ট ছবি (আবশ্যক)" },
    { id: 10, text: "নাম স্থানীয় ও বর্তমান ঠিকানা (আবশ্যক)" },
    { id: 6, text: "নমিনির জাতীয় পরিচয়পত্র (প্রযোজ্য ক্ষেত্রে আবশ্যক)" },
    { id: 7, text: "ইউটিলিটি বিলের কপি (ঐচ্ছিক)" },
    { id: 8, text: "ই-মেইল (প্রযোজ্য ক্ষেত্রে আবশ্যক)" },
    { id: 9, text: "পেশার প্রমাণপত্র (প্রযোজ্য)" },
  ];

  useEffect(() => {
    verifyAuthToken(token)
      .then((res) => {
        setIsTokenValid(res.isValid);
        setIsVerifying(false);
      })
      .catch((err) => console.log(err));
  }, []);

  if (isVerifying) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <DelayedLoading />
      </div>
    );
  }

  if (!isVerifying && !isTokenValid) {
    throw new AppError("টোকেনটি সঠিক নয় বা মেয়াদ উত্তীর্ণ হয়ে গেছে।");
  }

  if (showRequirements) {
    return (
      <div className="max-w-xl mx-auto mt-6 sm:mt-10 bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-gray-100">
        <div className="mb-8">
          <div className="w-16 h-16 bg-brand/5 rounded-2xl flex items-center justify-center mb-6 mx-auto">
             <FileText className="text-brand" size={32} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand mb-2 text-center leading-tight">
            রেজিস্ট্রেশন নির্দেশিকা
          </h2>
          <p className="text-base sm:text-lg text-gray-500 text-center mb-8 leading-relaxed">
             এস ই ইলেকট্রনিকস সার্ভিস এজেন্ট হিসেবে যোগ দিতে নিচের প্রয়োজনীয় তথ্য ও নথিগুলো সাথে রাখুন।
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {requirementsList.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="bg-emerald-500 text-white rounded-lg flex items-center justify-center min-w-6 min-h-6 w-6 h-6 shrink-0 text-xs sm:text-sm font-bold">
                  ✓
                </span>
                <span className="text-sm sm:text-base font-bold text-gray-700 leading-tight">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-8 p-4 sm:p-6 bg-brand/5 rounded-xl border border-brand/10">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-5 h-5 mt-0.5 border-brand/30 rounded-md text-brand focus:ring-brand"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
            />
            <span className="text-sm sm:text-base font-bold text-gray-700 leading-snug">
              আমি সকল নিয়ম ও শর্তগুলোতে সম্মত আছি এবং সঠিক তথ্য প্রদানে অঙ্গীকার করছি।
            </span>
          </label>
        </div>

        <button
          className="w-full py-4 sm:py-5 bg-brand text-white rounded-2xl font-black text-lg sm:text-xl hover:bg-brand-800 active:scale-[0.98] transition-all shadow-lg shadow-brand/20 disabled:opacity-50"
          disabled={!isAgreed}
          onClick={() => setShowRequirements(false)}
        >
          আবেদন শুরু করুন
        </button>

        <div className="mt-8 space-y-3">
          <p className="text-sm text-gray-500 leading-relaxed text-center font-medium">
            ইতিমধ্যে আবেদন করে থাকলে আবেদনের স্ট্যাটাস জানতে আপনার নাম্বারে এসএমএস এ পাঠানো লিঙ্কে ক্লিক করুন।
          </p>
          <p className="text-xs text-gray-400 text-center font-bold">
            © SEIPSBD, All Rights Reserved.
          </p>
        </div>
      </div>
    );
  }

  if (showSuccessMessage) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle size={48} />
        </motion.div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-brand mb-4">অভিনন্দন {name}!</h2>
        <p className="text-lg sm:text-xl text-gray-600 max-w-md leading-relaxed mb-8 font-medium">
          আপনার রেজিস্ট্রেশন আবেদন সফলভাবে গৃহীত হয়েছে। আমাদের টিম আপনার তথ্য যাচাই করে দ্রুতই যোগাযোগ করবে।
        </p>
        <Link href="/" className="px-10 py-4 bg-brand text-white rounded-2xl font-black text-lg hover:bg-brand-800 transition-all shadow-lg shadow-brand/20">
          হোম পেজে ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-[1000px]">
        <div className="mb-6 flex flex-col gap-1 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
          <h1 className="text-2xl sm:text-3xl font-black text-brand leading-tight">
            এস ই ইলেকট্রনিকস সার্ভিস এজেন্ট নিয়োগ আবেদন
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-8 mt-4 text-base sm:text-lg text-gray-500">
            <span className="font-bold">হেল্পলাইন: <span className="text-brand font-black">{contactDetails.customerCare}</span></span>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span className="font-bold">Email: <span className="text-brand font-black">{contactDetails.email}</span></span>
          </div>
          <p className="text-sm sm:text-base text-gray-400 mt-2 uppercase tracking-wider font-bold">
            হেড অফিস: {contactDetails.headOffice}
          </p>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gray-50 p-4 border-b border-gray-100">
             <p className="text-sm font-bold text-gray-600 text-center">
               দয়া করে নিচের প্রতিটি ফিল্ড সঠিক তথ্য দিয়ে পূরণ করুন
             </p>
          </div>
          <div className="p-4 sm:p-8">
            <RegistrationForm
              mode="create"
              token={token}
              onRegistrationComplete={(name) => {
                setName(name);
                setShowSuccessMessage(true);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
