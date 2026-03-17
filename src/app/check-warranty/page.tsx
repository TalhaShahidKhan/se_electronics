"use client";

import { getInvoiceByNumber } from "@/actions";
import { contactDetails } from "@/constants";
import { calculateWarrantyEndDate, formatDate, isWarrantyValid } from "@/utils";
import { CheckIcon, TimerOff } from "lucide-react";
import { useState } from "react";

export default function CheckWarrantyPage() {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [warrantyData, setWarrantyData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!invoiceNumber.trim()) {
      setError("ইনভয়েস নম্বর প্রবেশ করান");
      return;
    }

    setLoading(true);
    setError("");
    setWarrantyData(null);

    try {
      // Replace with your actual API call
      const response = await getInvoiceByNumber(invoiceNumber);

      if (!response.success) {
        setError(`দুঃখিত এই ইনভয়েস নাম্বার দিয়ে কোন তথ্য পাওয়া যাইনি 
                    সম্ভবত এই ইনভয়েস নাম্বারটি এস ই ইলেকট্রনিকস সার্ভারের নয় সঠিক ইনভয়েস নাম্বার দিয়ে পুনরায় চেষ্টা করুন ধন্যবাদ।
                    `);
      } else {
        setWarrantyData(response.data);
      }
    } catch (err) {
      setError("একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="mx-auto max-w-[1200px] min-h-screen p-3 sm:p-4 flex flex-col gap-4"
      style={{ backgroundColor: "rgb(239, 246, 255)" }}
    >
      {/* Header */}
      <div className="font-bold flex flex-col gap-0.5 p-4 sm:p-6 rounded-md sm:rounded-md border border-gray-300 text-center bg-white shadow-sm">
        <div className="text-lg">
          এস ই ইলেকট্রনিকস প্রডাক্ট ওয়ারেন্টি ট্রেকিং
        </div>
        <div className="text-md">হেল্পলাইন : {contactDetails.customerCare}</div>
        <div className="text-md">Email : {contactDetails.email}</div>
        <div className="text-sm text-gray-500">
          হেড অফিস : {contactDetails.headOffice}
        </div>
      </div>

      {/* Search Form */}
      <div className="p-4 sm:p-6 border border-gray-200 rounded-md sm:rounded-md bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-4">ওয়ারেন্টি চেক করুন</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="ইনভয়েস নম্বর লিখুন"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md focus:outline-none focus:border-gray-300  transition-all"
            disabled={loading}
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-brand text-white rounded-md font-semibold hover:bg-brand-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all text-sm"
          >
            {loading ? "Checking..." : "Check"}
          </button>
        </div>
        {error && (
          <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {warrantyData && (
        <div className="space-y-3 mb-10">
          {/* Customer Info */}
          <div className="p-4 border border-gray-200 rounded-md sm:rounded-md bg-white shadow-sm">
            <h3 className="text-lg font-semibold mb-6 text-gray-800 border-b-2 pb-2 inline-block">
              গ্রাহকের তথ্য
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-lg">👤</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1">নাম</div>
                  <div className="font-semibold text-gray-800">
                    {warrantyData.customerName}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold text-lg">🆔</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1">
                    কাস্টমার আইডি
                  </div>
                  <div className="font-semibold text-gray-800">
                    {warrantyData.customerId}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold text-lg">📞</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1">ফোন নম্বর</div>
                  <div className="font-semibold text-gray-800">
                    {warrantyData.customerPhone}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-600 font-bold text-lg">📅</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1">
                    ক্রয়ের তারিখ
                  </div>
                  <div className="font-semibold text-gray-800">
                    {formatDate(warrantyData.date)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Card Grid - REPLACING THE TABLE */}
          <div className="border border-gray-200 rounded-md sm:rounded-md p-4 bg-white shadow-sm">
            <h3 className="text-xl font-bold mb-4 border-b pb-2 text-gray-800">
              Purchased Products
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {warrantyData.products.map((product: any, index: number) => {
                const isValid = isWarrantyValid(
                  product.warrantyStartDate,
                  product.warrantyDurationMonths,
                );
                const expireDate = calculateWarrantyEndDate(
                  product.warrantyStartDate,
                  product.warrantyDurationMonths,
                );

                return (
                  <div key={index} className="p-5 border rounded-md">
                    {/* Status Tag */}
                    <div className="mb-3">
                      {product.warrantyDurationMonths > 0 ? (
                        isValid ? (
                          <div className="inline-flex gap-2 items-center text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm font-semibold border border-green-300">
                            <CheckIcon className="w-4 h-4" />
                            ওয়ারেন্টি আছে
                          </div>
                        ) : (
                          <div className="inline-flex gap-2 items-center text-red-700 bg-red-100 px-3 py-1 rounded-full text-sm font-semibold border border-red-300">
                            <TimerOff className="w-4 h-4" />
                            ওয়ারেন্টি শেষ
                          </div>
                        )
                      ) : (
                        <div className="inline-flex gap-2 items-center text-gray-700 bg-gray-100 px-3 py-1 rounded-full text-sm font-semibold border border-gray-300">
                          ওয়ারেন্টি নেই
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      {product.type.toUpperCase()}
                    </h4>

                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600">
                        <div className="text-sm font-medium">
                          Model:{" "}
                          <span className="font-semibold text-gray-800">
                            {product.model}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        {product.warrantyDurationMonths === 0 ? (
                          <div className="text-sm font-medium">
                            Warranty:{" "}
                            <span className=" text-gray-400">N/A</span>
                          </div>
                        ) : (
                          <div className="text-sm font-medium">
                            Warranty:{" "}
                            <span className="font-semibold text-gray-800">
                              {product.warrantyDurationMonths} Months
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <div className="text-sm font-medium">
                          Warranty Start Date:{" "}
                          <span className="font-semibold text-gray-800">
                            {formatDate(product.warrantyStartDate)}
                          </span>
                        </div>
                      </div>
                      {product.warrantyDurationMonths > 0 && (
                        <div className="flex flex-col items-start text-gray-600 pt-2 border-t mt-3">
                          <div className="text-sm text-gray-500 mb-0.5">
                            {isValid
                              ? "ওয়ারেন্টি শেষ হবে:"
                              : "ওয়ারেন্টি শেষ হয়েছে:"}
                          </div>
                          <div className={`font-bold text-red-600`}>
                            {formatDate(expireDate)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
