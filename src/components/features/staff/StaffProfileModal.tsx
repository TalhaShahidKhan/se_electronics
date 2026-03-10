"use client";

import {
  getPaymentHistoryById,
  getServiceHistoryById,
  getStaffById,
  getStaffMediaUrls,
  getTOSContent,
} from "@/actions";
import { InvoicePreviewButton } from "@/components/features/invoices";
import {
  ImageWithLightbox,
  Modal,
  Spinner,
  StatusBadge,
} from "@/components/ui";
import { PaymentDataType, ServicesType, StaffsType } from "@/types";
import { formatDate, parseUserAgent } from "@/utils";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ProfileLinkButton from "./ProfileLinkButton";

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
  const [serviceData, setServiceData] = useState<Partial<ServicesType>[]>([]);
  const [isLoadingServiceHistory, setIsLoadingServiceHistory] = useState(false);
  const [paymentData, setPaymentData] = useState<Partial<PaymentDataType>[]>([]);
  const [isLoadingPaymentHistory, setIsLoadingPaymentHistory] = useState(false);
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

  const serviceHistoryToggleHandler = async (
    e: React.ToggleEvent<HTMLDetailsElement>,
  ) => {
    const element = e.currentTarget;
    if (element.open && serviceData.length === 0) {
      setIsLoadingServiceHistory(true);
      const res = await getServiceHistoryById(staffData.staffId!);
      if (res.success) {
        setServiceData([...res.data as unknown as Partial<ServicesType>[]]);
      } else {
        toast.error(res.message);
      }
      setIsLoadingServiceHistory(false);
    }
  };

  const paymentHistoryToggleHandler = async (
    e: React.ToggleEvent<HTMLDetailsElement>,
  ) => {
    const element = e.currentTarget;
    if (element.open && serviceData.length === 0) {
      setIsLoadingPaymentHistory(true);
      const res = await getPaymentHistoryById(staffData.staffId!);
      if (res.success) {
        setPaymentData([...res.data as unknown as Partial<PaymentDataType>[]]);
      } else {
        toast.error(res.message);
      }
      setIsLoadingPaymentHistory(false);
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
                        ? "হাউস ওয়ারিং এবং IPS ইন্সটলেশন দক্ষতা"
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
                        className="bg-blue-50 px-4 py-2 rounded-lg text-sm text-blue-600 font-semibold hover:bg-blue-100 transition-colors"
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
            <details onToggle={serviceHistoryToggleHandler}>
              <summary className="font-semibold select-none cursor-pointer">
                Servicing History
              </summary>
              {isLoadingServiceHistory ? (
                <div className="h-72 __center">
                  <Spinner />
                </div>
              ) : serviceData.length === 0 ? (
                <div className="__center text-gray-400 h-32">No history</div>
              ) : (
                <ul className="mt-4 overflow-auto max-h-80">
                  {serviceData.map((service, i) => (
                    <li key={service.id} className="relative flex gap-3.5">
                      <span className="text-sm">
                        {service.createdAt ? formatDate(service.createdAt) : "N/A"}
                      </span>
                      <div className="flex gap-3.5">
                        <div className="w-3.5 flex flex-col h-full pt-1">
                          <div
                            className={clsx(
                              "size-3.5 rounded-full  __center text-white relative bg-blue-500",
                            )}
                          ></div>
                          {i != serviceData!.length - 1 && (
                            <div
                              className={"bg-gray-300 w-0.5 m-auto flex-1"}
                            ></div>
                          )}
                        </div>
                        <div className="flex flex-col text-start gap-2 pb-8">
                          <div className={clsx("font-bold space-x-2")}>
                            <span>
                              {service.productType?.toUpperCase()}-
                              {service.productModel}
                            </span>
                            <StatusBadge
                              status={
                                (service.statusHistory?.[0]?.statusType === "system"
                                  ? service.statusHistory[0].status
                                  : "custom") || "custom"
                              }
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm">
                              Service Id:{" "}
                              <span className="font-semibold text-sm">
                                {service.serviceId}
                              </span>
                            </span>
                            {service.customerName && (
                              <span className="text-sm">
                                Customer:{" "}
                                {service.customerId ? (
                                  <ProfileLinkButton
                                    text={service.customerName}
                                    customerId={service.customerId}
                                  />
                                ) : (
                                  <span className="font-semibold text-sm hover:unserline">
                                    {service.customerName}
                                  </span>
                                )}
                              </span>
                            )}
                            <span className="text-sm">
                              Address:{" "}
                              <span className="font-semibold text-sm">
                                {service.customerAddress},{" "}
                                {service.customerAddressDistrict}
                              </span>
                            </span>
                            <span className="text-sm">
                              Service Type:{" "}
                              <span className="font-semibold text-sm">
                                {service.type === "install"
                                  ? "Installation"
                                  : "Repair"}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </details>
            <details onToggle={paymentHistoryToggleHandler}>
              <summary className="font-semibold select-none cursor-pointer">
                Payment History
              </summary>
              {isLoadingPaymentHistory ? (
                <div className="__center text-gray-400 h-32">
                  <Spinner />
                </div>
              ) : paymentData.length === 0 ? (
                <div className="__center text-gray-400 h-32">No history</div>
              ) : (
                <ul className="mt-4 overflow-auto max-h-80">
                  {paymentData.map((payment, i) => (
                    <li key={payment.id} className="relative flex gap-3.5">
                      <span className="min-w-24 text-sm text-end">
                        {payment.date ? formatDate(payment.date) : "N/A"}
                      </span>
                      <div className="flex gap-3.5">
                        <div className="w-3.5 mt-1 flex flex-col h-full">
                          <div
                            className={
                              "size-3.5 rounded-full  __center text-white relative bg-blue-500"
                            }
                          ></div>
                          {i != paymentData!.length - 1 && (
                            <div
                              className={"bg-gray-300 w-0.5 m-auto flex-1"}
                            ></div>
                          )}
                        </div>
                        <div className="flex flex-col text-start gap-2 pb-8">
                          <div className="space-x-2">
                            <span className="font-bold">
                              {payment.amount?.toLocaleString()} TK
                            </span>
                            <span className="text-green-500 bg-green-500 bg-opacity-10 px-2 text-sm rounded-md border border-green-500">
                              Paid
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm">
                              Payment Id:{" "}
                              <span className="font-semibold text-sm">
                                {payment.paymentId}
                              </span>
                            </span>
                            <span className="text-sm">
                              Sender:{" "}
                              <span className="text-gray-500  text-sm">
                                Admin
                              </span>
                            </span>
                            <span className="text-sm">
                              Payment Method:{" "}
                              <span className="font-semibold text-sm">
                                {payment.paymentMethod?.toUpperCase()}
                              </span>
                            </span>
                            {payment.transactionId && (
                              <span className="text-sm">
                                Transaction Id:{" "}
                                <span className="font-semibold text-sm">
                                  {payment.transactionId}
                                </span>
                              </span>
                            )}
                            <span className="text-sm">
                              Payment Receipt:
                              <InvoicePreviewButton
                                paymentData={payment as PaymentDataType}
                                className="text-blue-500 hover:underline cursor-pointer"
                              >
                                <span>#{payment.invoiceNumber}</span>
                              </InvoicePreviewButton>
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </details>
          </div>
        </>
      )}
    </Modal>
  );
}
