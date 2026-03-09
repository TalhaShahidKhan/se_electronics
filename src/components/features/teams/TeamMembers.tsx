"use client";

import geoData from "@/assets/data/geo-data.json";
import { ImageWithLightbox, Modal } from "@/components/ui";
import { contactDetails, staffStats } from "@/constants";
import { renderText } from "@/utils";
import {
  BriefcaseBusiness,
  Building2,
  CheckSquare,
  CircleCheck,
  Clock,
  MapPin,
  Phone,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function TeamMembers({
  staffs,
  staffId,
}: {
  staffs: {
    photoUrl: string;
    currentDistrict: string;
    currentPoliceStation: string | null;
    id: string;
    role: "technician" | "electrician";
    name: string;
    phone: string;
    staffId: string;
    currentPostOffice: string | null;
    photoKey: string;
    repairExperienceYears: number | null;
    installationExperienceYears: number | null;
  }[];
  staffId?: string;
}) {
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedThana, setSelectedThana] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<typeof staffs | null>(
    staffId ? staffs.find((staff) => staff.staffId === staffId) : null,
  );
  const districts = Object.keys(geoData);
  const thanas = geoData[selectedDistrict as keyof typeof geoData] || [];
  const aboutUs = `
        এস ই ইলেকট্রনিকস একটি বিশ্বস্ত ইলেক্ট্রনিক্স সার্ভিসিং এবং রক্ষণাবেক্ষণে প্রতিশ্রুতিবদ্ধ প্রতিষ্ঠান। আমাদের {staff_role} {staff_name}, {experience_years} বছরের অভিজ্ঞতার সাথে আই পি এস {job_title} এর অন্যতম দক্ষ কর্মী। তার ৯৪% সাফল্যের হার এবং ৫ স্টার রেটিং গ্রাহকদের আস্থা অর্জন করেছে। {about_staff} কাস্টমার সন্তুষ্টিই আমাদের পরধান লক্ষ্য।
    `;
  const filteredStaffs = selectedDistrict
    ? staffs.filter((staff) => {
        if (selectedThana)
          return (
            staff.currentDistrict === selectedDistrict &&
            staff.currentPoliceStation === selectedThana
          );
        return staff.currentDistrict === selectedDistrict;
      })
    : staffs;

  const handleProfileSelect = (staff: any) => {
    const url = new URL(window.location.href);
    url.searchParams.set("staffId", staff.staffId);
    window.history.pushState({}, "", url);
    setSelectedProfile(staff);
  };

  return (
    <div className="my-8">
      {selectedProfile && (
        <Modal
          width="500"
          title="Team Member Profile"
          isVisible
          onClose={() => {
            const url = new URL(window.location.href);
            url.searchParams.delete("staffId");
            window.history.pushState({}, "", url);
            setSelectedProfile(null);
          }}
        >
          <div className="bg-white overflow-hidden w-full">
            <div className="space-y-3 bg-blue-50/60 border border-blue-200 rounded-2xl p-6 text-primary text-center">
              {/* <div className="bg-primary/15 border border-primary p-6  rounded-lg"> */}
              {/* <!-- Profile Image Placeholder --> */}
              <div className="size-48 rounded-full overflow-hidden __center mx-auto mb-5">
                <ImageWithLightbox src={selectedProfile?.photoUrl} />
              </div>
              <h1 className="text-2xl font-bold mb-1">
                {selectedProfile?.name}
              </h1>
              <p className="text-lg font-medium">
                {selectedProfile.role === "technician"
                  ? "টেকনিশিয়ান"
                  : "ইলেকট্রিশিয়ান"}
              </p>
            </div>

            <div className="py-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center space-x-2 border rounded-md px-2 py-0.5">
                <span className="text-accent-yellow text-xl">⭐</span>
                <span className="text-xl font-bold text-gray-800">৫.০</span>
                <span className="text-sm text-gray-500">(৩০ রেটিং)</span>
              </div>
              <div className="flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-md border border-green-500 text-sm font-semibold">
                <span className="mr-1">✅</span>
                ভেরিফাইড সদস্য
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 py-4">
              <div className="flex flex-col items-center p-4 rounded-2xl bg-green-50 border border-green-200">
                <div className="bg-green-100 rounded-xl p-2 mb-3 mx-a">
                  <CheckSquare className="size-5 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {staffStats[selectedProfile.role][selectedProfile.phone]
                    ?.completedServices ?? 0}
                </span>
                <span className="text-sm font-medium text-green-700 mb-1">
                  সফল সার্ভিস
                </span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-2xl bg-purple-50 border border-purple-200">
                <div className="bg-purple-100 rounded-xl p-2 mb-3">
                  <Clock className="size-5 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {selectedProfile.repairExperienceYears ||
                    selectedProfile.installationExperienceYears}
                </span>
                <span className="text-sm font-medium text-purple-700 mb-1">
                  বছরের দক্ষতা
                </span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="bg-amber-100 rounded-xl p-2 mb-3">
                  <XCircle className="size-5 text-amber-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {staffStats[selectedProfile.role][selectedProfile.phone]
                    ?.cancelledServices ?? 0}
                </span>
                <span className="text-sm font-medium text-amber-700 mb-1">
                  বাতিল সার্ভিস
                </span>
              </div>
            </div>

            <div className="space-y-3 bg-blue-50/60 border border-blue-200 rounded-2xl p-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b border-blue-100 pb-2 mb-3">
                সাধারণ তথ্য
              </h2>

              <div className="flex items-center text-gray-700">
                <span className="text-primary-blue w-6 mr-3">🏢</span>
                <span className="font-medium">প্রতিষ্ঠান:</span>
                <span className="ml-auto">এস ই ইলেকট্রনিকস</span>
              </div>

              <div className="flex items-center text-gray-700">
                <span className="text-primary-blue w-6 mr-3">🛠️</span>
                <span className="font-medium">ক্যাটাগরি:</span>
                <span className="ml-auto text-primary-blue font-semibold">
                  {selectedProfile.role === "technician"
                    ? "টেকনিশিয়ান"
                    : "ইলেকট্রিশিয়ান"}
                </span>
              </div>

              <div className="flex items-center text-gray-700">
                <span className="text-primary-blue w-6 mr-3">🆔</span>
                <span className="font-medium">ইউসার আইডি:</span>
                <span className="ml-auto text-sm font-semibold">
                  {selectedProfile.staffId}
                </span>
              </div>
              <div className="flex items-center text-gray-700">
                <span className="text-primary-blue w-6 mr-3">🛡️</span>
                <span className="font-medium">থানা:</span>
                <span className="ml-auto text-sm font-semibold">
                  {selectedProfile.currentPoliceStation}
                </span>
              </div>
              <div className="flex items-center text-gray-700">
                <span className="text-primary-blue w-6 mr-3">📮</span>
                <span className="font-medium">পোস্ট:</span>
                <span className="ml-auto text-sm font-semibold">
                  {selectedProfile.currentPostOffice}
                </span>
              </div>
              <div className="flex items-center text-gray-700">
                <span className="text-primary-blue w-6 mr-3">📍</span>
                <span className="font-medium">জেলা:</span>
                <span className="ml-auto text-sm font-semibold">
                  {selectedProfile.currentDistrict}
                </span>
              </div>
            </div>

            {/* About Us Section */}
            <div className="my-4 space-y-3 bg-blue-50/60 border border-blue-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="">
                  <Building2 size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  আমাদের সম্পর্কে (SE ELECTRONICS)
                </h3>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                {renderText(aboutUs, {
                  staff_role:
                    selectedProfile.role === "technician"
                      ? "টেকনিশিয়ান"
                      : "ইলেকট্রিশিয়ান",
                  staff_name: selectedProfile.name,
                  experience_years:
                    selectedProfile.repairExperienceYears ||
                    selectedProfile.installationExperienceYears,
                  job_title:
                    selectedProfile.role === "technician"
                      ? "সার্ভিসিং"
                      : "ইন্সটল হাউজ ওরারিং",
                  about_staff:
                    selectedProfile.role === "technician"
                      ? "তিনি আধুনিক প্রযুক্তি এবং পেশাদারিত্বের সাথে দ্রুত ও নির্ভরযোগ্য সমাধান প্রদান করেন।"
                      : "তিনি সকল প্রকার কাজ পেশাদারিত্ব সাথে দ্রুত নির্ভরযোগ্য আইপিএস ইনস্টলেশনের কাজ সম্পূর্ণ করেন।",
                })}
              </p>
            </div>

            {/* Contact Section */}
            <div className="space-y-3 bg-blue-50/60 border border-blue-200 rounded-2xl p-4 text-primary text-center">
              {/* <div className="mt-4 bg-primary/15 p-6 text-center text-primary rounded-lg border border-primary"> */}
              <p className=" mb-3 font-medium">
                জরুরী প্রয়োজনে কাস্টমার কেয়ারে কল করুন:
              </p>
              <div className="flex items-center justify-center gap-2 text-2xl font-bold mb-4">
                <Phone size={24} />
                {contactDetails.customerCare}
              </div>
              <button
                onClick={() =>
                  (window.location.href = `tel:${contactDetails.customerCare}`)
                }
                className="text-white w-full bg-primary font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Phone size={20} />
                সাহায্যের জন্য কল করুন
              </button>
            </div>
          </div>
        </Modal>
      )}
      <h2 className="text-2xl font-bold mb-6">আমাদের টিম মেম্বার</h2>
      <div className="flex gap-4 py-4 items-center justify-end">
        <div>
          <span>জেলাঃ</span>
          <select
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="ml-1.5 border rounded-md outline-none h-8 px-2"
          >
            <option value="">সকল</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span>থানাঃ</span>
          <select
            onChange={(e) => setSelectedThana(e.target.value)}
            className="ml-1.5 border rounded-md outline-none h-8 px-2"
          >
            <option value="">সকল</option>
            {thanas.map((thana) => (
              <option key={thana} value={thana}>
                {thana}
              </option>
            ))}
          </select>
        </div>
      </div>
      {filteredStaffs.length > 0 ? (
        <div className="overflow-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredStaffs.map((staff) => (
            <div
              key={staff.id}
              onClick={() => handleProfileSelect(staff)}
              className="bg-white border p-6 rounded-lg text-center cursor-pointer"
            >
              <div className="size-44 rounded-full overflow-hidden __center mx-auto">
                <Image src={staff.photoUrl} alt="" width={176} height={176} />
              </div>
              <div className="flex flex-col mt-5 gap-2">
                <div className="flex gap-1 self-center items-center">
                  <span className="text-lg font-semibold">{staff.name}</span>
                  <CircleCheck size={18} />
                </div>
                <div className="flex items-center gap-1 text-gray-600 self-center">
                  <MapPin size={18} />
                  <span>{staff.currentDistrict}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 self-center">
                  <BriefcaseBusiness size={18} />
                  <span>
                    {staff.role === "technician" ? "Technician" : "Electrician"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full self-center h-72 __center">No Results</div>
      )}
    </div>
  );
}
