"use client";

import { createService } from "@/actions";
import { contactDetails, productTypes } from "@/constants";
import { useSideNavContext } from "@/hooks";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function AddServicePage() {
  const [response, createServiceAction, isPending] = useActionState(
    createService,
    undefined,
  );
  const [hasEmptyField, setHasEmptyField] = useState(true);
  const { openSideNav } = useSideNavContext();

  const checkEmptyField = (event: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    const tempServiceInfo = Object.fromEntries(formData);
    setHasEmptyField(
      Object.values(tempServiceInfo).some(
        (value) => value.toString().trim() === "",
      ),
    );
  };

  useEffect(() => {
    if (!isPending && response) {
      toast(response.message, {
        type: response.success ? "success" : "error",
      });
    }
  }, [isPending]);

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto py-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Add New Service</h1>
        </div>
      </header>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <form
          action={createServiceAction}
          onChange={checkEmptyField}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="customerName"
                className="text-sm font-semibold text-gray-700 mb-2 block"
              >
                Customer Name
              </label>
              <input
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="John Doe"
                type="text"
                name="customerName"
                id="customerName"
              />
            </div>
            <div>
              <label
                htmlFor="customerPhone"
                className="text-sm font-semibold text-gray-700 mb-2 block"
              >
                Phone Number
              </label>
              <input
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="01XXX-XXXXXX"
                type="text"
                name="customerPhone"
                id="customerPhone"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="customerAddress"
              className="text-sm font-semibold text-gray-700 mb-2 block"
            >
              Address
            </label>
            <input
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="123 Street, Dhaka"
              type="text"
              name="customerAddress"
              id="customerAddress"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="productType"
                className="text-sm font-semibold text-gray-700 mb-2 block"
              >
                Product Type
              </label>
              <select
                name="productType"
                id="productType"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                {productTypes.map((productType) => (
                  <option key={productType} value={productType}>
                    {productType.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="productModel"
                className="text-sm font-semibold text-gray-700 mb-2 block"
              >
                Product Model
              </label>
              <input
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="E.g. SE-1000"
                type="text"
                name="productModel"
                id="productModel"
              />
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <label className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 block">
              SMS Preview
            </label>
            <p className="text-sm text-blue-800 leading-relaxed italic">
              "প্রিয় গ্রাহক [Customer Name] SE ELECTRONICS আপনার সার্ভিসিং এর
              অনুরোধটি গ্রহণ করা হয়েছে সার্ভিস আই ডি নং [Service Id] ধন্যবাদ
              আমাদের সাথে থাকার জন্য যে কোন তথ্যের জন্য{" "}
              {contactDetails.customerCare}"
            </p>
          </div>

          <button
            disabled={isPending || hasEmptyField}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:bg-gray-300 disabled:shadow-none mt-4"
          >
            {isPending ? "Processing..." : "Assign & Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}
