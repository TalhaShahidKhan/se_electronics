"use client";

import {
  getStaffById,
  getStaffMediaUrls,
  getTOSContent,
} from "@/actions";
import {
  ImageWithLightbox,
  Modal,
  Spinner,
} from "@/components/ui";
import { StaffsType } from "@/types";
import { formatDate, parseUserAgent } from "@/utils";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import StaffActionButtons from "./StaffActionButtons";
import Link from "next/link";
import { Wrench, CreditCard as CreditCardIcon } from "lucide-react";

export default function StaffProfileModal({
  staffId,
  staffDataPayload,
  onClose,
}: {
  staffId?: string;
  staffDataPayload?: StaffsType;
  onClose: () => void;
}) {
  const [staffData, setStaffData] = useState<Partial<StaffsType>>({ ...staffDataPayload });
  const [nidDocsImages, setNidDocsImages] = useState<{
    nidFrontPhoto: string;
    nidBackPhoto: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(staffId ? true : false);
  const [tosContent, setTosContent] = useState("");

  let userAgentInfo;
  if (staffData.userAgent) {
    userAgentInfo = parseUserAgent(staffData.userAgent);
  }
  const paymentPreferences = {
    bkash: "বিকাশ",
    nagad: "নগদ",
    rocket: "রকেট",
    bank: "ব্যাংক",
  };

  const nidToggleHandler = async (e: React.ToggleEvent<HTMLDetailsElement>) => {
    const element = e.currentTarget;
    if (element.open && !nidDocsImages) {
      const res = await getStaffMediaUrls([
        staffData.nidFrontPhotoKey!,
        staffData.nidBackPhotoKey!,
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
    if (staffId) {
      (async () => {
        setIsLoading(true);
        const res = await getStaffById(staffId);
        if (res.success) {
          setStaffData({ ...res.data as StaffsType });
          setIsLoading(false);
        } else {
          toast.error(res.message);
          onClose();
        }
      })();
    }

    getTOSContent("application_declaration")
      .then((res) => setTosContent(res || ""))
      .catch((err) => console.error(err));
  }, []);
  return (
    <Modal onClose={onClose} isVisible={true} title="Profile">
      {isLoading ? (
        <div className="__center h-32">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="size-48 rounded-full overflow-hidden __center mx-auto">
            <ImageWithLightbox src={staffData.photoUrl} />
          </div>
          <div className="flex flex-col gap-6 mt-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div>
                <div className="font-semibold mb-2 p-1 bg-blue-100">
                  Personal Info
                </div>
                <div>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">ID</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">{staffData.staffId}</span>
                  </div>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">নাম</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">{staffData.name}</span>
                  </div>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">পিতার নাম</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {staffData.fatherName}
                    </span>
                  </div>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">মোবাইল নাম্বার</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">{staffData.phone}</span>
                  </div>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">
                      {staffData.hasInstallationExperience
                        ? "হাউস ওয়ারিং এবং IPS ইন্সটলেশন দক্ষতা"
                        : "IPS সার্ভিসিং দক্ষতা"}
                    </span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {staffData.hasInstallationExperience ||
                      staffData.hasRepairExperience
                        ? staffData.hasInstallationExperience
                          ? staffData.installationExperienceYears + " Years"
                          : staffData.repairExperienceYears + " Years"
                        : "No Experience"}
                    </span>
                  </div>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">Joined as</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {staffData.hasInstallationExperience
                        ? "Electrician"
                        : "Technician"}
                    </span>
                  </div>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">Join Date</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {staffData.createdAt ? formatDate(staffData.createdAt) : "N/A"}
                    </span>
                  </div>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">IP Address</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    {staffData.ipAddress ? (
                      <span className="font-semibold">
                        {staffData.ipAddress}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm italic">N/A</span>
                    )}
                  </div>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">Device Type</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    {userAgentInfo ? (
                      <span className="font-semibold">
                        {userAgentInfo.device} ({userAgentInfo.os})
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm italic">N/A</span>
                    )}
                  </div>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">Browser Type</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    {userAgentInfo ? (
                      <span className="font-semibold">
                        {userAgentInfo.browser}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm italic">N/A</span>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <div className="font-semibold mb-2 p-1 bg-blue-100">
                  Payment preferences
                </div>
                <div>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">মাধ্যম</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {paymentPreferences[staffData.paymentPreference as keyof typeof paymentPreferences]}
                    </span>
                  </div>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">
                      {staffData.paymentPreference !== "bank"
                        ? `${paymentPreferences[staffData.paymentPreference as keyof typeof paymentPreferences]} নাম্বার`
                        : "ব্যাংক নাম"}
                    </span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {staffData.paymentPreference === "bank"
                        ? staffData.bankInfo?.bankName
                        : staffData.walletNumber}
                    </span>
                  </div>
                  {staffData.paymentPreference === "bank" && (
                    <>
                      <div className="flex border-b py-1">
                        <span className="w-32 flex-shrink-0">একাউন্ট নাম</span>
                        <span className="mr-4 flex-shrink-0">:</span>
                        <span className="font-semibold">
                          {staffData.bankInfo?.accountHolderName}
                        </span>
                      </div>
                      <div className="flex border-b py-1">
                        <span className="w-32 flex-shrink-0">শাখা</span>
                        <span className="mr-4 flex-shrink-0">:</span>
                        <span className="font-semibold">
                          {staffData.bankInfo?.branchName}
                        </span>
                      </div>
                      <div className="flex border-b py-1">
                        <span className="w-32 flex-shrink-0">
                          একাউন্ট নাম্বার
                        </span>
                        <span className="mr-4 flex-shrink-0">:</span>
                        <span className="font-semibold">
                          {staffData.bankInfo?.accountNumber}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div>
                <div className="font-semibold mb-2 p-1 bg-blue-100">
                  Current Address
                </div>
                <div>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">ঠিকানা</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {staffData.currentStreetAddress}
                    </span>
                  </div>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">থানা</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {staffData.currentPoliceStation}
                    </span>
                  </div>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">জেলা</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {staffData.currentDistrict}
                    </span>
                  </div>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">পোস্ট অফিস</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {staffData.currentPostOffice}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <div className="font-semibold mb-2 p-1 bg-blue-100">
                  Permanent Address
                </div>
                <div>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">ঠিকানা</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {staffData.permanentStreetAddress}
                    </span>
                  </div>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">থানা</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {staffData.permanentPoliceStation}
                    </span>
                  </div>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">জেলা</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {staffData.permanentDistrict}
                    </span>
                  </div>
                  <div className="flex border-b py-1">
                    <span className="w-32 flex-shrink-0">পোস্ট অফিস</span>
                    <span className="mr-4 flex-shrink-0">:</span>
                    <span className="font-semibold">
                      {staffData.permanentPostOffice}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="font-semibold mb-2 p-1 bg-brand/10 text-brand rounded-md px-3">
                Quick Actions
              </div>
              <div className="p-4 bg-gray-50 rounded-md border border-gray-100 space-y-4">
                <StaffActionButtons staffData={staffData as StaffsType} variant="details" />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                  <Link 
                    href={`/staffs/service-history/${staffData.staffId}`}
                    className="flex items-center justify-center gap-2 p-4 bg-white hover:bg-gray-100 text-gray-700 rounded-md transition-colors border border-gray-200 font-black uppercase text-[10px] tracking-widest shadow-sm"
                  >
                    <Wrench size={18} className="text-brand" />
                    View Service History
                  </Link>
                  <Link 
                    href={`/staffs/payment-history/${staffData.staffId}`}
                    className="flex items-center justify-center gap-2 p-4 bg-white hover:bg-gray-100 text-gray-700 rounded-md transition-colors border border-gray-200 font-black uppercase text-[10px] tracking-widest shadow-sm"
                  >
                    <CreditCardIcon size={18} className="text-brand" />
                    View Payment History
                  </Link>
                </div>
              </div>
            </div>
            <div>
              <div className="text-md font-semibold mb-2">
                <span>Agreement</span>
              </div>
              {tosContent ? (
                <p className="text-sm">{tosContent}</p>
              ) : (
                <Spinner />
              )}
            </div>
            <details onToggle={nidToggleHandler} className="select-none">
              <summary className="text-md font-semibold cursor-pointer">
                <span>NID Documents</span>
              </summary>
              {nidDocsImages ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <div>
                    <ImageWithLightbox src={nidDocsImages?.nidFrontPhoto} />
                  </div>
                  <div>
                    <ImageWithLightbox src={nidDocsImages?.nidBackPhoto} />
                  </div>
                </div>
              ) : (
                <div className="h-72 __center">
                  <Spinner />
                </div>
              )}
            </details>
            <details className="select-none">
              <summary className="text-md font-semibold cursor-pointer">
                <span>Other Documents</span>
              </summary>
              <div className="mt-2 flex flex-wrap gap-2">
                {(() => {
                  try {
                    const docs = JSON.parse(staffData.docs || "[]");
                    if (docs.length === 0)
                      return <span className="text-gray-400 italic">None</span>;
                    return docs.map((doc: string, idx: number) => (
                      <a
                        key={idx}
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-50 px-4 py-2 rounded-md text-sm text-blue-600 font-semibold hover:bg-blue-100 transition-colors"
                      >
                        Document {idx + 1}
                      </a>
                    ));
                  } catch {
                    return <span className="text-gray-400 italic">None</span>;
                  }
                })()}
              </div>
            </details>
          </div>
        </>
      )}
    </Modal>
  );
}
