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
      <div className="max-w-md mt-5 mx-auto bg-white p-4 rounded-md shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            রেজিস্ট্রেশন করতে যা যা লাগবে:
          </h2>
          <div className="space-y-5">
            {requirementsList.map((item) => (
              <div key={item.id} className="flex items-start">
                <span className="bg-green-500 text-white rounded-full flex items-center justify-center min-w-5 min-h-5 w-5 h-5">
                  ✓
                </span>
                <span className="ml-2 text-sm text-gray-700">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <label className="flex items-start">
            <input
              type="checkbox"
              className="w-4 h-4 mt-0.5 border-gray-300"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
            />
            <span className="ml-2 text-sm">
              আমি সকল নিয়ম ও শর্তগুলোতে সম্মত আছি
            </span>
          </label>
        </div>

        <button
          className="__btn w-full"
          disabled={!isAgreed}
          onClick={() => setShowRequirements(false)}
        >
          আবেদন করুন
        </button>

        <p className="mt-4 text-xs text-gray-600">
          ইতিমধ্যে আবেদন করে থাকলে আবেদনের স্ট্যাটাস জানতে আপনার নাম্বারে এসএমএস
          এ পাঠানো লিঙ্কে ক্লিক করুন।
        </p>
        <p className="mt-4 text-xs text-gray-500">
          রেজিস্ট্রেশন সফল হলে আপনার ঠিকানা যাচাইয়ের জন্য আপনার প্রদত্ত
          নিবন্ধিত মোবাইল নাম্বারে একটি 'ওয়েলকাম' লেটার প্রেরণ করা হবে।
        </p>
        <p className="mt-6 text-xs text-gray-400 text-center">
          SEIPSBD, একটি প্রতিষ্ঠান। সর্বস্বত্ব সংরক্ষিত।
        </p>
      </div>
    );
  }

  if (showSuccessMessage) {
    return (
      <div className="absolute inset-0 flex flex-col gap-4 items-center text-center px-4 justify-start pt-32 bg-blue-100">
        <div className={"text-green-600"}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={0.5}
            stroke="currentColor"
            className="size-28"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </div>
        <p className="text-2xl">
          প্রিয় {name}, আপনার রেজিস্ট্রেশন সম্পন্ন হয়েছে। আপনার তথ্য যাচাইয়ের পর
          আপনার সাথে যোগাযোগ করা হবে।
        </p>
        <Link href="/" className="__btn mt-8">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-[1000px] text-center p-4">
        <div className="h-full font-bold mb-4 flex flex-col gap-0.5 bg-gray-200 p-6 rounded-lg border border-gray-400">
          <div className="text-xl">
            এস ই ইলেকট্রনিকস সার্ভিস এজেন্ট নিয়োগ আবেদন ফর্ম
          </div>
          <div className="text-md">
            হেল্পলাইন : {contactDetails.customerCare}
          </div>
          <div className="text-md">Email : {contactDetails.email}</div>
          <div className="text-sm text-gray-500">
            হেড অফিস : {contactDetails.headOffice}
          </div>
        </div>
        <div className="flex flex-col gap-6 bg-gray-200 border-gray-400 border p-6 rounded-lg">
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
  );
}
