"use client";

import { createService } from "@/actions";
import { InputField } from "@/components";
import {
  contactDetails,
  batteryTypes,
  productPowerRatings,
  productTypes,
  ipsBrands,
  stabilizerBrands,
  stabilizerPowerRatings,
} from "@/constants";
import { useThemeColor } from "@/hooks";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";
import geoData from "@/assets/data/geo-data.json";

const requirementsList = [
  {
    title: "প্রয়োজনীয় যোগাযোগের তথ্য (Contact Information)",
    description: `সার্ভিসিং প্রক্রিয়া দ্রুত সম্পন্ন করার জন্য আপনার সম্পূর্ণ ও সঠিক তথ্য প্রদান করা অত্যাবশ্যক। ফর্মে নিম্নলিখিত তথ্যগুলি বাংলায় পূরণ করুন, নাম গ্রাহকের সম্পূর্ণ নাম গ্যারান্টি কার্ড বা অনলাইন ইনভয়েস অনুযায়ী, মোবাইল নাম্বার, যে নাম্বারে প্রতি মাসে ব্যাটারি পানির জন্য এস এম এস ও কল যার সেই নাম্বারটা, ঠিকানা (বর্তমান) আপনার বর্তমান যে আপনার আই পি এস ও ব্যাটারি বা আমাদের অন্যান্য ইলেকট্রনিক্স ডিভাইস আছে এর সম্পূর্ণ ঠিকানা, থানা, পোস্ট অফিস, জেলা`,
  },
  {
    title: "প্রোডাক্ট এবং ওয়ারেন্টি সংক্রান্ত ডকুমেন্টেশন",
    description:
      "আপনার প্রোডাক্টের ওয়ারেন্টি স্ট্যাটাস যাচাই এবং সমস্যার সঠিক কারণ অনুসন্ধানের জন্য নিম্নলিখিত ডকুমেন্টগুলি স্পষ্ট ছবি আকারে আপলোড করা বাধ্যতামূলক, নষ্ট প্রোডাক্টের ছবি (সামনের ও পিছনের) ২ টি ছবি, গ্যারান্টি কার্ডের ছবি, আপনার গ্যারান্টি কার্ডের ১টি স্পষ্ট ছবি আপলোড করতে হবে। গ্যারান্টি কার্ডের ছবি ছাড়া কোনো আবেদন গ্রহণ করা হবে না। বাধ্যতামূলক দিতে হবে, সমস্যার সংক্ষিপ্ত ভিডিও ১টি ভিডিও (সর্বোচ্চ ৬০ সেকেন্ড)",
  },
  {
    title:
      "আইপিএস এবং ব্যাটারির প্রযুক্তিগত বিবরণ (IPS & Battery Technical Details)",
    description:
      "প্রোডাক্টের ধরন আইপিএস IPS মডেল নম্বর, ভিএ (VA) রেটিং এবং ওয়াট (Watt) আউটপুট ক্ষমতা। ব্যাটারি ব্র্যান্ডের নাম  অন্যান্য BhatBattery মডেল নম্বর এবং ব্যাটারির অ্যাম্পিয়ার (Ah) উল্লেখ করতে হবে।",
  },
  {
    title:
      "সার্ভিসিং এবং ওয়ারেন্টির শর্তাবলী (Terms and Conditions of Servicing)",
    description:
      "সার্ভিসিং-এর খরচ ও প্রক্রিয়া সম্পূর্ণরূপে নিম্নলিখিত নিয়মের উপর নির্ভরশীল ওয়ারেন্টি সময়কালের মধ্যে (Under Warranty Period):​ফ্রি সার্ভিস: এস ই ইলেকট্রনিকস কর্তৃক নির্ধারিত গ্যারান্টি সময়কাল (ওয়ারেন্টি কার্ডে উল্লেখিত) মধ্যে যদি প্রোডাক্টে উৎপাদনজনিত (Manufacturing Defect) ত্রুটি দেখা দেয়, তবে সার্ভিসিং বা মেরামত সম্পূর্ণ বিনামূল্যে করা হবে।",
  },
  {
    title: "রিপ্লেসমেন্ট",
    description:
      "যদি উৎপাদনজনিত ত্রুটির কারণে মেরামত সম্ভব না হয়, তবে কোম্পানির নীতিমালা অনুযায়ী সমমানের বা উন্নতমানের নতুন একটি প্রোডাক্ট দিয়ে প্রতিস্থাপন (Replacement) করা হতে পারে।",
  },
  {
    title: "কুরিয়ার চার্জ",
    description:
      "ওয়ারেন্টি সময়কালে সার্ভিসিং-এর জন্য আমাদের সার্ভিস সেন্টারে প্রোডাক্ট পাঠানো এবং মেরামত শেষে ফেরত আনার কুরিয়ার চার্জ গ্রাহককে বহন করতে হতে পারে সিলেট সিটির বাইরে হতে অথবা কোম্পানি কর্তৃক আংশিক/সম্পূর্ণ বহন করা হতে পারে (কোম্পানির তৎকালীন নীতিমালা অনুসারে)।",
  },
  {
    title: "ওয়ারেন্টি সময়কালের বাইরে (Out of Warranty Period)",
    description: `সার্ভিস চার্জ প্রযোজ্যতা: যদি গ্যারান্টি সময়কাল শেষ হয়ে যায় বা ত্রুটি অপব্যবহার/বাহ্যিক কারণে (যেমন: অতিরিক্ত লোড, ভুল সংযোগ, প্রাকৃতিক দুর্যোগ,বজ্রপাত,  অগ্নিসংযোগ, পানি প্রবেশ, পোকামাকড় ইত্যাদি) সৃষ্টি হয়, তবে তা ওয়ারেন্টির আওতাভুক্ত হবে না।
        প্রদেয় মূল্য: এই ক্ষেত্রে, সার্ভিসিং-এর ধরন অনুযায়ী (যেমন: যন্ত্রাংশের মূল্য, টেকনিশিয়ান ফি, মেরামতের খরচ) একটি সার্ভিস চার্জ ধার্য করা হবে। সার্ভিসিং শুরু করার আগে এই চার্জ সম্পর্কে আপনাকে বিস্তারিত অবহিত করা হবে এবং আপনার সম্মতি সাপেক্ষে কাজ শুরু হবে।
        `,
  },
  {
    title: "কুরিয়ার চার্জ বা ভাড়া",
    description:
      "সিলেট সিটির বাইরে হলে  ওয়ারেন্টি-বহির্ভূত সার্ভিসের ক্ষেত্রে প্রোডাক্ট আনা-নেওয়ার সমস্ত কুরিয়ার চার্জ গ্রাহককে বহন করতে হবে।",
  },
  {
    title: "সাধারণ নিয়মাবলী (General Rules)",
    description: `তথ্যের সত্যতা: ফর্মে প্রদত্ত সকল তথ্য অবশ্যই সঠিক ও নির্ভুল হতে হবে। ভুল তথ্য প্রদানের কারণে আপনার সার্ভিসিং আবেদন বাতিল হতে পারে বা প্রক্রিয়া বিলম্বিত হতে পারে।
​যোগাযোগের সময়: আপনার অনলাইন আবেদন জমা দেওয়ার পর আপনার নাম্বারে সার্ভিস অনুরোধ গ্রহণের একটি এসএমএস চলে যাবে ২৪ থেকে ৪৮ ঘণ্টার মধ্যে (সরকারি ছুটির দিন বাদে) আমাদের টেকনিক্যাল টিম আপনার প্রদত্ত মোবাইল নাম্বারে যোগাযোগ করবে।
​কাস্টামারের বাসায় ডিভাইস মেরামত বা সার্ভিসিং-এর সময় কোনো ব্যক্তিগত পন্য লাইট, প্লাক, সকেট ক্ষতিগ্রস্ত হলে এস ই ইলেকট্রনিকস তার জন্য দায়ী থাকবে না।
​ত্রুটিপূর্ণ পণ্য ফেরত: সার্ভিসিং বা রিপ্লেসমেন্ট পাওয়ার জন্য ত্রুটিপূর্ণ প্রোডাক্টটি অবশ্যই আমাদের সার্ভিস সেন্টারে (কুরিয়ারের মাধ্যমে) অথবা আমাদের টিমের মাধ্যমে আনতে পারবেন গাড়ি ভাড়া প্রযোজ্য পৌঁছানোর ব্যবস্থা করতে হবে।
`,
  },
];

export default function GetServiceForm({
  preferredStaffId,
  customerId,
  customerData,
}: {
  preferredStaffId?: string;
  customerId?: string;
  customerData?: any;
}) {
  useThemeColor("#facc15");
  const [response, createServiceAction, isPending] = useActionState(
    createService,
    undefined,
  );
  const [showToC, setShowToC] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(
    customerData?.district || "",
  );
  const [selectedProductType, setSelectedProductType] = useState("");
  const districts = Object.keys(geoData);
  const thanas = geoData[selectedDistrict as keyof typeof geoData] || [];

  useEffect(() => {
    if (!isPending && response) {
      if (!response.success) {
        toast.error(response.message);
      }
    }
  }, [isPending]);

  if (response?.success) {
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
        <p className="text-xl">
          আসসালামু আলাইকুম প্রিয় স্যার/মেডাম আপনার তথ্য সঠিক ভাবে প্রেরণ করা
          হয়েছে। তথ্য যাচাইয়ের পর আমাদের দক্ষ ইঞ্জিনিয়ার টিম আপনার সাথে যোগাযোগ
          করবে সেই পর্যন্ত আমাদের সাথে থাকুন ধন্যবাদ।
        </p>
        <Link
          href={customerId ? "/customer/profile" : "/"}
          className="__btn mt-6"
        >
          {customerId ? "Back to Profile" : "Back to Home"}
        </Link>
      </div>
    );
  }

  if (showToC) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-3 md:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl text-center font-extrabold text-brand mb-4 leading-tight">
            এস ই ইলেকট্রনিকস: অনলাইন সার্ভিসিং-এর শর্তাবলী ও নির্দেশিকা
          </h2>
          <p className="text-base sm:text-lg text-gray-500 text-center mb-8 leading-relaxed">
            প্রিয় গ্রাহক, এস ই ইলেকট্রনিকস-এর আইপিএস, ব্যাটারি ও অন্যান্য
            ইলেকট্রনিক পণ্য অনলাইন সার্ভিসিং-এর জন্য আবেদন করার জন্য আপনাকে
            ধন্যবাদ। আপনার সমস্যার দ্রুত ও কার্যকর সমাধানের জন্য নিম্নলিখিত
            শর্তাবলী ও নির্দেশিকাগুলি অত্যন্ত মনোযোগ সহকারে পড়ুন এবং মেনে চলুন।
          </p>
          <div className="space-y-6 mt-4">
            {requirementsList.map((item, index) => (
              <div
                key={index}
                className="text-sm sm:text-base p-4 sm:p-6 rounded-xl border border-gray-100 relative"
              >
                {/* vertical dotted line */}
                {index !== requirementsList.length - 1 && (
                  <div className="absolute left-[26px] top-7 md:left-9 md:top-10 h-full border-l-2 border-dotted border-brand mt-2"></div>
                )}

                <div className="flex items-start gap-3 mb-2">
                  <span className="bg-brand text-white rounded-full flex items-center justify-center min-w-6 min-h-6 w-6 h-6 shrink-0 text-sm sm:text-sm font-bold z-10 ">
                    {index + 1}
                  </span>

                  <span className="font-bold text-gray-900">{item.title}</span>
                </div>

                <p className="text-gray-600 leading-relaxed pl-9">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-8 p-4 sm:p-6 bg-brand/5 rounded-xl border border-brand/10">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-5 h-5 mt-0.5 border-brand/30 rounded-md text-brand focus:ring-brand"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span className="text-sm sm:text-base font-bold text-gray-700 leading-snug">
              উপরোক্ত "এস ই ইলেকট্রনিকস অনলাইন সার্ভিসিং-এর শর্তাবলী ও
              নির্দেশিকা" আমি মনোযোগ সহকারে পড়েছি এবং এতে সম্মত হয়ে, আমার
              সার্ভিসিং আবেদন প্রক্রিয়া শুরু করতে চাই।
            </span>
          </label>
        </div>

        <button
          className="w-full py-4 sm:py-5 bg-brand text-white rounded-2xl font-black text-lg sm:text-xl hover:bg-brand-800 active:scale-[0.98] transition-all shadow-lg shadow-brand/20 disabled:opacity-50 disabled:grayscale"
          disabled={!agreed}
          onClick={() => setShowToC(false)}
        >
          এগিয়ে যান
        </button>
        <p className="mt-8 text-sm text-gray-400 text-center font-bold">
          © SEIPSBD, All Rights Reserved.
        </p>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-[1000px] text-center p-2 sm:p-4">
      <div className="font-bold mb-4 flex flex-col gap-1 bg-white p-4 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="text-2xl sm:text-3xl text-brand font-black">
          এস ই ইলেকট্রনিকস প্রডাক্ট অনলাইন সার্ভিসিং সেন্টার
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-8 mt-4 text-base sm:text-lg text-gray-600">
          <span className="font-bold">
            হেল্পলাইন:{" "}
            <span className="text-brand">{contactDetails.customerCare}</span>
          </span>
          <span className="hidden sm:inline text-gray-300">|</span>
          <span className="font-bold">
            Email: <span className="text-brand">{contactDetails.email}</span>
          </span>
        </div>
        <div className="text-sm sm:text-base text-gray-400 mt-2 font-medium">
          হেড অফিস : {contactDetails.headOffice}
        </div>

        <div className="border-2 border-brand/20 bg-brand/5 p-4 sm:p-6 rounded-2xl mt-6">
          <p className="font-black text-gray-700 mb-4 text-base sm:text-lg">
            যে কোন সহযোগীতা ও তথ্যের জন্য আমাদের সাথে আলাপ করুন
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <Link
              className="flex items-center justify-center h-12 bg-white border-2 border-brand/20 text-brand rounded-xl hover:bg-brand hover:text-white transition-all text-sm sm:text-base font-black"
              href={`sms:${contactDetails.sms}`}
            >
              এস এম এস
            </Link>
            <Link
              className="flex items-center justify-center h-12 bg-white border-2 border-brand/20 text-brand rounded-xl hover:bg-brand hover:text-white transition-all text-sm sm:text-base font-black"
              href={`tel:${contactDetails.phone}`}
            >
              ফোন কল
            </Link>
            <Link
              className="flex items-center justify-center h-12 bg-white border-2 border-brand/20 text-brand rounded-xl hover:bg-brand hover:text-white transition-all text-sm sm:text-base font-black"
              href={`tel:${contactDetails.customerCare}`}
            >
              কাস্টমার কেয়ার
            </Link>
            <Link
              className="flex items-center justify-center h-12 bg-white border-2 border-brand/20 text-brand rounded-xl hover:bg-brand hover:text-white transition-all text-sm sm:text-base font-black"
              href={`https://wa.me/${contactDetails.whatsApp}`}
            >
              ওয়াসআপ
            </Link>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-6 bg-white p-4 sm:p-10 rounded-2xl border border-gray-100 shadow-sm">
        <p className="text-center font-black text-gray-800 bg-brand/5 p-4 sm:p-6 rounded-2xl border border-brand/10 text-base sm:text-lg leading-relaxed">
          আপনার পণ্যের সার্ভিসং এর জন্য নিচের বক্স গুলা পূরণ করে আপনার পণ্যের
          সাভিসিং করার জন্য আমাদের SEIPSBD সার্ভিসং টিমকে সঠিক তথ্য দিয়ে
          সহযোগিতা করুন
        </p>
        <form action={createServiceAction} className="flex flex-col gap-6">
          <input type="hidden" name="staffId" value={preferredStaffId || ""} />
          <input type="hidden" name="customerId" value={customerId || ""} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <InputField
              label="নাম"
              name="customerName"
              defaultValue={customerData?.name || ""}
            />
            <InputField
              label="মোবাইল নাম্বার"
              name="customerPhone"
              type="tel"
              defaultValue={customerData?.phone || ""}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <InputField
              label="বর্তমান ঠিকানা"
              name="customerAddress"
              defaultValue={customerData?.address || ""}
            />
            <div className="flex-1 text-start">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-gray-700">
                  জেলা <span className="text-red-500 text-lg">*</span>
                </span>
                <select
                  required
                  name="customerAddressDistrict"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm transition-all focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                >
                  <option value="">নির্বাচন করুন</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district.charAt(0).toUpperCase() + district.slice(1)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="flex-1 text-start">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-gray-700">
                  থানা <span className="text-red-500 text-lg">*</span>
                </span>
                <select
                  required
                  name="customerAddressPoliceStation"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm transition-all focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                  defaultValue={customerData?.policeStation || ""}
                >
                  <option value="">নির্বাচন করুন</option>
                  {thanas.map((thana) => (
                    <option key={thana} value={thana}>
                      {thana.charAt(0).toUpperCase() + thana.slice(1)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <InputField
              label="পোস্ট অফিস"
              name="customerAddressPostOffice"
              defaultValue={customerData?.postOffice || ""}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <InputField label="মেমো নং" name="memoNumber" />
            <div className="flex-1 text-start">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-gray-700">
                  পণ্যের ধরণ <span className="text-red-500 text-lg">*</span>
                </span>
                <select
                  required
                  name="productType"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm transition-all focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                  value={selectedProductType}
                  onChange={(e) => setSelectedProductType(e.target.value)}
                >
                  <option value="">নির্বাচন করুন</option>
                  {productTypes.map((type, i) => (
                    <option key={type} value={type}>
                      {type.toUpperCase()}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          {(selectedProductType === "ips" ||
            selectedProductType === "battery") && (
            <div className="grid grid-cols-1">
              <div className="flex-1 text-start">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-gray-700">
                    আইপিএস ব্র্যান্ড{" "}
                    <span className="text-red-500 text-lg">*</span>
                  </span>
                  <select
                    required
                    name="ipsBrand"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm transition-all focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                  >
                    <option value="">নির্বাচন করুন</option>
                    {ipsBrands.map((model, i) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          )}
          {selectedProductType && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex-1 text-start">
                {selectedProductType === "others" ? (
                  <InputField
                    label="পণ্যের মডেল"
                    name="productModel"
                    required
                  />
                ) : (
                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-gray-700">
                      পণ্যের মডেল{" "}
                      <span className="text-red-500 text-lg">*</span>
                    </span>
                    <select
                      required
                      name="productModel"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm transition-all focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                    >
                      <option value="">নির্বাচন করুন</option>
                      {(selectedProductType === "stabilizer"
                        ? stabilizerBrands
                        : batteryTypes
                      ).map((model, i) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
              <div className="flex-1 text-start">
                {selectedProductType === "others" ? (
                  <InputField
                    label="পণ্যের ওয়াট/ভিএ"
                    name="powerRating"
                    required
                  />
                ) : (
                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-gray-700">
                      পণ্যের ওয়াট/ভিএ{" "}
                      <span className="text-red-500 text-lg">*</span>
                    </span>
                    <select
                      name="powerRating"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm transition-all focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                    >
                      <option value="">নির্বাচন করুন</option>
                      {(selectedProductType === "stabilizer"
                        ? stabilizerPowerRatings
                        : productPowerRatings
                      ).map((ratings, i) => (
                        <option key={ratings} value={ratings}>
                          {ratings}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1">
            <div className="flex-1 text-start">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-gray-700">
                  পণ্যেের সমস্যা <span className="text-red-500 text-lg">*</span>
                </span>
                <textarea
                  required
                  name="reportedIssue"
                  placeholder="পন্যের সমস্যা বিস্তারিত বর্ণনা করুন..."
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm transition-all focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none min-h-[120px]"
                ></textarea>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <InputField
              label="ওয়ারেন্টি কার্ডের ছবি"
              name="warrantyCardPhoto"
              type="file"
            />
            <InputField
              label="প্রোডাক্টের ছবি (সামনে)"
              placeholder="সামনের দিকের ছবি"
              name="productFrontPhoto"
              type="file"
            />
            <InputField
              label="প্রোডাক্টের ছবি (পেছনে)"
              placeholder="পেছনের দিকের ছবি"
              name="productBackPhoto"
              type="file"
            />
          </div>
          <button
            disabled={isPending}
            className="w-full py-4 bg-brand text-white rounded-2xl font-bold text-lg hover:bg-brand-800 active:scale-[0.98] transition-all shadow-lg shadow-brand/20 disabled:opacity-50 mt-4"
          >
            {isPending ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
