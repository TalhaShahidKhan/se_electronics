'use client'

import { createSubscriber } from "@/actions";
import { InputField, PaymentModal } from "@/components";
import { batteryTypes, discounts, ipsBrands, paymentDetails, productPowerRatings, contactDetails } from "@/constants";
import { useThemeColor } from "@/hooks";
import { validateFormData } from "@/utils";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import geoData from "@/assets/data/geo-data.json";
import { MobilePageHeader } from "@/components/layout";
import { Zap } from "lucide-react";

const subscriptionDurations = [1, 3, 6, 12, 18, 24, 30, 36];

const voltSurcharges = {
    '12': 0,
    '24': 50,
    '36': 100,
    '48': 180
}

const paymentTypes = [
    { value: "bkash", label: "বিকাশ" },
    { value: "nagad", label: "নগদ" },
    { value: "rocket", label: "রকেট" },
    { value: "bank", label: "ব্যাংক ট্রান্সফার" },
];

type SubscriptionPackage = {
    type: "battery_maintenance" | "ips_and_battery_maintenance" | "full_maintenance";
    name: string;
    price: number;
    description: string;
    features: string[];
};

const packages: SubscriptionPackage[] = [
    {
        type: "battery_maintenance",
        name: "ব্যাটারি রিফিল প্যাক",
        price: 300,
        description: "প্যাকেজে যা পাবেন",
        features: [
            "শুধুমাত্র ব্যাটারিতে ডিস্ট্রিল ওয়াটার রিফিল: আমরা আপনার ব্যাটারির প্রতিটি সেলে বিশেষভাবে প্রস্তুত করা ডিস্ট্রিল ওয়াটার রিফিল করে দেব। এর ফলে ব্যাটারির সঠিক চার্জিং ক্ষমতা বজায় থাকবে এবং এর জীবনকাল বৃদ্ধি পাবে।",
            "দ্রুত এবং ঝামেলামুক্ত সার্ভিস: এই প্যাকেজটি খুব দ্রুত সম্পন্ন করা হয়, যাতে আপনার মূল্যবান সময় নষ্ট না হয়।"
        ]
    },
    {
        type: "ips_and_battery_maintenance",
        name: "আইপিএস ও ব্যাটারি রক্ষণাবেক্ষণ প্যাক",
        price: 450,
        description: "প্যাকেজে যা পাবেন",
        features: [
            "ব্যাটারিতে ডিস্ট্রিল ওয়াটার রিফিল: আপনার ব্যাটারির প্রতিটি সেলে সঠিক পরিমাণে ডিস্ট্রিল ওয়াটার রিফিল করা হবে, যা ব্যাটারির দীর্ঘস্থায়ী কার্যকারিতার জন্য অপরিহার্য।",
            "আইপিএস ও ব্যাটারি চেকআপ: আমাদের দক্ষ টেকনিশিয়ানরা আপনার আইপিএস এবং ব্যাটারির বর্তমান অবস্থা পুঙ্খানুপুঙ্খভাবে পরীক্ষা করবেন। এর মাধ্যমে কোনো ছোটখাটো সমস্যা শুরুতেই চিহ্নিত করা যাবে এবং বড় ধরনের ক্ষতি এড়ানো সম্ভব হবে।",
            "ভোল্টেজ ও চার্জিং সিস্টেম চেক: আপনার আইপিএস-এর ভোল্টেজ ও চার্জিং সিস্টেম সঠিকভাবে কাজ করছে কিনা, তা যাচাই করা হবে। এতে ব্যাটারি অতিরিক্ত চার্জ হওয়া বা কম চার্জ হওয়ার মতো সমস্যাগুলো এড়ানো যাবে।"
        ]
    },
    {
        type: "full_maintenance",
        name: "সম্পূর্ণ রক্ষণাবেক্ষণ প্যাক",
        price: 650,
        description: "প্যাকেজে যা পাবেন",
        features: [
            "ডিস্টিল ওয়াটার রিফিল: ব্যাটারির নির্দিষ্ট সেলে সঠিক পরিমাণে বিশুদ্ধ ডিস্ট্রিল ওয়াটার রিফিল করে এর কার্যক্ষমতা সর্বোচ্চ পর্যায়ে রাখা হবে।",
            "আইপিএস ও ব্যাটারির পুঙ্খানুপুঙ্খ পরীক্ষা-নিরীক্ষা: আমাদের দক্ষ টেকনিশিয়ানরা আইপিএস-এর কানেকশন পয়েন্টগুলো পরীক্ষা করবেন। পাশাপাশি, ব্যাটারির টার্মিনালগুলো পরিষ্কার করবে যাতে ক্ষয় রোধ করা হয়।",
            "দীর্ঘস্থায়ী করার টিপস ও পরামর্শ: আমাদের টেকনিশিয়ানরা আপনাকে আইপিএস এবং ব্যাটারির সঠিক ব্যবহার এবং রক্ষণাবেক্ষণ সম্পর্কে মূল্যবান টিপস দেবেন, যা আপনার সিস্টেমের জীবনকাল বাড়ে দ্রুত নষ্ট না হয় দির্ঘ্যস্থায়ীত্ব বাড়িয়ে দিতে পারে।",
            "আইপিএস ও ব্যাটারি পরিষ্কার-পরিচ্ছন্ন করা: আইপিএস এবং ব্যাটারির বাইরের অংশ এবং ভেন্টগুলো থেকে ধুলোবালি ও ময়লা পরিষ্কার করা হবে, যা সিস্টেমের অতিরিক্ত গরম হওয়া রোধ করে।"
        ]
    }
];

const requirementsList = [
    { id: 1, text: 'এই সেবা মাসিক প্যাকেজের অধীনে এস ই ইলেকট্রনিকস আপনার আইপিএস ও ব্যাটারির নিয়মিত রক্ষণাবেক্ষণ সেবা প্রদান করবে। এর মধ্যে রয়েছে মাসিক আই পি এস ও ব্যাটারি পরীক্ষা, ব্যাটারির পানি পরীক্ষা ও টপ-আপ (যদি প্রয়োজন হয়), টার্মিনাল পরিষ্কারকরণ এবং সার্বিক কর্মক্ষমতা যাচাই।' },
    { id: 2, text: 'সাবস্ক্রিপশনটি মাসিক ভিত্তিতে নবায়নযোগ্য। গ্রাহক চাইলে যেকোনো মাসে তা বাতিল করতে পারবেন (বাতিলকরণের শর্তাবলী প্রযোজ্য)' },
    {
        id: 3, text: `প্রয়োজনীয় তথ্য গ্রাহককে নিম্নলিখিত তথ্যগুলি সঠিকভাবে পূরণ করতে হবে:
​নাম (পূর্ণ নাম):​মোবাইল নাম্বার: সব সময় সচল যোগাযোগ এবং মোবাইল ওয়ালেট পেমেন্টের জন্য
​ঠিকানা বাসা/হোল্ডিং নং, থানা,পোস্ট অফিস,জেলা
` },
    { id: 4, text: 'কত মাসের জন্য সাবস্ক্রিপশন (প্রথমবার বা অগ্রিম পেমেন্টের ক্ষেত্রে)' },
    {
        id: 5, text: `আইপিএস ও ব্যাটারির বিবরণ
 গ্রাহক তার আইপিএস ও ব্যাটারির সঠিক বিবরণ প্রদান করতে হবে ​আইপিএস ভিএ (VA): (যেমন: 600VA, 1200VA)
​আইপিএস ওয়াট (Watt): (যদি জানা থাকে)
​ব্যাটারির এম্পিয়ার (Ah): (যেমন: 100Ah, 150Ah, 200Ah)

` },
    {
        id: 6, text: `রক্ষণাবেক্ষণ সেবা শুধুমাত্র ফর্মে উল্লিখিত আইপিএস এবং ব্যাটারির উপর প্রযোজ্য হবে
 আই পি এস ও ব্যাটারির বয়স বা পূর্বের রক্ষণাবেক্ষণের অবস্থার উপর ভিত্তি করে সেবার সফলতা নির্ভর করতে পারে। এস ই ইলেকট্রনিকস রক্ষণাবেক্ষণ সেবার মাধ্যমে ব্যাটারির আই পি এস আয়ু বাড়াতে সহযোগিতা করবে, তবে আই পি এস ও ব্যাটারির সম্পূর্ণ কার্যকারিতার গ্যারান্টি প্রদান করে না।
` },
    { id: 7, text: 'পেমেন্ট সিস্টেম ​মাসিক ফি: নির্ধারিত মাসিক ফি অবশ্যই মাসের শুরুতে বা নির্দিষ্ট তারিখের মধ্যে পরিশোধ করতে হবে।' },
    {
        id: 8, text: `পেমেন্ট পদ্ধতি: গ্রাহক নিম্নলিখিত পদ্ধতির মাধ্যমে মাসিক ফি পরিশোধ করতে পারবেন:
​মোবাইল ওয়ালেট (Mobile Wallet): (যেমন: বিকাশ, নগদ, রকেট ইত্যাদি। প্রযোজ্য ওয়ালেটগুলো ফর্মের মাধ্যমে জানানো হবে।)
​ডাচ বাংলা ব্যাংক অ্যাকাউন্ট (Dutch Bangla Bank Account): (অ্যাকাউন্ট নম্বর ফর্মে উল্লেখ করা থাকবে।)
` },
    {
        id: 9, text: `পেমেন্টের সময় যেকোনো ট্রানজেকশন ফি (Transaction Fee) গ্রাহককে বহন করতে হবে।
নির্ধারিত সময়ের মধ্যে পেমেন্ট পরিশোধ না করা হলে, সেবা প্রদান সাময়িকভাবে স্থগিত হতে পারে।
` },
    {
        id: 10, text: `অন্যান্য শর্তাবলী সেবার সময়সূচি রক্ষণাবেক্ষণ সেবার জন্য এস ই ইলেকট্রনিকস থেকে টেকনিশিয়ান যাওয়ার সময়সূচি গ্রাহকের সাথে আলোচনা সাপেক্ষে নির্ধারিত হবে।
 অতিরিক্ত খরচ: যদি নিয়মিত রক্ষণাবেক্ষণের বাইরে কোনো যন্ত্রাংশ পরিবর্তন বা বড় ধরনের মেরামতের প্রয়োজন হয়, তবে তা এই প্যাকেজের অন্তর্ভুক্ত হবে না। সেই ক্ষেত্রে অতিরিক্ত খরচ সম্পর্কে গ্রাহককে আগে জানানো হবে এবং গ্রাহকের সম্মতি সাপেক্ষে কাজ করা হবে।
পরিবর্তন ও সিটির বাইরে হলে  এস ই ইলেকট্রনিকস যেকোনো সময় এই শর্তাবলী পরিবর্তনের অধিকার সংরক্ষণ করে। পরিবর্তনের ক্ষেত্রে গ্রাহককে যথাযথ উপায়ে অবহিত করা হবে। এবং সিলেট সিটির বাইরে হলে গ্রাহক সাবস্ক্রিপশন ফ্রি ছাড়া আলাদা গাড়ি ভাড়া বহন করা লাগবে
` },
];

export default function MaintenancePlans() {
    useThemeColor('#3b82f6')
    const [response, createServiceAction, isPending] = useActionState(createSubscriber, undefined);
    const [selectedPackage, setSelectedPackage] = useState<SubscriptionPackage | null>(null);
    const [selectedDuration, setSelectedDuration] = useState<number>(1);
    const [selectedDistrict, setSelectedDistrict] = useState('')
    const [selectedPowerRating, setSelectedPowerRating] = useState('')
    const [paymentType, setPaymentType] = useState<string>("");
    const [showToC, setShowToC] = useState(true)
    const [agreed, setAgreed] = useState(false)
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const formRef = useRef<HTMLFormElement>(null)
    const districts = Object.keys(geoData)
    const thanas = geoData[selectedDistrict as keyof typeof geoData] || []

    const match = selectedPowerRating.match(/(\d+)\s*Volt/i);
    const volt = match ? match[1] : null;
    const surcharge = (volt && volt in voltSurcharges) ? voltSurcharges[volt as keyof typeof voltSurcharges] : 0;
    const durationKey = selectedDuration.toString();
    const discount = (durationKey in discounts) ? (discounts as any)[durationKey] : 0;
    const monthlyTotalAmount = selectedPackage ? (selectedPackage.price + (surcharge || 0)) * selectedDuration : 0;
    const totalAmount = monthlyTotalAmount - (discount || 0);

    const proceedToPayment = () => {
        const form = formRef.current
        if (!form) return
        const formData = new FormData(form)
        const result = validateFormData(formData)
        if (result.valid) {
            setShowPaymentModal(true)
        } else {
            toast.error('অনুগ্রহ করে প্রয়োজনীয় তথ্য পূরণ করুন।')
        }
    }

    useEffect(() => {
        if (!isPending && response) {
            if (!response.success) {
                toast.error(response.message);
            }
        }
    }, [isPending, response]);


    if (response?.success) {
        return (
            <div className="absolute inset-0 flex flex-col gap-4 items-center text-center px-4 justify-start pt-32 bg-blue-100">
                <div className={'text-green-600'}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor" className="size-28">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </div>
                <p className="text-2xl">আসসালামু আলাইকুম প্রিয় স্যার/মেডাম আপনার তথ্য সঠিক ভাবে প্রেরণ করা হয়েছে। তথ্য যাচাইয়ের পর টেকনিশিয়ান টিম আপনার সাথে যোগাযোগ করবে সেই পর্যন্ত আমাদের সাথে থাকুন ধন্যবাদ।</p>
                <Link href="/customer/profile" className="__btn mt-6">
                    Back to Profile
                </Link>
            </div>
        );
    }

    if (showToC) {
        return (
            <div className="max-w-3xl mx-auto bg-white p-4 rounded-md shadow-sm">
                <div className="mb-6">
                    <h2 className="text-xl text-center font-semibold text-gray-800 mb-4">​এস ই ইলেকট্রনিকস – আইপিএস ও ব্যাটারি রক্ষণাবেক্ষণ মাসিক প্যাকেজ সাবস্ক্রিপশন শর্তাবলী:</h2>
                    <p className="text-sm text-gray-500">
                        সাবস্ক্রিপশন ফর্মে এগিয়ে যাওয়ার আগে অনুগ্রহ করে নিচের শর্তাবলী মনোযোগ সহকারে পড়ুন। এই পরিষেবা গ্রহণ করলে আপনি নিম্নলিখিত শর্তাবলীতে সম্মত হবেন।
                    </p>
                    <div className="space-y-5 mt-4">
                        {requirementsList.map((item) => (
                            <div key={item.id} className="flex items-start">
                                <span className="bg-primary text-white rounded-full flex items-center justify-center min-w-5 min-h-5 w-5 h-5">✓</span>
                                <span className="ml-2 text-sm">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mb-6">
                    <p className="text-sm text-gray-500">
                        এই শর্তাবলীর কোনো প্রকার লঙ্ঘন হলে, এস ই ইলেকট্রনিকস পূর্ব ঘোষণা সাপেক্ষে গ্রাহকের সাবস্ক্রিপশন  বাতিল করার অধিকার রাখে।
                    </p>
                    <label className="flex items-start mt-4">
                        <input
                            type="checkbox"
                            className="w-4 h-4 mt-0.5 border-gray-300"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                        />
                        <span className="ml-2 text-sm">
                            আমি এস ই ইলেকট্রনিকস এর মাসিক সাবস্ক্রিপশন প্যাকেজের শর্তাবলী মনোযোগ সহকারে পড়েছি এবং এতে সম্মত।
                        </span>
                    </label>
                </div>

                <button
                    className="__btn w-full"
                    disabled={!agreed}
                    onClick={() => setShowToC(false)}
                >
                    এগিয়ে যান
                </button>
                <p className="mt-6 text-xs text-gray-400 text-center">
                    SEIPSBD, একটি প্রতিষ্ঠান। সর্বস্বত্ব সংরক্ষিত।
                </p>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-[1200px] text-center p-3">
            <div className="h-full font-bold mb-4 flex flex-col gap-0.5 p-6 rounded-lg border-2">
                <div className="text-xl">এস ই ইলেকট্রনিকস কাস্টমার সার্ভিস সেন্টার</div>
                <div className="text-md">হেল্পলাইন : {contactDetails.customerCare}</div>
                <div className="text-md">Email : {contactDetails.email}</div>
                <div className="text-sm text-gray-500">হেড অফিস : {contactDetails.headOffice}</div>
            </div>

            {/* Pricing Cards */}
            <div className="my-8">
                <h2 className="text-2xl font-bold mb-6">আমাদের প্যাকেজ সমূহ</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {packages.map((pkg) => (
                        <div
                            key={pkg.type}
                            onClick={() => {
                                setSelectedPackage(pkg)
                                if (pkg.type === 'battery_maintenance') {
                                    setSelectedPowerRating('')
                                }
                            }}
                            className={`border-2 rounded-lg p-6 cursor-pointer ${selectedPackage?.type === pkg.type
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 bg-white hover:border-blue-300'
                                }`}
                        >
                            <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                            <div className="text-3xl font-bold text-blue-600 mb-4">৳{pkg.price}/মাস</div>
                            <p className="text-sm font-semibold text-gray-700 mb-3">{pkg.description}</p>
                            <div className="text-left space-y-3">
                                {pkg.features.map((feature, index) => {
                                    const colonIndex = feature.indexOf(':');
                                    if (colonIndex > -1) {
                                        const title = feature.substring(0, colonIndex + 1);
                                        const description = feature.substring(colonIndex + 1);
                                        return (
                                            <div key={index} className="text-sm">
                                                <div className="flex items-start gap-2">
                                                    <span className="text-green-600 mt-0.5 flex-shrink-0">✓</span>
                                                    <span className="font-semibold">{title}</span>
                                                </div>
                                                <p className="text-gray-600 ml-6">{description}</p>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div key={index} className="flex items-start gap-2 text-sm">
                                            <span className="text-green-600 mt-0.5 flex-shrink-0">✓</span>
                                            <span className="text-gray-600">{feature}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Form - Only shown after package selection */}
            {selectedPackage && (
                <div className="flex flex-col gap-6 border-2 p-6 rounded-lg bg-white">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="font-semibold text-lg">নির্বাচিত প্যাকেজ: {selectedPackage.name}</p>
                        <p className="text-gray-700">মাসিক মূল্য: ৳{selectedPackage.price}</p>
                    </div>

                    <form ref={formRef} action={createServiceAction} className="flex flex-col gap-6">
                        <input type="hidden" name="subscriptionType" value={selectedPackage.type} />

                        <p className="text-center font-semibold text-lg border-b pb-2">
                            ব্যক্তিগত তথ্য
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <InputField label="নাম" name="name" required />
                            <InputField label="মোবাইল নাম্বার" name="phone" type="tel" required />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <InputField label="বর্তমান ঠিকানা" name="streetAddress" required />
                            <div className="flex-1 text-start">
                                <label className="text-sm">
                                    জেলা <span className="text-red-500 text-lg">*</span>
                                    <select
                                        required
                                        name="district"
                                        value={selectedDistrict}
                                        onChange={(e) => setSelectedDistrict(e.target.value)}
                                        className="__input p-0 px-2 mt-1"
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

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 text-start">
                                <label className="text-sm">
                                    থানা <span className="text-red-500 text-lg">*</span>
                                    <select
                                        required
                                        name="policeStation"
                                        className="__input p-0 px-2 mt-1"
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
                            <InputField label="পোস্ট অফিস" name="postOffice" required />
                        </div>

                        <p className="text-center font-semibold text-lg border-b pb-2 mt-4">
                            সাবস্ক্রিপশন তথ্য
                        </p>

                        {/* Battery Type */}
                        <div className="flex-1 text-start">
                            <label className="text-sm">
                                ব্যাটারির ধরণ <span className="text-red-500 text-lg">*</span>
                                <select required name="batteryType" className="__input p-0 px-2 mt-1">
                                    <option value="">নির্বাচন করুন</option>
                                    {batteryTypes.map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        {/* IPS fields - only for ips_and_battery and full_maintenance */}
                        {(selectedPackage.type === "ips_and_battery_maintenance" || selectedPackage.type === "full_maintenance") && (
                            <>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1 text-start">
                                        <label className="text-sm">
                                            আইপিএস ব্র্যান্ড <span className="text-red-500 text-lg">*</span>
                                            <select required name="ipsBrand" className="__input p-0 px-2 mt-1">
                                                <option value="">নির্বাচন করুন</option>
                                                {ipsBrands.map((brand) => (
                                                    <option key={brand} value={brand}>{brand}</option>
                                                ))}
                                            </select>
                                        </label>
                                    </div>
                                    <div className="flex-1 text-start">
                                        <label className="text-sm">
                                            আইপিএস পাওয়ার রেটিং <span className="text-red-500 text-lg">*</span>
                                            <select required name="ipsPowerRating" value={selectedPowerRating} onChange={(e) => setSelectedPowerRating(e.target.value)} className="__input p-0 px-2 mt-1">
                                                <option value="">নির্বাচন করুন</option>
                                                {productPowerRatings.map((rating) => {
                                                    const match = rating.match(/(\d+)\s*Volt/i);
                                                    const volt = match ? match[1] : null;
                                                    const surcharge = volt ? voltSurcharges[volt as keyof typeof voltSurcharges] : null;
                                                    const label = surcharge
                                                        ? `${rating}  + ৳${surcharge}`
                                                        : rating;

                                                    return (
                                                        <option key={rating} value={rating}>
                                                            {label}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </label>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Duration Selection */}
                        <div className="flex-1 text-start">
                            <label className="text-sm">
                                সাবস্ক্রিপশন মেয়াদ <span className="text-red-500 text-lg">*</span>
                                <select
                                    required
                                    name="subscriptionDuration"
                                    value={selectedDuration}
                                    onChange={(e) => setSelectedDuration(Number(e.target.value))}
                                    className="__input p-0 px-2 mt-1"
                                >
                                    {subscriptionDurations.map((duration) => (
                                        <option key={duration} value={duration}>
                                            {duration} মাস {duration !== 1 && `- ৳${discounts[duration as unknown as keyof typeof discounts]} ছাড়`}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <p className="text-center font-semibold text-lg border-b pb-2 mt-4">
                            Order Summary
                        </p>

                        {/* Payment Instructions Note */}
                        <div className="bg-gray-100 p-3 rounded text-sm text-left text-gray-700">
                            <p className="font-semibold mb-1">নোট:</p>
                            <p>সিলেট সিটির বাহিরে হলে যাতায়াত খরচ প্রযোজ্য হবে।</p>
                        </div>

                        {/* Price breakdown */}
                        <div className="flex flex-col gap-3 mt-6 text-sm">
                            <div className="flex justify-between">
                                <p className="font-medium">Base Package Price:</p>
                                <p className="font-medium">৳{selectedPackage.price.toLocaleString()}/month</p>
                            </div>
                            {(surcharge !== 0 && surcharge) &&
                                <div className="flex justify-between">
                                    <p className="font-medium">{volt} Volt ব্যাটারির ক্ষেত্রে:</p>
                                    <p className="font-medium">+ ৳{surcharge.toLocaleString()}</p>
                                </div>
                            }
                            <div className="flex justify-between border-t pt-2">
                                <p className="font-medium">Subtotal (for {selectedDuration} months): </p>
                                <p className="font-medium">৳{monthlyTotalAmount.toLocaleString()}</p>
                            </div>
                            {discount !== 0 &&
                                <div className="flex justify-between">
                                    <p className="font-medium">With <span className="text-green-600 font-bold">৳{discount.toLocaleString()}</span> Discount:</p>
                                    <p className="font-medium"><del className="text-gray-400">৳{monthlyTotalAmount.toLocaleString()}</del>&nbsp;<span className="">৳{totalAmount.toLocaleString()}</span></p>
                                </div>
                            }
                            <div className="flex justify-between items-center">
                                <p className="font-medium">Total:</p>
                                <p className="font-semibold text-lg">৳{totalAmount.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Payment Type */}
                        <div className="flex-1 text-start">
                            <label className="text-sm">
                                পেমেন্ট পদ্ধতি <span className="text-red-500 text-lg">*</span>
                                <select
                                    required
                                    name="paymentType"
                                    value={paymentType}
                                    onChange={(e) => setPaymentType(e.target.value)}
                                    className="__input p-0 px-2 mt-1"
                                >
                                    <option value="">নির্বাচন করুন</option>
                                    {paymentTypes.map((type) => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        {/* Proceed to Payment Button */}
                        <button
                            type="button"
                            onClick={proceedToPayment}
                            className="__btn"
                        >
                            Proceed to Payment
                        </button>

                        <PaymentModal
                            isOpen={showPaymentModal}
                            isSubmitting={isPending}
                            onClose={() => setShowPaymentModal(false)}
                            paymentType={paymentType as 'bkash' | 'nagad' | 'rocket' | 'bank'}
                            amount={totalAmount}
                            paymentDetails={
                                paymentType === 'bank'
                                    ? paymentDetails.bank
                                    : paymentDetails[paymentType as 'bkash' | 'nagad' | 'rocket']
                            }
                        />
                    </form>
                </div>
            )}
        </div>
    );
}