"use client";

import {
  createStaff,
  getStaffMediaUrls,
  getTOSContent,
  updateStaff,
} from "@/actions";
import geoData from "@/assets/data/geo-data.json";
import { InputField, Spinner } from "@/components/ui";
import { StaffsType } from "@/types";
import { useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function RegistrationForm({
  mode,
  staffData,
  token,
  onRegistrationComplete,
}: {
  mode: "create" | "update";
  staffData?: StaffsType;
  token?: string;
  onRegistrationComplete?: (name: string) => void;
}) {
  const [hasRepairExperience, setHasRepairExperience] = useState(
    staffData?.hasRepairExperience || false,
  );
  const [hasInstallationExperience, setHasInstallationExperience] = useState(
    staffData?.hasInstallationExperience || false,
  );
  const [paymentPreference, setPaymentPreference] = useState(
    staffData?.paymentPreference || "bkash",
  );
  const [createResponse, createStaffAction, isRegistering] = useActionState(
    createStaff,
    undefined,
  );
  const [updateResponse, updateStaffAction, isUpdating] = useActionState(
    (_prevState: unknown, formData: FormData) =>
      updateStaff(staffData!.staffId, formData),
    undefined,
  );
  const [nidDocsImages, setNidDocsImages] = useState<{
    nidFrontPhoto: string;
    nidBackPhoto: string;
  } | null>(null);
  const [tosContent, setTosContent] = useState("");
  const [selectedCurrentDistrict, setSelectedCurrentDistrict] = useState(
    staffData?.currentDistrict || "",
  );
  const [selectedPermanentDistrict, setSelectedPermanentDistrict] = useState(
    staffData?.permanentDistrict || "",
  );
  const districts = Object.keys(geoData);
  const currentThanas =
    geoData[selectedCurrentDistrict as keyof typeof geoData] || [];
  const permanentThanas =
    geoData[selectedPermanentDistrict as keyof typeof geoData] || [];

  const fetchDocumentsUrl = async (
    e: React.ToggleEvent<HTMLDetailsElement>,
  ) => {
    const element = e.currentTarget;
    if (element.open && !nidDocsImages) {
      const res = await getStaffMediaUrls([
        staffData!.nidFrontPhotoKey,
        staffData!.nidBackPhotoKey,
      ]);
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      setNidDocsImages({
        nidFrontPhoto: res.data![0],
        nidBackPhoto: res.data![1],
      });
    }
  };

  useEffect(() => {
    if (token) {
      getTOSContent("application_declaration")
        .then((res) => setTosContent(res ?? ""))
        .catch((err) => console.error(err));
    }
  }, []);

  useEffect(() => {
    if (!isRegistering && createResponse) {
      if (createResponse.success) {
        onRegistrationComplete?.(createResponse.data?.name ?? "");
      } else {
        toast.error(createResponse.message);
      }
    }
  }, [isRegistering]);

  useEffect(() => {
    if (!isUpdating || !updateResponse) return;

    toast(updateResponse.message, {
      type: updateResponse.success ? "success" : "error",
    });

    if (updateResponse.success) {
      onRegistrationComplete?.(staffData?.name || "");
    }
  }, [isUpdating, updateResponse, onRegistrationComplete, staffData?.name]);
  return (
    <form
      action={mode === "create" ? createStaffAction : updateStaffAction}
      className="flex flex-col gap-6"
    >
      {token && <input type="hidden" name="token" value={token} />}
      <div className="flex flex-col sm:flex-row gap-4">
        <InputField
          label="নাম"
          name="name"
          defaultValue={(staffData?.name || "") as string}
          required={mode === "create"}
        />
        <InputField
          label="পিতার নাম"
          name="fatherName"
          defaultValue={(staffData?.fatherName || "") as string}
          required={mode === "create"}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <InputField
          label="মোবাইল নাম্বার"
          name="phone"
          type="tel"
          defaultValue={(staffData?.phone || "") as string}
          required={mode === "create"}
        />
        <InputField
          label="বর্তমান ঠিকানা"
          name="currentStreetAddress"
          defaultValue={(staffData?.currentStreetAddress || "") as string}
          required={mode === "create"}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 text-start">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">
              জেলা (বর্তমান){" "}
              {mode === "create" && (
                <span className="text-red-500 text-lg">*</span>
              )}
            </span>
            <select
              required
              name="currentDistrict"
              value={selectedCurrentDistrict}
              onChange={(e) => setSelectedCurrentDistrict(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm transition-all focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
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
        <div className="flex-1 text-start">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">
              থানা (বর্তমান){" "}
              {mode === "create" && (
                <span className="text-red-500 text-lg">*</span>
              )}
            </span>
            <select
              required
              name="currentPoliceStation"
              defaultValue={staffData?.currentPoliceStation || ""}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm transition-all focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
            >
              <option value="">নির্বাচন করুন</option>
              {currentThanas.map((thana) => (
                <option key={thana} value={thana}>
                  {thana.charAt(0).toUpperCase() + thana.slice(1)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <InputField
          label="পোস্ট অফিস (বর্তমান)"
          name="currentPostOffice"
          defaultValue={(staffData?.currentPostOffice || "") as string}
          required={mode === "create"}
        />
        <InputField
          label="স্থায়ী ঠিকানা"
          name="permanentStreetAddress"
          defaultValue={(staffData?.permanentStreetAddress || "") as string}
          required={mode === "create"}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 text-start">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">
              জেলা (স্থায়ী){" "}
              {mode === "create" && (
                <span className="text-red-500 text-lg">*</span>
              )}
            </span>
            <select
              required
              name="permanentDistrict"
              value={selectedPermanentDistrict}
              onChange={(e) => setSelectedPermanentDistrict(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm transition-all focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
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
        <div className="flex-1 text-start">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">
              থানা (স্থায়ী){" "}
              {mode === "create" && (
                <span className="text-red-500 text-lg">*</span>
              )}
            </span>
            <select
              required
              name="permanentPoliceStation"
              defaultValue={staffData?.permanentPoliceStation || ""}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm transition-all focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
            >
              <option value="">নির্বাচন করুন</option>
              {permanentThanas.map((thana) => (
                <option key={thana} value={thana}>
                  {thana.charAt(0).toUpperCase() + thana.slice(1)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="পোস্ট অফিস (স্থায়ী ঠিকানা)"
          name="permanentPostOffice"
          defaultValue={(staffData?.permanentPostOffice || "") as string}
          required={mode === "create"}
        />
        <div className="flex-1 text-start">
          <div className="mb-1 block text-sm">
            IPS কাজের দক্ষতা আছে?{" "}
            {mode === "create" && (
              <span className="text-red-500 text-lg">*</span>
            )}
          </div>
          <div className="flex gap-4">
            <label className="__center">
              <input
                className="mr-2 size-4"
                onChange={(e) => setHasRepairExperience(e.target.checked)}
                type="radio"
                name="hasRepairExperience"
                value="true"
                defaultChecked={hasRepairExperience}
                required={mode === "create"}
              />
              হ্যা
            </label>
            <label className="__center">
              <input
                className="mr-2 size-4"
                onChange={(e) => setHasRepairExperience(!e.target.checked)}
                type="radio"
                name="hasRepairExperience"
                value="false"
                defaultChecked={!hasRepairExperience}
                required={mode === "create"}
              />
              না
            </label>
          </div>
        </div>
        {hasRepairExperience && (
          <InputField
            label="কাজের দক্ষতা কত বছর?"
            name="repairExperienceYears"
            type="number"
            defaultValue={(staffData?.repairExperienceYears || "") as string}
            required={mode === "create"}
          />
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex-1 text-start">
          <div className="mb-1 block text-sm">
            আপনার কি হাউজ ওরারিং ও IPS এর ওরারিং কাজে দক্ষতা আছে?{" "}
            {mode === "create" && (
              <span className="text-red-500 text-lg">*</span>
            )}
          </div>
          <div className="flex gap-4">
            <label className="__center">
              <input
                className="mr-2 size-4"
                onChange={(e) => setHasInstallationExperience(e.target.checked)}
                type="radio"
                name="hasInstallationExperience"
                value="true"
                defaultChecked={hasInstallationExperience}
                required={mode === "create"}
              />
              হ্যা
            </label>
            <label className="__center">
              <input
                className="mr-2 size-4"
                onChange={(e) =>
                  setHasInstallationExperience(!e.target.checked)
                }
                type="radio"
                name="hasInstallationExperience"
                value="false"
                defaultChecked={!hasInstallationExperience}
                required={mode === "create"}
              />
              না
            </label>
          </div>
        </div>
        {hasInstallationExperience && (
          <InputField
            label="কাজের দক্ষতা কত বছর?"
            name="installationExperienceYears"
            type="number"
            defaultValue={
              (staffData?.installationExperienceYears || "") as string
            }
            required={mode === "create"}
          />
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex-1 text-start">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">
              পেমেন্ট কিভাবে নিতে ইচ্ছুক?{" "}
              <span className="text-red-500 text-lg">*</span>
            </span>
            <select
              value={paymentPreference}
              onChange={(e) =>
                setPaymentPreference(e.target.value as typeof paymentPreference)
              }
              name="paymentPreference"
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm transition-all focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
            >
              <option value="bkash">বিকাশ</option>
              <option value="nagad">নগদ</option>
              <option value="rocket">রকেট</option>
              <option value="bank">ব্যাংক</option>
            </select>
          </label>
        </div>
        {paymentPreference !== "bank" && (
          <InputField
            label={`${paymentPreference === "bkash" ? "বিকাশ" : paymentPreference === "nagad" ? "নগদ" : paymentPreference === "rocket" && "রকেট"} নাম্বার`}
            name="walletNumber"
            type="tel"
            defaultValue={(staffData?.walletNumber || "") as string}
            required={mode === "create"}
          />
        )}
      </div>
      {paymentPreference === "bank" && (
        <>
          <div className="flex flex-col sm:flex-row gap-4">
            <InputField
              label="ব্যাংক নাম"
              name="bankName"
              defaultValue={(staffData?.bankInfo?.bankName || "") as string}
              required={mode === "create"}
            />
            <InputField
              label="একাউন্ট নাম"
              name="accountHolderName"
              defaultValue={
                (staffData?.bankInfo?.accountHolderName || "") as string
              }
              required={mode === "create"}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <InputField
              label="একাউন্ট নাম্বার"
              name="accountNumber"
              type="tel"
              defaultValue={
                (staffData?.bankInfo?.accountNumber || "") as string
              }
              required={mode === "create"}
            />
            <InputField
              label="শাখা"
              name="branchName"
              defaultValue={(staffData?.bankInfo?.branchName || "") as string}
              required={mode === "create"}
            />
          </div>
        </>
      )}

      {mode === "update" ? (
        <details onToggle={fetchDocumentsUrl}>
          <summary className="cursor-pointer">
            Profile and document images
          </summary>
          {nidDocsImages ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <InputField
                src={staffData?.photoUrl}
                label="আপনার ছবি"
                name="photo"
                type="file"
                required={false}
              />
              <InputField
                src={nidDocsImages.nidFrontPhoto}
                label="জাতীয় পরিচয়পত্রের ছবি"
                placeholder="সামনের দিকের"
                name="nidFrontPhoto"
                type="file"
                required={false}
              />
              <InputField
                src={nidDocsImages.nidBackPhoto}
                label="জাতীয় পরিচয়পত্রের ছবি"
                placeholder="পেছনের দিকের"
                name="nidBackPhoto"
                type="file"
                required={false}
              />
            </div>
          ) : (
            <div className="__center text-gray-400 h-32">
              <Spinner />
            </div>
          )}
        </details>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <InputField
            label="আপনার ছবি"
            name="photo"
            type="file"
            required={mode === "create"}
          />
          <InputField
            label="জাতীয় পরিচয়পত্রের ছবি"
            placeholder="সামনের দিকের"
            name="nidFrontPhoto"
            type="file"
            required={mode === "create"}
          />
          <InputField
            label="জাতীয় পরিচয়পত্রের ছবি"
            placeholder="পেছনের দিকের"
            name="nidBackPhoto"
            type="file"
            required={mode === "create"}
          />
        </div>
      )}
      {token ? (
        <div>
          <div className="flex gap-4 select-none">
            <label className="text-start text-[#54595f] text-sm">
              <input
                value="true"
                type="checkbox"
                name="agreed"
                className="size-4 mr-2"
                required={mode === "create"}
              />
              {tosContent}
            </label>
          </div>
        </div>
      ) : (
        mode === "create" && (
          <label className="text-start select-none flex items-center text-[#54595f] text-sm">
            <input
              value="true"
              type="checkbox"
              name="sendConfirmationSMS"
              className="size-4 mr-2"
            />
            Send confirmation SMS
          </label>
        )
      )}
      {mode === "create" && (
        <button disabled={isRegistering} className="__btn">
          {isRegistering ? "Registering..." : "Register"}
        </button>
      )}
      {mode === "update" && (
        <button disabled={isUpdating} className="__btn">
          {isUpdating ? "Updating..." : "Update"}
        </button>
      )}
    </form>
  );
}
