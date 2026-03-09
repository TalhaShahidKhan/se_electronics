"use client";

import { updateSubscriber } from "@/actions";
import geoData from "@/assets/data/geo-data.json";
import { InputField, Modal } from "@/components/ui";
import {
  batteryTypes,
  discounts,
  ipsBrands,
  productPowerRatings,
} from "@/constants";
import { useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";

const paymentTypes = [
  { value: "bkash", label: "বিকাশ" },
  { value: "nagad", label: "নগদ" },
  { value: "rocket", label: "রকেট" },
  { value: "bank", label: "ব্যাংক ট্রান্সফার" },
];

const voltSurcharges = {
  "12": 0,
  "24": 50,
  "36": 100,
  "48": 180,
};

const subscriptionDurations = [1, 3, 6, 12, 18, 24, 30, 36];

type SubscriptionPackage =
  | "battery_maintenance"
  | "ips_and_battery_maintenance"
  | "full_maintenance";
const prices = {
  battery_maintenance: 300,
  ips_and_battery_maintenance: 450,
  full_maintenance: 650,
};
export default function SubscriberEditModal({
  subscriber,
  onClose,
}: {
  subscriber: any;
  onClose: () => void;
}) {
  const [selectedPackage, setSelectedPackage] = useState<SubscriptionPackage>(
    subscriber.subscriptionType,
  );
  const [selectedDuration, setSelectedDuration] = useState<number>(
    subscriber.subscriptionDuration,
  );
  const [selectedPowerRating, setSelectedPowerRating] = useState(
    subscriber.ipsPowerRating,
  );
  const [paymentType, setPaymentType] = useState<string>(
    subscriber.paymentType,
  );
  const [response, updateServiceAction, isUpdating] = useActionState(
    updateSubscriber,
    undefined,
  );
  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    subscriber.district || "",
  );
  const districts = Object.keys(geoData);
  const thanas = geoData[selectedDistrict as keyof typeof geoData] || [];

  const match = selectedPowerRating?.match(/(\d+)\s*Volt/i);
  const volt = match ? match[1] : null;
  const surcharge = voltSurcharges[volt];
  const discount = discounts[selectedDuration];
  const monthlyTotalAmount = selectedPackage
    ? (prices[selectedPackage] + (surcharge || 0)) * selectedDuration
    : 0;
  const totalAmount = monthlyTotalAmount - (discount || 0);

  useEffect(() => {
    if (!isUpdating && response) {
      toast(response.message, { type: response.success ? "success" : "error" });
      if (response.success) {
        onClose();
      }
    }
  }, [isUpdating, response]);

  return (
    <Modal title="Edit Subscriber" isVisible={true} onClose={onClose}>
      <form className="space-y-6" action={updateServiceAction}>
        <input
          type="hidden"
          name="subscriptionId"
          value={subscriber.id}
          readOnly
        />
        <div className="flex flex-col sm:flex-row gap-4">
          <InputField
            defaultValue={subscriber.name}
            label="নাম"
            name="name"
            required
          />
          <InputField
            defaultValue={subscriber.phone}
            label="মোবাইল নাম্বার"
            name="phone"
            type="tel"
            required
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <InputField
            defaultValue={subscriber.streetAddress}
            label="বর্তমান ঠিকানা"
            name="streetAddress"
            required
          />
          <div className="flex-1 text-start">
            <label className="text-sm">
              জেলা <span className="text-red-500 text-lg">*</span>
              <select
                required
                name="customerAddressDistrict"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="__input p-0 px-2 mt-1 border"
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
                name="customerAddressPoliceStation"
                className="__input p-0 px-2 mt-1 border"
                defaultValue={subscriber.policeStation}
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
            defaultValue={subscriber.postOffice}
            label="পোস্ট অফিস"
            name="postOffice"
            required
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 text-start">
            <label className="text-sm">
              সাবস্ক্রিপশন প্যাকেজ{" "}
              <span className="text-red-500 text-lg">*</span>
              <select
                value={selectedPackage}
                required
                name="subscriptionType"
                onChange={(e) =>
                  setSelectedPackage(e.target.value as SubscriptionPackage)
                }
                className="__input p-0 px-2 mt-1 "
              >
                <option value="battery_maintenance">
                  ব্যাটারি রিফিল প্যাক (৳300/মাস)
                </option>
                <option value="ips_and_battery_maintenance">
                  আইপিএস ও ব্যাটারি রক্ষণাবেক্ষণ প্যাক (৳450/মাস)
                </option>
                <option value="full_maintenance">
                  সম্পূর্ণ রক্ষণাবেক্ষণ প্যাক (৳650/মাস)
                </option>
              </select>
            </label>
          </div>
          <div className="flex-1 text-start">
            <label className="text-sm">
              সাবস্ক্রিপশন মেয়াদ{" "}
              <span className="text-red-500 text-lg">*</span>
              <select
                required
                name="subscriptionDuration"
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(Number(e.target.value))}
                className="__input p-0 px-2 mt-1"
              >
                {subscriptionDurations.map((duration) => (
                  <option key={duration} value={duration}>
                    {duration} মাস{" "}
                    {duration !== 1 &&
                      `- ৳${discounts[duration as string]} ছাড়`}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 text-start">
            <label className="text-sm">
              ব্যাটারির ধরণ <span className="text-red-500 text-lg">*</span>
              <select
                defaultValue={subscriber.batteryType}
                required
                name="batteryType"
                className="__input p-0 px-2 mt-1 "
              >
                {batteryTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        {(selectedPackage === "ips_and_battery_maintenance" ||
          selectedPackage === "full_maintenance") && (
          <>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 text-start">
                <label className="text-sm">
                  আইপিএস ব্র্যান্ড{" "}
                  <span className="text-red-500 text-lg">*</span>
                  <select
                    defaultValue={subscriber.ipsBrand}
                    required
                    name="ipsBrand"
                    className="__input p-0 px-2 mt-1 "
                  >
                    {ipsBrands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="flex-1 text-start">
                <label className="text-sm">
                  আইপিএস পাওয়ার রেটিং{" "}
                  <span className="text-red-500 text-lg">*</span>
                  <select
                    required
                    name="ipsPowerRating"
                    value={selectedPowerRating}
                    onChange={(e) => setSelectedPowerRating(e.target.value)}
                    className="__input p-0 px-2 mt-1"
                  >
                    {productPowerRatings.map((rating) => {
                      const match = rating.match(/(\d+)\s*Volt/i);
                      const volt = match ? match[1] : null;
                      const surcharge = volt ? voltSurcharges[volt] : null;
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
        <div className="flex-1 text-start">
          <label className="text-sm">
            পেমেন্ট পদ্ধতি <span className="text-red-500 text-lg">*</span>
            <select
              required
              name="paymentType"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="__input p-0 px-2 mt-1 "
            >
              {paymentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {paymentType && paymentType !== "bank" && (
          <div className="flex flex-col sm:flex-row gap-4">
            <InputField
              defaultValue={subscriber.walletNumber}
              label="যে নাম্বারে পেমেন্ট করেছেন"
              name="walletNumber"
              required
            />
            <InputField
              defaultValue={subscriber.transactionId}
              label="ট্রানজেকশন আইডি"
              name="transactionId"
              required
            />
          </div>
        )}
        {paymentType === "bank" && (
          <>
            <div className="flex flex-col sm:flex-row gap-4">
              <InputField
                defaultValue={subscriber.bankInfo.bankName}
                label="ব্যাংকের নাম"
                name="bankName"
                required
              />
              <InputField
                defaultValue={subscriber.bankInfo.accountHolderName}
                label="একাউন্ট হোল্ডারের নাম"
                name="accountHolderName"
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <InputField
                defaultValue={subscriber.bankInfo.accountNumber}
                label="একাউন্ট নাম্বার"
                name="accountNumber"
                required
              />
              <InputField
                defaultValue={subscriber.bankInfo.branchName}
                label="ব্রাঞ্চের নাম"
                name="branchName"
                required
              />
            </div>
          </>
        )}

        {/* Price breakdown */}
        <div className="flex flex-col gap-3 mt-6 text-sm">
          <div className="flex justify-between">
            <p className="font-medium">Base Package Price:</p>
            <p className="font-medium">
              ৳{prices[selectedPackage].toLocaleString()}/month
            </p>
          </div>
          {surcharge !== 0 && surcharge && (
            <div className="flex justify-between">
              <p className="font-medium">{volt} Volt ব্যাটারির ক্ষেত্রে:</p>
              <p className="font-medium">+ ৳{surcharge.toLocaleString()}</p>
            </div>
          )}
          <div className="flex justify-between border-t pt-2">
            <p className="font-medium">
              Subtotal (for {selectedDuration} months):{" "}
            </p>
            <p className="font-medium">
              ৳{monthlyTotalAmount.toLocaleString()}
            </p>
          </div>
          {discount !== 0 && (
            <div className="flex justify-between">
              <p className="font-medium">
                With ৳{discount.toLocaleString()} Discount:
              </p>
              <p className="font-medium">
                <del className="text-gray-400">
                  ৳{monthlyTotalAmount.toLocaleString()}
                </del>
                &nbsp;<span className="">৳{totalAmount.toLocaleString()}</span>
              </p>
            </div>
          )}
          <div className="flex justify-between items-center">
            <p className="font-medium">Total:</p>
            <p className="font-semibold text-lg">
              ৳{totalAmount.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button type="submit" className="__btn">
            {isUpdating ? "Updating..." : "Update"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
